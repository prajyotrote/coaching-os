import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { Droplets } from 'lucide-react-native';
import { LinearGradient as ExpoLinearGradient } from 'expo-linear-gradient';

interface HydrationRingProps {
  current: number;
  goal: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function HydrationRing({
  current,
  goal,
}: HydrationRingProps) {
  const radius = 90;
  const stroke = 12;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(current / Math.max(goal, 1), 1);
  const targetOffset = circumference * (1 - progress);
  const innerSize = 150;
  const targetFill = innerSize * progress;

  const animatedOffset = useRef(
    new Animated.Value(circumference)
  ).current;
  const animatedFill = useRef(new Animated.Value(0)).current;
  const wave = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedOffset, {
      toValue: targetOffset,
      duration: 900,
      useNativeDriver: false,
    }).start();

    Animated.timing(animatedFill, {
      toValue: targetFill,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [targetOffset]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(wave, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(wave, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const waveTranslate = wave.interpolate({
    inputRange: [0, 1],
    outputRange: [-12, 12],
  });

  const pct = Math.round(progress * 100);

  return (
    <View style={styles.wrap}>
      <Svg width={220} height={220}>
        <Defs>
          <LinearGradient id="hydrationGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#60A5FA" />
            <Stop offset="100%" stopColor="#22D3EE" />
          </LinearGradient>
        </Defs>

        <Circle
          cx="110"
          cy="110"
          r={radius}
          stroke="#141414"
          strokeWidth={stroke}
          fill="none"
        />

        <AnimatedCircle
          cx="110"
          cy="110"
          r={radius}
          stroke="url(#hydrationGrad)"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset}
          strokeLinecap="round"
          rotation="-90"
          origin="110,110"
        />
      </Svg>

      {/* Inner fill */}
      <View style={[styles.fillWrap, { width: innerSize, height: innerSize }]}>
        <Animated.View style={[styles.fill, { height: animatedFill }]} />
        <Animated.View style={[styles.waveWrap, { transform: [{ translateX: waveTranslate }] }]}>
          <ExpoLinearGradient
            colors={['rgba(96,165,250,0.15)', 'rgba(34,211,238,0.5)', 'rgba(96,165,250,0.15)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.fillGlow}
          />
        </Animated.View>
      </View>

      <View style={styles.center}>
        <View style={styles.iconWrap}>
          <Droplets size={18} color="#7DD3FC" />
        </View>
        <Text style={styles.value}>{current} ml</Text>
        <Text style={styles.sub}>of {goal} ml</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fillWrap: {
    position: 'absolute',
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: '#05080E',
  },
  fill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#3B82F6',
    opacity: 0.35,
  },
  fillGlow: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '45%',
  },
  waveWrap: {
    position: 'absolute',
    left: -20,
    right: -20,
    bottom: 0,
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0B1220',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  value: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
  },
  sub: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
});
