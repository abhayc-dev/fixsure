import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_APIKEY,
  authDomain: "fixsure-1ff35.firebaseapp.com",
  projectId: "fixsure-1ff35",
  storageBucket: "fixsure-1ff35.firebasestorage.app",
  messagingSenderId: "400145967239",
  appId: "1:400145967239:web:9408cac822c5b72269f022",
  measurementId: "G-GW6R3C3EMN"
};

// Initialize Firebase only if API key is present
const app = (process.env.NEXT_PUBLIC_FIREBASE_APIKEY && process.env.NEXT_PUBLIC_FIREBASE_APIKEY !== "undefined")
  ? (getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0])
  : null;

export const auth = app ? getAuth(app) : ({} as any);
export const googleProvider = new GoogleAuthProvider();
