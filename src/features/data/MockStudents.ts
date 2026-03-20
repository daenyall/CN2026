export interface Student {
  id: string;
  name: string;
  class: string;
  age: number;
  avatar: string;
  stats: {
    speed: number;      // 0-100
    strength: number;
    stamina: number;
    jump: number;
    agility: number;
  };
  testResults: {
    date: string;
    plank: number;      // sekundy
    sprint: number;     // sekundy (im mniej tym lepiej, ale do anomalii możemy liczyć punkty)
    longJump: number;   // cm
  }[];
  currentStreak: number;
  longestStreak: number;
  bonusPoints: number;
  lastWorkoutDate: string;
  inSquad: boolean;
}

export const MOCK_STUDENTS: Student[] = [
  {
    id: '1', name: 'Jakub Kowalski', class: '6A', age: 12,
    avatar: 'https://ui-avatars.com/api/?name=Jakub+Kowalski&background=00E676&color=fff',
    stats: { speed: 85, strength: 60, stamina: 75, jump: 70, agility: 80 },
    testResults: [{ date: '2026-03-15', plank: 120, sprint: 14.2, longJump: 320 }],
    currentStreak: 5, longestStreak: 12, bonusPoints: 150, lastWorkoutDate: '2026-03-20', inSquad: true
  },
  {
    id: '2', name: 'Anna Nowak', class: '6A', age: 12,
    avatar: 'https://ui-avatars.com/api/?name=Anna+Nowak&background=0A0E1A&color=00E676',
    stats: { speed: 65, strength: 40, stamina: 90, jump: 55, agility: 85 },
    testResults: [{ date: '2026-03-10', plank: 180, sprint: 15.1, longJump: 280 }],
    currentStreak: 14, longestStreak: 14, bonusPoints: 340, lastWorkoutDate: '2026-03-21', inSquad: true
  },
  {
    id: '3', name: 'Michał Wiśniewski', class: '6B', age: 13,
    avatar: 'https://ui-avatars.com/api/?name=Michal+Wisniewski&background=random&color=fff',
    stats: { speed: 95, strength: 70, stamina: 60, jump: 85, agility: 90 },
    testResults: [{ date: '2026-03-05', plank: 90, sprint: 12.8, longJump: 410 }],
    currentStreak: 2, longestStreak: 5, bonusPoints: 40, lastWorkoutDate: '2026-03-19', inSquad: false
  },
  {
    id: '4', name: 'Zofia Wójcik', class: '7A', age: 14,
    avatar: 'https://ui-avatars.com/api/?name=Zofia+Wojcik&background=random&color=fff',
    stats: { speed: 50, strength: 85, stamina: 80, jump: 60, agility: 45 },
    testResults: [{ date: '2026-03-18', plank: 150, sprint: 16.5, longJump: 250 }],
    currentStreak: 8, longestStreak: 20, bonusPoints: 210, lastWorkoutDate: '2026-03-20', inSquad: true
  },
  {
    id: '5', name: 'Kacper Kamiński', class: '6B', age: 12,
    avatar: 'https://ui-avatars.com/api/?name=Kacper+Kaminski&background=random&color=fff',
    stats: { speed: 70, strength: 75, stamina: 70, jump: 75, agility: 70 },
    testResults: [{ date: '2026-03-12', plank: 110, sprint: 14.8, longJump: 340 }],
    currentStreak: 0, longestStreak: 7, bonusPoints: 0, lastWorkoutDate: '2026-03-10', inSquad: false
  },
  {
    id: '6', name: 'Julia Lewandowski', class: '7A', age: 13,
    avatar: 'https://ui-avatars.com/api/?name=Julia+Lewandowski&background=random&color=fff',
    stats: { speed: 88, strength: 55, stamina: 85, jump: 65, agility: 95 },
    testResults: [{ date: '2026-03-01', plank: 140, sprint: 13.9, longJump: 310 }],
    currentStreak: 32, longestStreak: 32, bonusPoints: 850, lastWorkoutDate: '2026-03-21', inSquad: true
  },
  {
    id: '7', name: 'Szymon Zieliński', class: '6A', age: 12,
    avatar: 'https://ui-avatars.com/api/?name=Szymon+Zielinski&background=random&color=fff',
    stats: { speed: 60, strength: 90, stamina: 50, jump: 80, agility: 55 },
    testResults: [{ date: '2026-03-16', plank: 80, sprint: 15.5, longJump: 380 }],
    currentStreak: 1, longestStreak: 3, bonusPoints: 10, lastWorkoutDate: '2026-03-21', inSquad: false
  },
  {
    id: '8', name: 'Maja Szymańska', class: '7A', age: 14,
    avatar: 'https://ui-avatars.com/api/?name=Maja+Szymanska&background=random&color=fff',
    stats: { speed: 75, strength: 65, stamina: 95, jump: 70, agility: 75 },
    testResults: [{ date: '2026-03-20', plank: 210, sprint: 14.5, longJump: 300 }],
    currentStreak: 21, longestStreak: 25, bonusPoints: 450, lastWorkoutDate: '2026-03-20', inSquad: true
  },
  {
    id: '9', name: 'Bartosz Woźniak', class: '6B', age: 13,
    avatar: 'https://ui-avatars.com/api/?name=Bartosz+Wozniak&background=random&color=fff',
    stats: { speed: 40, strength: 50, stamina: 45, jump: 50, agility: 40 },
    testResults: [{ date: '2026-03-08', plank: 45, sprint: 17.2, longJump: 210 }],
    currentStreak: 0, longestStreak: 1, bonusPoints: 0, lastWorkoutDate: '2026-02-28', inSquad: false
  },
  {
    id: '10', name: 'Oliwia Dąbrowska', class: '6A', age: 12,
    avatar: 'https://ui-avatars.com/api/?name=Oliwia+Dabrowska&background=random&color=fff',
    stats: { speed: 82, strength: 70, stamina: 78, jump: 88, agility: 82 },
    testResults: [{ date: '2026-03-19', plank: 135, sprint: 13.5, longJump: 400 }],
    currentStreak: 6, longestStreak: 10, bonusPoints: 80, lastWorkoutDate: '2026-03-19', inSquad: true
  }
];