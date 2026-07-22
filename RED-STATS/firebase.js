// RED Stats — Conexión oficial con Firebase

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  getFirestore
} from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


// Reemplazaremos este bloque con la configuración
// que ya utiliza Iglesia La RED.
const firebaseConfig = {
  apiKey: "PEGAR_API_KEY",
  authDomain: "PEGAR_AUTH_DOMAIN",
  projectId: "iglesia-la-red",
  storageBucket: "PEGAR_STORAGE_BUCKET",
  messagingSenderId: "PEGAR_MESSAGING_SENDER_ID",
  appId: "PEGAR_APP_ID"
};


// Inicialización principal
const app = initializeApp(firebaseConfig);


// Servicios oficiales de RED Stats
const auth = getAuth(app);
const db = getFirestore(app);


// Exportaciones para los demás módulos
export {
  app,
  auth,
  db,
  onAuthStateChanged,
  signOut
};
