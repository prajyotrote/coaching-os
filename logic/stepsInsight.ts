export type Range = 'Day' | 'Week' | 'Month' | '6M';

export interface StepsInsight {
  title: string;
  evidence: string;
  subEvidence?: string;
  meaning: string;
  action?: string | null;
}

export function getStepsInsight(range: Range): StepsInsight {
  switch (range) {
    case 'Day':
      return {
        title: 'More active than your usual day',
        evidence: '+1,240 steps',
        subEvidence: 'vs recent average',
        meaning: 'Your movement today is higher than your normal daily pattern.',
        action: 'A short evening walk would lock this in.',
      };

    case 'Week':
      return {
        title: 'Movement was consistent this week',
        evidence: '5 of 7 days',
        subEvidence: 'above baseline',
        meaning:
          'Consistent daily movement supports long-term cardiovascular health.',
        action: 'One light walk on rest days could raise your average.',
      };

    case 'Month':
      return {
        title: 'Activity level is stable',
        evidence: '215,400 steps',
        subEvidence: 'this month',
        meaning:
          'Your movement volume is being maintained rather than increasing.',
        action: null,
      };

    case '6M':
      return {
        title: 'A long-term habit has formed',
        evidence: '4 months steady',
        subEvidence: 'without major drop-offs',
        meaning:
          'This reflects a stable and sustainable activity pattern.',
        action: 'Raising your daily goal slightly could restart progress.',
      };

    default:
      return {
        title: '',
        evidence: '',
        meaning: '',
        action: null,
      };
  }
}
