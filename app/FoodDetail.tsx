import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
} from 'react-native';
import { ArrowLeft, ChevronDown, Wheat, Droplets, Activity, Leaf } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
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
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color="#fff" />
        </Pressable>
        <Text style={styles.title}>Food</Text>
        <Text style={styles.sub}>No item found.</Text>
      </View>
    );
  }

  const factor = qty * unit.factor;
  const calories = Math.round(item.calories * factor);
  const protein = Math.round(item.protein * factor);
  const carbs = Math.round(item.carbs * factor);
  const fats = Math.round(item.fats * factor);
  const fiber = Math.round((item.fiber ?? 0) * factor);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color="#fff" />
        </Pressable>
        <Text style={styles.title}>{item.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Image
            source={{
              uri:
                'https://images.unsplash.com/photo-1546069901-eacef0df6022?q=80&w=900&auto=format&fit=crop',
            }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroName}>{item.name}</Text>
            <Text style={styles.heroServing}>75 kcal / {item.serving}</Text>
          </View>
          <View style={styles.heroMacroRow}>
            <MacroPill label="Carbs" value={`${carbs}g`} icon={Wheat} />
            <MacroPill label="Fats" value={`${fats}g`} icon={Droplets} />
            <MacroPill label="Proteins" value={`${protein}g`} icon={Activity} />
            <MacroPill label="Fibre" value={`${fiber}g`} icon={Leaf} />
          </View>
        </View>

        <View style={styles.selectRow}>
          <View style={styles.selectCard}>
            <Text style={styles.selectLabel}>Quantity</Text>
            <Pressable style={styles.selectValueRow} onPress={() => setQtyOpen(true)}>
              <Text style={styles.selectValue}>{qty.toFixed(1)}</Text>
              <ChevronDown size={14} color="#9CA3AF" />
            </Pressable>
          </View>
          <View style={styles.selectCard}>
            <Text style={styles.selectLabel}>Measure</Text>
            <Pressable style={styles.selectValueRow} onPress={() => setUnitOpen(true)}>
              <Text style={styles.selectValue}>{unit.label}</Text>
              <ChevronDown size={14} color="#9CA3AF" />
            </Pressable>
          </View>
        </View>

        <View style={styles.breakdownCard}>
          <View style={styles.breakdownHeader}>
            <Text style={styles.breakdownTitle}>Macronutrients Breakdown</Text>
            <View style={styles.weightPill}>
              <Text style={styles.weightText}>Net wt: 124 g</Text>
            </View>
          </View>
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Calories</Text>
            <Text style={styles.breakdownValue}>{calories} Cal</Text>
          </View>
          <View style={styles.breakdownLine} />
          <MacroLine label="Proteins" value={`${protein} g`} />
          <MacroLine label="Fats" value={`${fats} g`} />
          <MacroLine label="Carbs" value={`${carbs} g`} />
          <MacroLine label="Fiber" value={`${fiber} g`} />
        </View>

      </ScrollView>

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
        <Text style={styles.addText}>Add food</Text>
      </Pressable>

      <BottomSheet visible={qtyOpen} onClose={() => setQtyOpen(false)}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Quantity</Text>
        </View>
        {[0.5, 1, 1.5, 2, 2.5, 3].map(v => (
          <Pressable
            key={v}
            style={styles.sheetOption}
            onPress={() => {
              setQty(v);
              setQtyOpen(false);
            }}
          >
            <Text style={styles.sheetOptionText}>{v.toFixed(1)}</Text>
          </Pressable>
        ))}
      </BottomSheet>

      <BottomSheet visible={unitOpen} onClose={() => setUnitOpen(false)}>
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>Measure</Text>
        </View>
        {UNIT_OPTIONS.map(opt => (
          <Pressable
            key={opt.label}
            style={styles.sheetOption}
            onPress={() => {
              setUnit(opt);
              setUnitOpen(false);
            }}
          >
            <Text style={styles.sheetOptionText}>{opt.label}</Text>
          </Pressable>
        ))}
      </BottomSheet>
    </View>
  );
}

function Macro({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.macroItem}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>{value}</Text>
    </View>
  );
}

function MacroPill({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: any;
}) {
  return (
    <View style={styles.macroPill}>
      <View style={styles.macroPillIcon}>
        <Icon size={14} color="#93C5FD" />
      </View>
      <Text style={styles.macroPillLabel}>{label}</Text>
      <Text style={styles.macroPillValue}>{value}</Text>
    </View>
  );
}

function MacroLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.macroLine}>
      <Text style={styles.macroLineLabel}>{label}</Text>
      <Text style={styles.macroLineValue}>{value}</Text>
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sub: { color: '#6B7280', marginTop: 12 },
  scroll: { paddingHorizontal: 24, paddingBottom: 120 },
  hero: {
    marginTop: 10,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  heroImage: { width: '100%', height: 220 },
  heroOverlay: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: 16,
  },
  heroName: { color: '#F3F4F6', fontSize: 18, fontWeight: '700' },
  heroServing: { color: '#D1D5DB', fontSize: 12, marginTop: 4 },
  heroMacroRow: {
    position: 'absolute',
    left: 10,
    right: 10,
    bottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  macroPill: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 16,
    paddingVertical: 10,
  },
  macroPillIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0B1220',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  macroPillLabel: { color: '#E5E7EB', fontSize: 11 },
  macroPillValue: { color: '#C7D2FE', fontSize: 12, fontWeight: '700', marginTop: 2 },
  selectRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
  selectCard: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  selectLabel: { color: '#6B7280', fontSize: 11 },
  selectValueRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  selectValue: { color: '#E5E7EB', fontSize: 16, fontWeight: '700' },
  breakdownCard: {
    marginTop: 16,
    backgroundColor: '#0F0F0F',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  breakdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownTitle: { color: '#E5E7EB', fontSize: 13, fontWeight: '700' },
  weightPill: {
    backgroundColor: '#111',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  weightText: { color: '#9CA3AF', fontSize: 11 },
  breakdownRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  breakdownLabel: { color: '#9CA3AF', fontSize: 12 },
  breakdownValue: { color: '#F3F4F6', fontSize: 20, fontWeight: '800' },
  breakdownLine: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 12,
  },
  macroLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  macroLineLabel: { color: '#9CA3AF', fontSize: 12 },
  macroLineValue: { color: '#E5E7EB', fontSize: 12, fontWeight: '700' },
  addBtn: {
    position: 'absolute',
    bottom: 18,
    left: 24,
    right: 24,
    backgroundColor: '#8B5CF6',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
  },
  addText: { color: '#0B0B0B', fontWeight: '800', fontSize: 14 },
  sheetHeader: { gap: 8 },
  sheetTitle: { color: '#E5E7EB', fontSize: 16, fontWeight: '700' },
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
});
