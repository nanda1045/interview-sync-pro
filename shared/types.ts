// Shared types between client and server

export interface Problem {
  _id?: string;
  id?: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  testCases?: Example[];
  examples?: Example[]; // Alias for testCases for backward compatibility
  constraints: string[];
  starterCode: {
    [language: string]: string;
  };
  companies?: string[];
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

