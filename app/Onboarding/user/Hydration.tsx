import React, { useState } from 'react';
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

const { width } = Dimensions.get('window');

export default function HydrationScreen() {
  const [waterAmount, setWaterAmount] = useState(1250);
  const goal = 3000;

  const [sheetOpen, setSheetOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);


  const remaining = Math.max(0, goal - waterAmount);
  const isGoalMet = waterAmount >= goal;

  const percent = Math.min(1, waterAmount / goal);

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Pressable style={styles.iconBtn}>
          <ArrowLeft size={20} color="#fff" />
        </Pressable>

        <Text style={styles.title}>Hydration</Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >

        {/* RING */}
        <View style={styles.ringWrap}>
          <View style={styles.fakeRing}>
            <Text style={styles.ringValue}>{waterAmount} ml</Text>
            <Text style={styles.ringSub}>of {goal} ml</Text>
          </View>
        </View>

        {/* QUICK ADD */}
        <View style={styles.quickRow}>
          <Pressable style={styles.quickBtn} onPress={() => setWaterAmount(v => v + 250)}>
            <Text style={styles.quickText}>250</Text>
          </Pressable>

          <Pressable style={styles.quickBtn} onPress={() => setWaterAmount(v => v + 500)}>
            <Text style={styles.quickText}>500</Text>
          </Pressable>

          <Pressable style={styles.quickBtn} onPress={() => setSheetOpen(true)}>
            <SlidersHorizontal size={18} color="#aaa" />
          </Pressable>
        </View>

        {/* STATUS */}
        <View style={{ marginTop: 20, alignItems: 'center' }}>
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
          onAdd={(ml) => setWaterAmount(v => v + ml)}
          onClose={() => setSheetOpen(false)}
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
    marginTop: 30,
    alignItems: 'center',
  },

  fakeRing: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 10,
    borderColor: '#818cf8',
    alignItems: 'center',
    justifyContent: 'center',
  },

  ringValue: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },

  ringSub: {
    color: '#666',
    marginTop: 4,
  },

  quickRow: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },

  quickBtn: {
    width: 64,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quickText: {
    color: '#fff',
    fontWeight: '800',
  },

  remaining: {
    color: '#777',
    marginTop: 10,
  },

  complete: {
    color: '#818cf8',
    fontWeight: '700',
  },

  reminderCard: {
    marginTop: 32,
    marginHorizontal: 24,
    backgroundColor: '#111',
    borderRadius: 24,
    padding: 16,
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
    marginTop: 40,
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    backgroundColor: '#111',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  streakText: {
    color: '#777',
    fontSize: 12,
  },
});
