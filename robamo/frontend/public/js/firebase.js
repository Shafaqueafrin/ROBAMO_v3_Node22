import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";

import {
 getAuth,
 RecaptchaVerifier,
 signInWithPhoneNumber,
signOut  
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyA_7elqZ26LKkuQN5hl2Rwd8kaHkKT1LWo",
  authDomain: "robamo-8e4d8.firebaseapp.com",
  projectId: "robamo-8e4d8",
  storageBucket: "robamo-8e4d8.firebasestorage.app",
  messagingSenderId: "224122665879",
  appId: "1:224122665879:web:069bce9be150fc9853e2d2"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

window.auth = auth;
window.RecaptchaVerifier = RecaptchaVerifier;
window.signInWithPhoneNumber = signInWithPhoneNumber;
window.firebaseSignOut = signOut;

console.log("Firebase Connected ✅");