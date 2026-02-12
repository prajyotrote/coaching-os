import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { ArrowLeft, RefreshCw, Footprints, Activity, Layers } from 'lucide-react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

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
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0f0f1a', '#000000', '#050510']}
        style={StyleSheet.absoluteFill}
      />

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable style={styles.iconBtn} onPress={() => router.back()}>
          <ArrowLeft size={20} color="#fff" />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.title}>Steps</Text>
          <Text style={styles.sync}>Sync completed ✓</Text>
        </View>

        <Pressable style={styles.iconBtn}>
          <RefreshCw size={18} color="#9ca3af" />
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
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
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
          <Text style={styles.sectionTitle}>ACTIVITY BREAKDOWN</Text>
          <View style={styles.breakRow}>
            <Break
              label="WALKING"
              val={today?.walking_steps ?? 0}
              icon={Footprints}
              color="#a78bfa"
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
              color="#6b7280"
            />
          </View>

          <Text style={styles.auto}>
            ACTIVITY AUTOMATICALLY DETECTED FROM YOUR DEVICE
          </Text>

          {/* DAILY INSIGHTS */}
          <Text style={styles.sectionTitle}>DAILY INSIGHTS</Text>
          <View style={styles.insightCard}>
            <LinearGradient
              colors={['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.02)']}
              style={styles.insightInner}
            >
              <View style={styles.insightRow}>
                <Insight label="Active" val={`${today?.active_minutes ?? 0} min`} />
                <View style={styles.insightDivider} />
                <Insight label="Avg Pace" val="—" />
                <View style={styles.insightDivider} />
                <Insight label="Peak" val="—" />
              </View>
            </LinearGradient>
          </View>

          <View style={styles.motivationBadge}>
            <LinearGradient
              colors={['rgba(251, 191, 36, 0.15)', 'rgba(251, 191, 36, 0.05)']}
              style={styles.motivationGradient}
            >
              <Text style={styles.motivationText}>Every step moves you forward 💪</Text>
            </LinearGradient>
          </View>
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
    <LinearGradient
      colors={[`${color}20`, `${color}08`]}
      style={styles.breakCardInner}
    >
      <View style={[styles.breakIconWrap, { backgroundColor: `${color}25` }]}>
        <Icon size={16} color={color} />
      </View>
      <Text style={styles.breakLabel}>{label}</Text>
      <Text style={styles.breakVal}>{val.toLocaleString()}</Text>
      <Text style={styles.stepsTxt}>steps</Text>
    </LinearGradient>
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
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerCenter: {
    alignItems: 'center',
  },

  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  title: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
    textAlign: 'center',
  },

  sync: {
    color: '#34d399',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },

  /* ---------- TABS ---------- */

  tabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },

  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.1)',
  },

  tabText: {
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '700',
    fontSize: 13,
  },

  tabTextActive: {
    color: '#fff',
  },

  /* ---------- SECTION TITLE ---------- */

  sectionTitle: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2,
    marginHorizontal: 24,
    marginTop: 28,
    marginBottom: 12,
  },

  /* ---------- BREAKDOWN ---------- */

  breakRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
  },

  breakCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },

  breakCardInner: {
    padding: 14,
    minHeight: 130,
  },

  breakIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  breakLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 9,
    letterSpacing: 1.5,
    fontWeight: '700',
    marginTop: 12,
  },

  breakVal: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 20,
    marginTop: 4,
  },

  stepsTxt: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    marginTop: 2,
  },

  /* ---------- AUTO DETECT TEXT ---------- */

  auto: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 8,
    textAlign: 'center',
    marginTop: 16,
    letterSpacing: 1.5,
  },

  /* ---------- INSIGHTS ---------- */

  insightCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },

  insightInner: {
    padding: 18,
  },

  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  insightDivider: {
    width: 1,
    height: 36,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  insItem: {
    flex: 1,
    alignItems: 'center',
  },

  insLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '600',
  },

  insVal: {
    color: '#fff',
    fontWeight: '900',
    marginTop: 6,
    fontSize: 15,
  },

  /* ---------- MOTIVATION ---------- */

  motivationBadge: {
    marginHorizontal: 20,
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },

  motivationGradient: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

  motivationText: {
    color: '#fbbf24',
    fontSize: 13,
    fontWeight: '700',
  },
});
