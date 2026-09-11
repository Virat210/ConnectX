import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMeeting } from '../hooks/useMeeting';
import { useSound } from '../hooks/useSound';

const REACTIONS = [
  { emoji: '👍', label: 'Thumbs Up' },
  { emoji: '👏', label: 'Applause' },
  { emoji: '❤️', label: 'Heart' },
  { emoji: '🎉', label: 'Celebration' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '💡', label: 'Idea' }
];

export default function ReactionPicker({ isOpen, onClose }) {
  const { addReaction } = useMeeting();
  const { playSuccess, playClick } = useSound();

  const handleSelect = (emoji) => {
    playClick();
    addReaction(emoji);
    if (onClose) onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 z-50 p-2 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-2xl backdrop-blur-xl flex items-center gap-1.5"
        >
          {REACTIONS.map(({ emoji, label }) => (
            <motion.button
              key={emoji}
              whileHover={{ scale: 1.25, y: -4 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleSelect(emoji)}
              className="w-10 h-10 flex items-center justify-center text-xl rounded-xl hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
              title={label}
              aria-label={label}
            >
              {emoji}
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
