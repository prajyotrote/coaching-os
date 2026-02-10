import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { ArrowLeft, RefreshCw, Info } from 'lucide-react-native';
import { router } from 'expo-router';

import SegmentedControl from '../ui/SegmentedControl';
import BarChart from '../ui/BarChart';
import { getStepsInsight, Range } from '@/logic/stepsInsight';

interface StepsHistoryProps {
  userId: string | null;
  stepGoal: number;
}


type ChartPoint = {
  label: string;
  value: number;
  isActive?: boolean;
};

export default function StepsHistory({
  userId,
  stepGoal,
}: StepsHistoryProps) {

  const [range, setRange] = useState<Range>('6M');

  const chartData = useMemo<ChartPoint[]>(() => {
    switch (range) {
      case 'Day':
        return Array.from({ length: 24 }, (_, i) => ({
          label: i % 4 === 0 ? `${i}h` : '',
          value:
            i > 7 && i < 22
              ? Math.random() * 800 + 200
              : Math.random() * 100,
          isActive: i === 14,
        }));

      case 'Week':
        return [
          { label: 'M', value: 7200 },
          { label: 'T', value: 6800 },
          { label: 'W', value: 9500, isActive: true },
          { label: 'T', value: 8900 },
          { label: 'F', value: 3400 },
          { label: 'S', value: 9200 },
          { label: 'S', value: 5100 },
        ];

      case 'Month':
        return Array.from({ length: 30 }, (_, i) => ({
          label: i % 5 === 0 ? `${i + 1}` : '',
          value: Math.random() * 6000 + 3000,
        }));

      case '6M':
        return ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb'].map((m, i) => ({
          label: m,
          value: 120000 + Math.random() * 40000,
          isActive: i === 5,
        }));

      default:
        return [];
    }
  }, [range]);

  const insight = useMemo(() => getStepsInsight(range), [range]);

  const SummaryItem = ({ label, value }: { label: string; value: string }) => (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* HEADER (ONLY ONE – FIXED) */}
      <View style={styles.header}>
        

        
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* RANGE SELECTOR (THIS STAYS) */}
        <SegmentedControl
          options={['Day', 'Week', 'Month', '6M']}
          selected={range}
          onChange={setRange}
        />

        {/* CHART */}
        <View style={styles.chartWrapper}>
          <BarChart
            data={chartData}
            height={180}
            showAverage
            interactive={range === 'Day'}
          />
        </View>

        {/* INSIGHT CARD */}
        <View style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Info size={14} color="#6B7280" />
          </View>

          <Text style={styles.evidence}>{insight.evidence}</Text>
          {insight.subEvidence && (
            <Text style={styles.subEvidence}>{insight.subEvidence}</Text>
          )}

          <View style={styles.divider} />

          <Text style={styles.meaning}>{insight.meaning}</Text>

          {insight.action && (
            <View style={styles.actionPill}>
              <Text style={styles.actionText}>{insight.action}</Text>
            </View>
          )}
        </View>

        {/* SUMMARY BLOCK (QUIET, SECONDARY) */}
        <View style={styles.summaryRow}>
          <SummaryItem label="TOTAL" value="50.1k" />
          <SummaryItem label="BEST" value="12.4k" />
          <SummaryItem label="LOW" value="3.2k" />
        </View>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  header: {
    paddingTop: 30,
    paddingBottom: 18,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  headerTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },

  iconBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    paddingHorizontal: 24,
    paddingBottom: 120,
  },

  chartWrapper: {
    marginVertical: 28,
  },

  insightCard: {
    backgroundColor: '#0F0F0F',
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },

  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  insightTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '500',
    maxWidth: '85%',
  },

  evidence: {
    fontSize: 28,
    fontWeight: '700',
    color: '#8B5CF6', // violet accent (earned)
  },

  subEvidence: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 2,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 14,
  },

  meaning: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 20,
  },

  actionPill: {
    marginTop: 12,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },

  actionText: {
    fontSize: 12,
    color: '#F9FAFB',
    fontWeight: '500',
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 6,
  },

  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },

  summaryLabel: {
    fontSize: 10,
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.35)',
    marginBottom: 6,
    fontWeight: '600',
  },

  summaryValue: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    fontWeight: '700',
  },
});
