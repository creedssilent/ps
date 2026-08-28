// Config Firebase kamu (sudah diisi dari Firebase Console)
const firebaseConfig = {
  apiKey: "AIzaSyAPbwoP4o0yIWE_DH6o9C6YcTAhV7u9IUs",
  authDomain: "irgt-inventory.firebaseapp.com",
  projectId: "irgt-inventory",
  storageBucket: "irgt-inventory.firebasestorage.app",
  messagingSenderId: "231666107640",
  appId: "1:231666107640:web:c7ea0a9cd7fd6bd4e8670d",
  measurementId: "G-CN8HT6WWLS",
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
