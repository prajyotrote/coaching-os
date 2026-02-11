import { supabase } from '@/lib/supabase';

export type KcalRange = 'Day' | 'Week' | 'Month' | '6M';

const KCAL_PER_STEP = 0.04;
const KCAL_PER_WORKOUT = 300;

export type KcalToday = {
  steps: number;
  workouts: number;
  stepsKcal: number;
  workoutKcal: number;
  total: number;
};

export type KcalHistoryPoint = {
  label: string;
  value: number;
  isActive?: boolean;
};

export type KcalHistorySummary = {
  total: number;
  avg: number;
  best: number;
  low: number;
  stepsKcal: number;
  workoutKcal: number;
};

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function toLocalDateKey(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function toMonthKey(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  return `${y}-${m}`;
}

function sumStepsKcal(steps: number) {
  return Math.round(steps * KCAL_PER_STEP);
}

function sumWorkoutKcal(workouts: number) {
  return workouts * KCAL_PER_WORKOUT;
}

export async function getKcalStreak(
  userId: string,
  threshold = 300,
  days = 30
): Promise<number> {
  const now = new Date();
  const since = new Date();
  since.setDate(now.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const [stepsRes, workoutsRes] = await Promise.all([
    supabase
      .from('steps_logs')
      .select('steps, created_at')
      .eq('user_id', userId)
      .gte('created_at', since.toISOString()),
    supabase
      .from('workout_logs')
      .select('id, created_at')
      .eq('user_id', userId)
      .gte('created_at', since.toISOString()),
  ]);

  const totals = new Map<string, number>();
  const cursor = new Date(since);
  while (cursor <= now) {
    totals.set(toLocalDateKey(cursor), 0);
    cursor.setDate(cursor.getDate() + 1);
  }

  (stepsRes.data || []).forEach(log => {
    const key = toLocalDateKey(new Date(log.created_at));
    const kcal = sumStepsKcal(log.steps || 0);
    totals.set(key, (totals.get(key) || 0) + kcal);
  });

  (workoutsRes.data || []).forEach(log => {
    const key = toLocalDateKey(new Date(log.created_at));
    totals.set(key, (totals.get(key) || 0) + KCAL_PER_WORKOUT);
  });

  let streak = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = toLocalDateKey(d);
    const total = totals.get(key) || 0;
    if (total >= threshold) streak += 1;
    else break;
  }

  return streak;
}

export async function getTodayKcal(userId: string): Promise<KcalToday> {
  const since = startOfToday().toISOString();

  const [stepsRes, workoutsRes] = await Promise.all([
    supabase
      .from('steps_logs')
      .select('steps, created_at')
      .eq('user_id', userId)
      .gte('created_at', since),
    supabase
      .from('workout_logs')
      .select('id, created_at')
      .eq('user_id', userId)
      .gte('created_at', since),
  ]);

  const steps =
    stepsRes.data?.reduce((s, x) => s + (x.steps || 0), 0) ||
    0;
  const workouts = workoutsRes.data?.length || 0;

  const stepsKcal = sumStepsKcal(steps);
  const workoutKcal = sumWorkoutKcal(workouts);

  return {
    steps,
    workouts,
    stepsKcal,
    workoutKcal,
    total: stepsKcal + workoutKcal,
  };
}

export async function getKcalHistory(
  userId: string,
  range: KcalRange
): Promise<{ chart: KcalHistoryPoint[]; summary: KcalHistorySummary }> {
  const now = new Date();
  let since = new Date();

  if (range === 'Day') {
    since = startOfToday();
  } else if (range === 'Week') {
    since.setDate(now.getDate() - 6);
    since.setHours(0, 0, 0, 0);
  } else if (range === 'Month') {
    since.setDate(now.getDate() - 29);
    since.setHours(0, 0, 0, 0);
  } else {
    since = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  }

  const [stepsRes, workoutsRes] = await Promise.all([
    supabase
      .from('steps_logs')
      .select('steps, created_at')
      .eq('user_id', userId)
      .gte('created_at', since.toISOString()),
    supabase
      .from('workout_logs')
      .select('id, created_at')
      .eq('user_id', userId)
      .gte('created_at', since.toISOString()),
  ]);

  const stepsLogs = stepsRes.data || [];
  const workoutLogs = workoutsRes.data || [];

  let chart: KcalHistoryPoint[] = [];
  const totals = new Map<string, number>();
  let stepsKcalTotal = 0;
  let workoutKcalTotal = 0;

  if (range === 'Day') {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    hours.forEach(h => totals.set(`${h}`, 0));

    stepsLogs.forEach(log => {
      const dt = new Date(log.created_at);
      const key = `${dt.getHours()}`;
      const kcal = sumStepsKcal(log.steps || 0);
      stepsKcalTotal += kcal;
      totals.set(key, (totals.get(key) || 0) + kcal);
    });

    workoutLogs.forEach(log => {
      const dt = new Date(log.created_at);
      const key = `${dt.getHours()}`;
      workoutKcalTotal += KCAL_PER_WORKOUT;
      totals.set(key, (totals.get(key) || 0) + KCAL_PER_WORKOUT);
    });

    chart = hours.map(h => ({
      label: h % 3 === 0 ? `${h}` : '',
      value: totals.get(`${h}`) || 0,
      isActive: h === now.getHours(),
    }));
  } else if (range === 'Week' || range === 'Month') {
    const days: Date[] = [];
    const cursor = new Date(since);
    while (cursor <= now) {
      days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    days.forEach(d => totals.set(toLocalDateKey(d), 0));

    stepsLogs.forEach(log => {
      const dt = new Date(log.created_at);
      const key = toLocalDateKey(dt);
      const kcal = sumStepsKcal(log.steps || 0);
      stepsKcalTotal += kcal;
      totals.set(key, (totals.get(key) || 0) + kcal);
    });

    workoutLogs.forEach(log => {
      const dt = new Date(log.created_at);
      const key = toLocalDateKey(dt);
      workoutKcalTotal += KCAL_PER_WORKOUT;
      totals.set(key, (totals.get(key) || 0) + KCAL_PER_WORKOUT);
    });

    chart = days.map((d, idx) => {
      const label =
        range === 'Week'
          ? d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)
          : d.getDate() % 5 === 0
          ? `${d.getDate()}`
          : '';
      return {
        label,
        value: totals.get(toLocalDateKey(d)) || 0,
        isActive:
          toLocalDateKey(d) === toLocalDateKey(now) && idx === days.length - 1,
      };
    });
  } else {
    const months: Date[] = [];
    for (let i = 0; i < 6; i++) {
      months.push(new Date(now.getFullYear(), now.getMonth() - 5 + i, 1));
    }
    months.forEach(m => totals.set(toMonthKey(m), 0));

    stepsLogs.forEach(log => {
      const dt = new Date(log.created_at);
      const key = toMonthKey(dt);
      const kcal = sumStepsKcal(log.steps || 0);
      stepsKcalTotal += kcal;
      totals.set(key, (totals.get(key) || 0) + kcal);
    });

    workoutLogs.forEach(log => {
      const dt = new Date(log.created_at);
      const key = toMonthKey(dt);
      workoutKcalTotal += KCAL_PER_WORKOUT;
      totals.set(key, (totals.get(key) || 0) + KCAL_PER_WORKOUT);
    });

    chart = months.map((m, idx) => ({
      label: m.toLocaleDateString('en-US', { month: 'short' }),
      value: totals.get(toMonthKey(m)) || 0,
      isActive: idx === months.length - 1,
    }));
  }

  const values = chart.map(c => c.value);
  const total = values.reduce((a, b) => a + b, 0);
  const avg = values.length ? total / values.length : 0;
  const best = values.length ? Math.max(...values) : 0;
  const low = values.length ? Math.min(...values) : 0;

  return {
    chart,
    summary: {
      total: Math.round(total),
      avg: Math.round(avg),
      best: Math.round(best),
      low: Math.round(low),
      stepsKcal: Math.round(stepsKcalTotal),
      workoutKcal: Math.round(workoutKcalTotal),
    },
  };
}
