import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Video,
  LogIn,
  Calendar,
  Clock,
  Search,
  Plus,
  Play,
  ArrowRight
} from 'lucide-react';
import MeetingCard from '../components/MeetingCard';
import { useAuth } from '../hooks/useAuth';
import { useMeeting } from '../hooks/useMeeting';
import { useToast } from '../context/ToastContext';
import { useSound } from '../hooks/useSound';
import { meetingApi } from '../utils/api';

export default function Dashboard() {
  const { user } = useAuth();
  const { scheduledMeetings, recentMeetings, addRecentMeeting } = useMeeting();
  const { addToast } = useToast();
  const { playClick } = useSound();
  const navigate = useNavigate();

  // Search, filter, and sort state for Recent Meetings
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Quick join input state inside quick action
  const [quickJoinId, setQuickJoinId] = useState('');

  const handleStartInstantMeeting = async () => {
    playClick();
    try {
      const meeting = await meetingApi.create({
        title: `${user?.name || 'User'}'s Instant Meeting`,
      });
      addToast({
        title: 'Starting Instant Meeting',
        description: `Launching room ${meeting.meetingId}`,
        type: 'success'
      });
      navigate(`/meeting/${meeting.meetingId}`);
    } catch (err) {
      addToast({
        title: 'Error Creating Meeting',
        description: err.message || 'Could not create meeting. Please try again.',
        type: 'error'
      });
    }
  };

  const handleQuickJoin = (e) => {
    e.preventDefault();
    if (!quickJoinId.trim()) return;
    playClick();
    navigate(`/meeting/${quickJoinId.trim()}`);
  };

  // Filter and sort recent meetings
  const filteredRecent = (recentMeetings || [])
    .filter((m) => {
      const matchesSearch =
        m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.isoDate || 0) - new Date(a.isoDate || 0);
      if (sortBy === 'oldest') return new Date(a.isoDate || 0) - new Date(b.isoDate || 0);
      if (sortBy === 'duration') return (b.durationMinutes || 0) - (a.durationMinutes || 0);
      return 0;
    });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ================= QUICK ACTIONS ================= */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Quick Action 1: New Meeting (Obsidian & Warm Champagne Highlight) */}
        <motion.div
          whileHover={{ y: -3 }}
          className="relative overflow-hidden rounded-3xl bg-stone-900 dark:bg-[#141416] border border-stone-800 dark:border-white/10 p-6 sm:p-8 text-white shadow-xl group transition-all duration-200"
        >
          {/* Ambient Warm Glow */}
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col justify-between h-full space-y-6">
            <div className="flex items-center justify-between">
              <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
                <Video className="w-6 h-6 text-amber-400" />
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider bg-amber-500/15 text-amber-300 uppercase border border-amber-500/30">
                Instant Room
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold font-display tracking-tight text-white">
                New Meeting
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 mt-1 leading-relaxed">
                Start an encrypted instant meeting with 1-click or schedule an upcoming discussion.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleStartInstantMeeting}
                className="px-5 py-2.5 rounded-xl bg-white text-stone-950 hover:bg-stone-100 font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Now</span>
              </button>

              <Link
                to="/create-meeting"
                onClick={playClick}
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-semibold text-xs transition-colors"
              >
                Schedule for Later
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Quick Action 2: Join Meeting */}
        <motion.div
          whileHover={{ y: -3 }}
          className="relative overflow-hidden rounded-3xl bg-white dark:bg-[#141416] border border-stone-200/80 dark:border-white/10 p-6 sm:p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
        >
          <div className="relative z-10 space-y-6">
            <div className="flex items-center justify-between">
              <div className="w-13 h-13 rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/60 flex items-center justify-center text-stone-800 dark:text-stone-200">
                <LogIn className="w-6 h-6" />
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 uppercase">
                Direct Connect
              </span>
            </div>

            <div>
              <h2 className="text-2xl font-bold font-display tracking-tight text-stone-900 dark:text-white">
                Join Meeting
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                Enter an invitation code or meeting ID to join an active collaborative session.
              </p>
            </div>

            <form onSubmit={handleQuickJoin} className="flex gap-2.5 pt-2">
              <input
                type="text"
                value={quickJoinId}
                onChange={(e) => setQuickJoinId(e.target.value)}
                placeholder="e.g. cnx-789-234"
                className="flex-1 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-800 rounded-xl px-4 py-2.5 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-stone-600 dark:focus:border-stone-400 font-mono"
              />
              <button
                type="submit"
                disabled={!quickJoinId.trim()}
                className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white disabled:opacity-40 text-stone-50 dark:text-stone-950 text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                Join
              </button>
            </form>
          </div>
        </motion.div>
      </section>

      {/* ================= SCHEDULED MEETINGS ================= */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold font-display text-stone-900 dark:text-white">
              Upcoming Scheduled Meetings
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Your next scheduled discussions and collaborative calls
            </p>
          </div>
          <Link
            to="/create-meeting"
            onClick={playClick}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-800 dark:text-stone-200 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule New</span>
          </Link>
        </div>

        {scheduledMeetings && scheduledMeetings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {scheduledMeetings.map((meeting) => (
              <MeetingCard key={meeting.id} meeting={meeting} type="scheduled" />
            ))}
          </div>
        ) : (
          /* Polished Clean Empty State */
          <div className="p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-[#141416] border border-stone-200/80 dark:border-white/10 space-y-3.5 shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200/60 dark:border-stone-700/60 flex items-center justify-center text-stone-400 dark:text-stone-500">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                No scheduled meetings
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                You have no upcoming meetings on your calendar. Create an instant room or schedule one for later.
              </p>
            </div>
            <Link
              to="/create-meeting"
              onClick={playClick}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-950 text-xs font-bold shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Schedule a Meeting</span>
            </Link>
          </div>
        )}
      </section>

      {/* ================= RECENT MEETINGS ================= */}
      <section className="space-y-4 pt-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold font-display text-stone-900 dark:text-white">
              Recent Meeting Activity
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Past conversations, attendance records, and recorded calls
            </p>
          </div>

          {/* Search, Filter, and Sort Controls (Only active if there are meetings or an active query) */}
          {(recentMeetings?.length > 0 || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search meetings..."
                  className="w-44 sm:w-56 bg-white dark:bg-[#141416] border border-stone-200 dark:border-stone-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-stone-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => {
                  playClick();
                  setStatusFilter(e.target.value);
                }}
                className="bg-white dark:bg-[#141416] border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-700 dark:text-stone-300 focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="Completed">Completed</option>
                <option value="Recorded">Recorded</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => {
                  playClick();
                  setSortBy(e.target.value);
                }}
                className="bg-white dark:bg-[#141416] border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-1.5 text-xs text-stone-700 dark:text-stone-300 focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="duration">Longest Duration</option>
              </select>
            </div>
          )}
        </div>

        {/* Meeting Cards List or Empty State */}
        {filteredRecent.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRecent.map((meeting) => (
              <MeetingCard
                key={meeting.id}
                meeting={meeting}
                type="recent"
                onAction={(m) => {
                  if (m.hasRecording) {
                    addToast({
                      title: 'Downloading Recording...',
                      description: `Saved ${m.name} (${m.recordingSize}) to downloads.`,
                      type: 'success'
                    });
                  } else {
                    navigate(`/history`);
                  }
                }}
              />
            ))}
          </div>
        ) : recentMeetings?.length > 0 ? (
          /* Filter No Match */
          <div className="p-12 text-center rounded-3xl bg-white dark:bg-[#141416] border border-stone-200/80 dark:border-white/10 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-stone-800 dark:text-stone-200">
              No meetings found
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              We couldn't find any meetings matching "{searchQuery}". Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          /* Polished Empty State for Zero Meetings */
          <div className="p-8 sm:p-12 text-center rounded-3xl bg-white dark:bg-[#141416] border border-stone-200/80 dark:border-white/10 space-y-3.5 shadow-sm">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200/60 dark:border-stone-700/60 flex items-center justify-center text-stone-400 dark:text-stone-500">
              <Clock className="w-6 h-6" />
            </div>
            <div className="space-y-1 max-w-md mx-auto">
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                No meetings yet
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Your upcoming and recent meetings will appear here once you host or participate in a call.
              </p>
            </div>
            <button
              onClick={handleStartInstantMeeting}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-950 text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start an Instant Meeting</span>
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
