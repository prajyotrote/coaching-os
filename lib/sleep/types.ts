export type SleepDaily = {
  id?: string;
  user_id?: string;
  date: string;
  total_sleep_minutes: number;
  bedtime?: string | null;
  wake_time?: string | null;
  awake_minutes?: number | null;
  rem_sleep_minutes?: number | null;
  light_sleep_minutes?: number | null;
  deep_sleep_minutes?: number | null;
};

export type SleepPreferences = {
  user_id: string;
  bedtime?: string | null;
  wake_time?: string | null;
  reminder_enabled?: boolean | null;
  reminder_offset_minutes?: number | null;
  preferred_sleep_minutes?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};
