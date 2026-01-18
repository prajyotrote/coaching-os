import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';

export default function CoachWelcome() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, Coach</Text>

      <Text style={styles.subtitle}>
        Your coach account has been created.
        We’ll verify your profile before you can start training athletes.
      </Text>

      <Pressable
        style={styles.button}
        onPress={() => router.replace('/Onboarding/coach/review')}
      >
        <Text style={styles.buttonText}>Continue</Text>
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
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 40,
    lineHeight: 24,
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
