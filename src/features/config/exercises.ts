export interface ExerciseDefinition {
  id: string;
  name: string;
  emoji: string;
  unit: string;
  type: 'single' | 'weight_reps';
  average: number;
  scoring: 'higher' | 'lower';
}

export const EXERCISES: ExerciseDefinition[] = [
  { id: 'plank', name: 'Plank', emoji: '🧘', unit: 's', type: 'single', average: 90, scoring: 'higher' },
  { id: 'run100', name: 'Bieg 100m', emoji: '🏃', unit: 's', type: 'single', average: 15.2, scoring: 'lower' },
  { id: 'jump', name: 'Skok w dal', emoji: '📏', unit: 'cm', type: 'single', average: 165, scoring: 'higher' },
  { id: 'pushups', name: 'Pompki', emoji: '💪', unit: 'powt.', type: 'single', average: 25, scoring: 'higher' },
  { id: 'pullups', name: 'Podciąganie', emoji: '🧗', unit: 'powt.', type: 'single', average: 5, scoring: 'higher' },
  { id: 'situps', name: 'Brzuszki', emoji: '🤸', unit: 'powt.', type: 'single', average: 35, scoring: 'higher' },
  { id: 'run1000', name: 'Bieg na 1000m', emoji: '🏃‍♂️', unit: 's', type: 'single', average: 270, scoring: 'lower' },
  { id: 'squats', name: 'Przysiady', emoji: '🏋️', unit: 'kg', type: 'weight_reps', average: 60, scoring: 'higher' },
  { id: 'bench', name: 'Wyciskanie leżąc', emoji: '🏋️‍♂️', unit: 'kg', type: 'weight_reps', average: 50, scoring: 'higher' },
  { id: 'deadlift', name: 'Martwy ciąg', emoji: '🏗️', unit: 'kg', type: 'weight_reps', average: 70, scoring: 'higher' },
];
