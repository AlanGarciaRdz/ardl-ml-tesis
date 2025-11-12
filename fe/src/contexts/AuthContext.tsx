import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { signInWithGoogle, signOutUser, onAuthStateChange } from '../services/authService';
import { checkUserRegistrationComplete, checkPhoneVerificationStatus } from '../services/userService';


// interface AuthContextType {
//   user: User | null;
//   isLoggedIn: boolean;
//   setIsLoggedIn: (value: boolean) => void;
//   login: () => Promise<void>;
//   logout: () => Promise<void>;
// }

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  loading: boolean;
  isRegistrationComplete: boolean;
  isPhoneVerified: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);
      
      if (user) {
        console.log(user)
        // Check if user has completed registration
        const registrationComplete = await checkUserRegistrationComplete(user);
        setIsRegistrationComplete(registrationComplete);
        
        // Check if phone is verified
        const phoneVerified = await checkPhoneVerificationStatus(user);
        setIsPhoneVerified(phoneVerified);
      } else {
        setIsRegistrationComplete(false);
        setIsPhoneVerified(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = async () => {
    try {
      await signOutUser();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const value = {
    user,
    isLoggedIn: !!user,
    loading,
    isRegistrationComplete,
    isPhoneVerified,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
