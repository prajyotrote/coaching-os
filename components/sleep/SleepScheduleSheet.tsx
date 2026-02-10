import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Switch } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Clock, Save } from 'lucide-react-native';

export type SleepSchedule = {
  start: string;
  end: string;
  target: string;
  reminderEnabled: boolean;
  reminderOffsetMinutes: number;
};

interface Props {
  onSave: (schedule: SleepSchedule) => void;
  onClose: () => void;
  initialStart?: string | null;
  initialEnd?: string | null;
  initialReminderEnabled?: boolean | null;
  initialReminderOffsetMinutes?: number | null;
}

function timeToDate(time: string) {
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h || 0, m || 0, 0, 0);
  return d;
}

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatTimeValue(date: Date) {
  const h = `${date.getHours()}`.padStart(2, '0');
  const m = `${date.getMinutes()}`.padStart(2, '0');
  return `${h}:${m}`;
}

function calcTarget(start: Date, end: Date) {
  const startMin = start.getHours() * 60 + start.getMinutes();
  const endMin = end.getHours() * 60 + end.getMinutes();
  let diff = endMin - startMin;
  if (diff <= 0) diff += 24 * 60;
  const h = Math.floor(diff / 60);
  const m = diff % 60;
  return `${h}h ${m}m`;
}

export default function SleepScheduleSheet({
  onSave,
  onClose,
  initialStart,
  initialEnd,
  initialReminderEnabled,
  initialReminderOffsetMinutes,
}: Props) {
  const [startTime, setStartTime] = useState(
    timeToDate(initialStart ?? '23:45')
  );
  const [endTime, setEndTime] = useState(
    timeToDate(initialEnd ?? '07:00')
  );
  const [reminderEnabled, setReminderEnabled] = useState(
    Boolean(initialReminderEnabled)
  );
  const [reminderOffsetMinutes] = useState(
    initialReminderOffsetMinutes ?? 30
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const startLabel = useMemo(() => formatTime(startTime), [startTime]);
  const endLabel = useMemo(() => formatTime(endTime), [endTime]);
  const target = useMemo(
    () => calcTarget(startTime, endTime),
    [startTime, endTime]
  );
  const startValue = useMemo(() => formatTimeValue(startTime), [startTime]);
  const endValue = useMemo(() => formatTimeValue(endTime), [endTime]);

  const handleStartChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== 'ios') setShowStartPicker(false);
    if (event.type === 'dismissed' || !date) return;
    setStartTime(date);
  };

  const handleEndChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== 'ios') setShowEndPicker(false);
    if (event.type === 'dismissed' || !date) return;
    setEndTime(date);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Clock size={18} color="#818cf8" />
        <Text style={styles.title}>Sleep Window</Text>
      </View>

      <View style={styles.times}>
        <Pressable
          style={styles.timeBox}
          onPress={() => setShowStartPicker(true)}
        >
          <Text style={styles.time}>{startLabel}</Text>
          <Text style={styles.label}>Bedtime</Text>
        </Pressable>

        <View style={styles.line} />

        <Pressable
          style={styles.timeBox}
          onPress={() => setShowEndPicker(true)}
        >
          <Text style={styles.time}>{endLabel}</Text>
          <Text style={styles.label}>Wake up</Text>
        </Pressable>
      </View>

      <View style={styles.reminderRow}>
        <View style={styles.reminderTextWrap}>
          <Text style={styles.reminderTitle}>Bedtime reminder</Text>
          <Text style={styles.reminderSub}>
            {reminderOffsetMinutes} min before
          </Text>
        </View>
        <Switch
          value={reminderEnabled}
          onValueChange={setReminderEnabled}
          trackColor={{ false: '#1F2937', true: '#6366F1' }}
          thumbColor={reminderEnabled ? '#FFFFFF' : '#9CA3AF'}
        />
      </View>

      {showStartPicker && (
        <View style={styles.pickerWrap}>
          <DateTimePicker
            value={startTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            themeVariant="dark"
            textColor="#FFFFFF"
            onChange={handleStartChange}
          />
          {Platform.OS === 'ios' && (
            <Pressable
              style={styles.doneBtn}
              onPress={() => setShowStartPicker(false)}
            >
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          )}
        </View>
      )}

      {showEndPicker && (
        <View style={styles.pickerWrap}>
          <DateTimePicker
            value={endTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            themeVariant="dark"
            textColor="#FFFFFF"
            onChange={handleEndChange}
          />
          {Platform.OS === 'ios' && (
            <Pressable
              style={styles.doneBtn}
              onPress={() => setShowEndPicker(false)}
            >
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          )}
        </View>
      )}

      <Pressable
        style={styles.save}
        onPress={() => {
          onSave({
            start: startValue,
            end: endValue,
            target,
            reminderEnabled,
            reminderOffsetMinutes,
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
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  reminderTextWrap: {
    gap: 2,
  },
  reminderTitle: {
    color: '#E5E7EB',
    fontSize: 14,
    fontWeight: '600',
  },
  reminderSub: {
    color: '#6B7280',
    fontSize: 12,
  },
  pickerWrap: {
    marginBottom: 16,
  },
  doneBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  doneText: {
    color: '#818cf8',
    fontWeight: '700',
    fontSize: 13,
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
