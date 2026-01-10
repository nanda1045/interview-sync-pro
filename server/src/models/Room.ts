import mongoose, { Schema, Document } from 'mongoose';

export interface IRoom extends Document {
  roomId: string;
  problemSlug?: string;
  participants: Array<{
    socketId: string;
    joinedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    problemSlug: {
      type: String,
      required: false,
    },
    participants: [
      {
        socketId: { type: String, required: true },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create index for efficient queries
RoomSchema.index({ roomId: 1 });
// Note: TTL index removed - rooms will be cleaned up when empty instead

export const Room = mongoose.model<IRoom>('Room', RoomSchema);

