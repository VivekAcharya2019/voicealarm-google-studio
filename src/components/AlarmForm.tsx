import { useState, useEffect } from 'react';
import { Alarm, DayOfWeek, VoiceProfile } from '../types';
import { X, Check, Volume2, Mic, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface VoiceConfig {
  id: VoiceProfile;
  label: string;
  gender: 'male' | 'female';
  lang: string;
  pitch: number;
  rate: number;
}

const VOICE_PROFILES: VoiceConfig[] = [
  { id: 'female-1', label: 'Female 1', gender: 'female', lang: 'en', pitch: 1.1, rate: 1.0 },
  { id: 'female-2', label: 'Female 2', gender: 'female', lang: 'en', pitch: 0.9, rate: 0.95 },
  { id: 'male-1', label: 'Male 1', gender: 'male', lang: 'en', pitch: 0.9, rate: 1.0 },
  { id: 'male-2', label: 'Male 2', gender: 'male', lang: 'en', pitch: 0.8, rate: 0.9 },
  { id: 'kannada-1', label: 'Kannada Female', gender: 'female', lang: 'kn', pitch: 1.0, rate: 1.0 },
  { id: 'kannada-2', label: 'Kannada Male', gender: 'male', lang: 'kn', pitch: 0.9, rate: 0.9 },
];

interface AlarmFormProps {
  alarm?: Alarm;
  onSave: (alarm: Partial<Alarm>) => void;
  onCancel: () => void;
}

export function AlarmForm({ alarm, onSave, onCancel }: AlarmFormProps) {
  const [time, setTime] = useState(alarm?.time || '08:00');
  const [repeatDays, setRepeatDays] = useState<DayOfWeek[]>(alarm?.repeatDays || []);
  const [note, setNote] = useState(alarm?.note || '');
  const [greeting, setGreeting] = useState(alarm?.greeting ?? true);
  const [voiceProfile, setVoiceProfile] = useState<VoiceProfile>(alarm?.voiceProfile || 'female-1');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
    };
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const toggleDay = (day: DayOfWeek) => {
    setRepeatDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSave = () => {
    onSave({
      time,
      repeatDays,
      note,
      greeting,
      voiceProfile,
      enabled: true
    });
  };

  const getBestVoice = (gender: 'male' | 'female', lang: string) => {
    // Try exact match first (e.g., kn-IN)
    let langVoices = voices.filter(v => v.lang.toLowerCase().replace('_', '-').startsWith(lang.toLowerCase()));
    
    // Fallback to any Indian voice if Kannada is missing (sometimes Hindi voices can handle Kannada scripts better than English ones)
    if (langVoices.length === 0 && lang === 'kn') {
      langVoices = voices.filter(v => v.lang.toLowerCase().startsWith('hi'));
    }

    if (langVoices.length === 0) return { voice: voices.find(v => v.lang.startsWith('en')) || voices[0], isFallback: true };

    let voice;
    if (gender === 'female') {
      voice = langVoices.find(v => v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha') || v.name.toLowerCase().includes('heera')) || langVoices[0];
    } else {
      voice = langVoices.find(v => v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('google uk english male') || v.name.toLowerCase().includes('ravi')) || langVoices[1] || langVoices[0];
    }
    
    return { voice, isFallback: false };
  };

  const testVoice = (profileId: VoiceProfile) => {
    const profile = VOICE_PROFILES.find(p => p.id === profileId)!;
    const { voice, isFallback } = getBestVoice(profile.gender, profile.lang);
    
    // If we are falling back to English, use English text so it's audible
    const text = (profile.lang === 'kn' && !isFallback)
      ? "ಶುಭೋದಯ! ಇದು ನಿಮ್ಮ ಸ್ಮಾರ್ಟ್ ಅಲಾರಂ." 
      : "Good morning! This is your smart alarm.";
    
    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }
    utterance.pitch = profile.pitch;
    utterance.rate = profile.rate;
    
    window.speechSynthesis.cancel();
    // Small timeout to ensure cancel completes in some browsers
    setTimeout(() => {
      window.speechSynthesis.speak(utterance);
    }, 50);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="fixed inset-0 bg-white z-50 flex flex-col"
    >
      <header className="p-4 flex justify-between items-center border-b">
        <button onClick={onCancel} className="p-2 text-gray-500">
          <X size={24} />
        </button>
        <h2 className="text-xl font-semibold text-gray-900">
          {alarm ? 'Edit Alarm' : 'New Alarm'}
        </h2>
        <button onClick={handleSave} className="p-2 text-indigo-600">
          <Check size={24} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Time Picker */}
        <section className="flex justify-center">
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="text-6xl font-bold text-indigo-600 focus:outline-none bg-transparent"
          />
        </section>

        {/* Repeat Days */}
        <section>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Repeat
          </h3>
          <div className="flex justify-between">
            {DAYS.map((day, idx) => {
              const isActive = repeatDays.includes(idx as DayOfWeek);
              return (
                <button
                  key={idx}
                  onClick={() => toggleDay(idx as DayOfWeek)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {day[0]}
                </button>
              );
            })}
          </div>
        </section>

        {/* Note */}
        <section>
          <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Alarm Note
          </h3>
          <input
            type="text"
            placeholder="Wake up for work..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </section>

        {/* Smart Announcement Settings */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Volume2 className="text-indigo-600" size={20} />
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Voice Selection
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Greeting</span>
              <input
                type="checkbox"
                checked={greeting}
                onChange={(e) => setGreeting(e.target.checked)}
                className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {VOICE_PROFILES.map((profile) => (
              <button
                key={profile.id}
                onClick={() => {
                  setVoiceProfile(profile.id);
                  testVoice(profile.id);
                }}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                  voiceProfile === profile.id
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-600'
                    : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                }`}
              >
                <div className={`p-2 rounded-full ${
                  voiceProfile === profile.id ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  <User size={20} />
                </div>
                <span className="font-semibold text-sm">{profile.label}</span>
              </button>
            ))}
          </div>
        </section>
      </main>
    </motion.div>
  );
}
