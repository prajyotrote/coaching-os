type SleepHistoryItem = {
  date: string;
  bedtime?: string | null;
};

function bedtimeToMinutes(iso: string) {
  const d = new Date(iso);
  return d.getHours() * 60 + d.getMinutes();
}

export function calculateBedtimeVariance(
  data: SleepHistoryItem[]
): number {
  const bedtimes = data
    .map(d => d.bedtime)
    .filter(Boolean) as string[];

  if (bedtimes.length < 2) return 0;

  const minutes = bedtimes.map(bedtimeToMinutes);

  const avg =
    minutes.reduce((a, b) => a + b, 0) / minutes.length;

  const deviations = minutes.map(m =>
    Math.abs(m - avg)
  );

  const variance =
    deviations.reduce((a, b) => a + b, 0) /
    deviations.length;

  return Math.round(variance);
}
export function sleepConsistencyInsight(variance: number) {
  if (variance <= 20) {
    return {
      label: 'Excellent',
      title: 'Your sleep was very consistent',
      color: '#818CF8',
    };
  }

  if (variance <= 40) {
    return {
      label: 'Good',
      title: 'Your sleep was mostly consistent',
      color: '#60A5FA',
    };
  }

  if (variance <= 60) {
    return {
      label: 'Fair',
      title: 'Your sleep timing varied',
      color: '#F59E0B',
    };
  }

  return {
    label: 'Poor',
    title: 'Irregular sleep timing detected',
    color: '#EF4444',
  };
}
