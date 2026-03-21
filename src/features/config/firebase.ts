import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // <-- TO JEST KLUCZOWE

// Twoje klucze z Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDimCZVZcMJ8r1XDE8FEEvfx4AjlyKCJDM",
  authDomain: "cn2026-aa576.firebaseapp.com",
  projectId: "cn2026-aa576",
  storageBucket: "cn2026-aa576.firebasestorage.app",
  messagingSenderId: "965568993537",
  appId: "1:965568993537:web:c500298b8d6c6288862300",
  measurementId: "G-QSN9F971NP"
};

// 1. Inicjalizacja głównej aplikacji Firebase
const app = initializeApp(firebaseConfig);

// 2. Inicjalizacja bazy danych i jej EKSPORT (Tego brakowało!)
export const db = getFirestore(app);