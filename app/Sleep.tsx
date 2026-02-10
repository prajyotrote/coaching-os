import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import {
  calculateBedtimeVariance,
  sleepConsistencyInsight,
} from '@/lib/sleep/analytics';
import SleepHistory from '@/components/sleep/SleepHistory';
import {
  ArrowLeft,
  RefreshCw,
  Moon,
  Brain,
  Clock,
  Sparkles,
  ChevronRight,
  Info,
  Check,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getSleepToday } from '@/lib/sleep/queries';
import type { SleepDaily } from '@/lib/sleep/types';
import { supabase } from '@/lib/supabase';
import { upsertSleepReflection } from '@/lib/sleep/queries';
import SegmentedControl from '@/components/ui/SegmentedControl';
import BarChart from '@/components/ui/BarChart';
import BottomSheet from '@/components/ui/BottomSheet';
import SleepReflectionSheet from '@/components/sleep/SleepReflectionSheet';
import SleepScheduleSheet from '@/components/sleep/SleepScheduleSheet';

type Range = 'Day' | 'Week' | 'Month' | '6M';
type ViewMode = 'Today' | 'History';

type SleepSchedule = {
  start: string;
  end: string;
  target: string;
};

export default function Sleep() {
  /* ---------------- AUTH ---------------- */
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
    
    
  }, 

  
  
  []);

  useEffect(() => {
  if (!userId) return;

  (async () => {
    try {
      const data = await getSleepToday(userId);
      setSleepToday(data);
    } catch (e) {
      console.error('Failed to fetch sleepToday', e);
    }
  })();
}, [userId]);


  /* ---------------- STATE ---------------- */
  const [view, setView] = useState<ViewMode>('Today');
  const [range, setRange] = useState<Range>('Week');
  const [sleepToday, setSleepToday] = useState<SleepDaily | null>(null);
  const [hasReflected, setHasReflected] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [showSchedule, setShowSchedule] = useState(false);
  const [sleepHistory, setSleepHistory] = useState<any[]>([]);


  const [schedule, setSchedule] = useState<SleepSchedule>({
    start: '23:45',
    end: '07:00',
    target: '8h 0m',
  });

  /* ---------------- MOCK DATA (replace later) ---------------- */
  const chartData = useMemo(() => {
    if (range === 'Week') {
      return [
        { label: 'M', value: 400 },
        { label: 'T', value: 380 },
        { label: 'W', value: 450 },
        { label: 'T', value: 420, isActive: true },
        { label: 'F', value: 360 },
        { label: 'S', value: 500 },
        { label: 'S', value: 480 },
      ];
    }
    return [];
  }, [range]);
  const sleepTimeRange = useMemo(() => {
  if (!sleepToday?.bedtime || !sleepToday?.wake_time) return null;

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return {
    bedtime: formatTime(sleepToday.bedtime),
    wake: formatTime(sleepToday.wake_time),
  };
}, [sleepToday]);

async function loadSleepHistory(range: 'Day' | 'Week' | 'Month' | '6M') {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  let fromDate = new Date();

  if (range === 'Day') fromDate.setDate(fromDate.getDate() - 1);
  if (range === 'Week') fromDate.setDate(fromDate.getDate() - 7);
  if (range === 'Month') fromDate.setMonth(fromDate.getMonth() - 1);
  if (range === '6M') fromDate.setMonth(fromDate.getMonth() - 6);

  const fromStr = fromDate.toISOString().slice(0, 10);
  const bedtimeVariance = useMemo(() => {
  if (!sleepHistory.length) return 0;
  return calculateBedtimeVariance(sleepHistory);
}, [sleepHistory]);

const consistency = useMemo(() => {
  return sleepConsistencyInsight(bedtimeVariance);
}, [bedtimeVariance]);


  const { data } = await supabase
    .from('sleep_daily')
    .select('date, total_sleep_minutes')
    .eq('user_id', user.id)
    .gte('date', fromStr)
    .order('date', { ascending: true });

  setSleepHistory(data || []);
}
useEffect(() => {
  if (view === 'History') {
    loadSleepHistory(range);
  }
}, [view, range]);


const sleepStageData = useMemo(() => {
  if (!sleepToday || !sleepToday.total_sleep_minutes) return null;

  const total = sleepToday.total_sleep_minutes;

  return {
    awake: {
      minutes: sleepToday.awake_minutes ?? 0,
      pct: (sleepToday.awake_minutes ?? 0) / total,
      color: '#2A2A2A', // muted gray
    },
    rem: {
      minutes: sleepToday.rem_sleep_minutes ?? 0,
      pct: (sleepToday.rem_sleep_minutes ?? 0) / total,
      color: '#7C7CFF', // soft violet
    },
    light: {
      minutes: sleepToday.light_sleep_minutes ?? 0,
      pct: (sleepToday.light_sleep_minutes ?? 0) / total,
      color: '#4F5DFF', // primary blue
    },
    deep: {
      minutes: sleepToday.deep_sleep_minutes ?? 0,
      pct: (sleepToday.deep_sleep_minutes ?? 0) / total,
      color: '#3B2FDB', // deep indigo
    },
  };
}, [sleepToday]);

  const insight = useMemo(() => {
  if (!sleepToday || !sleepToday.deep_sleep_minutes) {
    return null;
  }

  const deepMin = sleepToday.deep_sleep_minutes;
  const deepH = Math.floor(deepMin / 60);
  const deepM = deepMin % 60;

  const isGood = deepMin >= 90;

  return {
    title: isGood
      ? 'Strong physical recovery last night'
      : 'Limited physical recovery last night',

    evidence: `${deepH > 0 ? `${deepH}h ` : ''}${deepM}m`,
    subEvidence: 'Deep sleep',

    meaning: isGood
      ? 'Deeper sleep supports muscle repair and nervous system recovery.'
      : 'Lower deep sleep may impact physical recovery and muscle repair.',

    accent: isGood ? '#818CF8' : '#F59E0B',
  };
}, [sleepToday]);


  /* ---------------- UI ---------------- */
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <ArrowLeft size={18} color="#9CA3AF" />
        <Text style={styles.headerTitle}>Sleep</Text>
        <RefreshCw size={18} color="#6B7280" />
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
            {/* LAST NIGHT */}
            <View style={styles.hero}>
              <View style={styles.heroBadge}>
                <Moon size={12} color="#A5B4FC" />
                <Text style={styles.heroBadgeText}>Last Night</Text>
              </View>

              {sleepToday ? (
  <Text style={styles.heroValue}>
    {Math.floor(sleepToday.total_sleep_minutes / 60)}
    <Text style={styles.heroUnit}>h </Text>
    {sleepToday.total_sleep_minutes % 60}
    <Text style={styles.heroUnit}>m</Text>
  </Text>
) : (
  <Text style={styles.heroValue}>--</Text>
)}

<Text style={styles.heroTime}>
  {sleepToday?.bedtime && sleepToday?.wake_time
    ? `${new Date(sleepToday.bedtime).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      })} → ${new Date(sleepToday.wake_time).toLocaleTimeString([], {
        hour: 'numeric',
        minute: '2-digit',
      })}`
    : '-- → --'}
</Text>
</View>

{/* SLEEP STAGES */}
<View style={styles.stagesCard}>
  <Text style={styles.stagesTitle}>Sleep stages</Text>


  {/* Progress bar */}
<View style={styles.stageBar}>
  {sleepStageData && (
    <>
      <Animated.View
  entering={FadeIn.duration(600)}
  style={[
    styles.stageSegment,
    {
      flex: sleepStageData.awake.pct,
      backgroundColor: sleepStageData.awake.color,
    },
  ]}
/>

      <Animated.View
  entering={FadeIn.duration(600)}
  style={[
    styles.stageSegment,
    {
      flex: sleepStageData.rem.pct,
      backgroundColor: sleepStageData.rem.color,
    },
  ]}
/>

     <Animated.View
  entering={FadeIn.duration(600)}
  style={[
    styles.stageSegment,
    {
      flex: sleepStageData.light.pct,
      backgroundColor: sleepStageData.light.color,
    },
  ]}
/>

      <Animated.View
  entering={FadeIn.duration(600)}
  style={[
    styles.stageSegment,
    {
      flex: sleepStageData.deep.pct,
      backgroundColor: sleepStageData.deep.color,
    },
  ]}
/>

    </>
  )}
</View>


  {/* Labels */}
  <View style={styles.stageGrid}>
    <View style={styles.stageItem}>
      <View style={[styles.dot, { backgroundColor: '#2A2A2A' }]} />
      <Text style={styles.stageLabel}>Awake</Text>
      <Text style={styles.stageValue}>
  {sleepStageData ? `${Math.floor(sleepStageData.awake.minutes / 60)}h ${sleepStageData.awake.minutes % 60}m` : '--'}
</Text>

    </View>

    <View style={styles.stageItem}>
      <View style={[styles.dot, { backgroundColor: '#6366F1' }]} />
      <Text style={styles.stageLabel}>REM</Text>
      <Text style={styles.stageValue}>
  {sleepStageData ? `${Math.floor(sleepStageData.rem.minutes / 60)}h ${sleepStageData.rem.minutes % 60}m` : '--'}
</Text>

    </View>

    <View style={styles.stageItem}>
      <View style={[styles.dot, { backgroundColor: '#4F46E5' }]} />
      <Text style={styles.stageLabel}>Light</Text>
      <Text style={styles.stageValue}>
  {sleepStageData ? `${Math.floor(sleepStageData.light.minutes / 60)}h ${sleepStageData.light.minutes % 60}m` : '--'}
</Text>

    </View>

    <View style={styles.stageItem}>
      <View style={[styles.dot, { backgroundColor: '#4338CA' }]} />
      <Text style={styles.stageLabel}>Deep</Text>
      <Text style={styles.stageValue}>
  {sleepStageData ? `${Math.floor(sleepStageData.deep.minutes / 60)}h ${sleepStageData.deep.minutes % 60}m` : '--'}
</Text>

    </View>
  </View>
</View>


            {/* INSIGHT */}
            {insight && (
  <LinearGradient
    colors={['#0F0F0F', '#090909']}
    style={styles.insightCard}
  >

              <View style={styles.insightHeader}>
                <Text style={styles.insightTitle}>
                  {insight.title}
                </Text>
                <Info size={14} color="#6B7280" />
              </View>

              <Text style={[styles.insightEvidence, { color: insight.accent }]}>
                {insight.evidence}
              </Text>
              <Text style={styles.insightSub}>{insight.subEvidence}</Text>

              <View style={styles.divider} />
              <Text style={styles.insightMeaning}>{insight.meaning}</Text>
            </LinearGradient>
            )}

            {/* REFLECTION CTA */}
           
             <Pressable
  style={[
    styles.reflection,
    hasReflected && styles.reflectionDone,
  ]}
  disabled={hasReflected}
  onPress={() => {
    if (!hasReflected) setShowReflection(true);
  }}
>
  <View
    style={[
      styles.reflectionIcon,
      hasReflected && styles.reflectionIconDone,
    ]}
  >
    {hasReflected ? (
      <Check size={18} color="#10B981" />
    ) : (
      <Brain size={18} color="#818CF8" />
    )}
  </View>

  <View style={{ flex: 1 }}>
    <Text style={styles.reflectionTitle}>
      {hasReflected ? 'Reflection logged' : 'Reflect on last night'}
    </Text>
    <Text style={styles.reflectionSub}>
      {hasReflected
        ? 'Thanks — this will help improve your sleep insights.'
        : 'Short sleep detected — reflections help spot patterns.'}
    </Text>
  </View>

  {!hasReflected && (
    <ChevronRight size={16} color="#6B7280" />
  )}
</Pressable>

          

            {/* SLEEP WINDOW */}
            <View style={styles.windowCard}>
              <View style={styles.windowHeader}>
                <View style={styles.windowTitleRow}>
                  <Clock size={14} color="#818CF8" />
                  <Text style={styles.windowTitle}>Sleep Window</Text>
                </View>

                <Pressable onPress={() => setShowSchedule(true)}>
                  <Text style={styles.editText}>EDIT</Text>
                </Pressable>
              </View>

              <View style={styles.windowTimes}>
                <View>
                  <Text style={styles.windowTime}>{schedule.start}</Text>
                  <Text style={styles.windowLabel}>Bedtime</Text>
                </View>

                <View style={styles.windowLine} />

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.windowTime}>{schedule.end}</Text>
                  <Text style={styles.windowLabel}>Wake</Text>
                </View>
              </View>

              <Pressable
                style={styles.goalRow}
                onPress={() => setShowSchedule(true)}
              >
                <Text style={styles.goalText}>
                  Sleep goal: {schedule.target}
                </Text>
                <ChevronRight size={14} color="#9CA3AF" />
              </Pressable>
            </View>

            {/* HABIT */}
            <View style={styles.habit}>
              <Sparkles size={14} color="#A5B4FC" />
              <View>
                <Text style={styles.habitTitle}>Anchor your bedtime</Text>
                <Text style={styles.habitSub}>
                  Staying within ±20 min improves sleep onset.
                </Text>
              </View>
            </View>
          </>
        ) : (
          <>
  {/* HISTORY */}
  <View style={{ marginTop: 30, marginBottom:-10 }}>
  <SegmentedControl
    options={['Day', 'Week', 'Month', '6M']}
    selected={range}
    onChange={setRange}
  />
</View>


<SleepHistory data={sleepHistory} />
</>

        )}
      </ScrollView>

      {/* REFLECTION SHEET */}
      <BottomSheet
        isOpen={showReflection}
        onClose={() => setShowReflection(false)}
        title="Reflection"
      >
        <SleepReflectionSheet
          onSave={async (data) => {
            if (!userId) return;

            const today = new Date().toISOString().slice(0, 10);

            await upsertSleepReflection({
              userId,
              date: today,
              perceivedQuality: data.perceivedQuality,
              factors: data.factors,
              notes: data.notes,
            });

            setHasReflected(true);
            setShowReflection(false);
          }}
          onClose={() => setShowReflection(false)}
        />
      </BottomSheet>

      {/* SCHEDULE SHEET */}
      <BottomSheet
        isOpen={showSchedule}
        onClose={() => setShowSchedule(false)}
        title="Sleep Schedule"
      >
        <SleepScheduleSheet
          onSave={(s: SleepSchedule) => {
            setSchedule(s);
            setShowSchedule(false);
          }}
          onClose={() => setShowSchedule(false)}
        />
      </BottomSheet>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  header: {
    paddingTop: 56,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerTitle: { color: '#fff', fontSize: 17, fontWeight: '600' },

  tabsWrap: { marginTop: 20, paddingHorizontal: 24 },

  scroll: { paddingHorizontal: 24, paddingBottom: 120 },

  hero: { alignItems: 'center', marginTop: 24, marginBottom: 32 },

  heroBadge: { flexDirection: 'row', gap: 6, marginBottom: 10 },

  heroBadgeText: {
    color: '#A5B4FC',
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  stagesCard: {
  marginBottom: 28,
},

stagesTitle: {
  color: '#6B7280',
  fontSize: 11,
  letterSpacing: 1.5,
  marginBottom: 10,
  textTransform: 'uppercase',
},

stageBar: {
  flexDirection: 'row',
  height: 8,
  borderRadius: 8,
  overflow: 'hidden',
  backgroundColor: '#0A0A0A',
  marginBottom: 16,
},


stageSegment: {
  height: '100%',
},

stageGrid: {
  flexDirection: 'row',
  justifyContent: 'space-between',
},

stageItem: {
  alignItems: 'center',
  gap: 6,
},

dot: {
  width: 6,
  height: 6,
  borderRadius: 3,
},

stageLabel: {
  color: '#6B7280',
  fontSize: 11,
},

stageValue: {
  color: '#fff',
  fontWeight: '700',
  fontSize: 13,
},

  heroValue: { color: '#fff', fontSize: 64, fontWeight: '900' },
  heroUnit: { fontSize: 28, color: '#4B5563' },

  heroTime: { color: '#6B7280', marginTop: 6, fontSize: 13 },

  insightCard: { borderRadius: 26, padding: 20, marginBottom: 24 },

  insightHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  insightTitle: { color: '#fff', fontSize: 16, fontWeight: '600' },

  insightEvidence: { fontSize: 28, fontWeight: '800', marginTop: 10 },
  insightSub: { color: '#9CA3AF', fontSize: 13 },

  divider: {
    height: 1,
    backgroundColor: '#1F2937',
    marginVertical: 14,
  },

  insightMeaning: { color: '#D1D5DB', fontSize: 14 },

  reflection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F0F0F',
    borderRadius: 22,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },

  reflectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E1B4B',
    alignItems: 'center',
    justifyContent: 'center',
  },

  reflectionTitle: { color: '#fff', fontSize: 15 },
  reflectionSub: { color: '#9CA3AF', fontSize: 12 },

  windowCard: {
    backgroundColor: '#0F0F0F',
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
  },

  windowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },

  windowTitleRow: { flexDirection: 'row', gap: 6 },
  windowTitle: { color: '#D1D5DB', fontSize: 14 },

  editText: { color: '#9CA3AF', fontSize: 11, letterSpacing: 1 },

  windowTimes: { flexDirection: 'row', alignItems: 'center' },

  windowTime: { color: '#fff', fontSize: 18, fontWeight: '600' },
  windowLabel: { color: '#6B7280', fontSize: 11 },

  windowLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1F2937',
    marginHorizontal: 16,
  },

  goalRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  goalText: { color: '#9CA3AF', fontSize: 13 },

  habit: {
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    backgroundColor: '#1E1B4B',
    borderRadius: 20,
  },
  reflectionDone: {
  backgroundColor: '#0B1220',
  borderColor: '#10B98133',
  borderWidth: 1,
},

reflectionIconDone: {
  backgroundColor: '#064E3B',
},


  habitTitle: { color: '#E0E7FF', fontSize: 14 },
  habitSub: { color: '#C7D2FE', fontSize: 12 },
});
