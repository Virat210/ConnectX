import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  MessageSquare,
  Users,
  Hand,
  Smile,
  Circle,
  Settings,
  PhoneOff,
  MoreVertical,
  Radio
} from 'lucide-react';
import { useMeeting } from '../hooks/useMeeting';
import { useSound } from '../hooks/useSound';
import ReactionPicker from './ReactionPicker';
import { useNavigate } from 'react-router-dom';

export default function ControlBar({ onLeave = () => {} }) {
  const {
    isMuted,
    toggleMute,
    isCameraOff,
    toggleCamera,
    isScreenSharing,
    toggleScreenShare,
    isHandRaised,
    toggleHandRaise,
    isRecording,
    recordingSeconds,
    toggleRecording,
    isChatOpen,
    setIsChatOpen,
    isParticipantsOpen,
    setIsParticipantsOpen,
    isSettingsOpen,
    setIsSettingsOpen,
    unreadChatCount,
    participants,
    addReaction,
    leaveMeeting,
    endMeetingForAll,
    isHost
  } = useMeeting();

  const { playClick, playLeave } = useSound();
  const [reactionMenuOpen, setReactionMenuOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const navigate = useNavigate();

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLeaveConfirm = async (endAll = false) => {
    playLeave();
    setLeaveModalOpen(false);
    if (endAll && isHost) {
      await endMeetingForAll();
    } else {
      leaveMeeting();
    }
    navigate('/dashboard');
  };

  return (
    <div className="relative w-full z-40">
      {/* Reaction Picker overlay */}
      <ReactionPicker
        isOpen={reactionMenuOpen}
        onClose={() => setReactionMenuOpen(false)}
      />

      {/* Main Control Dock */}
      <footer className="h-20 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-4 md:px-8 flex items-center justify-between shadow-2xl">
        {/* Left Side: Meeting Info & Live Recording Badge */}
        <div className="hidden sm:flex items-center gap-3 min-w-[200px]">
          {isRecording ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-xs font-mono font-semibold tracking-wider">
                REC {formatTimer(recordingSeconds)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-xs">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>Encrypted Direct Mesh</span>
            </div>
          )}
        </div>

        {/* Center: Core Meeting Action Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5 mx-auto">
          {/* Microphone */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              playClick();
              toggleMute();
            }}
            className={`p-3 rounded-2xl transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              isMuted
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                : 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-100 border border-slate-700'
            }`}
            title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
            aria-label={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </motion.button>

          {/* Camera */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              playClick();
              toggleCamera();
            }}
            className={`p-3 rounded-2xl transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              isCameraOff
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                : 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-100 border border-slate-700'
            }`}
            title={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
            aria-label={isCameraOff ? 'Turn Camera On' : 'Turn Camera Off'}
          >
            {isCameraOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
          </motion.button>

          {/* Screen Share */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              playClick();
              toggleScreenShare();
            }}
            className={`p-3 rounded-2xl transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              isScreenSharing
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400 shadow-indigo-600/30'
                : 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-100 border border-slate-700'
            }`}
            title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen'}
            aria-label="Share Screen"
          >
            <ScreenShare className="w-5 h-5" />
          </motion.button>

          {/* Raise Hand */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              playClick();
              toggleHandRaise();
            }}
            className={`p-3 rounded-2xl transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              isHandRaised
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shadow-amber-500/30'
                : 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-100 border border-slate-700'
            }`}
            title={isHandRaised ? 'Lower Hand' : 'Raise Hand'}
            aria-label="Raise Hand"
          >
            <Hand className="w-5 h-5" />
          </motion.button>

          {/* Reactions */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              playClick();
              setReactionMenuOpen(!reactionMenuOpen);
            }}
            className={`p-3 rounded-2xl transition-all shadow-md border border-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              reactionMenuOpen
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-100'
            }`}
            title="Send Reaction"
            aria-label="Send Reaction"
          >
            <Smile className="w-5 h-5" />
          </motion.button>

          {/* Record */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              playClick();
              toggleRecording();
            }}
            className={`hidden sm:flex p-3 rounded-2xl transition-all shadow-md border focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              isRecording
                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 animate-pulse'
                : 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-100 border-slate-700'
            }`}
            title={isRecording ? 'Stop Recording' : 'Start Cloud Recording'}
            aria-label="Record Meeting"
          >
            <Circle className={`w-5 h-5 ${isRecording ? 'fill-rose-500 text-rose-500' : ''}`} />
          </motion.button>

          <div className="h-8 w-px bg-slate-800 mx-1 hidden md:block" />

          {/* Chat Sidebar Toggle */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              playClick();
              setIsChatOpen(!isChatOpen);
              if (isParticipantsOpen && !isChatOpen) setIsParticipantsOpen(false);
            }}
            className={`relative p-3 rounded-2xl transition-all shadow-md border border-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              isChatOpen
                ? 'bg-indigo-600 text-white border-indigo-400'
                : 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-100'
            }`}
            title="Meeting Chat"
            aria-label="Meeting Chat"
          >
            <MessageSquare className="w-5 h-5" />
            {unreadChatCount > 0 && !isChatOpen && (
              <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-lg animate-bounce">
                {unreadChatCount}
              </span>
            )}
          </motion.button>

          {/* Participants Drawer Toggle */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              playClick();
              setIsParticipantsOpen(!isParticipantsOpen);
              if (isChatOpen && !isParticipantsOpen) setIsChatOpen(false);
            }}
            className={`relative p-3 rounded-2xl transition-all shadow-md border border-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              isParticipantsOpen
                ? 'bg-indigo-600 text-white border-indigo-400'
                : 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-100'
            }`}
            title="Participants List"
            aria-label="Participants List"
          >
            <Users className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-indigo-500 text-[10px] font-bold text-white shadow">
              {participants.length}
            </span>
          </motion.button>

          {/* Settings Modal Toggle */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => {
              playClick();
              setIsSettingsOpen(true);
            }}
            className="hidden lg:flex p-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 text-slate-100 border border-slate-700 transition-all shadow-md"
            title="Device & Meeting Settings"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Right Side: Leave / End Meeting Button */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              playClick();
              setLeaveModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold shadow-lg shadow-rose-600/30 transition-all"
            aria-label="Leave Meeting"
          >
            <PhoneOff className="w-4 h-4" />
            <span className="hidden sm:inline">Leave Call</span>
          </motion.button>
        </div>
      </footer>

      {/* Leave Call Confirmation Modal */}
      {leaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-slate-800 text-white shadow-2xl space-y-5"
          >
            <h3 className="text-xl font-bold tracking-tight">Leave Meeting?</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Are you sure you want to leave the meeting? You can rejoin anytime using the meeting ID.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setLeaveModalOpen(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-800 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleLeaveConfirm(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-sm font-medium transition-colors"
              >
                Leave Meeting
              </button>
              {isHost && (
                <button
                  onClick={() => handleLeaveConfirm(true)}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold shadow-lg shadow-rose-600/25 transition-colors cursor-pointer"
                >
                  End for Everyone
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
