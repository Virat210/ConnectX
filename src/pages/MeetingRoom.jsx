import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Radio,
  Users,
  MessageSquare,
  Lock,
  Sparkles,
  Volume2,
  VolumeX,
  SlidersHorizontal
} from 'lucide-react';
import VideoGrid from '../components/VideoGrid';
import ControlBar from '../components/ControlBar';
import ChatPanel from '../components/ChatPanel';
import ParticipantList from '../components/ParticipantList';
import MeetingSettings from '../components/MeetingSettings';
import Logo from '../components/Logo';
import { useMeeting } from '../hooks/useMeeting';
import { useSound } from '../hooks/useSound';

export default function MeetingRoom() {
  const { meetingId: paramId } = useParams();
  const {
    meetingId,
    setMeetingId,
    meetingTitle,
    participants,
    isScreenSharing,
    toggleScreenShare,
    isChatOpen,
    setIsChatOpen,
    isParticipantsOpen,
    setIsParticipantsOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    reactions,
    isRecording,
    recordingSeconds,
    joinMeetingRoom,
    leaveMeeting
  } = useMeeting();

  const { soundEnabled, toggleSound, playClick } = useSound();
  const navigate = useNavigate();

  useEffect(() => {
    if (paramId) {
      joinMeetingRoom(paramId);
    }
    return () => {
      leaveMeeting();
    };
  }, [paramId, joinMeetingRoom, leaveMeeting]);

  return (
    <div className="relative w-screen h-screen bg-slate-950 text-slate-100 flex flex-col overflow-hidden select-none font-sans">
      {/* Top Meeting Room Header */}
      <header className="h-14 px-4 md:px-6 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between z-20 shrink-0">
        {/* Left: ConnectX Logo & Room Meta */}
        <div className="flex items-center gap-3">
          <Logo size="sm" linkTo="/dashboard" />
          <div className="h-4 w-px bg-slate-800 hidden sm:block" />
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs font-bold text-white tracking-wide truncate max-w-xs md:max-w-md">
              {meetingTitle}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700/60">
              {paramId || meetingId}
            </span>
          </div>
        </div>

        {/* Center: Security Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 text-xs">
          <Lock className="w-3 h-3" />
          <span>End-to-End Encrypted</span>
        </div>

        {/* Right: Sound FX & Active Attendees Pill */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              playClick();
              toggleSound();
            }}
            className={`p-1.5 rounded-lg border transition-colors ${
              soundEnabled
                ? 'text-indigo-400 bg-indigo-950/40 border-indigo-800/60'
                : 'text-slate-500 border-slate-800'
            }`}
            title={soundEnabled ? 'UI Sounds: Active' : 'UI Sounds: Muted'}
            aria-label="Toggle UI Audio"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold">
            <Users className="w-3.5 h-3.5 text-indigo-400" />
            <span>{participants.length}</span>
          </div>
        </div>
      </header>

      {/* Main Workspace Stage: Dynamic Video Grid + Collapsible Side Panels */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Video Grid Canvas Viewport */}
        <main className="flex-1 relative h-full overflow-hidden flex flex-col justify-center">
          <VideoGrid
            participants={participants}
            isScreenSharing={isScreenSharing}
            onStopScreenShare={toggleScreenShare}
          />

          {/* Floating Emoji Reactions Overlay */}
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
            <AnimatePresence>
              {reactions.map((r) => (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 0, scale: 0.5, x: `${r.x}vw` }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    y: -window.innerHeight * 0.65,
                    scale: [0.5, 1.4, 1.2, 0.8],
                    rotate: [-10, 10, -10]
                  }}
                  transition={{ duration: 2.8, ease: 'easeOut' }}
                  className="absolute bottom-16 text-4xl sm:text-5xl drop-shadow-2xl"
                >
                  {r.emoji}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </main>

        {/* Right Drawer: In-Call Chat */}
        <ChatPanel
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />

        {/* Right Drawer: Participants List */}
        <ParticipantList
          isOpen={isParticipantsOpen}
          onClose={() => setIsParticipantsOpen(false)}
        />
      </div>

      {/* Bottom Meeting Control Dock */}
      <ControlBar onLeave={() => navigate('/dashboard')} />

      {/* Audio/Video Device Settings Modal */}
      <MeetingSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
