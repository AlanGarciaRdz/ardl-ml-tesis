import { doc, setDoc, getDoc, updateDoc, serverTimestamp, Timestamp, enableNetwork, waitForPendingWrites } from 'firebase/firestore';
import { db } from '../config/firebase';
import { User } from 'firebase/auth';

export interface UserData {
  uid: string;
  nombre: string;
  celular: string;
  empresa: string;
  tipoEmpresa: string;
  puesto: string;
  codigoPostal: string;
  phoneVerified: boolean;
  registrationComplete: boolean;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

// Save user registration data to Firestore
export const saveUserData = async (user: User, userData: Partial<UserData>): Promise<void> => {
  try {
    // Ensure network is enabled
    await enableNetwork(db);

    const userRef = doc(db, 'users', user.uid);

    // Remove Date objects and let Firestore handle timestamps
    const { createdAt, updatedAt, ...cleanData } = userData;

    const userDoc: any = {
      uid: user.uid,
      email: user.email || '',
      ...cleanData,
      updatedAt: serverTimestamp(),
    };

    // Only add createdAt if it's a new document (first time saving)
    try {
      const existingDoc = await getDoc(userRef);
      if (!existingDoc.exists()) {
        userDoc.createdAt = serverTimestamp();
      }
    } catch (checkError) {
      // If check fails, assume it's new and add createdAt
      userDoc.createdAt = serverTimestamp();
    }

    await setDoc(userRef, userDoc, { merge: true });
    // Wait for pending writes to complete
    await waitForPendingWrites(db);
  } catch (error) {
    console.error('Error saving user data:', error);
    throw error;
  }
};

export const getUserData = async (user: User): Promise<UserData | null> => {
  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    return null;
  } catch (error: any) {
    console.error('Error getting user data:', error);

    // Check if it's a network error
    if (error.code === 'unavailable' || error.message?.includes('offline')) {
      throw new Error('Unable to connect to the database. Please check your internet connection.');
    }

    throw error;
  }
};

// Update phone verification status
export const updatePhoneVerificationStatus = async (user: User, verified: boolean): Promise<void> => {
  try {
    // Ensure network is enabled
    await enableNetwork(db);

    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      uid: user.uid,
      phoneVerified: verified,
      registrationComplete: verified,
      updatedAt: serverTimestamp(),
    });
    // Wait for pending writes to complete
    await waitForPendingWrites(db);
  } catch (error) {
    console.error('Error updating phone verification status:', error);
    throw error;
  }
};



// Save user data by UID (useful when user might have changed)
export const saveUserDataByUid = async (uid: string, userData: Partial<UserData>, email?: string): Promise<void> => {
  try {
    // Ensure network is enabled
    await enableNetwork(db);

    const userRef = doc(db, 'users', uid);

    // Remove Date objects and let Firestore handle timestamps
    const { createdAt, updatedAt, ...cleanData } = userData;

    // Get existing document to check if it exists
    const existingDoc = await getDoc(userRef);
    const existingData = existingDoc.exists() ? existingDoc.data() : {};

    const userDoc: any = {
      uid: uid,
      email: email || existingData.email || '',
      ...cleanData,
      updatedAt: serverTimestamp(),
    };

    // Only add createdAt if it's a new document
    if (!existingDoc.exists()) {
      userDoc.createdAt = serverTimestamp();
    }

    await setDoc(userRef, userDoc, { merge: true });
    // Wait for pending writes to complete
    await waitForPendingWrites(db);
    console.log(`Successfully saved user data for user ${uid}`);
  } catch (error) {
    console.error('Error saving user data by UID:', error);
    throw error;
  }
};

// Check if user has completed registration
export const checkUserRegistrationComplete = async (user: User): Promise<boolean> => {
  try {
    const userData = await getUserData(user);
    return userData?.registrationComplete === true;
  } catch (error) {
    console.error('Error checking registration status:', error);
    return false;
  }
};

// Check if user's phone is verified
export const checkPhoneVerificationStatus = async (user: User): Promise<boolean> => {
  try {
    const userData = await getUserData(user);
    return userData?.phoneVerified === true;
  } catch (error) {
    console.error('Error checking phone verification status:', error);
    return false;
  }
};

