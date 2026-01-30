import { View, Text, Pressable, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useState } from 'react';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';

/* ---------------------------------
   🎓 Certification Options
---------------------------------- */
const CERT_OPTIONS = [
  { id: 'nasm', label: 'NASM - CPT', org: 'National Academy of Sports Medicine' },
  { id: 'ace', label: 'ACE - CPT', org: 'American Council on Exercise' },
  { id: 'issa', label: 'ISSA - CPT', org: 'International Sports Sciences Association' },
  { id: 'cscs', label: 'CSCS (NSCA)', org: 'Strength & Conditioning Specialist' },
  { id: 'precision', label: 'PN1', org: 'Precision Nutrition' },
  { id: 'crossfit', label: 'CrossFit L1/L2', org: 'CrossFit Inc.' },
  { id: 'yoga', label: '200hr RYT', org: 'Yoga Alliance' },
];

export default function TrainerCertificationsScreen() {
  const [selectedCerts, setSelectedCerts] = useState<string[]>([]);
  const [showOther, setShowOther] = useState(false);
  const [otherCert, setOtherCert] = useState('');

  const toggleCert = (id: string) => {
    setSelectedCerts((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const hasSelection = selectedCerts.length > 0 || otherCert.trim().length > 0;

  /* ---------------------------------
     💾 Save Certifications
  ---------------------------------- */
  const handleContinue = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const finalCerts = [...selectedCerts];
  if (otherCert.trim()) finalCerts.push(otherCert.trim());

  // 1️⃣ Save certifications
  const { error } = await supabase
    .from('trainer_profile')
    .upsert({
      user_id: user.id,
      certifications: finalCerts.length ? finalCerts : null,
      updated_at: new Date().toISOString(),
    });

  if (error) {
    console.error('Saving certifications failed:', error);
    return;
  }

  // 2️⃣ Advance onboarding SAFELY
  await supabase
    .from('profiles')
    .update({
      onboarding_step: 6, // ✅ certifications done
    })
    .eq('id', user.id)
    .lte('onboarding_step', 6);

  router.replace('/Onboarding/coach/review');
};


  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={26} color="#9ca3af" />
        </Pressable>
        <Text style={styles.brand}>TRAINER SETUP</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>
        Your{'\n'}certifications
      </Text>
      <Text style={styles.subtitle}>
        Upload proof now or later.
      </Text>

      {/* Certifications */}
      <ScrollView contentContainerStyle={styles.list}>
        {CERT_OPTIONS.map((cert) => {
          const selected = selectedCerts.includes(cert.id);
          return (
            <Pressable
              key={cert.id}
              onPress={() => toggleCert(cert.id)}
              style={[
                styles.certRow,
                selected && styles.certRowSelected,
              ]}
            >
              <View>
                <Text style={[styles.certLabel, selected && styles.certLabelSelected]}>
                  {cert.label}
                </Text>
                <Text style={styles.certOrg}>{cert.org}</Text>
              </View>

              <View style={[styles.checkCircle, selected && styles.checkCircleActive]}>
                {selected && <Feather name="check" size={14} color="#000" />}
              </View>
            </Pressable>
          );
        })}

        {/* Other certification */}
        {!showOther ? (
          <Pressable
            onPress={() => setShowOther(true)}
            style={styles.addOther}
          >
            <Feather name="plus" size={18} color="#64748b" />
            <Text style={styles.addOtherText}>Add other certification</Text>
          </Pressable>
        ) : (
          <TextInput
            autoFocus
            value={otherCert}
            onChangeText={setOtherCert}
            placeholder="Enter certification name"
            placeholderTextColor="#475569"
            style={styles.otherInput}
          />
        )}

        {/* Upload hint */}
        <Pressable style={styles.uploadHint}>
          <Feather name="upload" size={16} color="#818cf8" />
          <Text style={styles.uploadText}>Upload certificates (optional)</Text>
        </Pressable>
      </ScrollView>

      {/* CTA */}
      <Pressable
        onPress={handleContinue}
        style={[
          styles.cta,
          !hasSelection && styles.ctaSecondary,
        ]}
      >
        <Text style={[styles.ctaText, !hasSelection && { color: '#9ca3af' }]}>
          {hasSelection ? 'Continue' : 'Skip for now'}
        </Text>
        <Feather
          name="arrow-right"
          size={20}
          color={hasSelection ? '#000' : '#9ca3af'}
        />
      </Pressable>

      <View style={styles.homeIndicator} />
    </View>
  );
}

/* ---------------------------------
   🎨 Styles
---------------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 36,
  },
  backBtn: { padding: 6 },
  brand: {
    fontSize: 10,
    letterSpacing: 3,
    color: '#6b7280',
    fontWeight: '800',
  },
  title: {
    fontSize: 34,
    fontWeight: '900',
    color: '#fff',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#9ca3af',
    marginBottom: 20,
  },
  list: {
    paddingBottom: 120,
  },
  certRow: {
    backgroundColor: '#020617',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#020617',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  certRowSelected: {
    borderColor: '#fff',
  },
  certLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: '#e5e7eb',
  },
  certLabelSelected: {
    color: '#fff',
  },
  certOrg: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  addOther: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginTop: 8,
  },
  addOtherText: {
    color: '#64748b',
    fontWeight: '700',
  },
  otherInput: {
    backgroundColor: '#020617',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#6366f1',
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginTop: 10,
  },
  uploadHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#312e81',
    backgroundColor: '#312e8120',
  },
  uploadText: {
    color: '#818cf8',
    fontWeight: '800',
    fontSize: 13,
  },
  cta: {
    height: 60,
    backgroundColor: '#fff',
    borderRadius: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  ctaSecondary: {
    backgroundColor: '#020617',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  ctaText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#000',
  },
  homeIndicator: {
    alignSelf: 'center',
    width: 120,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#020617',
    marginTop: 16,
  },
});
