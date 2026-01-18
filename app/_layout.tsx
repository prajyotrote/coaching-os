import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AuthProvider, useAuth } from '@/lib/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

function RootNavigator() {
  const { session, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    const resolveRoute = async () => {
      // 🔒 Not logged in
      if (!session) {
        router.replace('/select-role');
        return;
      }

      // 🔍 Fetch profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, onboarding_step, status')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Profile fetch error', error);
        return;
      }

      // 🆕 Edge case: session exists but profile not yet created
      if (!profile) {
        const selectedRole = await AsyncStorage.getItem('selectedRole');

        if (selectedRole === 'coach') {
          router.replace('/Onboarding/coach/welcome');
        } else {
          router.replace('/Onboarding/user/welcome');
        }
        return;
      }

      // =========================
      // 👤 USER FLOW
      // =========================
      if (profile.role === 'user') {
        if (profile.onboarding_step === 0) {
          router.replace('/Onboarding/user/welcome');
          return;
        }

        if (profile.onboarding_step === 1) {
          router.replace('/Onboarding/user/success');
          return;
        }

        // onboarding complete
        router.replace('/');
        return;
      }

      // =========================
      // 🧑‍🏫 COACH FLOW
      // =========================
      if (profile.role === 'coach') {
        if (profile.onboarding_step === 0) {
          router.replace('/Onboarding/coach/welcome');
          return;
        }

        if (profile.status === 'pending_verification') {
          router.replace('/Onboarding/coach/review');
          return;
        }

        // approved coach
        router.replace('/');
        return;
      }
    };

    resolveRoute();
  }, [session, loading]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
