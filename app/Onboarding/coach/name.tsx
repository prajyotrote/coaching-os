import { View, Text, Pressable, StyleSheet, TextInput } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

export default function TrainerNameScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [focused, setFocused] = useState<'first' | 'last' | null>(null);

  const firstNameRef = useRef<TextInput>(null);
  const isValid = firstName.trim().length > 0;

  /* ----------------------------------
     🔒 HARD GUARD — DO NOT ALLOW
     ACCESS AFTER ONBOARDING COMPLETE
  ---------------------------------- */
  useEffect(() => {
    const guard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single();

      if (profile?.onboarding_completed) {
        router.replace('/'); // trainer dashboard later
      }
    };

    guard();
  }, []);

  const handleContinue = async () => {
    if (!isValid) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    /* ----------------------------------
       🔐 CREATE / UPDATE trainer_profile
       (ONLY WHAT THIS SCREEN OWNS)
    ---------------------------------- */
    const { error } = await supabase
      .from('trainer_profile')
      .upsert({
        user_id: user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim() || null,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Trainer name save failed:', error);
      return;
    }

    /* ----------------------------------
       ➡️ ADVANCE STEP (SAFE, FORWARD ONLY)
    ---------------------------------- */
    await supabase
      .from('profiles')
      .update({ onboarding_step: 1 })
      .eq('id', user.id)
      .lte('onboarding_step', 1);

    router.replace('/Onboarding/coach/gender');
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

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>
          What should clients{'\n'}call you?
        </Text>

        <Text style={styles.subtitle}>
          This will appear on your trainer profile.
        </Text>

        <TextInput
          ref={firstNameRef}
          value={firstName}
          onChangeText={setFirstName}
          placeholder="First name"
          placeholderTextColor="#475569"
          onFocus={() => setFocused('first')}
          onBlur={() => setFocused(null)}
          style={[styles.input, focused === 'first' && styles.inputActive]}
        />

        <TextInput
          value={lastName}
          onChangeText={setLastName}
          placeholder="Last name (optional)"
          placeholderTextColor="#475569"
          onFocus={() => setFocused('last')}
          onBlur={() => setFocused(null)}
          style={[styles.input, focused === 'last' && styles.inputActive]}
        />

        <Text style={styles.helper}>You can update this later</Text>
      </View>

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

/* ---------------- Styles ---------------- */

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
    marginBottom: 48,
  },
  backBtn: {
    padding: 6,
  },
  brand: {
    fontSize: 10,
    letterSpacing: 3,
    color: '#6b7280',
    fontWeight: '800',
  },
  content: {
    flex: 1,
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
    marginBottom: 32,
    maxWidth: 320,
  },
  input: {
    height: 58,
    borderRadius: 22,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#020617',
    paddingHorizontal: 20,
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 16,
  },
  inputActive: {
    borderColor: '#6366f1',
  },
  helper: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 4,
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
