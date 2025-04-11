'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  AuthError,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth, 
      (user) => {
        // Reduced logging to avoid console spam
        setUser(user);
        setLoading(false);
      },
      (error) => {
        console.error('Auth state observer error:', error);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Set persistence to LOCAL before signing in
      await setPersistence(auth, browserLocalPersistence);
      
      // Then sign in the user
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error) {
      console.error('Sign in error:', error);
      const authError = error as AuthError;
      
      // Handle specific Firebase auth errors
      switch(authError.code) {
        case 'auth/wrong-password':
          throw new Error('Incorrect password. Please try again.');
        case 'auth/user-not-found':
          throw new Error('No account found with this email.');
        case 'auth/too-many-requests':
          throw new Error('Too many failed login attempts. Please try again later.');
        default:
          throw error;
      }
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      // Set persistence to LOCAL before signing up
      await setPersistence(auth, browserLocalPersistence);
      
      // Create the user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // If fullName is provided, update the user profile and save to Firestore
      if (fullName && fullName.trim() !== '') {
        // Update the user's profile with the full name
        await updateProfile(user, {
          displayName: fullName
        });
        
        // Save user data to Firestore
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          fullName: fullName,
          createdAt: new Date(),
        });
        
        // Also create a default preferences document
        await setDoc(doc(db, 'preferences', user.uid), {
          userId: user.uid,
          theme: 'light',
          currency: 'USD',
          notificationsEnabled: true,
        });
      }
      
      router.push('/dashboard');
    } catch (error) {
      console.error('Sign up error:', error);
      const authError = error as AuthError;
      
      // Handle specific Firebase auth errors
      switch(authError.code) {
        case 'auth/email-already-in-use':
          throw new Error('This email is already registered. Try signing in instead.');
        case 'auth/invalid-email':
          throw new Error('Invalid email address format.');
        case 'auth/weak-password':
          throw new Error('Password is too weak. Use at least 6 characters.');
        default:
          throw error;
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/signin');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 