import { supabase } from '@/lib/supabase';

export type OnboardingStep =
  | 1 // name
  | 2 // gender
  | 3 // age
  | 4 // height
  | 5 // weight
  | 6 // activity
  | 7 // health
  | 99; // completed

interface SaveOnboardingParams {
  step: OnboardingStep;
  data?: Record<string, any>;
  complete?: boolean;
}

export async function saveOnboardingStep({
  step,
  data = {},
  complete = false,
}: SaveOnboardingParams) {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // 1️⃣ Save onboarding data
  if (Object.keys(data).length > 0) {
    const { error } = await supabase
      .from('user_onboarding')
      .upsert({
        user_id: user.id,
        ...data,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Onboarding save failed', error);
      throw error;
    }
  }

  // 2️⃣ Update profile state
  const profileUpdate: any = {
    onboarding_step: step,
  };

  if (complete) {
    profileUpdate.onboarding_completed = true;
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update(profileUpdate)
    .eq('id', user.id);

  if (profileError) {
    console.error('Profile update failed', profileError);
    throw profileError;
  }
}
