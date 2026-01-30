import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function TrainerApprovedScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(99,102,241,0.15)', 'transparent']}
        style={styles.glow}
      />

      {/* Approved Badge */}
      <View style={styles.badge}>
        <Feather name="check" size={12} color="#fff" />
        <Text style={styles.badgeText}>APPROVED</Text>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.title}>You’re approved.</Text>
        <Text style={styles.subtle}>Your Loop workspace is ready.</Text>
        <Text style={styles.strong}>Let’s set up your first client.</Text>
      </View>

      {/* Feature Grid */}
      <View style={styles.grid}>
        <View style={styles.row}>
          <View style={styles.card}>
            <Feather name="zap" size={22} color="#818cf8" />
            <Text style={styles.cardText}>AI Insights</Text>
            <Text style={styles.cardSub}>
  Smart patterns from client data
</Text>

          </View>

          <View style={styles.card}>
            <Feather name="alert-triangle" size={22} color="#f59e0b" />
            <Text style={styles.cardText}>Risk Alerts</Text>
            <Text style={styles.cardSub}>
 Early warnings before client burnouts
</Text>

          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.card}>
            <Feather name="activity" size={22} color="#34d399" />
            <Text style={styles.cardText}>Progress</Text>
            <Text style={styles.cardSub}>
Track habits, strength & recovery
</Text>

          </View>

          <View style={styles.card}>
            <Feather name="users" size={22} color="#60a5fa" />
            <Text style={styles.cardText}>Clients</Text>
            <Text style={styles.cardSub}>
  Manage all clients in one place
</Text>

          </View>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <Pressable style={styles.primaryBtn} onPress={() => router.push('/')}>
          <Feather name="plus" size={18} color="#000" />
          <Text style={styles.primaryText}>Add First Client</Text>
        </Pressable>

        <Pressable onPress={() => router.replace('/Onboarding/coach/TrainerDashboard')}>
          <Text style={styles.secondary}>Continue to Dashboard →</Text>
        </Pressable>

        <Text style={styles.helper}>
          You can add clients later from your dashboard.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingTop: 110,
  },

  glow: {
    position: 'absolute',
    top: -120,
    left: -120,
    width: 400,
    height: 300,
    borderRadius: 200,
  },

  badge: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#020617',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 24,
    alignItems: 'center',
  },

  badgeText: {
    fontSize: 10,
    letterSpacing: 3,
    color: '#818cf8',
    fontWeight: '900',
  },

  hero: {
    alignItems: 'center',
    marginBottom: 30,
  },

  title: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '900',
    marginBottom: 8,
  },

  subtle: {
    color: '#94a3b8',
    fontSize: 16,
  },

  strong: {
    color: '#e5e7eb',
    fontSize: 16,
    fontWeight: '800',
    marginTop: 2,
  },

  grid: {
    gap: 14,
    marginBottom: 40,
  },

  row: {
    flexDirection: 'row',
    gap: 14,
  },

 card: {
  flex: 1,
  aspectRatio: 1,
  borderRadius: 24,
  borderWidth: 1,
  borderColor: '#1e293b',
  justifyContent: 'center',
  alignItems: 'center',
  padding: 12,
  backgroundColor: '#020617',

  shadowColor: '#46558f',
  shadowOpacity: 0.8,
  shadowRadius: 12,
  elevation: 4,
},
cardSub: {
  color: '#64748b',
  fontSize: 11,
  textAlign: 'center',
  marginTop: 4,
},


  cardText: {
    color: '#cbd5f5',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 1,
  },

  actions: {
    marginTop: 'auto',
    paddingBottom: 80,
    alignItems: 'center',
  },

  primaryBtn: {
    width: '100%',
    height: 56,
    borderRadius: 22,
    backgroundColor: '#fff',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  primaryText: {
    color: '#000',
    fontWeight: '900',
    fontSize: 16,
  },

  secondary: {
    color: '#94a3b8',
    fontWeight: '800',
    marginBottom: 10,
  },

  helper: {
    fontSize: 10,
    letterSpacing: 2,
    color: '#475569',
    textAlign: 'center',
  },
});
