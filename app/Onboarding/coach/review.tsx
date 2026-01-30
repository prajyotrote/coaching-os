import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';

interface TrainerProfile {
  first_name: string;
  last_name: string;
  gender: string;
  age: number;
  city: string;
  state: string;
  skills: string[];
  certifications: string[] | null;
}

export default function TrainerReviewScreen() {
  const [profile, setProfile] = useState<TrainerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from('trainer_profile')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (!error) setProfile(data);
    setLoading(false);
  };

 const handleSubmit = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase
    .from('profiles')
    .update({
      status: 'pending_verification',
      onboarding_step: 99,        // 🔒 FINAL
      onboarding_completed: true, // 🔒 FINAL
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .lte('onboarding_step', 99); // 🛡️ CRITICAL

  if (error) {
    console.error('Submit error:', error);
    return;
  }

  router.replace('/Onboarding/coach/verification-pending');
};


  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(99,102,241,0.12)', 'transparent']}
        style={styles.glowTop}
      />

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Feather name="chevron-left" size={26} color="#9ca3af" />
        </Pressable>
        <Text style={styles.headerText}>FINAL REVIEW</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Review your profile</Text>
        <Text style={styles.subtitle}>
          Please confirm everything before submitting for verification.
        </Text>

        <InfoCard label="Name" value={`${profile.first_name} ${profile.last_name || ''}`} />
        <InfoCard label="Gender · Age" value={`${profile.gender} · ${profile.age}`} />
        <InfoCard label="Location" value={`${profile.city}, ${profile.state}`} />

        <TagCard label="Specializations" tags={profile.skills} />
        <TagCard
          label="Certifications"
          tags={profile.certifications ?? []}
          emptyText="No certifications added"
        />

        {/* Trust Note */}
        <View style={styles.trustBox}>
          <Feather name="shield" size={18} color="#6366f1" />
          <Text style={styles.trustText}>
            Your profile will be reviewed by our team before going live.
          </Text>
        </View>
      </ScrollView>

      {/* Submit */}
      <Pressable style={styles.cta} onPress={handleSubmit}>
        <Text style={styles.ctaText}>Submit for Verification</Text>
        <Feather name="arrow-right" size={20} color="#000" />
      </Pressable>
    </View>
  );
}

/* ---------------- Components ---------------- */

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardValue}>{value}</Text>
    </View>
  );
}

function TagCard({
  label,
  tags,
  emptyText,
}: {
  label: string;
  tags: string[];
  emptyText?: string;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardLabel}>{label}</Text>
      {tags.length > 0 ? (
        <View style={styles.tagsWrap}>
          {tags.map(tag => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>{emptyText}</Text>
      )}
    </View>
  );
}

/* ---------------- Styles ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  glowTop: {
    position: 'absolute',
    top: -150,
    left: -100,
    width: 400,
    height: 300,
    borderRadius: 200,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerText: {
    fontSize: 10,
    letterSpacing: 3,
    color: '#6b7280',
    fontWeight: '800',
  },
  content: {
    paddingBottom: 140,
  },
  title: {
    fontSize: 30,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    color: '#9ca3af',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#020617',
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#020617',
  },
  cardLabel: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
  tagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    color: '#e5e7eb',
    fontSize: 12,
    fontWeight: '700',
  },
  empty: {
    color: '#64748b',
    fontStyle: 'italic',
    fontSize: 13,
  },
  trustBox: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: '#020617',
    borderRadius: 18,
    padding: 16,
    marginTop: 16,
  },
  trustText: {
    color: '#c7d2fe',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  cta: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
  },
  loader: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
