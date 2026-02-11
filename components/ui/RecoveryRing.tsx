import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { HeartPulse } from 'lucide-react-native';

interface RecoveryRingProps {
  score: number;
  readiness: 'Green' | 'Yellow' | 'Red';
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

function readinessColor(readiness: 'Green' | 'Yellow' | 'Red') {
  if (readiness === 'Green') return '#22C55E';
  if (readiness === 'Yellow') return '#F59E0B';
  return '#EF4444';
}

export default function RecoveryRing({
  score,
  readiness,
}: RecoveryRingProps) {
  const radius = 86;
  const stroke = 12;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), 100) / 100;
  const targetOffset = circumference * (1 - progress);

  const animatedOffset = useRef(
    new Animated.Value(circumference)
  ).current;

  useEffect(() => {
    Animated.timing(animatedOffset, {
      toValue: targetOffset,
      duration: 1100,
      useNativeDriver: false,
    }).start();
  }, [targetOffset]);

  const accent = readinessColor(readiness);

  return (
    <View style={styles.wrap}>
      <Svg width={210} height={210}>
        <Defs>
          <LinearGradient id="recoveryGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={accent} stopOpacity="0.9" />
            <Stop offset="100%" stopColor="#60A5FA" stopOpacity="0.9" />
          </LinearGradient>
        </Defs>

        <Circle
          cx="105"
          cy="105"
          r={radius}
          stroke="#141414"
          strokeWidth={stroke}
          fill="none"
        />

        <AnimatedCircle
          cx="105"
          cy="105"
          r={radius}
          stroke="url(#recoveryGrad)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          strokeLinecap="round"
          rotation="-90"
          origin="105,105"
        />
      </Svg>

      <View style={styles.center}>
        <View style={[styles.iconWrap, { borderColor: `${accent}55` }]}>
          <HeartPulse size={18} color={accent} />
        </View>
        <Text style={styles.value}>{score}</Text>
        <Text style={[styles.readiness, { color: accent }]}>
          {readiness}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    backgroundColor: '#0A0A0A',
  },
  value: {
    color: '#fff',
    fontSize: 42,
    fontWeight: '900',
  },
  readiness: {
    marginTop: 4,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
});
