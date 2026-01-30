import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

interface TrainerDashboardProps {
  onLogout: () => void;
}

interface PriorityClient {
  id: string;
  name: string;
  initials: string;
  status: 'At Risk' | 'Improving' | 'On Track';
  insight: string;
  riskLevel: 'high' | 'medium' | 'low';
}

const PRIORITY_CLIENTS: PriorityClient[] = [
  {
    id: '1',
    name: 'Rahul',
    initials: 'RS',
    status: 'At Risk',
    insight: 'Sleep consistency dropped 22%',
    riskLevel: 'high',
  },
  {
    id: '2',
    name: 'Priya',
    initials: 'PK',
    status: 'Improving',
    insight: 'Recovery scores stabilized',
    riskLevel: 'low',
  },
  {
    id: '3',
    name: 'Arya',
    initials: 'AA',
    status: 'At Risk',
    insight: 'Missed last workout session',
    riskLevel: 'medium',
  },
];

export default function TrainerDashboard({ onLogout }: TrainerDashboardProps) {
  return (
    <View style={styles.container}>
        {/* Brand Bar */}
<View style={styles.brandBar}>
  <MaskedView
  maskElement={
    <Text style={[styles.brand, { backgroundColor: 'transparent' }]}>
      LOOP
    </Text>
  }
>
  <LinearGradient
    colors={['#818cf8', '#c084fc']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
  >
    <Text style={[styles.brand, { opacity: 0 }]}>LOOP</Text>
  </LinearGradient>
</MaskedView>


  <View style={styles.headerRight}>
    <Pressable style={styles.iconBtn}>
      <Feather name="bell" size={18} color="#9ca3af" />
      <View style={styles.notifDot} />
    </Pressable>

    <View style={styles.avatar}>
      <Text style={styles.avatarText}>JD</Text>
    </View>
  </View>
</View>

      {/* Header */}
      <View style={styles.header}>
        <View>
         <MaskedView
  maskElement={
    <Text style={[styles.greeting, { backgroundColor: 'transparent' }]}>
      Good morning, Coach
    </Text>
  }
>
  <LinearGradient
    colors={['#e5e7eb', '#818cf8']}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 0 }}
  >
    <Text style={[styles.greeting, { opacity: 0 }]}>
      Good morning, Coach
    </Text>
  </LinearGradient>
</MaskedView>

          <View style={styles.statsRow}>
            <Text style={styles.stat}>12 CLIENTS</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={[styles.stat, { color: '#f59e0b' }]}>3 AT RISK</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={[styles.stat, { color: '#818cf8' }]}>5 CHECK-INS</Text>
          </View>s
        </View>
</View>

      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        {/* Priority Today */}
        <Text style={styles.sectionLabel}>PRIORITY TODAY</Text>

        <View style={styles.priorityCard}>
          {PRIORITY_CLIENTS.map((c) => (
            <Pressable key={c.id} style={styles.clientRow}>
              {c.riskLevel === 'high' && <View style={styles.riskBar} />}

              <View style={[
                styles.initials,
                c.status === 'At Risk'
                  ? styles.amber
                  : c.status === 'Improving'
                  ? styles.green
                  : styles.indigo,
              ]}>
                <Text style={styles.initialsText}>{c.initials}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.clientName}>{c.name}</Text>
                  <Text style={[
                    styles.statusPill,
                    c.status === 'At Risk'
                      ? styles.amberText
                      : c.status === 'Improving'
                      ? styles.greenText
                      : styles.indigoText,
                  ]}>
                    {c.status}
                  </Text>
                </View>
                <Text style={styles.insight}>{c.insight}</Text>
              </View>

              <Feather name="chevron-right" size={18} color="#444" />
            </Pressable>
          ))}
        </View>

        {/* AI Brief */}
        <View style={styles.aiCard}>
          <View style={styles.aiIcon}>
            <Feather name="zap" size={18} color="#818cf8" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.aiLabel}>AI BRIEFING</Text>
            <Text style={styles.aiText}>
              Two clients showing fatigue trends. Consider lowering training volume today.
            </Text>
          </View>
        </View>

        {/* Micro Signals */}
        <View style={styles.signalsRow}>
          {[
            { label: 'WORKOUTS', val: '08', icon: 'activity', color: '#34d399' },
            { label: 'MISSED', val: '02', icon: 'clock', color: '#f59e0b' },
            { label: 'AVG RECOVERY', val: '74%', icon: 'zap', color: '#818cf8' },
          ].map((s) => (
            <View key={s.label} style={styles.signalCard}>
              <Feather name={s.icon as any} size={16} color={s.color} />
              <Text style={styles.signalValue}>{s.val}</Text>
              <Text style={styles.signalLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsRow}>
          {[
            { label: 'ADD CLIENT', icon: 'plus' },
            { label: 'TEMPLATES', icon: 'grid' },
            { label: 'REPORTS', icon: 'trending-up' },
          ].map((a) => (
            <Pressable key={a.label} style={styles.actionBtn}>
              <Feather name={a.icon as any} size={16} color="#9ca3af" />
              <Text style={styles.actionText}>{a.label}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sync}>SYNCING SIGNALS…</Text>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        {[
          { icon: 'grid', active: true },
          { icon: 'users', active: false },
          { icon: 'message-square', active: false },
          { icon: 'briefcase', active: false },
          { icon: 'user', active: false },
        ].map((t, i) => (
          <Pressable key={i} onPress={i === 4 ? onLogout : undefined}>
            <Feather name={t.icon as any} size={24} color={t.active ? '#818cf8' : '#555'} />
            {t.active && <View style={styles.activeDot} />}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', paddingTop: 60 },
header: {
  paddingHorizontal: 24,
  marginTop: 20,
},
  greeting: { color: '#fff', fontSize: 22, fontWeight: '900' },
  statsRow: { flexDirection: 'row', marginTop: 6 },
  stat: { fontSize: 10, fontWeight: '800', color: '#777', marginRight: 6 },
  dot: { color: '#222', marginHorizontal: 4 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBtn: { padding: 10, backgroundColor: '#111', borderRadius: 14 },
  notifDot: { position: 'absolute', top: 6, right: 6, width: 6, height: 6, backgroundColor: '#6366f1', borderRadius: 3 },
  avatar: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#1e1b4b', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#818cf8', fontWeight: '900' },

  sectionLabel: { marginTop: 24, marginLeft: 24, fontSize: 10, color: '#444', letterSpacing: 2 },

  priorityCard: { margin: 24, borderRadius: 28, borderWidth: 1, borderColor: '#111' },
  clientRow: { flexDirection: 'row', padding: 16, alignItems: 'center', borderBottomWidth: 1, borderColor: '#111' },
  riskBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, backgroundColor: '#f59e0b' },
  initials: { width: 44, height: 44, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  initialsText: { fontWeight: '900', fontSize: 12 },
  amber: { backgroundColor: '#2a1b05' },
  green: { backgroundColor: '#062a1c' },
  indigo: { backgroundColor: '#0b102a' },

  clientName: { color: '#fff', fontWeight: '900', marginRight: 8 },
  statusPill: { fontSize: 8, paddingHorizontal: 6 },
  amberText: { color: '#f59e0b' },
  greenText: { color: '#34d399' },
  indigoText: { color: '#818cf8' },
  insight: { color: '#666', fontSize: 12 },

  aiCard: { marginHorizontal: 24, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: '#1f1f3a', flexDirection: 'row', gap: 12 },
  aiIcon: { padding: 10, backgroundColor: '#111', borderRadius: 14 },
  aiLabel: { color: '#818cf8', fontSize: 10, letterSpacing: 2, marginBottom: 6 },
  aiText: { color: '#ddd', fontWeight: '700' },

  signalsRow: { flexDirection: 'row', gap: 10, margin: 24 },
  signalCard: { flex: 1, borderRadius: 22, borderWidth: 1, borderColor: '#111', padding: 12, alignItems: 'center' },
  signalValue: { color: '#fff', fontWeight: '900', marginTop: 6 },
  signalLabel: { fontSize: 8, color: '#444', marginTop: 2 },
  brandBar: {
  paddingHorizontal: 24,
  paddingTop: 10,
  paddingBottom: 6,
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

brand: {
  color: '#fff',
  fontWeight: '900',
  letterSpacing: 2,
  fontSize: 25,
},


  actionsRow: { flexDirection: 'row', gap: 10, marginHorizontal: 24 },
  actionBtn: { flex: 1, borderRadius: 18, borderWidth: 1, borderColor: '#111', padding: 12, alignItems: 'center' },
  actionText: { fontSize: 10, color: '#777', marginTop: 4, fontWeight: '800' },

  sync: { textAlign: 'center', color: '#222', fontSize: 10, marginTop: 24 },

  bottomNav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', borderTopWidth: 1, borderColor: '#111', backgroundColor: '#050505' },
  activeDot: { width: 6, height: 6, backgroundColor: '#818cf8', borderRadius: 3, alignSelf: 'center', marginTop: 4 },
});
