// ======================================================
// RED STATS — Autenticación con Google
// Iglesia La RED
// ======================================================

import { auth, db } from "../firebase.js";

import {
  GoogleAuthProvider,
  signInWithPopup,
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

const btnGoogle = document.getElementById("btnGoogle");
const mensajeEstado = document.getElementById("mensajeEstado");
const cargando = document.getElementById("cargando");


// ======================================================
// PROVEEDOR GOOGLE
// ======================================================

const proveedorGoogle = new GoogleAuthProvider();

proveedorGoogle.setCustomParameters({
  prompt: "select_account"
});


// ======================================================
// MOSTRAR MENSAJES
// ======================================================

function mostrarMensaje(mensaje, tipo = "error") {

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
// CONTROLAR ESTADO VISUAL
// ======================================================

function cambiarEstadoCarga(estaCargando) {

  if (btnGoogle) {
    btnGoogle.disabled = estaCargando;
    btnGoogle.classList.toggle("opacity-60", estaCargando);
    btnGoogle.classList.toggle("cursor-not-allowed", estaCargando);
  }

  if (cargando) {
    cargando.classList.toggle("hidden", !estaCargando);
  }
}


// ======================================================
// VERIFICAR USUARIO AUTORIZADO
// ======================================================

async function verificarUsuario(user) {

  if (!user?.email) {
    throw new Error("No fue posible obtener el correo de la cuenta.");
  }

  const correo = user.email.toLowerCase().trim();

  const usuarioRef = doc(db, "usuarios", correo);
  const usuarioSnap = await getDoc(usuarioRef);

  if (!usuarioSnap.exists()) {

    await signOut(auth);

    throw new Error(
      "Tu cuenta de Google todavía no tiene acceso autorizado a RED Stats."
    );
  }

  const datosUsuario = usuarioSnap.data();

  if (datosUsuario.activo === false || datosUsuario.estado === "inactivo") {

    await signOut(auth);

    throw new Error(
      "Tu acceso a RED Stats se encuentra inactivo. Comunícate con el administrador."
    );
  }

  localStorage.setItem(
    "redStatsUsuario",
    JSON.stringify({
      uid: user.uid,
      nombre: datosUsuario.nombre || user.displayName || "Usuario",
      correo,
      rol: datosUsuario.rol || "coordinador",
      ministerio: datosUsuario.ministerio || null
    })
  );

  window.location.href = "index.html";
}


// ======================================================
// INICIAR SESIÓN
// ======================================================

async function iniciarSesionGoogle() {

  cambiarEstadoCarga(true);

  if (mensajeEstado) {
    mensajeEstado.classList.add("hidden");
  }

  try {

    await setPersistence(auth, browserLocalPersistence);

    const resultado = await signInWithPopup(
      auth,
      proveedorGoogle
    );

    await verificarUsuario(resultado.user);

  } catch (error) {

    console.error("Error al iniciar sesión:", error);

    let mensaje =
      error.message || "No fue posible iniciar sesión con Google.";

    if (error.code === "auth/popup-closed-by-user") {
      mensaje = "La ventana de Google fue cerrada antes de completar el acceso.";
    }

    if (error.code === "auth/popup-blocked") {
      mensaje =
        "El navegador bloqueó la ventana de acceso. Permite ventanas emergentes e inténtalo nuevamente.";
    }

    if (error.code === "auth/network-request-failed") {
      mensaje =
        "No fue posible conectarse. Revisa tu conexión a internet.";
    }

    mostrarMensaje(mensaje);

  } finally {

    cambiarEstadoCarga(false);

  }
}


// ======================================================
// BOTÓN GOOGLE
// ======================================================

if (btnGoogle) {
  btnGoogle.addEventListener("click", iniciarSesionGoogle);
}


// ======================================================
// SESIÓN YA EXISTENTE
// ======================================================

onAuthStateChanged(auth, async (user) => {

  if (!user) return;

  cambiarEstadoCarga(true);
  mostrarMensaje("Verificando tu acceso...", "info");

  try {

    await verificarUsuario(user);

  } catch (error) {

    console.error("Error al verificar sesión:", error);
    mostrarMensaje(error.message);

  } finally {

    cambiarEstadoCarga(false);

  }

});
