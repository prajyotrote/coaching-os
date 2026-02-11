import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  Image,
} from 'react-native';
import { ArrowLeft, Camera, MoreVertical, Search, Sparkles, Utensils } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import BottomSheet from '@/components/BottomSheet';
import { FoodItem, searchFoods } from '@/logic/food';
import CaloriesHeroSection from '@/components/food/CaloriesHeroSection';
import { BasketItem, addToBasket, clearBasket, getBasket, subscribeBasket } from '@/logic/foodBasket';
import { getMeals, setMeals, subscribeMeals, Meal } from '@/logic/foodMeals';
import { supabase } from '@/lib/supabase';
import { addMealItems, createMealEntry, deleteMealItem, fetchMealEntries, fetchMealItems, recomputeMealLog, todayKey } from '@/logic/mealDb';

export default function Food() {
  const [meals, setMealsState] = useState<Meal[]>(getMeals());
  const [userId, setUserId] = useState<string | null>(null);
  const [activeMealId, setActiveMealId] = useState<string | null>(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [nlpOpen, setNlpOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [itemMenuOpen, setItemMenuOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [nlpText, setNlpText] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<{ mealId: string; item: FoodItem } | null>(null);
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const params = useLocalSearchParams<{ openSearch?: string; mealId?: string }>();

  const activeMeal = useMemo(
    () => meals.find(m => m.id === activeMealId) ?? null,
    [meals, activeMealId]
  );

  const results = useMemo(
    () => searchFoods(searchQuery),
    [searchQuery]
  );

  const totals = useMemo(() => {
    const all = meals.flatMap(m => m.items);
    const calories = all.reduce((s, x) => s + x.calories, 0);
    const protein = all.reduce((s, x) => s + x.protein, 0);
    const carbs = all.reduce((s, x) => s + x.carbs, 0);
    const fats = all.reduce((s, x) => s + x.fats, 0);
    const fiber = all.reduce((s, x) => s + (x.fiber ?? 0), 0);
    return { calories, protein, carbs, fats, fiber, logs: all.length };
  }, [meals]);

  const addItemToMeal = (item: FoodItem) => {
    if (!activeMeal) return;
    const next = meals.map(m =>
      m.id === activeMeal.id
        ? { ...m, items: [item, ...m.items] }
        : m
    );
    setMeals(next);
    setStatus('Logged successfully');
  };

  useEffect(() => {
    setBasket(getBasket());
    const unsubBasket = subscribeBasket(setBasket);
    const unsubMeals = subscribeMeals(setMealsState);
    return () => {
      unsubBasket();
      unsubMeals();
    };
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  const loadMeals = async (id: string) => {
    const date = todayKey();
    let entries = await fetchMealEntries(id, date);
    if (entries.length === 0) {
      const defaults = ['Meal 1', 'Meal 2', 'Meal 3'];
      for (const name of defaults) {
        const entry = await createMealEntry(id, date, name);
        entries = [...entries, entry];
      }
    }

    const items = await fetchMealItems(entries.map(e => e.id));
    const nextMeals: Meal[] = entries.map(entry => ({
      id: entry.id,
      title: entry.meal_name,
      items: items
        .filter(i => i.meal_entry_id === entry.id)
        .map(i => ({
          id: i.id,
          name: i.food_name,
          brand: undefined,
          serving: i.unit ?? 'Serving',
          calories: i.calories,
          protein: Number(i.protein || 0),
          carbs: Number(i.carbs || 0),
          fats: Number(i.fat || 0),
          fiber: Number(i.fiber || 0),
        })),
    }));

    setMeals(nextMeals);
  };

  useEffect(() => {
    if (!userId) return;
    loadMeals(userId);
  }, [userId]);

  useEffect(() => {
    if (params.openSearch === '1') {
      if (params.mealId) setActiveMealId(params.mealId);
      setSearchOpen(true);
    }
  }, [params.openSearch, params.mealId]);

  const addBasketToMeal = async () => {
    if (!activeMeal || basket.length === 0) return;
    await addMealItems(
      activeMeal.id,
      basket.map(b => ({ item: b.item, quantity: b.quantity, unit: b.unit }))
    );
    clearBasket();
    if (userId) {
      await recomputeMealLog(userId, todayKey());
      await loadMeals(userId);
    }
    setStatus('Meal added');
  };

  const deleteItem = async () => {
    if (!activeItem) return;
    await deleteMealItem(activeItem.item.id);
    if (userId) {
      await recomputeMealLog(userId, todayKey());
      await loadMeals(userId);
    }
    setItemMenuOpen(false);
  };

  const addMeal = async () => {
    if (!userId) return;
    const nextIndex = meals.length + 1;
    const entry = await createMealEntry(userId, todayKey(), `Meal ${nextIndex}`);
    const next = [...meals, { id: entry.id, title: entry.meal_name, items: [] }];
    setMeals(next);
  };

  const openSearch = (mealId: string) => {
    setActiveMealId(mealId);
    setSearchOpen(true);
  };

  const openNlp = (mealId: string) => {
    setActiveMealId(mealId);
    setNlpOpen(true);
  };

  const openPhoto = (mealId: string) => {
    setActiveMealId(mealId);
    setPhotoOpen(true);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color="#fff" />
        </Pressable>
        <Text style={styles.title}>Calories</Text>
        <Pressable
          style={styles.insightsBtn}
          onPress={() => router.push('/FoodInsights')}
        >
          <Text style={styles.insightsText}>View insights</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
      >
        {/* SUMMARY (STICKY) */}
        <View style={styles.summaryWrap}>
          <CaloriesHeroSection
            caloriesConsumed={totals.calories}
            caloriesTarget={2200}
            protein={totals.protein}
            carbs={totals.carbs}
            fat={totals.fats}
            fiber={totals.fiber}
            logs={totals.logs}
          />
        </View>

        {/* MEALS */}
        <View style={styles.mealsWrap}>
          {meals.map(meal => (
            <View key={meal.id} style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <Text style={styles.mealTitle}>{meal.title}</Text>
                <Text style={styles.mealCalories}>
                  {meal.items.reduce((s, x) => s + x.calories, 0)} kcal
                </Text>
              </View>

              {meal.items.length > 0 ? (
            <View style={styles.foodList}>
              {meal.items.slice(0, 3).map((item, idx) => (
                    <View key={`${meal.id}-${item.id}-${idx}`} style={styles.foodRow}>
                  <View style={styles.foodIcon}>
                    <Utensils size={14} color="#A5B4FC" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.foodName}>{item.name}</Text>
                    <Text style={styles.foodSub}>
                      {item.serving} • {item.calories} kcal
                    </Text>
                  </View>
                  <Pressable
                    style={styles.foodMenu}
                    onPress={() => {
                      setActiveItem({ mealId: meal.id, item });
                      setItemMenuOpen(true);
                    }}
                  >
                    <MoreVertical size={14} color="#94A3B8" />
                  </Pressable>
                </View>
              ))}
                  {meal.items.length > 3 && (
                    <Text style={styles.foodMore}>
                      +{meal.items.length - 3} more items
                    </Text>
                  )}
                </View>
              ) : (
                <View style={styles.mealEmpty}>
                  <View style={styles.mealEmptyIcon}>
                    <Utensils size={16} color="#6B7280" />
                  </View>
                  <Text style={styles.mealEmptyText}>No items yet</Text>
                </View>
              )}

              <View style={styles.actionRow}>
                <Pressable style={styles.actionBtn} onPress={() => openSearch(meal.id)}>
                  <Search size={16} color="#C7D2FE" />
                  <Text style={styles.actionText}>Search Food</Text>
                </Pressable>

                <Pressable style={styles.actionBtn} onPress={() => openNlp(meal.id)}>
                  <Sparkles size={16} color="#C7D2FE" />
                  <Text style={styles.actionText}>Describe Food</Text>
                </Pressable>

                <Pressable style={styles.actionBtn} onPress={() => openPhoto(meal.id)}>
                  <Camera size={16} color="#C7D2FE" />
                  <Text style={styles.actionText}>Photo Log</Text>
                </Pressable>
              </View>
            </View>
          ))}

          <Pressable style={styles.addMealBtn} onPress={addMeal}>
            <Text style={styles.addMealText}>+ Add another meal</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* SEARCH SHEET */}
      <BottomSheet visible={searchOpen} onClose={() => setSearchOpen(false)}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Search Food</Text>
        </View>
        <View style={styles.searchWrap}>
          <Search size={16} color="#6B7280" />
          <TextInput
            placeholder="Search Indian foods, brands…"
            placeholderTextColor="#6B7280"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
        </View>
        {basket.length > 0 && (
          <View style={styles.basketBar}>
            <Text style={styles.basketText}>
              {basket.length} items in basket
            </Text>
            <Pressable style={styles.basketBtn} onPress={addBasketToMeal}>
              <Text style={styles.basketBtnText}>Add to meal</Text>
            </Pressable>
          </View>
        )}
        <ScrollView contentContainerStyle={{ paddingVertical: 10 }}>
          {results.map(item => (
            <View key={item.id} style={styles.sheetRow}>
              <Pressable
                style={styles.sheetRowMain}
                onPress={() => {
                  setSearchOpen(false);
                  router.push({
                    pathname: '/FoodDetail',
                    params: { item: JSON.stringify(item), mealId: activeMealId ?? '' },
                  });
                }}
              >
                <View style={styles.foodIcon}>
                  <Utensils size={14} color="#A5B4FC" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.foodName}>{item.name}</Text>
                  <Text style={styles.foodSub}>
                    {item.serving} • {item.calories} kcal
                  </Text>
                </View>
              </Pressable>
              <Pressable
                style={styles.sheetAddBtn}
                onPress={() => {
                  addToBasket({
                    item,
                    quantity: 1,
                    unit: 'Serving',
                    calories: item.calories,
                    protein: item.protein,
                    carbs: item.carbs,
                    fats: item.fats,
                    fiber: item.fiber ?? 0,
                  });
                }}
              >
                <Text style={styles.sheetCta}>Add</Text>
              </Pressable>
            </View>
          ))}
        </ScrollView>
      </BottomSheet>

      {/* NLP SHEET */}
      <BottomSheet visible={nlpOpen} onClose={() => setNlpOpen(false)}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Describe Food</Text>
          <Text style={styles.sheetHint}>AI parsing enabled</Text>
        </View>
        <TextInput
          placeholder="E.g. ate 1 bowl rice and 250g chicken"
          placeholderTextColor="#6B7280"
          value={nlpText}
          onChangeText={setNlpText}
          multiline
          style={styles.nlpInput}
        />
        <Pressable
          style={styles.sheetPrimary}
          onPress={() => {
            setStatus('Meal added');
            setNlpOpen(false);
            setNlpText('');
          }}
        >
          <Text style={styles.sheetPrimaryText}>Log meal</Text>
        </Pressable>
        <Text style={styles.sheetNote}>You can always edit this later.</Text>
      </BottomSheet>

      {/* PHOTO SHEET */}
      <BottomSheet visible={photoOpen} onClose={() => setPhotoOpen(false)}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Photo Log</Text>
          <Text style={styles.sheetHint}>Analyzing…</Text>
        </View>
        <View style={styles.photoPreview}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1546069901-eacef0df6022?q=80&w=600&auto=format&fit=crop' }}
            style={styles.photoImage}
          />
        </View>
        <Pressable
          style={styles.sheetPrimary}
          onPress={() => {
            setStatus('Meal added');
            setPhotoOpen(false);
          }}
        >
          <Text style={styles.sheetPrimaryText}>Confirm foods</Text>
        </Pressable>
        <Text style={styles.sheetNote}>We’ll let you adjust before logging.</Text>
      </BottomSheet>

      {status && <View style={styles.toast}><Text style={styles.toastText}>{status}</Text></View>}

      {/* ITEM MENU */}
      <BottomSheet visible={itemMenuOpen} onClose={() => setItemMenuOpen(false)}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{activeItem?.item.name ?? 'Food item'}</Text>
          <Text style={styles.sheetHint}>You can always edit this later.</Text>
        </View>
        <Pressable
          style={styles.sheetOption}
          onPress={() => {
            setStatus('Move coming soon');
            setItemMenuOpen(false);
          }}
        >
          <Text style={styles.sheetOptionText}>Move</Text>
        </Pressable>
        <Pressable
          style={styles.sheetOption}
          onPress={() => {
            setStatus('Edit coming soon');
            setItemMenuOpen(false);
          }}
        >
          <Text style={styles.sheetOptionText}>Edit</Text>
        </Pressable>
        <Pressable style={[styles.sheetOption, styles.sheetOptionDanger]} onPress={deleteItem}>
          <Text style={[styles.sheetOptionText, styles.sheetOptionDangerText]}>Delete</Text>
        </Pressable>
      </BottomSheet>
    </View>
  );
}

 

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: {
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: '#fff', fontSize: 17, fontWeight: '600' },
  insightsBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#0F0F0F',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  insightsText: { color: '#C7D2FE', fontSize: 11, fontWeight: '700' },
  scroll: { paddingBottom: 120 },

  summaryWrap: {
    paddingHorizontal: 24,
    paddingTop: 6,
    backgroundColor: '#000',
  },
  summaryWrap: {
    backgroundColor: '#000',
  },

  mealsWrap: { paddingHorizontal: 24, paddingTop: 24, gap: 18 },
  mealCard: {
    backgroundColor: '#0F0F0F',
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottomWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  mealTitle: { color: '#E5E7EB', fontSize: 16, fontWeight: '700' },
  mealCalories: { color: '#6B7280', fontSize: 13 },
  mealEmpty: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealEmptyIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#0B1220',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealEmptyText: { color: '#4B5563', fontSize: 12 },
  foodList: { marginTop: 12, gap: 10 },
  foodRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  foodIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#0B1220',
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodName: { color: '#fff', fontSize: 13, fontWeight: '600' },
  foodSub: { color: '#6B7280', fontSize: 11, marginTop: 2 },
  foodMore: { color: '#6B7280', fontSize: 11, marginTop: 4 },
  foodMenu: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#101010',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderColor: 'rgba(255,255,255,0.05)' },
  actionBtn: {
    flex: 1,
    backgroundColor: '#101010',
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  actionText: { color: '#C7D2FE', fontSize: 11, fontWeight: '600' },

  addMealBtn: {
    marginTop: 4,
    backgroundColor: '#0F0F0F',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  addMealText: { color: '#C7D2FE', fontSize: 13, fontWeight: '700' },

  searchWrap: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#0F0F0F',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  searchInput: { color: '#fff', flex: 1, fontSize: 14 },

  sheetHeader: { gap: 6 },
  sheetTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sheetHint: { color: '#6B7280', fontSize: 12 },
  sheetRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  sheetRowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sheetAddBtn: {
    backgroundColor: '#1F2937',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sheetCta: { color: '#93C5FD', fontWeight: '700', fontSize: 12 },
  basketBar: {
    marginTop: 10,
    backgroundColor: '#0F0F0F',
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  basketText: { color: '#E5E7EB', fontSize: 12, fontWeight: '600' },
  basketBtn: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  basketBtnText: { color: '#0B0B0B', fontWeight: '800', fontSize: 12 },
  nlpInput: {
    marginTop: 12,
    minHeight: 100,
    backgroundColor: '#0F0F0F',
    borderRadius: 16,
    padding: 14,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    textAlignVertical: 'top',
  },
  sheetPrimary: {
    marginTop: 14,
    backgroundColor: '#93C5FD',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sheetPrimaryText: { color: '#0B0B0B', fontWeight: '800', fontSize: 13 },
  sheetNote: { color: '#6B7280', fontSize: 11, marginTop: 8 },
  photoPreview: {
    marginTop: 14,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  photoImage: { width: '100%', height: 160 },

  toast: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    right: 24,
    backgroundColor: '#111',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  toastText: { color: '#E5E7EB', fontSize: 12, fontWeight: '600' },

  sheetOption: {
    marginTop: 10,
    backgroundColor: '#0F0F0F',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  sheetOptionText: { color: '#E5E7EB', fontSize: 13, fontWeight: '700' },
  sheetOptionDanger: {
    borderColor: 'rgba(239,68,68,0.35)',
  },
  sheetOptionDangerText: { color: '#FCA5A5' },
});
