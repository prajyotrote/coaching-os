import { useAuth } from '@/lib/auth';
import * as health from '@/lib/services/health.service';

export function useHealthActions() {
  const { session } = useAuth();
  const userId = session?.user.id;

  return {
    logWorkout: () => health.logWorkout(userId!),
    logWater: (ml: number) => health.logWater(userId!, ml),
    logMeal: (cal: number) => health.logMeal(userId!, cal),
    logWeight: (kg: number) => health.logWeight(userId!, kg),
  };
}
