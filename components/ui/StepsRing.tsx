import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Footprints, MapPin, Flame, Pencil } from 'lucide-react-native';

/* ======================================================
   PROPS
====================================================== */

interface StepsRingProps {
  current: number;
  goal: number;
  distance: string;
  calories: string;
  onLongPress?: () => void;
  onEditGoal?: () => void;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/* ======================================================
   COMPONENT
====================================================== */

export default function StepsRing({
  current,
  goal,
  distance,
  calories,
  onLongPress,
  onEditGoal,
}: StepsRingProps) {
  const radius = 90;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;

  const progress = Math.min(current / goal, 1);
  const targetOffset = circumference * (1 - progress);

  // 🔁 Progress animation
  const animatedOffset = useRef(
    new Animated.Value(circumference)
  ).current;

  // ✨ Glow pulse
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedOffset, {
      toValue: targetOffset,
      duration: 1200,
      useNativeDriver: false,
    }).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(glow, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(glow, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [targetOffset]);

  const glowOpacity = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [0.25, 0.55],
  });

  return (
    <Pressable
      onLongPress={onLongPress}
      delayLongPress={600}
      style={styles.wrap}
    >
      {/* SOFT HALO */}
      <Animated.View style={[styles.halo, { opacity: glowOpacity }]} />

      {/* RING */}
      <View style={styles.ringWrap}>
        <Svg width={220} height={220}>
          <Defs>
            <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor="#8b5cf6" />
              <Stop offset="100%" stopColor="#60a5fa" />
            </LinearGradient>
          </Defs>

          {/* Background */}
          <Circle
            cx="110"
            cy="110"
            r={radius}
            stroke="#141414"
            strokeWidth={stroke}
            fill="none"
          />

          {/* Progress */}
          <AnimatedCircle
            cx="110"
            cy="110"
            r={radius}
            stroke="url(#grad)"
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={animatedOffset}
            strokeLinecap="round"
            rotation="-90"
            origin="110,110"
          />
        </Svg>

        {/* Inner highlight */}
        <View style={styles.innerGlow} />

        {/* CENTER CONTENT */}
        <View style={styles.center}>
          <View style={styles.iconWrap}>
            <Footprints size={18} color="#a78bfa" />
          </View>

          <Text style={styles.value}>{current.toLocaleString()}</Text>

          {/* EDIT GOAL ROW */}
          <Pressable
            onPress={onEditGoal}
            style={styles.goalRow}
            hitSlop={10}
          >
            <Text style={styles.goalText}>
              of {goal.toLocaleString()} goal
            </Text>

            <View style={styles.pencil}>
              <Pencil size={10} color="#9CA3AF" />
            </View>
          </Pressable>
        </View>
      </View>

      {/* METRIC PILL */}
      <View style={styles.pill}>
        <View style={styles.pillItem}>
          <MapPin size={14} color="#60a5fa" />
          <Text style={styles.pillText}>{distance}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.pillItem}>
          <Flame size={14} color="#fb923c" />
          <Text style={styles.pillText}>{calories}</Text>
        </View>
      </View>
    </Pressable>
  );
}

/* ======================================================
   STYLES
====================================================== */

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginTop: 5,
  },

  // halo: {
  //   position: 'absolute',
  //   width: 210,
  //   height: 210,
  //   borderRadius: 105,
  //   backgroundColor: '#8b5cf6',
  // },

  // halo: {
  //   position: 'absolute',
  //   width: 210,
  //   height: 210,
  //   borderRadius: 105,
  //   backgroundColor: '#8b5cf6',
  // },

  ringWrap: {
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
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

    // shadowColor: '#8b5cf6',
    // shadowOpacity: 0.6,
    // shadowRadius: 10,
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

  pill: {
    marginTop: 6,
    backgroundColor: '#0f0f0f',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,

    shadowColor: '#1b407f60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
  },

  pillItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  pillText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 11,
  },

  divider: {
    width: 1,
    height: 12,
    backgroundColor: '#222',
    marginHorizontal: 6,
  },

  innerGlow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#000',
    opacity: 0.25,
  },
});
