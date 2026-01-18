import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Feather } from '@expo/vector-icons';

export default function SelectRoleScreen() {
  const router = useRouter();

  const onSelectRole = async (role: 'user' | 'coach') => {
    await AsyncStorage.setItem('selectedRole', role);
    router.push('/login');
  };

  return (
    <View style={styles.container}>
      {/* Hero / Brand Area */}
      <View style={styles.hero}>
        <View style={styles.logoBox}>
          <Feather name="target" size={28} color="#fff" />
        </View>
        <Text style={styles.brand}>FORGE</Text>
        <Text style={styles.tagline}>ELITE PERFORMANCE</Text>
      </View>

      {/* Welcome Context */}
      <View style={styles.context}>
        <Text style={styles.heading}>Welcome</Text>
        <Text style={styles.description}>
          Experience elite fitness through structured systems and expert human coaching.
        </Text>
      </View>

      {/* Role Selection */}
      <View style={styles.actions}>
        <Text style={styles.continueAs}>CONTINUE AS</Text>

        <Pressable style={styles.card} onPress={() => onSelectRole('user')}>
          <View>
            <Text style={styles.cardTitle}>User</Text>
            <Text style={styles.cardSub}>I want to train</Text>
          </View>
          <Feather name="chevron-right" size={22} color="#999" />
        </Pressable>

        <Pressable style={styles.card} onPress={() => onSelectRole('coach')}>
          <View>
            <Text style={styles.cardTitle}>Coach</Text>
            <Text style={styles.cardSub}>I want to manage athletes</Text>
          </View>
          <Feather name="chevron-right" size={22} color="#999" />
        </Pressable>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  hero: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 48,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  brand: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 10,
    letterSpacing: 2,
    color: '#94a3b8',
    marginTop: 4,
  },
  context: {
    marginBottom: 'auto',
  },
  heading: {
    fontSize: 36,
    fontWeight: '800',
    lineHeight: 42,
  },
  description: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 12,
    lineHeight: 24,
  },
  actions: {
    marginTop: 32,
  },
  continueAs: {
    fontSize: 10,
    letterSpacing: 2,
    color: '#94a3b8',
    marginBottom: 12,
  },
  card: {
    height: 80,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 20,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  cardSub: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
});
