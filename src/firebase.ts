import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const loginWithAIC = async (aic: string): Promise<{ isNew: boolean }> => {
  // Create a deterministic email and password from the AIC
  const safeAic = aic.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (safeAic.length < 3) {
    throw new Error("AIC must contain at least 3 letters or numbers.");
  }
  
  const email = `${safeAic}@aic.local`;
  const password = `${safeAic}-secret-password-123`;

  try {
    // Try to sign in first
    await signInWithEmailAndPassword(auth, email, password);
    return { isNew: false };
  } catch (error: any) {
    // If sign in fails, try to create a new account
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return { isNew: true };
    } catch (createError: any) {
      console.error("Error creating AIC account", createError);
      if (createError.code === 'auth/email-already-in-use') {
        throw new Error("Invalid AIC. Please try again.");
      }
      throw new Error(`Login failed: ${createError.message}`);
    }
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};
