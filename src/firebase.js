// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDVtaNL1mhePr1fvFUUOnPiUJ5X8xP88eg",
  authDomain: "proyect-js.firebaseapp.com",
  databaseURL: "https://proyect-js-default-rtdb.firebaseio.com/",
  projectId: "proyect-js",
  storageBucket: "proyect-js.firebasestorage.app",
  messagingSenderId: "508091403402",
  appId: "1:508091403402:web:4a2c091c1d875856d13173",
  measurementId: "G-DJTZ1TLXRH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const isConfigured = true;