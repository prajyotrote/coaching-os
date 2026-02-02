import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useDashboardData() {
  const [loading, setLoading] = useState(true);

  const [steps, setSteps] = useState(0);
  const [water, setWater] = useState(0);
  const [calories, setCalories] = useState(0);
  const [workouts, setWorkouts] = useState(0);
  const [score, setScore] = useState(0);

  // Targets (from profile)
  const [waterTarget, setWaterTarget] = useState(3000);
  const [calorieTarget, setCalorieTarget] = useState(2000);
  const [workoutTarget, setWorkoutTarget] = useState(2);

  useEffect(() => {
    loadToday();

    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'water_logs' },
        loadToday
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'meal_logs' },
        loadToday
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workout_logs' },
        loadToday
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

    /* ------------------------------------
       Load user targets from profile
    ------------------------------------ */

    const { data: profile } = await supabase
      .from('profiles')
      .select('daily_water_target,daily_calorie_target,daily_workout_target')
      .eq('id', user.id)
      .single();

    const wTarget = profile?.daily_water_target || 3000;
    const cTarget = profile?.daily_calorie_target || 2000;
    const woTarget = profile?.daily_workout_target || 2;

    setWaterTarget(wTarget);
    setCalorieTarget(cTarget);
    setWorkoutTarget(woTarget);

    /* ------------------------------------
       Today's data
    ------------------------------------ */

    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const sinceIso = since.toISOString();

    const [waterRes, mealRes, workoutRes] = await Promise.all([
      supabase
        .from('water_logs')
        .select('ml')
        .eq('user_id', user.id)
        .gte('created_at', sinceIso),

      supabase
        .from('meal_logs')
        .select('calories')
        .eq('user_id', user.id)
        .gte('created_at', sinceIso),

      supabase
        .from('workout_logs')
        .select('id')
        .eq('user_id', user.id)
        .gte('created_at', sinceIso),
    ]);

    const totalWater =
      waterRes.data?.reduce((s, x) => s + (x.ml || 0), 0) || 0;

    const totalCalories =
      mealRes.data?.reduce((s, x) => s + (x.calories || 0), 0) || 0;

    const workoutCount = workoutRes.data?.length || 0;

    // Until Apple / Google Health
    const estimatedSteps = 0;

    /* ------------------------------------
       Dynamic scoring
    ------------------------------------ */

    const waterPercent = Math.min(1, totalWater / wTarget);
    const mealPercent = Math.min(1, totalCalories / cTarget);
    const workoutPercent = Math.min(1, workoutCount / woTarget);

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
    targets: {
      waterTarget,
      calorieTarget,
      workoutTarget,
    },
  };
}
