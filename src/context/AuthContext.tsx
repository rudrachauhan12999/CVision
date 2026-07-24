import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db, setAuthRememberMe } from "../lib/firebase";
import { UserProfile } from "../types";

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (fullName: string, email: string, password: string, company?: string, role?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Sync user profile document from Firestore
  const fetchUserProfile = async (uid: string) => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userSnapshot = await getDoc(userDocRef);
      if (userSnapshot.exists()) {
        const data = userSnapshot.data();
        setUserProfile({
          uid: data.uid || uid,
          fullName: data.fullName || data.displayName || "Recruiter",
          displayName: data.displayName || data.fullName || "Recruiter",
          email: data.email || auth.currentUser?.email || "",
          company: data.company || "Talent Org",
          role: data.role || "recruiter",
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt
        });
      } else {
        // Create initial profile if absent
        const name = auth.currentUser?.displayName || "Recruiter";
        const newProfile: UserProfile = {
          uid,
          fullName: name,
          displayName: name,
          email: auth.currentUser?.email || "",
          company: "Talent Org",
          role: "recruiter",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(userDocRef, newProfile);
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserProfile(user.uid);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string, rememberMe = true) => {
    await setAuthRememberMe(rememberMe);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (userCredential.user) {
      await fetchUserProfile(userCredential.user.uid);
    }
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    company = "Talent Acquisition",
    role = "recruiter"
  ) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update Firebase Auth profile
    await updateProfile(user, { displayName: fullName });

    // Store in Firestore users collection
    const userDocRef = doc(db, "users", user.uid);
    const profileData: UserProfile = {
      uid: user.uid,
      fullName: fullName,
      displayName: fullName,
      email: user.email || email,
      company: company || "Talent Acquisition",
      role: role || "recruiter",
      createdAt: new Date().toISOString()
    };
    await setDoc(userDocRef, profileData);
    setUserProfile(profileData);
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const userDocRef = doc(db, "users", currentUser.uid);
    const updated = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    await updateDoc(userDocRef, updated);
    if (data.displayName && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: data.displayName });
    }
    setUserProfile((prev) => (prev ? { ...prev, ...updated } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        login,
        register,
        logout,
        resetPassword,
        updateProfileData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
