# InterviewSync Pro

A LeetCode-style collaborative mock interview platform that enables real-time code collaboration between interviewers and candidates.

## 🎯 Overview

InterviewSync Pro is a full-stack monorepo application that provides a seamless collaborative coding experience. Built with modern web technologies, it features real-time synchronization using CRDT (Conflict-free Replicated Data Types) for conflict-free collaborative editing.

## 🏗️ Architecture

The project follows a monorepo structure with separate client and server applications:

```
InterviewSync/
├── client/          # Next.js 14+ frontend application
├── server/          # Node.js/Express backend with Socket.io
├── shared/          # Shared TypeScript types
└── data/            # Problem data and persistence
```

## 🛠️ Technology Stack

### Frontend (`/client`)
- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Monaco Editor** - VS Code's editor component
- **Lucide React** - Modern icon library
- **Yjs** - CRDT-based real-time synchronization
- **Socket.io Client** - Real-time communication

### Backend (`/server`)
- **Node.js** - JavaScript runtime
- **TypeScript** - Type-safe server code
- **Express** - Web framework
- **MongoDB & Mongoose** - Database and ODM for problem storage
- **Socket.io** - WebSocket server for real-time events
- **Yjs** - CRDT synchronization engine
- **WebSocket (ws)** - Native WebSocket server for Yjs

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local installation or MongoDB Atlas connection string)
- Git

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory:
   ```bash
   cd InterviewSync
   ```

2. **Install client dependencies**:
   ```bash
   cd client
   npm install
   ```

3. **Install server dependencies**:
   ```bash
   cd ../server
   npm install
   ```

4. **Set up MongoDB**:
   - Install MongoDB locally, or
   - Use MongoDB Atlas and get a connection string
   - Update `server/.env` with your MongoDB URI:
     ```
     MONGODB_URI=mongodb://localhost:27017/interviewsync
     ```
     Or for MongoDB Atlas:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/interviewsync
     ```

5. **Seed the database** (optional but recommended):
   ```bash
   cd server
   npm run seed
   ```
   This will populate the database with 10 high-frequency LeetCode problems.

### Running the Application

#### Development Mode

1. **Start the server** (from `/server` directory):
   ```bash
   npm run dev
   ```
   The server will start on `http://localhost:3001`

2. **Start the client** (from `/client` directory in a new terminal):
   ```bash
   npm run dev
   ```
   The client will start on `http://localhost:3000`

3. **Open your browser** and navigate to `http://localhost:3000`

#### Production Mode

1. **Build the server**:
   ```bash
   cd server
   npm run build
   npm start
   ```

2. **Build the client**:
   ```bash
   cd client
   npm run build
   npm start
   ```

## 📖 Usage

### Creating/Joining a Room

1. On the **Lobby** page (`/`), you can:
   - **Browse Problems**: View all available coding problems from the database
   - **Filter by Company**: Use the sidebar filter to find problems tagged with specific companies (Amazon, Google, Microsoft, etc.)
   - **Select a Problem**: Click on any problem to start a new room with that problem loaded
   - **Join an existing room**: Enter a room ID and click "Join Room"
   - **Create a new room**: Click "Create New Room" to generate a random room ID

2. Once in a room (`/room/[id]`), you'll see:
   - **Left Pane**: Problem description with examples and constraints (loaded from database)
   - **Right Pane**: Monaco Editor with starter code pre-loaded for collaborative coding

### Real-time Collaboration

- Code changes are automatically synchronized across all participants in the same room
- Multiple users can edit simultaneously without conflicts (thanks to CRDT)
- Socket.io handles room management and user presence

## 🔧 Configuration

### Environment Variables

#### Client (`.env.local` in `/client`)
```env
NEXT_PUBLIC_SERVER_URL=http://localhost:3001
NEXT_PUBLIC_YJS_URL=ws://localhost:3001
```

#### Server (`.env` in `/server`)
```env
PORT=3001
CLIENT_URL=http://localhost:3000
```

## 📁 Project Structure

### Client Structure
```
client/
├── app/
│   ├── api/              # API routes
│   ├── room/[id]/       # Dynamic room page
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Lobby page
├── public/              # Static assets
└── package.json
```

### Server Structure
```
server/
├── src/
│   ├── index.ts         # Express & Socket.io server
│   ├── yjs-server.ts    # Yjs WebSocket server
│   └── persistence.ts   # Document persistence
├── data/
│   └── persistence/     # Persisted Yjs documents
└── package.json
```

### Data Structure
```
data/
└── problems/
    └── two-sum.json     # Sample problem data
```

## 🎨 Features

- ✅ **Real-time Code Synchronization** - CRDT-based conflict-free editing
- ✅ **Room-based Collaboration** - Multiple isolated coding sessions
- ✅ **LeetCode-style Problems** - Structured problem descriptions from MongoDB
- ✅ **Company Tagging** - Filter problems by company (Amazon, Google, Microsoft, etc.)
- ✅ **Problem Database** - MongoDB-powered problem storage with 10+ pre-seeded problems
- ✅ **Monaco Editor** - Full-featured code editor with syntax highlighting
- ✅ **Responsive Design** - Modern, clean UI with dark mode support
- ✅ **Type Safety** - Full TypeScript coverage
- ✅ **RESTful API** - Backend API for problem management and filtering

## 🔮 Future Enhancements

- [ ] Code execution and testing
- [ ] Multiple language support
- [ ] Video/audio chat integration
- [ ] Code history and replay
- [ ] Problem library expansion
- [ ] User authentication
- [ ] Session recording
- [ ] Performance metrics

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- [Yjs](https://github.com/yjs/yjs) - CRDT implementation
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Code editor
- [Next.js](https://nextjs.org/) - React framework
- [Socket.io](https://socket.io/) - Real-time communication

---

Built with ❤️ for collaborative coding interviews

