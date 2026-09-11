import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  Search,
  Download,
  Eye,
  Calendar,
  Clock,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldCheck
} from 'lucide-react';
import { useMeeting } from '../hooks/useMeeting';
import { useToast } from '../context/ToastContext';
import { useSound } from '../hooks/useSound';

export default function MeetingHistory() {
  const { recentMeetings } = useMeeting();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const { addToast } = useToast();
  const { playClick, playSuccess } = useSound();

  const handleDownload = (meeting) => {
    playSuccess();
    addToast({
      title: 'Downloading Recording',
      description: `Saved "${meeting.name}.mp4" (${meeting.recordingSize || '250 MB'}) to your device.`,
      type: 'success'
    });
  };

  const handleViewDetails = (meeting) => {
    playClick();
    setSelectedMeeting(meeting);
  };

  // Filtering
  const meetingsList = recentMeetings || [];
  const filtered = meetingsList.filter((m) => {
    const matchesSearch =
      m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedMeetings = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const statusBadge = (status) => {
    switch (status) {
      case 'Recorded':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
            Recorded
          </span>
        );
      case 'Completed':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300/60 dark:border-stone-700/60">
            Completed
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-200/70 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-300/60 dark:border-stone-700/60">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-4 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-display text-stone-900 dark:text-white tracking-tight">
          Meeting History & Archives
        </h1>
        <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
          Review past video conferences, attendee rosters, and download cloud recordings.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#141416] border border-stone-200/80 dark:border-white/10 shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by name or ID..."
            className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-800 rounded-xl pl-10 pr-4 py-2 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-stone-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <span className="text-xs text-stone-500 hidden sm:inline">Filter by:</span>
          <select
            value={statusFilter}
            onChange={(e) => {
              playClick();
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-700 dark:text-stone-300 focus:outline-none cursor-pointer"
          >
            <option value="All">All Meetings</option>
            <option value="Recorded">Recorded Only</option>
            <option value="Completed">Completed Only</option>
          </select>
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-3xl bg-white dark:bg-[#141416] border border-stone-200/80 dark:border-white/10 shadow-sm overflow-hidden">
        {paginatedMeetings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/75 dark:bg-stone-950/50 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Meeting Name</th>
                  <th className="py-4 px-6">Date & Time</th>
                  <th className="py-4 px-6">Duration</th>
                  <th className="py-4 px-6">Attendees</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60 text-xs">
                {paginatedMeetings.map((meeting) => (
                  <tr
                    key={meeting.id}
                    className="hover:bg-stone-50/75 dark:hover:bg-stone-800/40 transition-colors"
                  >
                    {/* Name & ID */}
                    <td className="py-4 px-6">
                      <p className="font-bold text-stone-900 dark:text-white leading-tight">
                        {meeting.name}
                      </p>
                      <p className="font-mono text-[11px] text-stone-400 mt-0.5">{meeting.id}</p>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-6 text-stone-600 dark:text-stone-300">
                      {meeting.date}
                    </td>

                    {/* Duration */}
                    <td className="py-4 px-6 font-medium text-stone-700 dark:text-stone-200">
                      {meeting.duration}
                    </td>

                    {/* Participants Avatars */}
                    <td className="py-4 px-6">
                      <div className="flex items-center -space-x-2">
                        {meeting.participants?.map((p, i) => (
                          <img
                            key={i}
                            src={p.avatar}
                            alt={p.name}
                            title={p.name}
                            className="w-7 h-7 rounded-full object-cover ring-2 ring-white dark:ring-stone-900"
                          />
                        ))}
                        <span className="text-[11px] text-stone-400 pl-3">
                          {meeting.participantsCount || meeting.participants?.length || 1} joined
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      {statusBadge(meeting.status)}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleViewDetails(meeting)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-semibold transition-colors cursor-pointer"
                        title="View meeting details"
                      >
                        <Eye className="w-3.5 h-3.5 text-stone-500" />
                        <span>Details</span>
                      </button>

                      {meeting.hasRecording && (
                        <button
                          onClick={() => handleDownload(meeting)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-950 font-bold transition-all shadow cursor-pointer"
                          title="Download MP4 Cloud Recording"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>MP4</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Polished Empty State */
          <div className="p-16 text-center space-y-3.5">
            <div className="w-14 h-14 mx-auto rounded-3xl bg-stone-100 dark:bg-stone-800/80 border border-stone-200/60 dark:border-stone-700/60 flex items-center justify-center text-stone-400 dark:text-stone-500">
              <History className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-stone-900 dark:text-white">
                No meeting logs available
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Your past call history, duration records, and cloud recordings will be archived here automatically.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-950 text-xs font-bold shadow-sm transition-all"
            >
              <span>Back to Dashboard</span>
            </Link>
          </div>
        )}

        {/* Pagination Footer */}
        {filtered.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs text-stone-500">
            <span>
              Showing {Math.min(filtered.length, (currentPage - 1) * itemsPerPage + 1)} to{' '}
              {Math.min(filtered.length, currentPage * itemsPerPage)} of {filtered.length} entries
            </span>

            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => {
                  playClick();
                  setCurrentPage((p) => Math.max(1, p - 1));
                }}
                className="p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 disabled:opacity-30 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-2 font-medium text-stone-700 dark:text-stone-300">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => {
                  playClick();
                  setCurrentPage((p) => Math.min(totalPages, p + 1));
                }}
                className="p-1.5 rounded-lg border border-stone-300 dark:border-stone-700 disabled:opacity-30 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Meeting Details Modal */}
      <AnimatePresence>
        {selectedMeeting && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-white dark:bg-[#141416] border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-2xl space-y-6 text-xs"
            >
              <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800">
                <div>
                  <h3 className="text-base font-bold text-stone-900 dark:text-white">
                    {selectedMeeting.name}
                  </h3>
                  <p className="text-[11px] font-mono text-stone-500">ID: {selectedMeeting.id}</p>
                </div>
                <button
                  onClick={() => setSelectedMeeting(null)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between py-1.5 border-b border-stone-100 dark:border-stone-800">
                  <span className="text-stone-500">Recorded Date:</span>
                  <span className="font-semibold text-stone-800 dark:text-white">{selectedMeeting.date}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-100 dark:border-stone-800">
                  <span className="text-stone-500">Call Duration:</span>
                  <span className="font-semibold text-stone-800 dark:text-white">{selectedMeeting.duration}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-100 dark:border-stone-800">
                  <span className="text-stone-500">Peak Attendance:</span>
                  <span className="font-semibold text-stone-800 dark:text-white">{selectedMeeting.participantsCount || selectedMeeting.participants?.length || 1} attendees</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-stone-100 dark:border-stone-800">
                  <span className="text-stone-500">Encryption Level:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> AES-256 E2EE Mesh
                  </span>
                </div>
                {selectedMeeting.hasRecording && (
                  <div className="flex justify-between py-1.5 border-b border-stone-100 dark:border-stone-800">
                    <span className="text-stone-500">Archive File Size:</span>
                    <span className="font-semibold text-amber-700 dark:text-amber-400">{selectedMeeting.recordingSize}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end gap-3">
                {selectedMeeting.hasRecording && (
                  <button
                    onClick={() => {
                      handleDownload(selectedMeeting);
                      setSelectedMeeting(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-950 font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Recording</span>
                  </button>
                )}
                <button
                  onClick={() => setSelectedMeeting(null)}
                  className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
