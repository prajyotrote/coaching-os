import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Image,
} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { useDashboardData } from '@/lib/hooks/useDashboardData';
import { useHealthActions } from '@/lib/hooks/useHealthActions';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, withTiming, useAnimatedProps } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

import {
  Bell,
  User,
  Activity,
  Moon,
  Zap,
  Scale,
  TrendingUp,
  TrendingDown,
  Dumbbell,
  Utensils,
  Droplets,
  LayoutGrid,
  MessageSquare,
  Plus,
  ArrowRight,
  Footprints,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface Props {
  onLogout?: () => void;
}

export default function UserDashboard({ onLogout }: Props) {
  const {
  score,
  steps = 0,
  water,
  calories,
  workouts,
  refresh,
} = useDashboardData();
 const radius = 80;
const circumference = 2 * Math.PI * radius;

const safeScore = Math.min(100, Math.max(0, score || 0));

const progress = useSharedValue(0);

useEffect(() => {
  progress.value = withTiming(safeScore, { duration: 800 });
}, [safeScore]);

const animatedProps = useAnimatedProps(() => ({
  strokeDashoffset:
    circumference - (progress.value / 100) * circumference,
}));

const { logWorkout, logWater, logMeal } = useHealthActions();

  

  const metrics = [
    { label: 'Workouts', val: `${workouts}`, icon: Activity, trend: 'up' },
    { label: 'Sleep', val: '7h 20m', icon: Moon },
    { label: 'Recovery', val: '74%', icon: Zap, trend: 'up' },
    { label: 'Weight', val: '72.1', icon: Scale, trend: 'down' },
  ];

 const sideQuests = [
  { label: 'Workouts', val: `${workouts} / 1`, percent: Math.min(100, workouts * 100), icon: Footprints },
  { label: 'Nutrition', val: `${calories} cal`, percent: Math.min(100, calories / 2000 * 100), icon: Utensils },
  { label: 'Water', val: `${water}ml / 3000ml`, percent: Math.min(100, water / 3000 * 100), icon: Droplets },
];


  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>

        {/* HEADER */}
        <View style={styles.header}>
          <MaskedView
            maskElement={<Text style={styles.loop}>LOOP</Text>}
          >
            <LinearGradient
              colors={['#818cf8', '#a78bfa']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={[styles.loop, { opacity: 0 }]}>LOOP</Text>
            </LinearGradient>
          </MaskedView>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Pressable style={styles.iconBtn}>
              <Bell size={20} color="#9ca3af" />
              <View style={styles.dot} />
            </Pressable>
            <Pressable style={styles.avatar} onPress={onLogout}>
              <User size={18} color="#9ca3af" />
            </Pressable>
          </View>
        </View>

        {/* GREETING */}
        <MaskedView
          maskElement={<Text style={styles.greeting}>Good morning, Prajyot</Text>}
        >
          <LinearGradient
            colors={['#ffffff', '#c7d2fe', '#ddd6fe']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.greeting, { opacity: 0 }]}>
              Good morning, Prajyot
            </Text>
          </LinearGradient>
        </MaskedView>

        <Text style={styles.subGreeting}>Let’s move you closer to your goals today.</Text>

        {/* DAILY SCORE */}
        <View style={styles.ringWrap}>
          <Svg width={200} height={200}>
            <Circle
              cx="100"
              cy="100"
              r={radius}
              stroke="#111"
              strokeWidth="14"
              fill="none"
            />
           <AnimatedCircle
  cx="100"
  cy="100"
  r={radius}
  stroke="#818cf8"
  strokeWidth="14"
  fill="none"
  strokeDasharray={circumference}
  animatedProps={animatedProps}
  strokeLinecap="round"
  rotation="-90"
  origin="100,100"
/>
          </Svg>
        
          <View style={styles.ringCenter}>
            <Text style={styles.score}>{safeScore}%</Text>
            <Text style={styles.today}>TODAY</Text>
          </View>
        </View>

        <Text style={styles.streak}>KEEP YOUR STREAK ALIVE</Text>

        {/* CORE METRICS */}
        <View style={styles.metricsGrid}>
          {metrics.map((m, i) => (
            <View key={i} style={styles.metricCard}>
              <View style={styles.metricTop}>
                <m.icon size={18} color="#818cf8" />
                {m.trend === 'up' && <TrendingUp size={12} color="#34d399" />}
                {m.trend === 'down' && <TrendingDown size={12} color="#60a5fa" />}
              </View>
              <Text style={styles.metricValue}>{m.val}</Text>
              <Text style={styles.metricLabel}>{m.label}</Text>
            </View>
          ))}
        </View>

        {/* MAIN MISSION */}
        <View style={styles.mission}>
          <View style={styles.missionHeader}>
            <Dumbbell size={26} color="#818cf8" />
            <Text style={styles.coach}>Coach Rahul</Text>
          </View>

          <Text style={styles.missionTitle}>Upper Body Workout</Text>

          <View style={styles.tags}>
            {['Strength', '45 Min', 'Hypertrophy'].map(t => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        
          <Pressable style={styles.startBtn} onPress={async () => {
  await logWorkout();
  await refresh();
}}>
            <Text style={styles.startText}>START WORKOUT</Text>
            <ArrowRight size={20} color="#000" />
          </Pressable>
        </View>

        {/* SIDE QUESTS */}
        <Text style={styles.section}>SIDE QUESTS</Text>
        <View style={styles.sideGrid}>
          {sideQuests.map((q, i) => (
            <View key={i} style={styles.sideCard}>
              <q.icon size={18} color="#818cf8" />
              <Text style={styles.sideVal}>{q.val}</Text>
              <Text style={styles.sideLabel}>{q.label}</Text>
            </View>
          ))}
        </View>
                                        
        {/* QUICK BOOST */}
        <Text style={styles.section}>QUICK BOOST</Text>
       <View style={styles.quickRow}>

  {/* Log Workout */}
  <Pressable style={styles.quickBtn} onPress={async () => {
  await logWorkout();
  await refresh();
}}
>
    <Dumbbell size={20} color="#888" />
  </Pressable>

  {/* Add Meal */}
  <Pressable style={styles.quickBtn}onPress={async () => {
  await logMeal(400);
  await refresh();
}}
>
    <Utensils size={20} color="#888" />
  </Pressable>

  {/* Add Water */}
  <Pressable style={styles.quickBtn} onPress={async () => {
  await logWater(500);
  await refresh();
}}
>
    <Droplets size={20} color="#888" />
  </Pressable>

  {/* Check-in (future) */}
  <Pressable style={styles.quickBtn}>
    <LayoutGrid size={20} color="#888" />
  </Pressable>

</View>

          <Text style={styles.section}>MESSAGE FROM COACH</Text>
        {/* COACH MESSAGE */}
        <View style={styles.coachCard}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/100' }}
            style={styles.coachAvatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.coachName}>Coach Rahul</Text>
            <Text style={styles.coachMsg}>Great job yesterday 💪 Keep it up!</Text>
          </View>
          <MessageSquare size={18} color="#555" />
        </View>

      </ScrollView>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        {[LayoutGrid, TrendingUp, Plus, MessageSquare, User].map((Icon, i) => (
          <Pressable key={i} style={i === 2 ? styles.centerBtn : undefined}>
            <Icon size={24} color={i === 2 ? '#fff' : '#666'} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  loop: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 6,
  },

  iconBtn: {
    backgroundColor: '#111',
    padding: 10,
    borderRadius: 14,
  },

  dot: {
    width: 6,
    height: 6,
    backgroundColor: '#818cf8',
    borderRadius: 3,
    position: 'absolute',
    top: 6,
    right: 6,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },

  greeting: {
    fontSize: 30,
    fontWeight: '900',
    marginTop: 24,
    paddingHorizontal: 24,
  },

  subGreeting: {
    color: '#666',
    paddingHorizontal: 24,
    marginTop: 6,
  },

  ringWrap: {
    alignItems: 'center',
    marginTop: 32,
  },

  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 70,
  },

  score: { color: '#fff', fontSize: 40, fontWeight: '900' },
  today: { color: '#666', fontSize: 10, letterSpacing: 3 },

  streak: {
    textAlign: 'center',
    marginTop: 16,
    color: '#818cf8',
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: '800',
  },

  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    padding: 24,
  },

  metricCard: {
    width: (width - 60) / 2,
    backgroundColor: '#111',
    borderRadius: 24,
    padding: 16,
  },

  metricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  metricValue: { color: '#fff', fontWeight: '900', marginTop: 10 },
  metricLabel: { color: '#555', fontSize: 10 },

  mission: {
    marginHorizontal: 24,
    padding: 24,
    borderRadius: 32,
    backgroundColor: '#111',
  },

  missionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  coach: { color: '#818cf8', fontSize: 10 },

  missionTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    marginVertical: 12,
  },

  tags: { flexDirection: 'row', gap: 8, marginBottom: 20 },

  tag: {
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },

  tagText: { color: '#777', fontSize: 10 },

  startBtn: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },

  startText: { fontWeight: '900' },

  section: {
    marginTop: 32,
    marginBottom: 12,
    textAlign: 'center',
    color: '#444',
    letterSpacing: 3,
    fontSize: 10,
  },

  sideGrid: {
    flexDirection: 'row',
    justifyContent: 'space-evenly' 
  },

  sideCard: {
    backgroundColor: '#111',
    borderRadius: 22,
    padding: 16,
    alignItems: 'center',
    width: 100,
  },

  sideVal: { color: '#fff', fontWeight: '900', marginTop: 6 },
  sideLabel: { color: '#555', fontSize: 9 },

  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 20,
  },

  quickBtn: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },

  coachCard: {
    margin: 24,
    padding: 16,
    borderRadius: 24,
    backgroundColor: '#111',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  coachAvatar: { width: 42, height: 42, borderRadius: 21 },

  coachName: { color: '#818cf8', fontSize: 10 },
  coachMsg: { color: '#ddd', fontWeight: '700' },

  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: '#050505',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  centerBtn: {
    backgroundColor: '#6366f1',
    padding: 14,
    borderRadius: 20,
    marginBottom: 30,
  },
});
