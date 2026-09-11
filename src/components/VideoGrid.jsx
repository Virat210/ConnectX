import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import VideoTile from './VideoTile';
import { ScreenShare, Monitor } from 'lucide-react';
import { useMeeting } from '../hooks/useMeeting';

export default function VideoGrid({
  participants = [],
  isScreenSharing = false,
  onStopScreenShare = () => {}
}) {
  const [pinnedId, setPinnedId] = useState(null);
  const { screenStream } = useMeeting();
  const screenVideoRef = useRef(null);

  useEffect(() => {
    if (screenVideoRef.current && screenStream) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [screenStream, isScreenSharing]);

  const togglePin = (id) => {
    setPinnedId(prev => (prev === id ? null : id));
  };

  // If a participant is pinned, show spotlight layout
  const pinnedParticipant = participants.find(p => p.id === pinnedId);

  // If Screen Sharing is active, render the Screen Share Spotlight View
  if (isScreenSharing) {
    return (
      <div className="relative w-full h-full flex flex-col lg:flex-row gap-4 p-4">
        {/* Large Screen Presentation Stage */}
        <div className="flex-1 relative rounded-2xl overflow-hidden bg-slate-950 border border-indigo-500/40 shadow-2xl flex flex-col">
          {/* Top Presenter Bar */}
          <div className="h-11 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between z-10">
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold">
              <ScreenShare className="w-4 h-4 text-indigo-400 animate-pulse" />
              <span>You are sharing your screen • ConnectX Live Broadcast</span>
            </div>
            <button
              onClick={onStopScreenShare}
              className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 text-xs font-semibold border border-rose-500/30 transition-colors cursor-pointer"
            >
              Stop Sharing
            </button>
          </div>

          {/* Screen Presentation Viewport */}
          <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
            {screenStream ? (
              <video
                ref={screenVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-center space-y-3 p-8">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Monitor className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-white">Live Screen Broadcast Active</h3>
                <p className="text-xs text-slate-400 max-w-sm">Transmitting screen capture stream directly to all connected attendees.</p>
              </div>
            )}
          </div>
        </div>

        {/* Filmstrip of participants on the side */}
        <div className="w-full lg:w-72 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto shrink-0 max-h-[160px] lg:max-h-full">
          {participants.map(participant => (
            <div key={participant.id} className="min-w-[180px] lg:min-w-0 h-32 lg:h-40 shrink-0">
              <VideoTile
                participant={participant}
                isSelf={participant.id === 'user-me'}
                isPinned={pinnedId === participant.id}
                onPin={togglePin}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // If a participant is pinned spotlighted
  if (pinnedParticipant) {
    return (
      <div className="relative w-full h-full flex flex-col lg:flex-row gap-4 p-4">
        <div className="flex-1 relative h-full">
          <VideoTile
            participant={pinnedParticipant}
            isSelf={pinnedParticipant.id === 'user-me'}
            isPinned={true}
            onPin={togglePin}
          />
        </div>
        <div className="w-full lg:w-72 flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto shrink-0 max-h-[160px] lg:max-h-full">
          {participants.filter(p => p.id !== pinnedId).map(participant => (
            <div key={participant.id} className="min-w-[180px] lg:min-w-0 h-32 lg:h-40 shrink-0">
              <VideoTile
                participant={participant}
                isSelf={participant.id === 'user-me'}
                isPinned={false}
                onPin={togglePin}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Dynamic grid configuration based on participant count
  const count = participants.length;

  const getGridClasses = () => {
    if (count <= 1) return 'grid-cols-1 max-w-4xl mx-auto h-[80vh]';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2 max-w-6xl mx-auto';
    if (count <= 4) return 'grid-cols-1 sm:grid-cols-2 max-w-6xl mx-auto';
    if (count <= 6) return 'grid-cols-2 md:grid-cols-3 max-w-7xl mx-auto';
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3 max-w-7xl mx-auto';
  };

  return (
    <div className="w-full h-full p-4 flex items-center justify-center overflow-y-auto">
      <div className={`w-full h-full grid gap-3 sm:gap-4 auto-rows-fr ${getGridClasses()}`}>
        <AnimatePresence>
          {participants.map(participant => (
            <VideoTile
              key={participant.id}
              participant={participant}
              isSelf={participant.id === 'user-me'}
              isPinned={pinnedId === participant.id}
              onPin={togglePin}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
