import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Video,
  LogIn,
  ScreenShare,
  MessageSquare,
  Radio,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import NetworkMesh3D from '../components/NetworkMesh3D';
import { useSound } from '../hooks/useSound';

export default function Home() {
  const { playClick } = useSound();

  const features = [
    {
      icon: Video,
      title: 'HD Video Calls',
      description: 'Ultra-low latency, crystal-clear 1080p and 4K adaptive video streaming powered by intelligent mesh routing.',
      badge: 'Adaptive Bitrate'
    },
    {
      icon: ScreenShare,
      title: 'Screen Sharing',
      description: 'Share displays, browser tabs, code editors, and high-framerate presentations with instant presenter switching.',
      badge: '60 FPS'
    },
    {
      icon: MessageSquare,
      title: 'Interactive In-Call Chat',
      description: 'Communicate seamlessly with file attachments, expressive emoji reactions, and persistent meeting transcripts.',
      badge: 'Rich Media'
    },
    {
      icon: Radio,
      title: 'Cloud Recording',
      description: 'Capture critical engineering decisions and client walkthroughs with automatic cloud recording & rapid download.',
      badge: 'Instant Archiving'
    },
    {
      icon: ShieldCheck,
      title: 'Enterprise Security',
      description: 'End-to-end encryption standards, passcode protection, host participant moderation, and zero tracking.',
      badge: 'Encrypted'
    },
    {
      icon: Zap,
      title: 'Browser Native Speed',
      description: 'Instant meeting launch directly in your browser. Zero software downloads, heavy installations, or plugins required.',
      badge: 'No Download'
    }
  ];

  const steps = [
    {
      num: '01',
      title: 'Create',
      desc: 'Generate an instant meeting room or schedule for later in just one click.'
    },
    {
      num: '02',
      title: 'Invite',
      desc: 'Share your encrypted meeting link or custom meeting code with teammates.'
    },
    {
      num: '03',
      title: 'Connect',
      desc: 'Collaborate with high-definition audio, video, screen share, and reactions.'
    }
  ];

  return (
    <div className="relative overflow-hidden">
      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[92vh] flex items-center justify-center pt-28 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Three.js Interactive 3D Constellation Mesh */}
        <NetworkMesh3D count={48} maxDistance={4} className="opacity-60 dark:opacity-75" />

        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/8 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto w-full text-center relative z-10">
          {/* Top Pill Announcement */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs font-semibold text-stone-700 dark:text-stone-300 mb-8 shadow-sm backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Introducing ConnectX 2.0 • Ultra-Low Latency Collaboration</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-stone-900 dark:text-white font-display leading-[1.12]"
          >
            Connect. Communicate.{' '}
            <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 dark:from-amber-400 dark:via-amber-300 dark:to-yellow-400 bg-clip-text text-transparent">
              Collaborate.
            </span>
          </motion.h1>

          {/* Supporting Text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 text-base sm:text-xl text-stone-600 dark:text-stone-300 max-w-2xl mx-auto leading-relaxed"
          >
            A smarter way to meet, communicate, and collaborate with your team from anywhere in the world.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/create-meeting"
              onClick={playClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold text-stone-50 dark:text-stone-950 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white shadow-lg transition-all duration-200"
            >
              <Video className="w-5 h-5" />
              <span>Create Meeting</span>
            </Link>

            <Link
              to="/join-meeting"
              onClick={playClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold text-stone-800 dark:text-stone-200 bg-white dark:bg-[#141416] hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-300 dark:border-stone-800 shadow-sm transition-all duration-200"
            >
              <LogIn className="w-5 h-5" />
              <span>Join Meeting</span>
            </Link>
          </motion.div>

          {/* Feature Highlights Pill Bar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.45 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-stone-500 dark:text-stone-400 font-medium"
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free up to 100 participants
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> End-to-end encryption
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Zero installation required
            </span>
          </motion.div>

          {/* Visual Representation of Floating Video Conference */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-16 relative mx-auto max-w-4xl"
          >
            {/* Outer Glow */}
            <div className="absolute -inset-1 rounded-3xl bg-amber-500/10 blur-xl pointer-events-none" />

            {/* Floating Conference Interface Container */}
            <div className="relative rounded-3xl bg-stone-950 border border-stone-800 p-3 sm:p-5 shadow-2xl backdrop-blur-2xl text-left overflow-hidden">
              {/* Top Window Bar */}
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-stone-800/80 px-2">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-stone-400 ml-2">
                    ConnectX Live Room • cnx-789-234
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[11px] font-mono font-semibold">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    REC 12:45
                  </span>
                </div>
              </div>

              {/* Floating Participant Grid Mock */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3">
                {[
                  {
                    name: 'Virat Singh',
                    role: 'Host',
                    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
                    isSpeaking: true,
                    reaction: '🔥'
                  },
                  {
                    name: 'Design Lead',
                    role: 'Co-Host',
                    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
                    isSpeaking: false,
                    reaction: '👍'
                  },
                  {
                    name: 'Frontend Architect',
                    role: 'Participant',
                    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
                    isSpeaking: false,
                    reaction: null
                  },
                  {
                    name: 'Product Manager',
                    role: 'Participant',
                    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
                    isSpeaking: false,
                    reaction: '❤️'
                  },
                  {
                    name: 'Infrastructure Lead',
                    role: 'Participant',
                    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
                    isSpeaking: false,
                    reaction: null
                  },
                  {
                    name: 'Security Officer',
                    role: 'Participant',
                    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
                    isSpeaking: false,
                    reaction: '👏'
                  }
                ].map((attendee, i) => (
                  <div
                    key={i}
                    className={`relative rounded-2xl overflow-hidden bg-stone-900 border aspect-video flex flex-col items-center justify-center p-3 transition-all ${
                      attendee.isSpeaking
                        ? 'border-amber-500 speaker-active-border'
                        : 'border-stone-800'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={attendee.avatar}
                        alt={attendee.name}
                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover ring-2 ring-stone-700"
                      />
                      {attendee.reaction && (
                        <span className="absolute -top-1 -right-1 text-base animate-bounce">
                          {attendee.reaction}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between w-full px-1">
                      <span className="text-[11px] font-medium text-stone-200 truncate max-w-[80%]">
                        {attendee.name}
                      </span>
                      {attendee.isSpeaking && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= FEATURES SECTION ================= */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#f7f5f0]/60 dark:bg-[#101012]/60 border-y border-stone-200/80 dark:border-white/10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-3">
              Core Capabilities
            </h2>
            <p className="text-3xl sm:text-5xl font-extrabold text-stone-900 dark:text-white font-display tracking-tight">
              Engineered for seamless enterprise communication.
            </p>
            <p className="mt-4 text-sm sm:text-base text-stone-600 dark:text-stone-400">
              Every feature designed with precision to keep your conversations fluid, secure, and productive.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, index) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="rounded-3xl bg-white dark:bg-[#141416] border border-stone-200/80 dark:border-white/10 p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-center text-stone-800 dark:text-stone-200 group-hover:scale-105 transition-transform">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-stone-900 dark:text-white mb-2 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-3">
              Workflow
            </h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-white font-display">
              Connect with anyone in three simple steps.
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Connector Line */}
            <div className="hidden md:block absolute top-1/3 left-1/6 right-1/6 h-0.5 bg-gradient-to-r from-stone-300 via-amber-500/30 to-stone-300 dark:from-stone-800 dark:via-amber-500/30 dark:to-stone-800 -z-0" />

            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative rounded-3xl bg-white dark:bg-[#141416] border border-stone-200/80 dark:border-white/10 p-8 text-center shadow-sm hover:shadow-md transition-all z-10"
              >
                <div className="w-13 h-13 mx-auto rounded-2xl bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-950 font-display text-base font-bold flex items-center justify-center shadow-md mb-6">
                  {step.num}
                </div>
                <h3 className="text-lg font-bold text-stone-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CALL TO ACTION ================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto relative rounded-3xl overflow-hidden bg-stone-950 border border-stone-800 p-10 sm:p-16 text-center text-white shadow-2xl">
          {/* Subtle Ambient Light */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <h2 className="text-3xl sm:text-5xl font-extrabold font-display tracking-tight relative z-10 text-white">
            Ready to connect?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-stone-300 max-w-xl mx-auto relative z-10">
            Start your next conversation with ConnectX. Experience frictionless, high-definition video collaboration today.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link
              to="/create-meeting"
              onClick={playClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold text-stone-950 bg-white hover:bg-stone-100 shadow-xl transition-all"
            >
              <span>Create Meeting</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/join-meeting"
              onClick={playClick}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold text-white bg-stone-800/90 hover:bg-stone-700/90 border border-stone-700 shadow-sm transition-all"
            >
              <span>Join with ID</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
