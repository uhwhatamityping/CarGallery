import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    await signInWithPopup(auth, provider);
  } catch (error: any) {
    console.error("Error signing in with Google", error);
    alert(`Login failed: ${error.message}\n\nIf you are on Netlify, make sure to add your Netlify domain to Firebase Auth Authorized Domains!`);
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};
