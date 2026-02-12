import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
} from 'react-native';
import { ArrowLeft, Check, ChevronDown, Wheat, Droplets, Activity, Leaf } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import type { FoodItem } from '@/logic/food';
import { addToBasket } from '@/logic/foodBasket';
import BottomSheet from '@/components/BottomSheet';

type UnitOption = {
  label: string;
  factor: number; // multiplier vs base serving
};

const UNIT_OPTIONS: UnitOption[] = [
  { label: 'Katori', factor: 1 },
  { label: 'Bowl', factor: 1.5 },
  { label: 'Plate', factor: 2 },
  { label: 'Serving', factor: 1 },
];

export default function FoodDetail() {
  const params = useLocalSearchParams<{ item?: string; mealId?: string }>();
  const item = useMemo<FoodItem | null>(() => {
    if (!params.item) return null;
    try {
      return JSON.parse(params.item as string) as FoodItem;
    } catch {
      return null;
    }
  }, [params.item]);

  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState<UnitOption>(UNIT_OPTIONS[0]);
  const [qtyOpen, setQtyOpen] = useState(false);
  const [unitOpen, setUnitOpen] = useState(false);

  if (!item) {
    return (
      <View style={styles.container}>
        <LinearGradient colors={['#0f0f1a', '#000000', '#050510']} style={StyleSheet.absoluteFill} />
        <View style={styles.header}>
          <Pressable style={styles.iconBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} color="#fff" />
          </Pressable>
          <Text style={styles.title}>Food</Text>
          <View style={{ width: 44 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No item found.</Text>
        </View>
      </View>
    );
  }

  const factor = qty * unit.factor;
  const calories = Math.round(item.calories * factor);
  const protein = Math.round(item.protein * factor);
  const carbs = Math.round(item.carbs * factor);
  const fats = Math.round(item.fats * factor);
  const fiber = Math.round((item.fiber ?? 0) * factor);

  const macroData = [
    { label: 'Carbs', value: carbs, color: '#a78bfa', icon: Wheat },
    { label: 'Fats', value: fats, color: '#fbbf24', icon: Droplets },
    { label: 'Protein', value: protein, color: '#60a5fa', icon: Activity },
    { label: 'Fiber', value: fiber, color: '#34d399', icon: Leaf },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#0f0f1a', '#000000', '#050510']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#fff" />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.subtitle}>{item.serving}</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <View style={styles.hero}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1546069901-eacef0df6022?q=80&w=900&auto=format&fit=crop' }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.9)']}
            style={styles.heroGradient}
          />
          <View style={styles.heroContent}>
            <View style={styles.heroCalories}>
              <Text style={styles.heroCaloriesValue}>{calories}</Text>
              <Text style={styles.heroCaloriesUnit}>kcal</Text>
            </View>
          </View>
        </View>

        {/* Macro Pills */}
        <View style={styles.macroPillRow}>
          {macroData.map((m, idx) => (
            <MacroPill key={m.label} label={m.label} value={`${m.value}g`} icon={m.icon} color={m.color} />
          ))}
        </View>

        {/* Quantity & Measure */}
        <Text style={styles.sectionTitle}>SERVING SIZE</Text>
        <View style={styles.selectRow}>
          <Pressable style={styles.selectCard} onPress={() => setQtyOpen(true)}>
            <LinearGradient
              colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
              style={styles.selectCardInner}
            >
              <Text style={styles.selectLabel}>Quantity</Text>
              <View style={styles.selectValueRow}>
                <Text style={styles.selectValue}>{qty.toFixed(1)}</Text>
                <ChevronDown size={16} color="rgba(255,255,255,0.4)" />
              </View>
            </LinearGradient>
          </Pressable>
          <Pressable style={styles.selectCard} onPress={() => setUnitOpen(true)}>
            <LinearGradient
              colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
              style={styles.selectCardInner}
            >
              <Text style={styles.selectLabel}>Measure</Text>
              <View style={styles.selectValueRow}>
                <Text style={styles.selectValue}>{unit.label}</Text>
                <ChevronDown size={16} color="rgba(255,255,255,0.4)" />
              </View>
            </LinearGradient>
          </Pressable>
        </View>

        {/* Breakdown */}
        <Text style={styles.sectionTitle}>NUTRITION BREAKDOWN</Text>
        <View style={styles.breakdownCard}>
          <LinearGradient
            colors={['rgba(167,139,250,0.1)', 'rgba(167,139,250,0.03)']}
            style={styles.breakdownCardInner}
          >
            <View style={styles.breakdownHeader}>
              <Text style={styles.breakdownTitle}>Total Calories</Text>
              <View style={styles.weightPill}>
                <Text style={styles.weightText}>~124g</Text>
              </View>
            </View>
            <Text style={styles.breakdownValue}>{calories}</Text>
            <Text style={styles.breakdownValueUnit}>kilocalories</Text>

            <View style={styles.breakdownDivider} />

            <MacroLine label="Protein" value={`${protein}g`} color="#60a5fa" />
            <MacroLine label="Carbohydrates" value={`${carbs}g`} color="#a78bfa" />
            <MacroLine label="Fats" value={`${fats}g`} color="#fbbf24" />
            <MacroLine label="Fiber" value={`${fiber}g`} color="#34d399" />
          </LinearGradient>
        </View>
      </ScrollView>

      {/* Add Button */}
      <View style={styles.bottomBar}>
        <Pressable
          style={styles.addBtn}
          onPress={() => {
            addToBasket({
              item,
              quantity: qty,
              unit: unit.label,
              calories,
              protein,
              carbs,
              fats,
              fiber,
            });
            router.replace({
              pathname: '/Food',
              params: { openSearch: '1', mealId: params.mealId ?? '' },
            });
          }}
        >
          <LinearGradient
            colors={['#a78bfa', '#8b5cf6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.addBtnGradient}
          >
            <Check size={18} color="#000" />
            <Text style={styles.addText}>Add to Basket</Text>
          </LinearGradient>
        </Pressable>
      </View>

      {/* Quantity Sheet */}
      <BottomSheet visible={qtyOpen} onClose={() => setQtyOpen(false)}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Select Quantity</Text>
        </View>
        {[0.5, 1, 1.5, 2, 2.5, 3].map(v => (
          <Pressable
            key={v}
            style={[styles.sheetOption, qty === v && styles.sheetOptionActive]}
            onPress={() => {
              setQty(v);
              setQtyOpen(false);
            }}
          >
            <Text style={[styles.sheetOptionText, qty === v && styles.sheetOptionTextActive]}>
              {v.toFixed(1)}
            </Text>
            {qty === v && <Check size={16} color="#a78bfa" />}
          </Pressable>
        ))}
      </BottomSheet>

      {/* Unit Sheet */}
      <BottomSheet visible={unitOpen} onClose={() => setUnitOpen(false)}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Select Measure</Text>
        </View>
        {UNIT_OPTIONS.map(opt => (
          <Pressable
            key={opt.label}
            style={[styles.sheetOption, unit.label === opt.label && styles.sheetOptionActive]}
            onPress={() => {
              setUnit(opt);
              setUnitOpen(false);
            }}
          >
            <Text style={[styles.sheetOptionText, unit.label === opt.label && styles.sheetOptionTextActive]}>
              {opt.label}
            </Text>
            {unit.label === opt.label && <Check size={16} color="#a78bfa" />}
          </Pressable>
        ))}
      </BottomSheet>
    </View>
  );
}

function MacroPill({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
}) {
  return (
    <View style={styles.macroPill}>
      <View style={[styles.macroPillIcon, { backgroundColor: `${color}20` }]}>
        <Icon size={14} color={color} />
      </View>
      <Text style={styles.macroPillValue}>{value}</Text>
      <Text style={styles.macroPillLabel}>{label}</Text>
    </View>
  );
}

function MacroLine({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.macroLine}>
      <View style={styles.macroLineLeft}>
        <View style={[styles.macroLineDot, { backgroundColor: color }]} />
        <Text style={styles.macroLineLabel}>{label}</Text>
      </View>
      <Text style={styles.macroLineValue}>{value}</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
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

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { color: 'rgba(255,255,255,0.4)', fontSize: 14 },

  scroll: { paddingHorizontal: 20, paddingBottom: 140 },

  hero: {
    marginTop: 10,
    borderRadius: 24,
    overflow: 'hidden',
    height: 200,
  },
  heroImage: { width: '100%', height: '100%' },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  heroContent: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  heroCalories: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  heroCaloriesValue: { color: '#fff', fontSize: 36, fontWeight: '900' },
  heroCaloriesUnit: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600' },

  macroPillRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  macroPill: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    paddingVertical: 12,
    gap: 4,
  },
  macroPillIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  macroPillValue: { color: '#fff', fontSize: 14, fontWeight: '800' },
  macroPillLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 10 },

  sectionTitle: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 24,
    marginBottom: 12,
  },

  selectRow: {
    flexDirection: 'row',
    gap: 12,
  },
  selectCard: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  selectCardInner: {
    padding: 16,
  },
  selectLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '600' },
  selectValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  selectValue: { color: '#fff', fontSize: 20, fontWeight: '800' },

  breakdownCard: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  breakdownCardInner: {
    padding: 20,
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownTitle: { color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: '600' },
  weightPill: {
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  weightText: { color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '600' },
  breakdownValue: { color: '#fff', fontSize: 42, fontWeight: '900', marginTop: 8 },
  breakdownValueUnit: { color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 2 },
  breakdownDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 16,
  },

  macroLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  macroLineLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  macroLineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  macroLineLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  macroLineValue: { color: '#fff', fontSize: 14, fontWeight: '700' },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 16,
    backgroundColor: 'rgba(0,0,0,0.9)',
  },
  addBtn: {
    borderRadius: 18,
    overflow: 'hidden',
  },
  addBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
  },
  addText: { color: '#000', fontWeight: '800', fontSize: 15 },

  sheetHeader: { marginBottom: 8 },
  sheetTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  sheetOption: {
    marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sheetOptionActive: {
    backgroundColor: 'rgba(167,139,250,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(167,139,250,0.3)',
  },
  sheetOptionText: { color: '#fff', fontSize: 15, fontWeight: '600' },
  sheetOptionTextActive: { color: '#a78bfa', fontWeight: '700' },
});
