import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import { useSound } from '../hooks/useSound';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { soundEnabled, toggleSound, playClick } = useSound();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Features', path: '/#features' },
    { label: 'How It Works', path: '/#how-it-works' },
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Helpdesk', path: '/helpdesk' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#faf8f5]/90 dark:bg-[#0c0c0d]/90 backdrop-blur-md border-b border-stone-200/80 dark:border-white/10 shadow-sm'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Logo size="default" />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 rounded-full px-3.5 py-1.5 bg-stone-200/50 dark:bg-stone-900/60 border border-stone-300/40 dark:border-white/10 backdrop-blur-md">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <a
                key={link.label}
                href={link.path}
                onClick={playClick}
                className={`relative px-4 py-2 text-xs font-semibold rounded-full transition-colors ${
                  isActive
                    ? 'text-stone-900 dark:text-white'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 bg-white dark:bg-stone-800/90 shadow-sm rounded-full -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Action Controls & Auth */}
        <div className="hidden md:flex items-center gap-3">
          {/* UI Sound FX Toggle */}
          <button
            onClick={() => {
              playClick();
              toggleSound();
            }}
            className={`p-2 rounded-xl transition-colors border ${
              soundEnabled
                ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25'
                : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 border-transparent hover:bg-stone-200/60 dark:hover:bg-stone-800/60'
            }`}
            title={soundEnabled ? 'UI Sounds: ON' : 'UI Sounds: OFF'}
            aria-label="Toggle UI Sound Effects"
          >
            {soundEnabled ? <Volume2 className="w-4.5 h-4.5" /> : <VolumeX className="w-4.5 h-4.5" />}
          </button>

          {/* Theme Toggle */}
          <ThemeToggle />

          <div className="h-5 w-px bg-stone-200 dark:border-white/10 dark:bg-stone-800 mx-1" />

          {/* Login Link */}
          <Link
            to="/login"
            onClick={playClick}
            className="text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white px-3 py-2 transition-colors"
          >
            Sign In
          </Link>

          {/* Sign Up CTA */}
          <Link
            to="/signup"
            onClick={playClick}
            className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-stone-50 dark:text-stone-950 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400"
          >
            <span>Get Started</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => {
              playClick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="p-2 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800/60 focus:outline-none cursor-pointer"
            aria-label="Toggle Mobile Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#faf8f5] dark:bg-[#121214] border-b border-stone-200 dark:border-stone-800 px-6 py-6 shadow-xl"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.path}
                  onClick={() => {
                    playClick();
                    setMobileMenuOpen(false);
                  }}
                  className="text-sm font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-950 dark:hover:text-white py-2 border-b border-stone-200/60 dark:border-stone-800/80"
                >
                  {link.label}
                </a>
              ))}

              <div className="flex items-center justify-between py-2">
                <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">UI Sound Effects</span>
                <button
                  onClick={() => {
                    playClick();
                    toggleSound();
                  }}
                  className={`p-2 rounded-xl border ${
                    soundEnabled
                      ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/25'
                      : 'text-stone-400 border-stone-200 dark:border-stone-800'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="w-4.5 h-4.5" /> : <VolumeX className="w-4.5 h-4.5" />}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Link
                  to="/login"
                  onClick={() => {
                    playClick();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-800 dark:text-stone-200 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => {
                    playClick();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2.5 rounded-xl bg-stone-900 dark:bg-stone-100 text-stone-50 dark:text-stone-950 text-xs font-bold shadow-md"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
