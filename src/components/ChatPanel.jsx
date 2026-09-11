import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Smile, Paperclip, FileText, CheckCheck } from 'lucide-react';
import { useMeeting } from '../hooks/useMeeting';
import { useSound } from '../hooks/useSound';

export default function ChatPanel({ isOpen, onClose }) {
  const { messages, sendMessage } = useMeeting();
  const { playClick } = useSound();
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [mockAttachment, setMockAttachment] = useState(null);
  const messagesEndRef = useRef(null);

  const emojis = ['👍', '🎉', '❤️', '🚀', '💯', '✨', '👏', '🤝'];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!inputText.trim() && !mockAttachment) return;
    playClick();
    sendMessage(inputText, mockAttachment);
    setInputText('');
    setMockAttachment(null);
    setShowEmojiPicker(false);
  };

  const handleAttachMock = () => {
    playClick();
    setMockAttachment({
      name: 'Sprint_Design_Specs_v3.pdf',
      size: '1.8 MB'
    });
  };

  if (!isOpen) return null;

  return (
    <motion.aside
      initial={{ x: 340, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 340, opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 220 }}
      className="w-full sm:w-96 h-full bg-slate-900 border-l border-slate-800 flex flex-col z-30 shadow-2xl shrink-0"
    >
      {/* Header */}
      <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide">In-Call Messages</h2>
          <p className="text-[11px] text-slate-400">Messages are visible to everyone</p>
        </div>
        <button
          onClick={() => {
            playClick();
            onClose();
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          aria-label="Close Chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}
          >
            {/* Sender Meta */}
            <div className="flex items-center gap-2 mb-1 px-1">
              {!msg.isMe && (
                <img
                  src={msg.senderAvatar}
                  alt={msg.senderName}
                  className="w-4 h-4 rounded-full object-cover"
                />
              )}
              <span className="text-xs font-medium text-slate-300">{msg.senderName}</span>
              <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed break-words shadow-md ${
                msg.isMe
                  ? 'bg-indigo-600 text-white rounded-tr-xs'
                  : 'bg-slate-800 text-slate-100 border border-slate-700/80 rounded-tl-xs'
              }`}
            >
              {msg.content}

              {/* Attachment if present */}
              {msg.attachment && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-black/25 border border-white/10 flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-medium text-white truncate">{msg.attachment.name}</p>
                    <p className="text-[10px] text-slate-300">{msg.attachment.size}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Preview Box */}
      {mockAttachment && (
        <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-xs text-indigo-300">
          <div className="flex items-center gap-2 truncate">
            <Paperclip className="w-3.5 h-3.5" />
            <span className="truncate">{mockAttachment.name}</span>
          </div>
          <button
            onClick={() => setMockAttachment(null)}
            className="text-slate-400 hover:text-white ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Emoji Picker Popup */}
      <AnimatePresence>
        {showEmojiPicker && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center gap-2 flex-wrap"
          >
            {emojis.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => {
                  setInputText((prev) => prev + e);
                  setShowEmojiPicker(false);
                }}
                className="text-base p-1 hover:scale-125 transition-transform"
              >
                {e}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Footer */}
      <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800">
        <div className="relative flex items-center bg-slate-900 border border-slate-700/80 rounded-2xl px-3 py-1.5 focus-within:border-indigo-500 transition-colors">
          <button
            type="button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-slate-400 hover:text-indigo-400 p-1.5 rounded-lg transition-colors"
            title="Emoji"
          >
            <Smile className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleAttachMock}
            className="text-slate-400 hover:text-indigo-400 p-1.5 rounded-lg transition-colors"
            title="Attach file"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Send a message..."
            className="flex-1 bg-transparent px-2 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputText.trim() && !mockAttachment}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition-all shadow-md"
            title="Send"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </motion.aside>
  );
}
