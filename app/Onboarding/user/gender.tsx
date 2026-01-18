import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function GenderScreen() {
  const [selected, setSelected] = useState<'male' | 'female' | null>(null);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="#94a3b8" />
        </Pressable>

        <Pressable onPress={() => router.replace('/Onboarding/user/age')}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      {/* Title */}
      <View style={styles.titleBlock}>
        <Text style={styles.title}>What’s your gender?</Text>
        <Text style={styles.subtitle}>
          So we can personalize your health metrics and journey.
        </Text>
      </View>

      {/* Cards */}
      <View style={styles.cards}>
        <Pressable
          onPress={() => setSelected('male')}
          style={[
            styles.card,
            selected === 'male' && styles.cardActive,
          ]}
        >
          <Feather
            name="arrow-up-right"
            size={36}
            color={selected === 'male' ? '#60a5fa' : '#64748b'}
          />
          <Text style={styles.cardText}>Male</Text>
        </Pressable>

        <Pressable
          onPress={() => setSelected('female')}
          style={[
            styles.card,
            selected === 'female' && styles.cardActive,
          ]}
        >
          <Feather
            name="circle"
            size={36}
            color={selected === 'female' ? '#f472b6' : '#64748b'}
          />
          <Text style={styles.cardText}>Female</Text>
        </Pressable>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          disabled={!selected}
          onPress={() => router.replace('/Onboarding/user/age')}
          style={[
            styles.nextButton,
            !selected && styles.disabled,
          ]}
        >
          <Text style={styles.nextText}>Next</Text>
          <Feather name="arrow-right" size={20} color="#000" />
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  skip: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  titleBlock: {
    marginBottom: 400,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    lineHeight: 22,
  },
  cards: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
  },
  card: {
    flex: 1,
    backgroundColor: '#020617',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardActive: {
    borderColor: '#fff',
    shadowColor: '#fff',
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  cardText: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  footer: {
    paddingBottom: 40,
  },
  nextButton: {
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    
  },
  nextText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
  },
  disabled: {
    opacity: 0.4,
  },
});
