import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

const ITEM_HEIGHT = 64;
const MIN_AGE = 16;
const MAX_AGE = 80;

const AGES = Array.from(
  { length: MAX_AGE - MIN_AGE + 1 },
  (_, i) => MIN_AGE + i
);

export default function TrainerAgeScreen() {
  const [age, setAge] = useState<number>(25);
  const listRef = useRef<FlatList<number>>(null);

  /* -------------------------------
     Scroll to default age
  -------------------------------- */
  useEffect(() => {
    const index = AGES.indexOf(age);
    if (index >= 0) {
      setTimeout(() => {
        listRef.current?.scrollToOffset({
          offset: index * ITEM_HEIGHT,
          animated: false,
        });
      }, 50);
    }
  }, []);

  /* -------------------------------
     SAVE → DB
  -------------------------------- */
  const handleContinue = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // 🔐 Save / create trainer profile row
    const { error: trainerError } = await supabase
      .from('trainer_profile')
      .upsert({
        user_id: user.id,
        age,
        updated_at: new Date().toISOString(),
      });

    if (trainerError) {
      console.error('Trainer age save failed:', trainerError);
      return;
    }

    // ➡️ Advance onboarding
    await supabase
  .from('profiles')
  .update({
    onboarding_step: 3,
  })
  .eq('id', user.id)
  .lte('onboarding_step', 3); // 🔐 CRITICAL


    router.replace('/Onboarding/coach/location');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={26} color="#9ca3af" />
        </Pressable>
        <Text style={styles.brand}>TRAINER SETUP</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>How old are you?</Text>
      <Text style={styles.subtitle}>
        This helps complete your trainer profile.
      </Text>

      {/* Picker */}
      <View style={styles.pickerWrapper}>
        {/* Highlight strip */}
        <View style={styles.highlight} />

        <FlatList
          ref={listRef}
          data={AGES}
          keyExtractor={(item) => String(item)}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          getItemLayout={(_, index) => ({
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          })}
          contentContainerStyle={{
            paddingVertical: ITEM_HEIGHT * 2,
          }}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(
              e.nativeEvent.contentOffset.y / ITEM_HEIGHT
            );
            if (AGES[index]) setAge(AGES[index]);
          }}
          renderItem={({ item }) => {
            const selected = item === age;
            return (
              <View style={styles.item}>
                <Text
                  style={[
                    styles.itemText,
                    selected && styles.itemTextActive,
                  ]}
                >
                  {item}
                </Text>
              </View>
            );
          }}
        />
      </View>

      {/* CTA */}
      <Pressable style={styles.cta} onPress={handleContinue}>
        <Text style={styles.ctaText}>Continue</Text>
        <Feather name="arrow-right" size={20} color="#000" />
      </Pressable>

      {/* Home Indicator */}
      <View style={styles.homeIndicator} />
    </View>
  );
}

/* -------------------------------
   🎨 Styles
-------------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  backBtn: { padding: 6 },
  brand: {
    fontSize: 10,
    letterSpacing: 3,
    color: '#6b7280',
    fontWeight: '800',
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 16,
    marginBottom: 32,
  },
  pickerWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  highlight: {
    position: 'absolute',
    top: '50%',
    marginTop: -ITEM_HEIGHT / 2,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: '#020617',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    zIndex: 1,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    fontSize: 28,
    color: '#475569',
    fontWeight: '600',
  },
  itemTextActive: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '900',
  },
  cta: {
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 24,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
  },
  homeIndicator: {
    alignSelf: 'center',
    width: 120,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#020617',
    marginTop: 16,
  },
});
