// Load environment variables first
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupYjsServer } from './yjs-server';
import { connectDB } from './db/connection';
import problemRoutes from './routes/problems';
import roomRoutes from './routes/rooms';
import { RoomService } from './services/roomService';

const app = express();
const httpServer = createServer(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

// Connect to MongoDB
connectDB();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/problems', problemRoutes);
app.use('/api/rooms', roomRoutes);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  // Store room IDs for this socket connection
  const socketRooms = new Set<string>();

  socket.on('join-room', async (data: string | { roomId: string; problemSlug?: string }) => {
    let roomId: string;
    let problemSlug: string | undefined;

    // Handle both string (backward compatibility) and object formats
    if (typeof data === 'string') {
      roomId = data;
    } else {
      roomId = data.roomId;
      problemSlug = data.problemSlug;
    }

    socket.join(roomId);
    socketRooms.add(roomId);
    
    try {
      // Persist room and participant
      const room = await RoomService.addParticipant(roomId, socket.id);
      
      if (problemSlug && room) {
        await RoomService.updateProblemSlug(roomId, problemSlug);
      }

      // Get all participants in the room
      const participants = await RoomService.getParticipants(roomId);
      
      console.log(`Client ${socket.id} joined room: ${roomId} (${participants.length} participants)`);
      
      // Notify others in the room
      socket.to(roomId).emit('user-joined', socket.id);
      
      // Send confirmation to the client with participant list
      socket.emit('room-joined', {
        roomId,
        participants,
      });
      
      // Broadcast updated participant list to all in room
      io.to(roomId).emit('participants-updated', participants);
    } catch (error) {
      console.error(`Error joining room ${roomId}:`, error);
    }
  });

  socket.on('leave-room', async (roomId: string) => {
    socket.leave(roomId);
    socketRooms.delete(roomId);
    
    try {
      await RoomService.removeParticipant(roomId, socket.id);
      const participants = await RoomService.getParticipants(roomId);
      
      console.log(`Client ${socket.id} left room: ${roomId}`);
      socket.to(roomId).emit('user-left', socket.id);
      
      // Broadcast updated participant list
      io.to(roomId).emit('participants-updated', participants);
    } catch (error) {
      console.error(`Error leaving room ${roomId}:`, error);
    }
  });

  socket.on('disconnect', async () => {
    console.log(`Client disconnected: ${socket.id}`);
    
    // Remove from all rooms
    try {
      for (const roomId of socketRooms) {
        await RoomService.removeParticipant(roomId, socket.id);
        const participants = await RoomService.getParticipants(roomId);
        
        socket.to(roomId).emit('user-left', socket.id);
        io.to(roomId).emit('participants-updated', participants);
      }
    } catch (error) {
      console.error(`Error handling disconnect for ${socket.id}:`, error);
    }
    
    socketRooms.clear();
  });
});

// Setup Yjs WebSocket server
setupYjsServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io server ready`);
  console.log(`🔄 Yjs WebSocket server ready`);
});

