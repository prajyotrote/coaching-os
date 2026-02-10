import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { ArrowLeft, RefreshCw } from 'lucide-react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Footprints, Activity, Layers } from 'lucide-react-native';

import StepsRing from '@/components/ui/StepsRing';
import StepsHistory from '../components/steps/StepsHistory';
import EditStepGoalSheet from '@/components/steps/EditStepGoalSheet';

import { supabase } from '@/lib/supabase';
import { getDailyStepGoal, updateDailyStepGoal } from '@/logic/profile';
import { getTodaySteps } from '@/logic/stepsToday';

type TodaySteps = {
  total_steps: number;
  walking_steps: number;
  running_steps: number;
  other_steps: number;
  distance_km: number;
  calories: number;
  active_minutes: number;
};

export default function Steps() {
  const [tab, setTab] = useState<'today' | 'history'>('today');
  const [showGoalEditor, setShowGoalEditor] = useState(false);

  const [stepGoal, setStepGoal] = useState(10000);
  const [today, setToday] = useState<TodaySteps | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  /* ---------------- LOAD DATA ---------------- */

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUserId(user.id);

      const [goal, todaySteps] = await Promise.all([
        getDailyStepGoal(user.id),
        getTodaySteps(user.id),
      ]);

      setStepGoal(goal);
      setToday(todaySteps);
    };

    load();
  }, []);

  /* ---------------- RENDER ---------------- */

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable style={styles.icon} onPress={() => router.back()}>
          <ArrowLeft size={18} color="#fff" />
        </Pressable>

        <View>
          <Text style={styles.title}>Steps</Text>
          <Text style={styles.sync}>Sync completed ✓</Text>
        </View>

        <Pressable style={styles.icon}>
          <RefreshCw size={18} color="#aaa" />
        </Pressable>
      </View>

      {/* TABS */}
      <View style={styles.tabs}>
        {['today', 'history'].map(t => (
          <Pressable
            key={t}
            onPress={() => setTab(t as any)}
            style={[styles.tab, tab === t && styles.tabActive]}
          >
            <Text style={styles.tabText}>
              {t === 'today' ? 'Today' : 'History'}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === 'today' ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
          {/* RING */}
          <View style={{ marginTop: 16 }}>
            <StepsRing
              current={today?.total_steps ?? 0}
              goal={stepGoal}
              distance={`${today?.distance_km ?? 0} km`}
              calories={`${today?.calories ?? 0} kcal`}
              onLongPress={() => setShowGoalEditor(true)}
              onEditGoal={() => setShowGoalEditor(true)}
            />
          </View>

          {/* GOAL EDITOR */}
          <EditStepGoalSheet
            visible={showGoalEditor}
            currentGoal={stepGoal}
            onClose={() => setShowGoalEditor(false)}
            onSave={async (goal) => {
              setStepGoal(goal);

              if (!userId) return;
              await updateDailyStepGoal(userId, goal);
            }}
          />

          {/* BREAKDOWN */}
          <View style={styles.breakRow}>
            <Break
              label="WALKING"
              val={today?.walking_steps ?? 0}
              icon={Footprints}
              color="#8b5cf6"
            />
            <Break
              label="RUNNING"
              val={today?.running_steps ?? 0}
              icon={Activity}
              color="#60a5fa"
            />
            <Break
              label="OTHER"
              val={today?.other_steps ?? 0}
              icon={Layers}
              color="#666"
            />
          </View>

          <Text style={styles.auto}>
            ACTIVITY AUTOMATICALLY DETECTED FROM YOUR DEVICE
          </Text>

          {/* DAILY INSIGHTS */}
          <LinearGradient
            colors={['#141414', '#0b0b0b']}
            style={styles.insightCard}
          >
            <Text style={styles.insightTitle}>⚡ Daily Insights</Text>

            <View style={styles.insightRow}>
              <Insight label="Active" val={`${today?.active_minutes ?? 0} min`} />
              <View style={styles.insightDivider} />
              <Insight label="Avg Pace" val="—" />
              <View style={styles.insightDivider} />
              <Insight label="Peak" val="—" />
            </View>
          </LinearGradient>

          <Text style={styles.footerText}>
            Every step moves you forward 💪
          </Text>
        </ScrollView>
      ) : (
        <StepsHistory userId={userId} stepGoal={stepGoal} />
      )}
    </View>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

const Break = ({ label, val, icon: Icon, color }: any) => (
  <View style={styles.breakCard}>
    <View style={styles.breakIconWrap}>
      <Icon size={16} color={color} />
    </View>
    <Text style={styles.breakLabel}>{label}</Text>
    <Text style={styles.breakVal}>{val.toLocaleString()}</Text>
    <Text style={styles.stepsTxt}>steps</Text>
  </View>
);

const Insight = ({ label, val }: any) => (
  <View style={styles.insItem}>
    <Text style={styles.insLabel}>{label}</Text>
    <Text style={styles.insVal}>{val}</Text>
  </View>
);
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  /* ---------- HEADER ---------- */

  header: {
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  icon: {
    width: 40,
    height: 40,
    backgroundColor: '#111',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 17,
    textAlign: 'center',
  },

  sync: {
    color: '#34d399',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
    opacity: 0.9,
  },

  /* ---------- TABS ---------- */

  tabs: {
    flexDirection: 'row',
    backgroundColor: '#111',
    marginHorizontal: 24,
    marginTop: 20,
    borderRadius: 20,
    padding: 4,
  },

  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 16,
    alignItems: 'center',
  },

  tabActive: {
    backgroundColor: '#222',
  },

  tabText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },

  /* ---------- BREAKDOWN ---------- */

  breakRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    marginTop: 24,
  },

  breakCard: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 22,
    padding: 16,
    minHeight: 120,
    justifyContent: 'space-between',
  },

  breakIconWrap: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    alignItems: 'center',
    justifyContent: 'center',
  },

  breakLabel: {
    color: '#666',
    fontSize: 10,
    letterSpacing: 1,
    marginTop: 6,
  },

  breakVal: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
    marginTop: 4,
  },

  stepsTxt: {
    color: '#444',
    fontSize: 10,
    marginTop: 2,
  },

  /* ---------- AUTO DETECT TEXT ---------- */

  auto: {
    color: '#333',
    fontSize: 9,
    textAlign: 'center',
    marginTop: 12,
    letterSpacing: 1,
  },

  /* ---------- INSIGHTS ---------- */

  insightCard: {
    marginHorizontal: 24,
    marginTop: 28,
    borderRadius: 26,
    padding: 18,
    backgroundColor: '#0f0f0f',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 10,
  },

  insightTitle: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 13,
    marginBottom: 14,
  },

  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  insightDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#1f1f1f',
  },

  insItem: {
    flex: 1,
    alignItems: 'center',
  },

  insLabel: {
    color: '#666',
    fontSize: 10,
  },

  insVal: {
    color: '#fff',
    fontWeight: '900',
    marginTop: 6,
    fontSize: 13,
  },

  /* ---------- FOOTER ---------- */

  footerText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 12,
    marginTop: 24,
  },
});
