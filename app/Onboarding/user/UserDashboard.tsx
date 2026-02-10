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
import { useRouter } from 'expo-router';

import Animated, {
  useSharedValue,
  withTiming,
  useAnimatedProps,
  Layout,
  FadeIn,
} from 'react-native-reanimated';

import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

import {
  Bell,
  User,
  Moon,
  Zap,
  TrendingUp,
  TrendingDown, 
  Dumbbell,
  Utensils,
  Droplets,
  LayoutGrid,
  MessageSquare,
  ArrowRight,
  Footprints,
  Camera,
  Flame,
  Plus,
  Play,
  Sparkles,
  ChevronRight, Droplet,
FileText,
} from 'lucide-react-native';
import { router } from 'expo-router';

const { width } = Dimensions.get('window');

interface Props {
  onLogout?: () => void;
}

export default function UserDashboard({ onLogout }: Props) {
  const {
    score,
    name,
    burned,
    steps = 0,
    sleep= 0,
    recovery,
    water,
    calories,
    workouts,
    refresh,
    targets,
  } = useDashboardData();

  function getGreeting() {
    
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';

  return 'Good Night';
}


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

  const waterProgress = useSharedValue(0);
const waterCircumference = 2 * Math.PI * 26; // r = 26 from SVG

useEffect(() => {
  const pct = Math.min(1, water / targets.waterTarget);
  waterProgress.value = withTiming(pct, { duration: 600 });
}, [water, targets.waterTarget]);

const animatedWaterProps = useAnimatedProps(() => ({
  strokeDashoffset:
    waterCircumference - waterProgress.value * waterCircumference,
}));



  const { logWorkout, logWater, logMeal } = useHealthActions();

  // ---------------- STON Intelligence (temporary logic)
// ----------------

let coachMessage = 'Stay consistent today 💪';
let coachAction: 'water' | 'meal' | 'workout' | null = null;

// simple rules (can be replaced by backend later)
if (water < targets.waterTarget * 0.4) {
  coachMessage = 'You are dehydrated — drink 500ml now 💧';
  coachAction = 'water';
} else if (calories < targets.calorieTarget * 0.4) {
  coachMessage = 'Log your next meal 🍽️';
  coachAction = 'meal';
} else if (workouts === 0) {
  coachMessage = 'Time to train — start your workout 💪';
  coachAction = 'workout';
}


  const metrics = [
    { label: 'Steps', val: `${steps}`, icon: Footprints, trend: 'up' },
    { label: 'Sleep', val: `${sleep.toFixed(1)}h`, icon: Moon },
    { label: 'Recovery', val: `${recovery}%`, icon: Zap, trend: 'up' },
    { label: 'Burned', val: `${burned} kcal`, icon: Flame, trend: 'up' },
  ];

  const sideQuests = [
    {
      label: 'Workouts',
      val: `${workouts} / ${targets.workoutTarget}`,
      icon: Dumbbell,
    },
    {
      label: 'Nutrition',
      val: `${calories} / ${targets.calorieTarget}`,
      icon: Utensils,
    },
    {
      label: 'Water',
      val: `${water}ml / ${targets.waterTarget}ml`,
      icon: Droplets,
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 140 }}>

        {/* HEADER */}
        <View style={styles.header}>
          <MaskedView maskElement={<Text style={styles.loop}>STON.FIT</Text>}>
            <LinearGradient colors={['#818cf8', '#a78bfa']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={[styles.loop, { opacity: 0 }]}>STON.FIT</Text>
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
        {/* GREETING */}
<MaskedView
  maskElement={
    <Text style={styles.greeting}>
     {getGreeting()}, {name || 'there'}
    </Text>
  }
>
  <LinearGradient
    colors={['#ffffff', '#c7d2fe', '#ddd6fe']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
  >
    <Text style={[styles.greeting, { opacity: 0 }]}>
      {getGreeting()}, {name || 'there'}
    </Text>
  </LinearGradient>
</MaskedView>


        <Text style={styles.subGreeting}>Let’s move you closer to your goals today.</Text>

        {/* DAILY SCORE */}
        <View style={styles.ringWrap}>
          <Svg width={200} height={200}>
            <Circle cx="100" cy="100" r={radius} stroke="#111" strokeWidth="14" fill="none" />
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

        {/* METRICS */}
        <View style={styles.metricsGrid}>
          {metrics.map((m, i) => (
            <Pressable
  key={i}
  style={styles.metricCard}
  onPress={() => {
    if (m.label === 'Steps') {
      router.push('/Steps');
    }
     if (m.label === 'Sleep') {
    router.push('/Sleep');
  }
  }} 
>
              <View style={styles.metricTop}>
                <m.icon size={18} color="#818cf8" />
                {m.trend === 'up' && <TrendingUp size={12} color="#34d399" />}
                {m.trend === 'down' && <TrendingDown size={12} color="#60a5fa" />}
              </View>
              <Text style={styles.metricValue}>{m.val}</Text>
              <Text style={styles.metricLabel}>{m.label}</Text>
            </Pressable>
          ))}
        </View>

        {/* WORKOUT */}
        {/* TODAY WORKOUT */}
<View style={styles.workoutCard}>
  <Text style={styles.coachSmall}>Coach Alex</Text>
  <Text style={styles.workoutTitle}>Hypertrophy Chest & Back</Text>

  <View style={styles.workoutTags}>
    {['65 MIN', 'STRENGTH'].map(t => (
      <View key={t} style={styles.tagPill}>
        <Text style={styles.tagText}>{t}</Text>
      </View>
    ))}
  </View>

  <View style={styles.workoutActions}>
  <Pressable
    style={styles.primaryBtn}
    onPress={async () => {
      await logWorkout();
      await refresh();
    }}
  >
    <Play size={16} fill="#000"  color="#000" />
    <Text style={styles.primaryText}>START WORKOUT</Text>
  </Pressable>

  <Pressable style={styles.secondaryBtn}>
    <FileText size={16} color="#fff" />
    <Text style={styles.secondaryText}>VIEW PLAN</Text>
  </Pressable>
</View>

</View>


        {/* TRACK FOOD */}
<View style={styles.foodCard}>
  <View style={styles.foodHeader}>
    <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
  <View style={styles.foodRingWrap}>
    <Svg width={48} height={48}>
      <Circle cx="24" cy="24" r="20" stroke="#1a1a1a" strokeWidth="4" fill="none" />
      <Circle
        cx="24"
        cy="24"
        r="20"
        stroke="#818cf8"
        strokeWidth="4"
        fill="none"
        strokeDasharray={125}
        strokeDashoffset={125 - (calories / targets.calorieTarget) * 125}
        strokeLinecap="round"
        rotation="-90"
        origin="24,24"
      />
    </Svg>

    {/* CENTER ICON */}
    <Utensils size={14} color="#818cf8" style={styles.foodRingIcon} />
  </View>

  <View>
    <Text style={styles.foodTitle}>Track Food</Text>
    <Text style={styles.foodSub}>
      {calories} of {targets.calorieTarget} kcal
    </Text>
  </View>
</View>


    <View style={{ flexDirection: 'row', gap: 10 }}>
  <Pressable style={styles.iconSquare}>
    <Camera size={18} color="#fff" />
  </Pressable>

  <Pressable
    style={styles.iconPrimary}
    onPress={async () => {
      await logMeal(400);
      await refresh();
    }}
  >
    <Plus size={18} color="#000" />
  </Pressable>
</View>

  </View>

  <Pressable style={styles.foodBrowse}>
    <Text style={{ color: '#666', fontWeight: '700' }}>Browse past meals →</Text>
  </Pressable>

  

<View style={styles.macroRow}>
  {[
    { label: 'PROTEIN', val: '120g', color: '#34d399', flex: 0.8 },
    { label: 'CARBS', val: '150g', color: '#fbbf24', flex: 0.8 },
    { label: 'FATS', val: '45g', color: '#818cf8', flex: 0.8 },
    { label: 'FIBER', val: '15g', color: '#fb7185', flex: 0.8 },
  ].map(m => (
    <View key={m.label} style={{ flex: 1 }}>
      <Text style={styles.macroLabel}>{m.label}</Text>
      <Text style={styles.macroVal}>{m.val}</Text>

      <View style={styles.macroBarBg}>
      <Animated.View
  entering={FadeIn}
  layout={Layout.springify().damping(18)}
  style={[
    styles.macroFill,
    {
      flex: m.flex,
      backgroundColor: m.color,
    },
  ]}
/>
      </View>
    </View>
  ))}
</View>
</View>

        {/* SIDE QUESTS */}
        {/* HYDRATION BOOST */}
{/* LOG WATER CARD */}
{/* LOG WATER CARD */}
<View style={styles.waterCard}>

  {/* Header */}
  <View style={styles.waterHeader}>
    <View>
      <Text style={styles.waterTitle}>LOG WATER</Text>
      <Text style={styles.waterSub}>
        {water} / {targets.waterTarget} ml
      </Text>
    </View>

    <View style={{ flexDirection: 'row', gap: 10 }}>
  <Pressable
  style={styles.waterIconBtn}
  onPress={() => router.push('/Onboarding/user/Hydration')}
>

        <Bell size={16} color="#aaa" />
      </Pressable>

     <Pressable
  style={styles.waterIconBtn}
  onPress={() => router.push('/Onboarding/user/Hydration')}
>

        <ArrowRight size={16} color="#aaa" />
      </Pressable>
    </View>
  </View>

  {/* Ring + Buttons */}
  <View style={styles.waterRow}>

    {/* Ring */}
    <View style={styles.waterRingWrap}>
      <Svg width={64} height={64}>
        <Circle
          cx="32"
          cy="32"
          r="26"
          stroke="#1a1a1a"
          strokeWidth="6"
          fill="none"
        />

       <AnimatedCircle
  cx="32"
  cy="32"
  r="26"
  stroke="#818cf8"
  strokeWidth="6"
  fill="none"
  strokeDasharray={waterCircumference}
  animatedProps={animatedWaterProps}
  strokeLinecap="round"
  rotation="-90"
  origin="32,32"
/>

      </Svg>

      <Droplets size={18} color="#818cf8" style={styles.waterDrop} />
    </View>

    {/* Quick buttons */}
    {[250, 500, 750].map(v => (
      <Pressable
        key={v}
        style={styles.waterQuick}
        onPress={async () => {
          await logWater(v);
          await refresh();
        }}
      >
        <Text style={styles.waterQuickText}>+{v}</Text>
      </Pressable>
    ))}

  </View>
</View>

        {/* COACH MESSAGE */}
  <Text style={styles.section}>STON INTELLIGENCE</Text>

<Pressable
  style={styles.intelCard}
  onPress={async () => {
    if (coachAction === 'water') {
      await logWater(500);
      refresh();
    }
    if (coachAction === 'meal') {
      await logMeal(400);
      refresh();
    }
    if (coachAction === 'workout') {
      await logWorkout();
      refresh();
    }
  }}
>
  <View style={styles.intelRow}>
    {/* Icon */}
    <View style={styles.intelIconWrap}>
      <Sparkles size={18} color="#818cf8" />
    </View>

    {/* Message */}
    <View style={{ flex: 1 }}>
      <Text style={styles.coachMsg}>{coachMessage}</Text>

      {coachAction && (
        <Text style={styles.intelHint}>Tap to take action →</Text>
      )}
    </View>
  </View>
</Pressable>


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
  workoutCard: {
  marginHorizontal: 24,
  backgroundColor: '#111',
  padding: 24,
  borderRadius: 32,
},
foodRingWrap: {
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
},

intelCard: {
  marginHorizontal: 24,
  padding: 16,
  borderRadius: 24,
  backgroundColor: '#111',
},

intelRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
},

intelIconWrap: {
  width: 36,
  height: 36,
  borderRadius: 12,
  backgroundColor: '#1a1a1a',
  alignItems: 'center',
  justifyContent: 'center',
},

intelHint: {
  marginTop: 6,
  color: '#555',
  fontSize: 10,
  fontWeight: '700',
},


foodRingIcon: {
  position: 'absolute',
},
waterCard: {
  marginHorizontal: 24,
  marginTop: 24,
  backgroundColor: '#111',
  borderRadius: 32,
  padding: 20,
},



waterHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

waterTitle: {
  color: '#818cf8',
  fontSize: 10,
  fontWeight: '900',
  letterSpacing: 2,
},

waterSub: {
  color: '#aaa',
  fontWeight: '800',
  marginTop: 4,
},

waterIconBtn: {
  backgroundColor: '#1a1a1a',
  padding: 8,
  borderRadius: 12,
},

waterRow: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 12,
  marginTop: 20,
},

waterRingWrap: {
  position: 'relative',
  alignItems: 'center',
  justifyContent: 'center',
},

waterDrop: {
  position: 'absolute',
},

waterQuick: {
  backgroundColor: '#1a1a1a',
  paddingVertical: 10,
  paddingHorizontal: 18,
  borderRadius: 20,
},

waterQuickText: {
  color: '#fff',
  fontWeight: '900',
},




waterArrow: {
  backgroundColor: '#222',
  padding: 6,
  borderRadius: 10,
},




waterBtns: {
  flexDirection: 'row',
  gap: 10,
},

waterBtn: {
  backgroundColor: '#222',
  paddingHorizontal: 14,
  paddingVertical: 8,
  borderRadius: 14,
},

waterBtnText: {
  color: '#fff',
  fontWeight: '800',
  fontSize: 11,
},


coachSmall: {
  color: '#555',
  fontSize: 10,
  fontWeight: '900',
  letterSpacing: 2,
},

workoutTitle: {
  color: '#fff',
  fontSize: 22,
  fontWeight: '900',
  marginVertical: 10,
},
hydrationCard: {
  marginHorizontal: 24,
  marginTop: 32,
  backgroundColor: '#111',
  borderRadius: 28,
  padding: 20,
},

hydrationTitle: {
  color: '#fff',
  fontWeight: '900',
  fontSize: 16,
},

hydrationSub: {
  color: '#666',
  marginTop: 4,
},



waterText: {
  color: '#818cf8',
  fontWeight: '900',
},


workoutTags: { flexDirection: 'row', gap: 8 },

tagPill: {
  backgroundColor: 'rgba(255,255,255,0.05)',
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 8,
},

workoutActions: {
  flexDirection: 'row',
  gap: 10,
  marginTop: 20,
},

primaryBtn: {
  flex: 1,
  backgroundColor: '#818cf8',
  padding: 14,
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  gap: 8,
},
macroVal: {
  color: '#fff',
  fontSize: 11,
  fontWeight: '800',
  marginBottom: 4,
},


primaryText: { fontWeight: '900',
  letterSpacing: 1.2,
  fontSize: 10, },

secondaryBtn: {
  flex: 1,
  backgroundColor: '#222',
  padding: 14,
  borderRadius: 16,
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'row',
  gap: 8,
},


secondaryText: { color: '#fff',
  fontWeight: '900',
  letterSpacing: 1.2,
  fontSize: 10,},

foodCard: {
  margin: 24,
  backgroundColor: '#111',
  padding: 20,
  borderRadius: 32,
},

foodHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

foodTitle: { color: '#fff', fontWeight: '900' },
foodSub: { color: '#555', marginTop: 2 },

iconSquare: {
  padding: 10,
  backgroundColor: '#222',
  borderRadius: 14,
},

iconPrimary: {
  padding: 10,
  backgroundColor: '#818cf8',
  borderRadius: 14,
},

foodBrowse: {
  borderTopWidth: 1,
  borderTopColor: '#222',
  marginVertical: 16,
  paddingTop: 12,
},

macroRow: { flexDirection: 'row', gap: 10 },

macroLabel: { color: '#444', fontSize: 10, fontWeight: '900' },

macroBarBg: {
  height: 4,
  backgroundColor: '#222',
  borderRadius: 10,
  marginTop: 6,
},

macroFill: {
  height: 4,
  backgroundColor: '#818cf8',
  borderRadius: 10,
},

  container: { flex: 1, backgroundColor: '#000' },
  header: { paddingTop: 60, paddingHorizontal: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  loop: { fontSize: 22, fontWeight: '900', letterSpacing: 6 },
  iconBtn: { backgroundColor: '#111', padding: 10, borderRadius: 14 },
  dot: { width: 6, height: 6, backgroundColor: '#818cf8', borderRadius: 3, position: 'absolute', top: 6, right: 6 },
  avatar: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#111', alignItems: 'center', justifyContent: 'center' },
  greeting: { fontSize: 30, fontWeight: '900', marginTop: 24, paddingHorizontal: 24 },
  subGreeting: { color: '#666', paddingHorizontal: 24, marginTop: 6 },
  ringWrap: { alignItems: 'center', marginTop: 32 },
  ringCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center', top: 70 },
  score: { color: '#fff', fontSize: 40, fontWeight: '900' },
  today: { color: '#666', fontSize: 10, letterSpacing: 3 },
  streak: { textAlign: 'center', marginTop: 16, color: '#818cf8', fontSize: 10, letterSpacing: 3, fontWeight: '800' },

  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 24 },
  metricCard: { width: (width - 60) / 2, backgroundColor: '#111', borderRadius: 24, padding: 16 },
  metricTop: { flexDirection: 'row', justifyContent: 'space-between' },
  metricValue: { color: '#fff', fontWeight: '900', marginTop: 10 },
  metricLabel: { color: '#555', fontSize: 10 },

  nextAction: { marginHorizontal: 24, backgroundColor: '#111', borderRadius: 24, padding: 16 },
  nextTitle: { color: '#818cf8', fontWeight: '800', marginBottom: 10 },
  nextBtn: { backgroundColor: '#fff', borderRadius: 18, padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  nextText: { fontWeight: '900' },

  mission: { marginHorizontal: 24, padding: 24, borderRadius: 32, backgroundColor: '#111' },
  missionHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  coach: { color: '#818cf8', fontSize: 10 },
  missionTitle: { color: '#fff', fontSize: 24, fontWeight: '900', marginVertical: 12 },
  tags: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  tag: { borderWidth: 1, borderColor: '#222', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { color: '#777', fontSize: 10 },
  startBtn: { backgroundColor: '#fff', borderRadius: 24, padding: 16, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  startText: { fontWeight: '900' },

 
  section: { marginTop: 32, marginBottom: 12, textAlign: 'center', color: '#444', letterSpacing: 3, fontSize: 10 },
  sideGrid: { flexDirection: 'row', justifyContent: 'space-evenly' },
  sideCard: { backgroundColor: '#111', borderRadius: 22, padding: 16, alignItems: 'center', width: 110 },
  sideVal: { color: '#fff', fontWeight: '800', marginTop: 6, fontSize: 13, textAlign: 'center', lineHeight: 18 },
  sideLabel: { color: '#555', fontSize: 9 },
  

  coachCard: { margin: 24, padding: 16, borderRadius: 24, backgroundColor: '#111', flexDirection: 'row', alignItems: 'center', gap: 12 },
  coachAvatar: { width: 42, height: 42, borderRadius: 21 },
  coachName: { color: '#818cf8', fontSize: 10 },
  coachMsg: { color: '#ddd', fontWeight: '700' },

  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, backgroundColor: '#050505', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  centerBtn: { backgroundColor: '#6366f1', padding: 14, borderRadius: 20, marginBottom: 30 },
});
