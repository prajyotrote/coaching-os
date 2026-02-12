import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { useDashboardData } from '@/lib/hooks/useDashboardData';
import { useHealthActions } from '@/lib/hooks/useHealthActions';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';

import Animated, {
  useSharedValue,
  withTiming,
  withSpring,
  useAnimatedProps,
  useAnimatedStyle,
  FadeInDown,
  FadeInUp,
  withRepeat,
  withSequence,
  Easing,
} from 'react-native-reanimated';

import Svg, { Circle, Defs, RadialGradient, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

import {
  Bell,
  User,
  Moon,
  Zap,
  TrendingUp,
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
  FileText,
  ChevronRight,
  Activity,
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
    sleep = 0,
    recovery,
    water,
    calories,
    workouts,
    macros,
    refresh,
    targets,
  } = useDashboardData();

  const hasCoachPlan = false;

  useFocusEffect(
    React.useCallback(() => {
      refresh();
    }, [refresh])
  );

  // Animations
  const pulseAnim = useSharedValue(1);
  const glowAnim = useSharedValue(0.4);
  const scoreProgress = useSharedValue(0);
  const waterProgress = useSharedValue(0);

  const radius = 85;
  const circumference = 2 * Math.PI * radius;
  const waterRadius = 26;
  const waterCircumference = 2 * Math.PI * waterRadius;

  useEffect(() => {
    // Pulse animation
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    // Glow animation
    glowAnim.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2500 }),
        withTiming(0.4, { duration: 2500 })
      ),
      -1,
      true
    );
  }, []);

  const safeScore = Math.min(100, Math.max(0, score || 0));

  useEffect(() => {
    scoreProgress.value = withSpring(safeScore / 100, { damping: 15 });
  }, [safeScore]);

  useEffect(() => {
    const pct = Math.min(1, water / targets.waterTarget);
    waterProgress.value = withTiming(pct, { duration: 600 });
  }, [water, targets.waterTarget]);

  const animatedScoreProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference - scoreProgress.value * circumference,
  }));

  const animatedWaterProps = useAnimatedProps(() => ({
    strokeDashoffset: waterCircumference - waterProgress.value * waterCircumference,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowAnim.value,
  }));

  const { logWorkout, logWater, logMeal } = useHealthActions();

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 21) return 'Good evening';
    return 'Good night';
  }

  // STON Intelligence
  type CoachActionType = 'water' | 'meal' | 'workout' | null;
  const hour = new Date().getHours();
  const waterPct = targets.waterTarget ? water / targets.waterTarget : 0;
  const caloriePct = targets.calorieTarget ? calories / targets.calorieTarget : 0;

  const candidates: Array<{
    priority: number;
    message: string;
    sub: string;
    action: CoachActionType;
    amount?: number;
    cta?: string;
  }> = [];

  if (waterPct < 0.35) {
    candidates.push({
      priority: 1,
      message: 'Hydration is low — drink 500ml now',
      sub: `Water at ${Math.round(waterPct * 100)}% of goal`,
      action: 'water',
      amount: 500,
      cta: 'Log 500ml',
    });
  }

  if (hour >= 12 && caloriePct < 0.35) {
    candidates.push({
      priority: 2,
      message: 'Fuel is behind — log your next meal',
      sub: `Nutrition at ${Math.round(caloriePct * 100)}% of goal`,
      action: 'meal',
      amount: 400,
      cta: 'Log 400 kcal',
    });
  }

  if (workouts === 0 && hour >= 15) {
    candidates.push({
      priority: 3,
      message: 'Training window is open — start a workout',
      sub: 'A short session keeps momentum high',
      action: 'workout',
      cta: 'Start workout',
    });
  }

  if (sleep < 6) {
    candidates.push({
      priority: 4,
      message: 'Low sleep — keep intensity light today',
      sub: 'Focus on mobility + technique work',
      action: null,
    });
  }

  if (steps < 3000 && hour >= 16) {
    candidates.push({
      priority: 5,
      message: 'Movement is low — take a 15‑min walk',
      sub: 'Quick wins still count today',
      action: null,
    });
  }

  if (candidates.length === 0) {
    candidates.push({
      priority: 99,
      message: 'Strong day so far — protect your streak',
      sub: 'Keep hydration and meals consistent',
      action: null,
    });
  }

  const coach = candidates.sort((a, b) => a.priority - b.priority)[0];

  const metrics = [
    { label: 'Steps', val: steps.toLocaleString(), icon: Footprints, color: '#818cf8', route: '/Steps' },
    { label: 'Sleep', val: `${sleep.toFixed(1)}h`, icon: Moon, color: '#a78bfa', route: '/Sleep' },
    { label: 'Recovery', val: `${recovery}%`, icon: Zap, color: '#34d399', route: '/Recovery' },
    { label: 'Burned', val: `${burned}`, icon: Flame, color: '#f97316', route: '/Kcal' },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0f0f1a', '#000000', '#050510']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* ==================== HEADER ==================== */}
        <View style={styles.header}>
          <MaskedView maskElement={<Text style={styles.logo}>STON.FIT</Text>}>
            <LinearGradient colors={['#818cf8', '#a78bfa', '#c084fc']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={[styles.logo, { opacity: 0 }]}>STON.FIT</Text>
            </LinearGradient>
          </MaskedView>

          <View style={styles.headerRight}>
            <Pressable style={styles.iconBtn}>
              <Bell size={20} color="#9ca3af" />
              <View style={styles.notifDot} />
            </Pressable>
            <Pressable style={styles.avatarBtn} onPress={() => router.push('/Profile')}>
              <LinearGradient colors={['#818cf8', '#a78bfa']} style={styles.avatarGradient}>
                <User size={16} color="#fff" />
              </LinearGradient>
            </Pressable>
          </View>
        </View>

        {/* ==================== GREETING ==================== */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.greetingWrap}>
          <MaskedView
            maskElement={<Text style={styles.greeting}>{getGreeting()}, {name || 'there'}</Text>}
          >
            <LinearGradient colors={['#ffffff', '#e0e7ff', '#c7d2fe']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={[styles.greeting, { opacity: 0 }]}>{getGreeting()}, {name || 'there'}</Text>
            </LinearGradient>
          </MaskedView>
          <Text style={styles.subGreeting}>Let's crush your goals today.</Text>
        </Animated.View>

        {/* ==================== HERO SCORE RING ==================== */}
        <Animated.View entering={FadeInUp.delay(100).duration(700)} style={styles.heroSection}>
          <Animated.View style={[styles.heroGlow, glowStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(129, 140, 248, 0.2)', 'rgba(167, 139, 250, 0.1)', 'transparent']}
              style={styles.heroGlowGradient}
            />
          </Animated.View>

          <Animated.View style={[styles.scoreRing, pulseStyle]}>
            <Svg width={210} height={210}>
              <Defs>
                <RadialGradient id="scoreGlow" cx="50%" cy="50%" rx="50%" ry="50%">
                  <Stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                  <Stop offset="70%" stopColor="#818cf8" stopOpacity="0.1" />
                  <Stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                </RadialGradient>
                <SvgLinearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#818cf8" />
                  <Stop offset="50%" stopColor="#a78bfa" />
                  <Stop offset="100%" stopColor="#c084fc" />
                </SvgLinearGradient>
              </Defs>

              <Circle cx="105" cy="105" r="100" fill="url(#scoreGlow)" />
              <Circle cx="105" cy="105" r={radius} stroke="rgba(255,255,255,0.06)" strokeWidth="12" fill="none" />
              <AnimatedCircle
                cx="105"
                cy="105"
                r={radius}
                stroke="url(#scoreGradient)"
                strokeWidth="12"
                fill="none"
                strokeDasharray={circumference}
                animatedProps={animatedScoreProps}
                strokeLinecap="round"
                rotation="-90"
                origin="105,105"
              />
            </Svg>

            <View style={styles.scoreCenter}>
              <Text style={styles.scoreLabel}>TODAY'S SCORE</Text>
              <MaskedView maskElement={<Text style={styles.scoreValue}>{safeScore}%</Text>}>
                <LinearGradient colors={['#ffffff', '#e0e7ff', '#c7d2fe']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={[styles.scoreValue, { opacity: 0 }]}>{safeScore}%</Text>
                </LinearGradient>
              </MaskedView>
            </View>
          </Animated.View>

          <View style={styles.streakBadge}>
            <LinearGradient colors={['rgba(251, 191, 36, 0.15)', 'rgba(251, 191, 36, 0.05)']} style={styles.streakGradient}>
              <Text style={styles.streakEmoji}>🔥</Text>
              <Text style={styles.streakText}>Keep your streak alive!</Text>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* ==================== METRICS GRID ==================== */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={styles.sectionTitle}>TODAY'S METRICS</Text>
          <View style={styles.metricsGrid}>
            {metrics.map((m, i) => (
              <Pressable
                key={m.label}
                style={styles.metricCard}
                onPress={() => router.push(m.route as any)}
              >
                <LinearGradient
                  colors={[`${m.color}18`, `${m.color}08`]}
                  style={styles.metricGradient}
                >
                  <View style={[styles.metricIconWrap, { backgroundColor: `${m.color}25` }]}>
                    <m.icon size={18} color={m.color} />
                  </View>
                  <Text style={styles.metricValue}>{m.val}</Text>
                  <Text style={styles.metricLabel}>{m.label}</Text>
                  <ChevronRight size={14} color="rgba(255,255,255,0.2)" style={styles.metricArrow} />
                </LinearGradient>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* ==================== WORKOUT CARD ==================== */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Text style={styles.sectionTitle}>TODAY'S WORKOUT</Text>
          {hasCoachPlan ? (
            <View style={styles.workoutCard}>
              <LinearGradient
                colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
                style={styles.workoutGradient}
              >
                <View style={styles.workoutHeader}>
                  <View>
                    <Text style={styles.workoutCoach}>COACH ALEX</Text>
                    <Text style={styles.workoutTitle}>Hypertrophy Chest & Back</Text>
                  </View>
                  <View style={styles.workoutIconWrap}>
                    <Dumbbell size={22} color="#818cf8" />
                  </View>
                </View>

                <View style={styles.workoutTags}>
                  {['65 MIN', 'STRENGTH', 'UPPER BODY'].map(t => (
                    <View key={t} style={styles.tagPill}>
                      <Text style={styles.tagText}>{t}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.workoutActions}>
                  <Pressable
                    style={styles.workoutPrimaryBtn}
                    onPress={async () => {
                      await logWorkout();
                      await refresh();
                    }}
                  >
                    <LinearGradient colors={['#818cf8', '#a78bfa']} style={styles.workoutBtnGradient}>
                      <Play size={16} fill="#fff" color="#fff" />
                      <Text style={styles.workoutBtnText}>START</Text>
                    </LinearGradient>
                  </Pressable>

                  <Pressable style={styles.workoutSecondaryBtn}>
                    <FileText size={16} color="#888" />
                    <Text style={styles.workoutSecondaryText}>VIEW PLAN</Text>
                  </Pressable>
                </View>
              </LinearGradient>
            </View>
          ) : (
            <View style={styles.workoutCard}>
              <LinearGradient
                colors={['rgba(96, 165, 250, 0.14)', 'rgba(255,255,255,0.02)']}
                style={styles.workoutGradient}
              >
                <View style={styles.workoutHeader}>
                  <View>
                    <Text style={styles.workoutCoach}>NO COACH PLAN</Text>
                    <Text style={styles.workoutTitle}>Build your workout</Text>
                    <Text style={styles.workoutSub}>Create a quick plan or start today’s session.</Text>
                  </View>
                  <View style={styles.workoutIconWrap}>
                    <Activity size={22} color="#60a5fa" />
                  </View>
                </View>

                <View style={styles.workoutActions}>
                  <Pressable style={styles.workoutPrimaryBtn}>
                    <LinearGradient colors={['#60a5fa', '#818cf8']} style={styles.workoutBtnGradient}>
                      <Sparkles size={16} color="#fff" />
                      <Text style={styles.workoutBtnText}>BUILD WORKOUT</Text>
                    </LinearGradient>
                  </Pressable>

                  <Pressable style={styles.workoutSecondaryBtn}>
                    <Play size={16} color="#888" />
                    <Text style={styles.workoutSecondaryText}>START TODAY</Text>
                  </Pressable>
                </View>
              </LinearGradient>
            </View>
          )}
        </Animated.View>

        {/* ==================== NUTRITION CARD ==================== */}
        <Animated.View entering={FadeInDown.delay(400)}>
          <Text style={styles.sectionTitle}>NUTRITION</Text>
          <Pressable style={styles.nutritionCard} onPress={() => router.push('/Food')}>
            <LinearGradient
              colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
              style={styles.nutritionGradient}
            >
              <View style={styles.nutritionHeader}>
                <View style={styles.nutritionLeft}>
                  <View style={styles.nutritionRing}>
                    <Svg width={52} height={52}>
                      <Circle cx="26" cy="26" r="22" stroke="rgba(255,255,255,0.08)" strokeWidth="4" fill="none" />
                      <Circle
                        cx="26"
                        cy="26"
                        r="22"
                        stroke="#34d399"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={138}
                        strokeDashoffset={138 - (Math.min(1, calories / targets.calorieTarget) * 138)}
                        strokeLinecap="round"
                        rotation="-90"
                        origin="26,26"
                      />
                    </Svg>
                    <Utensils size={16} color="#34d399" style={styles.nutritionIcon} />
                  </View>
                  <View>
                    <Text style={styles.nutritionTitle}>Track Food</Text>
                    <Text style={styles.nutritionSub}>{calories} / {targets.calorieTarget} kcal</Text>
                  </View>
                </View>

                <View style={styles.nutritionActions}>
                  <Pressable style={styles.nutritionIconBtn}>
                    <Camera size={18} color="#888" />
                  </Pressable>
                  <Pressable style={styles.nutritionAddBtn}>
                    <LinearGradient colors={['#34d399', '#10b981']} style={styles.nutritionAddGradient}>
                      <Plus size={18} color="#fff" />
                    </LinearGradient>
                  </Pressable>
                </View>
              </View>

              {/* Macros */}
              <View style={styles.macrosRow}>
                {[
                  { label: 'Protein', val: macros?.protein ?? 0, target: 120, color: '#818cf8' },
                  { label: 'Carbs', val: macros?.carbs ?? 0, target: 200, color: '#fbbf24' },
                  { label: 'Fats', val: macros?.fat ?? 0, target: 70, color: '#f472b6' },
                ].map(m => (
                  <View key={m.label} style={styles.macroItem}>
                    <View style={styles.macroHeader}>
                      <Text style={styles.macroLabel}>{m.label}</Text>
                      <Text style={styles.macroVal}>{m.val}g</Text>
                    </View>
                    <View style={styles.macroBar}>
                      <LinearGradient
                        colors={[m.color, `${m.color}80`]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={[styles.macroFill, { width: `${Math.min(100, (m.val / m.target) * 100)}%` }]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* ==================== HYDRATION CARD ==================== */}
        <Animated.View entering={FadeInDown.delay(500)}>
          <Text style={styles.sectionTitle}>HYDRATION</Text>
          <View style={styles.waterCard}>
            <LinearGradient
              colors={['rgba(96, 165, 250, 0.12)', 'rgba(96, 165, 250, 0.04)']}
              style={styles.waterGradient}
            >
              <View style={styles.waterHeader}>
                <View style={styles.waterLeft}>
                  <View style={styles.waterRing}>
                    <Svg width={60} height={60}>
                      <Circle cx="30" cy="30" r={waterRadius} stroke="rgba(255,255,255,0.08)" strokeWidth="5" fill="none" />
                      <AnimatedCircle
                        cx="30"
                        cy="30"
                        r={waterRadius}
                        stroke="#60a5fa"
                        strokeWidth="5"
                        fill="none"
                        strokeDasharray={waterCircumference}
                        animatedProps={animatedWaterProps}
                        strokeLinecap="round"
                        rotation="-90"
                        origin="30,30"
                      />
                    </Svg>
                    <Droplets size={18} color="#60a5fa" style={styles.waterIcon} />
                  </View>
                  <View>
                    <Text style={styles.waterTitle}>Water Intake</Text>
                    <Text style={styles.waterSub}>{water} / {targets.waterTarget} ml</Text>
                  </View>
                </View>

                <Pressable style={styles.waterDetailBtn} onPress={() => router.push('/Onboarding/user/Hydration')}>
                  <ArrowRight size={18} color="#60a5fa" />
                </Pressable>
              </View>

              <View style={styles.waterButtons}>
                {[250, 500, 750].map(v => (
                  <Pressable
                    key={v}
                    style={styles.waterBtn}
                    onPress={async () => {
                      await logWater(v);
                      await refresh();
                    }}
                  >
                    <Text style={styles.waterBtnText}>+{v}ml</Text>
                  </Pressable>
                ))}
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* ==================== AI INTELLIGENCE ==================== */}
        <Animated.View entering={FadeInDown.delay(600)}>
          <Text style={styles.sectionTitle}>STON INTELLIGENCE</Text>
          <Pressable
            style={styles.aiCard}
            onPress={async () => {
              if (coach.action === 'water') {
                await logWater(coach.amount ?? 500);
                refresh();
              }
              if (coach.action === 'meal') {
                await logMeal(coach.amount ?? 400);
                refresh();
              }
              if (coach.action === 'workout') {
                await logWorkout();
                refresh();
              }
            }}
          >
            <LinearGradient
              colors={['rgba(129, 140, 248, 0.12)', 'rgba(167, 139, 250, 0.06)']}
              style={styles.aiGradient}
            >
              <View style={styles.aiIconWrap}>
                <LinearGradient colors={['#818cf8', '#a78bfa']} style={styles.aiIconGradient}>
                  <Sparkles size={18} color="#fff" />
                </LinearGradient>
              </View>

              <View style={styles.aiContent}>
                <Text style={styles.aiMessage}>{coach.message}</Text>
                <Text style={styles.aiSub}>{coach.sub}</Text>
                {coach.action && (
                  <View style={styles.aiCta}>
                    <Text style={styles.aiCtaText}>{coach.cta ?? 'Tap to take action'}</Text>
                    <ChevronRight size={14} color="#a78bfa" />
                  </View>
                )}
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </ScrollView>

      {/* ==================== BOTTOM NAV ==================== */}
      <View style={styles.bottomNav}>
        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.95)', '#000']}
          style={styles.bottomNavGradient}
        >
          <View style={styles.navItems}>
            {[
              { icon: LayoutGrid, active: true },
              { icon: Activity, active: false },
              { icon: Plus, center: true },
              { icon: MessageSquare, active: false },
              { icon: User, active: false },
            ].map((item, i) => (
              <Pressable
                key={i}
                style={item.center ? styles.navCenterBtn : styles.navBtn}
                onPress={() => {
                  if (i === 4) router.push('/Profile');
                }}
              >
                {item.center ? (
                  <LinearGradient colors={['#818cf8', '#a78bfa']} style={styles.navCenterGradient}>
                    <item.icon size={24} color="#fff" />
                  </LinearGradient>
                ) : (
                  <item.icon size={22} color={item.active ? '#818cf8' : '#555'} />
                )}
              </Pressable>
            ))}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  logo: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 4,
  },
  headerRight: {
    flexDirection: 'row',
    gap: 10,
  },
  iconBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#818cf8',
  },
  avatarBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    overflow: 'hidden',
  },
  avatarGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Greeting
  greetingWrap: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '900',
  },
  subGreeting: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    marginTop: 4,
  },

  // Hero Score
  heroSection: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  heroGlow: {
    position: 'absolute',
    width: 280,
    height: 280,
  },
  heroGlowGradient: {
    flex: 1,
    borderRadius: 140,
  },
  scoreRing: {
    width: 210,
    height: 210,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  scoreLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
  },
  scoreValue: {
    fontSize: 44,
    fontWeight: '900',
    marginTop: -2,
  },
  streakBadge: {
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  streakGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  streakEmoji: {
    fontSize: 14,
  },
  streakText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '700',
  },

  // Section Title
  sectionTitle: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },

  // Metrics Grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },
  metricCard: {
    width: (width - 42) / 2,
    borderRadius: 20,
    overflow: 'hidden',
  },
  metricGradient: {
    padding: 16,
    position: 'relative',
  },
  metricIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 10,
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  metricArrow: {
    position: 'absolute',
    top: 16,
    right: 16,
  },

  // Workout Card
  workoutCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  workoutGradient: {
    padding: 20,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  workoutCoach: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
  },
  workoutTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
    marginTop: 4,
  },
  workoutSub: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 6,
  },
  workoutIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: 'rgba(129, 140, 248, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  workoutTags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  tagPill: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  tagText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  workoutActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  workoutPrimaryBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  workoutBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  workoutBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },
  workoutSecondaryBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
  },
  workoutSecondaryText: {
    color: '#888',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // Nutrition Card
  nutritionCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  nutritionGradient: {
    padding: 20,
  },
  nutritionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nutritionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  nutritionRing: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutritionIcon: {
    position: 'absolute',
  },
  nutritionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  nutritionSub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 2,
  },
  nutritionActions: {
    flexDirection: 'row',
    gap: 8,
  },
  nutritionIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nutritionAddBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    overflow: 'hidden',
  },
  nutritionAddGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  macrosRow: {
    marginTop: 18,
    gap: 12,
  },
  macroItem: {
    gap: 6,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '600',
  },
  macroVal: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  macroBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  macroFill: {
    height: '100%',
    borderRadius: 2,
  },

  // Water Card
  waterCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  waterGradient: {
    padding: 20,
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  waterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  waterRing: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterIcon: {
    position: 'absolute',
  },
  waterTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  waterSub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 2,
  },
  waterDetailBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(96, 165, 250, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  waterBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    alignItems: 'center',
  },
  waterBtnText: {
    color: '#60a5fa',
    fontSize: 13,
    fontWeight: '800',
  },

  // AI Card
  aiCard: {
    marginHorizontal: 20,
    borderRadius: 24,
    overflow: 'hidden',
  },
  aiGradient: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 18,
    gap: 14,
  },
  aiIconWrap: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  aiIconGradient: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiContent: {
    flex: 1,
  },
  aiMessage: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  aiSub: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 12,
    marginTop: 4,
  },
  aiCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(129, 140, 248, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  aiCtaText: {
    color: '#a78bfa',
    fontSize: 11,
    fontWeight: '700',
  },

  // Bottom Nav
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  bottomNavGradient: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  navItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navBtn: {
    padding: 10,
  },
  navCenterBtn: {
    marginTop: -30,
    borderRadius: 20,
    overflow: 'hidden',
  },
  navCenterGradient: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
