import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";


// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDOg6T9wd3cb5XpCiTeNkLlLD5tQ-y-a60",
  authDomain: "marine-trader-tracker.firebaseapp.com",
  projectId: "marine-trader-tracker",
  storageBucket: "marine-trader-tracker.firebasestorage.app",
  messagingSenderId: "711019961513",
  appId: "1:711019961513:web:792691d8ca97b3610f1db8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();