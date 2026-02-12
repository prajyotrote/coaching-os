import { supabase } from '@/lib/supabase';

export type UserProfile = {
  id: string;
  name: string | null;
  gender: string | null;
  age: number | null;
  height: number | null;
  weight: number | null;
  goalWeight: number | null;
  activityLevel: string | null;
  memberSince: string | null;
  coachName: string | null;
};

export type ProfileTargets = {
  dailyStepTarget: number;
  dailyWaterTarget: number;
  dailyCalorieTarget: number;
  dailyWorkoutTarget: number;
  dailySleepTarget: number;
};

export type AllTimeStats = {
  totalWorkouts: number;
  totalSteps: number;
  totalCaloriesBurned: number;
  totalWaterMl: number;
  totalMealsLogged: number;
  daysTracked: number;
};

export type PersonalRecords = {
  bestDayScore: number;
  maxStepsDay: number;
  longestWorkoutStreak: number;
  longestLoggingStreak: number;
  bestSleepHours: number;
};

export type CurrentStreaks = {
  workoutStreak: number;
  loggingStreak: number;
  hydrationStreak: number;
  scoreStreak: number;
};

export type WeightEntry = {
  date: string;
  weight: number;
};

export type ProfileData = {
  user: UserProfile;
  targets: ProfileTargets;
  allTime: AllTimeStats;
  records: PersonalRecords;
  streaks: CurrentStreaks;
  weightHistory: WeightEntry[];
};

function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function getUserProfile(userId: string): Promise<UserProfile> {
  const [profileRes, onboardingRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('created_at')
      .eq('id', userId)
      .single(),
    supabase
      .from('user_onboarding')
      .select('name, gender, dob, height_cm, weight_kg, activity_level, baseline_weight')
      .eq('user_id', userId)
      .single(),
  ]);

  const profile = profileRes.data;
  const onboarding = onboardingRes.data;

  // Calculate age from date of birth
  let age: number | null = null;
  if (onboarding?.dob) {
    const birthDate = new Date(onboarding.dob);
    const today = new Date();
    age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  }

  return {
    id: userId,
    name: onboarding?.name || null,
    gender: onboarding?.gender || null,
    age,
    height: onboarding?.height_cm || null,
    weight: onboarding?.weight_kg ? Number(onboarding.weight_kg) : null,
    goalWeight: onboarding?.baseline_weight ? Number(onboarding.baseline_weight) : null,
    activityLevel: onboarding?.activity_level || null,
    memberSince: profile?.created_at || null,
    coachName: null, // TODO: fetch from coach assignment table
  };
}

export async function getProfileTargets(userId: string): Promise<ProfileTargets> {
  const { data } = await supabase
    .from('profiles')
    .select(
      'daily_step_target, daily_water_target, daily_calorie_target, daily_workout_target, daily_sleep_target'
    )
    .eq('id', userId)
    .single();

  return {
    dailyStepTarget: data?.daily_step_target || 10000,
    dailyWaterTarget: data?.daily_water_target || 3000,
    dailyCalorieTarget: data?.daily_calorie_target || 2000,
    dailyWorkoutTarget: data?.daily_workout_target || 1,
    dailySleepTarget: data?.daily_sleep_target || 480, // 8 hours in minutes
  };
}

export async function getAllTimeStats(userId: string): Promise<AllTimeStats> {
  const [workoutsRes, stepsRes, mealsRes, waterRes] = await Promise.all([
    supabase
      .from('workout_logs')
      .select('id, created_at')
      .eq('user_id', userId),
    supabase
      .from('steps_logs')
      .select('steps, created_at')
      .eq('user_id', userId),
    supabase
      .from('meal_logs')
      .select('id, calories, created_at')
      .eq('user_id', userId),
    supabase
      .from('water_logs')
      .select('ml, created_at')
      .eq('user_id', userId),
  ]);

  const totalWorkouts = workoutsRes.data?.length || 0;
  const totalSteps = stepsRes.data?.reduce((s, x) => s + (x.steps || 0), 0) || 0;
  const totalMealsLogged = mealsRes.data?.length || 0;
  const totalWaterMl = waterRes.data?.reduce((s, x) => s + (x.ml || 0), 0) || 0;

  // Calories burned from steps + workouts
  const stepsCalories = totalSteps * 0.04;
  const workoutCalories = totalWorkouts * 300;
  const totalCaloriesBurned = Math.round(stepsCalories + workoutCalories);

  // Count unique days with any activity
  const allDates = new Set<string>();
  stepsRes.data?.forEach(x => allDates.add(toDateKey(new Date(x.created_at))));
  workoutsRes.data?.forEach(x => allDates.add(toDateKey(new Date(x.created_at))));
  mealsRes.data?.forEach(x => allDates.add(toDateKey(new Date(x.created_at))));
  waterRes.data?.forEach(x => allDates.add(toDateKey(new Date(x.created_at))));

  return {
    totalWorkouts,
    totalSteps,
    totalCaloriesBurned,
    totalWaterMl,
    totalMealsLogged,
    daysTracked: allDates.size,
  };
}

export async function getPersonalRecords(userId: string): Promise<PersonalRecords> {
  // Get steps by day
  const { data: stepsData } = await supabase
    .from('steps_logs')
    .select('steps, created_at')
    .eq('user_id', userId);

  const stepsByDay = new Map<string, number>();
  stepsData?.forEach(x => {
    const key = toDateKey(new Date(x.created_at));
    stepsByDay.set(key, (stepsByDay.get(key) || 0) + (x.steps || 0));
  });
  const maxStepsDay = Math.max(0, ...Array.from(stepsByDay.values()));

  // Get sleep records
  const { data: sleepData } = await supabase
    .from('sleep_daily')
    .select('total_sleep_minutes')
    .eq('user_id', userId)
    .order('total_sleep_minutes', { ascending: false })
    .limit(1);

  const bestSleepHours = sleepData?.[0]?.total_sleep_minutes
    ? Math.round((sleepData[0].total_sleep_minutes / 60) * 10) / 10
    : 0;

  // Calculate workout streak (consecutive days with workouts)
  const { data: workoutsData } = await supabase
    .from('workout_logs')
    .select('created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const workoutDays = new Set<string>();
  workoutsData?.forEach(x => workoutDays.add(toDateKey(new Date(x.created_at))));
  const longestWorkoutStreak = calculateLongestStreak(workoutDays);

  // Logging streak (any activity logged)
  const allActivityDays = new Set<string>();
  stepsData?.forEach(x => allActivityDays.add(toDateKey(new Date(x.created_at))));
  workoutsData?.forEach(x => allActivityDays.add(toDateKey(new Date(x.created_at))));
  const longestLoggingStreak = calculateLongestStreak(allActivityDays);

  return {
    bestDayScore: 100, // Would need to calculate from historical data
    maxStepsDay,
    longestWorkoutStreak,
    longestLoggingStreak,
    bestSleepHours,
  };
}

function calculateLongestStreak(days: Set<string>): number {
  if (days.size === 0) return 0;

  const sortedDays = Array.from(days).sort();
  let longest = 1;
  let current = 1;

  for (let i = 1; i < sortedDays.length; i++) {
    const prev = new Date(sortedDays[i - 1]);
    const curr = new Date(sortedDays[i]);
    const diffDays = Math.round(
      (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

export async function getCurrentStreaks(userId: string): Promise<CurrentStreaks> {
  const now = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const [workoutsRes, stepsRes, waterRes] = await Promise.all([
    supabase
      .from('workout_logs')
      .select('created_at')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString()),
    supabase
      .from('steps_logs')
      .select('steps, created_at')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString()),
    supabase
      .from('water_logs')
      .select('ml, created_at')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo.toISOString()),
  ]);

  // Workout streak (consecutive days from today going back)
  const workoutDays = new Set<string>();
  workoutsRes.data?.forEach(x => workoutDays.add(toDateKey(new Date(x.created_at))));
  const workoutStreak = calculateCurrentStreak(workoutDays);

  // Logging streak (any steps logged)
  const loggingDays = new Set<string>();
  stepsRes.data?.forEach(x => loggingDays.add(toDateKey(new Date(x.created_at))));
  const loggingStreak = calculateCurrentStreak(loggingDays);

  // Hydration streak (days with 2000ml+)
  const waterByDay = new Map<string, number>();
  waterRes.data?.forEach(x => {
    const key = toDateKey(new Date(x.created_at));
    waterByDay.set(key, (waterByDay.get(key) || 0) + (x.ml || 0));
  });
  const hydrationDays = new Set<string>();
  waterByDay.forEach((ml, day) => {
    if (ml >= 2000) hydrationDays.add(day);
  });
  const hydrationStreak = calculateCurrentStreak(hydrationDays);

  return {
    workoutStreak,
    loggingStreak,
    hydrationStreak,
    scoreStreak: loggingStreak, // Simplified for now
  };
}

function calculateCurrentStreak(days: Set<string>): number {
  const now = new Date();
  let streak = 0;

  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(now);
    checkDate.setDate(now.getDate() - i);
    const key = toDateKey(checkDate);

    if (days.has(key)) {
      streak++;
    } else if (i > 0) {
      // Allow today to be missing, but break on any other gap
      break;
    }
  }

  return streak;
}

export async function getWeightHistory(
  userId: string,
  days: number = 90
): Promise<WeightEntry[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabase
    .from('weight_logs')
    .select('weight, created_at')
    .eq('user_id', userId)
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true });

  return (
    data?.map(x => ({
      date: toDateKey(new Date(x.created_at)),
      weight: x.weight,
    })) || []
  );
}

export async function updateProfileTargets(
  userId: string,
  targets: Partial<ProfileTargets>
): Promise<void> {
  const update: Record<string, number> = {};

  if (targets.dailyStepTarget !== undefined) {
    update.daily_step_target = targets.dailyStepTarget;
  }
  if (targets.dailyWaterTarget !== undefined) {
    update.daily_water_target = targets.dailyWaterTarget;
  }
  if (targets.dailyCalorieTarget !== undefined) {
    update.daily_calorie_target = targets.dailyCalorieTarget;
  }
  if (targets.dailyWorkoutTarget !== undefined) {
    update.daily_workout_target = targets.dailyWorkoutTarget;
  }
  if (targets.dailySleepTarget !== undefined) {
    update.daily_sleep_target = targets.dailySleepTarget;
  }

  if (Object.keys(update).length > 0) {
    await supabase.from('profiles').update(update).eq('id', userId);
  }
}

export async function updateUserWeight(
  userId: string,
  weight: number
): Promise<void> {
  // Log to weight_logs
  await supabase.from('weight_logs').insert({
    user_id: userId,
    weight,
  });

  // Update current weight in onboarding
  await supabase
    .from('user_onboarding')
    .update({ weight })
    .eq('user_id', userId);
}

// Fast initial load - just user profile and targets
export async function getBasicProfileData(userId: string): Promise<{
  user: UserProfile;
  targets: ProfileTargets;
}> {
  const [user, targets] = await Promise.all([
    getUserProfile(userId),
    getProfileTargets(userId),
  ]);
  return { user, targets };
}

// Load stats separately (can be called in background)
export async function getProfileStats(userId: string): Promise<{
  allTime: AllTimeStats;
  records: PersonalRecords;
  streaks: CurrentStreaks;
}> {
  const [allTime, records, streaks] = await Promise.all([
    getAllTimeStats(userId),
    getPersonalRecords(userId),
    getCurrentStreaks(userId),
  ]);
  return { allTime, records, streaks };
}

export async function getFullProfileData(userId: string): Promise<ProfileData> {
  const [user, targets, allTime, records, streaks, weightHistory] =
    await Promise.all([
      getUserProfile(userId),
      getProfileTargets(userId),
      getAllTimeStats(userId),
      getPersonalRecords(userId),
      getCurrentStreaks(userId),
      getWeightHistory(userId),
    ]);

  return { user, targets, allTime, records, streaks, weightHistory };
}
