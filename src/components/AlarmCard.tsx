import { Alarm, DayOfWeek } from '../types';
import { Switch } from './ui/Switch';
import { Edit2, Trash2, Clock } from 'lucide-react';
import { format, parse } from 'date-fns';
import { motion } from 'motion/react';

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

interface AlarmCardProps {
  key?: string;
  alarm: Alarm;
  onToggle: (id: string, enabled: boolean) => void;
  onEdit: (alarm: Alarm) => void;
  onDelete: (id: string) => void;
}

export function AlarmCard({ alarm, onToggle, onEdit, onDelete }: AlarmCardProps) {
  const timeDate = parse(alarm.time, 'HH:mm', new Date());
  const formattedTime = format(timeDate, 'hh:mm');
  const amPm = format(timeDate, 'a');

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`p-5 rounded-3xl mb-4 transition-all ${
        alarm.enabled ? 'bg-white shadow-lg' : 'bg-gray-100 opacity-70'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1" onClick={() => onEdit(alarm)}>
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-semibold tracking-tight text-gray-900">
              {formattedTime}
            </span>
            <span className="text-lg font-medium text-gray-500 uppercase">
              {amPm}
            </span>
          </div>
          
          {alarm.note && (
            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
              {alarm.note}
            </p>
          )}

          <div className="flex gap-2 mt-3">
            {DAYS.map((day, idx) => {
              const isActive = alarm.repeatDays.includes(idx as DayOfWeek);
              return (
                <div
                  key={idx}
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                    isActive
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-end gap-4">
          <Switch
            checked={alarm.enabled}
            onCheckedChange={(checked) => onToggle(alarm.id, checked)}
          />
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(alarm)}
              className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={() => onDelete(alarm.id)}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
