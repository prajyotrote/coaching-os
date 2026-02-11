import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
} from 'react-native';
import {
  ArrowLeft,
  Flame,
  SlidersHorizontal,
} from 'lucide-react-native';

import { Bell, ChevronRight } from 'lucide-react-native';
import ReminderSheet from '@/components/ReminderSheet';




import BottomSheet from '@/components/BottomSheet';
import AddWaterSheet from '@/components/AddWaterSheet';
import HydrationRing from '@/components/ui/HydrationRing';
import EditWaterGoalSheet from '@/components/hydration/EditWaterGoalSheet';
import { supabase } from '@/lib/supabase';
import { getDailyWaterGoal, updateDailyWaterGoal } from '@/logic/profile';
import { logWater } from '@/lib/services/health.service';

const { width } = Dimensions.get('window');

export default function HydrationScreen() {
  const [waterAmount, setWaterAmount] = useState(1250);
  const [goal, setGoal] = useState(3000);
  const [userId, setUserId] = useState<string | null>(null);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);


  const remaining = Math.max(0, goal - waterAmount);
  const isGoalMet = waterAmount >= goal;

  const percent = Math.min(1, waterAmount / goal);

  const loadTodayWater = async (id: string) => {
    const since = new Date();
    since.setHours(0, 0, 0, 0);
    const { data } = await supabase
      .from('water_logs')
      .select('ml, created_at')
      .eq('user_id', id)
      .gte('created_at', since.toISOString());

    const total =
      data?.reduce((s, x) => s + (x.ml || 0), 0) || 0;
    setWaterAmount(total);
  };

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const id = data.user?.id ?? null;
      setUserId(id);
      if (!id) return;
      const g = await getDailyWaterGoal(id);
      setGoal(g);
      await loadTodayWater(id);
    })();
  }, []);

  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('hydration-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'water_logs' },
        () => loadTodayWater(userId)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable style={styles.iconBtn}>
          <ArrowLeft size={20} color="#fff" />
        </Pressable>

        <Text style={styles.title}>Hydration</Text>

        <Pressable style={styles.iconBtn} onPress={() => setGoalOpen(true)}>
          <SlidersHorizontal size={18} color="#9CA3AF" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >

        {/* RING */}
        <View style={styles.ringWrap}>
          <HydrationRing current={waterAmount} goal={goal} />
        </View>

        {/* QUICK ADD */}
        <View style={styles.quickRow}>
          <Pressable
            style={styles.quickBtn}
            onPress={async () => {
              if (!userId) return;
              await logWater(userId, 250);
              await loadTodayWater(userId);
            }}
          >
            <Text style={styles.quickText}>250</Text>
          </Pressable>

          <Pressable
            style={styles.quickBtn}
            onPress={async () => {
              if (!userId) return;
              await logWater(userId, 500);
              await loadTodayWater(userId);
            }}
          >
            <Text style={styles.quickText}>500</Text>
          </Pressable>

          <Pressable style={styles.quickBtn} onPress={() => setSheetOpen(true)}>
            <SlidersHorizontal size={18} color="#aaa" />
          </Pressable>
        </View>

        {/* STATUS */}
        <View style={{ marginTop: 12, alignItems: 'center' }}>
          {isGoalMet ? (
            <Text style={styles.complete}>Hydration goal complete 💧🔥</Text>
          ) : (
            <Text style={styles.remaining}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>
                {remaining} ml
              </Text>{' '}
              left to hit today’s goal
            </Text>
          )}
        </View>

        {/* REMINDER CARD (placeholder for now) */}
       {/* REMINDER CARD */}
<Pressable style={styles.reminderCard} onPress={() => setReminderOpen(true)}>

  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>

    {/* Left Icon */}
    <View style={styles.reminderIcon}>
      <Bell size={18} color="#818cf8" />
    </View>

    {/* Text */}
    <View style={{ flex: 1 }}>
      <Text style={styles.reminderTitle}>Hydration Reminder</Text>
      <Text style={styles.reminderSub}>Every 45 mins • 9 AM – 9 PM</Text>
    </View>

    {/* Change Button */}
    <View style={styles.changeBtn}>
      <Text style={styles.changeText}>Change</Text>
      <ChevronRight size={14} color="#aaa" />
    </View>

  </View>

</Pressable>
{/* REMINDER SHEET */}
<BottomSheet visible={reminderOpen} onClose={() => setReminderOpen(false)}>
  <ReminderSheet
    initialSettings={{
      enabled: true,
      frequencyMinutes: 45,
      startTime: '09:00',
      endTime: '21:00',
    }}
    onSave={() => {}}
    onClose={() => setReminderOpen(false)}
  />
</BottomSheet>



        {/* STREAK */}
        <View style={styles.streak}>
          <Flame size={14} color="#fb923c" />
          <Text style={styles.streakText}>3 day hydration streak</Text>
        </View>

      </ScrollView>

      {/* CUSTOM ADD SHEET */}
      <BottomSheet visible={sheetOpen} onClose={() => setSheetOpen(false)}>
        <AddWaterSheet
          onAdd={async (ml) => {
            if (!userId) return;
            await logWater(userId, ml);
            await loadTodayWater(userId);
          }}
          onClose={() => setSheetOpen(false)}
        />
      </BottomSheet>

      {/* EDIT GOAL SHEET */}
      <BottomSheet visible={goalOpen} onClose={() => setGoalOpen(false)}>
        <EditWaterGoalSheet
          currentGoal={goal}
          onClose={() => setGoalOpen(false)}
          onSave={async (g) => {
            setGoal(g);
            if (!userId) return;
            await updateDailyWaterGoal(userId, g);
          }}
        />
      </BottomSheet>
      

    </View>
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  reminderIcon: {
  width: 36,
  height: 36,
  borderRadius: 18,
  backgroundColor: '#1a1a1a',
  alignItems: 'center',
  justifyContent: 'center',
},

changeBtn: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 4,
  backgroundColor: '#1a1a1a',
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 12,
},

changeText: {
  color: '#aaa',
  fontSize: 12,
  fontWeight: '700',
},


  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: {
    color: '#fff',
    fontWeight: '700',
  },

  ringWrap: {
    marginTop: 26,
    alignItems: 'center',
  },


  quickRow: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },

  quickBtn: {
    width: 72,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#0F0F0F',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  quickText: {
    color: '#fff',
    fontWeight: '800',
  },

  remaining: {
    color: '#9CA3AF',
    marginTop: 10,
  },

  complete: {
    color: '#818cf8',
    fontWeight: '700',
  },

  reminderCard: {
    marginTop: 28,
    marginHorizontal: 24,
    backgroundColor: '#0F0F0F',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  reminderTitle: {
    color: '#fff',
    fontWeight: '800',
  },

  reminderSub: {
    color: '#666',
    marginTop: 6,
  },

  streak: {
    marginTop: 34,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#0F0F0F',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },

  streakText: {
    color: '#777',
    fontSize: 12,
  },
});
