import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import {
  ArrowLeft,
  User,
  Settings,
  ChevronRight,
  Flame,
  Footprints,
  Dumbbell,
  Droplets,
  Utensils,
  Calendar,
  Trophy,
  Moon,
  Award,
  Zap,
  Edit3,
  LogOut,
  Bell,
  Shield,
  HelpCircle,
  TrendingDown,
  Sparkles,
  Scale,
  Ruler,
  Target,
  Heart,
} from 'lucide-react-native';
import Svg, { Circle, Defs, RadialGradient, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';
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

import { getBasicProfileData, getProfileStats, UserProfile, ProfileTargets, AllTimeStats, PersonalRecords, CurrentStreaks } from '@/logic/userProfile';

const { width } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

// Default stats while loading
const defaultStats = {
  allTime: { totalWorkouts: 0, totalSteps: 0, totalCaloriesBurned: 0, totalWaterMl: 0, totalMealsLogged: 0, daysTracked: 0 },
  records: { bestDayScore: 0, maxStepsDay: 0, longestWorkoutStreak: 0, longestLoggingStreak: 0, bestSleepHours: 0 },
  streaks: { workoutStreak: 0, loggingStreak: 0, hydrationStreak: 0, scoreStreak: 0 },
};

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [targets, setTargets] = useState<ProfileTargets | null>(null);
  const [allTime, setAllTime] = useState<AllTimeStats>(defaultStats.allTime);
  const [records, setRecords] = useState<PersonalRecords>(defaultStats.records);
  const [streaks, setStreaks] = useState<CurrentStreaks>(defaultStats.streaks);

  // Animations
  const pulseAnim = useSharedValue(1);
  const glowAnim = useSharedValue(0);
  const ringProgress = useSharedValue(0);

  useEffect(() => {
    loadProfile();

    // Pulse animation for fitness age
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
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

  async function loadProfile() {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      setLoading(false);
      return;
    }

    // Load essential data first - this is fast
    const basicData = await getBasicProfileData(authUser.id);
    setUser(basicData.user);
    setTargets(basicData.targets);
    setLoading(false); // Show UI immediately!

    // Animate ring
    setTimeout(() => {
      ringProgress.value = withSpring(1, { damping: 15 });
    }, 100);

    // Load stats in background - doesn't block UI
    const stats = await getProfileStats(authUser.id);
    setAllTime(stats.allTime);
    setRecords(stats.records);
    setStreaks(stats.streaks);
  }

  async function handleLogout() {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/select-role');
        },
      },
    ]);
  }

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowAnim.value,
  }));

  // Ring calculations (must be before useAnimatedProps)
  const ringRadius = 85;
  const ringCircumference = 2 * Math.PI * ringRadius;

  // All hooks must be called before any early returns
  const animatedRingProps = useAnimatedProps(() => ({
    strokeDashoffset: ringCircumference - (ringProgress.value * 0.7) * ringCircumference,
  }));

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#818cf8" />
      </View>
    );
  }

  if (!user || !targets) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: '#666' }}>Could not load profile</Text>
      </View>
    );
  }

  // Calculate BMI
  const bmi =
    user.height && user.weight
      ? (user.weight / Math.pow(user.height / 100, 2)).toFixed(1)
      : null;

  // Weight progress
  const weightDiff = user.weight && user.goalWeight ? user.weight - user.goalWeight : 0;
  const weightProgress =
    user.weight && user.goalWeight
      ? Math.min(100, Math.max(0, 100 - (Math.abs(weightDiff) / user.weight) * 100))
      : 0;

  // Format member since
  const memberSince = user.memberSince
    ? new Date(user.memberSince).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Recently';

  // Fitness age calculation (more sophisticated)
  const chronologicalAge = user.age || 25;
  const activityBonus = Math.min(5, Math.floor(streaks.loggingStreak / 10));
  const workoutBonus = Math.min(3, Math.floor(allTime.totalWorkouts / 50));
  const fitnessAge = Math.max(18, chronologicalAge - activityBonus - workoutBonus);
  const ageImprovement = chronologicalAge - fitnessAge;

  return (
    <View style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0f0f1a', '#000000', '#050510']}
        style={StyleSheet.absoluteFill}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <ArrowLeft size={20} color="#fff" />
          </Pressable>
          <Pressable style={styles.settingsBtn}>
            <Settings size={20} color="#9ca3af" />
          </Pressable>
        </View>

        {/* ==================== HERO: FITNESS AGE ==================== */}
        <Animated.View entering={FadeInUp.duration(800)} style={styles.heroSection}>
          {/* Glow Effect Behind Ring */}
          <Animated.View style={[styles.heroGlow, glowStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(129, 140, 248, 0.2)', 'rgba(167, 139, 250, 0.1)', 'transparent']}
              style={styles.heroGlowGradient}
            />
          </Animated.View>

          {/* Fitness Age Ring */}
          <Animated.View style={[styles.fitnessAgeRing, pulseStyle]}>
            <Svg width={210} height={210}>
              <Defs>
                <RadialGradient id="ringGlow" cx="50%" cy="50%" rx="50%" ry="50%">
                  <Stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
                  <Stop offset="70%" stopColor="#818cf8" stopOpacity="0.1" />
                  <Stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
                </RadialGradient>
                <SvgLinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#818cf8" />
                  <Stop offset="50%" stopColor="#a78bfa" />
                  <Stop offset="100%" stopColor="#c084fc" />
                </SvgLinearGradient>
              </Defs>

              {/* Outer glow */}
              <Circle cx="105" cy="105" r="100" fill="url(#ringGlow)" />

              {/* Background ring */}
              <Circle
                cx="105"
                cy="105"
                r={ringRadius}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="10"
                fill="none"
              />

              {/* Progress ring */}
              <AnimatedCircle
                cx="105"
                cy="105"
                r={ringRadius}
                stroke="url(#progressGradient)"
                strokeWidth="10"
                fill="none"
                strokeDasharray={ringCircumference}
                animatedProps={animatedRingProps}
                strokeLinecap="round"
                rotation="-90"
                origin="105,105"
              />
            </Svg>

            {/* Center Content */}
            <View style={styles.ringCenter}>
              <Text style={styles.fitnessAgeLabel}>FITNESS AGE</Text>
              <MaskedView
                maskElement={<Text style={styles.fitnessAgeValue}>{fitnessAge}</Text>}
              >
                <LinearGradient
                  colors={['#ffffff', '#e0e7ff', '#c7d2fe']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={[styles.fitnessAgeValue, { opacity: 0 }]}>{fitnessAge}</Text>
                </LinearGradient>
              </MaskedView>
              <Text style={styles.fitnessAgeYears}>years</Text>
            </View>
          </Animated.View>

          {/* Age Comparison Pills */}
          <View style={styles.ageComparison}>
            <View style={styles.agePill}>
              <Text style={styles.agePillValue}>{chronologicalAge}</Text>
              <Text style={styles.agePillLabel}>Actual</Text>
            </View>

            <View style={styles.ageArrow}>
              <LinearGradient
                colors={['rgba(52, 211, 153, 0.25)', 'rgba(52, 211, 153, 0.08)']}
                style={styles.ageArrowGradient}
              >
                <TrendingDown size={16} color="#34d399" />
                <Text style={styles.ageArrowText}>
                  {ageImprovement > 0 ? `-${ageImprovement}` : '0'}
                </Text>
              </LinearGradient>
            </View>

            <View style={styles.agePill}>
              <Text style={[styles.agePillValue, { color: '#a78bfa' }]}>{fitnessAge}</Text>
              <Text style={styles.agePillLabel}>Fitness</Text>
            </View>
          </View>

          {/* Motivational Badge */}
          <View style={styles.motivationBadge}>
            <LinearGradient
              colors={['rgba(251, 191, 36, 0.15)', 'rgba(251, 191, 36, 0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.motivationGradient}
            >
              <Sparkles size={14} color="#fbbf24" />
              <Text style={styles.motivationText}>
                {ageImprovement >= 5
                  ? "You're biologically younger! 🔥"
                  : ageImprovement >= 2
                  ? 'Great progress! Keep it up!'
                  : 'Every step counts!'}
              </Text>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* ==================== PROFILE CARD ==================== */}
        <Animated.View entering={FadeInDown.delay(200)} style={styles.profileSection}>
          <View style={styles.glassCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.07)', 'rgba(255,255,255,0.02)']}
              style={styles.glassInner}
            >
              <View style={styles.profileRow}>
                <View style={styles.avatarWrap}>
                  <LinearGradient
                    colors={['#818cf8', '#a78bfa', '#c084fc']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.avatar}
                  >
                    <User size={26} color="#fff" />
                  </LinearGradient>
                  <Pressable style={styles.editBtn}>
                    <Edit3 size={10} color="#fff" />
                  </Pressable>
                </View>

                <View style={styles.profileText}>
                  <Text style={styles.profileName}>{user.name || 'Athlete'}</Text>
                  <Text style={styles.profileMember}>Since {memberSince}</Text>
                </View>
              </View>

              <View style={styles.miniStats}>
                {[
                  { value: allTime.daysTracked, label: 'Days' },
                  { value: streaks.loggingStreak, label: 'Streak' },
                  { value: allTime.totalWorkouts, label: 'Workouts' },
                ].map((stat, i) => (
                  <React.Fragment key={stat.label}>
                    {i > 0 && <View style={styles.miniStatDivider} />}
                    <View style={styles.miniStat}>
                      <Text style={styles.miniStatValue}>{stat.value}</Text>
                      <Text style={styles.miniStatLabel}>{stat.label}</Text>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            </LinearGradient>
          </View>
        </Animated.View>

        {/* ==================== BODY STATS ==================== */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Text style={styles.sectionTitle}>BODY COMPOSITION</Text>
          <View style={styles.bodyGrid}>
            {[
              { icon: Scale, label: 'Weight', value: user.weight || '--', unit: 'kg', color: '#60a5fa' },
              { icon: Ruler, label: 'Height', value: user.height || '--', unit: 'cm', color: '#a78bfa' },
              { icon: Heart, label: 'BMI', value: bmi || '--', unit: '', color: '#f472b6' },
              { icon: Target, label: 'Goal', value: user.goalWeight || '--', unit: 'kg', color: '#34d399' },
            ].map((stat) => (
              <View key={stat.label} style={styles.bodyCard}>
                <LinearGradient
                  colors={[`${stat.color}18`, `${stat.color}08`]}
                  style={styles.bodyCardInner}
                >
                  <stat.icon size={18} color={stat.color} />
                  <Text style={styles.bodyValue}>
                    {stat.value}
                    {stat.unit && <Text style={styles.bodyUnit}> {stat.unit}</Text>}
                  </Text>
                  <Text style={styles.bodyLabel}>{stat.label}</Text>
                </LinearGradient>
              </View>
            ))}
          </View>

          {/* Progress Bar */}
          {user.weight && user.goalWeight && (
            <View style={styles.progressWrap}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Goal Progress</Text>
                <Text style={styles.progressPercent}>{Math.round(weightProgress)}%</Text>
              </View>
              <View style={styles.progressTrack}>
                <LinearGradient
                  colors={['#818cf8', '#a78bfa', '#c084fc']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[styles.progressFill, { width: `${weightProgress}%` }]}
                />
              </View>
              <Text style={styles.progressHint}>
                {Math.abs(weightDiff).toFixed(1)} kg {weightDiff > 0 ? 'to lose' : 'to gain'}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* ==================== STREAKS ==================== */}
        <Animated.View entering={FadeInDown.delay(400)}>
          <Text style={styles.sectionTitle}>ACTIVE STREAKS</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.streaksRow}
          >
            {[
              { label: 'Workout', value: streaks.workoutStreak, icon: Dumbbell, colors: ['#ec4899', '#f472b6'] },
              { label: 'Logging', value: streaks.loggingStreak, icon: Calendar, colors: ['#6366f1', '#818cf8'] },
              { label: 'Hydration', value: streaks.hydrationStreak, icon: Droplets, colors: ['#3b82f6', '#60a5fa'] },
              { label: 'Score', value: streaks.scoreStreak, icon: Zap, colors: ['#f59e0b', '#fbbf24'] },
            ].map((streak, i) => (
              <Animated.View
                key={streak.label}
                entering={FadeInDown.delay(400 + i * 80)}
              >
                <View style={styles.streakCard}>
                  <LinearGradient
                    colors={[`${streak.colors[0]}20`, `${streak.colors[1]}08`]}
                    style={styles.streakInner}
                  >
                    <LinearGradient colors={streak.colors} style={styles.streakIcon}>
                      <streak.icon size={16} color="#fff" />
                    </LinearGradient>
                    <Text style={styles.streakValue}>{streak.value}</Text>
                    <Text style={styles.streakLabel}>{streak.label}</Text>
                    <Text style={styles.streakEmoji}>🔥</Text>
                  </LinearGradient>
                </View>
              </Animated.View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* ==================== LIFETIME STATS ==================== */}
        <Animated.View entering={FadeInDown.delay(500)}>
          <Text style={styles.sectionTitle}>LIFETIME ACHIEVEMENTS</Text>
          <View style={styles.achieveCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
              style={styles.achieveInner}
            >
              {[
                { label: 'Steps Walked', value: allTime.totalSteps >= 1000000 ? `${(allTime.totalSteps / 1000000).toFixed(1)}M` : `${Math.round(allTime.totalSteps / 1000)}K`, icon: Footprints, color: '#818cf8' },
                { label: 'Calories Burned', value: `${Math.round(allTime.totalCaloriesBurned / 1000)}K`, icon: Flame, color: '#f97316' },
                { label: 'Water Consumed', value: `${Math.round(allTime.totalWaterMl / 1000)}L`, icon: Droplets, color: '#60a5fa' },
                { label: 'Meals Tracked', value: `${allTime.totalMealsLogged}`, icon: Utensils, color: '#34d399' },
              ].map((item, i) => (
                <View key={item.label} style={[styles.achieveRow, i === 3 && { borderBottomWidth: 0 }]}>
                  <View style={styles.achieveLeft}>
                    <View style={[styles.achieveIcon, { backgroundColor: `${item.color}20` }]}>
                      <item.icon size={16} color={item.color} />
                    </View>
                    <Text style={styles.achieveLabel}>{item.label}</Text>
                  </View>
                  <Text style={styles.achieveValue}>{item.value}</Text>
                </View>
              ))}
            </LinearGradient>
          </View>
        </Animated.View>

        {/* ==================== PERSONAL RECORDS ==================== */}
        <Animated.View entering={FadeInDown.delay(600)}>
          <Text style={styles.sectionTitle}>PERSONAL BESTS 🏆</Text>
          <View style={styles.recordsRow}>
            {[
              { label: 'Max Steps', value: records.maxStepsDay.toLocaleString(), icon: Footprints },
              { label: 'Best Sleep', value: `${records.bestSleepHours}h`, icon: Moon },
              { label: 'Workout Streak', value: `${records.longestWorkoutStreak}d`, icon: Trophy },
              { label: 'Log Streak', value: `${records.longestLoggingStreak}d`, icon: Award },
            ].map((rec) => (
              <View key={rec.label} style={styles.recordCard}>
                <LinearGradient
                  colors={['rgba(251, 191, 36, 0.12)', 'rgba(251, 191, 36, 0.04)']}
                  style={styles.recordInner}
                >
                  <rec.icon size={18} color="#fbbf24" />
                  <Text style={styles.recordValue}>{rec.value}</Text>
                  <Text style={styles.recordLabel}>{rec.label}</Text>
                </LinearGradient>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ==================== SETTINGS ==================== */}
        <Animated.View entering={FadeInDown.delay(700)}>
          <Text style={styles.sectionTitle}>SETTINGS</Text>
          <View style={styles.menuCard}>
            {[
              { label: 'Edit Profile', icon: Edit3, color: '#818cf8' },
              { label: 'Notifications', icon: Bell, color: '#fbbf24' },
              { label: 'Privacy', icon: Shield, color: '#34d399' },
              { label: 'Help', icon: HelpCircle, color: '#60a5fa' },
            ].map((item, i) => (
              <Pressable
                key={item.label}
                style={[styles.menuRow, i === 3 && { borderBottomWidth: 0 }]}
              >
                <View style={styles.menuLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: `${item.color}18` }]}>
                    <item.icon size={16} color={item.color} />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </View>
                <ChevronRight size={18} color="#333" />
              </Pressable>
            ))}
          </View>

          {/* Logout */}
          <Pressable style={styles.logoutWrap} onPress={handleLogout}>
            <LinearGradient
              colors={['rgba(239, 68, 68, 0.12)', 'rgba(239, 68, 68, 0.04)']}
              style={styles.logoutBtn}
            >
              <LogOut size={18} color="#ef4444" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </LinearGradient>
          </Pressable>

          <Text style={styles.version}>STON.FIT v1.0.0</Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  settingsBtn: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 24,
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
  fitnessAgeRing: {
    width: 210,
    height: 210,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  fitnessAgeLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 3,
  },
  fitnessAgeValue: {
    fontSize: 58,
    fontWeight: '900',
    color: '#fff',
    marginTop: -4,
  },
  fitnessAgeYears: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '600',
    marginTop: -6,
  },
  ageComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 12,
  },
  agePill: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  agePillValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
  },
  agePillLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  ageArrow: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  ageArrowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  ageArrowText: {
    color: '#34d399',
    fontSize: 14,
    fontWeight: '800',
  },
  motivationBadge: {
    marginTop: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  motivationGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  motivationText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: '700',
  },

  // Profile Card
  profileSection: {
    paddingHorizontal: 20,
  },
  glassCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  glassInner: {
    padding: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 7,
    backgroundColor: '#1f1f1f',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0a0a0a',
  },
  profileText: {
    flex: 1,
  },
  profileName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  profileMember: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 2,
  },
  miniStats: {
    flexDirection: 'row',
    marginTop: 18,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  miniStat: {
    flex: 1,
    alignItems: 'center',
  },
  miniStatValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
  },
  miniStatLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  miniStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  // Section
  sectionTitle: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 12,
  },

  // Body Stats
  bodyGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
  },
  bodyCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  bodyCardInner: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  bodyValue: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 6,
  },
  bodyUnit: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  bodyLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  progressWrap: {
    marginHorizontal: 20,
    marginTop: 12,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '600',
  },
  progressPercent: {
    color: '#a78bfa',
    fontSize: 11,
    fontWeight: '700',
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressHint: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    marginTop: 6,
    textAlign: 'center',
  },

  // Streaks
  streaksRow: {
    paddingHorizontal: 16,
  },
  streakCard: {
    width: 95,
    marginRight: 10,
    borderRadius: 18,
    overflow: 'hidden',
  },
  streakInner: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
  },
  streakIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    marginTop: 8,
  },
  streakLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '600',
  },
  streakEmoji: {
    fontSize: 12,
    marginTop: 4,
  },

  // Achievements
  achieveCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  achieveInner: {
    padding: 4,
  },
  achieveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  achieveLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  achieveIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achieveLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '600',
  },
  achieveValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },

  // Records
  recordsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 8,
  },
  recordCard: {
    width: (width - 48) / 2,
    borderRadius: 16,
    overflow: 'hidden',
  },
  recordInner: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  recordValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 6,
  },
  recordLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },

  // Menu
  menuCard: {
    marginHorizontal: 20,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.04)',
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    fontWeight: '600',
  },

  // Logout
  logoutWrap: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 14,
    overflow: 'hidden',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '700',
  },
  version: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.2)',
    fontSize: 11,
    marginTop: 20,
    marginBottom: 10,
  },
});
