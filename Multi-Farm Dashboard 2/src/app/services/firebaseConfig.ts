import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD13lHbPzw6khkZfppYGYXklOY0p0zyil0",
  authDomain: "bhoomi-dashboard.firebaseapp.com",
  projectId: "bhoomi-dashboard",
  storageBucket: "bhoomi-dashboard.firebasestorage.app",
  messagingSenderId: "904330819567",
  appId: "1:904330819567:web:e64eb9a52e2b02fb95281a",
  measurementId: "G-ZL93CG4ZYH"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);