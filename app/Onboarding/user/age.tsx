import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { useState, useMemo, useRef } from 'react';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;
const SPACER_HEIGHT = (ITEM_HEIGHT * (VISIBLE_ITEMS - 1)) / 2;

// ---------- DATA ----------
const DAYS = Array.from({ length: 31 }, (_, i) => ({
  label: String(i + 1),
  value: i + 1,
}));

const MONTHS = [
  { label: 'Jan', value: 0 },
  { label: 'Feb', value: 1 },
  { label: 'Mar', value: 2 },
  { label: 'Apr', value: 3 },
  { label: 'May', value: 4 },
  { label: 'Jun', value: 5 },
  { label: 'Jul', value: 6 },
  { label: 'Aug', value: 7 },
  { label: 'Sep', value: 8 },
  { label: 'Oct', value: 9 },
  { label: 'Nov', value: 10 },
  { label: 'Dec', value: 11 },
];

const YEARS = Array.from({ length: 90 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return { label: String(year), value: year };
});

// ---------- SAVE ----------
const saveAge = async ({
  day,
  month,
  year,
}: {
  day: number;
  month: number; // 0–11
  year: number;
}) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  if (!day || !year) {
    await supabase
      .from('profiles')
      .update({ onboarding_step: 3 })
      .eq('id', user.id);
    return;
  }

  const maxDay = new Date(year, month + 1, 0).getDate();
  const safeDay = Math.min(day, maxDay);

  // ✅ TIMEZONE-SAFE DOB
  const dob = `${year}-${String(month + 1).padStart(2, '0')}-${String(safeDay).padStart(2, '0')}`;

  await supabase.from('user_onboarding').upsert({
    user_id: user.id,
    dob,
  });

  await supabase
    .from('profiles')
    .update({ onboarding_step: 3 })
    .eq('id', user.id);
};


// ---------- PICKER ----------
function Picker({
  data,
  value,
  onChange,
}: {
  data: { label: string; value: number }[];
  value: number;
  onChange: (v: number) => void;
}) {
  const ref = useRef<FlatList>(null);

  return (
    <FlatList
      ref={ref}
      data={data}
      keyExtractor={(item) => String(item.value)}
      showsVerticalScrollIndicator={false}
      snapToInterval={ITEM_HEIGHT}
      decelerationRate="fast"
      getItemLayout={(_, index) => ({
        length: ITEM_HEIGHT,
        offset: ITEM_HEIGHT * index,
        index,
      })}
      ListHeaderComponent={<View style={{ height: SPACER_HEIGHT }} />}
      ListFooterComponent={<View style={{ height: SPACER_HEIGHT }} />}
      onMomentumScrollEnd={(e) => {
        const index = Math.round(
          e.nativeEvent.contentOffset.y / ITEM_HEIGHT
        );
        if (data[index]) onChange(data[index].value);
      }}
      renderItem={({ item }) => (
        <View style={[styles.item, item.value === value && styles.itemActive]}>
          <Text style={[
            styles.itemText,
            item.value === value && styles.itemTextActive,
          ]}>
            {item.label}
          </Text>
        </View>
      )}
    />
  );
}

// ---------- SCREEN ----------
export default function AgeScreen() {
  const [day, setDay] = useState(3);
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(2026);

  const age = useMemo(() => {
    const today = new Date();
    let a = today.getFullYear() - year;
    if (
      today.getMonth() < month ||
      (today.getMonth() === month && today.getDate() < day)
    ) {
      a--;
    }
    return Math.max(a, 0);
  }, [day, month, year]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Feather name="chevron-left" size={26} color="#94a3b8" />
        </Pressable>

        <Pressable onPress={() => saveAge({ day: 0, month: 0, year: 0 })}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>How old are you?</Text>
      <Text style={styles.subtitle}>This helps us personalize your plan.</Text>

      <View style={styles.ageRow}>
        <Text style={styles.age}>{age}</Text>
        <Text style={styles.years}>years</Text>
      </View>

      <View style={styles.pickerWrapper}>
        <View style={styles.highlight} />
        <View style={styles.pickerRow}>
          <Picker data={DAYS} value={day} onChange={setDay} />
          <Picker data={MONTHS} value={month} onChange={setMonth} />
          <Picker data={YEARS} value={year} onChange={setYear} />
        </View>
      </View>

      <Pressable
  style={styles.next}
  onPress={async () => {
    await saveAge({ day, month, year });
    router.replace('/Onboarding/user/height');
  }}
>
        <Text style={styles.nextText}>Next</Text>
        <Feather name="arrow-right" size={18} color="#000" />
      </Pressable>
    </View>
  );
}

// ---------- STYLES ----------
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 60, paddingHorizontal: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  skip: { color: '#64748b', fontWeight: '600' },
  title: { fontSize: 32, fontWeight: '800', color: '#fff' },
  subtitle: { color: '#94a3b8', marginTop: 8, marginBottom: 24 },
  ageRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: 24 },
  age: { fontSize: 64, fontWeight: '900', color: '#fff' },
  years: { fontSize: 22, color: '#22c55e', marginLeft: 8 },
  pickerWrapper: { flex: 1, justifyContent: 'center' },
  pickerRow: { flexDirection: 'row', height: ITEM_HEIGHT * VISIBLE_ITEMS },
  highlight: {
    position: 'absolute',
    top: '50%',
    height: ITEM_HEIGHT,
    marginTop: -ITEM_HEIGHT / 2,
    left: 0,
    right: 0,
    backgroundColor: '#020617',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  item: { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center', opacity: 0.25 },
  itemActive: { opacity: 1 },
  itemText: { color: '#94a3b8', fontSize: 18 },
  itemTextActive: { color: '#fff', fontWeight: '800', fontSize: 20 },
  next: {
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 40,
  },
  nextText: { fontWeight: '800', fontSize: 18, color: '#000' },
});
