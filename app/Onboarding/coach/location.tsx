import { View, Text, Pressable, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

/* ---------------------------------
   🇮🇳 Indian States + UTs
---------------------------------- */
const STATES = [
  "Andaman and Nicobar Islands",
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chandigarh",
  "Chhattisgarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jammu and Kashmir",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Ladakh",
  "Lakshadweep",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Puducherry",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

export default function TrainerLocationScreen() {
  const [city, setCity] = useState('');
  const [state, setState] = useState<string | null>(null);

  const isValid = city.trim().length >= 2 && state;

  /* ---------------------------------
     💾 Save Location
  ---------------------------------- */
  const handleContinue = async () => {
  if (!isValid) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // 1️⃣ Save location
  const { error } = await supabase
    .from('trainer_profile')
    .upsert({
      user_id: user.id,
      city: city.trim(),
      state,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Trainer location save failed:', error);
    return;
  }

  // 2️⃣ Advance onboarding SAFELY
  await supabase
    .from('profiles')
    .update({
      onboarding_step: 4,
    })
    .eq('id', user.id)
    .lte('onboarding_step', 4);

  router.replace('/Onboarding/coach/skills');
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
      <Text style={styles.title}>
        Where are you{'\n'}based?
      </Text>
      <Text style={styles.subtitle}>
        This helps clients find trainers nearby.
      </Text>

      {/* City Input */}
      <TextInput
        value={city}
        onChangeText={setCity}
        placeholder="Your City"
        placeholderTextColor="#475569"
        style={styles.input}
      />

      {/* States */}
      <Text style={styles.sectionLabel}>Select State</Text>

      <ScrollView contentContainerStyle={styles.statesWrap}>
        {STATES.map((s) => {
          const selected = s === state;
          return (
            <Pressable
              key={s}
              onPress={() => setState(s)}
              style={[
                styles.stateChip,
                selected && styles.stateChipActive,
              ]}
            >
              <Text
                style={[
                  styles.stateText,
                  selected && styles.stateTextActive,
                ]}
              >
                {s}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* CTA */}
      <Pressable
        disabled={!isValid}
        onPress={handleContinue}
        style={[styles.cta, !isValid && styles.ctaDisabled]}
      >
        <Text style={[styles.ctaText, !isValid && { color: '#64748b' }]}>
          Continue
        </Text>
        <Feather
          name="arrow-right"
          size={20}
          color={isValid ? '#000' : '#64748b'}
        />
      </Pressable>

      <View style={styles.homeIndicator} />
    </View>
  );
}

/* ---------------------------------
   🎨 Styles
---------------------------------- */
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
    marginBottom: 40,
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
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 24,
    maxWidth: 320,
  },
  input: {
    height: 56,
    borderRadius: 20,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#020617',
    paddingHorizontal: 18,
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 24,
  },
  sectionLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 12,
  },
  statesWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 120,
  },
  stateChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#020617',
  },
  stateChipActive: {
    backgroundColor: '#fff',
  },
  stateText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748b',
  },
  stateTextActive: {
    color: '#000',
  },
  cta: {
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  ctaDisabled: {
    backgroundColor: '#020617',
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
