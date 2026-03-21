import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

// Twoje klucze z Firebase
const fConfig = {
  apiKey: "AIzaSyDimCZVZcMJ8r1XDE8FEEvfx4AjlyKCJDM",
  authDomain: "cn2026-aa576.firebaseapp.com",
  projectId: "cn2026-aa576",
  storageBucket: "cn2026-aa576.firebasestorage.app",
  messagingSenderId: "965568993537",
  appId: "1:965568993537:web:c500298b8d6c6288862300",
  measurementId: "G-QSN9F971NP"
};

// 1. Inicjalizacja głównej aplikacji Firebase
const app = initializeApp(fConfig);

// 2. Inicjalizacja bazy danych i jej EKSPORT
export const db = getFirestore(app);

// 3. Inicjalizacja Auth z persistencją dla React Native
// @ts-ignore - Wyłączamy błąd typowania dla getReactNativePersistence, który jest wymagany przez Expo
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});
