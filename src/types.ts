export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 is Sunday

export type VoiceProfile = 'female-1' | 'female-2' | 'male-1' | 'male-2' | 'kannada-1' | 'kannada-2';

export interface Alarm {
  id: string;
  time: string; // HH:mm format
  enabled: boolean;
  repeatDays: DayOfWeek[];
  note: string;
  greeting: boolean;
  voiceProfile: VoiceProfile;
  lastTriggered?: string; // ISO date
}
