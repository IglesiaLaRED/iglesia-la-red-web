// ======================================================
// RED STATS — Autenticación
// Google + Correo y contraseña
// Iglesia La RED
// ======================================================

import { auth, db } from "../firebase.js";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


// ======================================================
// ELEMENTOS DE LA INTERFAZ
// ======================================================

const btnGoogle =
  document.getElementById("btnGoogle");

const formCorreo =
  document.getElementById("formCorreo");

const correoInput =
  document.getElementById("correo");

const contrasenaInput =
  document.getElementById("contrasena");

const btnCorreo =
  document.getElementById("btnCorreo");

const mensajeEstado =
  document.getElementById("mensajeEstado");

const cargando =
  document.getElementById("cargando");


// Evita que onAuthStateChanged y el inicio manual
// verifiquen el mismo usuario al mismo tiempo.
let autenticacionManualEnCurso = false;


// ======================================================
// PROVEEDOR GOOGLE
// ======================================================

const proveedorGoogle =
  new GoogleAuthProvider();

proveedorGoogle.setCustomParameters({
  prompt: "select_account"
});


// ======================================================
// MOSTRAR MENSAJES
// ======================================================

function mostrarMensaje(
  mensaje,
  tipo = "error"
) {

  if (!mensajeEstado) return;

  mensajeEstado.textContent = mensaje;

  mensajeEstado.classList.remove(
    "hidden",
    "bg-red-50",
    "text-red-700",
    "border",
    "border-red-200",
    "bg-blue-50",
    "text-blue-700",
    "border-blue-200"
  );


  if (tipo === "info") {

    mensajeEstado.classList.add(
      "bg-blue-50",
      "text-blue-700",
      "border",
      "border-blue-200"
    );

  } else {

    mensajeEstado.classList.add(
      "bg-red-50",
      "text-red-700",
      "border",
      "border-red-200"
    );

  }

}


// ======================================================
// OCULTAR MENSAJE
// ======================================================

function ocultarMensaje() {

  mensajeEstado?.classList.add("hidden");

}


// ======================================================
// CONTROLAR ESTADO VISUAL
// ======================================================

function cambiarEstadoCarga(
  estaCargando
) {

  if (btnGoogle) {

    btnGoogle.disabled =
      estaCargando;

    btnGoogle.classList.toggle(
      "opacity-60",
      estaCargando
    );

    btnGoogle.classList.toggle(
      "cursor-not-allowed",
      estaCargando
    );

  }


  if (btnCorreo) {

    btnCorreo.disabled =
      estaCargando;

    btnCorreo.classList.toggle(
      "opacity-60",
      estaCargando
    );

    btnCorreo.classList.toggle(
      "cursor-not-allowed",
      estaCargando
    );

  }


  if (correoInput) {
    correoInput.disabled =
      estaCargando;
  }


  if (contrasenaInput) {
    contrasenaInput.disabled =
      estaCargando;
  }


  if (cargando) {

    cargando.classList.toggle(
      "hidden",
      !estaCargando
    );

  }

}


// ======================================================
// VERIFICAR USUARIO AUTORIZADO
// ======================================================

async function verificarUsuario(user) {

  if (!user?.email) {

    throw new Error(
      "No fue posible obtener el correo de la cuenta."
    );

  }


  const correo =
    user.email
      .toLowerCase()
      .trim();


  const usuarioRef =
    doc(
      db,
      "usuarios",
      correo
    );


  const usuarioSnap =
    await getDoc(usuarioRef);


  // ====================================================
  // USUARIO NO AUTORIZADO EN RED STATS
  // ====================================================

  if (!usuarioSnap.exists()) {

    await signOut(auth);

    throw new Error(
      "Esta cuenta todavía no tiene acceso autorizado a RED Stats."
    );

  }


  const datosUsuario =
    usuarioSnap.data();


  // ====================================================
  // USUARIO INACTIVO
  // ====================================================

  if (
    datosUsuario.activo === false ||
    datosUsuario.estado === "inactivo"
  ) {

    await signOut(auth);

    throw new Error(
      "Tu acceso a RED Stats se encuentra inactivo. Comunícate con el administrador."
    );

  }


  // ====================================================
  // GUARDAR DATOS DE SESIÓN
  // ====================================================

  localStorage.setItem(
    "redStatsUsuario",
    JSON.stringify({

      uid:
        user.uid,

      nombre:
        datosUsuario.nombre ||
        user.displayName ||
        "Usuario",

      correo,

      rol:
        datosUsuario.rol ||
        "coordinador",

      ministerioStats:
        datosUsuario.ministerioStats ||
        null

    })
  );


  // ====================================================
  // ENTRAR AL PANEL
  // ====================================================

  window.location.href =
    "index.html";

}


// ======================================================
// INICIAR SESIÓN CON GOOGLE
// ======================================================

async function iniciarSesionGoogle() {

  autenticacionManualEnCurso = true;

  cambiarEstadoCarga(true);
  ocultarMensaje();


  try {

    await setPersistence(
      auth,
      browserLocalPersistence
    );


    const resultado =
      await signInWithPopup(
        auth,
        proveedorGoogle
      );


    await verificarUsuario(
      resultado.user
    );


  } catch (error) {

    console.error(
      "Error al iniciar sesión con Google:",
      error
    );


    let mensaje =
      error.message ||
      "No fue posible iniciar sesión con Google.";


    if (
      error.code ===
      "auth/popup-closed-by-user"
    ) {

      mensaje =
        "La ventana de Google fue cerrada antes de completar el acceso.";

    }


    if (
      error.code ===
      "auth/popup-blocked"
    ) {

      mensaje =
        "El navegador bloqueó la ventana de acceso. Permite ventanas emergentes e inténtalo nuevamente.";

    }


    if (
      error.code ===
      "auth/network-request-failed"
    ) {

      mensaje =
        "No fue posible conectarse. Revisa tu conexión a internet.";

    }


    mostrarMensaje(mensaje);


  } finally {

    autenticacionManualEnCurso = false;

    cambiarEstadoCarga(false);

  }

}


// ======================================================
// INICIAR SESIÓN CON CORREO Y CONTRASEÑA
// ======================================================

async function iniciarSesionCorreo(evento) {

  evento.preventDefault();


  const correo =
    correoInput?.value
      .toLowerCase()
      .trim() || "";


  const contrasena =
    contrasenaInput?.value || "";


  if (
    !correo ||
    !contrasena
  ) {

    mostrarMensaje(
      "Ingresa tu correo electrónico y contraseña."
    );

    return;

  }


  autenticacionManualEnCurso = true;

  cambiarEstadoCarga(true);
  ocultarMensaje();


  try {

    await setPersistence(
      auth,
      browserLocalPersistence
    );


    const resultado =
      await signInWithEmailAndPassword(
        auth,
        correo,
        contrasena
      );


    await verificarUsuario(
      resultado.user
    );


  } catch (error) {

    console.error(
      "Error al iniciar sesión con correo:",
      error
    );


    let mensaje =
      "No fue posible iniciar sesión. Verifica tu correo y contraseña.";


    if (
      error.code ===
      "auth/invalid-email"
    ) {

      mensaje =
        "El correo electrónico ingresado no es válido.";

    }


    if (
      error.code ===
      "auth/invalid-credential" ||
      error.code ===
      "auth/wrong-password" ||
      error.code ===
      "auth/user-not-found"
    ) {

      mensaje =
        "Correo o contraseña incorrectos.";

    }


    if (
      error.code ===
      "auth/too-many-requests"
    ) {

      mensaje =
        "Se realizaron demasiados intentos. Espera unos minutos e inténtalo nuevamente.";

    }


    if (
      error.code ===
      "auth/network-request-failed"
    ) {

      mensaje =
        "No fue posible conectarse. Revisa tu conexión a internet.";

    }


    // Si verificarUsuario() produjo un mensaje
    // específico, respetamos ese mensaje.
    if (
      error.message &&
      !String(error.code || "")
        .startsWith("auth/")
    ) {

      mensaje =
        error.message;

    }


    mostrarMensaje(mensaje);


  } finally {

    autenticacionManualEnCurso = false;

    cambiarEstadoCarga(false);

  }

}


// ======================================================
// BOTÓN GOOGLE
// ======================================================

btnGoogle?.addEventListener(
  "click",
  iniciarSesionGoogle
);


// ======================================================
// FORMULARIO CORREO + CONTRASEÑA
// ======================================================

formCorreo?.addEventListener(
  "submit",
  iniciarSesionCorreo
);


// ======================================================
// SESIÓN YA EXISTENTE
// ======================================================

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) return;


    // Si el usuario acaba de iniciar sesión manualmente,
    // la propia función de login hará la verificación.
    if (autenticacionManualEnCurso) {
      return;
    }


    cambiarEstadoCarga(true);

    mostrarMensaje(
      "Verificando tu acceso...",
      "info"
    );


    try {

      await verificarUsuario(user);


    } catch (error) {

      console.error(
        "Error al verificar sesión:",
        error
      );

      mostrarMensaje(
        error.message
      );


    } finally {

      cambiarEstadoCarga(false);

    }

  }
);
