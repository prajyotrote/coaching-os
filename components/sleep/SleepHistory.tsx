import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/* ---------------- TYPES ---------------- */

type SleepHistoryItem = {
  date: string; // YYYY-MM-DD
  total_sleep_minutes: number;
  bedtime?: string | null; // ISO (optional for now)
};

/* ---------------- HELPERS ---------------- */

function fmt(mins: number) {
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return `${h}h ${m}m`;
}

// Calculates avg absolute bedtime deviation (minutes)
function calculateBedtimeVariance(data: SleepHistoryItem[]) {
  const bedtimes = data
    .map(d => d.bedtime)
    .filter(Boolean)
    .map(b => {
      const dt = new Date(b as string);
      return dt.getHours() * 60 + dt.getMinutes();
    });

  if (bedtimes.length < 2) return 0;

  const avg =
    bedtimes.reduce((a, b) => a + b, 0) / bedtimes.length;

  const variance =
    bedtimes.reduce((sum, t) => sum + Math.abs(t - avg), 0) /
    bedtimes.length;

  return Math.round(variance);
}

// Converts variance → insight
function sleepConsistencyInsight(variance: number) {
  if (variance <= 20) {
    return {
      title: 'Your sleep was consistent',
      color: '#818CF8',
      description:
        'High consistency helps regulate metabolism and mood.',
    };
  }

  if (variance <= 45) {
    return {
      title: 'Your sleep was slightly inconsistent',
      color: '#F59E0B',
      description:
        'Try keeping your bedtime within a narrower window.',
    };
  }

  return {
    title: 'Your sleep was inconsistent',
    color: '#EF4444',
    description:
      'Large bedtime shifts can impact recovery and energy.',
  };
}

/* ---------------- COMPONENT ---------------- */

export default function SleepHistory({
  data = [],
}: {
  data?: SleepHistoryItem[];
}) {
  /* ---------- STATS ---------- */
  const stats = useMemo(() => {
    if (!data.length)
      return { avg: 0, best: 0, low: 0 };

    const mins = data.map(d => d.total_sleep_minutes);
    const avg = mins.reduce((a, b) => a + b, 0) / mins.length;

    return {
      avg,
      best: Math.max(...mins),
      low: Math.min(...mins),
    };
  }, [data]);

  /* ---------- CONSISTENCY ---------- */
  const bedtimeVariance = useMemo(() => {
    return calculateBedtimeVariance(data);
  }, [data]);

  const consistency = useMemo(() => {
    return sleepConsistencyInsight(bedtimeVariance);
  }, [bedtimeVariance]);

  /* ---------- EMPTY STATE ---------- */
  if (!data.length) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>
          No sleep data yet
        </Text>
      </View>
    );
  }

  /* ---------- UI ---------- */
  return (
    <View style={styles.container}>
      {/* RANGE */}
      <Text style={styles.range}>Recent period</Text>

      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>Sleep duration</Text>

        <View style={styles.avgPill}>
          <Text style={styles.avgText}>
            Avg: {fmt(stats.avg)}
          </Text>
        </View>
      </View>

      {/* BAR CHART */}
      <View style={styles.chartWrap}>
        {data.map((d, i) => {
          const height =
            (d.total_sleep_minutes / 480) * 100;
          const isActive = i === data.length - 1;

          return (
            <View key={d.date} style={styles.barItem}>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${height}%`,
                      backgroundColor: isActive
                        ? '#818CF8'
                        : '#1F2937',
                    },
                  ]}
                />
              </View>

              <Text
                style={[
                  styles.day,
                  isActive && styles.dayActive,
                ]}
              >
                {new Date(d.date)
                  .toLocaleDateString('en-US', {
                    weekday: 'short',
                  })
                  .charAt(0)}
              </Text>
            </View>
          );
        })}
      </View>

      {/* CONSISTENCY CARD */}
      <LinearGradient
        colors={['#0F0F0F', '#090909']}
        style={styles.card}
      >
        <Text style={styles.cardTitle}>
          {consistency.title}
        </Text>

        <Text
          style={[
            styles.cardValue,
            { color: consistency.color },
          ]}
        >
          ±{bedtimeVariance} min
        </Text>

        <Text style={styles.cardSub}>
          bedtime variance
        </Text>

        <View style={styles.divider} />

        <Text style={styles.cardDesc}>
          {consistency.description}
        </Text>
      </LinearGradient>

      {/* STATS */}
      <View style={styles.statsRow}>
        <Stat label="AVG SLEEP" value={fmt(stats.avg)} />
        <Stat label="BEST" value={fmt(stats.best)} />
        <Stat label="LOW" value={fmt(stats.low)} />
      </View>
    </View>
  );
}

/* ---------------- SUB COMPONENTS ---------------- */

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 120,
  },

  emptyText: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 40,
  },

  range: {
    color: '#6B7280',
    fontSize: 13,
    marginBottom: 18,
  },

  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 22,
  },

  sectionTitle: {
    color: '#6B7280',
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },

  avgPill: {
    backgroundColor: '#111',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
  },

  avgText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '600',
  },

  chartWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 160,
    marginBottom: 40,
  },

  barItem: {
    alignItems: 'center',
    width: 28,
  },

  barTrack: {
    height: '100%',
    width: 8,
    backgroundColor: '#0A0A0A',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },

  barFill: {
    width: '100%',
    borderRadius: 6,
  },

  day: {
    marginTop: 6,
    color: '#4B5563',
    fontSize: 11,
  },

  dayActive: {
    color: '#818CF8',
    fontWeight: '600',
  },

  card: {
    borderRadius: 26,
    padding: 20,
    marginBottom: 28,
  },

  cardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  cardValue: {
    fontSize: 28,
    fontWeight: '800',
    marginTop: 10,
  },

  cardSub: {
    color: '#9CA3AF',
    fontSize: 13,
  },

  divider: {
    height: 1,
    backgroundColor: '#1F2937',
    marginVertical: 14,
  },

  cardDesc: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20,
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },

  stat: {
    alignItems: 'center',
    flex: 1,
  },

  statLabel: {
    color: '#6B7280',
    fontSize: 10,
    letterSpacing: 1.2,
    marginBottom: 6,
  },

  statValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
