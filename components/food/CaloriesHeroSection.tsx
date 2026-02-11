import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

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

function MacroRing({
  label,
  value,
  target,
  color,
}: {
  label: string;
  value: number;
  target: number;
  color: string;
}) {
  const radius = 20;
  const stroke = 4;
  const circumference = 2 * Math.PI * radius;
  const progress = clamp(value / Math.max(target, 1), 0, 1);
  const offset = circumference * (1 - progress);
  const animatedOffset = useRef(new Animated.Value(circumference)).current;

  useEffect(() => {
    Animated.timing(animatedOffset, {
      toValue: offset,
      duration: 700,
      useNativeDriver: false,
    }).start();
  }, [offset]);

  return (
    <View style={styles.macroItem}>
      <View style={styles.macroRingWrap}>
        <Svg width={52} height={52}>
          <Circle
            cx="26"
            cy="26"
            r={radius}
            stroke="#141414"
            strokeWidth={stroke}
            fill="none"
          />
          <AnimatedSvgCircle
            cx="26"
            cy="26"
            r={radius}
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={animatedOffset}
            strokeLinecap="round"
            fill="none"
            rotation="-90"
            origin="26,26"
          />
        </Svg>
        <Text style={styles.macroValue}>{value}g</Text>
      </View>
      <Text style={styles.macroLabel}>{label}</Text>
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
  const ringRadius = 86;
  const ringStroke = 12;
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
      <Text style={styles.headline}>Great job today</Text>

      <View style={styles.arcWrap}>
        <Svg width={220} height={220}>
          <Defs>
            <LinearGradient id="calArc" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#F4C27A" />
              <Stop offset="50%" stopColor="#C4B5FD" />
              <Stop offset="100%" stopColor="#8B5CF6" />
            </LinearGradient>
          </Defs>
          <Circle
            cx="110"
            cy="110"
            r={ringRadius}
            stroke="#1A1A1A"
            strokeWidth={ringStroke}
            fill="none"
          />
          <AnimatedSvgCircle
            cx="110"
            cy="110"
            r={ringRadius}
            stroke="url(#calArc)"
            strokeWidth={ringStroke}
            strokeDasharray={ringCircumference}
            strokeDashoffset={ringAnimatedOffset}
            strokeLinecap="round"
            fill="none"
            rotation="-90"
            origin="110,110"
          />
        </Svg>

        <View style={styles.arcMetaLeft}>
          <Text style={styles.arcMetaValue}>{left}</Text>
          <Text style={styles.arcMetaLabel}>left</Text>
        </View>
        <View style={styles.arcMetaRight}>
          <Text style={styles.arcMetaValue}>{logs}</Text>
          <Text style={styles.arcMetaLabel}>logs</Text>
        </View>

        <View style={styles.centerBlock}>
          <Text style={styles.caloriesValue}>{caloriesConsumed}</Text>
          <Text style={styles.caloriesLabel}>Calories</Text>
        </View>
      </View>

      <View style={styles.macroRow}>
        <MacroRing label="Protein" value={protein} target={140} color="#7AA2F7" />
        <MacroRing label="Carbs" value={carbs} target={220} color="#BFA3FF" />
        <MacroRing label="Fat" value={fat} target={70} color="#F2B27A" />
        <MacroRing label="Fiber" value={fiber} target={30} color="#A7F3D0" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 6,
    paddingBottom: 8,
  },
  headline: {
    color: '#6B7280',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  arcWrap: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerBlock: {
    position: 'absolute',
    alignItems: 'center',
  },
  caloriesValue: {
    color: '#F3F4F6',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  caloriesLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  arcMetaLeft: {
    position: 'absolute',
    left: 10,
    top: 16,
    alignItems: 'center',
  },
  arcMetaRight: {
    position: 'absolute',
    right: 10,
    top: 16,
    alignItems: 'center',
  },
  arcMetaValue: {
    color: '#C7D2FE',
    fontSize: 12,
    fontWeight: '700',
  },
  arcMetaLabel: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 2,
  },
  macroRow: {
    marginTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroItem: {
    alignItems: 'center',
    flex: 1,
  },
  macroRingWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroValue: {
    position: 'absolute',
    color: '#E5E7EB',
    fontSize: 11,
    fontWeight: '700',
  },
  macroLabel: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 6,
  },
});
