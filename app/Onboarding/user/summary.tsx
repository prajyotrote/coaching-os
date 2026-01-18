import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import Svg, { Circle } from 'react-native-svg';

export default function SummaryScreen() {
  const metrics = {
    score: 84,
    bmi: 22.4,
    bmiCategory: 'Healthy',
    bmr: 1780,
    protein: 142,
  };

  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progress = (metrics.score / 100) * circumference;

  const handleContinue = async () => {
    // later:
    // update onboarding_step = completed
    router.replace('/');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Feather name="shield" size={14} color="#34d399" />
          <Text style={styles.badgeText}>BASELINE ESTABLISHED</Text>
        </View>

        <Text style={styles.title}>
          Your body,{'\n'}your baseline.
        </Text>
        <Text style={styles.subtitle}>
          We’ve analyzed your data to build your personalized profile.
        </Text>
      </View>

      {/* 🔥 HEALTH SCORE CARD (REFINED) */}
      <View style={styles.healthCard}>
        {/* Left */}
        <View>
          <Text style={styles.scoreLabel}>HEALTH SCORE</Text>

          <View style={styles.scoreRow}>
            <Text style={styles.score}>{metrics.score}</Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>

          <Text style={styles.scoreHint}>Strong starting point</Text>
        </View>

        {/* Right Ring */}
        <View style={styles.ringWrapper}>
          <Svg width={96} height={96}>
            <Circle
              cx="48"
              cy="48"
              r={radius}
              stroke="#1f2937"
              strokeWidth={6}
              fill="none"
            />
            <Circle
              cx="48"
              cy="48"
              r={radius}
              stroke="#34d399"
              strokeWidth={6}
              fill="none"
              strokeDasharray={`${progress} ${circumference}`}
              strokeLinecap="round"
              rotation="-90"
              origin="48,48"
            />
          </Svg>

          <View style={styles.ringIcon}>
            <Feather name="zap" size={26} color="#34d399" />
          </View>
        </View>
      </View>

      {/* Metrics Grid */}
      <View style={styles.grid}>
        <View style={styles.metricCard}>
          <Feather name="activity" size={18} color="#60a5fa" />
          <Text style={styles.metricLabel}>BMI</Text>
          <Text style={styles.metricValue}>{metrics.bmi}</Text>
          <Text style={styles.metricHint}>{metrics.bmiCategory}</Text>
        </View>

        <View style={styles.metricCard}>
          <Feather name="zap" size={18} color="#fbbf24" />
          <Text style={styles.metricLabel}>BMR</Text>
          <Text style={styles.metricValue}>{metrics.bmr}</Text>
          <Text style={styles.metricHint}>kcal/day</Text>
        </View>

        <View style={styles.metricCard}>
          <Feather name="droplet" size={18} color="#a78bfa" />
          <Text style={styles.metricLabel}>Protein</Text>
          <Text style={styles.metricValue}>{metrics.protein}g</Text>
          <Text style={styles.metricHint}>recommended</Text>
        </View>

        <View style={styles.metricCard}>
          <Feather name="target" size={18} color="#34d399" />
          <Text style={styles.metricLabel}>Focus</Text>
          <Text style={styles.metricValue}>Hypertrophy</Text>
          <Text style={styles.metricHint}>path ahead</Text>
        </View>
      </View>

      {/* Quote */}
      <Text style={styles.quote}>
        “The distance between who you are and who you want to be is bridged by action.”
      </Text>

      {/* CTA */}
      <Pressable style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue to Home</Text>
        <Feather name="arrow-right" size={18} color="#000" />
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 110,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  header: {
    alignItems: 'center',
    marginBottom: 32,
  },

  badge: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#020617',
    marginBottom: 16,
  },

  badgeText: {
    fontSize: 10,
    color: '#cbd5f5',
    fontWeight: '800',
    letterSpacing: 1,
  },

  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },

  subtitle: {
    color: '#94a3b8',
    textAlign: 'center',
    maxWidth: 260,
  },

  /* 🔥 HEALTH SCORE CARD */
  healthCard: {
    backgroundColor: '#020617',
    borderRadius: 36,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,

    shadowColor: '#34d399',
    shadowOpacity: 0.08,
    shadowRadius: 30,
  },

  scoreLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },

  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 6,
  },

  score: {
    fontSize: 48,
    fontWeight: '900',
    color: '#fff',
  },

  scoreMax: {
    color: '#34d399',
    marginBottom: 6,
    marginLeft: 4,
    fontWeight: '700',
  },

  scoreHint: {
    color: '#64748b',
    marginTop: 4,
  },

  ringWrapper: {
    width: 96,
    height: 96,
    justifyContent: 'center',
    alignItems: 'center',
  },

  ringIcon: {
    position: 'absolute',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#020617',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* GRID */
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },

  metricCard: {
    width: '48%',
    backgroundColor: '#020617',
    borderRadius: 24,
    padding: 16,
  },

  metricLabel: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 6,
  },

  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },

  metricHint: {
    fontSize: 10,
    color: '#64748b',
  },

  quote: {
    textAlign: 'center',
    color: '#64748b',
    fontStyle: 'italic',
    marginBottom: 32,
  },

  button: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 18,
    borderRadius: 28,
  },

  buttonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
  },
});
