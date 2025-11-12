import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAGwOa7FR6qiWtjRFXdZYyab-LhVO_fyLI",
  authDomain: "pitiax-b3a94.firebaseapp.com",
  projectId: "pitiax-b3a94",
  storageBucket: "pitiax-b3a94.firebasestorage.app",
  messagingSenderId: "736878351162",
  appId: "1:736878351162:web:4d2e72710e212b1ad3f603"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// Initialize Firestore with persistence explicitly disabled
const db = initializeFirestore(app, {
  localCache: {
    kind: 'memory' // Use memory cache only, no IndexedDB persistence
  }
});

if (typeof window !== 'undefined') {
  auth.useDeviceLanguage();
}


export {app, auth, analytics, db};