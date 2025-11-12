import {
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  updateProfile,
  //updatePhoneNumber,
  User
} from 'firebase/auth';
import { auth } from '../config/firebase';

const googleProvider = new GoogleAuthProvider();


// Google AUTHENTICATION
export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};



// ---- EMAIL / PASSWORD AUTH ----
export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing up with email:', error);
    throw error;
  }
};

// SIGN IN WITH EMAIL
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error signing in with email:', error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// ---- PHONE AUTH ----
export const setUpRecaptcha = (elementId: string) => {
  // Use visible reCAPTCHA to bypass throttling and improve reliability
  // The visible widget tells Firebase that requests are legitimate
  const verifier = new RecaptchaVerifier(auth, elementId, {
    size: 'normal', // Visible widget - helps bypass throttling 'invisible'
    callback: () => {
      // reCAPTCHA solved - ready for phone authentication
      console.log('reCAPTCHA verified');
    },
    'expired-callback': () => {
      // reCAPTCHA expired - user needs to solve it again
      console.warn('reCAPTCHA expired');
    },
    'error-callback': (error: any) => {
      // Error loading reCAPTCHA
      console.error('reCAPTCHA error:', error);
    }
  });
  return verifier;
};

// Cleanup function to dispose of reCAPTCHA verifier
export const clearRecaptcha = (verifier: RecaptchaVerifier | null) => {
  if (verifier) {
    try {
      verifier.clear();
    } catch (error) {
      console.warn('Error clearing reCAPTCHA:', error);
    }
  }
};

export const signInWithPhone = async (phoneNumber: string, appVerifier: RecaptchaVerifier) => {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
    return confirmationResult;
  } catch (error) {
    console.error('Error signing in with phone:', error);
    throw error;
  }
};

// ---- USER PROFILE MANAGEMENT ----
export const updateUserProfile = async (displayName: string) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    await updateProfile(user, {
      displayName: displayName
    });

    return user;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};


// SIGN OUT
export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};


export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};