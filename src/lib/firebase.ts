// Import the functions you need from the SDKs you need
import { getApps, initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator, setPersistence, browserLocalPersistence, inMemoryPersistence } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Debug Firebase configuration
console.log('Firebase config loaded:', {
  apiKeyExists: !!firebaseConfig.apiKey,
  authDomainExists: !!firebaseConfig.authDomain,
  projectIdExists: !!firebaseConfig.projectId,
  appIdExists: !!firebaseConfig.appId,
});

// Initialize Firebase
let app;
if (getApps().length === 0) {
  console.log('Initializing Firebase app...');
  app = initializeApp(firebaseConfig);
} else {
  console.log('Firebase app already initialized');
  app = getApps()[0];
}

// Get Firebase services
const auth = getAuth(app);
const db = getFirestore(app);

// Set persistence to LOCAL for PWA support
// This ensures the user stays logged in even when the app is closed
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('Firebase persistence set to LOCAL');
    })
    .catch((error) => {
      console.error('Error setting persistence:', error);
    });
}

// Add error event listener to auth
auth.onAuthStateChanged(
  (user) => {
    if (user) {
      console.log('User is signed in:', user.uid);
    } else {
      console.log('No user is signed in.');
    }
  },
  (error) => {
    console.error('Auth state change error:', error);
  }
);

export { app, auth, db }; 