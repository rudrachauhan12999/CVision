import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore
// If a specific custom database ID is specified in config, use it
const configObj = firebaseConfig as Record<string, string | undefined>;
export const db = configObj.firestoreDatabaseId && configObj.firestoreDatabaseId !== "(default)"
  ? getFirestore(app, configObj.firestoreDatabaseId)
  : getFirestore(app);

// Initialize Storage
export const storage = getStorage(app);

// Helper to set auth persistence based on "Remember Me"
export const setAuthRememberMe = async (remember: boolean) => {
  try {
    const persistence = remember ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, persistence);
  } catch (err) {
    console.error("Error setting auth persistence:", err);
  }
};

export default app;
