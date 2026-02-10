import { supabase } from '@/lib/supabase';

export async function getTodaySteps(userId: string) {
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await supabase
    .from('steps_daily')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  return (
    data ?? {
      total_steps: 0,
      walking_steps: 0,
      running_steps: 0,
      other_steps: 0,
      distance_km: 0,
      calories: 0,
      active_minutes: 0,
    }
  );
}
