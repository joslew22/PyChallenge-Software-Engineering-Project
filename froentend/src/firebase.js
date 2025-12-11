// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyC1hgEx19Z95qcEzVX1_kaAHtagWSOfU_I",
  authDomain: "pychallenge-d72fd.firebaseapp.com",
  projectId: "pychallenge-d72fd",
  storageBucket: "pychallenge-d72fd.appspot.com",
  messagingSenderId: "897439771408",
  appId: "1:897439771408:web:331e22df46f85c769b5395",
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Named exports that other files import
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
