import * as fs from 'fs';
import * as path from 'path';

const PERSISTENCE_DIR = path.join(__dirname, '../data/persistence');

// Ensure persistence directory exists
if (!fs.existsSync(PERSISTENCE_DIR)) {
  fs.mkdirSync(PERSISTENCE_DIR, { recursive: true });
}

export async function getPersistence(roomId: string): Promise<Buffer | null> {
  const filePath = path.join(PERSISTENCE_DIR, `${roomId}.ydoc`);
  
  try {
    if (fs.existsSync(filePath)) {
      return fs.readFileSync(filePath);
    }
  } catch (error) {
    console.error(`Error reading persistence for room ${roomId}:`, error);
  }
  
  return null;
}

export async function setPersistence(roomId: string, update: Uint8Array): Promise<void> {
  const filePath = path.join(PERSISTENCE_DIR, `${roomId}.ydoc`);
  
  try {
    fs.writeFileSync(filePath, Buffer.from(update));
  } catch (error) {
    console.error(`Error writing persistence for room ${roomId}:`, error);
  }
}

