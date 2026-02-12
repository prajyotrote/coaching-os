import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop, RadialGradient } from 'react-native-svg';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';

const AnimatedSvgCircle = Animated.createAnimatedComponent(Circle);

type Props = {
  caloriesConsumed: number;
  caloriesTarget: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  logs?: number;
};

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function MacroCard({
  label,
  value,
  target,
  color,
  bgColor,
}: {
  label: string;
  value: number;
  target: number;
  color: string;
  bgColor: string;
}) {
  const progress = clamp(value / Math.max(target, 1), 0, 1);
  const percent = Math.round(progress * 100);

  return (
    <View style={styles.macroCard}>
      <ExpoLinearGradient
        colors={[bgColor, 'rgba(0,0,0,0)']}
        style={styles.macroCardInner}
      >
        <Text style={[styles.macroLabel, { color }]}>{label}</Text>
        <Text style={styles.macroValue}>{value}g</Text>
        <View style={styles.macroProgressTrack}>
          <View style={[styles.macroProgressFill, { width: `${percent}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.macroTarget}>{target}g goal</Text>
      </ExpoLinearGradient>
    </View>
  );
}

export default function CaloriesHeroSection({
  caloriesConsumed,
  caloriesTarget,
  protein,
  carbs,
  fat,
  fiber,
  logs = 0,
}: Props) {
  const progress = useMemo(() => {
    return clamp(caloriesConsumed / Math.max(caloriesTarget, 1), 0, 1);
  }, [caloriesConsumed, caloriesTarget]);

  const left = Math.max(0, caloriesTarget - caloriesConsumed);
  const percent = Math.round(progress * 100);
  const ringRadius = 80;
  const ringStroke = 10;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - progress);
  const ringAnimatedOffset = useRef(
    new Animated.Value(ringCircumference)
  ).current;

  useEffect(() => {
    Animated.timing(ringAnimatedOffset, {
      toValue: ringOffset,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [ringOffset]);

  return (
    <View style={styles.container}>
      {/* Hero Ring Section */}
      <View style={styles.heroCard}>
        <ExpoLinearGradient
          colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
          style={styles.heroCardInner}
        >
          <View style={styles.arcWrap}>
            {/* Glow Effect */}
            <View style={styles.glowWrap}>
              <ExpoLinearGradient
                colors={['rgba(139,92,246,0.3)', 'rgba(139,92,246,0.05)', 'transparent']}
                style={styles.glow}
              />
            </View>

            <Svg width={200} height={200}>
              <Defs>
                <LinearGradient id="calArc" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#a78bfa" />
                  <Stop offset="50%" stopColor="#818cf8" />
                  <Stop offset="100%" stopColor="#60a5fa" />
                </LinearGradient>
                <RadialGradient id="ringGlow" cx="50%" cy="50%" rx="50%" ry="50%">
                  <Stop offset="0%" stopColor="#a78bfa" stopOpacity="0.3" />
                  <Stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
                </RadialGradient>
              </Defs>

              {/* Outer glow */}
              <Circle cx="100" cy="100" r="95" fill="url(#ringGlow)" />

              {/* Background ring */}
              <Circle
                cx="100"
                cy="100"
                r={ringRadius}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth={ringStroke}
                fill="none"
              />

              {/* Progress ring */}
              <AnimatedSvgCircle
                cx="100"
                cy="100"
                r={ringRadius}
                stroke="url(#calArc)"
                strokeWidth={ringStroke}
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringAnimatedOffset}
                strokeLinecap="round"
                fill="none"
                rotation="-90"
                origin="100,100"
              />
            </Svg>

            <View style={styles.centerBlock}>
              <Text style={styles.caloriesLabel}>CONSUMED</Text>
              <Text style={styles.caloriesValue}>{caloriesConsumed}</Text>
              <Text style={styles.caloriesUnit}>kcal</Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{left}</Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{caloriesTarget}</Text>
              <Text style={styles.statLabel}>Target</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: '#a78bfa' }]}>{percent}%</Text>
              <Text style={styles.statLabel}>Progress</Text>
            </View>
          </View>
        </ExpoLinearGradient>
      </View>

      {/* Macros Section */}
      <Text style={styles.sectionTitle}>MACRONUTRIENTS</Text>
      <View style={styles.macroRow}>
        <MacroCard label="Protein" value={protein} target={140} color="#60a5fa" bgColor="rgba(96,165,250,0.15)" />
        <MacroCard label="Carbs" value={carbs} target={220} color="#a78bfa" bgColor="rgba(167,139,250,0.15)" />
      </View>
      <View style={styles.macroRow}>
        <MacroCard label="Fat" value={fat} target={70} color="#fbbf24" bgColor="rgba(251,191,36,0.15)" />
        <MacroCard label="Fiber" value={fiber} target={30} color="#34d399" bgColor="rgba(52,211,153,0.15)" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
  },

  heroCard: {
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  heroCardInner: {
    padding: 24,
    alignItems: 'center',
  },

  arcWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  glowWrap: {
    position: 'absolute',
    width: 220,
    height: 220,
  },
  glow: {
    flex: 1,
    borderRadius: 110,
  },

  centerBlock: {
    position: 'absolute',
    alignItems: 'center',
  },
  caloriesLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
  },
  caloriesValue: {
    color: '#fff',
    fontSize: 44,
    fontWeight: '900',
    marginTop: -2,
  },
  caloriesUnit: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: -4,
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  sectionTitle: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 24,
    marginBottom: 12,
  },

  macroRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  macroCard: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  macroCardInner: {
    padding: 14,
  },
  macroLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  macroValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 4,
  },
  macroProgressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    marginTop: 10,
    overflow: 'hidden',
  },
  macroProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  macroTarget: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    marginTop: 6,
  },
});
