import { supabase } from '@/lib/supabase';

export async function logWorkout(userId: string) {
  return supabase.from('workout_logs').insert({
    user_id: userId,
    completed: true,
  });
}

export async function logWater(userId: string, ml: number) {
  return supabase.from('water_logs').insert({
    user_id: userId,
    ml,
  });
}

export async function logMeal(userId: string, calories: number) {
  return supabase.from('meal_logs').insert({
    user_id: userId,
    calories,
  });
}

export async function logWeight(userId: string, weight: number) {
  const today = new Date().toISOString().split('T')[0];

  return supabase.from('health_metrics').upsert({
    user_id: userId,
    date: today,
    weight,
  });
}
