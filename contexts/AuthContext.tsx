import React, { createContext, useContext, useEffect, useState } from 'react';
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Platform } from 'react-native';
import { auth, db } from '../services/firebase';

// Use shared Firebase instances from services/firebase

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out');
      console.log('User details:', user ? {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName
      } : 'No user');
      
      if (user) {
        // Create or update user document in Firestore
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        
        if (!userDoc.exists()) {
          console.log('Creating new user document in Firestore');
          await setDoc(userRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            role: 'passenger',
            createdAt: new Date(),
            lastLogin: new Date(),
          });
        } else {
          console.log('Updating existing user document in Firestore');
          // Update last login
          await setDoc(userRef, {
            lastLogin: new Date(),
          }, { merge: true });
        }
      }
      setUser(user);
      setLoading(false);
      console.log('Auth state updated, loading set to false');
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign-in process...');
      console.log('Platform:', Platform.OS);
      
      if (Platform.OS === 'web') {
        console.log('Using web-based Google sign-in...');
        // Web implementation using Firebase
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        await signInWithPopup(auth, provider);
      } else {
        console.log('Using native platform Google sign-in...');
        // For native platforms, we'll use a simplified approach
        // that works with the current Firebase configuration
        const provider = new GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        
        // Use the web-based sign-in for native platforms as well
        // This is a temporary solution until proper native OAuth is configured
        await signInWithPopup(auth, provider);
      }
      
      console.log('Google sign-in completed successfully');
      
    } catch (error) {
      console.error('Google Sign-In error:', error);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('popup')) {
          throw new Error('Google sign-in popup was blocked. Please allow popups and try again.');
        } else if (error.message.includes('network')) {
          throw new Error('Network error. Please check your internet connection and try again.');
        } else if (error.message.includes('cancelled')) {
          throw new Error('Google sign-in was cancelled.');
        } else {
          throw new Error('Google sign-in failed. Please try again.');
        }
      } else {
        throw new Error('An unexpected error occurred during sign-in.');
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}