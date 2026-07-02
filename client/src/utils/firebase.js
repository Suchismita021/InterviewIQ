

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "interviewiq-3056a.firebaseapp.com",
  projectId: "interviewiq-3056a",
  storageBucket: "interviewiq-3056a.firebasestorage.app",
  messagingSenderId: "875840281941",
  appId: "1:875840281941:web:5743fecc4c259aaa56e3dc"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const provider = new GoogleAuthProvider()

export {auth , provider}