import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Video, Clock, Users, Copy, Download, ArrowRight, Check } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useSound } from '../hooks/useSound';

export default function MeetingCard({ meeting, type = 'scheduled', onAction }) {
  const [copied, setCopied] = useState(false);
  const { addToast } = useToast();
  const { playClick, playSuccess } = useSound();

  const handleCopyLink = (e) => {
    e.stopPropagation();
    const link = `${window.location.origin}/meeting/${meeting.id}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    playSuccess();
    addToast({
      title: 'Meeting Link Copied!',
      description: `Link for "${meeting.title || meeting.name}" copied to clipboard.`,
      type: 'copy'
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const statusColors = {
    Upcoming: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    Scheduled: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25',
    Completed: 'bg-stone-200/60 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 border-stone-300/50 dark:border-stone-700/50',
    Recorded: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30'
  };

  return (
    <div className="group relative rounded-2xl bg-white dark:bg-[#141416] border border-stone-200/80 dark:border-white/10 p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      {/* Top Meta row */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusColors[meeting.status] || statusColors.Completed}`}>
            {meeting.status}
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-stone-500 dark:text-stone-400 font-mono">
            <span>ID: {meeting.id}</span>
            <button
              onClick={handleCopyLink}
              className="p-1 hover:text-stone-900 dark:hover:text-white transition-colors rounded cursor-pointer"
              title="Copy Meeting Link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-sm font-bold text-stone-900 dark:text-white transition-colors line-clamp-1">
          {meeting.title || meeting.name}
        </h3>
        {meeting.description && (
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 line-clamp-2 leading-relaxed">
            {meeting.description}
          </p>
        )}
      </div>

      {/* Middle Info Stats */}
      <div className="my-4 pt-3 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-stone-400" />
          <span>{meeting.date} {meeting.time ? `• ${meeting.time}` : ''}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-stone-700 dark:text-stone-300">{meeting.duration}</span>
        </div>
      </div>

      {/* Bottom Footer: Participants Stack & Action Button */}
      <div className="flex items-center justify-between gap-3 pt-2">
        {/* Avatars */}
        <div className="flex items-center -space-x-2 overflow-hidden">
          {meeting.participants?.slice(0, 4).map((p, idx) => (
            <img
              key={idx}
              src={p.avatar}
              alt={p.name}
              title={p.name}
              className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-stone-900 object-cover"
            />
          ))}
          {meeting.participants?.length > 4 && (
            <div className="inline-flex items-center justify-center h-7 w-7 rounded-full ring-2 ring-white dark:ring-stone-900 bg-stone-200 dark:bg-stone-800 text-[10px] font-bold text-stone-700 dark:text-stone-300">
              +{meeting.participants.length - 4}
            </div>
          )}
        </div>

        {/* Action button */}
        {type === 'scheduled' || meeting.status === 'Upcoming' ? (
          <Link
            to={`/meeting/${meeting.id}`}
            onClick={playClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-950 text-xs font-bold shadow-sm transition-all"
          >
            <Video className="w-3.5 h-3.5" />
            <span>Join</span>
          </Link>
        ) : meeting.hasRecording ? (
          <button
            onClick={() => {
              playClick();
              if (onAction) onAction(meeting);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 hover:border-stone-800 dark:hover:border-stone-300 text-stone-700 dark:text-stone-300 text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Recording ({meeting.recordingSize})</span>
          </button>
        ) : (
          <button
            onClick={() => {
              playClick();
              if (onAction) onAction(meeting);
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white font-medium hover:underline cursor-pointer"
          >
            <span>Details</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}
