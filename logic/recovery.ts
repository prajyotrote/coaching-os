import { supabase } from '@/lib/supabase';

export type RecoveryRange = 'Week' | 'Month' | '6M';

export type RecoveryToday = {
  score: number;
  readiness: 'Green' | 'Yellow' | 'Red';
  sleepMinutes: number;
  bedtimeVariance: number | null;
  bedtime?: string | null;
  wakeTime?: string | null;
  steps: number;
  workouts: number;
  strainLabel: 'Low' | 'Moderate' | 'High';
  date: string;
};

export type RecoveryHistoryPoint = {
  label: string;
  value: number;
  isActive?: boolean;
};

export type RecoveryHistorySummary = {
  avg: number;
  best: number;
  low: number;
};

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateKey(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function readinessBand(score: number): 'Green' | 'Yellow' | 'Red' {
  if (score >= 70) return 'Green';
  if (score >= 40) return 'Yellow';
  return 'Red';
}

function strainFromActivity(steps: number, workouts: number) {
  const stepScore = Math.min(1, steps / 10000) * 60;
  const workoutScore = Math.min(workouts, 3) * 20;
  const total = stepScore + workoutScore;
  if (total >= 70) return 'High';
  if (total >= 35) return 'Moderate';
  return 'Low';
}

export async function getRecoveryToday(
  userId: string
): Promise<RecoveryToday | null> {
  const { data: sleepDaily } = await supabase
    .from('sleep_daily')
    .select(
      'date,total_sleep_minutes,bedtime_variance_minutes,bedtime,wake_time'
    )
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!sleepDaily) return null;

  const dateKey = sleepDaily.date;
  const dayStart = startOfDay(new Date(`${dateKey}T00:00:00`));
  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const [stepsRes, workoutsRes] = await Promise.all([
    supabase
      .from('steps_logs')
      .select('steps, created_at')
      .eq('user_id', userId)
      .gte('created_at', dayStart.toISOString())
      .lt('created_at', dayEnd.toISOString()),
    supabase
      .from('workout_logs')
      .select('id, created_at')
      .eq('user_id', userId)
      .gte('created_at', dayStart.toISOString())
      .lt('created_at', dayEnd.toISOString()),
  ]);

  const steps =
    stepsRes.data?.reduce((s, x) => s + (x.steps || 0), 0) ||
    0;
  const workouts = workoutsRes.data?.length || 0;

  const sleepMinutes = sleepDaily.total_sleep_minutes || 0;
  const score = Math.round(
    Math.min(1, sleepMinutes / 480) * 100
  );

  return {
    score,
    readiness: readinessBand(score),
    sleepMinutes,
    bedtimeVariance: sleepDaily.bedtime_variance_minutes ?? null,
    bedtime: sleepDaily.bedtime ?? null,
    wakeTime: sleepDaily.wake_time ?? null,
    steps,
    workouts,
    strainLabel: strainFromActivity(steps, workouts),
    date: dateKey,
  };
}

export async function getRecoveryHistory(
  userId: string,
  range: RecoveryRange
): Promise<{ chart: RecoveryHistoryPoint[]; summary: RecoveryHistorySummary }> {
  const now = new Date();
  let since = new Date();

  if (range === 'Week') {
    since.setDate(now.getDate() - 6);
  } else if (range === 'Month') {
    since.setDate(now.getDate() - 29);
  } else {
    since = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  }
  since = startOfDay(since);

  const { data } = await supabase
    .from('sleep_daily')
    .select('date,total_sleep_minutes')
    .eq('user_id', userId)
    .gte('date', toDateKey(since))
    .order('date', { ascending: true });

  const sleepMap = new Map<string, number>();
  (data || []).forEach(row => {
    sleepMap.set(row.date, row.total_sleep_minutes || 0);
  });

  let chart: RecoveryHistoryPoint[] = [];

  if (range === 'Week' || range === 'Month') {
    const days: Date[] = [];
    const cursor = new Date(since);
    while (cursor <= now) {
      days.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }

    chart = days.map(d => {
      const key = toDateKey(d);
      const sleepMin = sleepMap.get(key) || 0;
      const score = Math.round(Math.min(1, sleepMin / 480) * 100);
      const label =
        range === 'Week'
          ? d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0)
          : d.getDate() % 5 === 0
          ? `${d.getDate()}`
          : '';
      return {
        label,
        value: score,
        isActive: key === toDateKey(now),
      };
    });
  } else {
    const months: Date[] = [];
    for (let i = 0; i < 6; i++) {
      months.push(new Date(now.getFullYear(), now.getMonth() - 5 + i, 1));
    }

    const monthTotals = new Map<string, number[]>();
    months.forEach(m => monthTotals.set(`${m.getFullYear()}-${m.getMonth()}`, []));

    (data || []).forEach(row => {
      const dt = new Date(`${row.date}T00:00:00`);
      const key = `${dt.getFullYear()}-${dt.getMonth()}`;
      const score = Math.round(Math.min(1, (row.total_sleep_minutes || 0) / 480) * 100);
      if (monthTotals.has(key)) {
        monthTotals.get(key)?.push(score);
      }
    });

    chart = months.map((m, idx) => {
      const key = `${m.getFullYear()}-${m.getMonth()}`;
      const scores = monthTotals.get(key) || [];
      const avg =
        scores.length
          ? scores.reduce((a, b) => a + b, 0) / scores.length
          : 0;
      return {
        label: m.toLocaleDateString('en-US', { month: 'short' }),
        value: Math.round(avg),
        isActive: idx === months.length - 1,
      };
    });
  }

  const values = chart.map(c => c.value);
  const total = values.reduce((a, b) => a + b, 0);
  const avg = values.length ? total / values.length : 0;
  const best = values.length ? Math.max(...values) : 0;
  const low = values.length ? Math.min(...values) : 0;

  return {
    chart,
    summary: {
      avg: Math.round(avg),
      best: Math.round(best),
      low: Math.round(low),
    },
  };
}
