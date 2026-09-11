import { useState, useEffect, useCallback } from 'react';

// Singleton AudioContext to avoid hitting browser limits
let audioCtx = null;

function getAudioContext() {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function useSound() {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const stored = localStorage.getItem('connectx_sound_enabled');
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('connectx_sound_enabled', JSON.stringify(soundEnabled));
    } catch (e) {
      console.warn('Could not persist sound settings:', e);
    }
  }, [soundEnabled]);

  const toggleSound = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  const playTone = useCallback((frequencies = [440], type = 'sine', duration = 0.2, volume = 0.08) => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      frequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, now + index * 0.06);

        gain.gain.setValueAtTime(0, now + index * 0.06);
        gain.gain.linearRampToValueAtTime(volume, now + index * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.06 + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.06);
        osc.stop(now + index * 0.06 + duration);
      });
    } catch (err) {
      console.warn('Audio playback not permitted or unavailable:', err);
    }
  }, [soundEnabled]);

  // Pre-configured distinct professional sounds
  const playJoin = useCallback(() => {
    playTone([480, 720], 'sine', 0.22, 0.09);
  }, [playTone]);

  const playLeave = useCallback(() => {
    playTone([640, 380], 'sine', 0.25, 0.08);
  }, [playTone]);

  const playMessage = useCallback(() => {
    playTone([800, 1200], 'sine', 0.15, 0.06);
  }, [playTone]);

  const playRecordStart = useCallback(() => {
    playTone([520, 680, 880], 'triangle', 0.2, 0.08);
  }, [playTone]);

  const playRecordStop = useCallback(() => {
    playTone([880, 680, 520], 'triangle', 0.2, 0.07);
  }, [playTone]);

  const playHandRaise = useCallback(() => {
    playTone([600, 900], 'sine', 0.18, 0.07);
  }, [playTone]);

  const playSuccess = useCallback(() => {
    playTone([523.25, 659.25, 783.99], 'sine', 0.28, 0.09); // C major chord
  }, [playTone]);

  const playClick = useCallback(() => {
    playTone([950], 'triangle', 0.04, 0.04);
  }, [playTone]);

  return {
    soundEnabled,
    setSoundEnabled,
    toggleSound,
    playJoin,
    playLeave,
    playMessage,
    playRecordStart,
    playRecordStop,
    playHandRaise,
    playSuccess,
    playClick
  };
}
