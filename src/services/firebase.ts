/**
 * Único archivo (junto con auth.ts) autorizado a importar `firebase/*` en todo
 * el proyecto. Hoy nada consume `auth`/`provider` de forma activa: el login,
 * registro y recuperación de contraseña reales corren contra el store mock de
 * services/usuarios.ts (ver services/auth.ts) porque no hay un backend de
 * Firestore/Auth provisionado con los usuarios de demo. Se deja esta
 * inicialización lista para el día en que se decida conectar Firebase Auth de
 * verdad, sin que ningún componente necesite volver a importar el SDK.
 */
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAPwWzfASH64N3LGY6znJkOgdBNeb4gSZ0',
  authDomain: 'parku-a82b3.firebaseapp.com',
  projectId: 'parku-a82b3',
  storageBucket: 'parku-a82b3.firebasestorage.app',
  messagingSenderId: '835187841548',
  appId: '1:835187841548:web:9f5fc56c99b39caef4ec29',
  measurementId: 'G-DLQW9SF27B',
};

const app = initializeApp(firebaseConfig);

getAnalytics(app);

export const auth = getAuth(app);

export const provider = new GoogleAuthProvider();
