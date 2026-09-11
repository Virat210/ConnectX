import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Logo from '../components/Logo';
import { Globe, MessageCircle, Share2, Code, ShieldCheck, Heart } from 'lucide-react';
import { useSound } from '../hooks/useSound';

export default function MainLayout() {
  const { playClick } = useSound();

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] dark:bg-[#0c0c0d] text-stone-900 dark:text-stone-100 transition-colors duration-200 selection:bg-stone-800 selection:text-white dark:selection:bg-stone-200 dark:selection:text-stone-900">
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      {/* ConnectX Footer */}
      <footer className="relative bg-[#f7f5f0] dark:bg-[#101012] border-t border-stone-200/80 dark:border-white/10 pt-16 pb-12 overflow-hidden transition-colors duration-200">
        {/* Subtle decorative warm metallic divider */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent opacity-70" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 pb-12 border-b border-stone-200 dark:border-stone-800/80">
            {/* Column 1: Brand & Bio */}
            <div className="md:col-span-2 space-y-4">
              <Logo size="lg" />
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 max-w-sm leading-relaxed">
                ConnectX is a next-generation video conferencing and collaboration platform engineered for high-performance distributed teams.
              </p>
              <div className="flex items-center gap-2.5 pt-2">
                {[
                  { icon: Globe, href: '#' },
                  { icon: Code, href: '#' },
                  { icon: MessageCircle, href: '#' },
                  { icon: Share2, href: '#' }
                ].map((social, i) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={i}
                      href={social.href}
                      onClick={playClick}
                      className="p-2 rounded-xl bg-stone-200/60 dark:bg-stone-900 hover:bg-stone-300/70 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-950 dark:hover:text-white transition-colors"
                      aria-label="Social Link"
                    >
                      <Icon className="w-4 h-4" />
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Column 2: Product */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">Product</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                <li><Link to="/#features" onClick={playClick} className="hover:text-amber-700 dark:hover:text-amber-400">HD Video & Audio</Link></li>
                <li><Link to="/#features" onClick={playClick} className="hover:text-amber-700 dark:hover:text-amber-400">Screen Sharing</Link></li>
                <li><Link to="/#features" onClick={playClick} className="hover:text-amber-700 dark:hover:text-amber-400">Cloud Recording</Link></li>
                <li><Link to="/create-meeting" onClick={playClick} className="hover:text-amber-700 dark:hover:text-amber-400">Instant Meetings</Link></li>
              </ul>
            </div>

            {/* Column 3: Platform */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">Platform</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                <li><Link to="/dashboard" onClick={playClick} className="hover:text-amber-700 dark:hover:text-amber-400">Dashboard</Link></li>
                <li><Link to="/join-meeting" onClick={playClick} className="hover:text-amber-700 dark:hover:text-amber-400">Join Meeting</Link></li>
                <li><Link to="/history" onClick={playClick} className="hover:text-amber-700 dark:hover:text-amber-400">Meeting Logs</Link></li>
                <li><Link to="/admin" onClick={playClick} className="hover:text-amber-700 dark:hover:text-amber-400">Admin Console</Link></li>
                <li><Link to="/helpdesk" onClick={playClick} className="hover:text-amber-700 dark:hover:text-amber-400">Helpdesk & Support</Link></li>
              </ul>
            </div>

            {/* Column 4: Legal & Security */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-white">Security & Trust</h4>
              <ul className="space-y-2 text-xs sm:text-sm text-stone-600 dark:text-stone-400">
                <li className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span>SOC2 & HIPAA Ready</span>
                </li>
                <li><a href="#" className="hover:text-amber-700 dark:hover:text-amber-400">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-amber-700 dark:hover:text-amber-400">Terms of Service</a></li>
                <li><a href="#" className="hover:text-amber-700 dark:hover:text-amber-400">Security Architecture</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom attribution */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500 dark:text-stone-400">
            <p>© {new Date().getFullYear()} ConnectX Inc. All rights reserved.</p>
            <p className="flex items-center gap-1">
              Engineered with <Heart className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 fill-current inline" /> for modern team collaboration.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
