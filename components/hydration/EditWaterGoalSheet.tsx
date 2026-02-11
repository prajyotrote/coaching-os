import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
} from 'react-native';
import { Minus, Plus, X } from 'lucide-react-native';

interface Props {
  currentGoal: number;
  onClose: () => void;
  onSave: (goal: number) => void;
}

export default function EditWaterGoalSheet({
  currentGoal,
  onClose,
  onSave,
}: Props) {
  const [goal, setGoal] = useState(currentGoal);
  const translateY = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    setGoal(currentGoal);
    Animated.timing(translateY, {
      toValue: 0,
      duration: 260,
      useNativeDriver: true,
    }).start();
  }, [currentGoal]);

  const close = () => {
    Animated.timing(translateY, {
      toValue: 300,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  return (
    <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Water Goal</Text>
        <Pressable onPress={close} hitSlop={10}>
          <X size={18} color="#9CA3AF" />
        </Pressable>
      </View>

      <View style={styles.controlRow}>
        <Pressable
          style={styles.circleBtn}
          onPress={() => setGoal(g => Math.max(500, g - 250))}
        >
          <Minus size={16} color="#fff" />
        </Pressable>

        <Text style={styles.goalValue}>{goal}</Text>

        <Pressable
          style={styles.circleBtn}
          onPress={() => setGoal(g => g + 250)}
        >
          <Plus size={16} color="#fff" />
        </Pressable>
      </View>

      <Text style={styles.unit}>ml</Text>

      <Text style={styles.helper}>
        Adjust your target based on your activity and climate.
      </Text>

      <Pressable
        style={styles.saveBtn}
        onPress={() => {
          onSave(goal);
          close();
        }}
      >
        <Text style={styles.saveText}>Save</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    backgroundColor: '#0B0B0B',
    padding: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalValue: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
    minWidth: 110,
    textAlign: 'center',
  },
  unit: {
    textAlign: 'center',
    color: '#9CA3AF',
    marginTop: 4,
    fontSize: 13,
  },
  helper: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.5)',
    fontSize: 12,
    marginTop: 16,
    lineHeight: 18,
  },
  saveBtn: {
    marginTop: 24,
    backgroundColor: '#60A5FA',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveText: {
    color: '#0B0B0B',
    fontWeight: '800',
    fontSize: 15,
  },
});
