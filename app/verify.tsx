import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Keyboard,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

export default function VerifyScreen() {
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [phone, setPhone] = useState<string | null>(null);

const inputs = useRef<Array<TextInput | null>>([]);

  // Load phone number
  useEffect(() => {
    AsyncStorage.getItem('auth_phone').then(setPhone);
  }, []);

  // Resend countdown
  useEffect(() => {
    if (resendTimer === 0) return;

    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;

    const next = [...otp];
    next[index] = value;
    setOtp(next);

    if (value && index < 5) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace' && otp[index] === '' && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const isComplete = otp.every((d) => d !== '');

  const verifyOtp = async () => {
    if (!isComplete || !phone) return;

    setLoading(true);

    // 1️⃣ Verify OTP
    const { error: otpError } = await supabase.auth.verifyOtp({
      phone,
      token: otp.join(''),
      type: 'sms',
    });

    if (otpError) {
      alert(otpError.message);
      setLoading(false);
      return;
    }

    // 2️⃣ Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert('Authentication failed. Please try again.');
      setLoading(false);
      return;
    }

    const selectedRole = await AsyncStorage.getItem('selectedRole');

    if (!selectedRole) {
      alert('Role not selected. Please start again.');
      setLoading(false);
      return;
    }

    // 3️⃣ Check if phone already exists in profiles
    const { data: phoneProfile, error: phoneError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('phone', phone)
      .maybeSingle();

    if (phoneError) {
      alert('Something went wrong. Please try again.');
      setLoading(false);
      return;
    }

    // ❌ Phone exists but role mismatch
    if (phoneProfile && phoneProfile.role !== selectedRole) {
      alert(
        `This number is already registered as a ${phoneProfile.role}.`
      );

      await supabase.auth.signOut();
      await AsyncStorage.removeItem('auth_phone');
      await AsyncStorage.removeItem('selectedRole');

      setLoading(false);
      router.replace('/select-role');
      return;
    }

    // 4️⃣ Create profile ONLY if it does not exist
    if (!phoneProfile) {
      const status =
        selectedRole === 'coach' ? 'pending_verification' : 'active';

      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
  id: user.id,
  phone,
  role: selectedRole,
  status,
  onboarding_step: 0,
  onboarding_completed: false,
});


      if (insertError) {
        alert('Failed to create profile. Please try again.');
        setLoading(false);
        return;
      }
    }

    // 5️⃣ Cleanup temp storage
    await AsyncStorage.removeItem('auth_phone');
    await AsyncStorage.removeItem('selectedRole');

    // ❗ DO NOT NAVIGATE
    // RootLayout will re-run and route correctly

    setLoading(false);
  };

  const resendOtp = async () => {
    if (!phone) return;

    setResendTimer(30);

    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });

    if (error) {
      alert(error.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Pressable onPress={() => router.back()} style={styles.back}>
        <Feather name="arrow-left" size={24} color="#64748b" />
      </Pressable>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>Verify OTP</Text>

        {phone && (
          <Text style={styles.subtitle}>
            Code sent to{' '}
            <Text style={styles.bold}>
              ***-***-{phone.slice(-4)}
            </Text>
          </Text>
        )}

        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput

              key={i}
              ref={(ref) => {
  inputs.current[i] = ref;
}}

              value={digit}
              onChangeText={(v) => handleChange(i, v)}
              onKeyPress={({ nativeEvent }) =>
                handleKeyPress(i, nativeEvent.key)
              }
              keyboardType="number-pad"
              returnKeyType="done"
              blurOnSubmit
              onSubmitEditing={() => Keyboard.dismiss()}
              maxLength={1}
              style={styles.otpBox}
              autoFocus={i === 0}
            />
          ))}
        </View>

        <View style={styles.resend}>
          {resendTimer > 0 ? (
            <Text style={styles.resendText}>
              Resend code in{' '}
              <Text style={styles.bold}>{resendTimer}s</Text>
            </Text>
          ) : (
            <Pressable onPress={resendOtp}>
              <Text style={styles.resendLink}>Resend code</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Pressable
          disabled={!isComplete || loading}
          onPress={verifyOtp}
          style={[
            styles.button,
            isComplete ? styles.buttonActive : styles.buttonDisabled,
          ]}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Verifying…' : 'Verify & Continue'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  back: {
    padding: 8,
    marginBottom: 32,
    alignSelf: 'flex-start',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 32,
  },
  bold: {
    fontWeight: '800',
    color: '#0f172a',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpBox: {
    width: 48,
    height: 64,
    borderBottomWidth: 2,
    borderColor: '#e2e8f0',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
  },
  resend: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  footer: {
    paddingBottom: 16,
  },
  button: {
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonActive: {
    backgroundColor: '#0f172a',
  },
  buttonDisabled: {
    backgroundColor: '#f1f5f9',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#fff',
  },
});