import type { Athlete } from '../data/MockStudents';

export interface SubmittedExercise {
  exerciseId: string;
  name: string;
  unit: string;
  sets: { value: number; weightValue: number }[];
  bestValue: number;
}

export interface MedalRule {
  id: string;
  name: string;
  description: string;
  iconName: string;
  rankRewardId?: number;
  evaluate: (testResults: SubmittedExercise[], studentProfile: Athlete) => boolean;
}

export const ACHIEVEMENTS: MedalRule[] = [
  {
    id: 'bench_bodyweight',
    name: 'Siła Absolutna',
    description: 'Wycisnąłeś własną masę ciała na ławce.',
    iconName: 'Trophy',
    rankRewardId: 20,
    evaluate: (testResults, studentProfile) => {
      if (!studentProfile.weight) return false;
      const benchResult = testResults.find(ex => ex.exerciseId === 'bench');
      if (!benchResult) return false;
      return benchResult.bestValue >= studentProfile.weight;
    },
  },
];

export const evaluateAchievements = (
  testResults: SubmittedExercise[],
  student: Athlete,
): { newMedals: string[]; highestRankReward: number | null } => {
  const newMedals: string[] = [];
  let highestRankReward: number | null = null;

  for (const rule of ACHIEVEMENTS) {
    if (student.earnedMedals.includes(rule.id)) continue;

    if (rule.evaluate(testResults, student)) {
      newMedals.push(rule.id);
      if (rule.rankRewardId != null) {
        if (highestRankReward === null || rule.rankRewardId > highestRankReward) {
          highestRankReward = rule.rankRewardId;
        }
      }
    }
  }

  return { newMedals, highestRankReward };
};