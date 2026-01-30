import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function TrainerWelcomeScreen() {
  return (
    <View style={styles.container}>
      {/* Background glow */}
      <LinearGradient
        colors={['rgba(79,70,229,0.15)', 'transparent']}
        style={styles.glowTop}
      />
      <LinearGradient
        colors={['rgba(37,99,235,0.12)', 'transparent']}
        style={styles.glowBottom}
      />

      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
        >
          <Feather name="chevron-left" size={26} color="#9ca3af" />
        </Pressable>

        <Text style={styles.brand}>LOOP / TRAINER</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconWrap}>
          <Feather name="shield" size={36} color="#6366f1" />
          <View style={styles.statusDot} />
        </View>

        {/* Title */}
        <Text style={styles.title}>
          Build your{'\n'}coaching identity.
        </Text>

        <Text style={styles.subtitle}>
          Create a professional trainer profile and get ready to coach with clarity,
          trust, and results.
        </Text>

        {/* Value bullets */}
        <View style={styles.bullets}>
          <Bullet icon="check-circle" text="Verified trainer profile" />
          <Bullet icon="bar-chart-2" text="Client-ready tools & tracking" />
          <Bullet icon="globe" text="Designed for future client discovery" />
        </View>
      </View>

      {/* CTA */}
      <Pressable
        style={styles.cta}
        onPress={() => router.replace('/Onboarding/coach/name')}
      >
        <Text style={styles.ctaText}>Start Trainer Setup</Text>
        <Feather name="arrow-right" size={20} color="#000" />
      </Pressable>

      {/* Home indicator */}
      <View style={styles.homeIndicator} />
    </View>
  );
}

/* -------------------------------
   🔹 Bullet Component
-------------------------------- */
function Bullet({ icon, text }: { icon: any; text: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletIcon}>
        <Feather name={icon} size={18} color="#818cf8" />
      </View>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

/* -------------------------------
   🎨 Styles
-------------------------------- */
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
    width: 400,
    height: 300,
    borderRadius: 200,
  },
  glowBottom: {
    position: 'absolute',
    bottom: -140,
    left: -140,
    width: 400,
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

  content: {
    flex: 1,
  },

  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 28,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  statusDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6366f1',
  },

  title: {
    fontSize: 38,
    fontWeight: '900',
    color: '#fff',
    lineHeight: 42,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    maxWidth: 320,
    marginBottom: 40,
  },

  bullets: {
    gap: 20,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  bulletIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bulletText: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: '700',
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
