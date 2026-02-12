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
import { ArrowLeft, Camera, ChevronRight, MoreVertical, Plus, Search, Sparkles, TrendingUp, Utensils } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
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
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0f0f1a', '#000000', '#050510']}
        style={StyleSheet.absoluteFill}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#fff" />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.title}>Nutrition</Text>
          <Text style={styles.subtitle}>Track your meals</Text>
        </View>

        <Pressable
          style={styles.insightsBtn}
          onPress={() => router.push('/FoodInsights')}
        >
          <TrendingUp size={16} color="#a78bfa" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* SUMMARY */}
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

        {/* MEALS SECTION */}
        <View style={styles.mealsWrap}>
          <Text style={styles.sectionTitle}>TODAY'S MEALS</Text>
          {meals.map((meal, mealIndex) => {
            const mealCalories = meal.items.reduce((s, x) => s + x.calories, 0);
            const mealColors = [
              ['rgba(96,165,250,0.12)', 'rgba(96,165,250,0.04)'],
              ['rgba(167,139,250,0.12)', 'rgba(167,139,250,0.04)'],
              ['rgba(251,191,36,0.12)', 'rgba(251,191,36,0.04)'],
            ];
            const accentColors = ['#60a5fa', '#a78bfa', '#fbbf24'];
            const colorIndex = mealIndex % 3;

            return (
              <View key={meal.id} style={styles.mealCard}>
                <LinearGradient
                  colors={mealColors[colorIndex] as [string, string]}
                  style={styles.mealCardInner}
                >
                  <View style={styles.mealHeader}>
                    <View style={styles.mealTitleRow}>
                      <View style={[styles.mealDot, { backgroundColor: accentColors[colorIndex] }]} />
                      <Text style={styles.mealTitle}>{meal.title}</Text>
                    </View>
                    <View style={styles.mealCaloriesBadge}>
                      <Text style={styles.mealCalories}>{mealCalories}</Text>
                      <Text style={styles.mealCaloriesUnit}>kcal</Text>
                    </View>
                  </View>

                  {meal.items.length > 0 ? (
                    <View style={styles.foodList}>
                      {meal.items.slice(0, 3).map((item, idx) => (
                        <View key={`${meal.id}-${item.id}-${idx}`} style={styles.foodRow}>
                          <View style={[styles.foodIcon, { backgroundColor: `${accentColors[colorIndex]}20` }]}>
                            <Utensils size={14} color={accentColors[colorIndex]} />
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
                            <MoreVertical size={14} color="rgba(255,255,255,0.4)" />
                          </Pressable>
                        </View>
                      ))}
                      {meal.items.length > 3 && (
                        <Pressable style={styles.foodMoreBtn}>
                          <Text style={styles.foodMore}>
                            +{meal.items.length - 3} more items
                          </Text>
                          <ChevronRight size={14} color="rgba(255,255,255,0.4)" />
                        </Pressable>
                      )}
                    </View>
                  ) : (
                    <View style={styles.mealEmpty}>
                      <View style={[styles.mealEmptyIcon, { backgroundColor: `${accentColors[colorIndex]}15` }]}>
                        <Utensils size={18} color={accentColors[colorIndex]} />
                      </View>
                      <Text style={styles.mealEmptyText}>No items logged yet</Text>
                      <Text style={styles.mealEmptyHint}>Tap below to add food</Text>
                    </View>
                  )}

                  <View style={styles.actionRow}>
                    <Pressable style={styles.actionBtn} onPress={() => openSearch(meal.id)}>
                      <Search size={15} color="#fff" />
                      <Text style={styles.actionText}>Search</Text>
                    </Pressable>

                    <Pressable style={styles.actionBtn} onPress={() => openNlp(meal.id)}>
                      <Sparkles size={15} color="#fff" />
                      <Text style={styles.actionText}>AI Log</Text>
                    </Pressable>

                    <Pressable style={styles.actionBtn} onPress={() => openPhoto(meal.id)}>
                      <Camera size={15} color="#fff" />
                      <Text style={styles.actionText}>Photo</Text>
                    </Pressable>
                  </View>
                </LinearGradient>
              </View>
            );
          })}

          <Pressable style={styles.addMealBtn} onPress={addMeal}>
            <LinearGradient
              colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
              style={styles.addMealBtnInner}
            >
              <Plus size={18} color="#a78bfa" />
              <Text style={styles.addMealText}>Add another meal</Text>
            </LinearGradient>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  title: { color: '#fff', fontSize: 18, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 },
  insightsBtn: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  scroll: { paddingBottom: 120 },

  summaryWrap: {
    paddingTop: 10,
  },

  sectionTitle: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 14,
  },

  mealsWrap: { paddingHorizontal: 20, paddingTop: 10, gap: 14 },

  mealCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  mealCardInner: {
    padding: 18,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mealDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  mealTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  mealCaloriesBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  mealCalories: { color: '#fff', fontSize: 15, fontWeight: '900' },
  mealCaloriesUnit: { color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '600' },

  mealEmpty: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  mealEmptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  mealEmptyText: { color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600' },
  mealEmptyHint: { color: 'rgba(255,255,255,0.3)', fontSize: 11, marginTop: 4 },

  foodList: { gap: 10, marginBottom: 14 },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.2)',
    padding: 10,
    borderRadius: 14,
  },
  foodIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  foodSub: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 },
  foodMoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
  },
  foodMore: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
  foodMenu: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  actionRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  actionBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  actionText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  addMealBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderStyle: 'dashed',
  },
  addMealBtnInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  addMealText: { color: '#a78bfa', fontSize: 13, fontWeight: '700' },

  searchWrap: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  searchInput: { color: '#fff', flex: 1, fontSize: 15 },

  sheetHeader: { gap: 4, marginBottom: 6 },
  sheetTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  sheetHint: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  sheetRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
  },
  sheetRowMain: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sheetAddBtn: {
    backgroundColor: '#a78bfa',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sheetCta: { color: '#000', fontWeight: '800', fontSize: 12 },
  basketBar: {
    marginTop: 14,
    backgroundColor: 'rgba(167,139,250,0.15)',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.3)',
  },
  basketText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  basketBtn: {
    backgroundColor: '#a78bfa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  basketBtnText: { color: '#000', fontWeight: '800', fontSize: 12 },
  nlpInput: {
    marginTop: 14,
    minHeight: 120,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 18,
    padding: 16,
    color: '#fff',
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    textAlignVertical: 'top',
  },
  sheetPrimary: {
    marginTop: 16,
    backgroundColor: '#a78bfa',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  sheetPrimaryText: { color: '#000', fontWeight: '800', fontSize: 14 },
  sheetNote: { color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 10, textAlign: 'center' },
  photoPreview: {
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  photoImage: { width: '100%', height: 180 },

  toast: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(34,197,94,0.2)',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(34,197,94,0.4)',
  },
  toastText: { color: '#86efac', fontSize: 13, fontWeight: '700' },

  sheetOption: {
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sheetOptionText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  sheetOptionDanger: {
    backgroundColor: 'rgba(239,68,68,0.1)',
  },
  sheetOptionDangerText: { color: '#f87171' },
});
