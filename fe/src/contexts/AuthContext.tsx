import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { signInWithGoogle, signOutUser, onAuthStateChange, checkUserRegistrationStatus } from '../services/authService';


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
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Helper function to get initial auth state from localStorage
const getInitialAuthState = (): boolean => {
  try {
    const savedAuthState = localStorage.getItem('isLoggedIn');
    console.log('Initial load - auth state from localStorage:', savedAuthState);
    
    if (savedAuthState !== null) {
      const parsedState = JSON.parse(savedAuthState);
      console.log('Initial load - parsed auth state:', parsedState);
      return parsedState;
    }
    return false;
  } catch (error) {
    console.error('Error parsing auth state from localStorage:', error);
    return false;
  }
};

// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//   // Initialize state directly from localStorage
//   const [isLoggedIn, setIsLoggedIn] = useState<boolean>(getInitialAuthState);

//   // Save auth state to localStorage whenever it changes
//   useEffect(() => {
//     localStorage.setItem('isLoggedIn', JSON.stringify(isLoggedIn));
//   }, [isLoggedIn]);

//   const login = () => {
//     console.log('Login called - setting isLoggedIn to true');
//     setIsLoggedIn(true);
//   };

//   const logout = () => {
//     console.log('Logout called - setting isLoggedIn to false');
//     setIsLoggedIn(false);
//   };

//   // Debug function to check localStorage state
//   const debugAuthState = () => {
//     const savedState = localStorage.getItem('isLoggedIn');
//     console.log('Current localStorage value:', savedState);
//     console.log('Current React state:', isLoggedIn);
//     return { localStorage: savedState, reactState: isLoggedIn };
//   };

//   // Make debug function available globally
//   if (typeof window !== 'undefined') {
//     (window as any).debugAuthState = debugAuthState;
//     (window as any).setAuthState = (value: boolean) => {
//       console.log('Manually setting auth state to:', value);
//       localStorage.setItem('isLoggedIn', JSON.stringify(value));
//       setIsLoggedIn(value);
//     };
//   }

//   const value: AuthContextType = {
//     isLoggedIn,
//     setIsLoggedIn,
//     login,
//     logout,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChange((user) => {
//       setUser(user);
//       setLoading(false);
//     });

//     return () => unsubscribe();
//   }, []);

//   const login = async () => {
//     try {
//       await signInWithGoogle();
//     } catch (error) {
//       console.error('Login failed:', error);
//     }
//   };

//   const logout = async () => {
//     try {
//       await signOutUser();
//     } catch (error) {
//       console.error('Logout failed:', error);
//     }
//   };

//   const value = {
//     user,
//     isLoggedIn: !!user,
//     loading,
//     login,
//     logout,
//   };

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      setUser(user);
      
      if (user) {
        // Check if user has completed registration
        const registrationComplete = await checkUserRegistrationStatus(user);
        setIsRegistrationComplete(registrationComplete);
      } else {
        setIsRegistrationComplete(false);
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
