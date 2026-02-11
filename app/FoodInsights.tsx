import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated } from 'react-native';
import { ArrowLeft, Flame, Leaf, Wheat, Droplets, Activity } from 'lucide-react-native';
import { router } from 'expo-router';
import SegmentedControl from '@/components/ui/SegmentedControl';
import { getMeals, subscribeMeals, Meal } from '@/logic/foodMeals';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function FoodInsights() {
  const [meals, setMeals] = useState<Meal[]>(getMeals());
  const tabs = ['All meals', ...meals.map(m => m.title)];
  const [tab, setTab] = useState<string>(tabs[0]);

  const filteredMeals = useMemo(() => {
    if (tab === 'All meals') return meals;
    return meals.filter(m => m.title === tab);
  }, [meals, tab]);

  useEffect(() => {
    const unsub = subscribeMeals(setMeals);
    return () => unsub();
  }, []);

  const totals = useMemo(() => {
    const items = filteredMeals.flatMap(m => m.items);
    const calories = items.reduce((s, x) => s + x.calories, 0);
    const protein = items.reduce((s, x) => s + x.protein, 0);
    const carbs = items.reduce((s, x) => s + x.carbs, 0);
    const fats = items.reduce((s, x) => s + x.fats, 0);
    const fiber = items.reduce((s, x) => s + (x.fiber ?? 0), 0);
    return { calories, protein, carbs, fats, fiber };
  }, [filteredMeals]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color="#fff" />
        </Pressable>
        <Text style={styles.title}>Insights</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.tabs}>
        <SegmentedControl
          options={tabs}
          selected={tab}
          onChange={setTab}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.heroRow}>
          <RingCard
            label="Calories"
            value={`${totals.calories}`}
            unit="kcal"
            target={2200}
            color="#A78BFA"
            icon={<Flame size={14} color="#C4B5FD" />}
            floating
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Macros</Text>
          <View style={styles.macroGrid}>
            <Macro label="Protein" value={`${totals.protein} g`} icon={<Activity size={14} color="#93C5FD" />} />
            <Macro label="Carbs" value={`${totals.carbs} g`} icon={<Wheat size={14} color="#C4B5FD" />} />
            <Macro label="Fats" value={`${totals.fats} g`} icon={<Droplets size={14} color="#F2B27A" />} />
            <Macro label="Fiber" value={`${totals.fiber} g`} icon={<Leaf size={14} color="#86EFAC" />} />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Coach insight</Text>
          <Text style={styles.cardBody}>
            Keep meals balanced—aim for protein at every meal and add fiber from
            whole grains or vegetables.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Micros (preview)</Text>
          <Text style={styles.cardBody}>
            Coming soon: iron, calcium, potassium, and sodium breakdown once the
            full food database is connected.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function Macro({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <View style={styles.macroItem}>
      <View style={styles.macroIcon}>{icon}</View>
      <View>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValue}>{value}</Text>
      </View>
    </View>
  );
}

function RingCard({
  label,
  value,
  unit,
  target,
  color,
  icon,
  floating,
}: {
  label: string;
  value: string;
  unit: string;
  target: number;
  color: string;
  icon: React.ReactNode;
  floating?: boolean;
}) {
  const progress = Math.min(Number(value) / Math.max(target, 1), 1);
  const r = 34;
  const stroke = 6;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - progress);
  const animatedOffset = useRef(new Animated.Value(c)).current;

  useEffect(() => {
    Animated.timing(animatedOffset, {
      toValue: offset,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [offset]);
  return (
    <View style={[styles.ringCard, floating && styles.ringCardFloating]}>
      <View style={styles.ringIcon}>{icon}</View>
      <View style={styles.ringWrap}>
        <View style={styles.ringCenter}>
          <Text style={styles.ringValue}>{value}</Text>
          <Text style={styles.ringUnit}>{unit}</Text>
        </View>
        <Svg width={90} height={90}>
          <Circle cx="45" cy="45" r={r} stroke="#141414" strokeWidth={stroke} fill="none" />
          <AnimatedCircle
            cx="45"
            cy="45"
            r={r}
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={c}
            strokeDashoffset={animatedOffset}
            strokeLinecap="round"
            fill="none"
            rotation="-90"
            origin="45,45"
          />
        </Svg>
      </View>
      <Text style={styles.ringLabel}>{label}</Text>
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
  tabs: { paddingHorizontal: 24, marginTop: 8 },
  scroll: { paddingHorizontal: 24, paddingBottom: 120, paddingTop: 18 },
  heroRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  ringCard: {
    flex: 1,
    alignItems: 'center',
  },
  ringCardFloating: {
    backgroundColor: 'transparent',
  },
  ringWrap: { alignItems: 'center', justifyContent: 'center' },
  ringCenter: { position: 'absolute', alignItems: 'center' },
  ringValue: { color: '#E5E7EB', fontSize: 16, fontWeight: '800' },
  ringUnit: { color: '#6B7280', fontSize: 10, marginTop: 2 },
  ringLabel: { color: '#9CA3AF', fontSize: 12, marginTop: 8 },
  ringIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0B1220',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#0F0F0F',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 16,
  },
  cardTitle: { color: '#E5E7EB', fontSize: 13, fontWeight: '700' },
  cardBody: { color: '#9CA3AF', fontSize: 12, marginTop: 8, lineHeight: 18 },
  macroGrid: { marginTop: 12, flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  macroItem: {
    width: '47%',
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: '#0B0B0B',
    padding: 10,
    borderRadius: 14,
  },
  macroIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0B1220',
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroLabel: { color: '#6B7280', fontSize: 11 },
  macroValue: { color: '#E5E7EB', fontSize: 14, fontWeight: '700', marginTop: 4 },
});
