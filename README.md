# InterviewSync Pro

A professional LeetCode-style collaborative mock interview platform that enables real-time code collaboration, video/audio communication, and comprehensive interview management between interviewers and candidates.

## 🎯 Overview

InterviewSync Pro is a full-stack monorepo application that provides a seamless collaborative coding experience. Built with modern web technologies, it features:

- **Real-time Code Synchronization** using CRDT (Conflict-free Replicated Data Types) for conflict-free collaborative editing
- **WebRTC Video/Audio** for P2P communication between participants
- **Interviewer Dashboard** with exclusive access to solutions and hints
- **Synchronized Interview Timer** across all participants
- **Professional UI** with dark/light theme support
- **Code Execution** via Judge0 API integration

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Next.js)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐   │
│  │   Lobby      │  │  Room Page   │  │   VideoChat        │   │
│  │              │  │              │  │   (WebRTC)         │   │
│  └──────────────┘  └──────────────┘  └────────────────────┘   │
│         │                  │                     │              │
│         │                  │                     │              │
│         └──────────────────┼─────────────────────┘              │
│                            │                                    │
│         ┌──────────────────┴──────────────────┐                │
│         │     Socket.io Client                 │                │
│         │  (Room Management, Timer, Signaling) │                │
│         └──────────────────┬──────────────────┘                │
│                            │                                    │
│         ┌──────────────────┴──────────────────┐                │
│         │     Yjs Provider                     │                │
│         │  (CRDT Sync via WebSocket)           │                │
│         └──────────────────┬──────────────────┘                │
└────────────────────────────┼────────────────────────────────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
    ┌───────────▼──────────┐   ┌─────────▼──────────┐
    │   Express Server     │   │   Yjs WebSocket    │
    │   (Socket.io)        │   │   Server           │
    │                      │   │                    │
    │  - Room Management   │   │  - CRDT Sync       │
    │  - Timer Sync        │   │  - Document Persist│
    │  - WebRTC Signaling  │   └────────────────────┘
    │  - Code Execution    │
    └───────────┬──────────┘
                │
    ┌───────────▼──────────┐
    │     MongoDB          │
    │  - Problems DB       │
    │  - Room State        │
    └──────────────────────┘
```

## 🛠️ Technology Stack

### Frontend (`/client`)
- **Next.js 16+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first CSS framework with dark mode
- **Monaco Editor** - VS Code's editor component with collaborative editing
- **Lucide React** - Modern icon library
- **Yjs** - CRDT-based real-time synchronization
- **Socket.io Client** - Real-time communication for rooms and signaling
- **Simple-Peer** - WebRTC P2P video/audio connections

### Backend (`/server`)
- **Node.js** - JavaScript runtime
- **TypeScript** - Type-safe server code
- **Express** - Web framework
- **MongoDB & Mongoose** - Database and ODM for problem storage
- **Socket.io** - WebSocket server for real-time events, timer sync, and WebRTC signaling
- **Yjs** - CRDT synchronization engine
- **WebSocket (ws)** - Native WebSocket server for Yjs
- **Judge0 API** - Code execution and testing service

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** and npm
- **MongoDB** (local installation or MongoDB Atlas connection string)
- **Git**
- **RapidAPI Account** (for Judge0 API access)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
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

4. **Set up environment variables**:

   **Client (`.env.local` in `/client` directory)**:
   ```env
   NEXT_PUBLIC_SERVER_URL=http://localhost:3001
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
   NEXT_PUBLIC_YJS_URL=ws://localhost:3001
   ```

   **Server (`.env` in `/server` directory)**:
   ```env
   # Server Configuration
   PORT=3001
   CLIENT_URL=http://localhost:3000

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/interviewsync
   # Or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/interviewsync

   # Judge0 API Configuration (via RapidAPI)
   JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
   JUDGE0_RAPIDAPI_KEY=your-rapidapi-key-here
   JUDGE0_RAPIDAPI_HOST=judge0-ce.p.rapidapi.com
   ```

5. **Set up Judge0 API**:
   - Sign up for a free RapidAPI account at [https://rapidapi.com](https://rapidapi.com)
   - Subscribe to the [Judge0 API](https://rapidapi.com/judge0-official/api/judge0-ce) (free tier available)
   - Copy your RapidAPI key and update `server/.env`

6. **Seed the database** (optional but recommended):
   ```bash
   cd server
   npm run seed
   ```
   This will populate the database with high-frequency LeetCode problems.

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

1. **Build and start the server**:
   ```bash
   cd server
   npm run build
   npm start
   ```

2. **Build and start the client**:
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
   - **Left Pane**: Problem description with tabs for Problem, Hints (interviewer only), and Solution (interviewer only)
   - **Right Pane**: Monaco Editor with starter code pre-loaded for collaborative coding
   - **Header**: Room info, timer, interviewer toggle, participant count, and theme toggle
   - **Video Chat**: Floating window with video feeds and audio/video controls

### Features

#### Real-time Collaboration
- Code changes are automatically synchronized across all participants in the same room
- Multiple users can edit simultaneously without conflicts (thanks to CRDT)
- Socket.io handles room management and user presence

#### WebRTC Video/Audio
- **P2P Communication**: Direct peer-to-peer video and audio connections
- **Floating Video Window**: Draggable video chat interface
- **Controls**: Mute/unmute microphone and enable/disable camera
- **Multi-participant Support**: See all participants in the room

#### Interviewer Dashboard
- **Role Toggle**: Switch between Interviewer and Candidate modes
- **Solution Tab**: View the official solution (interviewer only)
- **Hints Tab**: Access problem hints to guide candidates (interviewer only)
- **Candidate View**: Candidates see only the problem description

#### Interview Timer
- **Synchronized Countdown**: All participants see the same timer
- **Color-coded**: Green (15+ min), Yellow (5-15 min), Red (<5 min)
- **Visual Indicator**: Shows "Time's Up!" when timer reaches zero

#### UI/UX
- **Dark/Light Mode**: Toggle theme with persistent preferences
- **Responsive Design**: Works on desktop and tablet devices
- **Professional Polish**: Modern, clean interface with smooth animations

## 🎨 Complete Feature List

### Core Features
- ✅ **Real-time Code Synchronization** - CRDT-based conflict-free editing
- ✅ **Room-based Collaboration** - Multiple isolated coding sessions
- ✅ **LeetCode-style Problems** - Structured problem descriptions from MongoDB
- ✅ **Company Tagging** - Filter problems by company (Amazon, Google, Microsoft, etc.)
- ✅ **Problem Database** - MongoDB-powered problem storage with pre-seeded problems

### Editor Features
- ✅ **Monaco Editor** - Full-featured code editor with syntax highlighting
- ✅ **Multi-language Support** - TypeScript, JavaScript, Python, Java, C++, C
- ✅ **Language Switching** - Change programming language on the fly
- ✅ **Code Execution** - Run code with Judge0 API integration
- ✅ **Shared Console** - Real-time console output synchronized across participants

### Communication Features
- ✅ **WebRTC Video Chat** - P2P video and audio communication
- ✅ **Mute/Unmute Controls** - Toggle microphone and camera
- ✅ **Floating Video Window** - Draggable, resizable video interface
- ✅ **Multi-participant Video** - See all participants' video feeds

### Interview Features
- ✅ **Interviewer Mode** - Special dashboard for interviewers
- ✅ **Solution View** - Access official solutions (interviewer only)
- ✅ **Hints System** - Guide candidates with hints (interviewer only)
- ✅ **Synchronized Timer** - Countdown timer synced across all participants
- ✅ **Role-based Access** - Candidates cannot see solutions or hints

### UI/UX Features
- ✅ **Dark Mode** - Full dark theme support
- ✅ **Light Mode** - Clean light theme
- ✅ **Theme Toggle** - Switch themes with persistent preferences
- ✅ **Responsive Design** - Works across different screen sizes
- ✅ **Type Safety** - Full TypeScript coverage
- ✅ **Modern UI** - Tailwind CSS with professional polish

### Technical Features
- ✅ **RESTful API** - Backend API for problem management and filtering
- ✅ **WebSocket Communication** - Real-time updates via Socket.io
- ✅ **Document Persistence** - Yjs documents persisted to disk
- ✅ **Error Handling** - Comprehensive error handling and user feedback

## 📁 Project Structure

```
InterviewSync/
├── client/                    # Next.js frontend
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── room/[id]/        # Dynamic room page
│   │   ├── layout.tsx        # Root layout
│   │   ├── page.tsx          # Lobby page
│   │   └── globals.css       # Global styles
│   ├── components/
│   │   ├── CodeEditor.tsx    # Monaco editor with Yjs binding
│   │   ├── Console.tsx       # Code execution console
│   │   ├── VideoChat.tsx     # WebRTC video component
│   │   ├── ThemeToggle.tsx   # Dark/light mode toggle
│   │   └── InterviewTimer.tsx # Timer component
│   ├── lib/
│   │   └── yjs-provider.ts   # Custom Yjs WebSocket provider
│   └── package.json
│
├── server/                    # Express backend
│   ├── src/
│   │   ├── index.ts          # Express & Socket.io server
│   │   ├── yjs-server.ts     # Yjs WebSocket server
│   │   ├── persistence.ts    # Document persistence
│   │   ├── db/
│   │   │   └── connection.ts # MongoDB connection
│   │   ├── models/
│   │   │   ├── Problem.ts    # Problem model
│   │   │   └── Room.ts       # Room model
│   │   ├── routes/
│   │   │   ├── problems.ts   # Problem API routes
│   │   │   ├── rooms.ts      # Room API routes
│   │   │   └── execute.ts    # Code execution routes
│   │   ├── services/
│   │   │   └── roomService.ts # Room business logic
│   │   └── utils/
│   │       └── judge0Languages.ts # Language mappings
│   ├── data/
│   │   └── persistence/      # Persisted Yjs documents
│   └── package.json
│
├── shared/                    # Shared TypeScript types
│   └── types.ts
│
├── data/                      # Problem data
│   └── problems/
│       └── two-sum.json      # Sample problem
│
├── LICENSE                    # MIT License
├── CONTRIBUTING.md            # Contribution guidelines
└── README.md                  # This file
```

## 🔧 Configuration

### Environment Variables Reference

#### Client (`.env.local`)
| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SERVER_URL` | Backend API URL | `http://localhost:3001` |
| `NEXT_PUBLIC_SOCKET_URL` | Socket.io server URL | `http://localhost:3001` |
| `NEXT_PUBLIC_YJS_URL` | Yjs WebSocket URL | `ws://localhost:3001` |

#### Server (`.env`)
| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port | No (default: 3001) |
| `CLIENT_URL` | Frontend URL for CORS | No (default: http://localhost:3000) |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JUDGE0_API_URL` | Judge0 API endpoint | Yes |
| `JUDGE0_RAPIDAPI_KEY` | RapidAPI key for Judge0 | Yes |
| `JUDGE0_RAPIDAPI_HOST` | RapidAPI host header | Yes |

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Yjs](https://github.com/yjs/yjs) - CRDT implementation for real-time collaboration
- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - VS Code's editor component
- [Next.js](https://nextjs.org/) - React framework
- [Socket.io](https://socket.io/) - Real-time communication
- [Simple-Peer](https://github.com/feross/simple-peer) - WebRTC made simple
- [Judge0](https://judge0.com/) - Code execution API
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

---

Built with ❤️ for collaborative coding interviews
