import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

export default function CoachReviewScreen() {
  const handleSupport = () => {
    alert(
      'Your profile is under review.\n\nIf you need help, our support team will contact you shortly.'
    );
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace('/select-role');
  };

  return (
    <View style={styles.container}>
      {/* Brand */}
      <Text style={styles.brand}>FORGE FIT</Text>

      {/* Status Icon */}
      <View style={styles.iconWrapper}>
        <Feather name="shield" size={44} color="#0f172a" />
        <View style={styles.clockBadge}>
          <Feather name="clock" size={14} color="#475569" />
        </View>
      </View>

      {/* Main Content */}
      <Text style={styles.title}>Onboarding Complete 🎉</Text>

      <Text style={styles.text}>
        Your coach profile has been successfully submitted and is currently
        under review by the Forge Fit team.
      </Text>

      <Text style={styles.text}>
        We manually verify all coaches to maintain the highest standards across
        our platform.
      </Text>

      <Text style={styles.subtle}>
        Expected review time: 24–48 hours
      </Text>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable style={styles.primaryButton} onPress={handleSupport}>
          <Feather name="message-square" size={16} color="#fff" />
          <Text style={styles.primaryButtonText}>Contact Support</Text>
        </Pressable>

        <Pressable onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  brand: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    fontSize: 12,
    letterSpacing: 3,
    color: '#94a3b8',
    fontWeight: '700',
  },
  iconWrapper: {
    alignSelf: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  clockBadge: {
    position: 'absolute',
    bottom: -2,
    right: -6,
    backgroundColor: '#fff',
    padding: 4,
    borderRadius: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
    color: '#0f172a',
  },
  text: {
    fontSize: 15,
    color: '#475569',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
  },
  subtle: {
    marginTop: 12,
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actions: {
    marginTop: 40,
  },
  primaryButton: {
    height: 56,
    backgroundColor: '#0f172a',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  logoutText: {
    textAlign: 'center',
    color: '#94a3b8',
    fontWeight: '600',
  },
});
