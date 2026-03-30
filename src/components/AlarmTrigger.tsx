import { useEffect, useState } from 'react';
import { Alarm, VoiceProfile } from '../types';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Timer } from 'lucide-react';

interface VoiceConfig {
  id: VoiceProfile;
  gender: 'male' | 'female';
  lang: string;
  pitch: number;
  rate: number;
}

const VOICE_PROFILES: VoiceConfig[] = [
  { id: 'female-1', gender: 'female', lang: 'en', pitch: 1.1, rate: 1.0 },
  { id: 'female-2', gender: 'female', lang: 'en', pitch: 0.9, rate: 0.95 },
  { id: 'male-1', gender: 'male', lang: 'en', pitch: 0.9, rate: 1.0 },
  { id: 'male-2', gender: 'male', lang: 'en', pitch: 0.8, rate: 0.9 },
  { id: 'kannada-1', gender: 'female', lang: 'kn', pitch: 1.0, rate: 1.0 },
  { id: 'kannada-2', gender: 'male', lang: 'kn', pitch: 0.9, rate: 0.9 },
];

interface AlarmTriggerProps {
  alarm: Alarm;
  onDismiss: () => void;
  onSnooze: () => void;
}

export function AlarmTrigger({ alarm, onDismiss, onSnooze }: AlarmTriggerProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // TTS Announcement
    const announce = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const profile = VOICE_PROFILES.find(p => p.id === alarm.voiceProfile) || VOICE_PROFILES[0];
      
      const getBestVoice = (gender: 'male' | 'female', lang: string) => {
        let langVoices = allVoices.filter(v => v.lang.toLowerCase().replace('_', '-').startsWith(lang.toLowerCase()));
        
        if (langVoices.length === 0 && lang === 'kn') {
          langVoices = allVoices.filter(v => v.lang.toLowerCase().startsWith('hi'));
        }

        if (langVoices.length === 0) return { voice: allVoices.find(v => v.lang.startsWith('en')) || allVoices[0], isFallback: true };

        let voice;
        if (gender === 'female') {
          voice = langVoices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('heera')) || langVoices[0];
        } else {
          voice = langVoices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('google uk english male') || v.name.toLowerCase().includes('ravi')) || langVoices[1] || langVoices[0];
        }
        return { voice, isFallback: false };
      };

      const { voice, isFallback } = getBestVoice(profile.gender, profile.lang);
      const timeStr = format(currentTime, 'hh:mm a');
      const isKannada = profile.lang === 'kn' && !isFallback;
      
      let text = "";
      if (isKannada) {
        text = `ಸಮಯ ಈಗ ${format(currentTime, 'hh:mm')}. `;
        if (alarm.greeting) {
          const hour = currentTime.getHours();
          const greeting = hour < 12 ? "ಶುಭೋದಯ!" : hour < 18 ? "ಶುಭ ಮಧ್ಯಾಹ್ನ!" : "ಶುಭ ಸಂಜೆ!";
          text = `${greeting} ${text}`;
        }
        if (alarm.note) {
          text += ` ನಿಮ್ಮ ಟಿಪ್ಪಣಿ: ${alarm.note}`;
        }
      } else {
        text = `The time is ${timeStr}. `;
        if (alarm.greeting) {
          const hour = currentTime.getHours();
          const greeting = hour < 12 ? "Good morning!" : hour < 18 ? "Good afternoon!" : "Good evening!";
          text = `${greeting} ${text}`;
        }
        if (alarm.note) {
          text += ` Your note: ${alarm.note}`;
        }
      }

      const utterance = new SpeechSynthesisUtterance(text);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      }
      utterance.pitch = profile.pitch;
      utterance.rate = profile.rate;
      
      utterance.onend = () => {
        setTimeout(() => {
          if (window.speechSynthesis.speaking) return;
          window.speechSynthesis.speak(utterance);
        }, 5000);
      };

      window.speechSynthesis.speak(utterance);
    };

    announce();

    return () => {
      clearInterval(timer);
      window.speechSynthesis.cancel();
    };
  }, [alarm]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-indigo-600 z-[100] flex flex-col items-center justify-center text-white p-6"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="mb-12"
      >
        <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
          <Bell size={64} className="text-white" />
        </div>
      </motion.div>

      <h1 className="text-8xl font-bold mb-4 tracking-tighter">
        {format(currentTime, 'hh:mm')}
      </h1>
      <p className="text-2xl font-medium text-indigo-100 uppercase tracking-widest mb-12">
        {format(currentTime, 'a')}
      </p>

      {alarm.note && (
        <p className="text-xl text-center max-w-xs mb-16 italic opacity-90">
          "{alarm.note}"
        </p>
      )}

      <div className="flex gap-8 w-full max-w-sm">
        <button
          onClick={onSnooze}
          className="flex-1 py-5 bg-white/10 hover:bg-white/20 rounded-3xl flex flex-col items-center gap-2 transition-colors backdrop-blur-sm border border-white/10"
        >
          <Timer size={24} />
          <span className="text-sm font-bold uppercase tracking-wider">Snooze</span>
        </button>
        <button
          onClick={onDismiss}
          className="flex-1 py-5 bg-white text-indigo-600 hover:bg-indigo-50 rounded-3xl flex flex-col items-center gap-2 transition-colors shadow-xl"
        >
          <X size={24} />
          <span className="text-sm font-bold uppercase tracking-wider">Dismiss</span>
        </button>
      </div>
    </motion.div>
  );
}
