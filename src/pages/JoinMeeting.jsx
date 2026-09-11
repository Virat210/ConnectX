import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Settings,
  LogIn,
  Key,
  Radio
} from 'lucide-react';
import AudioVisualizer from '../components/AudioVisualizer';
import MeetingSettings from '../components/MeetingSettings';
import { useAuth } from '../hooks/useAuth';
import { useMeeting } from '../hooks/useMeeting';
import { useToast } from '../context/ToastContext';
import { useSound } from '../hooks/useSound';

import { meetingApi } from '../utils/api';

export default function JoinMeeting() {
  const [searchParams] = useSearchParams();
  const initialMeetingId = searchParams.get('id') || '';

  const [meetingId, setMeetingId] = useState(initialMeetingId);
  const [passcode, setPasscode] = useState('');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Live media preview if browser grants permission
  const videoRef = useRef(null);
  const [mediaStream, setMediaStream] = useState(null);

  const { user } = useAuth();
  const { setMeetingId: setContextMeetingId, addRecentMeeting } = useMeeting();
  const { addToast } = useToast();
  const { playClick, playJoin } = useSound();
  const navigate = useNavigate();

  useEffect(() => {
    let activeStream = null;

    async function initCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false
          });
          activeStream = stream;
          setMediaStream(stream);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.log('Local camera preview not accessible, using synthetic preview.');
      }
    }

    if (isCamOn) {
      initCamera();
    } else {
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
      setMediaStream(null);
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [isCamOn]);

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!meetingId.trim()) {
      addToast({
        title: 'Meeting ID required',
        description: 'Please enter a valid meeting code or link.',
        type: 'error',
      });
      return;
    }

    const id = meetingId.trim();

    try {
      const meeting = await meetingApi.get(id);
      if (!meeting) {
        addToast({
          title: 'Meeting not found',
          description: 'Please check the ID and try again.',
          type: 'error',
        });
        return;
      }

      if (meeting.status === 'ended') {
        addToast({
          title: 'This meeting has ended',
          description: 'The host has ended this meeting session.',
          type: 'error',
        });
        return;
      }

      playJoin();
      setContextMeetingId(id);
      addToast({
        title: 'Entering Meeting Room',
        description: `Connecting to ${id}`,
        type: 'join',
      });
      navigate(`/meeting/${id}`);
    } catch (err) {
      if (err.code === 'MEETING_ENDED') {
        addToast({
          title: 'This meeting has ended',
          description: 'The host has ended this meeting session.',
          type: 'error',
        });
      } else {
        addToast({
          title: 'Meeting not found',
          description: 'Please check the ID and try again.',
          type: 'error',
        });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-stone-900 dark:text-white tracking-tight">
          Join Meeting
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
          Check your camera and microphone before entering the conversation.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left / Top: Interactive Camera Preview Stage */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-video rounded-3xl overflow-hidden bg-stone-950 border border-stone-800 dark:border-white/10 shadow-xl flex items-center justify-center">
            {/* Live Camera Feed or Synthetic High-Definition Avatar */}
            {isCamOn && mediaStream ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : isCamOn ? (
              <div className="relative w-full h-full bg-stone-900 flex flex-col items-center justify-center p-6">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                  alt={user?.name || 'User'}
                  className="w-24 h-24 rounded-full object-cover ring-3 ring-amber-500/30 shadow-2xl"
                />
                <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-[11px] text-stone-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Camera Ready</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-stone-500 space-y-2">
                <div className="p-4 rounded-full bg-stone-900 border border-stone-800 text-stone-400">
                  <VideoOff className="w-8 h-8" />
                </div>
                <p className="text-xs font-medium">Camera is turned off</p>
              </div>
            )}

            {/* Mic Level indicator badge at bottom left */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10">
              <AudioVisualizer isActive={isMicOn} barCount={12} className="w-20 h-4" />
              <span className="text-[10px] text-stone-300 font-medium">
                {isMicOn ? 'Mic Active' : 'Muted'}
              </span>
            </div>

            {/* Top Right Quick Badges */}
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={() => {
                  playClick();
                  setIsSettingsModalOpen(true);
                }}
                className="p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-stone-300 hover:text-white hover:bg-black/80 transition-colors cursor-pointer"
                title="Audio/Video Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Hardware Toggles under preview */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => {
                playClick();
                setIsMicOn(!isMicOn);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer ${
                isMicOn
                  ? 'bg-stone-900 hover:bg-stone-800 text-white border border-stone-700'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              {isMicOn ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4" />}
              <span>{isMicOn ? 'Microphone On' : 'Microphone Muted'}</span>
            </button>

            <button
              onClick={() => {
                playClick();
                setIsCamOn(!isCamOn);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer ${
                isCamOn
                  ? 'bg-stone-900 hover:bg-stone-800 text-white border border-stone-700'
                  : 'bg-rose-600 hover:bg-rose-500 text-white'
              }`}
            >
              {isCamOn ? <Video className="w-4 h-4 text-emerald-400" /> : <VideoOff className="w-4 h-4" />}
              <span>{isCamOn ? 'Camera On' : 'Camera Off'}</span>
            </button>
          </div>
        </div>

        {/* Right / Bottom: Meeting Entry Credentials Form */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleJoin}
            className="rounded-3xl bg-white dark:bg-[#141416] border border-stone-200/80 dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-5"
          >
            <div>
              <h2 className="text-lg font-bold text-stone-900 dark:text-white">
                Enter Room Details
              </h2>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Join with a custom meeting ID or invitation code.
              </p>
            </div>

            {/* Meeting ID */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Meeting ID or Code *
              </label>
              <div className="relative">
                <Radio className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={meetingId}
                  onChange={(e) => setMeetingId(e.target.value)}
                  placeholder="e.g. cnx-789-234"
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-stone-900 dark:text-white font-mono focus:outline-none focus:border-stone-600 dark:focus:border-stone-400"
                />
              </div>
            </div>

            {/* Passcode */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Meeting Passcode (Optional)
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="4-digit code if required"
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-stone-900 dark:text-white font-mono focus:outline-none focus:border-stone-600 dark:focus:border-stone-400"
                />
              </div>
            </div>

            {/* User Joining As Pill */}
            <div className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 flex items-center gap-3">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover ring-1 ring-stone-400 dark:ring-stone-600"
              />
              <div className="text-xs">
                <span className="text-stone-400 block text-[10px]">Joining as:</span>
                <span className="font-semibold text-stone-800 dark:text-white">{user?.fullName || 'Virat Singh'}</span>
              </div>
            </div>

            {/* Join Button */}
            <button
              type="submit"
              disabled={!meetingId.trim()}
              className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white disabled:opacity-40 text-stone-50 dark:text-stone-950 text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Join Meeting Now</span>
            </button>
          </form>
        </div>
      </div>

      {/* Settings Modal */}
      <MeetingSettings
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
    </div>
  );
}
