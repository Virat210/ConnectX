import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Mic,
  Video,
  Volume2,
  VolumeX,
  Settings as SettingsIcon,
  Bell,
  Monitor,
  ShieldCheck,
  CheckCircle2,
  Play
} from 'lucide-react';
import AudioVisualizer from '../components/AudioVisualizer';
import { useSound } from '../hooks/useSound';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../context/ToastContext';

export default function Settings() {
  const { soundEnabled, toggleSound, playClick, playSuccess } = useSound();
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();

  const [micDevice, setMicDevice] = useState('Default Built-in Microphone');
  const [speakerDevice, setSpeakerDevice] = useState('Default System Speakers');
  const [cameraDevice, setCameraDevice] = useState('Integrated HD Webcam (1080p)');
  const [videoQuality, setVideoQuality] = useState('1080p');
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [mirrorVideo, setMirrorVideo] = useState(true);
  const [desktopNotifications, setDesktopNotifications] = useState(true);
  const [autoMuteOnJoin, setAutoMuteOnJoin] = useState(false);

  const handleSavePreferences = () => {
    playSuccess();
    addToast({
      title: 'Preferences Saved',
      description: 'Your hardware and audio settings have been updated.',
      type: 'success'
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-4 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
          System & Device Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure default audio input/output devices, camera streaming quality, and interface notifications.
        </p>
      </div>

      {/* Audio & Sound Preferences */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Audio & Sound Effects
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Microphone inputs, speaker outputs, and UI audio chimes
            </p>
          </div>
        </div>

        {/* UI Sounds Toggle */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white text-xs font-bold">
              {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              <span>Interactive UI Sound Effects</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Play subtle Web Audio chimes for joins, leaves, chat messages, and recordings
            </p>
          </div>
          <button
            onClick={() => {
              playClick();
              toggleSound();
            }}
            className={`w-12 h-6.5 flex items-center rounded-full p-1 transition-colors ${
              soundEnabled ? 'bg-indigo-600' : 'bg-slate-400 dark:bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4.5 h-4.5 rounded-full shadow-md transform transition-transform ${
                soundEnabled ? 'translate-x-5.5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Mic selection */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Microphone Device
          </label>
          <select
            value={micDevice}
            onChange={(e) => setMicDevice(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
          >
            <option>Default Built-in Microphone (Realtek Audio)</option>
            <option>External USB Microphone (Studio Codec)</option>
            <option>Bluetooth Headset Hands-Free Audio</option>
          </select>

          {/* Test meter */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80">
            <span className="text-xs text-slate-500">Microphone Input Waveform:</span>
            <AudioVisualizer isActive={true} barCount={20} className="w-40" />
          </div>
        </div>

        {/* AI Noise Suppression */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              AI Noise Cancellation
            </p>
            <p className="text-[11px] text-slate-500">Eliminate keyboard clicks and ambient noise</p>
          </div>
          <input
            type="checkbox"
            checked={noiseSuppression}
            onChange={(e) => setNoiseSuppression(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Video Preferences */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Video & Camera
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Camera feeds, resolution quality, and mirroring
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Default Camera
            </label>
            <select
              value={cameraDevice}
              onChange={(e) => setCameraDevice(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-indigo-500"
            >
              <option>Integrated HD Webcam (1080p)</option>
              <option>External Ultra-HD Web Camera (4K)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Max Stream Resolution
            </label>
            <div className="grid grid-cols-3 gap-3">
              {['Auto (Adaptive)', '720p (HD)', '1080p (Full HD)'].map((quality) => (
                <button
                  key={quality}
                  type="button"
                  onClick={() => {
                    playClick();
                    setVideoQuality(quality);
                  }}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                    videoQuality === quality
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow'
                      : 'bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {quality}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSavePreferences}
          className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </div>
    </div>
  );
}
