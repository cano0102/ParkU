import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

import {
  getAuth,
  GoogleAuthProvider
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAPwWzfASH64N3LGY6znJkOgdBNeb4gSZ0",
  authDomain: "parku-a82b3.firebaseapp.com",
  projectId: "parku-a82b3",
  storageBucket: "parku-a82b3.firebasestorage.app",
  messagingSenderId: "835187841548",
  appId: "1:835187841548:web:9f5fc56c99b39caef4ec29",
  measurementId: "G-DLQW9SF27B"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

const analytics = getAnalytics(app);

// Auth
export const auth = getAuth(app);

// Provider Google
export const provider = new GoogleAuthProvider();