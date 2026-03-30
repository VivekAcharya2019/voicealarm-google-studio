import { motion } from 'motion/react';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function Switch({ checked, onCheckedChange }: SwitchProps) {
  return (
    <button
      onClick={() => onCheckedChange(!checked)}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${
        checked ? 'bg-indigo-600' : 'bg-gray-300'
      }`}
    >
      <motion.div
        animate={{ x: checked ? 26 : 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm"
      />
    </button>
  );
}
