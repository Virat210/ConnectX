import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Copy, 
  Radio, 
  ScreenShare, 
  Hand, 
  MessageSquare, 
  UserPlus, 
  UserMinus,
  X 
} from 'lucide-react';
import { useSound } from '../hooks/useSound';

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const { playSuccess, playClick } = useSound();

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ 
    title, 
    description, 
    type = 'info', 
    duration = 4000, 
    sound = true 
  }) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);

    if (sound && (type === 'success' || type === 'copy')) {
      playSuccess();
    }

    setToasts((prev) => [...prev, { id, title, description, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [playSuccess, removeToast]);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
      case 'copy':
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
      case 'recording':
        return <Radio className="w-5 h-5 text-rose-500 animate-pulse shrink-0" />;
      case 'screenshare':
        return <ScreenShare className="w-5 h-5 text-indigo-400 shrink-0" />;
      case 'hand':
        return <Hand className="w-5 h-5 text-amber-400 shrink-0" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-blue-400 shrink-0" />;
      case 'join':
        return <UserPlus className="w-5 h-5 text-emerald-400 shrink-0" />;
      case 'leave':
        return <UserMinus className="w-5 h-5 text-slate-400 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-indigo-400 shrink-0" />;
    }
  };

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Fixed Toast Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="pointer-events-auto flex items-start gap-3 p-4 rounded-xl bg-slate-900/95 dark:bg-slate-900/95 text-slate-100 border border-slate-700/60 shadow-2xl backdrop-blur-xl"
            >
              {getIcon(toast.type)}
              <div className="flex-1 min-w-0 pr-1">
                <p className="text-sm font-semibold text-white tracking-wide">{toast.title}</p>
                {toast.description && (
                  <p className="text-xs text-slate-300/90 mt-0.5 leading-relaxed">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => {
                  playClick();
                  removeToast(toast.id);
                }}
                className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
