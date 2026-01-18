import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import { router } from 'expo-router';


type ActivityLevelId =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'athlete';

interface ActivityLevel {
  id: ActivityLevelId;
  title: string;
  description: string;
icon: keyof typeof Feather.glyphMap;
  multiplier: number;
}

const LEVELS: ActivityLevel[] = [
  {
    id: 'sedentary',
    title: 'Sedentary',
    description: 'Mostly sitting, no workouts',
    icon: 'clock',
    multiplier: 1.2,
  },
  {
    id: 'light',
    title: 'Light',
    description: 'Light exercise 1–3 days/week',
    icon: 'activity',
    multiplier: 1.375,
  },
  {
    id: 'moderate',
    title: 'Moderate',
    description: 'Training 3–5 days/week',
    icon: 'bar-chart',
    multiplier: 1.55,
  },
  {
    id: 'active',
    title: 'Active',
    description: 'Intense training 6–7 days/week',
    icon: 'zap',
    multiplier: 1.725,
  },
  {
    id: 'athlete',
    title: 'Athlete',
    description: 'Very intense / physical job',
    icon: 'trending-up',
    multiplier: 1.9,
  },
];

interface Props {
  onNext: (level: ActivityLevel) => void;
  onBack: () => void;
}

export default function ActivityLevelScreen({ onNext, onBack }: Props) {
  const [selected, setSelected] = useState<ActivityLevel | null>(null);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Feather name="chevron-left" size={26} color="#94a3b8" />
        </Pressable>
        <Pressable onPress={() => router.replace('/Onboarding/user/health')}>
                  <Text style={styles.skip}>Skip</Text>
                </Pressable>

        <View style={styles.progress}>
          <View style={styles.progressFill} />
        </View>

        <View style={{ width: 32 }} />
      </View>

      {/* Title */}
      <View style={styles.titleBlock}>
        <Text style={styles.title}>How active are you?</Text>
        <Text style={styles.subtitle}>
          This helps us calculate your daily energy needs.
        </Text>
      </View>

      {/* Options */}
      <View style={styles.list}>
        {LEVELS.map(level => {
          const isSelected = selected?.id === level.id;

          return (
            <Pressable
              key={level.id}
              onPress={() => setSelected(level)}
              style={[
                styles.card,
                isSelected && styles.cardSelected,
              ]}
            >
              <View style={[styles.iconWrap, isSelected && styles.iconSelected]}>
                <Feather
                  name={level.icon}
                  size={22}
                  color={isSelected ? '#000' : '#94a3b8'}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, isSelected && { color: '#000' }]}>
                  {level.title}
                </Text>
                <Text style={[styles.cardDesc, isSelected && { color: '#000' }]}>
                  {level.description}
                </Text>
              </View>

              <View style={[styles.radio, isSelected && styles.radioSelected]}>
                {isSelected && <View style={styles.radioDot} />}
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* CTA */}
      <Pressable
        disabled={!selected}
        onPress={() => router.replace('/Onboarding/user/health')}
        style={[
          styles.cta,
          !selected && styles.ctaDisabled,
        ]}
      >
        <Text style={[styles.ctaText, !selected && { color: '#64748b' }]}>
          Next
        </Text>
        <Feather
          name="arrow-right"
          size={20}
          color={selected ? '#000' : '#64748b'}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backBtn: {
    padding: 6,
  },
  progress: {
    flex: 1,
    height: 4,
    backgroundColor: '#020617',
    borderRadius: 4,
    marginHorizontal: 16,
  },
  skip: {
    color: '#64748b',
    fontWeight: '600',
  },
  progressFill: {
    width: '95%',
    height: '100%',
    backgroundColor: '#334155',
    borderRadius: 4,
  },
  titleBlock: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
  },
  list: {
    flex: 1,
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#020617',
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: '#020617',
  },
  cardSelected: {
    backgroundColor: '#fff',
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#020617',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconSelected: {
    backgroundColor: '#000',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 2,
  },
  cardDesc: {
    fontSize: 13,
    color: '#64748b',
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#475569',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: '#000',
    backgroundColor: '#000',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  cta: {
    height: 60,
    borderRadius: 28,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaDisabled: {
    backgroundColor: '#020617',
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
  },
});
