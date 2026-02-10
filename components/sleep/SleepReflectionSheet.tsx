import React, { useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native';
import {
  Moon,
  Coffee,
  Smartphone,
  Brain,
  Flame,
  Activity,
  Check,
} from 'lucide-react-native';

/* ---------------- TYPES ---------------- */

type SleepQuality =
  | 'very_poor'
  | 'poor'
  | 'okay'
  | 'good'
  | 'excellent';


interface Props {
  onSave: (data: {
    perceivedQuality: SleepQuality;
    factors: string[];
    notes: string;
  }) => void;
  onClose: () => void;
}

/* ---------------- CONSTANTS ---------------- */

const QUALITY_OPTIONS: {
  key: SleepQuality;
  label: string;
  emoji: string;
}[] = [
  { key: 'very_poor', label: 'Very poor', emoji: '😵' },
  { key: 'poor', label: 'Poor', emoji: '😕' },
  { key: 'okay', label: 'Okay', emoji: '😐' },
  { key: 'good', label: 'Good', emoji: '🙂' },
  { key: 'excellent', label: 'Excellent', emoji: '😌' },
];

const FACTORS = [
  { key: 'late_caffeine', label: 'Late caffeine', icon: Coffee },
  { key: 'screen_time', label: 'Screen time', icon: Smartphone },
  { key: 'stress', label: 'Stress', icon: Brain },
  { key: 'late_meal', label: 'Late meal', icon: Flame },
  { key: 'late_workout', label: 'Late workout', icon: Activity },
];

/* ---------------- COMPONENT ---------------- */

export default function SleepReflectionSheet({
  onSave,
  onClose,
}: Props) {
  const [quality, setQuality] = useState<SleepQuality | null>(null);
  const [factors, setFactors] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  function toggleFactor(key: string) {
    setFactors(prev =>
      prev.includes(key)
        ? prev.filter(f => f !== key)
        : [...prev, key],
    );
  }

  return (
    <View style={styles.container}>
      {/* QUESTION 1 */}
      <Text style={styles.title}>How was your sleep?</Text>
      <Text style={styles.sub}>
        Your perception matters more than perfect data.
      </Text>

      <View style={styles.qualityRow}>
        {QUALITY_OPTIONS.map(q => (
          <Pressable
            key={q.key}
            style={[
              styles.qualityPill,
              quality === q.key && styles.qualityActive,
            ]}
            onPress={() => setQuality(q.key)}
          >
            <Text style={styles.qualityEmoji}>{q.emoji}</Text>
            <Text style={styles.qualityText}>{q.label}</Text>
          </Pressable>
        ))}
      </View>

      {/* QUESTION 2 */}
      <Text style={styles.section}>What might have affected it?</Text>

      <View style={styles.factorGrid}>
        {FACTORS.map(f => {
          const Icon = f.icon;
          const active = factors.includes(f.key);

          return (
            <Pressable
              key={f.key}
              style={[
                styles.factorCard,
                active && styles.factorActive,
              ]}
              onPress={() => toggleFactor(f.key)}
            >
              <Icon
                size={18}
                color={active ? '#818CF8' : '#6B7280'}
              />
              <Text style={styles.factorText}>{f.label}</Text>

              {active && (
                <View style={styles.check}>
                  <Check size={12} color="#fff" />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* QUESTION 3 */}
      <Text style={styles.section}>Anything else?</Text>

      <TextInput
        placeholder="Optional notes (stress, travel, thoughts…) "
        placeholderTextColor="#6B7280"
        value={notes}
        onChangeText={setNotes}
        multiline
        style={styles.input}
      />

      {/* CTA */}
      <Pressable
        disabled={!quality}
        style={[
          styles.saveBtn,
          !quality && { opacity: 0.4 },
        ]}
        onPress={() => {
          if (!quality) return;

          onSave({
            perceivedQuality: quality,
            factors,
            notes,
          });

          onClose();
        }}
      >
        <Moon size={16} color="#000" />
        <Text style={styles.saveText}>Save Reflection</Text>
      </Pressable>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    paddingBottom: 32,
  },

  title: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
  },

  sub: {
    color: '#9CA3AF',
    fontSize: 13,
    marginBottom: 18,
  },

  qualityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },

  qualityPill: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    backgroundColor: '#111',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },

  qualityActive: {
    backgroundColor: '#1E1B4B',
  },

  qualityEmoji: { fontSize: 16 },
  qualityText: { color: '#E5E7EB', fontSize: 13 },

  section: {
    color: '#9CA3AF',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 10,
  },

  factorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },

  factorCard: {
    width: '47%',
    backgroundColor: '#111',
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },

  factorActive: {
    backgroundColor: '#1E1B4B',
  },

  factorText: {
    color: '#D1D5DB',
    fontSize: 13,
  },

  check: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#818CF8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  input: {
    backgroundColor: '#0F0F0F',
    borderRadius: 16,
    padding: 14,
    color: '#fff',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 24,
  },

  saveBtn: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#818CF8',
    borderRadius: 18,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveText: {
    color: '#000',
    fontWeight: '800',
    fontSize: 14,
  },
});
