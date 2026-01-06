// Shared types between client and server

export interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: Example[];
  constraints: string[];
  starterCode: {
    [language: string]: string;
  };
  hints?: string[];
  solution?: string;
}

export interface Example {
  input: string;
  output: string;
  explanation?: string;
}

export interface RoomState {
  roomId: string;
  problemId?: string;
  participants: string[];
}

