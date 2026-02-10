import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BarData {
  label: string;
  value: number;
  isActive?: boolean;
}

interface BarChartProps {
  data: BarData[];
  height?: number;
  showAverage?: boolean;
  interactive?: boolean; // kept for API consistency (no tooltips yet)
}

export default function BarChart({
  data,
  height = 160,
  showAverage = false,
}: BarChartProps) {
  if (!data || data.length === 0) return null;

  const maxValue = Math.max(...data.map(d => d.value)) || 1;
  const average =
    data.reduce((sum, d) => sum + d.value, 0) / data.length;
  const avgRatio = average / maxValue;

  return (
    <View style={[styles.container, { height }]}>
      {/* Average Line */}
      {showAverage && (
        <View
          style={[
            styles.avgLine,
            { bottom: `${avgRatio * 100}%` },
          ]}
        >
          <Text style={styles.avgLabel}>AVG</Text>
        </View>
      )}

      {/* Bars */}
      <View style={styles.barRow}>
        {data.map((item, index) => {
          const barHeight = Math.max(
            (item.value / maxValue) * height,
            4
          );

          return (
            <View key={index} style={styles.barItem}>
              <View
                style={[
                  styles.bar,
                  {
                    height: barHeight,
                    backgroundColor: item.isActive
                      ? '#8B5CF6' // ston-violet accent
                      : '#1F1F1F',
                  },
                ]}
              />
              <Text
                style={[
                  styles.label,
                  item.isActive && styles.activeLabel,
                ]}
              >
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    justifyContent: 'flex-end',
  },

  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
  },

  barItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 2,
  },

  bar: {
    width: '100%',
    borderRadius: 2,
  },

  label: {
    marginTop: 6,
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
  },

  activeLabel: {
    color: '#FFFFFF',
  },

  avgLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.25)',
    zIndex: 1,
  },

  avgLabel: {
    position: 'absolute',
    right: 0,
    top: -10,
    fontSize: 9,
    color: 'rgba(255,255,255,0.35)',
  },
});

