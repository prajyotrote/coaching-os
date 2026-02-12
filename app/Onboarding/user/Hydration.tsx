import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, {
  Circle,
  Defs,
  RadialGradient,
  Stop,
  LinearGradient as SvgLinearGradient,
} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  FadeInDown,
  FadeInUp,
} from 'react-native-reanimated';
import {
  ArrowLeft,
  Flame,
  SlidersHorizontal,
  Bell,
  ChevronRight,
  Droplets,
  Plus,
  Target,
  TrendingUp,
  Clock,
  Award,
  Zap,
} from 'lucide-react-native';
import { router } from 'expo-router';

import ReminderSheet from '@/components/ReminderSheet';
import BottomSheet from '@/components/BottomSheet';
import AddWaterSheet from '@/components/AddWaterSheet';
import EditWaterGoalSheet from '@/components/hydration/EditWaterGoalSheet';
import { supabase } from '@/lib/supabase';
import { getDailyWaterGoal, updateDailyWaterGoal } from '@/logic/profile';
import { logWater } from '@/lib/services/health.service';

const { width } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function HydrationScreen() {
  const [waterAmount, setWaterAmount] = useState(0);
  const [goal, setGoal] = useState(3000);
  const [userId, setUserId] = useState<string | null>(null);
  const [todayLogs, setTodayLogs] = useState<Array<{ ml: number; created_at: string }>>([]);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);

  const remaining = Math.max(0, goal - waterAmount);
  const isGoalMet = waterAmount >= goal;
  const percent = Math.min(1, waterAmount / goal);

  // Animations
  const pulseAnim = useSharedValue(1);
  const glowAnim = useSharedValue(0.3);
  const ringProgress = useSharedValue(0);

  const radius = 100;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    pulseAnim.value = withRepeat(
      withSequence(
        withTiming(1.03, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );

    glowAnim.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 2500 }),
        withTiming(0.3, { duration: 2500 })
      ),
      -1,
      true
    );
  }, []);

  useEffect(() => {
    ringProgress.value = withTiming(percent, { duration: 800 });
  }, [percent]);

  const animatedRingProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference - ringProgress.value * circumference,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowAnim.value,
  }));

  const loadTodayWater = async (id: string) => {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const { data } = await supabase
      .from('water_logs')
      .select('ml, created_at')
      .eq('user_id', id)
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false });

    const total = data?.reduce((s, x) => s + (x.ml || 0), 0) || 0;
    setWaterAmount(total);
    setTodayLogs(data || []);
  };

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const id = data.user?.id ?? null;
      setUserId(id);
      if (!id) return;
      const g = await getDailyWaterGoal(id);
      setGoal(g);
      await loadTodayWater(id);
    })();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('hydration-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'water_logs' },
        () => loadTodayWater(userId)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const quickAmounts = [
    { ml: 250, label: '250ml', icon: '🥤' },
    { ml: 500, label: '500ml', icon: '🍶' },
    { ml: 750, label: '750ml', icon: '🫗' },
  ];

  const stats = [
    { label: 'Daily Avg', value: '2.4L', icon: TrendingUp, color: '#60a5fa' },
    { label: 'Streak', value: '3 days', icon: Flame, color: '#fb923c' },
    { label: 'Best', value: '3.2L', icon: Award, color: '#fbbf24' },
  ];

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#020617', '#0a1628', '#000000']}
        style={StyleSheet.absoluteFill}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <LinearGradient
            colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']}
            style={styles.backBtnGradient}
          >
            <ArrowLeft size={20} color="#fff" />
          </LinearGradient>
        </Pressable>

        <MaskedView maskElement={<Text style={styles.title}>Hydration</Text>}>
          <LinearGradient colors={['#60a5fa', '#22d3ee', '#a78bfa']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={[styles.title, { opacity: 0 }]}>Hydration</Text>
          </LinearGradient>
        </MaskedView>

        <Pressable style={styles.settingsBtn} onPress={() => setGoalOpen(true)}>
          <LinearGradient
            colors={['rgba(96, 165, 250, 0.15)', 'rgba(96, 165, 250, 0.05)']}
            style={styles.settingsBtnGradient}
          >
            <SlidersHorizontal size={18} color="#60a5fa" />
          </LinearGradient>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO RING */}
        <Animated.View entering={FadeInUp.duration(600)} style={styles.heroSection}>
          <Animated.View style={[styles.heroGlow, glowStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(96, 165, 250, 0.25)', 'rgba(34, 211, 238, 0.15)', 'transparent']}
              style={styles.heroGlowGradient}
            />
          </Animated.View>

          <Animated.View style={[styles.ringContainer, pulseStyle]}>
            <Svg width={240} height={240}>
              <Defs>
                <RadialGradient id="waterGlow" cx="50%" cy="50%" rx="50%" ry="50%">
                  <Stop offset="0%" stopColor="#60a5fa" stopOpacity="0.4" />
                  <Stop offset="70%" stopColor="#60a5fa" stopOpacity="0.1" />
                  <Stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
                </RadialGradient>
                <SvgLinearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor="#60a5fa" />
                  <Stop offset="50%" stopColor="#22d3ee" />
                  <Stop offset="100%" stopColor="#a78bfa" />
                </SvgLinearGradient>
              </Defs>

              <Circle cx="120" cy="120" r="110" fill="url(#waterGlow)" />
              <Circle
                cx="120"
                cy="120"
                r={radius}
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="14"
                fill="none"
              />
              <AnimatedCircle
                cx="120"
                cy="120"
                r={radius}
                stroke="url(#ringGradient)"
                strokeWidth="14"
                fill="none"
                strokeDasharray={circumference}
                animatedProps={animatedRingProps}
                strokeLinecap="round"
                rotation="-90"
                origin="120,120"
              />
            </Svg>

            <View style={styles.ringCenter}>
              <View style={styles.dropletWrap}>
                <LinearGradient colors={['rgba(96, 165, 250, 0.2)', 'rgba(34, 211, 238, 0.1)']} style={styles.dropletGradient}>
                  <Droplets size={22} color="#60a5fa" />
                </LinearGradient>
              </View>
              <MaskedView maskElement={<Text style={styles.ringValue}>{waterAmount}</Text>}>
                <LinearGradient colors={['#ffffff', '#e0f2fe', '#bae6fd']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
                  <Text style={[styles.ringValue, { opacity: 0 }]}>{waterAmount}</Text>
                </LinearGradient>
              </MaskedView>
              <Text style={styles.ringUnit}>ml</Text>
              <Text style={styles.ringGoal}>of {goal} ml goal</Text>
            </View>
          </Animated.View>

          {/* Status Badge */}
          <View style={styles.statusBadge}>
            <LinearGradient
              colors={isGoalMet ? ['rgba(52, 211, 153, 0.15)', 'rgba(52, 211, 153, 0.05)'] : ['rgba(96, 165, 250, 0.15)', 'rgba(96, 165, 250, 0.05)']}
              style={styles.statusGradient}
            >
              {isGoalMet ? (
                <>
                  <Text style={styles.statusEmoji}>🎉</Text>
                  <Text style={[styles.statusText, { color: '#34d399' }]}>Goal achieved!</Text>
                </>
              ) : (
                <>
                  <Target size={14} color="#60a5fa" />
                  <Text style={styles.statusText}>
                    <Text style={{ color: '#fff', fontWeight: '800' }}>{remaining} ml</Text> left today
                  </Text>
                </>
              )}
            </LinearGradient>
          </View>
        </Animated.View>

        {/* QUICK ADD */}
        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={styles.sectionTitle}>QUICK ADD</Text>
          <View style={styles.quickAddRow}>
            {quickAmounts.map((item) => (
              <Pressable
                key={item.ml}
                style={styles.quickAddBtn}
                onPress={async () => {
                  if (!userId) return;
                  await logWater(userId, item.ml);
                  await loadTodayWater(userId);
                }}
              >
                <LinearGradient
                  colors={['rgba(96, 165, 250, 0.12)', 'rgba(96, 165, 250, 0.04)']}
                  style={styles.quickAddGradient}
                >
                  <Text style={styles.quickAddEmoji}>{item.icon}</Text>
                  <Text style={styles.quickAddLabel}>{item.label}</Text>
                </LinearGradient>
              </Pressable>
            ))}

            <Pressable style={styles.customAddBtn} onPress={() => setSheetOpen(true)}>
              <LinearGradient colors={['#60a5fa', '#22d3ee']} style={styles.customAddGradient}>
                <Plus size={20} color="#fff" />
              </LinearGradient>
            </Pressable>
          </View>
        </Animated.View>

        {/* REMINDER CARD */}
        <Animated.View entering={FadeInDown.delay(300)}>
          <Text style={styles.sectionTitle}>REMINDERS</Text>
          <Pressable style={styles.reminderCard} onPress={() => setReminderOpen(true)}>
            <LinearGradient
              colors={['rgba(129, 140, 248, 0.12)', 'rgba(129, 140, 248, 0.04)']}
              style={styles.reminderGradient}
            >
              <View style={styles.reminderLeft}>
                <View style={styles.reminderIconWrap}>
                  <LinearGradient colors={['#818cf8', '#a78bfa']} style={styles.reminderIconGradient}>
                    <Bell size={18} color="#fff" />
                  </LinearGradient>
                </View>
                <View>
                  <Text style={styles.reminderTitle}>Hydration Reminder</Text>
                  <Text style={styles.reminderSub}>Every 45 mins • 9 AM – 9 PM</Text>
                </View>
              </View>
              <View style={styles.changeBtn}>
                <Text style={styles.changeText}>Change</Text>
                <ChevronRight size={14} color="#a78bfa" />
              </View>
            </LinearGradient>
          </Pressable>
        </Animated.View>

        {/* STATS */}
        <Animated.View entering={FadeInDown.delay(400)}>
          <Text style={styles.sectionTitle}>YOUR STATS</Text>
          <View style={styles.statsRow}>
            {stats.map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <LinearGradient
                  colors={[`${stat.color}15`, `${stat.color}05`]}
                  style={styles.statGradient}
                >
                  <View style={[styles.statIconWrap, { backgroundColor: `${stat.color}20` }]}>
                    <stat.icon size={16} color={stat.color} />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </LinearGradient>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* TODAY'S LOG */}
        <Animated.View entering={FadeInDown.delay(500)}>
          <Text style={styles.sectionTitle}>TODAY'S LOG</Text>
          {todayLogs.length === 0 ? (
            <View style={styles.emptyLog}>
              <Text style={styles.emptyText}>No water logged yet today</Text>
            </View>
          ) : (
            <View style={styles.logList}>
              {todayLogs.slice(0, 5).map((log, i) => (
                <View key={i} style={styles.logItem}>
                  <LinearGradient
                    colors={['rgba(255,255,255,0.04)', 'rgba(255,255,255,0.01)']}
                    style={styles.logGradient}
                  >
                    <View style={styles.logLeft}>
                      <View style={styles.logDot} />
                      <View>
                        <Text style={styles.logAmount}>{log.ml} ml</Text>
                        <Text style={styles.logTime}>{formatTime(log.created_at)}</Text>
                      </View>
                    </View>
                    <Droplets size={16} color="rgba(96, 165, 250, 0.5)" />
                  </LinearGradient>
                </View>
              ))}
            </View>
          )}
        </Animated.View>

        {/* STREAK BADGE */}
        <Animated.View entering={FadeInDown.delay(600)} style={styles.streakWrap}>
          <LinearGradient
            colors={['rgba(251, 146, 60, 0.15)', 'rgba(251, 146, 60, 0.05)']}
            style={styles.streakGradient}
          >
            <Flame size={16} color="#fb923c" />
            <Text style={styles.streakText}>3 day hydration streak — keep it going!</Text>
            <Zap size={14} color="#fbbf24" />
          </LinearGradient>
        </Animated.View>
      </ScrollView>

      {/* SHEETS */}
      <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)}>
        <AddWaterSheet
          onAdd={async (ml) => {
            if (!userId) return;
            await logWater(userId, ml);
            await loadTodayWater(userId);
          }}
          onClose={() => setSheetOpen(false)}
        />
      </BottomSheet>

      <BottomSheet visible={goalOpen} onClose={() => setGoalOpen(false)}>
        <EditWaterGoalSheet
          currentGoal={goal}
          onClose={() => setGoalOpen(false)}
          onSave={async (g) => {
            setGoal(g);
            if (!userId) return;
            await updateDailyWaterGoal(userId, g);
          }}
        />
      </BottomSheet>

      <BottomSheet visible={reminderOpen} onClose={() => setReminderOpen(false)}>
        <ReminderSheet
          initialSettings={{
            enabled: true,
            frequencyMinutes: 45,
            startTime: '09:00',
            endTime: '21:00',
          }}
          onSave={() => {}}
          onClose={() => setReminderOpen(false)}
        />
      </BottomSheet>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  backBtnGradient: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
  },
  settingsBtn: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  settingsBtnGradient: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },

  // Hero Ring
  heroSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  heroGlow: {
    position: 'absolute',
    width: 320,
    height: 320,
  },
  heroGlowGradient: {
    flex: 1,
    borderRadius: 160,
  },
  ringContainer: {
    width: 240,
    height: 240,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  dropletWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 8,
  },
  dropletGradient: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  ringValue: {
    fontSize: 48,
    fontWeight: '900',
  },
  ringUnit: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 16,
    fontWeight: '700',
    marginTop: -4,
  },
  ringGoal: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 12,
    marginTop: 4,
  },

  // Status Badge
  statusBadge: {
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  statusGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  statusEmoji: {
    fontSize: 14,
  },
  statusText: {
    color: '#60a5fa',
    fontSize: 13,
    fontWeight: '600',
  },

  // Section Title
  sectionTitle: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginHorizontal: 20,
    marginTop: 28,
    marginBottom: 12,
  },

  // Quick Add
  quickAddRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    alignItems: 'stretch',
  },
  quickAddBtn: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  quickAddGradient: {
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.1)',
  },
  quickAddEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  quickAddLabel: {
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: '700',
  },
  customAddBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    width: 64,
  },
  customAddGradient: {
    width: 64,
    height: 86,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    overflow: 'hidden',
  },
  statGradient: {
    padding: 14,
    alignItems: 'center',
    borderRadius: 18,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },

  // Reminder Card
  reminderCard: {
    marginHorizontal: 20,
    borderRadius: 22,
    overflow: 'hidden',
  },
  reminderGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(129, 140, 248, 0.1)',
  },
  reminderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reminderIconWrap: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  reminderIconGradient: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  reminderTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  reminderSub: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    marginTop: 2,
  },
  changeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(129, 140, 248, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: 'center',
  },
  changeText: {
    color: '#a78bfa',
    fontSize: 11,
    fontWeight: '700',
  },

  // Log List
  emptyLog: {
    marginHorizontal: 20,
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 18,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 13,
  },
  logList: {
    marginHorizontal: 20,
    gap: 8,
  },
  logItem: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  logGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  logLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#60a5fa',
  },
  logAmount: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  logTime: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    marginTop: 1,
  },

  // Streak
  streakWrap: {
    marginTop: 28,
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  streakGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  streakText: {
    color: '#fb923c',
    fontSize: 12,
    fontWeight: '700',
  },
});
