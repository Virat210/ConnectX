import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, VideoOff, Hand, Pin, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VideoTile({
  participant,
  isSelf = false,
  isScreenSharePresenter = false,
  onPin = () => {},
  isPinned = false
}) {
  const [isHovered, setIsHovered] = useState(false);
  const videoRef = useRef(null);

  // Bind WebRTC MediaStream to video element
  useEffect(() => {
    if (videoRef.current && participant.stream) {
      if (videoRef.current.srcObject !== participant.stream) {
        videoRef.current.srcObject = participant.stream;
      }
    }
  }, [participant.stream, participant.isCameraOff]);

  const hasVideoTrack = participant.stream &&
    participant.stream.getVideoTracks().length > 0 &&
    participant.stream.getVideoTracks()[0].enabled;

  const showLiveVideo = !participant.isCameraOff && (hasVideoTrack || isSelf);

  // Dynamic neutral & warm theme gradients
  const themeGradients = {
    charcoal: 'from-stone-900 via-stone-950 to-[#0c0c0d]',
    emerald: 'from-stone-900 via-emerald-950/40 to-stone-950',
    warmGray: 'from-stone-900 via-stone-800/80 to-stone-950',
    amber: 'from-stone-900 via-amber-950/40 to-stone-950',
    stone: 'from-stone-900 via-stone-900/90 to-stone-950',
    neutral: 'from-neutral-900 via-neutral-950 to-stone-950',
    bronze: 'from-stone-900 via-amber-900/30 to-stone-950',
    zinc: 'from-zinc-900 via-zinc-950 to-stone-950',
    warmGold: 'from-stone-900 via-yellow-950/30 to-stone-950'
  };

  const bgGradient = themeGradients[participant.videoTheme] || themeGradients.charcoal;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative w-full h-full rounded-2xl overflow-hidden bg-stone-950 border transition-all duration-300 flex items-center justify-center select-none ${
        participant.isSpeaking
          ? 'speaker-active-border border-amber-500 shadow-xl shadow-amber-500/20'
          : 'border-stone-800/80 hover:border-stone-700 shadow-md'
      }`}
    >
      {/* Real Video Stream Feed */}
      {showLiveVideo ? (
        <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={isSelf} // Always mute local video so user doesn't hear own echo
            className={`w-full h-full object-cover ${isSelf ? 'scale-x-[-1]' : ''}`}
          />
          {/* Subtle HD Stream indicator */}
          <div className="absolute top-3 right-12 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-stone-300 pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>HD Live</span>
          </div>
        </div>
      ) : (
        /* Camera Off Mode: Centered Avatar with initials/portrait */
        <div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${bgGradient} flex flex-col items-center justify-center p-4`}>
          <div className="relative">
            <img
              src={participant.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={participant.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-2 ring-stone-700 shadow-xl"
            />
            {participant.isSpeaking && (
              <span className="absolute -inset-2 rounded-full border-2 border-amber-400 animate-ping opacity-40 pointer-events-none" />
            )}
            <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-stone-900 border border-stone-700 text-stone-400">
              <VideoOff className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-stone-400">Camera turned off</p>
        </div>
      )}

      {/* Top Left Badges: Host/CoHost & Hand Raised */}
      <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
        {participant.isHost && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-900/90 text-amber-300 text-[11px] font-semibold shadow-md backdrop-blur-md border border-amber-500/30">
            <ShieldCheck className="w-3 h-3" />
            <span>Host</span>
          </span>
        )}
        {participant.isCoHost && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700/90 text-white text-[11px] font-semibold shadow-md backdrop-blur-md border border-emerald-400/30">
            <span>Co-Host</span>
          </span>
        )}
        {participant.isHandRaised && (
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500 text-stone-950 text-[11px] font-bold shadow-lg animate-bounce"
          >
            <Hand className="w-3.5 h-3.5" />
            <span>Raised Hand</span>
          </motion.div>
        )}
      </div>

      {/* Top Right Quick Actions on Hover: Pin */}
      <div className={`absolute top-3 right-3 flex items-center gap-1.5 z-10 transition-opacity duration-200 ${isHovered || isPinned ? 'opacity-100' : 'opacity-0'}`}>
        <button
          onClick={() => onPin(participant.id)}
          className={`p-1.5 rounded-lg backdrop-blur-md border transition-colors cursor-pointer ${
            isPinned
              ? 'bg-stone-100 text-stone-950 border-white'
              : 'bg-black/50 text-stone-300 border-white/10 hover:bg-black/80 hover:text-white'
          }`}
          title={isPinned ? 'Unpin' : 'Pin for everyone'}
        >
          <Pin className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Name Pill & Audio Indicator */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        {/* Name pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-white shadow-lg pointer-events-auto max-w-[80%]">
          <span className="text-xs font-semibold truncate tracking-wide">
            {participant.name} {isSelf && '(You)'}
          </span>
          
          {/* Speaking wave bars */}
          {participant.isSpeaking && !participant.isMuted && (
            <div className="flex items-center gap-0.5 shrink-0 ml-1">
              <span className="w-1 h-3 bg-amber-400 rounded-full animate-pulse" style={{ animationDuration: '0.6s' }} />
              <span className="w-1 h-4 bg-amber-400 rounded-full animate-pulse" style={{ animationDuration: '0.4s' }} />
              <span className="w-1 h-2 bg-amber-400 rounded-full animate-pulse" style={{ animationDuration: '0.8s' }} />
            </div>
          )}
        </div>

        {/* Mic Status Icon */}
        <div className={`p-1.5 rounded-xl backdrop-blur-md border pointer-events-auto ${
          participant.isMuted
            ? 'bg-rose-500/90 text-white border-rose-400/40 shadow-rose-500/20 shadow-md'
            : 'bg-black/60 text-emerald-400 border-white/10'
        }`}>
          {participant.isMuted ? (
            <MicOff className="w-3.5 h-3.5" />
          ) : (
            <Mic className="w-3.5 h-3.5" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
