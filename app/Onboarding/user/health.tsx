import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

const CONDITIONS = [
  'Obesity',
  'PCOS / PCOD',
  'Knee / Joint Issues',
  'Diabetes',
  'High BP / Cholesterol',
  'Slip Disc',
  'Liver Issues',
  'Pre / Post Pregnancy',
  'Thyroid Issues',
  'Other health condition',
];

export default function HealthConditionsScreen() {
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (condition: string) => {
    setSelected((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    );
  };

  const clearAll = () => {
    setSelected([]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Feather name="chevron-left" size={26} color="#94a3b8" />
        </Pressable>

        <Pressable onPress={() => router.replace('/Onboarding/user/lifestyle')}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      {/* Title */}
      <Text style={styles.title}>
        Do you have any health conditions?
      </Text>
      <Text style={styles.subtitle}>
        You can select multiple options
      </Text>

      {/* Chips */}
      <View style={styles.chips}>
        {CONDITIONS.map((item) => {
          const active = selected.includes(item);
          return (
            <Pressable
              key={item}
              onPress={() => toggle(item)}
              style={[
                styles.chip,
                active && styles.chipActive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  active && styles.chipTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable onPress={clearAll}>
          <Text style={styles.clear}>
            I don’t have any
          </Text>
        </Pressable>

        <Pressable
          style={styles.next}
          onPress={() =>
            router.replace('/Onboarding/user/lifestyle')
          }
        >
          <Text style={styles.nextText}>Next</Text>
          <Feather name="arrow-right" size={18} color="#000" />
        </Pressable>
      </View>
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
    marginBottom: 32,
  },
  skip: {
    color: '#64748b',
    fontWeight: '600',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94a3b8',
    marginBottom: 24,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  chipActive: {
    backgroundColor: '#0f172a',
    borderColor: '#94a3b8',
  },
  chipText: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#fff',
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clear: {
    color: '#e5e7eb',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
  next: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 24,
  },
  nextText: {
    fontWeight: '800',
    fontSize: 16,
    color: '#000',
  },
});
