import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAWbMoPDMQyp_SGCtU6pb8x_PQ1qOazm0U",
    authDomain: "pitiax.firebaseapp.com",
    projectId: "pitiax",
    storageBucket: "pitiax.firebasestorage.app",
    messagingSenderId: "295248312009",
    appId: "1:295248312009:web:9e9de6b0b758913ab8bf18",
    measurementId: "G-ZX7RBYDW3P"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
export {app, auth, analytics};