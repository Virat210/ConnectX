import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  Calendar,
  Clock,
  FileText,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useMeeting } from '../hooks/useMeeting';
import { useSound } from '../hooks/useSound';
import { meetingApi } from '../utils/api';

export default function CreateMeeting() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('11:00');
  const [duration, setDuration] = useState('45');
  const [requirePassword, setRequirePassword] = useState(true);

  // Created meeting state
  const [createdMeeting, setCreatedMeeting] = useState(null);
  const [copied, setCopied] = useState(false);

  const { addToast } = useToast();
  const { addScheduledMeeting } = useMeeting();
  const { playClick, playSuccess } = useSound();
  const navigate = useNavigate();

  const handleCreate = async (e) => {
    e.preventDefault();
    playClick();

    try {
      const scheduledDateTime = date && time ? new Date(`${date}T${time}:00`) : null;
      const meeting = await meetingApi.create({
        title: title || 'ConnectX Collaboration Session',
        description,
        scheduledAt: scheduledDateTime,
        durationMinutes: parseInt(duration, 10) || 45,
        requirePassword,
      });

      const meetingId = meeting.meetingId;
      const meetingLink = `${window.location.origin}/meeting/${meetingId}`;

      const newMeeting = {
        id: meetingId,
        title: meeting.title,
        description,
        date,
        time,
        duration: `${duration} mins`,
        durationMinutes: parseInt(duration, 10) || 45,
        passcode: meeting.passcode,
        link: meetingLink,
        status: 'Upcoming',
        participants: []
      };

      setCreatedMeeting(newMeeting);
      addScheduledMeeting(newMeeting);
      playSuccess();
      addToast({
        title: 'Meeting Scheduled!',
        description: `Room ${meetingId} is ready to share.`,
        type: 'success'
      });
    } catch (err) {
      addToast({
        title: 'Error Creating Meeting',
        description: err.message || 'Could not schedule meeting. Please try again.',
        type: 'error'
      });
    }
  };

  const handleCopyLink = () => {
    if (!createdMeeting) return;
    navigator.clipboard.writeText(createdMeeting.link);
    setCopied(true);
    playSuccess();
    addToast({
      title: 'Meeting link copied!',
      description: 'Share this link with your participants.',
      type: 'copy'
    });
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto py-4 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-stone-900 dark:text-white tracking-tight">
          Create a New Meeting
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
          Set up an instant conference or schedule an encrypted meeting for your team.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {!createdMeeting ? (
          /* ================= CREATION FORM ================= */
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            onSubmit={handleCreate}
            className="rounded-3xl bg-white dark:bg-[#141416] border border-stone-200/80 dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-6"
          >
            {/* Title */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Meeting Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Design Architecture Review & Roadmap Sync"
                className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-stone-600 dark:focus:border-stone-400"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                Description / Agenda (Optional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add meeting agenda, discussion topics, or reference links..."
                className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-stone-600 dark:focus:border-stone-400"
              />
            </div>

            {/* Date, Time, Duration Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-800 rounded-xl pl-10 pr-3 py-2 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-stone-600 dark:focus:border-stone-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Start Time
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-800 rounded-xl pl-10 pr-3 py-2 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-stone-600 dark:focus:border-stone-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Duration
                </label>
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-white focus:outline-none focus:border-stone-600 dark:focus:border-stone-400 cursor-pointer"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                </select>
              </div>
            </div>

            {/* Security Options */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={requirePassword}
                  onChange={(e) => setRequirePassword(e.target.checked)}
                  className="w-4 h-4 rounded border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-950 text-stone-900 focus:ring-stone-400"
                />
                <span className="text-xs text-stone-700 dark:text-stone-300 font-medium">
                  Require 4-digit passcode for entry
                </span>
              </label>
            </div>

            {/* Submit Action */}
            <div className="pt-4 flex items-center justify-end gap-3">
              <Link
                to="/dashboard"
                onClick={playClick}
                className="px-4 py-2 rounded-xl border border-stone-300 dark:border-stone-700 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-950 text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-2"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Create Meeting</span>
              </button>
            </div>
          </motion.form>
        ) : (
          /* ================= CREATION SUCCESS SCREEN ================= */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="rounded-3xl bg-white dark:bg-[#141416] border border-emerald-500/30 p-8 shadow-xl space-y-6 text-center sm:text-left"
          >
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Check className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-900 dark:text-white">
                  Meeting Created Successfully!
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                  Your room is generated and ready for attendees.
                </p>
              </div>
            </div>

            {/* Meeting Details Box */}
            <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800/80 space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-stone-200 dark:border-stone-800">
                <span className="text-stone-500">Meeting Title:</span>
                <span className="font-bold text-stone-900 dark:text-white">{createdMeeting.title}</span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-stone-200 dark:border-stone-800">
                <span className="text-stone-500">Meeting ID:</span>
                <span className="font-mono font-bold text-stone-900 dark:text-stone-100 text-sm">
                  {createdMeeting.id}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-stone-200 dark:border-stone-800">
                <span className="text-stone-500">Security Passcode:</span>
                <span className="font-mono font-bold text-stone-900 dark:text-stone-200">
                  {createdMeeting.passcode}
                </span>
              </div>

              <div>
                <span className="text-stone-500 block mb-1.5">Sharable Link:</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={createdMeeting.link}
                    className="flex-1 bg-white dark:bg-[#141416] border border-stone-300 dark:border-stone-800 rounded-xl px-3 py-2 text-xs font-mono text-stone-800 dark:text-stone-200 focus:outline-none"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-950 font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <button
                onClick={() => {
                  playClick();
                  setCreatedMeeting(null);
                  setTitle('');
                  setDescription('');
                }}
                className="text-xs text-stone-500 dark:text-stone-400 hover:underline cursor-pointer"
              >
                ← Schedule Another Meeting
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link
                  to={`/meeting/${createdMeeting.id}`}
                  onClick={playClick}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-950 text-xs font-bold shadow-md transition-all"
                >
                  <Video className="w-4 h-4" />
                  <span>Enter Meeting Room Now</span>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
