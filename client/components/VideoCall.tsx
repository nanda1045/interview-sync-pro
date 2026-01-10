'use client';

import { useEffect, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import Peer from 'simple-peer';
import { Video, VideoOff, Mic, MicOff, X, Maximize2, Minimize2 } from 'lucide-react';

interface VideoCallProps {
  socket: Socket;
  roomId: string;
  userId: string;
}

interface PeerConnection {
  peer: Peer.Instance;
  stream?: MediaStream;
}

export default function VideoCall({ socket, roomId, userId }: VideoCallProps) {
  // Media streams
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // State
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 80 });
  
  // Refs
  const peerRef = useRef<PeerConnection | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const remoteUserIdRef = useRef<string | null>(null);

  // Initialize local media stream
  useEffect(() => {
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
        alert('Failed to access camera/microphone. Please check permissions.');
      }
    };

    getMedia();

    return () => {
      // Cleanup local stream
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      // Cleanup remote stream
      if (remoteStream) {
        remoteStream.getTracks().forEach((track) => track.stop());
      }
      // Cleanup peer connection
      if (peerRef.current?.peer) {
        peerRef.current.peer.destroy();
      }
    };
  }, []);

  // Handle WebRTC signaling
  useEffect(() => {
    if (!socket || !localStream) return;

    // Notify server that we're ready for WebRTC
    socket.emit('webrtc-ready', { roomId, userId });

    // Handle when another user joins the room
    socket.on('user-joined', (remoteUserId: string) => {
      if (remoteUserId === userId) return;
      
      console.log('User joined, initiating WebRTC connection:', remoteUserId);
      remoteUserIdRef.current = remoteUserId;
      createPeerConnection(remoteUserId, true); // We are the initiator
    });

    // Handle incoming WebRTC offer
    socket.on('webrtc-offer', (data: { from: string; signal: Peer.SignalData }) => {
      if (data.from === userId) return;
      
      console.log('Received WebRTC offer from:', data.from);
      remoteUserIdRef.current = data.from;
      
      if (!peerRef.current) {
        createPeerConnection(data.from, false); // We are not the initiator
      }
      
      if (peerRef.current?.peer) {
        peerRef.current.peer.signal(data.signal);
      }
    });

    // Handle incoming WebRTC answer
    socket.on('webrtc-answer', (data: { from: string; signal: Peer.SignalData }) => {
      if (data.from === userId) return;
      
      console.log('Received WebRTC answer from:', data.from);
      if (peerRef.current?.peer) {
        peerRef.current.peer.signal(data.signal);
      }
    });

    // Handle ICE candidates
    socket.on('webrtc-ice-candidate', (data: { from: string; candidate: RTCIceCandidateInit }) => {
      if (data.from === userId) return;
      
      console.log('Received ICE candidate from:', data.from);
      if (peerRef.current?.peer) {
        peerRef.current.peer.signal(data.candidate);
      }
    });

    // Handle user leaving
    socket.on('user-left', (remoteUserId: string) => {
      console.log('User left:', remoteUserId);
      if (peerRef.current?.peer) {
        peerRef.current.peer.destroy();
        peerRef.current = null;
      }
      if (remoteStream) {
        remoteStream.getTracks().forEach((track) => track.stop());
        setRemoteStream(null);
      }
      setIsConnected(false);
      remoteUserIdRef.current = null;
    });

    return () => {
      socket.off('user-joined');
      socket.off('webrtc-offer');
      socket.off('webrtc-answer');
      socket.off('webrtc-ice-candidate');
      socket.off('user-left');
    };
  }, [socket, localStream, userId, roomId]);

  // Create peer connection
  const createPeerConnection = (remoteUserId: string, initiator: boolean) => {
    if (peerRef.current) {
      peerRef.current.peer.destroy();
    }

    const peer = new Peer({
      initiator,
      trickle: false,
      stream: localStream || undefined,
    });

    peer.on('signal', (signal: Peer.SignalData) => {
      if (!remoteUserIdRef.current) return;

      if (initiator) {
        // Send offer
        socket.emit('webrtc-offer', {
          roomId,
          to: remoteUserId,
          signal,
        });
      } else {
        // Send answer
        socket.emit('webrtc-answer', {
          roomId,
          to: remoteUserId,
          signal,
        });
      }
    });

    peer.on('stream', (stream: MediaStream) => {
      console.log('Received remote stream');
      setRemoteStream(stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
      setIsConnected(true);
    });

    peer.on('connect', () => {
      console.log('WebRTC peer connection established');
      setIsConnected(true);
    });

    peer.on('close', () => {
      console.log('WebRTC peer connection closed');
      setIsConnected(false);
      if (remoteStream) {
        remoteStream.getTracks().forEach((track) => track.stop());
        setRemoteStream(null);
      }
    });

    peer.on('error', (err: Error) => {
      console.error('WebRTC peer error:', err);
    });

    peerRef.current = { peer, stream: localStream || undefined };
  };

  // Toggle video
  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  // Handle drag
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isMinimized) return;
    setIsDragging(true);
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
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

  // Update local video when stream changes
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // Update remote video when stream changes
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Minimized view
  if (isMinimized) {
    return (
      <button
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-blue-600 p-3 text-white shadow-lg transition-colors hover:bg-blue-700"
        title="Show video call"
      >
        <Video className="h-5 w-5" />
        <Maximize2 className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed z-50 w-96 rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800"
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
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-2 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            Video Call
          </h3>
          {isConnected && (
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
          )}
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="rounded p-1 text-slate-600 transition-colors hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700"
          title="Minimize"
        >
          <Minimize2 className="h-4 w-4" />
        </button>
      </div>

      {/* Video Feeds */}
      <div className="p-3 space-y-3">
        {/* Local Stream */}
        <div className="relative rounded-lg bg-slate-900 overflow-hidden">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-40 object-cover"
          />
          <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-xs text-white font-medium">
            You {!isVideoEnabled && '(Camera Off)'}
          </div>
          {!isVideoEnabled && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
              <VideoOff className="h-8 w-8 text-slate-400" />
            </div>
          )}
        </div>

        {/* Remote Stream */}
        <div className="relative rounded-lg bg-slate-900 overflow-hidden min-h-[160px]">
          {remoteStream ? (
            <>
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-40 object-cover"
              />
              <div className="absolute bottom-2 left-2 rounded bg-black/70 px-2 py-1 text-xs text-white font-medium">
                Remote {isConnected && '(Connected)'}
              </div>
            </>
          ) : (
            <div className="flex h-40 items-center justify-center bg-slate-800">
              <div className="text-center">
                <Video className="h-12 w-12 mx-auto mb-2 text-slate-500" />
                <p className="text-xs text-slate-400">Waiting for connection...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2 border-t border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
        <button
          onClick={toggleVideo}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            isVideoEnabled
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
          title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          Camera
        </button>
        <button
          onClick={toggleAudio}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            isAudioEnabled
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
          title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          Mic
        </button>
      </div>
    </div>
  );
}

