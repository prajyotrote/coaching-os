import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

const saveName = async (name: string) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  // 1️⃣ Save data
  await supabase
    .from('user_onboarding')
    .upsert({
      user_id: user.id,
      name,
    });

  // 2️⃣ Advance step
  await supabase
    .from('profiles')
    .update({ onboarding_step: 1 })
    .eq('id', user.id);
};


export default function NameScreen() {
  const [name, setName] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 400);
  }, []);

  const isValid = name.trim().length >= 2;

  const goNext = async () => {
  if (!isValid) return;

  await saveName(name.trim());
  router.push('/Onboarding/user/gender');
};

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={28} color="#94a3b8" />
        </Pressable>

        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>

        <View style={{ width: 32 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>
          What should we{'\n'}call you?
        </Text>
        <Text style={styles.subtitle}>
          This helps us personalize your experience.
        </Text>

        <TextInput
          ref={inputRef}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Alex"
          placeholderTextColor="#334155"
          style={styles.input}
          autoCorrect={false}
          autoCapitalize="words"
          returnKeyType="done"
          onSubmitEditing={goNext}
        />

        <Pressable
  onPress={async () => {
    await supabase
      .from('profiles')
      .update({ onboarding_step: 1 })
      .eq('id', (await supabase.auth.getUser()).data.user?.id);

    router.push('/Onboarding/user/gender');
  }}
>
  <Text style={styles.skip}>Skip for now</Text>
</Pressable>

      </View>

      {/* CTA */}
      <Pressable
        disabled={!isValid}
        onPress={goNext}
        style={[styles.cta, !isValid && styles.ctaDisabled]}
      >
        <Text style={[styles.ctaText, !isValid && { color: '#64748b' }]}>
          Continue
        </Text>
        <Feather
          name="arrow-right"
          size={20}
          color={isValid ? '#000' : '#64748b'}
        />
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 56,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  backBtn: {
    padding: 6,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#020617',
    borderRadius: 4,
    marginHorizontal: 16,
  },
  progressFill: {
    width: '10%',
    height: '100%',
    backgroundColor: '#334155',
    borderRadius: 4,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 40,
  },
  input: {
    fontSize: 28,
    color: '#fff',
    borderBottomWidth: 2,
    borderBottomColor: '#1e293b',
    paddingVertical: 12,
    marginBottom: 24,
  },
  skip: {
    color: '#64748b',
    fontWeight: '600',
  },
  cta: {
    height: 60,
    borderRadius: 28,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaDisabled: {
    backgroundColor: '#020617',
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#000',
  },
});
