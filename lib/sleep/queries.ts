// /mobile/lib/sleep/queries.ts

import { supabase } from '@/lib/supabase';
import type { SleepDaily, SleepPreferences } from '@/lib/sleep/types';

/**
 * Fetch sleep for today (latest available)
 */
export async function getSleepToday(userId: string): Promise<SleepDaily | null> {
  const { data, error } = await supabase
    .from('sleep_daily')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as SleepDaily | null;
}

/**
 * Fetch sleep history
 */
export async function getSleepHistory(
  userId: string,
  limit = 30
): Promise<SleepDaily[]> {
  const { data, error } = await supabase
    .from('sleep_daily')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as SleepDaily[];
}

/**
 * Fetch sleep preferences
 */
export async function getSleepPreferences(
  userId: string
): Promise<SleepPreferences | null> {
  const { data, error } = await supabase
    .from('sleep_preferences')
    .select('*')
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as SleepPreferences | null;
}

/**
 * Upsert sleep preferences
 */
export async function upsertSleepPreferences(
  prefs: Partial<SleepPreferences> & { user_id: string }
) {
  const { error } = await supabase
    .from('sleep_preferences')
    .upsert(
      {
        ...prefs,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    );

  if (error) throw error;
}
export type SleepQuality =
  | 'very_poor'
  | 'poor'
  | 'okay'
  | 'good'
  | 'excellent';

export type SleepReflectionInput = {
  userId: string;
  date: string;
  perceivedQuality: SleepQuality;
  factors: string[];
  notes?: string;
};


export async function upsertSleepReflection({
  userId,
  date,
  perceivedQuality,
  factors,
  notes,
}: SleepReflectionInput) {
  const { error } = await supabase
    .from('sleep_reflections')
    .upsert(
      {
        user_id: userId,
        date,
        perceived_quality: perceivedQuality,
        factors,
        notes: notes ?? null,
      },
      {
        onConflict: 'user_id,date',
      }
    );

  if (error) {
    console.error('Sleep reflection upsert failed', error);
    throw error;
  }
}

