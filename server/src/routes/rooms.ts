import express, { Request, Response } from 'express';
import { RoomService } from '../services/roomService';

const router = express.Router();

// GET /api/rooms/:roomId - Get room information
router.get('/:roomId', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    
    const room = await RoomService.getRoom(roomId);
    
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const participants = room.participants.map((p) => p.socketId);

    res.json({
      roomId: room.roomId,
      problemSlug: room.problemSlug,
      participants,
      participantCount: participants.length,
      createdAt: room.createdAt,
      updatedAt: room.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching room:', error);
    res.status(500).json({ error: 'Failed to fetch room' });
  }
});

export default router;

