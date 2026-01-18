import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { useState, useMemo } from 'react';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const MIN_CM = 100;
const MAX_CM = 250;
const ITEM_HEIGHT = 12;

const HEIGHTS = Array.from(
  { length: MAX_CM - MIN_CM + 1 },
  (_, i) => MAX_CM - i
);

export default function HeightScreen() {
  const [heightCm, setHeightCm] = useState(175);
  const [unit, setUnit] = useState<'cm' | 'ft'>('cm');

  const displayHeight = useMemo(() => {
    if (unit === 'cm') return `${heightCm}`;

    const inches = heightCm / 2.54;
    const ft = Math.floor(inches / 12);
    const inch = Math.round(inches % 12);
    return `${ft}'${inch}"`;
  }, [heightCm, unit]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Feather name="chevron-left" size={26} color="#94a3b8" />
        </Pressable>

        <Pressable onPress={() => router.replace('/Onboarding/user/weight')}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      {/* Title */}
      <Text style={styles.title}>How tall are you?</Text>
      <Text style={styles.subtitle}>
        Used to calculate BMI & calorie needs.
      </Text>

      {/* Unit Toggle */}
      <View style={styles.unitToggle}>
        <Pressable
          style={[styles.unitBtn, unit === 'cm' && styles.unitActive]}
          onPress={() => setUnit('cm')}
        >
          <Text style={styles.unitText}>cm</Text>
        </Pressable>
        <Pressable
          style={[styles.unitBtn, unit === 'ft' && styles.unitActive]}
          onPress={() => setUnit('ft')}
        >
          <Text style={styles.unitText}>ft</Text>
        </Pressable>
      </View>

      {/* Height Display */}
      <View style={styles.display}>
        <Text style={styles.height}>{displayHeight}</Text>
        <Text style={styles.unitLabel}>{unit}</Text>
      </View>

      {/* Ruler */}
      <View style={styles.rulerWrapper}>
        <View style={styles.indicator} />

        <FlatList
          data={HEIGHTS}
          keyExtractor={(i) => String(i)}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          contentContainerStyle={{ paddingVertical: 200 }}
          getItemLayout={(_, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(
              e.nativeEvent.contentOffset.y / ITEM_HEIGHT
            );
            setHeightCm(HEIGHTS[index]);
          }}
          renderItem={({ item }) => {
            const isMajor = item % 5 === 0;
            const isActive = item === heightCm;

            return (
              <View style={styles.tick}>
                <View
                  style={[
                    styles.line,
                    isMajor && styles.majorLine,
                    isActive && styles.activeLine,
                  ]}
                />
                {isMajor && (
                  <Text
                    style={[
                      styles.label,
                      isActive && styles.activeLabel,
                    ]}
                  >
                    {item}
                  </Text>
                )}
              </View>
            );
          }}
        />
      </View>

      {/* Next */}
      <Pressable
        style={styles.next}
        onPress={() => router.replace('/Onboarding/user/weight')}
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
    marginBottom: 20,
  },
  height: {
    fontSize: 64,
    fontWeight: '900',
    color: '#fff',
  },
  unitLabel: {
    color: '#94a3b8',
    marginLeft: 8,
    fontSize: 18,
    fontWeight: '700',
  },
  rulerWrapper: {
    flex: 1,
    position: 'relative',
  },
  indicator: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#14b8a6',
    zIndex: 10,
  },
  tick: {
    height: ITEM_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    width: 20,
    height: 1,
    backgroundColor: '#1e293b',
  },
  majorLine: {
    width: 36,
    backgroundColor: '#64748b',
  },
  activeLine: {
    backgroundColor: '#14b8a6',
  },
  label: {
    marginLeft: 10,
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  activeLabel: {
    color: '#fff',
    fontSize: 14,
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
