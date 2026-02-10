import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  TextInput,
  Switch,
  Modal,
  Platform,
} from 'react-native';
import { ReminderSettings } from '../types';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';




interface Props {
  initialSettings: ReminderSettings;
  onSave: (settings: ReminderSettings) => void;
  onClose: () => void;
}

export default function ReminderSheet({
  initialSettings,
  onSave,
  onClose,
}: Props) {
  const [settings, setSettings] = useState<ReminderSettings>(initialSettings);
  const [custom, setCustom] = useState(
    ![30, 45, 60].includes(initialSettings.frequencyMinutes || 0)
  );

  const [pickerMode, setPickerMode] = useState<'start' | 'end' | null>(null);
  const [pickerDate, setPickerDate] = useState(new Date());


  const presets = [30, 45, 60];

  const openPicker = (mode: 'start' | 'end') => {
    setPickerMode(mode);
  };

  const closePicker = () => setPickerMode(null);

  return (
    <View style={styles.wrap}>

      {/* Enable */}
      <View style={styles.row}>
        <Text style={styles.title}>Enable reminders</Text>
        <Switch
          value={settings.enabled}
          onValueChange={(v) =>
            setSettings({ ...settings, enabled: v })
          }
        />
      </View>

      {settings.enabled && (
        <>
          {/* Frequency */}
          <Text style={styles.label}>Frequency</Text>

          <View style={styles.freqRow}>
            {presets.map((m) => (
              <Pressable
                key={m}
                style={[
                  styles.freqBtn,
                  settings.frequencyMinutes === m && !custom && styles.freqActive,
                ]}
                onPress={() => {
                  setCustom(false);
                  setSettings({ ...settings, frequencyMinutes: m });
                }}
              >
                <Text style={styles.freqText}>{m} min</Text>
              </Pressable>
            ))}

            <Pressable
              style={[styles.freqBtn, custom && styles.freqActive]}
              onPress={() => setCustom(true)}
            >
              <Text style={styles.freqText}>Custom</Text>
            </Pressable>
          </View>

          {custom && (
            <TextInput
              keyboardType="number-pad"
              placeholder="Minutes"
              placeholderTextColor="#555"
              value={String(settings.frequencyMinutes || '')}
              onChangeText={(v) =>
                setSettings({
                  ...settings,
                  frequencyMinutes: Number(v) || 0,
                })
              }
              style={styles.input}
            />
          )}

          {/* Active Window */}
          <Text style={styles.label}>Active Window</Text>

          <View style={styles.timeRow}>
            <Pressable style={styles.timeBtn} onPress={() => openPicker('start')}>
              <Text style={styles.timeText}>{settings.startTime}</Text>
            </Pressable>

            <Pressable style={styles.timeBtn} onPress={() => openPicker('end')}>
              <Text style={styles.timeText}>{settings.endTime}</Text>
            </Pressable>
          </View>
        </>
      )}

      {/* SAVE */}
      <Pressable
        style={styles.save}
        onPress={() => {
          onSave(settings);
          onClose();
        }}
      >
        <Text style={styles.saveText}>SAVE SETTINGS</Text>
      </Pressable>

      {/* iOS MODAL PICKER */}
      {pickerMode && (
        <Modal transparent animationType="slide">
          <View style={styles.modalWrap}>
            <View style={styles.pickerCard}>
              <DateTimePicker
  value={pickerDate}
  mode="time"
  display="spinner"
  style={{ height: 216 }}
    themeVariant="dark"
  onChange={(_, d) => {
    if (!d) return;

    setPickerDate(d); // ← THIS keeps wheel position

    const t = d.toTimeString().slice(0, 5);

    setSettings({
      ...settings,
      ...(pickerMode === 'start'
        ? { startTime: t }
        : { endTime: t }),
    });
  }}
/>


              <Pressable style={styles.doneBtn} onPress={closePicker}>
                <Text style={styles.doneText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  title: { color: '#fff', fontWeight: '700' },

  label: { color: '#666', marginTop: 12 },

  freqRow: { flexDirection: 'row', gap: 8 },

  freqBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#111',
    alignItems: 'center',
  },

  freqActive: {
    backgroundColor: '#818cf833',
  },

  freqText: { color: '#fff', fontSize: 12 },

  input: {
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 12,
    color: '#fff',
  },

  timeRow: { flexDirection: 'row', gap: 12 },

  timeBtn: {
    flex: 1,
    backgroundColor: '#111',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  timeText: { color: '#fff' },

  save: {
    marginTop: 16,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },

  saveText: { fontWeight: '900' },

  modalWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

  pickerCard: {
    backgroundColor: '#111',
    paddingTop: 12,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },

  doneBtn: {
    padding: 16,
    alignItems: 'center',
  },

  doneText: {
    color: '#818cf8',
    fontWeight: '800',
  },
});
