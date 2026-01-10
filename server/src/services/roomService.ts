import { Room } from '../models/Room';

export class RoomService {
  /**
   * Get or create a room
   */
  static async getOrCreateRoom(roomId: string, problemSlug?: string) {
    let room = await Room.findOne({ roomId });
    
    if (!room) {
      room = await Room.create({
        roomId,
        ...(problemSlug && { problemSlug }),
        participants: [],
      });
    } else if (problemSlug && !room.problemSlug) {
      // Update problem slug if not set
      room.problemSlug = problemSlug;
      await room.save();
    }
    
    return room;
  }

  /**
   * Add participant to room
   */
  static async addParticipant(roomId: string, socketId: string) {
    const room = await Room.findOne({ roomId });
    
    if (!room) {
      return null;
    }

    // Check if participant already exists
    const existingParticipant = room.participants.find(
      (p) => p.socketId === socketId
    );

    if (!existingParticipant) {
      room.participants.push({
        socketId,
        joinedAt: new Date(),
      });
      await room.save();
    }

    return room;
  }

  /**
   * Remove participant from room
   */
  static async removeParticipant(roomId: string, socketId: string) {
    const room = await Room.findOne({ roomId });
    
    if (!room) {
      return null;
    }

    room.participants = room.participants.filter(
      (p) => p.socketId !== socketId
    );
    
    await room.save();
    
    // Delete room if no participants left
    if (room.participants.length === 0) {
      await Room.deleteOne({ roomId });
      return null;
    }

    return room;
  }

  /**
   * Get room with participants
   */
  static async getRoom(roomId: string) {
    return await Room.findOne({ roomId });
  }

  /**
   * Get all participants in a room
   */
  static async getParticipants(roomId: string): Promise<string[]> {
    const room = await Room.findOne({ roomId });
    return room ? room.participants.map((p) => p.socketId) : [];
  }

  /**
   * Update room's problem slug
   */
  static async updateProblemSlug(roomId: string, problemSlug: string) {
    const room = await Room.findOne({ roomId });
    
    if (!room) {
      return null;
    }

    room.problemSlug = problemSlug;
    await room.save();
    
    return room;
  }
}

