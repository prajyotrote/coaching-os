import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

/* ---------------------------------
   🧠 Trainer Skills
---------------------------------- */
const SKILLS = [
  { id: 'weight_training', label: 'Weight Training', icon: 'activity' },
  { id: 'fat_loss', label: 'Fat Loss', icon: 'trending-down' },
  { id: 'muscle_gain', label: 'Muscle Gain', icon: 'trending-up' },
  { id: 'mobility', label: 'Mobility', icon: 'refresh-ccw' },
  { id: 'rehab', label: 'Rehab', icon: 'heart' },
  { id: 'sports_performance', label: 'Sports Performance', icon: 'zap' },
  { id: 'yoga', label: 'Yoga & Flow', icon: 'wind' },
  { id: 'cross_training', label: 'Cross Training', icon: 'target' },
];

export default function TrainerSkillsScreen() {
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const toggleSkill = (id: string) => {
    setSelectedSkills((prev) =>
      prev.includes(id)
        ? prev.filter((s) => s !== id)
        : [...prev, id]
    );
  };

  const isValid = selectedSkills.length > 0;

  /* ---------------------------------
     💾 Save Skills
  ---------------------------------- */
  const handleContinue = async () => {
  if (!isValid) return;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // 1️⃣ Save skills
  const { error } = await supabase
    .from('trainer_profile')
    .upsert({
      user_id: user.id,
      skills: selectedSkills,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Saving trainer skills failed:', error);
    return;
  }

  // 2️⃣ Advance onboarding SAFELY
  await supabase
    .from('profiles')
    .update({
      onboarding_step: 5, // ✅ skills done
    })
    .eq('id', user.id)
    .lte('onboarding_step', 5);

  router.replace('/Onboarding/coach/certifications');
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
        What do you{'\n'}specialize in?
      </Text>
      <Text style={styles.subtitle}>
        Choose the areas you actively coach in.
      </Text>

      {/* Skills Grid */}
      <ScrollView contentContainerStyle={styles.grid}>
        {SKILLS.map((skill) => {
          const selected = selectedSkills.includes(skill.id);
          return (
            <Pressable
              key={skill.id}
              onPress={() => toggleSkill(skill.id)}
              style={[
                styles.card,
                selected && styles.cardSelected,
              ]}
            >
              <View
                style={[
                  styles.iconWrap,
                  selected && styles.iconWrapSelected,
                ]}
              >
                <Feather
                  name={skill.icon as any}
                  size={20}
                  color={selected ? '#ffffff' : '#64748b'}
                />
              </View>

              <Text
                style={[
                  styles.cardText,
                  selected && styles.cardTextSelected,
                ]}
              >
                {skill.label}
              </Text>

              {selected && (
                <View style={styles.selectedDot}>
                  <View style={styles.dotInner} />
                </View>
              )}
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
    marginBottom: 36,
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
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 24,
    maxWidth: 320,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    paddingBottom: 120,
  },
  card: {
    width: '47%',
    backgroundColor: '#020617',
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: '#020617',
  },
  cardSelected: {
    backgroundColor: '#fff',
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconWrapSelected: {
    backgroundColor: '#000',
  },
  cardText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  cardTextSelected: {
    color: '#000',
  },
  selectedDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
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
