// utils/firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your Firebase config - get this from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyCsOcs5W6ZBlmoER9bObw2iaFcChBlf5nQ",
  authDomain: "alldomain-rag-fc4b4.firebaseapp.com",
  projectId: "alldomain-rag-fc4b4",
  storageBucket: "alldomain-rag-fc4b4.firebasestorage.app",
  messagingSenderId: "702598800603",
  appId: "1:702598800603:web:4385595ecf7df021bc58fe",
  measurementId: "G-73K0Y16BRN"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;