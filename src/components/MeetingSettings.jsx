import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Mic,
  Video,
  Settings,
  Volume2,
  VolumeX,
  Sparkles,
  Sliders,
  Check,
  Play
} from 'lucide-react';
import AudioVisualizer from './AudioVisualizer';
import { useSound } from '../hooks/useSound';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../hooks/useAuth';

export default function MeetingSettings({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('audio');
  const { soundEnabled, toggleSound, playClick, playSuccess } = useSound();
  const { theme, toggleTheme } = useTheme();
  const { user, updateProfile } = useAuth();

  const [micDevice, setMicDevice] = useState('Built-in Microphone (Realtek Audio)');
  const [speakerDevice, setSpeakerDevice] = useState('Built-in Speakers (Realtek Audio)');
  const [volume, setVolume] = useState(85);
  const [cameraDevice, setCameraDevice] = useState('HD Integrated Webcam (1080p)');
  const [videoQuality, setVideoQuality] = useState('1080p');
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [virtualBackground, setVirtualBackground] = useState('blur');
  const [testingSpeaker, setTestingSpeaker] = useState(false);

  if (!isOpen) return null;

  const handleTestSpeaker = () => {
    setTestingSpeaker(true);
    playSuccess();
    setTimeout(() => setTestingSpeaker(false), 1200);
  };

  const tabs = [
    { id: 'audio', label: 'Audio', icon: Mic },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'general', label: 'General', icon: Settings }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white tracking-wide">Meeting Settings</h2>
          </div>
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/60 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  playClick();
                  setActiveTab(tab.id);
                }}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-semibold transition-colors ${
                  isActive
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-slate-300">
          {/* AUDIO TAB */}
          {activeTab === 'audio' && (
            <div className="space-y-6">
              {/* Microphone */}
              <div className="space-y-2">
                <label className="text-slate-400 font-medium">Microphone</label>
                <select
                  value={micDevice}
                  onChange={(e) => setMicDevice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option>Built-in Microphone (Realtek Audio)</option>
                  <option>USB Audio Codec (External Studio Mic)</option>
                  <option>Bluetooth Headset Hands-Free</option>
                </select>

                {/* Mic Level meter */}
                <div className="pt-2 flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-slate-400">Input level check:</span>
                  <AudioVisualizer isActive={true} barCount={20} />
                </div>
              </div>

              {/* Speaker & Volume */}
              <div className="space-y-3">
                <label className="text-slate-400 font-medium">Speaker Output</label>
                <div className="flex items-center gap-3">
                  <select
                    value={speakerDevice}
                    onChange={(e) => setSpeakerDevice(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option>Built-in Speakers (Realtek Audio)</option>
                    <option>Headphones (High Definition Audio)</option>
                    <option>External Display Audio (HDMI)</option>
                  </select>
                  <button
                    onClick={handleTestSpeaker}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 font-semibold transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{testingSpeaker ? 'Playing...' : 'Test'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <Volume2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    className="flex-1 accent-indigo-500 cursor-pointer"
                  />
                  <span className="font-mono text-slate-400 w-8 text-right">{volume}%</span>
                </div>
              </div>

              {/* AI Noise Suppression */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                <div className="space-y-0.5">
                  <p className="font-medium text-white">AI Background Noise Suppression</p>
                  <p className="text-[11px] text-slate-500">Filter out fans, dogs, keyboard clatter, and echo</p>
                </div>
                <button
                  onClick={() => setNoiseSuppression(!noiseSuppression)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    noiseSuppression ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      noiseSuppression ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* VIDEO TAB */}
          {activeTab === 'video' && (
            <div className="space-y-6">
              {/* Camera selection */}
              <div className="space-y-2">
                <label className="text-slate-400 font-medium">Camera</label>
                <select
                  value={cameraDevice}
                  onChange={(e) => setCameraDevice(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-indigo-500"
                >
                  <option>HD Integrated Webcam (1080p)</option>
                  <option>Logitech Brio 4K Stream Edition</option>
                  <option>Virtual Camera (OBS / Studio)</option>
                </select>
              </div>

              {/* Video Quality */}
              <div className="space-y-2">
                <label className="text-slate-400 font-medium">Sending Resolution</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Auto', '720p (HD)', '1080p (Full HD)'].map((q) => (
                    <button
                      key={q}
                      onClick={() => {
                        playClick();
                        setVideoQuality(q);
                      }}
                      className={`py-2 rounded-xl border text-center font-medium transition-all ${
                        videoQuality === q
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Video Preview Box */}
              <div className="space-y-2">
                <label className="text-slate-400 font-medium">Camera Preview</label>
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
                  <img
                    src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                    alt="Preview"
                    className="w-28 h-28 rounded-full object-cover ring-4 ring-indigo-500/30"
                  />
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] text-white">
                    Preview: {videoQuality}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-5">
              {/* UI Sound Effects Toggle */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2 text-white font-medium">
                    {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                    <span>UI Sound Effects</span>
                  </div>
                  <p className="text-[11px] text-slate-500">Play subtle audio chimes on join, leave, messages, and record events</p>
                </div>
                <button
                  onClick={() => {
                    playClick();
                    toggleSound();
                  }}
                  className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                    soundEnabled ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      soundEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Theme Preference */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="space-y-0.5">
                  <p className="font-medium text-white">Application Appearance</p>
                  <p className="text-[11px] text-slate-500">Currently active theme: <strong className="capitalize text-indigo-400">{theme}</strong></p>
                </div>
                <button
                  onClick={() => {
                    playClick();
                    toggleTheme();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium border border-slate-700 transition-colors"
                >
                  Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
                </button>
              </div>

              {/* Hardware Acceleration */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="space-y-0.5">
                  <p className="font-medium text-white">Hardware Video Acceleration</p>
                  <p className="text-[11px] text-slate-500">Use GPU to render multi-participant grids and 3D effects smoothly</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold text-[10px]">
                  Enabled
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              playClick();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
}
