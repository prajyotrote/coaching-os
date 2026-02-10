import { supabase } from '@/lib/supabase';

export async function getDailyStepGoal(userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('profiles')
    .select('daily_step_target')
    .eq('id', userId)
    .single();

  if (error || !data) return 10000;
  return data.daily_step_target;
}

export async function updateDailyStepGoal(
  userId: string,
  goal: number
) {
  await supabase
    .from('profiles')
    .update({ daily_step_target: goal })
    .eq('id', userId);
}
