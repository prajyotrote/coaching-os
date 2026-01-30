import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function TrainerVerificationPendingScreen() {
  const unlocksNext = [
    'Your coaching dashboard',
    'Client risk alerts',
    'AI-powered insights',
    'Progress & habit tracking',
    'Business tools to manage clients',
  ];

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/select-role');
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(79,70,229,0.15)', 'transparent']}
        style={styles.glowTop}
      />
      <LinearGradient
        colors={['rgba(37,99,235,0.1)', 'transparent']}
        style={styles.glowBottom}
      />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 32 }} />
        <Text style={styles.headerText}>TRAINER VERIFICATION</Text>

        <Pressable onPress={handleLogout} style={styles.logoutTop}>
          <Feather name="log-out" size={18} color="#f87171" />
          <Text style={styles.logoutTopText}>Logout</Text>
        </Pressable>
      </View>

      <View style={styles.content}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroIconWrap}>
            <Feather name="shield" size={44} color="#fff" />
          </View>

          <Text style={styles.title}>Welcome to LOOP</Text>

          <Text style={styles.subtitle}>
            We’re setting up your coaching workspace. Loop helps you turn client data
            into clear decisions so you spend less time managing and more time coaching.
          </Text>
        </View>

        {/* Status Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText}>PENDING REVIEW</Text>
            </View>

            <View style={styles.time}>
              <Feather name="clock" size={14} color="#94a3b8" />
              <Text style={styles.timeText}>24–48h</Text>
            </View>
          </View>

          <Text style={styles.cardText}>
            Every trainer profile is manually reviewed to maintain a trusted coaching
            environment for both clients and coaches. Most trainers are approved within 24 hours.
          </Text>
        </View>

        {/* Unlocks Next */}
        <View style={styles.steps}>
          <Text style={styles.stepsTitle}>WHAT UNLOCKS NEXT</Text>

          {unlocksNext.map((step, i) => (
            <View key={i} style={styles.stepRow}>
              <Feather name="check-circle" size={18} color="#6366f1" />
              <Text style={styles.stepText}>{step}</Text>
            </View>
          ))}
        </View>

        {/* Trust Box */}
        <View style={styles.trustBox}>
          <Feather name="info" size={18} color="#818cf8" />
          <Text style={styles.trustText}>
            This review helps ensure quality, builds client trust, and sets up your Loop workspace correctly.
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable
          style={styles.reviewBtn}
          onPress={() => router.replace('/Onboarding/coach/review')}
        >
          <Text style={styles.reviewText}>Review Profile</Text>
          <Feather name="arrow-right" size={18} color="#64748b" />
        </Pressable>

        <Pressable
          style={styles.supportCenter}
          onPress={() =>
            Alert.alert('Support', 'Our team will reach out to you shortly.')
          }
        >
          <Text style={styles.link}>Support</Text>
        </Pressable>
      </View>

      <View style={styles.homeIndicator} />
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

  glowTop: {
    position: 'absolute',
    top: -120,
    left: -120,
    width: 400,
    height: 300,
    borderRadius: 200,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -140,
    right: -140,
    width: 400,
    height: 320,
    borderRadius: 200,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    alignItems: 'center',
  },

  headerText: {
    fontSize: 10,
    letterSpacing: 3,
    color: '#64748b',
    fontWeight: '800',
  },

  logoutTop: {
    alignItems: 'center',
    width: 32,
  },

  logoutTopText: {
    fontSize: 8,
    marginTop: 2,
    color: '#f87171',
    fontWeight: '700',
    paddingLeft:-5,
  },

  content: { flex: 1 },

  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },

  heroIconWrap: {
    width: 96,
    height: 96,
    borderRadius: 32,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },

  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },

  subtitle: {
    fontSize: 15,
    color: '#94a3b8',
    textAlign: 'center',
    maxWidth: 300,
  },

  card: {
    backgroundColor: '#020617',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 28,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#f59e0b',
  },

  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#f59e0b',
    letterSpacing: 1.5,
  },

  time: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },

  timeText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '700',
  },

  cardText: {
    color: '#cbd5f5',
    fontSize: 14,
    lineHeight: 20,
  },

  steps: { marginBottom: 24 },

  stepsTitle: {
    fontSize: 10,
    color: '#64748b',
    letterSpacing: 2,
    fontWeight: '800',
    marginBottom: 12,
  },

  stepRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 10,
  },

  stepText: {
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '700',
  },

  trustBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#1e1b4b',
    borderRadius: 20,
    padding: 10,
    marginBottom:10
  },

  trustText: {
    color: '#c7d2fe',
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },

  actions: {
    marginBottom: 24,
  },

  reviewBtn: {
    height: 56,
    borderRadius: 22,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1e293b',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: -20,
  },

  reviewText: {
    color: '#cbd5f5',
    fontWeight: '900',
    fontSize: 16,
  },

  supportCenter: {
    alignItems: 'center',
    marginTop: 12,
  },

  link: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    color: '#94a3b8',
  },

  homeIndicator: {
    alignSelf: 'center',
    width: 120,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#020617',
    marginBottom: 12,
  },
});
