import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Animated } from 'react-native';
import { ArrowLeft, Flame, Leaf, Wheat, Droplets, Activity, Lightbulb, Sparkles } from 'lucide-react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
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

  const macroData = [
    { label: 'Protein', value: totals.protein, unit: 'g', color: '#60a5fa', icon: Activity, target: 120 },
    { label: 'Carbs', value: totals.carbs, unit: 'g', color: '#a78bfa', icon: Wheat, target: 250 },
    { label: 'Fats', value: totals.fats, unit: 'g', color: '#fbbf24', icon: Droplets, target: 70 },
    { label: 'Fiber', value: totals.fiber, unit: 'g', color: '#34d399', icon: Leaf, target: 30 },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f0f1a', '#000000', '#050510']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#fff" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.title}>Insights</Text>
          <Text style={styles.subtitle}>Nutrition analysis</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.tabs}>
        <SegmentedControl
          options={tabs}
          selected={tab}
          onChange={setTab}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero Calories Ring */}
        <View style={styles.heroSection}>
          <RingCard
            label="Calories"
            value={`${totals.calories}`}
            unit="kcal"
            target={2200}
            color="#a78bfa"
            icon={<Flame size={16} color="#a78bfa" />}
          />
        </View>

        {/* Macros Section */}
        <Text style={styles.sectionTitle}>MACRONUTRIENTS</Text>
        <View style={styles.macroGrid}>
          {macroData.map(m => (
            <MacroCard key={m.label} {...m} />
          ))}
        </View>

        {/* Coach Insight */}
        <Text style={styles.sectionTitle}>COACH INSIGHT</Text>
        <View style={styles.insightCard}>
          <LinearGradient
            colors={['rgba(96,165,250,0.12)', 'rgba(96,165,250,0.04)']}
            style={styles.insightCardInner}
          >
            <View style={styles.insightHeader}>
              <View style={styles.insightIconWrap}>
                <Lightbulb size={16} color="#60a5fa" />
              </View>
              <Text style={styles.insightTitle}>Nutrition Tip</Text>
            </View>
            <Text style={styles.insightBody}>
              Keep meals balanced—aim for protein at every meal and add fiber from
              whole grains or vegetables.
            </Text>
          </LinearGradient>
        </View>

        {/* Coming Soon */}
        <Text style={styles.sectionTitle}>COMING SOON</Text>
        <View style={styles.comingSoonCard}>
          <LinearGradient
            colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
            style={styles.comingSoonInner}
          >
            <View style={styles.comingSoonIcon}>
              <Sparkles size={20} color="#a78bfa" />
            </View>
            <Text style={styles.comingSoonTitle}>Micronutrients</Text>
            <Text style={styles.comingSoonBody}>
              Iron, calcium, potassium, and sodium breakdown once the full food database is connected.
            </Text>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
}

function MacroCard({
  label,
  value,
  unit,
  color,
  icon: Icon,
  target,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
  icon: any;
  target: number;
}) {
  const progress = Math.min(value / target, 1);
  return (
    <View style={styles.macroCard}>
      <LinearGradient
        colors={[`${color}18`, `${color}08`]}
        style={styles.macroCardInner}
      >
        <View style={styles.macroCardHeader}>
          <View style={[styles.macroCardIcon, { backgroundColor: `${color}25` }]}>
            <Icon size={14} color={color} />
          </View>
          <Text style={styles.macroCardLabel}>{label}</Text>
        </View>
        <Text style={styles.macroCardValue}>
          {value}<Text style={styles.macroCardUnit}>{unit}</Text>
        </Text>
        <View style={styles.macroProgress}>
          <View style={[styles.macroProgressFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.macroTarget}>{target}{unit} target</Text>
      </LinearGradient>
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
}: {
  label: string;
  value: string;
  unit: string;
  target: number;
  color: string;
  icon: React.ReactNode;
}) {
  const progress = Math.min(Number(value) / Math.max(target, 1), 1);
  const percent = Math.round(progress * 100);
  const r = 60;
  const stroke = 10;
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
    <View style={styles.ringCard}>
      <LinearGradient
        colors={['rgba(167,139,250,0.15)', 'rgba(167,139,250,0.05)']}
        style={styles.ringCardInner}
      >
        <View style={styles.ringIcon}>{icon}</View>
        <View style={styles.ringWrap}>
          <View style={styles.ringCenter}>
            <Text style={styles.ringValue}>{value}</Text>
            <Text style={styles.ringUnit}>{unit}</Text>
          </View>
          <Svg width={140} height={140}>
            <Circle cx="70" cy="70" r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
            <AnimatedCircle
              cx="70"
              cy="70"
              r={r}
              stroke={color}
              strokeWidth={stroke}
              strokeDasharray={c}
              strokeDashoffset={animatedOffset}
              strokeLinecap="round"
              fill="none"
              rotation="-90"
              origin="70,70"
            />
          </Svg>
        </View>
        <View style={styles.ringMeta}>
          <Text style={styles.ringLabel}>{label}</Text>
          <Text style={styles.ringPercent}>{percent}% of daily goal</Text>
        </View>
        <View style={styles.ringTargetRow}>
          <Text style={styles.ringTargetLabel}>Target</Text>
          <Text style={styles.ringTargetValue}>{target} {unit}</Text>
        </View>
      </LinearGradient>
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

  tabs: { paddingHorizontal: 20, marginTop: 10 },
  scroll: { paddingHorizontal: 20, paddingBottom: 120, paddingTop: 20 },

  sectionTitle: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 24,
    marginBottom: 12,
  },

  heroSection: {
    alignItems: 'center',
  },

  ringCard: {
    width: '100%',
    borderRadius: 28,
    overflow: 'hidden',
  },
  ringCardInner: {
    alignItems: 'center',
    padding: 24,
  },
  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  ringValue: { color: '#fff', fontSize: 32, fontWeight: '900' },
  ringUnit: { color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 },
  ringIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(167,139,250,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringMeta: {
    alignItems: 'center',
    marginTop: 8,
  },
  ringLabel: { color: '#fff', fontSize: 16, fontWeight: '700' },
  ringPercent: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 },
  ringTargetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  ringTargetLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  ringTargetValue: { color: '#fff', fontSize: 14, fontWeight: '700' },

  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  macroCard: {
    width: '47%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  macroCardInner: {
    padding: 16,
  },
  macroCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  macroCardIcon: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroCardLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600' },
  macroCardValue: { color: '#fff', fontSize: 24, fontWeight: '900' },
  macroCardUnit: { color: 'rgba(255,255,255,0.4)', fontSize: 14, fontWeight: '600' },
  macroProgress: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginTop: 12,
    overflow: 'hidden',
  },
  macroProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  macroTarget: { color: 'rgba(255,255,255,0.3)', fontSize: 10, marginTop: 8 },

  insightCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  insightCardInner: {
    padding: 20,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  insightIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(96,165,250,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightTitle: { color: '#fff', fontSize: 15, fontWeight: '700' },
  insightBody: { color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 22 },

  comingSoonCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  comingSoonInner: {
    padding: 24,
    alignItems: 'center',
  },
  comingSoonIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(167,139,250,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  comingSoonTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  comingSoonBody: { color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center', lineHeight: 20 },
});
