import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { setupYjsServer } from './yjs-server';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

const PORT = process.env.PORT || 3001;

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('join-room', (roomId: string) => {
    socket.join(roomId);
    console.log(`Client ${socket.id} joined room: ${roomId}`);
    
    // Notify others in the room
    socket.to(roomId).emit('user-joined', socket.id);
    
    // Send confirmation to the client
    socket.emit('room-joined', roomId);
  });

  socket.on('leave-room', (roomId: string) => {
    socket.leave(roomId);
    console.log(`Client ${socket.id} left room: ${roomId}`);
    socket.to(roomId).emit('user-left', socket.id);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Setup Yjs WebSocket server
setupYjsServer(httpServer);

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Socket.io server ready`);
  console.log(`🔄 Yjs WebSocket server ready`);
});

