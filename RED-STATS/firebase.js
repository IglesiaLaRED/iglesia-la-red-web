// ======================================================
// RED STATS — Configuración central de Firebase
// Iglesia La RED
// ======================================================

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import { getAuth } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import { getFirestore } from
  "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


// Configuración oficial del proyecto Iglesia La RED
const firebaseConfig = {
  apiKey: "AIzaSyAmD5LVjdETks7pD8hyqAFXuvSZMmstDrI",
  authDomain: "iglesia-la-red.firebaseapp.com",
  projectId: "iglesia-la-red",
  storageBucket: "iglesia-la-red.firebasestorage.app",
  messagingSenderId: "691049458169",
  appId: "1:691049458169:web:4f5d82e28a1de5d0b47528"
};


// Inicializar Firebase una sola vez
const app = initializeApp(firebaseConfig);


// Servicios centrales de RED Stats
const auth = getAuth(app);
const db = getFirestore(app);


// Exportaciones para los demás archivos
export {
  app,
  auth,
  db
};
