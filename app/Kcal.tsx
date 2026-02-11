import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { ArrowLeft, RefreshCw, Flame, Footprints, Dumbbell } from 'lucide-react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SegmentedControl from '@/components/ui/SegmentedControl';
import BarChart from '@/components/ui/BarChart';
import { supabase } from '@/lib/supabase';
import KcalRing from '@/components/ui/KcalRing';
import EditKcalGoalSheet from '@/components/kcal/EditKcalGoalSheet';
import {
  getKcalHistory,
  getTodayKcal,
  getKcalStreak,
  KcalHistoryPoint,
  KcalHistorySummary,
  KcalRange,
  KcalToday,
} from '@/logic/kcal';

type ViewMode = 'Today' | 'History';

export default function Kcal() {
  const [view, setView] = useState<ViewMode>('Today');
  const [range, setRange] = useState<KcalRange>('Week');
  const [userId, setUserId] = useState<string | null>(null);
  const [today, setToday] = useState<KcalToday | null>(null);
  const [history, setHistory] = useState<KcalHistoryPoint[]>([]);
  const [summary, setSummary] = useState<KcalHistorySummary | null>(null);
  const [kcalGoal, setKcalGoal] = useState(500);
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  const loadToday = async () => {
    if (!userId) return;
    const data = await getTodayKcal(userId);
    setToday(data);
    const streakCount = await getKcalStreak(userId, 300, 30);
    setStreak(streakCount);
  };

  const loadHistory = async () => {
    if (!userId) return;
    const data = await getKcalHistory(userId, range);
    setHistory(data.chart);
    setSummary(data.summary);
  };

  useEffect(() => {
    if (!userId) return;
    loadToday();
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('kcal-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'steps_logs' },
        () => {
          loadToday();
          if (view === 'History') loadHistory();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'workout_logs' },
        () => {
          loadToday();
          if (view === 'History') loadHistory();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, view, range]);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem('kcal_goal');
      if (stored) {
        const val = Number(stored);
        if (!Number.isNaN(val)) setKcalGoal(val);
      }
    })();
  }, []);

  useEffect(() => {
    if (view !== 'History' || !userId) return;
    loadHistory();
  }, [view, range, userId]);

  const todayInsight = useMemo(() => {
    if (!today) return null;

    if (today.total === 0) {
      return {
        title: 'Let’s spark your burn',
        meaning: 'Start with a 10‑minute walk—momentum beats motivation.',
        action: 'Do a 10‑min walk',
      };
    }

    if (today.workouts === 0 && today.steps < 3000) {
      return {
        title: 'You’re behind your burn curve',
        meaning: 'A short circuit or brisk walk right now keeps the day on track.',
        action: 'Add 15 minutes',
      };
    }

    if (today.workouts > 0) {
      return {
        title: 'Training day advantage',
        meaning: 'You’ve got workout burn—refuel smart and stay hydrated.',
        action: 'Protein + water',
      };
    }

    return {
      title: 'Solid daily movement',
      meaning: 'Your steps are doing the heavy lifting—keep the pace.',
      action: 'One more walk',
    };
  }, [today]);

  const historyInsight = useMemo(() => {
    if (!summary) return null;

    const workoutShare =
      summary.total > 0 ? summary.workoutKcal / summary.total : 0;

    if (summary.avg < 150) {
      return {
        title: 'Low burn trend',
        evidence: `${summary.avg} kcal avg`,
        meaning: 'Try two short movement blocks to lift your baseline.',
      };
    }

    if (workoutShare < 0.2) {
      return {
        title: 'Mostly step‑driven burn',
        evidence: `${Math.round(workoutShare * 100)}% from workouts`,
        meaning: 'Add 2 workouts per week to raise your burn ceiling.',
      };
    }

    return {
      title: 'Balanced activity',
      evidence: `${summary.avg} kcal avg`,
      meaning: 'Your burn is steady—protect the streak.',
    };
  }, [summary]);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <ArrowLeft size={18} color="#fff" />
        </Pressable>

        <View>
          <Text style={styles.headerTitle}>Kcal Burn</Text>
          <Text style={styles.headerSub}>Daily energy burn</Text>
        </View>

        <Pressable style={styles.iconBtn} onPress={() => {
          if (view === 'History') loadHistory();
          else loadToday();
        }}>
          <RefreshCw size={18} color="#9CA3AF" />
        </Pressable>
      </View>

      {/* TABS */}
      <View style={styles.tabsWrap}>
        <SegmentedControl
          options={['Today', 'History']}
          selected={view}
          onChange={setView}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {view === 'Today' ? (
          <>
            {/* HERO */}
            <View style={styles.hero}>
              <View style={styles.heroBadge}>
                <Flame size={12} color="#F59E0B" />
                <Text style={styles.heroBadgeText}>Today Burned</Text>
              </View>

              <KcalRing
                current={today ? today.total : 0}
                goal={kcalGoal}
                onEditGoal={() => setShowGoalEditor(true)}
              />

              <Text style={styles.heroSub}>
                {today
                  ? `${today.steps.toLocaleString()} steps • ${today.workouts} workouts`
                  : '--'}
              </Text>
            </View>

            <View style={styles.streakRow}>
              <Text style={styles.streakLabel}>Current streak</Text>
              <Text style={styles.streakValue}>
                {streak} day{streak === 1 ? '' : 's'} ≥ 300 kcal
              </Text>
            </View>

            {/* BREAKDOWN */}
            <View style={styles.breakdownRow}>
              <View style={styles.breakCard}>
                <View style={styles.breakIcon}>
                  <Footprints size={16} color="#60A5FA" />
                </View>
                <Text style={styles.breakValue}>
                  {today ? today.stepsKcal : '--'} kcal
                </Text>
                <Text style={styles.breakLabel}>From steps</Text>
              </View>

              <View style={styles.breakCard}>
                <View style={styles.breakIcon}>
                  <Dumbbell size={16} color="#A78BFA" />
                </View>
                <Text style={styles.breakValue}>
                  {today ? today.workoutKcal : '--'} kcal
                </Text>
                <Text style={styles.breakLabel}>From workouts</Text>
              </View>
            </View>

            {/* COACH INSIGHT */}
            {todayInsight && (
              <LinearGradient
                colors={['#0F0F0F', '#0A0A0A']}
                style={styles.insightCard}
              >
                <Text style={styles.insightTitle}>
                  {todayInsight.title}
                </Text>
                <Text style={styles.insightMeaning}>
                  {todayInsight.meaning}
                </Text>
                <View style={styles.actionPill}>
                  <Text style={styles.actionText}>
                    {todayInsight.action}
                  </Text>
                </View>
              </LinearGradient>
            )}
          </>
        ) : (
          <>
            <View style={{ marginTop: 18 }}>
              <SegmentedControl
                options={['Day', 'Week', 'Month', '6M']}
                selected={range}
                onChange={setRange}
              />
            </View>

            <View style={styles.chartWrap}>
              <BarChart data={history} height={180} showAverage />
            </View>

            {historyInsight && (
              <LinearGradient
                colors={['#0F0F0F', '#0A0A0A']}
                style={styles.insightCard}
              >
                <Text style={styles.insightTitle}>
                  {historyInsight.title}
                </Text>
                {historyInsight.evidence && (
                  <Text style={styles.insightEvidence}>
                    {historyInsight.evidence}
                  </Text>
                )}
                <Text style={styles.insightMeaning}>
                  {historyInsight.meaning}
                </Text>
              </LinearGradient>
            )}

            {summary && (
              <View style={styles.summaryRow}>
                <SummaryItem label="TOTAL" value={`${summary.total} kcal`} />
                <SummaryItem label="AVG" value={`${summary.avg} kcal`} />
                <SummaryItem label="BEST" value={`${summary.best} kcal`} />
              </View>
            )}

            {summary && (
              <View style={styles.sourceRow}>
                <View style={styles.sourcePill}>
                  <Text style={styles.sourceLabel}>Steps</Text>
                  <Text style={styles.sourceValue}>
                    {summary.stepsKcal} kcal
                  </Text>
                </View>
                <View style={styles.sourcePill}>
                  <Text style={styles.sourceLabel}>Workouts</Text>
                  <Text style={styles.sourceValue}>
                    {summary.workoutKcal} kcal
                  </Text>
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <EditKcalGoalSheet
        visible={showGoalEditor}
        currentGoal={kcalGoal}
        onClose={() => setShowGoalEditor(false)}
        onSave={async goal => {
          setKcalGoal(goal);
          await AsyncStorage.setItem('kcal_goal', `${goal}`);
        }}
      />
    </View>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  header: {
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '600' },
  headerSub: { color: '#6B7280', fontSize: 12, marginTop: 2 },

  tabsWrap: { marginTop: 12, paddingHorizontal: 24 },

  scroll: { paddingHorizontal: 24, paddingBottom: 120 },

  hero: { alignItems: 'center', marginTop: 26, marginBottom: 18 },

  heroBadge: { flexDirection: 'row', gap: 6, marginBottom: 10 },

  heroBadgeText: {
    color: '#FBBF24',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  heroSub: { color: '#6B7280', marginTop: 6, fontSize: 13 },

  streakRow: {
    backgroundColor: '#0F0F0F',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 18,
  },
  streakLabel: { color: '#6B7280', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  streakValue: { color: '#fff', fontSize: 15, fontWeight: '700', marginTop: 4 },

  breakdownRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },

  breakCard: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },

  breakIcon: {
    width: 30,
    height: 30,
    borderRadius: 12,
    backgroundColor: '#0B1220',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },

  breakValue: { color: '#fff', fontSize: 16, fontWeight: '700' },
  breakLabel: { color: '#6B7280', fontSize: 12, marginTop: 4 },

  insightCard: {
    borderRadius: 26,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },

  insightTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },
  insightEvidence: { color: '#FBBF24', fontSize: 24, fontWeight: '800', marginTop: 6 },
  insightMeaning: { color: '#9CA3AF', fontSize: 13, marginTop: 8, lineHeight: 18 },

  actionPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#1F2937',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 12,
  },
  actionText: { color: '#E5E7EB', fontSize: 12, fontWeight: '600' },

  chartWrap: { marginVertical: 26 },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  summaryItem: { alignItems: 'center', flex: 1 },
  summaryLabel: { color: '#6B7280', fontSize: 10, letterSpacing: 1 },
  summaryValue: { color: '#fff', fontSize: 14, fontWeight: '700', marginTop: 6 },

  sourceRow: { flexDirection: 'row', gap: 12 },
  sourcePill: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 16,
    paddingVertical: 10,
    alignItems: 'center',
  },
  sourceLabel: { color: '#6B7280', fontSize: 11 },
  sourceValue: { color: '#E5E7EB', fontSize: 14, fontWeight: '700', marginTop: 4 },
});
