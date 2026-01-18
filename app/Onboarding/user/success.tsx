import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function UserSuccess() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>You’re all set 💪</Text>

      <Text style={styles.subtitle}>
        Your account is ready.
        Let’s build consistency and results.
      </Text>

      <Pressable
        style={styles.button}
        onPress={() => router.replace('/')}
      >
        <Text style={styles.buttonText}>Enter App</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 40,
  },
  button: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
