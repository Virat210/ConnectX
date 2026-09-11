import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Mic,
  MicOff,
  Video,
  VideoOff,
  MoreVertical,
  ShieldCheck,
  UserMinus,
  VolumeX,
  SlidersHorizontal,
  Hand
} from 'lucide-react';
import { useMeeting } from '../hooks/useMeeting';
import { useSound } from '../hooks/useSound';

export default function ParticipantList({ isOpen, onClose }) {
  const {
    participants,
    participantCount,
    setParticipantCount,
    muteParticipant,
    muteAll,
    removeParticipant,
    toggleCoHost
  } = useMeeting();

  const { playClick } = useSound();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenuId, setActiveMenuId] = useState(null);

  if (!isOpen) return null;

  const filteredParticipants = participants.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMenu = (id) => {
    setActiveMenuId(prev => (prev === id ? null : id));
  };

  return (
    <motion.aside
      initial={{ x: 340, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 340, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 220 }}
      className="w-full sm:w-96 h-full bg-slate-900 border-l border-slate-800 flex flex-col z-30 shadow-2xl shrink-0"
    >
      {/* Header */}
      <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white tracking-wide">Participants</h2>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[11px] font-bold">
              {participants.length}
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Host and moderation controls</p>
        </div>
        <button
          onClick={() => {
            playClick();
            onClose();
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close Participants List"
        >
          <X className="w-5 h-5" />
        </button>
      </div>



      {/* Search & Actions Bar */}
      <div className="p-4 space-y-3 border-b border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search attendees..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <button
          onClick={() => {
            playClick();
            muteAll();
          }}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700/80 text-rose-300 border border-slate-700 text-xs font-semibold transition-colors"
        >
          <VolumeX className="w-3.5 h-3.5 text-rose-400" />
          <span>Mute All Participants</span>
        </button>
      </div>

      {/* Participant List Items */}
      <div className="flex-1 p-3 overflow-y-auto space-y-1.5">
        {filteredParticipants.map((p) => (
          <div
            key={p.id}
            className="relative flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/60 transition-colors group"
          >
            {/* Left: Avatar + Name + Tags */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative shrink-0">
                <img
                  src={p.avatar}
                  alt={p.name}
                  className="w-9 h-9 rounded-full object-cover ring-1 ring-slate-700"
                />
                {p.isHandRaised && (
                  <span className="absolute -top-1 -right-1 p-0.5 rounded-full bg-amber-500 text-slate-950 shadow">
                    <Hand className="w-3 h-3" />
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-white truncate">{p.name}</p>
                  {p.isHost && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Host
                    </span>
                  )}
                  {p.isCoHost && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Co-Host
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">{p.fullName}</p>
              </div>
            </div>

            {/* Right: Mic/Cam Badges & Host Dropdown */}
            <div className="flex items-center gap-1 shrink-0 ml-2">
              <div className="p-1.5 rounded-lg text-slate-400">
                {p.isMuted ? <MicOff className="w-3.5 h-3.5 text-rose-400" /> : <Mic className="w-3.5 h-3.5 text-slate-300" />}
              </div>
              <div className="p-1.5 rounded-lg text-slate-400">
                {p.isCameraOff ? <VideoOff className="w-3.5 h-3.5 text-rose-400" /> : <Video className="w-3.5 h-3.5 text-slate-300" />}
              </div>

              {p.id !== 'user-me' && (
                <div className="relative">
                  <button
                    onClick={() => {
                      playClick();
                      toggleMenu(p.id);
                    }}
                    className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>

                  {/* Dropdown Menu */}
                  {activeMenuId === p.id && (
                    <div className="absolute right-0 mt-1 w-44 rounded-xl bg-slate-950 border border-slate-700/80 shadow-2xl p-1 z-50 text-xs text-slate-200">
                      <button
                        onClick={() => {
                          playClick();
                          muteParticipant(p.socketId || p.id);
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-left"
                      >
                        <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                        <span>Mute Participant</span>
                      </button>

                      <button
                        onClick={() => {
                          playClick();
                          toggleCoHost(p.id);
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800 text-left"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>{p.isCoHost ? 'Revoke Co-Host' : 'Make Co-Host'}</span>
                      </button>

                      <div className="my-1 border-t border-slate-800" />

                      <button
                        onClick={() => {
                          playClick();
                          removeParticipant(p.socketId || p.id);
                          setActiveMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-rose-500/20 text-rose-400 text-left"
                      >
                        <UserMinus className="w-3.5 h-3.5" />
                        <span>Remove from Call</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.aside>
  );
}
