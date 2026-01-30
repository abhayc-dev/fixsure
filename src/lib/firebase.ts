import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
  authDomain: "fixsure-app.firebaseapp.com",
  projectId: "fixsure-app",
  storageBucket: "fixsure-app.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef1234"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
