import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { ArrowLeft, RefreshCw, Sparkles, Brain } from 'lucide-react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import SegmentedControl from '@/components/ui/SegmentedControl';
import BarChart from '@/components/ui/BarChart';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import RecoveryRing from '@/components/ui/RecoveryRing';
import {
  getRecoveryHistory,
  getRecoveryToday,
  RecoveryHistoryPoint,
  RecoveryHistorySummary,
  RecoveryRange,
  RecoveryToday,
} from '@/logic/recovery';

type ViewMode = 'Today' | 'History';

const CHECKIN_OPTIONS = [
  { key: 'great', label: 'Great' },
  { key: 'good', label: 'Good' },
  { key: 'okay', label: 'Okay' },
  { key: 'tired', label: 'Tired' },
  { key: 'sore', label: 'Sore' },
];

function readinessColor(readiness: 'Green' | 'Yellow' | 'Red') {
  if (readiness === 'Green') return '#22C55E';
  if (readiness === 'Yellow') return '#F59E0B';
  return '#EF4444';
}

export default function Recovery() {
  const [view, setView] = useState<ViewMode>('Today');
  const [range, setRange] = useState<RecoveryRange>('Week');
  const [userId, setUserId] = useState<string | null>(null);
  const [today, setToday] = useState<RecoveryToday | null>(null);
  const [history, setHistory] = useState<RecoveryHistoryPoint[]>([]);
  const [summary, setSummary] = useState<RecoveryHistorySummary | null>(null);
  const [checkin, setCheckin] = useState<string | null>(null);
  const [pendingCheckin, setPendingCheckin] = useState<string | null>(null);
  const [checkinSaved, setCheckinSaved] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  const loadToday = async () => {
    if (!userId) return;
    const data = await getRecoveryToday(userId);
    setToday(data);
    if (data?.date) {
      const stored = await AsyncStorage.getItem(
        `recovery_checkin_${data.date}`
      );
      if (stored) {
        setCheckin(stored);
        setPendingCheckin(stored);
        setCheckinSaved(true);
      } else {
        setCheckinSaved(false);
      }
    }
  };

  const loadHistory = async () => {
    if (!userId) return;
    const data = await getRecoveryHistory(userId, range);
    setHistory(data.chart);
    setSummary(data.summary);
  };

  useEffect(() => {
    if (!userId) return;
    loadToday();
  }, [userId]);

  useEffect(() => {
    if (view !== 'History' || !userId) return;
    loadHistory();
  }, [view, range, userId]);

  const insight = useMemo(() => {
    if (!today) return null;

    if (today.score >= 75) {
      return {
        title: 'Green light today',
        meaning: 'You’re well‑recovered. Push intensity or add volume.',
        action: 'Train hard',
      };
    }

    if (today.score >= 50) {
      return {
        title: 'Moderate recovery',
        meaning: 'Keep training, but trim volume and extend warm‑up.',
        action: 'Train smart',
      };
    }

    return {
      title: 'Recovery is low',
      meaning: 'Focus on sleep, hydration, and light movement.',
      action: 'Prioritize recovery',
    };
  }, [today]);

  const driverCards = useMemo(() => {
    if (!today) return [];
    const sleepH = Math.floor(today.sleepMinutes / 60);
    const sleepM = today.sleepMinutes % 60;
    return [
      {
        label: 'Sleep',
        value: `${sleepH}h ${sleepM}m`,
        sub: 'duration',
      },
      {
        label: 'Consistency',
        value:
          today.bedtimeVariance != null
            ? `±${Math.abs(today.bedtimeVariance)} min`
            : '--',
        sub: 'bedtime variance',
      },
      {
        label: 'Strain',
        value: today.strainLabel,
        sub: `${today.steps.toLocaleString()} steps • ${today.workouts} workouts`,
      },
    ];
  }, [today]);

  const historyInsight = useMemo(() => {
    if (!summary) return null;
    if (summary.avg >= 75) {
      return {
        title: 'Recovery trending strong',
        meaning: 'Keep your current sleep rhythm—it’s working.',
      };
    }
    if (summary.avg >= 55) {
      return {
        title: 'Recovery is mid‑range',
        meaning: 'One extra sleep hour twice a week can lift your baseline.',
      };
    }
    return {
      title: 'Recovery trending low',
      meaning: 'Prioritize sleep quality and reduce late‑night stress.',
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
          <Text style={styles.headerTitle}>Recovery</Text>
          <Text style={styles.headerSub}>Readiness & balance</Text>
        </View>

        <Pressable style={styles.iconBtn} onPress={() => {
          if (view === 'History') loadHistory();
          else loadToday();
        }}>
          <RefreshCw size={18} color="#9CA3AF" />
        </Pressable>
      </View>

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
            <View style={styles.ringWrap}>
              <RecoveryRing
                score={today ? today.score : 0}
                readiness={today?.readiness ?? 'Red'}
              />
            </View>

            <View style={styles.scoreCard}>
              <View style={styles.scoreTop}>
                <Text style={styles.scoreDate}>
                  {today?.date ?? '--'}
                </Text>
                <View
                  style={[
                    styles.readinessPillCorner,
                    { borderColor: readinessColor(today?.readiness ?? 'Red') },
                  ]}
                >
                  <Text
                    style={[
                      styles.readinessText,
                      { color: readinessColor(today?.readiness ?? 'Red') },
                    ]}
                  >
                    {today?.readiness ?? '—'}
                  </Text>
                </View>
              </View>

              <View style={styles.whyWrap}>
                <Text style={styles.whyTitle}>Why your score is {today ? today.score : '--'}</Text>
                <View style={styles.whyList}>
                  <View style={styles.whyItem}>
                    <View style={styles.whyDot} />
                    <Text style={styles.whyText}>
                      Sleep duration: {Math.floor((today?.sleepMinutes ?? 0) / 60)}h {((today?.sleepMinutes ?? 0) % 60)}m
                    </Text>
                  </View>
                  <View style={styles.whyItem}>
                    <View style={styles.whyDot} />
                    <Text style={styles.whyText}>
                      Bedtime consistency: {today?.bedtimeVariance != null ? `±${Math.abs(today.bedtimeVariance)} min` : '—'}
                    </Text>
                  </View>
                  <View style={styles.whyItem}>
                    <View style={styles.whyDot} />
                    <Text style={styles.whyText}>
                      Strain: {today?.strainLabel ?? '--'} ({today?.steps.toLocaleString() ?? 0} steps, {today?.workouts ?? 0} workouts)
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* DRIVERS */}
            <View style={styles.driverRow}>
              {driverCards.map(card => (
                <View key={card.label} style={styles.driverCard}>
                  <Text style={styles.driverLabel}>{card.label}</Text>
                  <Text style={styles.driverValue}>{card.value}</Text>
                  <Text style={styles.driverSub}>{card.sub}</Text>
                </View>
              ))}
            </View>

            {/* COACH INSIGHT */}
            {insight && (
              <LinearGradient
                colors={['#0F0F0F', '#0A0A0A']}
                style={styles.insightCard}
              >
                <View style={styles.insightHeader}>
                  <Sparkles size={14} color="#A3E635" />
                  <Text style={styles.insightTitle}>{insight.title}</Text>
                </View>
                <Text style={styles.insightMeaning}>{insight.meaning}</Text>
                <View style={styles.actionPill}>
                  <Text style={styles.actionText}>{insight.action}</Text>
                </View>
              </LinearGradient>
            )}

            {/* CHECK-IN */}
            <View
              style={[
                styles.checkinCard,
                checkinSaved && styles.checkinCardDone,
              ]}
            >
              <View style={styles.checkinHeader}>
                <Brain size={14} color="#93C5FD" />
                <Text style={styles.checkinTitle}>
                  {checkinSaved
                    ? 'You’ve checked in for today'
                    : 'How do you feel today?'}
                </Text>

                {!checkinSaved && (
                  <Pressable
                    style={[
                      styles.checkinSubmitMini,
                      !pendingCheckin &&
                        styles.checkinSubmitMiniDisabled,
                    ]}
                    disabled={!pendingCheckin}
                    onPress={async () => {
                      if (!today?.date || !pendingCheckin) return;
                      setCheckin(pendingCheckin);
                      setCheckinSaved(true);
                      await AsyncStorage.setItem(
                        `recovery_checkin_${today.date}`,
                        pendingCheckin
                      );
                    }}
                  >
                    <Text style={styles.checkinSubmitMiniText}>Submit</Text>
                  </Pressable>
                )}
              </View>

              {!checkinSaved ? (
                <>
                  <View style={styles.checkinRow}>
                    {CHECKIN_OPTIONS.map(opt => (
                      <Pressable
                        key={opt.key}
                        style={[
                          styles.checkinPill,
                          pendingCheckin === opt.key &&
                            styles.checkinPillActive,
                        ]}
                        onPress={() => {
                          setPendingCheckin(opt.key);
                        }}
                      >
                        <Text
                          style={[
                            styles.checkinText,
                            pendingCheckin === opt.key &&
                              styles.checkinTextActive,
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={styles.checkinHint}>
                    This helps tailor your recovery guidance.
                  </Text>
                </>
              ) : (
                <View style={styles.checkinDone}>
                  <Text style={styles.checkinDoneText}>
                    Thanks — we’ll use this to personalize your recovery tips tomorrow.
                  </Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <>
            <View style={{ marginTop: 18 }}>
              <SegmentedControl
                options={['Week', 'Month', '6M']}
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
                <Text style={styles.insightMeaning}>
                  {historyInsight.meaning}
                </Text>
              </LinearGradient>
            )}

            {summary && (
              <View style={styles.summaryRow}>
                <SummaryItem label="AVG" value={`${summary.avg}`} />
                <SummaryItem label="BEST" value={`${summary.best}`} />
                <SummaryItem label="LOW" value={`${summary.low}`} />
              </View>
            )}
          </>
        )}
      </ScrollView>
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

  scoreCard: {
    backgroundColor: '#0F0F0F',
    borderRadius: 24,
    padding: 20,
    marginTop: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  scoreTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreDate: { color: '#4B5563', fontSize: 11 },
  scoreSideLabel: { color: '#6B7280', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase' },
  scoreMetaText: { color: '#6B7280', fontSize: 12 },
  whyWrap: {
    marginTop: 14,
    backgroundColor: '#0B0B0B',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  whyTitle: {
    color: '#E5E7EB',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  whyList: {
    gap: 8,
  },
  whyItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  whyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#60A5FA',
    marginTop: 6,
  },
  whyText: {
    color: '#9CA3AF',
    fontSize: 12,
    lineHeight: 16,
    flex: 1,
  },
  ringWrap: { marginTop: 18, alignItems: 'center' },
  readinessPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  readinessPillCorner: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  readinessText: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },

  driverRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
  driverCard: {
    flex: 1,
    backgroundColor: '#0F0F0F',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  driverLabel: { color: '#6B7280', fontSize: 11, letterSpacing: 1 },
  driverValue: { color: '#fff', fontSize: 16, fontWeight: '700', marginTop: 6 },
  driverSub: { color: '#6B7280', fontSize: 11, marginTop: 6 },

  insightCard: {
    borderRadius: 24,
    padding: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  insightHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  insightTitle: { color: '#fff', fontSize: 15, fontWeight: '600' },
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

  checkinCard: {
    backgroundColor: '#0F0F0F',
    borderRadius: 22,
    padding: 16,
    marginTop: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  checkinHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  checkinTitle: { color: '#E5E7EB', fontSize: 14, fontWeight: '600' },
  checkinRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  checkinPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  checkinPillActive: {
    backgroundColor: '#1F2937',
    borderColor: '#60A5FA',
  },
  checkinText: { color: '#9CA3AF', fontSize: 12, fontWeight: '600' },
  checkinTextActive: { color: '#E5E7EB' },
  checkinHint: { color: '#6B7280', fontSize: 11, marginTop: 10 },
  checkinCardDone: {
    borderColor: '#22C55E33',
    backgroundColor: '#0B1220',
  },
  checkinDone: {
    paddingVertical: 6,
  },
  checkinDoneText: {
    color: '#A7F3D0',
    fontSize: 12,
    lineHeight: 18,
  },
  checkinSubmitMini: {
    marginLeft: 'auto',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#93C5FD',
  },
  checkinSubmitMiniDisabled: {
    backgroundColor: '#1F2937',
  },
  checkinSubmitMiniText: {
    color: '#111',
    fontSize: 11,
    fontWeight: '700',
  },
  checkinSubmit: {
    marginTop: 12,
    backgroundColor: '#93C5FD',
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  checkinSubmitDisabled: {
    backgroundColor: '#1F2937',
  },
  checkinSubmitText: {
    color: '#111',
    fontSize: 12,
    fontWeight: '700',
  },

  chartWrap: { marginVertical: 26 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryLabel: { color: '#6B7280', fontSize: 10, letterSpacing: 1 },
  summaryValue: { color: '#fff', fontSize: 14, fontWeight: '700', marginTop: 6 },
});
