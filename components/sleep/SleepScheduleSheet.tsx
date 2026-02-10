import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Clock, Save } from 'lucide-react-native';

interface Schedule {
  start: string;
  end: string;
}

interface Props {
  onSave: (schedule: SleepSchedule) => void;
  onClose: () => void;
}

export type SleepSchedule = {
  start: string;
  end: string;
  target: string;
};

export default function SleepScheduleSheet({ onSave, onClose }: Props) {
  const [start, setStart] = useState('23:45');
  const [end, setEnd] = useState('07:00');

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Clock size={18} color="#818cf8" />
        <Text style={styles.title}>Sleep Window</Text>
      </View>

      <View style={styles.times}>
        <View style={styles.timeBox}>
          <Text style={styles.time}>{start}</Text>
          <Text style={styles.label}>Bedtime</Text>
        </View>

        <View style={styles.line} />

        <View style={styles.timeBox}>
          <Text style={styles.time}>{end}</Text>
          <Text style={styles.label}>Wake up</Text>
        </View>
      </View>

      <Pressable
        style={styles.save}
        onPress={() => {
          onSave({
              start, end,
              target: ''
          });
          onClose();
        }}
      >
        <Save size={16} color="#000" />
        <Text style={styles.saveText}>SAVE SCHEDULE</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  times: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  timeBox: {
    alignItems: 'center',
  },
  time: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
  },
  label: {
    color: '#666',
    fontSize: 11,
    marginTop: 4,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#222',
    marginHorizontal: 20,
  },
  save: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  saveText: {
    fontWeight: '900',
    fontSize: 12,
    letterSpacing: 1.2,
  },
});
