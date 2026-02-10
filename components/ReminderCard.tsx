import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReminderSettings } from '@/types';

interface Props {
  settings: ReminderSettings;
  onPress: () => void;
}

export default function ReminderCard({ settings, onPress }: Props) {
  return (
    <Pressable onPress={onPress} style={styles.card}>

      {/* Glow */}
      {settings.enabled && <View style={styles.glow} />}

      <View style={styles.row}>

        {/* Icon */}
        <View style={[styles.iconWrap, settings.enabled && styles.iconActive]}>
          <Ionicons
            name={settings.enabled ? 'time-outline' : 'notifications-outline'}
            size={20}
            color={settings.enabled ? '#818cf8' : '#666'}
          />
        </View>

        {/* Text */}
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Hydration Reminder</Text>

          {settings.enabled ? (
            <Text style={styles.sub}>
              Every {settings.frequencyMinutes} mins · {settings.startTime} – {settings.endTime}
            </Text>
          ) : (
            <>
              <Text style={styles.sub}>No reminders set</Text>
              <Text style={styles.cta}>Set Reminder</Text>
            </>
          )}
        </View>

        {/* Right Action */}
        {settings.enabled ? (
          <View style={styles.changeBtn}>
            <Text style={styles.changeText}>Change</Text>
          </View>
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#666" />
        )}

      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#0a0a0a',
    borderRadius: 24,
    padding: 16,
    overflow: 'hidden',
  },

  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#818cf810',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  iconWrap: {
    padding: 10,
    borderRadius: 999,
    backgroundColor: '#111',
  },

  iconActive: {
    backgroundColor: '#818cf820',
  },

  title: {
    color: '#fff',
    fontWeight: '600',
  },

  sub: {
    color: '#666',
    marginTop: 2,
    fontSize: 13,
  },

  cta: {
    color: '#818cf8',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },

  changeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#111',
  },

  changeText: {
    color: '#ccc',
    fontSize: 12,
  },
});
