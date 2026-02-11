import { supabase } from '@/lib/supabase';
import type { FoodItem } from '@/logic/food';

export type MealEntry = {
  id: string;
  user_id: string;
  meal_name: string;
  date: string;
};

export type MealItemRow = {
  id: string;
  meal_entry_id: string;
  food_name: string;
  source_id: string | null;
  unit: string | null;
  quantity: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  image_url: string | null;
};

export function todayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, '0');
  const day = `${d.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export async function fetchMealEntries(userId: string, date: string) {
  const { data, error } = await supabase
    .from('meal_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as MealEntry[];
}

export async function createMealEntry(userId: string, date: string, mealName: string) {
  const { data, error } = await supabase
    .from('meal_entries')
    .insert({ user_id: userId, date, meal_name: mealName })
    .select('*')
    .single();

  if (error) throw error;
  return data as MealEntry;
}

export async function fetchMealItems(entryIds: string[]) {
  if (entryIds.length === 0) return [] as MealItemRow[];
  const { data, error } = await supabase
    .from('meal_items')
    .select('*')
    .in('meal_entry_id', entryIds)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as MealItemRow[];
}

export async function addMealItems(entryId: string, items: Array<{ item: FoodItem; quantity: number; unit: string }>) {
  if (items.length === 0) return;
  const rows = items.map(x => ({
    meal_entry_id: entryId,
    food_name: x.item.name,
    source_id: x.item.id,
    unit: x.unit,
    quantity: x.quantity,
    calories: Math.round(x.item.calories * x.quantity),
    protein: Number(x.item.protein) * x.quantity,
    carbs: Number(x.item.carbs) * x.quantity,
    fat: Number(x.item.fats) * x.quantity,
    fiber: (x.item.fiber ?? 0) * x.quantity,
    image_url: null,
  }));

  const { error } = await supabase.from('meal_items').insert(rows);
  if (error) throw error;
}

export async function deleteMealItem(id: string) {
  const { error } = await supabase.from('meal_items').delete().eq('id', id);
  if (error) throw error;
}

export async function recomputeMealLog(userId: string, date: string) {
  const entries = await fetchMealEntries(userId, date);
  const entryIds = entries.map(e => e.id);
  const items = await fetchMealItems(entryIds);

  const totals = items.reduce(
    (acc, row: any) => {
      acc.calories += row.calories || 0;
      acc.protein += Number(row.protein || 0);
      acc.carbs += Number(row.carbs || 0);
      acc.fat += Number(row.fat || 0);
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const since = new Date();
  since.setHours(0, 0, 0, 0);

  await supabase
    .from('meal_logs')
    .delete()
    .eq('user_id', userId)
    .gte('created_at', since.toISOString());

  await supabase
    .from('meal_logs')
    .insert({
      user_id: userId,
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fat: totals.fat,
      created_at: new Date().toISOString(),
    });
}
