// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAPbwoP4o0yIWE_DH6o9C6YcTAhV7u9IUs",
  authDomain: "irgt-inventory.firebaseapp.com",
  projectId: "irgt-inventory",
  storageBucket: "irgt-inventory.firebasestorage.app",
  messagingSenderId: "231666107640",
  appId: "1:231666107640:web:c7ea0a9cd7fd6bd4e8670d",
  measurementId: "G-CN8HT6WWLS",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
