'use client';

import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import Peer from 'simple-peer';
import { Video, VideoOff, Mic, MicOff, X, Minimize2, Maximize2 } from 'lucide-react';

interface VideoChatProps {
  socket: Socket;
  roomId: string;
  userId: string;
  className?: string;
}

interface PeerData {
  peer: Peer.Instance;
  stream?: MediaStream;
}

export default function VideoChat({ socket, roomId, userId, className = '' }: VideoChatProps) {
  const [peers, setPeers] = useState<Map<string, PeerData>>(new Map());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });

  const userVideoRef = useRef<HTMLVideoElement>(null);
  const peersRef = useRef<Map<string, PeerData>>(new Map());
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Initialize local media stream
  useEffect(() => {
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        if (userVideoRef.current) {
          userVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    getMedia();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Handle incoming peer connections
  useEffect(() => {
    if (!socket || !localStream || !userId) return;

    // Emit ready signal when local stream is ready
    socket.emit('webrtc-ready', { roomId, userId });

    // Handle user joining - create peer connection
    socket.on('user-joined', (remoteUserId: string) => {
      if (remoteUserId === userId) return;
      
      // Don't create duplicate peer connections
      if (peersRef.current.has(remoteUserId)) return;

      const peer = createPeer(remoteUserId, true);
      peersRef.current.set(remoteUserId, { peer });
    });

    // Handle incoming offer
    socket.on('webrtc-offer', async (data: { from: string; signal: Peer.SignalData }) => {
      if (data.from === userId) return;
      
      // Don't create duplicate peer connections
      if (peersRef.current.has(data.from)) {
        const existingPeer = peersRef.current.get(data.from);
        if (existingPeer?.peer) {
          existingPeer.peer.signal(data.signal);
        }
        return;
      }

      const peer = createPeer(data.from, false);
      peersRef.current.set(data.from, { peer });
      setPeers(new Map(peersRef.current));

      peer.signal(data.signal);
    });

    // Handle incoming answer
    socket.on('webrtc-answer', (data: { from: string; signal: Peer.SignalData }) => {
      if (data.from === userId) return;

      const peerData = peersRef.current.get(data.from);
      if (peerData?.peer) {
        peerData.peer.signal(data.signal);
      }
    });

    // Handle ICE candidates
    socket.on('webrtc-ice-candidate', (data: { from: string; candidate: RTCIceCandidateInit }) => {
      if (data.from === userId) return;

      const peerData = peersRef.current.get(data.from);
      if (peerData?.peer) {
        peerData.peer.signal(data.candidate);
      }
    });

    // Handle user leaving
    socket.on('user-left', (remoteUserId: string) => {
      const peerData = peersRef.current.get(remoteUserId);
      if (peerData?.peer) {
        peerData.peer.destroy();
      }
      if (peerData?.stream) {
        peerData.stream.getTracks().forEach((track) => track.stop());
      }
      peersRef.current.delete(remoteUserId);
      setPeers(new Map(peersRef.current));
    });

    return () => {
      socket.off('user-joined');
      socket.off('webrtc-offer');
      socket.off('webrtc-answer');
      socket.off('webrtc-ice-candidate');
      socket.off('user-left');
    };
  }, [socket, localStream, userId, roomId]);

  const createPeer = (remoteUserId: string, initiator: boolean): Peer.Instance => {
    const peer = new Peer({
      initiator,
      trickle: false,
      stream: localStream || undefined,
    });

    peer.on('signal', (signal: Peer.SignalData) => {
      if (initiator) {
        socket.emit('webrtc-offer', { roomId, to: remoteUserId, signal });
      } else {
        socket.emit('webrtc-answer', { roomId, to: remoteUserId, signal });
      }
    });

    peer.on('stream', (stream: MediaStream) => {
      const peerData = peersRef.current.get(remoteUserId);
      if (peerData) {
        peerData.stream = stream;
        peersRef.current.set(remoteUserId, peerData);
        setPeers(new Map(peersRef.current));
      }
    });

    peer.on('error', (err) => {
      console.error('Peer error:', err);
    });

    return peer;
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isMinimized && videoContainerRef.current) {
      setIsDragging(true);
      const rect = videoContainerRef.current.getBoundingClientRect();
      dragStartRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && !isMinimized) {
      setPosition({
        x: e.clientX - dragStartRef.current.x,
        y: e.clientY - dragStartRef.current.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      peersRef.current.forEach((peerData) => {
        if (peerData.peer) {
          peerData.peer.destroy();
        }
        if (peerData.stream) {
          peerData.stream.getTracks().forEach((track) => track.stop());
        }
      });
    };
  }, []);

  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-50 rounded-full bg-blue-600 p-3 text-white shadow-lg transition-colors hover:bg-blue-700"
        title="Show video chat"
      >
        <Maximize2 className="h-5 w-5" />
      </button>
    );
  }

  return (
    <div
      ref={videoContainerRef}
      className={`fixed z-50 w-80 rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800 ${className}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Video Chat</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="rounded p-1 text-slate-600 transition-colors hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
            title="Minimize"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Video Feeds */}
      <div className="space-y-2 p-2">
        {/* Local Video */}
        <div className="relative rounded-lg bg-slate-900">
          <video
            ref={userVideoRef}
            autoPlay
            muted
            playsInline
            className="h-32 w-full rounded-lg object-cover"
          />
          <div className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-0.5 text-xs text-white">
            You
          </div>
          {!isVideoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-slate-800">
              <VideoOff className="h-8 w-8 text-slate-400" />
            </div>
          )}
        </div>

        {/* Remote Videos */}
        {Array.from(peers.entries()).map(([peerId, peerData]) => (
          <div key={peerId} className="relative rounded-lg bg-slate-900">
            <RemoteVideo stream={peerData.stream} peerId={peerId} />
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 border-t border-slate-200 bg-slate-50 p-2 dark:border-slate-700 dark:bg-slate-800">
        <button
          onClick={toggleVideo}
          className={`rounded-lg p-2 transition-colors ${
            isVideoEnabled
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
          title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </button>
        <button
          onClick={toggleAudio}
          className={`rounded-lg p-2 transition-colors ${
            isAudioEnabled
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
          title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

function RemoteVideo({ stream, peerId }: { stream?: MediaStream; peerId: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="h-32 w-full rounded-lg object-cover"
      />
      <div className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-0.5 text-xs text-white">
        {peerId.slice(0, 8)}
      </div>
    </>
  );
}

