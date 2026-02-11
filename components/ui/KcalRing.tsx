import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Flame, Pencil } from 'lucide-react-native';

interface KcalRingProps {
  current: number;
  goal: number;
  onEditGoal?: () => void;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function KcalRing({
  current,
  goal,
  onEditGoal,
}: KcalRingProps) {
  const radius = 88;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;

  const progress = Math.min(current / Math.max(goal, 1), 1);
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

  return (
    <View style={styles.wrap}>
      <View style={styles.ringWrap}>
        <Svg width={210} height={210}>
          <Defs>
            <LinearGradient id="kcalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#F59E0B" />
              <Stop offset="100%" stopColor="#F97316" />
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
            stroke="url(#kcalGrad)"
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={animatedOffset}
            strokeLinecap="round"
            rotation="-90"
            origin="105,105"
          />
        </Svg>

        <View style={styles.innerGlow} />

        <View style={styles.center}>
          <View style={styles.iconWrap}>
            <Flame size={18} color="#FBBF24" />
          </View>

          <Text style={styles.value}>{current}</Text>

          <Pressable onPress={onEditGoal} style={styles.goalRow} hitSlop={10}>
            <Text style={styles.goalText}>of {goal} kcal</Text>
            <View style={styles.pencil}>
              <Pencil size={10} color="#9CA3AF" />
            </View>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  ringWrap: {
    width: 210,
    height: 210,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  value: {
    color: '#fff',
    fontSize: 38,
    fontWeight: '900',
  },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  goalText: {
    color: '#9CA3AF',
    fontSize: 14,
    marginRight: 6,
  },
  pencil: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#000',
    opacity: 0.28,
  },
});
