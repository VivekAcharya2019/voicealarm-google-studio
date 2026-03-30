import { useState, useEffect, useCallback } from 'react';
import { Alarm, DayOfWeek } from './types';
import { AlarmCard } from './components/AlarmCard';
import { AlarmForm } from './components/AlarmForm';
import { AlarmTrigger } from './components/AlarmTrigger';
import { InfoModal } from './components/InfoModal';
import { Plus, Clock, Settings, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, parse, isSameMinute } from 'date-fns';

const STORAGE_KEY = 'smart_alarms';

export default function App() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState<Alarm | undefined>();
  const [activeAlarm, setActiveAlarm] = useState<Alarm | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Load alarms from storage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setAlarms(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load alarms', e);
      }
    }
  }, []);

  // Save alarms to storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
  }, [alarms]);

  // Tick current time and check for alarms
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      const currentHHmm = format(now, 'HH:mm');
      const currentDay = now.getDay() as DayOfWeek;

      const triggered = alarms.find(alarm => {
        if (!alarm.enabled) return false;
        if (alarm.time !== currentHHmm) return false;
        
        // Check repeat days (if empty, it's a one-time alarm)
        if (alarm.repeatDays.length > 0 && !alarm.repeatDays.includes(currentDay)) {
          return false;
        }

        // Prevent double triggering in the same minute
        if (alarm.lastTriggered) {
          const last = new Date(alarm.lastTriggered);
          if (isSameMinute(last, now)) return false;
        }

        return true;
      });

      if (triggered && !activeAlarm) {
        setActiveAlarm(triggered);
        // Update last triggered
        setAlarms(prev => prev.map(a => 
          a.id === triggered.id ? { ...a, lastTriggered: now.toISOString() } : a
        ));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [alarms, activeAlarm]);

  const handleAddAlarm = () => {
    setEditingAlarm(undefined);
    setIsFormOpen(true);
  };

  const handleEditAlarm = (alarm: Alarm) => {
    setEditingAlarm(alarm);
    setIsFormOpen(true);
  };

  const handleSaveAlarm = (alarmData: Partial<Alarm>) => {
    if (editingAlarm) {
      setAlarms(prev => prev.map(a => 
        a.id === editingAlarm.id ? { ...a, ...alarmData } as Alarm : a
      ));
    } else {
      const newAlarm: Alarm = {
        id: crypto.randomUUID(),
        time: '08:00',
        enabled: true,
        repeatDays: [],
        note: '',
        greeting: true,
        voiceProfile: 'female-1',
        ...alarmData
      } as Alarm;
      setAlarms(prev => [...prev, newAlarm].sort((a, b) => a.time.localeCompare(b.time)));
    }
    setIsFormOpen(false);
  };

  const handleDeleteAlarm = (id: string) => {
    setAlarms(prev => prev.filter(a => a.id !== id));
  };

  const handleToggleAlarm = (id: string, enabled: boolean) => {
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, enabled } : a));
  };

  const handleDismiss = () => {
    setActiveAlarm(null);
    window.speechSynthesis.cancel();
  };

  const handleSnooze = () => {
    if (activeAlarm) {
      // Create a one-time snooze alarm for 5 minutes later
      const snoozeTime = new Date(currentTime.getTime() + 5 * 60000);
      const snoozeAlarm: Alarm = {
        ...activeAlarm,
        id: crypto.randomUUID(),
        time: format(snoozeTime, 'HH:mm'),
        enabled: true,
        repeatDays: [], // One-time
        note: `(Snoozed) ${activeAlarm.note}`,
        lastTriggered: undefined
      };
      setAlarms(prev => [...prev, snoozeAlarm].sort((a, b) => a.time.localeCompare(b.time)));
    }
    handleDismiss();
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-50/80 backdrop-blur-md px-6 pt-12 pb-6 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">Alarms</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">
            {format(currentTime, 'EEEE, MMMM do')}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="p-3 bg-white rounded-2xl shadow-sm text-gray-400 hover:text-indigo-600 transition-colors">
            <Settings size={20} />
          </button>
        </div>
      </header>

      {/* Alarm List */}
      <main className="px-6 pb-32">
        <AnimatePresence mode="popLayout">
          {alarms.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-20 text-gray-400"
            >
              <Clock size={64} className="mb-4 opacity-20" />
              <p className="text-lg font-medium">No alarms set</p>
              <p className="text-sm">Tap + to create your first alarm</p>
            </motion.div>
          ) : (
            alarms.map(alarm => (
              <AlarmCard
                key={alarm.id}
                alarm={alarm}
                onToggle={handleToggleAlarm}
                onEdit={handleEditAlarm}
                onDelete={handleDeleteAlarm}
              />
            ))
          )}
        </AnimatePresence>
      </main>

      {/* FAB */}
      <button
        onClick={handleAddAlarm}
        className="fixed bottom-10 right-8 w-16 h-16 bg-indigo-600 text-white rounded-3xl shadow-2xl shadow-indigo-200 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-20"
      >
        <Plus size={32} />
      </button>

      {/* Modals */}
      <AnimatePresence>
        {isFormOpen && (
          <AlarmForm
            alarm={editingAlarm}
            onSave={handleSaveAlarm}
            onCancel={() => setIsFormOpen(false)}
          />
        )}
        {activeAlarm && (
          <AlarmTrigger
            alarm={activeAlarm}
            onDismiss={handleDismiss}
            onSnooze={handleSnooze}
          />
        )}
      </AnimatePresence>

      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />

      {/* APK Instructions Overlay (Optional Info) */}
      <div className="fixed bottom-4 left-6 z-10">
        <button 
          onClick={() => setIsInfoOpen(true)}
          className="p-2 bg-white/50 backdrop-blur-sm rounded-full text-gray-400 hover:text-indigo-600 transition-colors"
        >
          <Info size={16} />
        </button>
      </div>
    </div>
  );
}
