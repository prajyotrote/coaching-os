import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function UserWelcomeScreen() {
  const handleContinue = () => {
    router.replace('/Onboarding/user/NameScreen');
  };

  return (
    <Pressable style={styles.container} onPress={handleContinue}>
      {/* Background */}
      <LinearGradient
        colors={['#000000', '#000000', '#061814']}
        locations={[0, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle Glow */}
      <View style={styles.glowLeft} />
      <View style={styles.glowRight} />

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.wave}>👋</Text>
        <Text style={styles.title}>Hey there!</Text>
      </View>

      {/* Hint */}
      <View style={styles.hintContainer}>
        <Text style={styles.hint}>Tap anywhere to begin</Text>
      </View>

      {/* iOS Home Indicator */}
      <View style={styles.homeIndicatorWrapper}>
        <View style={styles.homeIndicator} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  glowLeft: {
    position: 'absolute',
    bottom: -80,
    left: -120,
    width: 300,
    height: 300,
    backgroundColor: '#0f766e',
    borderRadius: 300,
    opacity: 0.25,
  },

  glowRight: {
    position: 'absolute',
    bottom: -120,
    right: -160,
    width: 360,
    height: 360,
    backgroundColor: '#022c22',
    borderRadius: 360,
    opacity: 0.3,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
  },

  wave: {
    fontSize: 36,
    marginBottom: 12,
  },

  title: {
    fontSize: 38,
    fontWeight: '500',
    color: '#ffffff',
    letterSpacing: -0.5,
  },

  hintContainer: {
    position: 'absolute',
    bottom: 110,
    left: 32,
  },

  hint: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '500',
  },

  homeIndicatorWrapper: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    opacity: 0.3,
  },

  homeIndicator: {
    height: 5,
    width: 120,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
});