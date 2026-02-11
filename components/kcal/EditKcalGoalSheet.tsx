import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Animated,
  Pressable,
} from 'react-native';
import { Minus, Plus, X } from 'lucide-react-native';

interface Props {
  visible: boolean;
  currentGoal: number;
  onClose: () => void;
  onSave: (goal: number) => void;
}

export default function EditKcalGoalSheet({
  visible,
  currentGoal,
  onClose,
  onSave,
}: Props) {
  const [goal, setGoal] = useState(currentGoal);
  const translateY = useRef(new Animated.Value(300)).current;

  useEffect(() => {
    if (visible) {
      setGoal(currentGoal);
      Animated.timing(translateY, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, currentGoal]);

  const close = () => {
    Animated.timing(translateY, {
      toValue: 300,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <Pressable style={styles.backdrop} onPress={close} />

      <Animated.View style={[styles.sheet, { transform: [{ translateY }] }]}>
        <View style={styles.header}>
          <Text style={styles.title}>Daily Kcal Goal</Text>
          <Pressable onPress={close} hitSlop={10}>
            <X size={18} color="#9CA3AF" />
          </Pressable>
        </View>

        <View style={styles.controlRow}>
          <Pressable
            style={styles.circleBtn}
            onPress={() => setGoal(g => Math.max(100, g - 50))}
          >
            <Minus size={16} color="#fff" />
          </Pressable>

          <Text style={styles.goalValue}>{goal}</Text>

          <Pressable
            style={styles.circleBtn}
            onPress={() => setGoal(g => g + 50)}
          >
            <Plus size={16} color="#fff" />
          </Pressable>
        </View>

        <Text style={styles.unit}>kcal</Text>

        <Text style={styles.helper}>
          Set a realistic daily burn target based on your activity level.
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
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0F0F0F',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 18,
    paddingBottom: 32,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
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
    gap: 28,
  },
  circleBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  goalValue: {
    color: '#fff',
    fontSize: 34,
    fontWeight: '800',
    minWidth: 90,
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
    marginTop: 18,
    lineHeight: 18,
  },
  saveBtn: {
    marginTop: 28,
    backgroundColor: '#F59E0B',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  saveText: {
    color: '#111',
    fontWeight: '800',
    fontSize: 15,
  },
});
