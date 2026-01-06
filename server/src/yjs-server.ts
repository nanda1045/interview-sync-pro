import { Server as HTTPServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import * as Y from 'yjs';
import { setPersistence, getPersistence } from './persistence';

const docs = new Map<string, Y.Doc>();
const wsRooms = new Map<WebSocket, string>();

export function setupYjsServer(httpServer: HTTPServer) {
  const wss = new WebSocketServer({
    server: httpServer,
    path: '/yjs',
  });

  wss.on('connection', (ws: WebSocket, req) => {
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const roomId = url.searchParams.get('room') || 'default';

    // Store room ID for this WebSocket connection
    wsRooms.set(ws, roomId);

    console.log(`Yjs client connected to room: ${roomId}`);

    // Get or create Y.Doc for this room
    let doc = docs.get(roomId);
    if (!doc) {
      doc = new Y.Doc();
      docs.set(roomId, doc);
      
      // Load persisted state if available
      getPersistence(roomId).then((persistedState) => {
        if (persistedState && doc) {
          Y.applyUpdate(doc, persistedState);
        }
      });
    }

    // Ensure doc exists
    if (!doc) {
      console.error(`Failed to create/get doc for room: ${roomId}`);
      ws.close();
      return;
    }

    // Send current state to client when connected
    const sendState = () => {
      if (ws.readyState === WebSocket.OPEN && doc) {
        const state = Y.encodeStateAsUpdate(doc);
        ws.send(state);
      }
    };

    // Wait for connection to be ready
    ws.on('open', () => {
      sendState();
    });

    // Handle incoming messages
    ws.on('message', (message: Buffer) => {
      try {
        const clientRoomId = wsRooms.get(ws);
        if (!clientRoomId) return;

        const roomDoc = docs.get(clientRoomId);
        if (!roomDoc) return;

        // Check if it's a state vector request (first 4 bytes are 0)
        const messageArray = new Uint8Array(message);
        const isStateVector = messageArray.length === 0 || 
          (messageArray.length <= 4 && messageArray.every(b => b === 0));

        if (isStateVector) {
          // Client is requesting state, send full update
          const state = Y.encodeStateAsUpdate(roomDoc);
          ws.send(state);
        } else {
          // Apply update to document
          Y.applyUpdate(roomDoc, message);
          
          // Persist the update
          const update = Y.encodeStateAsUpdate(roomDoc);
          setPersistence(clientRoomId, update);

          // Broadcast to other clients in the same room
          wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
              const otherRoomId = wsRooms.get(client);
              if (otherRoomId === clientRoomId) {
                client.send(message);
              }
            }
          });
        }
      } catch (error) {
        console.error('Error processing Yjs update:', error);
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      const disconnectedRoomId = wsRooms.get(ws);
      wsRooms.delete(ws);
      console.log(`Yjs client disconnected from room: ${disconnectedRoomId}`);
    });
  });

  console.log('Yjs WebSocket server initialized');
}

