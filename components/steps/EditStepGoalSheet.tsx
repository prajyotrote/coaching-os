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

export default function EditStepGoalSheet({
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
  }, [visible]);

  const close = () => {
    Animated.timing(translateY, {
      toValue: 300,
      duration: 220,
      useNativeDriver: true,
    }).start(() => onClose());
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={close} />

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { transform: [{ translateY }] },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Daily Step Goal</Text>
          <Pressable onPress={close} hitSlop={10}>
            <X size={18} color="#9CA3AF" />
          </Pressable>
        </View>

        {/* Goal Control */}
        <View style={styles.controlRow}>
          <Pressable
            style={styles.circleBtn}
            onPress={() => setGoal(g => Math.max(1000, g - 500))}
          >
            <Minus size={16} color="#fff" />
          </Pressable>

          <Text style={styles.goalValue}>
            {goal.toLocaleString()}
          </Text>

          <Pressable
            style={styles.circleBtn}
            onPress={() => setGoal(g => g + 500)}
          >
            <Plus size={16} color="#fff" />
          </Pressable>
        </View>

        <Text style={styles.unit}>steps</Text>

        <Text style={styles.helper}>
          This goal is used to calculate progress and insights.
        </Text>

        {/* Actions */}
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

/* ======================================================
   STYLES
====================================================== */

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
    marginTop: 18,
    lineHeight: 18,
  },

  saveBtn: {
    marginTop: 28,
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },

  saveText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
