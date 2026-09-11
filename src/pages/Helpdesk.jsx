import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LifeBuoy,
  Mail,
  Phone,
  User,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { supportApi } from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useSound } from '../hooks/useSound';
import { useAuth } from '../hooks/useAuth';

export default function Helpdesk() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { playClick, playSuccess } = useSound();

  const [name, setName] = useState(user?.fullName || user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState(null);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Please enter your name.';
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) errs.email = 'Please enter a valid email address.';
    if (!subject.trim()) errs.subject = 'Subject line is required.';
    if (!message.trim() || message.length < 10) errs.message = 'Message must be at least 10 characters long.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    playClick();

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const response = await supportApi.submit({
        name,
        email,
        subject,
        message,
      });

      playSuccess();
      setSubmittedTicket(response.data?.ticket);
      addToast({
        title: 'Support Ticket Submitted',
        description: `Ticket #${response.data?.ticket?.ticketId} sent to our engineering lead.`,
        type: 'success',
      });
      setSubject('');
      setMessage('');
    } catch (err) {
      setErrors({ form: err.message || 'Failed to submit ticket. Please try again.' });
      addToast({
        title: 'Submission Error',
        description: err.message || 'Could not send ticket.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">
          <LifeBuoy className="w-4 h-4" />
          <span>Helpdesk & Official Support</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-stone-900 dark:text-white tracking-tight">
          How can we help you?
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 max-w-2xl leading-relaxed">
          Submit technical support inquiries, report connectivity issues, or connect directly with the platform developer.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Owner / Support Details Card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-3xl bg-stone-900 dark:bg-[#141416] text-white border border-stone-800 dark:border-white/10 p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden">
            {/* Ambient Warm Accent */}
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-44 h-44 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

            <div>
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Official Lead Developer
              </span>
              <h2 className="text-2xl font-bold font-display tracking-tight text-white mt-3">
                Virat Singh
              </h2>
              <p className="text-xs text-stone-400 mt-1">Platform Creator & Lead Infrastructure Architect</p>
            </div>

            <div className="space-y-4 pt-2 border-t border-stone-800">
              <div className="flex items-center gap-3 text-xs text-stone-300">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block font-medium">Direct Email</span>
                  <a href="mailto:viratchauhan1010@gmail.com" className="font-semibold text-white hover:text-amber-300 transition-colors">
                    viratchauhan1010@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-stone-300">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400 shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block font-medium">Direct Phone</span>
                  <a href="tel:+918303639037" className="font-semibold text-white hover:text-emerald-300 transition-colors">
                    +91 8303639037
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 text-xs text-stone-300">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-indigo-400 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block font-medium">SLA Response Window</span>
                  <span className="font-semibold text-white">&lt; 2 Hours for critical enterprise outages</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-stone-800 text-[11px] text-stone-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>All tickets are logged in MongoDB and dispatched via Resend.</span>
            </div>
          </div>
        </div>

        {/* Right Side: Ticket Submission Form */}
        <div className="lg:col-span-7">
          <div className="rounded-3xl bg-white dark:bg-[#141416] border border-stone-200/80 dark:border-white/10 p-6 sm:p-8 shadow-sm space-y-6">
            <h2 className="text-lg font-bold font-display text-stone-900 dark:text-white">
              Submit a Support Request
            </h2>

            {submittedTicket && (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
                <div>
                  <p className="font-bold">Ticket #{submittedTicket.ticketId} Registered!</p>
                  <p className="text-[11px] opacity-90 mt-0.5">An email has been dispatched to viratchauhan1010@gmail.com.</p>
                </div>
              </div>
            )}

            {errors.form && (
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errors.form}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Your Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Virat Singh"
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Your Contact Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl pl-10 pr-3 py-2.5 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  {errors.email && <p className="text-[11px] text-rose-500 mt-1">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Audio latency issue on Firefox, enterprise migration enquiry"
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-amber-500"
                />
                {errors.subject && <p className="text-[11px] text-rose-500 mt-1">{errors.subject}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                  Detailed Message
                </label>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your question or issue in detail..."
                  className="w-full bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl p-3.5 text-xs text-stone-900 dark:text-white placeholder-stone-400 focus:outline-none focus:border-amber-500 resize-none leading-relaxed"
                />
                {errors.message && <p className="text-[11px] text-rose-500 mt-1">{errors.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:hover:bg-white text-stone-50 dark:text-stone-950 font-bold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Submitting Ticket...' : 'Send Message to Virat Singh'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
