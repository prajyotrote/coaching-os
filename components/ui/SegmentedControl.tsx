import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface SegmentedControlProps {
  options: string[];
  selected: string;
  onChange: (value: any) => void;
}

export default function SegmentedControl({
  options,
  selected,
  onChange,
}: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {options.map(option => (
        <Pressable
          key={option}
          onPress={() => onChange(option)}
          style={[
            styles.item,
            selected === option && styles.activeItem,
          ]}
        >
          <Text
            style={[
              styles.text,
              selected === option && styles.activeText,
            ]}
          >
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#121212',
    borderRadius: 999,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignSelf: 'center',
  },

  item: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },

  activeItem: {
    backgroundColor: '#1F1F1F',
  },

  text: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF', // muted
    letterSpacing: 0.3,
  },

  activeText: {
    color: '#FFFFFF',
  },
});
