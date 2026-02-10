import { supabase } from './supabase';

export interface DailySteps {
  user_id: string;
  date: string; // YYYY-MM-DD
  total_steps: number;
  walking_steps: number;
  running_steps: number;
  other_steps: number;
  distance_km: number;
  calories: number;
  active_minutes: number;
}

export async function upsertDailySteps(data: DailySteps) {
  const { error } = await supabase
    .from('steps_daily')
    .upsert(
      {
        ...data,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'user_id,date',
      }
    );

  if (error) throw error;
}
export async function getTodaySteps(userId: string) {
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from('steps_daily')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  if (error) return null;

  return data;
}

export async function getStepsHistory(userId: string, limit = 14) {
  const { data, error } = await supabase
    .from('steps_daily')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) throw error;

  return data;
}
