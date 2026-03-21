export interface Exercise {
  id: string;
  name: string;
  date: string; // ISO String
  score: number;
}

export interface Achievement {
  id: string;
  title: string;
  date: string; // ISO String
  icon: string;
}

export interface TestResult {
  date: string; // ISO String
  plank: number;      // sekundy
  sprint: number;     // sekundy
  longJump: number;   // cm
}

export interface Athlete {
  id: string;
  name: string;
  class: string;
  age: number;
  gender: 'male' | 'female';
  weight: number;     // in kg
  height: number;     // in cm
  birthDate: string;  // ISO String
  avatar: string;
  overall: number;
  inSquad: boolean;
  stats: {
    speed: number;
    strength: number;
    stamina: number;
    jump: number;
    agility: number;
  };
  currentStreak: number;
  longestStreak: number;
  lastWorkoutDate: string; // ISO String
  bonusPoints: number;
  recentExercises: Exercise[];
  recentAchievements: Achievement[];
  testResults: TestResult[];
  weightHistory: { date: string; weight: number }[];
  
  // NOWE POLA DO SYSTEMU RANG I MEDALI
  rankId: number;
  earnedMedals: string[];
}

export const MOCK_STUDENTS: Athlete[] = [
  {
    id: '1', 
    name: 'Jakub Kowalski', 
    class: '6A', 
    age: 12,
    gender: 'male',
    weight: 48.5,
    height: 152,
    birthDate: '2014-05-12T00:00:00.000Z',
    weightHistory: [
      { date: '2025-10-01T10:00:00.000Z', weight: 46.5 },
      { date: '2025-11-01T10:00:00.000Z', weight: 47.0 },
      { date: '2025-12-01T10:00:00.000Z', weight: 47.5 },
      { date: '2026-01-01T10:00:00.000Z', weight: 48.0 },
      { date: '2026-02-01T10:00:00.000Z', weight: 48.2 },
      { date: '2026-03-01T10:00:00.000Z', weight: 48.5 },
    ],
    avatar: 'https://ui-avatars.com/api/?name=Jakub+Kowalski&background=00E676&color=fff',
    overall: 74,
    inSquad: true,
    stats: { speed: 85, strength: 60, stamina: 75, jump: 70, agility: 80 },
    currentStreak: 5, 
    longestStreak: 12, 
    bonusPoints: 150, 
    lastWorkoutDate: new Date(Date.now() - 1 * 86400000).toISOString(),
    recentExercises: [
      { id: 'e1', name: 'Bieg na 60m', date: new Date(Date.now() - 1 * 86400000).toISOString(), score: 95 },
      { id: 'e2', name: 'Skok w dal', date: new Date(Date.now() - 2 * 86400000).toISOString(), score: 82 },
      { id: 'e3', name: 'Pompki', date: new Date(Date.now() - 3 * 86400000).toISOString(), score: 78 },
    ],
    recentAchievements: [
      { id: 'a1', title: 'Mistrz Szybkości', date: new Date(Date.now() - 1 * 86400000).toISOString(), icon: '⚡' },
      { id: 'a4', title: 'Tydzień Treningu', date: new Date(Date.now() - 15 * 86400000).toISOString(), icon: '🔥' },
    ],
    testResults: [{ date: '2026-03-15T10:00:00.000Z', plank: 120, sprint: 14.2, longJump: 320 }],
    rankId: 0,
    earnedMedals: [],
  },
  {
    id: '2', 
    name: 'Anna Nowak', 
    class: '6A', 
    age: 12,
    gender: 'female',
    weight: 42.0,
    height: 148,
    birthDate: '2014-08-20T00:00:00.000Z',
    weightHistory: [{ date: '2026-02-01T10:00:00.000Z', weight: 42.0 }],
    avatar: 'default.png', 
    overall: 67,
    inSquad: true,
    stats: { speed: 65, strength: 40, stamina: 90, jump: 55, agility: 85 },
    currentStreak: 14, 
    longestStreak: 14, 
    bonusPoints: 340, 
    lastWorkoutDate: new Date(Date.now() - 2 * 86400000).toISOString(),
    recentExercises: [],
    recentAchievements: [],
    testResults: [{ date: '2026-03-10T10:00:00.000Z', plank: 180, sprint: 15.1, longJump: 280 }],
    rankId: 0,
    earnedMedals: [],
  },
  {
    id: '3', name: 'Michał Wiśniewski', class: '6B', age: 13,
    gender: 'male', weight: 52.0, height: 160, birthDate: '2013-03-11T00:00:00.000Z',
    weightHistory: [{ date: '2026-02-01T10:00:00.000Z', weight: 52.0 }],
    avatar: 'https://ui-avatars.com/api/?name=Michal+Wisniewski&background=random&color=fff',
    overall: 80, inSquad: false,
    stats: { speed: 95, strength: 70, stamina: 60, jump: 85, agility: 90 },
    currentStreak: 2, longestStreak: 5, bonusPoints: 40, lastWorkoutDate: '2026-03-19T10:00:00.000Z',
    recentExercises: [], recentAchievements: [],
    testResults: [{ date: '2026-03-05T10:00:00.000Z', plank: 90, sprint: 12.8, longJump: 410 }],
    rankId: 0,
    earnedMedals: [],
  },
  {
    id: '4', name: 'Zofia Wójcik', class: '7A', age: 14,
    gender: 'female', weight: 55.0, height: 165, birthDate: '2012-07-05T00:00:00.000Z',
    weightHistory: [{ date: '2026-02-01T10:00:00.000Z', weight: 55.0 }],
    avatar: 'https://ui-avatars.com/api/?name=Zofia+Wojcik&background=random&color=fff',
    overall: 64, inSquad: true,
    stats: { speed: 50, strength: 85, stamina: 80, jump: 60, agility: 45 },
    currentStreak: 8, longestStreak: 20, bonusPoints: 210, lastWorkoutDate: '2026-03-20T10:00:00.000Z',
    recentExercises: [], recentAchievements: [],
    testResults: [{ date: '2026-03-18T10:00:00.000Z', plank: 150, sprint: 16.5, longJump: 250 }],
    rankId: 0,
    earnedMedals: [],
  },
  {
    id: '5', name: 'Kacper Kamiński', class: '6B', age: 12,
    gender: 'male', weight: 65.0, height: 150, birthDate: '2014-01-15T00:00:00.000Z',
    weightHistory: [{ date: '2026-02-01T10:00:00.000Z', weight: 65.0 }],
    avatar: 'https://ui-avatars.com/api/?name=Kacper+Kaminski&background=random&color=fff',
    overall: 72, inSquad: false,
    stats: { speed: 70, strength: 75, stamina: 70, jump: 75, agility: 70 },
    currentStreak: 0, longestStreak: 7, bonusPoints: 0, lastWorkoutDate: '2026-03-10T10:00:00.000Z',
    recentExercises: [], recentAchievements: [],
    testResults: [{ date: '2026-03-12T10:00:00.000Z', plank: 110, sprint: 14.8, longJump: 340 }],
    rankId: 0,
    earnedMedals: [],
  },
  {
    id: '6', name: 'Julia Lewandowski', class: '7A', age: 13,
    gender: 'female', weight: 49.0, height: 158, birthDate: '2013-11-20T00:00:00.000Z',
    weightHistory: [{ date: '2026-02-01T10:00:00.000Z', weight: 49.0 }],
    avatar: 'https://ui-avatars.com/api/?name=Julia+Lewandowski&background=random&color=fff',
    overall: 78, inSquad: true,
    stats: { speed: 88, strength: 55, stamina: 85, jump: 65, agility: 95 },
    currentStreak: 32, longestStreak: 32, bonusPoints: 850, lastWorkoutDate: '2026-03-21T10:00:00.000Z',
    recentExercises: [], recentAchievements: [],
    testResults: [{ date: '2026-03-01T10:00:00.000Z', plank: 140, sprint: 13.9, longJump: 310 }],
    rankId: 0,
    earnedMedals: [],
  },
  {
    id: '7', name: 'Szymon Zieliński', class: '6A', age: 12,
    gender: 'male', weight: 45.0, height: 145, birthDate: '2014-04-10T00:00:00.000Z',
    weightHistory: [{ date: '2026-02-01T10:00:00.000Z', weight: 45.0 }],
    avatar: 'https://ui-avatars.com/api/?name=Szymon+Zielinski&background=random&color=fff',
    overall: 67, inSquad: false,
    stats: { speed: 60, strength: 90, stamina: 50, jump: 80, agility: 55 },
    currentStreak: 1, longestStreak: 3, bonusPoints: 10, lastWorkoutDate: '2026-03-21T10:00:00.000Z',
    recentExercises: [], recentAchievements: [],
    testResults: [{ date: '2026-03-16T10:00:00.000Z', plank: 80, sprint: 15.5, longJump: 380 }],
    rankId: 0,
    earnedMedals: [],
  },
  {
    id: '8', name: 'Maja Szymańska', class: '7A', age: 14,
    gender: 'female', weight: 58.0, height: 168, birthDate: '2012-09-02T00:00:00.000Z',
    weightHistory: [{ date: '2026-02-01T10:00:00.000Z', weight: 58.0 }],
    avatar: 'https://ui-avatars.com/api/?name=Maja+Szymanska&background=random&color=fff',
    overall: 76, inSquad: true,
    stats: { speed: 75, strength: 65, stamina: 95, jump: 70, agility: 75 },
    currentStreak: 21, longestStreak: 25, bonusPoints: 450, lastWorkoutDate: '2026-03-20T10:00:00.000Z',
    recentExercises: [], recentAchievements: [],
    testResults: [{ date: '2026-03-20T10:00:00.000Z', plank: 210, sprint: 14.5, longJump: 300 }],
    rankId: 0,
    earnedMedals: [],
  },
  {
    id: '9', name: 'Bartosz Woźniak', class: '6B', age: 13,
    gender: 'male', weight: 40.0, height: 155, birthDate: '2013-12-12T00:00:00.000Z',
    weightHistory: [{ date: '2026-02-01T10:00:00.000Z', weight: 40.0 }],
    avatar: 'https://ui-avatars.com/api/?name=Bartosz+Wozniak&background=random&color=fff',
    overall: 45, inSquad: false,
    stats: { speed: 40, strength: 50, stamina: 45, jump: 50, agility: 40 },
    currentStreak: 0, longestStreak: 1, bonusPoints: 0, lastWorkoutDate: '2026-02-28T10:00:00.000Z',
    recentExercises: [], recentAchievements: [],
    testResults: [{ date: '2026-03-08T10:00:00.000Z', plank: 45, sprint: 17.2, longJump: 210 }],
    rankId: 0,
    earnedMedals: [],
  },
  {
    id: '10', name: 'Oliwia Dąbrowska', class: '6A', age: 12,
    gender: 'female', weight: 44.0, height: 150, birthDate: '2014-06-30T00:00:00.000Z',
    weightHistory: [{ date: '2026-02-01T10:00:00.000Z', weight: 44.0 }],
    avatar: 'https://ui-avatars.com/api/?name=Oliwia+Dabrowska&background=random&color=fff',
    overall: 80, inSquad: true,
    stats: { speed: 82, strength: 70, stamina: 78, jump: 88, agility: 82 },
    currentStreak: 6, longestStreak: 10, bonusPoints: 80, lastWorkoutDate: '2026-03-19T10:00:00.000Z',
    recentExercises: [], recentAchievements: [],
    testResults: [{ date: '2026-03-19T10:00:00.000Z', plank: 135, sprint: 13.5, longJump: 400 }],
    rankId: 0,
    earnedMedals: [],
  }
];