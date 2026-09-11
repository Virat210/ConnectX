import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { getSocket } from '../utils/socket';
import { useAuth } from './AuthContext';
import { useSound } from '../hooks/useSound';
import { useToast } from './ToastContext';
import { meetingApi, webrtcApi } from '../utils/api';

const MeetingContext = createContext();

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:global.stun.twilio.com:3478' },
  ],
};

export function MeetingProvider({ children }) {
  const { user } = useAuth();
  const { playJoin, playLeave, playMessage, playRecordStart, playRecordStop, playHandRaise } = useSound();
  const { addToast } = useToast();

  // Meeting Metadata
  const [meetingId, setMeetingId] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('ConnectX Meeting');
  const [isHost, setIsHost] = useState(false);

  // Participants & Media Streams
  // Each participant: { id, socketId, userId, name, avatar, role, isHost, isCoHost, isMuted, isCameraOff, isSpeaking, isHandRaised, isScreenSharing, stream }
  const [participants, setParticipants] = useState([]);
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);

  // Local Controls
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [activeSpeakerId, setActiveSpeakerId] = useState('');

  // Recording
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Chat & Drawers
  const [messages, setMessages] = useState([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Floating Reactions
  const [reactions, setReactions] = useState([]);

  // Meeting Lists (Scheduled & Recent from real API)
  const [scheduledMeetings, setScheduledMeetings] = useState([]);
  const [recentMeetings, setRecentMeetings] = useState([]);

  // WebRTC Peer Connections Map: socketId -> RTCPeerConnection
  const peerConnections = useRef(new Map());
  const localStreamRef = useRef(null);
  const screenTrackRef = useRef(null);
  const iceServersRef = useRef(ICE_SERVERS);

  // Pre-load dynamic ICE servers from backend
  useEffect(() => {
    async function preloadIce() {
      try {
        const dynamicServers = await webrtcApi.getIceServers();
        if (dynamicServers && dynamicServers.length > 0) {
          iceServersRef.current = { iceServers: dynamicServers };
        }
      } catch (e) {
        console.warn('Using standard STUN fallback:', e.message);
      }
    }
    preloadIce();
  }, []);

  // Load real meetings from backend on mount or auth change
  const refreshMeetings = useCallback(async () => {
    try {
      const token = localStorage.getItem('connectx_token');
      if (token && user && user.id) {
        const data = await meetingApi.list();
        if (data) {
          setScheduledMeetings(data.scheduled || []);
          setRecentMeetings(data.recent || []);
        }
      } else {
        setScheduledMeetings([]);
        setRecentMeetings([]);
      }
    } catch (e) {
      console.warn('Failed to load meeting history:', e.message);
    }
  }, [user]);

  useEffect(() => {
    refreshMeetings();
  }, [refreshMeetings]);

  const addScheduledMeeting = useCallback((meeting) => {
    setScheduledMeetings(prev => [meeting, ...prev]);
  }, []);

  const addRecentMeeting = useCallback((meeting) => {
    setRecentMeetings(prev => [meeting, ...prev.filter(m => m.id !== meeting.id)]);
  }, []);

  // Initialize Local Media Stream
  const initLocalStream = useCallback(async () => {
    try {
      if (localStreamRef.current) {
        return localStreamRef.current;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.warn('Could not access full media devices:', err.message);
      // Fallback: try audio only
      try {
        const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = audioStream;
        setLocalStream(audioStream);
        setIsCameraOff(true);
        return audioStream;
      } catch (audioErr) {
        console.warn('Microphone also unavailable:', audioErr.message);
        setIsCameraOff(true);
        setIsMuted(true);
        return null;
      }
    }
  }, []);

  // Stop Local Media Stream
  const stopLocalStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(t => t.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }
    if (screenTrackRef.current) {
      screenTrackRef.current.stop();
      screenTrackRef.current = null;
    }
    setScreenStream(null);
    setIsScreenSharing(false);
  }, []);

  // Create WebRTC Peer Connection
  const createPeerConnection = useCallback((peerSocketId, socket, currentStream) => {
    if (peerConnections.current.has(peerSocketId)) {
      return peerConnections.current.get(peerSocketId);
    }

    const config = iceServersRef.current || ICE_SERVERS;
    const pc = new RTCPeerConnection(config);
    peerConnections.current.set(peerSocketId, pc);

    // Add local tracks to peer connection
    if (currentStream) {
      currentStream.getTracks().forEach((track) => {
        pc.addTrack(track, currentStream);
      });
    }

    // Handle remote track
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteStream) {
        setParticipants(prev =>
          prev.map(p => (p.socketId === peerSocketId ? { ...p, stream: remoteStream } : p))
        );
      }
    };

    // Handle ICE Candidate with diagnostics
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        const cand = event.candidate;
        console.log(`📡 [ICE Candidate ${peerSocketId}] Type: ${cand.type || 'unknown'} | Protocol: ${cand.protocol}`);
        if (cand.type === 'relay') {
          console.info(`✅ [TURN RELAY ACTIVE] Traversing symmetric NAT via TURN relay for peer ${peerSocketId}`);
        }
        socket.emit('signal:ice-candidate', {
          to: peerSocketId,
          candidate: cand,
        });
      }
    };

    // Handle ICE Candidate Errors
    pc.onicecandidateerror = (event) => {
      if (event.errorCode === 401 || event.errorCode === 403) {
        console.error(`🚨 [TURN Auth Error] ${event.url} returned error ${event.errorCode}: ${event.errorText}`);
      } else if (event.errorCode >= 500) {
        console.warn(`⚠️ [TURN Server Error] ${event.url} returned error ${event.errorCode}: ${event.errorText}`);
      }
    };

    // Monitor ICE Connection State and trigger ICE restart if needed
    pc.oniceconnectionstatechange = () => {
      const state = pc.iceConnectionState;
      console.log(`🌐 [ICE State ${peerSocketId}]: ${state}`);
      if (state === 'failed') {
        console.warn(`⚠️ ICE connection failed for peer ${peerSocketId}. Initiating ICE restart...`);
        try {
          if (pc.restartIce) {
            pc.restartIce();
          }
        } catch (restartErr) {
          console.warn('ICE restart error:', restartErr);
        }
      } else if (state === 'disconnected') {
        console.warn(`⚠️ ICE connection disconnected for peer ${peerSocketId}. Reconnecting...`);
      }
    };

    // Monitor Peer Connection State
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log(`🔌 [Peer State ${peerSocketId}]: ${state}`);
      if (state === 'failed') {
        addToast({
          title: 'Connection Issue',
          description: 'Network connectivity interrupted. Reconnecting media...',
          type: 'warning',
        });
      } else if (state === 'closed') {
        peerConnections.current.delete(peerSocketId);
      }
    };

    return pc;
  }, [addToast]);

  // Leave Meeting Cleanup
  const leaveMeeting = useCallback(() => {
    const socket = getSocket();
    if (socket && meetingId) {
      socket.emit('meeting:leave', { meetingId });
    }

    // Close all peer connections
    peerConnections.current.forEach((pc) => {
      pc.close();
    });
    peerConnections.current.clear();

    // Release local hardware tracks
    stopLocalStream();

    setParticipants([]);
    setMessages([]);
    setIsScreenSharing(false);
    refreshMeetings();
  }, [meetingId, stopLocalStream, refreshMeetings]);

  // Join Meeting Room
  const joinMeetingRoom = useCallback(async (targetMeetingId) => {
    if (!targetMeetingId) return;

    setMeetingId(targetMeetingId);

    // Refresh dynamic ICE servers prior to establishing peer connections
    try {
      const dynamicIceServers = await webrtcApi.getIceServers();
      if (dynamicIceServers && dynamicIceServers.length > 0) {
        iceServersRef.current = { iceServers: dynamicIceServers };
      }
    } catch {
      // Keep existing STUN configuration
    }

    const stream = await initLocalStream();

    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }

    const selfUser = {
      meetingId: targetMeetingId,
      userId: user?.id || `guest-${Date.now()}`,
      name: user?.fullName || user?.name || 'Virat Singh',
      avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isMuted,
      isCameraOff,
    };

    socket.emit('meeting:join', selfUser);

    // Server acknowledged join
    socket.off('meeting:joined');
    socket.on('meeting:joined', async (data) => {
      const { self, participants: existingPeers, meeting } = data;
      setMeetingTitle(meeting.title || 'ConnectX Meeting');
      setIsHost(meeting.isHost);

      // Local self participant
      const selfParticipant = {
        id: 'user-me',
        socketId: socket.id,
        userId: self.userId,
        name: `${self.name}`,
        avatar: self.avatar,
        role: meeting.isHost ? 'Host' : 'Participant',
        isHost: meeting.isHost,
        isCoHost: false,
        isMuted: self.isMuted,
        isCameraOff: self.isCameraOff,
        isSpeaking: false,
        isHandRaised: false,
        isScreenSharing: false,
        stream: localStreamRef.current,
        videoTheme: 'charcoal',
      };

      const remoteParticipants = existingPeers.map(p => ({
        id: p.socketId,
        socketId: p.socketId,
        userId: p.userId,
        name: p.name,
        avatar: p.avatar,
        role: p.isHost ? 'Host' : (p.isCoHost ? 'Co-Host' : 'Participant'),
        isHost: p.isHost,
        isCoHost: p.isCoHost,
        isMuted: p.isMuted,
        isCameraOff: p.isCameraOff,
        isSpeaking: p.isSpeaking,
        isHandRaised: false,
        isScreenSharing: p.isScreenSharing,
        stream: null,
        videoTheme: 'warmGray',
      }));

      setParticipants([selfParticipant, ...remoteParticipants]);
      playJoin();

      // Initiate WebRTC offers to existing participants
      for (const peer of existingPeers) {
        try {
          const pc = createPeerConnection(peer.socketId, socket, stream);
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          await pc.setLocalDescription(offer);
          socket.emit('signal:offer', {
            to: peer.socketId,
            offer,
          });
        } catch (offerErr) {
          console.warn('Failed to create offer for peer:', peer.socketId, offerErr);
        }
      }
    });

    // New participant joined
    socket.off('participant:joined');
    socket.on('participant:joined', (newPeer) => {
      playJoin();
      addToast({
        title: `${newPeer.name} joined`,
        description: 'New participant entered the meeting room.',
        type: 'info',
      });
      setParticipants(prev => {
        if (prev.some(p => p.socketId === newPeer.socketId)) return prev;
        return [
          ...prev,
          {
            id: newPeer.socketId,
            socketId: newPeer.socketId,
            userId: newPeer.userId,
            name: newPeer.name,
            avatar: newPeer.avatar,
            role: newPeer.isHost ? 'Host' : (newPeer.isCoHost ? 'Co-Host' : 'Participant'),
            isHost: newPeer.isHost,
            isCoHost: newPeer.isCoHost,
            isMuted: newPeer.isMuted,
            isCameraOff: newPeer.isCameraOff,
            isSpeaking: false,
            isHandRaised: false,
            isScreenSharing: false,
            stream: null,
            videoTheme: 'stone',
          },
        ];
      });
    });

    // Handle SDP Offer
    socket.off('signal:offer');
    socket.on('signal:offer', async (data) => {
      const { from: peerSocketId, offer } = data;
      try {
        const pc = createPeerConnection(peerSocketId, socket, localStreamRef.current);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socket.emit('signal:answer', {
          to: peerSocketId,
          answer,
        });
      } catch (err) {
        console.warn('Error handling SDP offer:', err);
      }
    });

    // Handle SDP Answer
    socket.off('signal:answer');
    socket.on('signal:answer', async (data) => {
      const { from: peerSocketId, answer } = data;
      try {
        const pc = peerConnections.current.get(peerSocketId);
        if (pc) {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
      } catch (err) {
        console.warn('Error handling SDP answer:', err);
      }
    });

    // Handle ICE Candidate
    socket.off('signal:ice-candidate');
    socket.on('signal:ice-candidate', async (data) => {
      const { from: peerSocketId, candidate } = data;
      try {
        const pc = peerConnections.current.get(peerSocketId);
        if (pc && candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.warn('Error adding ICE candidate:', err);
      }
    });

    // Participant State Updated (mute/camera/speaking)
    socket.off('participant:updated');
    socket.on('participant:updated', (data) => {
      setParticipants(prev =>
        prev.map(p => (p.socketId === data.socketId ? { ...p, ...data } : p))
      );
    });

    // Screen sharing broadcasts
    socket.off('screen:started');
    socket.on('screen:started', (data) => {
      setParticipants(prev =>
        prev.map(p => (p.socketId === data.socketId ? { ...p, isScreenSharing: true } : p))
      );
      addToast({
        title: 'Screen Sharing Active',
        description: `${data.presenterName || 'A participant'} is presenting their screen.`,
        type: 'info',
      });
    });

    socket.off('screen:stopped');
    socket.on('screen:stopped', (data) => {
      setParticipants(prev =>
        prev.map(p => (p.socketId === data.socketId ? { ...p, isScreenSharing: false } : p))
      );
    });

    // Chat messages
    socket.off('chat:message');
    socket.on('chat:message', (msg) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [
          ...prev,
          {
            ...msg,
            isMe: msg.senderUserId === user?.id || msg.senderId === socket.id,
          },
        ];
      });
      playMessage();
      setUnreadChatCount(c => c + 1);
    });

    // Floating Reactions
    socket.off('reaction:received');
    socket.on('reaction:received', (reaction) => {
      setReactions(prev => [...prev, reaction]);
      setTimeout(() => {
        setReactions(prev => prev.filter(r => r.id !== reaction.id));
      }, 2800);
    });

    // Host forced mute
    socket.off('host:force-mute');
    socket.on('host:force-mute', () => {
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach(t => (t.enabled = false));
      }
      setIsMuted(true);
      addToast({
        title: 'Microphone Muted',
        description: 'You have been muted by the host.',
        type: 'warning',
      });
    });

    // Removed by host
    socket.off('meeting:kicked');
    socket.on('meeting:kicked', (data) => {
      leaveMeeting();
      addToast({
        title: 'Removed from meeting',
        description: data.message || 'The host removed you from the session.',
        type: 'error',
      });
      window.location.href = '/dashboard';
    });

    // Meeting ended by host
    socket.off('meeting:ended');
    socket.on('meeting:ended', (data) => {
      leaveMeeting();
      addToast({
        title: 'Meeting Ended',
        description: data.message || 'The host has ended the meeting for all participants.',
        type: 'info',
      });
      window.location.href = '/dashboard';
    });

    // Participant Left
    socket.off('participant:left');
    socket.on('participant:left', (data) => {
      const pc = peerConnections.current.get(data.socketId);
      if (pc) {
        pc.close();
        peerConnections.current.delete(data.socketId);
      }
      setParticipants(prev => prev.filter(p => p.socketId !== data.socketId));
      playLeave();
    });

    // Errors
    socket.off('meeting:error');
    socket.on('meeting:error', (data) => {
      addToast({
        title: 'Meeting Error',
        description: data.message,
        type: 'error',
      });
    });
  }, [user, isMuted, isCameraOff, initLocalStream, createPeerConnection, playJoin, playLeave, playMessage, addToast, leaveMeeting]);

  // End Meeting for Everyone (Host action)
  const endMeetingForAll = useCallback(async () => {
    const socket = getSocket();
    if (socket && meetingId) {
      socket.emit('meeting:end-all', { meetingId });
    }
    try {
      await meetingApi.end(meetingId);
    } catch (e) {
      console.warn('API end call note:', e.message);
    }
    leaveMeeting();
  }, [meetingId, leaveMeeting]);

  // Local Controls: Mute
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const next = !prev;
      if (localStreamRef.current) {
        localStreamRef.current.getAudioTracks().forEach(t => (t.enabled = !next));
      }
      const socket = getSocket();
      if (socket && socket.connected && meetingId) {
        socket.emit('participant:mute', { meetingId, isMuted: next });
      }
      setParticipants(pList =>
        pList.map(p => (p.id === 'user-me' ? { ...p, isMuted: next } : p))
      );
      return next;
    });
  }, [meetingId]);

  // Local Controls: Camera
  const toggleCamera = useCallback(() => {
    setIsCameraOff(prev => {
      const next = !prev;
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach(t => (t.enabled = !next));
      }
      const socket = getSocket();
      if (socket && socket.connected && meetingId) {
        socket.emit('participant:camera', { meetingId, isCameraOff: next });
      }
      setParticipants(pList =>
        pList.map(p => (p.id === 'user-me' ? { ...p, isCameraOff: next } : p))
      );
      return next;
    });
  }, [meetingId]);

  // Local Controls: Screen Share
  const toggleScreenShare = useCallback(async () => {
    const socket = getSocket();
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        const screenTrack = stream.getVideoTracks()[0];
        screenTrackRef.current = screenTrack;
        setScreenStream(stream);
        setIsScreenSharing(true);

        // Replace track in all peer connections
        peerConnections.current.forEach((pc) => {
          const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(screenTrack);
          }
        });

        if (socket && meetingId) {
          socket.emit('screen:start', { meetingId });
        }

        // Handle native browser "Stop sharing" bar
        screenTrack.onended = () => {
          stopScreenSharingInternal();
        };
      } catch (err) {
        console.warn('Screen sharing cancelled or unavailable:', err.message);
      }
    } else {
      stopScreenSharingInternal();
    }

    function stopScreenSharingInternal() {
      if (screenTrackRef.current) {
        screenTrackRef.current.stop();
        screenTrackRef.current = null;
      }
      setScreenStream(null);
      setIsScreenSharing(false);

      // Restore camera track to all peer connections
      const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
      if (cameraTrack) {
        peerConnections.current.forEach((pc) => {
          const sender = pc.getSenders().find(s => s.track && s.track.kind === 'video');
          if (sender) {
            sender.replaceTrack(cameraTrack);
          }
        });
      }

      if (socket && meetingId) {
        socket.emit('screen:stop', { meetingId });
      }
    }
  }, [isScreenSharing, meetingId]);

  // Local Controls: Hand Raise
  const toggleHandRaise = useCallback(() => {
    setIsHandRaised(prev => {
      const next = !prev;
      if (next) playHandRaise();
      setParticipants(pList =>
        pList.map(p => (p.id === 'user-me' ? { ...p, isHandRaised: next } : p))
      );
      return next;
    });
  }, [playHandRaise]);

  // Recording Simulation
  const toggleRecording = useCallback(() => {
    setIsRecording(prev => {
      const next = !prev;
      if (next) playRecordStart();
      else playRecordStop();
      return next;
    });
  }, [playRecordStart, playRecordStop]);

  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => setRecordingSeconds(s => s + 1), 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  // Reactions
  const addReaction = useCallback((emoji) => {
    const socket = getSocket();
    if (socket && meetingId) {
      socket.emit('reaction:send', { meetingId, emoji });
    }
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setReactions(prev => [
      ...prev,
      {
        id,
        emoji,
        x: 30 + Math.random() * 40,
        senderName: user?.fullName || 'You',
      },
    ]);
    setTimeout(() => {
      setReactions(prev => prev.filter(r => r.id !== id));
    }, 2800);
  }, [meetingId, user]);

  // Chat
  const sendMessage = useCallback((text, attachment = null) => {
    if (!text?.trim() && !attachment) return;
    const socket = getSocket();
    if (socket && meetingId) {
      socket.emit('chat:message', {
        meetingId,
        message: text.trim(),
        attachment,
      });
    }
  }, [meetingId]);

  // Host Participant Moderation Actions
  const muteParticipant = useCallback((socketId) => {
    const socket = getSocket();
    if (socket && meetingId) {
      socket.emit('host:mute-participant', { meetingId, targetSocketId: socketId });
      addToast({
        title: 'Participant Muted',
        description: 'Mute request sent to participant.',
        type: 'info',
      });
    }
  }, [meetingId, addToast]);

  const muteAll = useCallback(() => {
    participants.forEach((p) => {
      if (p.id !== 'user-me' && p.socketId) {
        muteParticipant(p.socketId);
      }
    });
  }, [participants, muteParticipant]);

  const removeParticipant = useCallback((socketId) => {
    const socket = getSocket();
    if (socket && meetingId) {
      socket.emit('host:remove-participant', { meetingId, targetSocketId: socketId });
    }
  }, [meetingId]);

  const toggleCoHost = useCallback((id) => {
    setParticipants(prev =>
      prev.map(p => (p.id === id ? { ...p, isCoHost: !p.isCoHost } : p))
    );
  }, []);

  return (
    <MeetingContext.Provider
      value={{
        meetingId,
        setMeetingId,
        meetingTitle,
        setMeetingTitle,
        isHost,
        participants,
        participantCount: participants.length,
        isMuted,
        toggleMute,
        isCameraOff,
        toggleCamera,
        isScreenSharing,
        toggleScreenShare,
        isHandRaised,
        toggleHandRaise,
        activeSpeakerId,
        setActiveSpeakerId,
        isRecording,
        recordingSeconds,
        toggleRecording,
        messages,
        sendMessage,
        isChatOpen,
        openChat: () => { setIsChatOpen(true); setUnreadChatCount(0); },
        closeChat: () => setIsChatOpen(false),
        setIsChatOpen,
        isParticipantsOpen,
        setIsParticipantsOpen,
        isSettingsOpen,
        setIsSettingsOpen,
        unreadChatCount,
        reactions,
        addReaction,
        localStream,
        screenStream,
        initLocalStream,
        joinMeetingRoom,
        leaveMeeting,
        endMeetingForAll,
        muteParticipant,
        muteAll,
        removeParticipant,
        toggleCoHost,
        scheduledMeetings,
        setScheduledMeetings,
        recentMeetings,
        setRecentMeetings,
        addScheduledMeeting,
        addRecentMeeting,
        refreshMeetings,
      }}
    >
      {children}
    </MeetingContext.Provider>
  );
}

export function useMeeting() {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error('useMeeting must be used within a MeetingProvider');
  }
  return context;
}
