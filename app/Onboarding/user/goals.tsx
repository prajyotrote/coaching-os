import { View, Text, Pressable, StyleSheet, FlatList, Image, TextInput } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

const saveGoals = async (goals: string[], otherGoal: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from('user_onboarding')
    .upsert({
      user_id: user.id,
      goals,
      other_goal: otherGoal.trim() || null,
    });

  await supabase
    .from('profiles')
    .update({ onboarding_step: 5 })
    .eq('id', user.id);
};

const GOALS = [
  { id: 'weight', label: 'Lose Weight', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=200' },
  { id: 'thyroid', label: 'Thyroid Health', image: 'https://images.unsplash.com/photo-1559757175-5700dde675bc?w=200' },
  { id: 'prenatal', label: 'Prenatal Care', image: 'https://images.unsplash.com/photo-1510972527921-ce74ab429d81?w=200' },
  { id: 'lipid', label: 'Lipid Control', image: 'https://images.unsplash.com/photo-1505576399279-565b52d4ac71?w=200' },
  { id: 'general', label: 'General well-being', image: 'https://images.unsplash.com/photo-1518314916301-739da3e947c4?w=200' },
  { id: 'diabetes', label: 'Diabetes Care', image: 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1cb9?w=200' },
  { id: 'pcos', label: 'PCOS Support', image: 'https://images.unsplash.com/photo-1502101872923-d48509bff386?w=200' },
  { id: 'bp', label: 'BP Control', image: 'https://images.unsplash.com/photo-1576091160550-2173bdd99802?w=200' },
  { id: 'liver', label: 'Liver Wellness', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200' },
  { id: 'mental', label: 'Mental Wellness', image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=200' },
];

export default function UserGoalsScreen() {
  const [selected, setSelected] = useState<string[]>([]);
  const [other, setOther] = useState('');

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const canContinue = selected.length > 0 || other.trim().length > 0;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Let's focus on your goal</Text>
        <Text style={styles.subtitle}>Everything starts with a clear goal.</Text>
      </View>

      {/* Goals Grid */}
      <FlatList
        data={GOALS}
        keyExtractor={(item) => item.id}
        numColumns={5}
        contentContainerStyle={styles.grid}
        renderItem={({ item }) => {
          const active = selected.includes(item.id);
          return (
            <Pressable onPress={() => toggle(item.id)} style={styles.goalItem}>
              <View style={[styles.imageWrap, active && styles.imageActive]}>
                <Image source={{ uri: item.image }} style={styles.image} />
              </View>
              <Text style={[styles.goalLabel, active && styles.goalLabelActive]}>
                {item.label}
              </Text>
            </Pressable>
          );
        }}
      />

      {/* Other Goal */}
      <View style={styles.otherWrap}>
        <Text style={styles.otherLabel}>OTHER</Text>
        <TextInput
          placeholder="Describe your goal"
          placeholderTextColor="#475569"
          value={other}
          onChangeText={setOther}
          multiline
          style={styles.textarea}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          disabled={!canContinue}
        onPress={async () => {
  await saveGoals(selected, other);
  router.replace('/Onboarding/user/lifestyle');
}}

          style={[
            styles.nextButton,
            !canContinue && { opacity: 0.4 },
          ]}
        >
          <Text style={styles.nextText}>Next →</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 80,
  },

  header: {
    alignItems: 'center',
    marginBottom: 40,
    paddingHorizontal: 24,
  },

  title: {
    color: '#fff',
    fontSize: 30,
    fontWeight: '700',
    marginBottom: 8,
  },

  subtitle: {
    color: '#64748b',
    fontSize: 16,
  },

  grid: {
    paddingHorizontal: 12,
    paddingBottom: 32,
  },

  goalItem: {
    width: '20%',
    alignItems: 'center',
    marginBottom: 28,
  },

  imageWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 6,
    borderWidth: 2,
    borderColor: 'transparent',
    opacity: 0.75,
  },

  imageActive: {
    borderColor: '#fff',
    opacity: 1,
  },

  image: {
    width: '100%',
    height: '100%',
  },

  goalLabel: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
  },

  goalLabelActive: {
    color: '#fff',
    fontWeight: '700',
  },

  otherWrap: {
    paddingHorizontal: 24,
    marginTop: 8,
  },

  otherLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 6,
  },

  textarea: {
    backgroundColor: '#0b0b0b',
    borderRadius: 16,
    padding: 16,
    color: '#e5e7eb',
    minHeight: 100,
  },

  footer: {
    padding: 24,
    paddingBottom: 40,
    alignItems: 'flex-end',
  },

  nextButton: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 36,
  },

  nextText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
  },
});
