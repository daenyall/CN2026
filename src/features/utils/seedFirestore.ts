// src/features/utils/seedFirestore.ts
// Jednorazowy skrypt do zasilenia Firestore danymi z MOCK_STUDENTS.
// Użycie: zaimportuj `seedStudentsToFirestore` i wywołaj raz (np. z przycisku w DevMenu).

import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { MOCK_STUDENTS } from '../data/MockStudents';

/**
 * Wysyła wszystkich MOCK_STUDENTS do kolekcji "students" w Firestore.
 * Używa `setDoc` z jawnym ID, żeby uniknąć duplikatów przy wielokrotnym uruchomieniu.
 */
export async function seedStudentsToFirestore(): Promise<void> {
  try {
    const studentsRef = collection(db, 'students');

    for (const student of MOCK_STUDENTS) {
      await setDoc(doc(studentsRef, student.id), {
        name: student.name,
        class: student.class,
        age: student.age,
        avatar: student.avatar,
        stats: student.stats,
        testResults: student.testResults,
        currentStreak: student.currentStreak,
        longestStreak: student.longestStreak,
        bonusPoints: student.bonusPoints,
        lastWorkoutDate: student.lastWorkoutDate,
        inSquad: student.inSquad,
      });
    }

    console.log(`✅ Seed zakończony: ${MOCK_STUDENTS.length} uczniów wysłanych do Firestore.`);
  } catch (error) {
    console.error('❌ Błąd przy seedowaniu Firestore:', error);
    throw error;
  }
}
