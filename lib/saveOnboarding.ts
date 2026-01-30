import { supabase } from '@/lib/supabase';

export async function saveOnboardingStep(
  data: Partial<{
    name: string;
    gender: 'male' | 'female';
    dob: string;
    height_cm: number;
    weight_kg: number;
    health_conditions: string[];
    smokes: boolean;
    drinks: boolean;
    activity_level: string;
    bmr: number;
    bmi: number;
    health_score: number;
  }>,
  step?: number
) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('No user');

  await supabase
    .from('user_onboarding')
    .upsert({
      user_id: user.id,
      ...data,
    });

  if (step !== undefined) {
    await supabase
      .from('profiles')
      .update({ onboarding_step: step })
      .eq('id', user.id);
  }
}
