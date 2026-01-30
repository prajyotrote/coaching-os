import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useDashboardData() {
  const [loading, setLoading] = useState(true);

  const [steps, setSteps] = useState(0);
  const [water, setWater] = useState(0);
  const [calories, setCalories] = useState(0);
  const [workouts, setWorkouts] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    loadToday();
  }, []);

  async function loadToday() {
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const since = today.toISOString();

    const [waterRes, mealRes, workoutRes] = await Promise.all([
      supabase.from('water_logs').select('ml').eq('user_id', user.id).gte('created_at', since),
      supabase.from('meal_logs').select('calories').eq('user_id', user.id).gte('created_at', since),
      supabase.from('workout_logs').select('id').eq('user_id', user.id).gte('created_at', since),
    ]);

    const totalWater =
      waterRes.data?.reduce((s, x) => s + (x.ml || 0), 0) || 0;

    const totalCalories =
      mealRes.data?.reduce((s, x) => s + (x.calories || 0), 0) || 0;

    const workoutCount = workoutRes.data?.length || 0;

    // no fake steps until Apple Health
    const estimatedSteps = 0;

    const waterPercent = Math.min(1, totalWater / 3000);
    const mealPercent = Math.min(1, totalCalories / 2000);
    const workoutPercent = Math.min(1, workoutCount / 2);


    const dailyScore = Math.round(
  waterPercent * 40 +
  mealPercent * 30 +
  workoutPercent * 30
);


    setWater(totalWater);
    setCalories(totalCalories);
    setWorkouts(workoutCount);
    setSteps(estimatedSteps);
    setScore(dailyScore);

    setLoading(false);
  }

  return {
    loading,
    steps,
    water,
    calories,
    workouts,
    score,
    refresh: loadToday,
  };
}
