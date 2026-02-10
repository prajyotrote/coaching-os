import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useDashboardData() {
  const [loading, setLoading] = useState(true);

  const [steps, setSteps] = useState(0);
  const [water, setWater] = useState(0);
  const [calories, setCalories] = useState(0);
  const [workouts, setWorkouts] = useState(0);
  const [score, setScore] = useState(0);
  const [sleep, setSleep] = useState(0);
  const [burned, setBurned] = useState(0);
  const [recovery, setRecovery] = useState(0);
  const [name, setName] = useState<string | null>(null);



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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'steps_logs' }, loadToday)

      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workout_logs' },
        loadToday
      )
      .on(
  'postgres_changes',
  { event: '*', schema: 'public', table: 'sleep_daily' },
  loadToday
)

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function logSteps(steps: number) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from('steps_logs').insert({
    user_id: user.id,
    steps,
  });
}
  async function loadToday() {
    setLoading(true);
    

    const {
      data: { user },
    } = await supabase.auth.getUser();

    

    if (!user) {
      setLoading(false);
      return;
    }
    // ----------------------------------
// Load onboarding profile (name etc)
// ----------------------------------

const { data: onboarding } = await supabase
  .from('user_onboarding')
  .select('name')
  .eq('user_id', user.id)
  .single();

setName(onboarding?.name || null);


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

    const [waterRes, mealRes, workoutRes, stepsRes,] = await Promise.all([
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

         supabase.from('steps_logs').select('steps').eq('user_id', user.id).gte('created_at', sinceIso),
    ]);

const now = new Date();
const todayStr = new Date(
  now.getFullYear(),
  now.getMonth(),
  now.getDate()
)
  .toISOString()
  .slice(0, 10);

const { data: sleepDaily, error: sleepError } = await supabase
  .from('sleep_daily')
  .select('*')
  .eq('user_id', user.id)
  .order('date', { ascending: false })
  .limit(1)
  .maybeSingle();

console.log('🛌 sleepDaily row:', sleepDaily);
console.log('❌ sleepDaily error:', sleepError);


    const totalWater =
      waterRes.data?.reduce((s, x) => s + (x.ml || 0), 0) || 0;

    const totalCalories =
      mealRes.data?.reduce((s, x) => s + (x.calories || 0), 0) || 0;

    const workoutCount = workoutRes.data?.length || 0;

const totalSteps =
  stepsRes.data?.reduce((s, x) => s + (x.steps || 0), 0) || 0;

const totalSleep =
  sleepDaily?.total_sleep_minutes
    ? sleepDaily.total_sleep_minutes / 60
    : 0;


  // 💙 Recovery calculation
const sleepRatio = Math.min(totalSleep / 8, 1.2); // allow small bonus
const sleepScore = sleepRatio * 55;

// Step fatigue (light)
const stepPenalty = Math.min(totalSteps / 5000, 1) * 8;

// Workout fatigue
const workoutPenalty = Math.min(workoutCount * 15, 30);

// Base recovery
let recoveryScore = 0;

if (totalSleep > 0) {
  const sleepPercent = Math.min(1, totalSleep / 8); // 8h baseline
  recoveryScore = Math.round(sleepPercent * 100);
}

setRecovery(recoveryScore);





// 🔥 Burned calories (ACTIVE only)
const stepsBurn = totalSteps * 0.04;
const workoutBurn = workoutCount * 300;

const burnedCalories = Math.round(stepsBurn + workoutBurn);

setBurned(burnedCalories);


setSteps(totalSteps);
setSleep(totalSleep);

    /* ------------------------------------
       Dynamic scoring
    ------------------------------------ */

   // 🎯 Main daily score

const hydrationScore = Math.min(1, totalWater / wTarget) * 20;
const nutritionScore = Math.min(1, totalCalories / cTarget) * 20;

// Activity = steps + workouts
const stepActivity = Math.min(1, totalSteps / 8000); // 8k steps target
const workoutActivity = Math.min(1, workoutCount / woTarget);

const activityScore = ((stepActivity + workoutActivity) / 2) * 30;

// Recovery already 0–100
const recoveryScorePart = (recoveryScore / 100) * 30;

const dailyScore = Math.round(
  hydrationScore +
  nutritionScore +
  activityScore +
  recoveryScorePart
);


    setWater(totalWater);
    setCalories(totalCalories);
    setWorkouts(workoutCount);
   // setSteps(estimatedSteps);
    setScore(dailyScore);

    setLoading(false);
  }

  return {
    loading,
    name,
    sleep,
    steps,
    burned,
    water,
    calories,
    workouts,
    score,
    recovery,
    refresh: loadToday,
    targets: {
      waterTarget,
      calorieTarget,
      workoutTarget,
    },
  };
}
