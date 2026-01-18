import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { useState, useMemo, useRef } from 'react';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const ITEM_HEIGHT = 44;

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = [
  'Jan','Feb','Mar','Apr','May','Jun',
  'Jul','Aug','Sep','Oct','Nov','Dec',
];
const YEARS = Array.from({ length: 90 }, (_, i) => 2011 - i);

export default function AgeScreen() {
  const [day, setDay] = useState(17);
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(1996);

  const calcAge = useMemo(() => {
    const today = new Date();
    let age = today.getFullYear() - year;
    if (
      today.getMonth() < month ||
      (today.getMonth() === month && today.getDate() < day)
    ) {
      age--;
    }
    return Math.max(age, 0);
  }, [day, month, year]);

  const renderItem = (value: number | string, selected: boolean) => (
    <View style={[styles.item, selected && styles.itemActive]}>
      <Text style={[styles.itemText, selected && styles.itemTextActive]}>
        {value}
      </Text>
    </View>
  );

  const picker = (
    data: any[],
    selected: number,
    setSelected: (v: any) => void
  ) => (
    <FlatList
      data={data}
      keyExtractor={(i) => String(i)}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
      contentContainerStyle={{ paddingVertical: 110 }}
      getItemLayout={(_, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      })}
      onMomentumScrollEnd={(e) => {
        const index = Math.round(
          e.nativeEvent.contentOffset.y / ITEM_HEIGHT
        );
        setSelected(data[index]);
      }}
      renderItem={({ item }) =>
        renderItem(item, item === selected)
      }
    />
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Feather name="chevron-left" size={26} color="#94a3b8" />
        </Pressable>

        <Pressable onPress={() => router.replace('/Onboarding/user/height')}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      {/* Title */}
      <Text style={styles.title}>How old are you?</Text>
      <Text style={styles.subtitle}>
        This helps us personalize your plan.
      </Text>

      {/* Age Display */}
      <View style={styles.ageRow}>
        <Text style={styles.age}>{calcAge}</Text>
        <Text style={styles.years}>years</Text>
      </View>

      {/* Picker */}
      <View style={styles.pickerWrapper}>
        <View style={styles.highlight} />
        <View style={styles.pickerRow}>
          {picker(DAYS, day, setDay)}
          {picker(MONTHS, month, setMonth)}
          {picker(YEARS, year, setYear)}
        </View>
      </View>

      {/* Footer */}
      <Pressable
        style={styles.next}
        onPress={() => router.replace('/Onboarding/user/height')}
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
  ageRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 24,
  },
  age: {
    fontSize: 64,
    fontWeight: '900',
    color: '#fff',
  },
  years: {
    fontSize: 22,
    color: '#22c55e',
    marginLeft: 8,
  },
  pickerWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  pickerRow: {
    flexDirection: 'row',
    height: 260,
  },
  highlight: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    marginTop: -ITEM_HEIGHT / 2,
    backgroundColor: '#020617',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.25,
  },
  itemActive: {
    opacity: 1,
  },
  itemText: {
    color: '#94a3b8',
    fontSize: 18,
  },
  itemTextActive: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 20,
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
