// src/features/utils/seedFirestore.ts
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { MOCK_STUDENTS } from '../data/MockStudents';


// Autentyczne szkoły z Nowego Sącza
const NOWY_SACZ_SCHOOLS = [
  { id: 'sp2_ns', name: 'Szkoła Podstawowa nr 2 w Nowym Sączu', address: 'ul. Jagiellońska 32, Nowy Sącz' },
  { id: 'sp3_ns', name: 'Szkoła Podstawowa nr 3 w Nowym Sączu', address: 'ul. Szkolna 7, Nowy Sącz' },
  { id: '1lo_ns', name: 'I Liceum Ogólnokształcące w Nowym Sączu', address: 'ul. Jana Długosza 5, Nowy Sącz' },
  { id: 'zsem_ns', name: 'Zespół Szkół Elektryczno-Mechanicznych', address: 'ul. Bolesława Limanowskiego 4, Nowy Sącz' },
  { id: 'sp21_ns', name: 'Szkoła Podstawowa nr 21 w Nowym Sączu', address: 'ul. Rokitniańczyków 26, Nowy Sącz' }
];


/**
 * Wysyła szkoły oraz MOCK_STUDENTS do Firestore.
 * Używa `setDoc` z jawnym ID, żeby uniknąć duplikatów przy wielokrotnym uruchomieniu.
 */
export async function seedFirestore(): Promise<void> {
  try {
    console.log('⏳ Rozpoczynam tworzenie bazy danych dla Nowego Sącza...');

    // 1. ZAPISUJEMY SZKOŁY W BAZIE
    const schoolsRef = collection(db, 'schools');
    for (const school of NOWY_SACZ_SCHOOLS) {
      // Używamy nazwy szkoły jako ID dokumentu (to ułatwia odniesienia)
      await setDoc(doc(schoolsRef, school.name), {
        name: school.name,
        address: school.address,
        createdAt: new Date().toISOString()
      });
    }
    console.log(`✅ Zapisano ${NOWY_SACZ_SCHOOLS.length} sądeckich szkół do kolekcji 'schools'.`);

    // 2. ZAPISUJEMY UCZNIÓW I PRZYPISUJEMY IM SZKOŁY
    const studentsRef = collection(db, 'students');

    // Funkcja do losowania szkoły dla reszty uczniów
    const getRandomSchool = () => NOWY_SACZ_SCHOOLS[Math.floor(Math.random() * NOWY_SACZ_SCHOOLS.length)].name;

    for (let i = 0; i < MOCK_STUDENTS.length; i++) {
      const student = MOCK_STUDENTS[i];

      // USTALAMY SZKOŁĘ: Pierwszych 5 uczniów celowo wrzucamy do SP2, żebyś miał pełną klasę do testowania.
      // Resztę uczniów rozrzucamy losowo po innych szkołach.
      const assignedSchool = i < 5 ? NOWY_SACZ_SCHOOLS[0].name : getRandomSchool();

      await setDoc(doc(studentsRef, student.id), {
        name: student.name,
        class: student.class || '6A',
        age: student.age || 12,
        avatar: student.avatar || '',
        stats: student.stats || {},
        testResults: student.testResults || [],
        currentStreak: student.currentStreak || 0,
        longestStreak: student.longestStreak || 0,
        overall: student.overall || 0, // Zabezpieczamy ogólny wynik
        bonusPoints: student.bonusPoints || 0,
        lastWorkoutDate: student.lastWorkoutDate || new Date().toISOString(),
        inSquad: student.inSquad || false,
        school: assignedSchool, // <--- KLUCZ: Uczeń wie, do jakiej szkoły należy!
      });
    }

    console.log(`✅ Seed zakończony: ${MOCK_STUDENTS.length} uczniów zasilonych w Firestore.`);
    alert("Baza danych została zaktualizowana!");
  } catch (error) {
    console.error('❌ Błąd przy seedowaniu Firestore:', error);
    alert("Błąd seedowania bazy!");
  }
}