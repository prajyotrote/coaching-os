import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

type GenderUI = 'male' | 'female' | 'other';

/* ---------------------------------------------------
   🎯 Screen
--------------------------------------------------- */
export default function TrainerGenderScreen() {
  const [selected, setSelected] = useState<GenderUI | null>(null);

  /* ----------------------------------
     🔒 HARD GUARD
  ---------------------------------- */
  useEffect(() => {
    const guard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed, onboarding_step')
        .eq('id', user.id)
        .single();

      // 🚫 Already finished → exit onboarding forever
      if (profile?.onboarding_completed) {
        router.replace('/');
        return;
      }

      // 🚫 Skipped ahead → redirect correctly
      if (profile && profile.onboarding_step > 2) {
        router.replace('/Onboarding/coach/age');
      }
    };

    guard();
  }, []);

  const handleContinue = async () => {
    if (!selected) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Map UI → DB enum
    const genderMap: Record<GenderUI, 'male' | 'female' | 'na'> = {
      male: 'male',
      female: 'female',
      other: 'na',
    };

    /* ----------------------------------
       🔐 SAVE GENDER (SAFE)
    ---------------------------------- */
    const { error: trainerError } = await supabase
      .from('trainer_profile')
      .update({
        gender: genderMap[selected],
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    if (trainerError) {
      console.error('Failed to save trainer gender', trainerError);
      return;
    }

    /* ----------------------------------
       ➡️ ADVANCE STEP (FORWARD-ONLY)
    ---------------------------------- */
    await supabase
      .from('profiles')
      .update({ onboarding_step: 2 })
      .eq('id', user.id)
      .lte('onboarding_step', 2); // 🔒 CRITICAL

    router.replace('/Onboarding/coach/age');
  };

  return (
    <View style={styles.container}>
      {/* Background glows */}
      <LinearGradient
        colors={['rgba(79,70,229,0.14)', 'transparent']}
        style={styles.glowTop}
      />
      <LinearGradient
        colors={['rgba(37,99,235,0.1)', 'transparent']}
        style={styles.glowBottom}
      />

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
          How do you{'\n'}identify?
        </Text>
        <Text style={styles.subtitle}>
          This helps personalize your trainer profile.
        </Text>

        <View style={styles.options}>
          <GenderOption
            label="Male"
            icon="user"
            selected={selected === 'male'}
            onPress={() => setSelected('male')}
          />
          <GenderOption
            label="Female"
            icon="user"
            selected={selected === 'female'}
            onPress={() => setSelected('female')}
          />
          <GenderOption
            label="Prefer not to say"
            icon="slash"
            selected={selected === 'other'}
            onPress={() => setSelected('other')}
          />
        </View>
      </View>

      {/* CTA */}
      <Pressable
        style={[styles.cta, !selected && styles.ctaDisabled]}
        disabled={!selected}
        onPress={handleContinue}
      >
        <Text style={[styles.ctaText, !selected && { color: '#475569' }]}>
          Continue
        </Text>
        <Feather
          name="arrow-right"
          size={20}
          color={selected ? '#000' : '#475569'}
        />
      </Pressable>

      <View style={styles.homeIndicator} />
    </View>
  );
}

/* ---------------------------------------------------
   🧩 Gender Option
--------------------------------------------------- */
function GenderOption({
  label,
  icon,
  selected,
  onPress,
}: {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.option, selected && styles.optionSelected]}
    >
      <View style={[styles.optionIcon, selected && { backgroundColor: '#000' }]}>
        <Feather
          name={icon}
          size={22}
          color={selected ? '#fff' : '#94a3b8'}
        />
      </View>

      <Text style={[styles.optionText, selected && { color: '#000' }]}>
        {label}
      </Text>

      {selected && <View style={styles.radioDot} />}
    </Pressable>
  );
}

/* ---------------------------------------------------
   🎨 Styles
--------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },

  glowTop: {
    position: 'absolute',
    top: -120,
    right: -120,
    width: 420,
    height: 300,
    borderRadius: 200,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -140,
    left: -140,
    width: 420,
    height: 320,
    borderRadius: 200,
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
ctaDisabled: {
  backgroundColor: '#020617',
},

  content: {
    flex: 1,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 32,
  },

  options: {
    gap: 16,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 28,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  optionSelected: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  optionIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#e5e7eb',
    flex: 1,
  },
  radioDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#000',
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
