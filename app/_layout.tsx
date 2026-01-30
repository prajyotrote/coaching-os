import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { AuthProvider, useAuth } from '@/lib/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ----------------------------------------
   🔁 USER ONBOARDING ROUTE RESOLVER
---------------------------------------- */
function getUserOnboardingRoute(step: number) {
  switch (step) {
    case 0:
      return '/Onboarding/user/welcome';
    case 1:
      return '/Onboarding/user/name';
    case 2:
      return '/Onboarding/user/gender';
    case 3:
      return '/Onboarding/user/age';
    case 4:
      return '/Onboarding/user/height';
    case 5:
      return '/Onboarding/user/weight';
    case 6:
      return '/Onboarding/user/activity';
    case 7:
      return '/Onboarding/user/health';
    case 8:
      return '/Onboarding/user/lifestyle';
    default:
      return '/Onboarding/user/welcome';
  }
}

/* ----------------------------------------
   🌐 ROOT NAVIGATOR
---------------------------------------- */
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
        .select('role, onboarding_step, onboarding_completed, status')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) {
        console.error('Profile fetch error', error);
        return;
      }

      // 🆕 Profile not yet created
      if (!profile) {
        const selectedRole = await AsyncStorage.getItem('selectedRole');
        router.replace(
          selectedRole === 'coach'
            ? '/Onboarding/coach/welcome'
            : '/Onboarding/user/welcome'
        );
        return;
      }

      /* =========================
         👤 USER FLOW
      ========================= */
      if (profile.role === 'user') {
        if (!profile.onboarding_completed) {
          router.replace(
            getUserOnboardingRoute(profile.onboarding_step ?? 0) as any
          );
          return;
        }

        router.replace('/Onboarding/user/UserDashboard');
        return;
      }
function getCoachOnboardingRoute(step: number) {
  switch (step) {
    case 0:
      return '/Onboarding/coach/welcome';
    case 1:
      return '/Onboarding/coach/name';
    case 2:
      return '/Onboarding/coach/gender';
    case 3:
      return '/Onboarding/coach/age';
    case 4:
      return '/Onboarding/coach/location';
    case 5:
      return '/Onboarding/coach/skills';
    case 6:
      return '/Onboarding/coach/certifications';
    case 7:
      return '/Onboarding/coach/review';
    default:
      return '/Onboarding/coach/welcome';
  }
}

 /* =========================
   🧑‍🏫 COACH FLOW (FINAL & SAFE)
========================= */
if (profile.role === 'coach') {

  // 🟢 VERIFIED / ACTIVE TRAINER → HOME
  if (profile.status === 'active') {
    router.replace('/Onboarding/coach/TrainerDashboard');
    return;
  }

  // 🟠 SUBMITTED → WAITING VERIFICATION
  if (
    profile.status === 'pending_verification' &&
    profile.onboarding_step === 99 &&
    profile.onboarding_completed === true
  ) {
    router.replace('/Onboarding/coach/verification-pending');
    return;
  }

  // 🟡 ONBOARDING IN PROGRESS → RESUME
  if (!profile.onboarding_completed) {
    router.replace(
      getCoachOnboardingRoute(profile.onboarding_step ?? 0) as any
    );
    return;
  }
  // 🔴 ABSOLUTE SAFETY FALLBACK
  router.replace('/Onboarding/coach/TrainerDashboard');
  return;
}

    };

    resolveRoute();
  }, [session, loading]);

  /* ✅ THIS IS THE FIX */
  return <Stack screenOptions={{ headerShown: false }} />;
}

/* ----------------------------------------
   🧠 ROOT LAYOUT
---------------------------------------- */
export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
