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
    const verifier = new RecaptchaVerifier(auth, elementId, {
      size: 'invisible', // or 'normal' if you want a visible widget
    });
    return verifier;
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

  // Check if user needs to complete registration
  export const checkUserRegistrationStatus = async (user: User): Promise<boolean> => {
    try {
      // Check if user has phone number and displayName
      // You can also check against a backend database here
      return !!(user.displayName && user.phoneNumber);
    } catch (error) {
      console.error('Error checking user registration status:', error);
      return false;
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