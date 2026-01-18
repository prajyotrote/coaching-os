import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { useState, useMemo } from 'react';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const MIN_KG = 30;
const MAX_KG = 250;
const STEP = 0.1;
const ITEM_WIDTH = 12;

const VALUES = Array.from(
  { length: (MAX_KG - MIN_KG) * 10 + 1 },
  (_, i) => MIN_KG + i * STEP
);

export default function WeightScreen() {
  const [weightKg, setWeightKg] = useState(62.2);
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');

  const displayValue = useMemo(() => {
    if (unit === 'kg') return weightKg.toFixed(1);
    return (weightKg * 2.20462).toFixed(1);
  }, [weightKg, unit]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Feather name="chevron-left" size={26} color="#94a3b8" />
        </Pressable>

        <Pressable onPress={() => router.replace('/Onboarding/user/activitylevel')}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      {/* Title */}
      <Text style={styles.title}>What’s your weight?</Text>
      <Text style={styles.subtitle}>
        Used to track progress & calculate health metrics
      </Text>

      {/* Unit Toggle */}
      <View style={styles.unitToggle}>
        <Pressable
          style={[styles.unitBtn, unit === 'kg' && styles.unitActive]}
          onPress={() => setUnit('kg')}
        >
          <Text style={styles.unitText}>kg</Text>
        </Pressable>
        <Pressable
          style={[styles.unitBtn, unit === 'lbs' && styles.unitActive]}
          onPress={() => setUnit('lbs')}
        >
          <Text style={styles.unitText}>lbs</Text>
        </Pressable>
      </View>

      {/* Display */}
      <View style={styles.display}>
        <Text style={styles.value}>{displayValue}</Text>
        <Text style={styles.unitLabel}>{unit}</Text>
      </View>

      {/* Scale */}
      <View style={styles.scaleWrapper}>
        <View style={styles.indicator} />

        <FlatList
          data={VALUES}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={ITEM_WIDTH}
          decelerationRate="fast"
          contentContainerStyle={{ paddingHorizontal: 180 }}
          getItemLayout={(_, index) => ({
            length: ITEM_WIDTH,
            offset: ITEM_WIDTH * index,
            index,
          })}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(
              e.nativeEvent.contentOffset.x / ITEM_WIDTH
            );
            setWeightKg(VALUES[index]);
          }}
          renderItem={({ item }) => {
            const isMajor = Math.round(item * 10) % 10 === 0;
            const isHalf = Math.round(item * 10) % 5 === 0;

            return (
              <View style={styles.tick}>
                <View
                  style={[
                    styles.line,
                    isMajor && styles.majorLine,
                    isHalf && !isMajor && styles.halfLine,
                  ]}
                />
                {isMajor && (
                  <Text style={styles.label}>{item.toFixed(0)}</Text>
                )}
              </View>
            );
          }}
        />
      </View>

      {/* Next */}
      <Pressable
        style={styles.next}
        onPress={() => router.replace('/Onboarding/user/activitylevel')}
      >
        <Text style={styles.nextText}>Next</Text>
        <Feather name="arrow-right" size={18} color="#000" />
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  skip: {
    color: '#64748b',
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    color: '#94a3b8',
    marginTop: 8,
    marginBottom: 24,
  },
  unitToggle: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#020617',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  unitBtn: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 10,
  },
  unitActive: {
    backgroundColor: '#0f172a',
  },
  unitText: {
    color: '#fff',
    fontWeight: '700',
  },
  display: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 30,
  },
  value: {
    fontSize: 64,
    fontWeight: '900',
    color: '#fff',
  },
  unitLabel: {
    marginLeft: 8,
    color: '#14b8a6',
    fontSize: 18,
    fontWeight: '700',
  },
  scaleWrapper: {
    height: 160,
    justifyContent: 'center',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#14b8a6',
    alignSelf: 'center',
    zIndex: 10,
  },
  tick: {
    width: ITEM_WIDTH,
    alignItems: 'center',
  },
  line: {
    height: 20,
    width: 2,
    backgroundColor: '#1e293b',
  },
  halfLine: {
    height: 28,
    backgroundColor: '#475569',
  },
  majorLine: {
    height: 40,
    backgroundColor: '#14b8a6',
  },
  label: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
    color: '#64748b',
  },
  next: {
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 40,
  },
  nextText: {
    fontWeight: '800',
    fontSize: 18,
    color: '#000',
  },
});
