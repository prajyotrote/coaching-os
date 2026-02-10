import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Minus, Plus } from 'lucide-react-native';

interface Props {
  onAdd: (amount: number) => void;
  onClose: () => void;
}

export default function AddWaterSheet({ onAdd, onClose }: Props) {
  const [amount, setAmount] = useState(0);

  const presets = [100, 200, 350, 500, 1000];

  const handleAdjust = (delta: number) => {
    setAmount(prev => Math.max(0, prev + delta));
  };

  return (
    <View style={{ gap: 28 }}>

      {/* DISPLAY */}
      <View style={styles.center}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
          <Text style={styles.amount}>{amount}</Text>
          <Text style={styles.unit}>ml</Text>
        </View>
      </View>

      {/* CONTROLS */}
      <View style={styles.controls}>
        <Pressable style={styles.adjustBtn} onPress={() => handleAdjust(-100)}>
          <Minus size={22} color="#fff" />
        </Pressable>

        <Text style={styles.adjustLabel}>Adjust</Text>

        <Pressable style={styles.adjustBtn} onPress={() => handleAdjust(100)}>
          <Plus size={22} color="#fff" />
        </Pressable>
      </View>

      {/* PRESETS */}
      <View style={styles.presetWrap}>
        {presets.map(p => (
          <Pressable
            key={p}
            onPress={() => setAmount(p)}
            style={[
              styles.preset,
              amount === p && styles.presetActive,
            ]}
          >
            <Text
              style={[
                styles.presetText,
                amount === p && { color: '#fff' },
              ]}
            >
              {p}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* ACTION */}
      <Pressable
        disabled={amount === 0}
        onPress={() => {
          if (!amount) return;
          onAdd(amount);
          onClose();
        }}
        style={[
          styles.actionBtn,
          amount === 0 && styles.actionDisabled,
        ]}
      >
        <Text
          style={[
            styles.actionText,
            amount === 0 && { color: '#666' },
          ]}
        >
          ADD WATER
        </Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    alignItems: 'center',
  },

  amount: {
    color: '#fff',
    fontSize: 56,
    fontWeight: '900',
    letterSpacing: -2,
  },

  unit: {
    color: '#666',
    fontSize: 18,
    marginBottom: 6,
  },

  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },

  adjustBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },

  adjustLabel: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },

  presetWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },

  preset: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
  },

  presetActive: {
    backgroundColor: '#818cf8',
    borderColor: '#818cf8',
  },

  presetText: {
    color: '#777',
    fontWeight: '700',
  },

  actionBtn: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },

  actionDisabled: {
    backgroundColor: '#111',
  },

  actionText: {
    color: '#000',
    fontWeight: '900',
    letterSpacing: 1,
  },
});
