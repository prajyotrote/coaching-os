import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';

export default function LifestyleScreen() {
  const [smoke, setSmoke] = useState(false);
  const [drink, setDrink] = useState(false);

  const isAnySelected = smoke || drink;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Feather name="chevron-left" size={26} color="#94a3b8" />
        </Pressable>

        <Pressable onPress={() => router.replace('/Onboarding/user/summary')}>
          <Text style={styles.skip}>Skip</Text>
        </Pressable>
      </View>

      {/* Title */}
      <Text style={styles.title}>Do you smoke or drink?</Text>
      <Text style={styles.subtitle}>
        No judgment — just better personalization
      </Text>

      {/* Cards */}
      <View style={styles.cardsRow}>
        {/* Smoke */}
        <Pressable
          style={[
            styles.card,
            smoke && styles.cardActive,
          ]}
          onPress={() => setSmoke(!smoke)}
        >
          <View style={styles.iconCircle}>
            <Feather
              name="slash"
              size={24}
              color={smoke ? '#fff' : '#94a3b8'}
            />
          </View>
          <Text
            style={[
              styles.cardText,
              smoke && styles.cardTextActive,
            ]}
          >
            I Smoke
          </Text>
        </Pressable>

        {/* Drink */}
        <Pressable
          style={[
            styles.card,
            drink && styles.cardActive,
          ]}
          onPress={() => setDrink(!drink)}
        >
          <View style={styles.iconCircle}>
            <Feather
              name="coffee"
              size={24}
              color={drink ? '#fff' : '#94a3b8'}
            />
          </View>
          <Text
            style={[
              styles.cardText,
              drink && styles.cardTextActive,
            ]}
          >
            I Drink
          </Text>
        </Pressable>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          style={styles.nextButton}
          onPress={() =>
            router.replace('/Onboarding/user/summary')
          }
        >
          <Text style={styles.nextText}>
            {isAnySelected
              ? 'Next'
              : "I don't smoke or drink"}
          </Text>
          <Feather
            name="arrow-right"
            size={18}
            color="#000"
          />
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
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 40,
  },
  cardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 350,
  },
  card: {
    flex: 1,
    marginHorizontal: 8,
    height: 220,
    borderRadius: 28,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardActive: {
    backgroundColor: '#0f172a',
    borderColor: '#94a3b8',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#94a3b8',
  },
  cardTextActive: {
    color: '#fff',
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: 30,
  },
  nextButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    paddingVertical: 18,
    borderRadius: 24,
  },
  nextText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
  },
});
