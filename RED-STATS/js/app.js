// ======================================================
// RED STATS — Aplicación principal
// Iglesia La RED
// ======================================================

import { auth } from "../firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";


// ======================================================
// ELEMENTOS
// ======================================================

const pantallaCarga = document.getElementById("pantallaCarga");

const menuLateral = document.getElementById("menuLateral");
const fondoMenu = document.getElementById("fondoMenu");
const btnAbrirMenu = document.getElementById("btnAbrirMenu");

const btnCerrarSesion = document.getElementById("btnCerrarSesion");

const nombreUsuario = document.getElementById("nombreUsuario");
const nombreUsuarioHeader = document.getElementById("nombreUsuarioHeader");
const rolUsuarioHeader = document.getElementById("rolUsuarioHeader");
const avatarUsuario = document.getElementById("avatarUsuario");
const mensajeBienvenida = document.getElementById("mensajeBienvenida");

const menuUsuarios = document.getElementById("menuUsuarios");


// ======================================================
// LEER DATOS LOCALES
// ======================================================

function obtenerDatosUsuario() {

  const datosGuardados = localStorage.getItem("redStatsUsuario");

  if (!datosGuardados) {
    return null;
  }

  try {
    return JSON.parse(datosGuardados);
  } catch (error) {
    console.error("No fue posible leer los datos del usuario:", error);
    return null;
  }

}


// ======================================================
// MOSTRAR USUARIO
// ======================================================

function mostrarUsuario(datosUsuario, usuarioFirebase) {

  const nombre =
    datosUsuario?.nombre ||
    usuarioFirebase?.displayName ||
    "Usuario";

  const rol =
    datosUsuario?.rol ||
    "coordinador";

  const primeraLetra =
    nombre.trim().charAt(0).toUpperCase() || "U";

  nombreUsuario.textContent = nombre;
  nombreUsuarioHeader.textContent = nombre;
  rolUsuarioHeader.textContent = rol;
  avatarUsuario.textContent = primeraLetra;

  configurarBienvenida(nombre, rol);
  configurarPermisos(rol);

}


// ======================================================
// MENSAJE SEGÚN ROL
// ======================================================

function configurarBienvenida(nombre, rol) {

  const mensajes = {
    superadmin:
      `Bienvenido nuevamente, ${nombre}. Tienes acceso completo al centro de mando de RED Stats.`,

    admin:
      `Bienvenido, ${nombre}. Desde aquí puedes supervisar programaciones, reportes y estadísticas.`,

    pastor:
      `Bienvenido, ${nombre}. Aquí encontrarás el panorama general de los servicios y ministerios.`,

    coordinador:
      `Bienvenido, ${nombre}. Aquí encontrarás los reportes y tareas correspondientes a tu ministerio.`,

    lider:
      `Bienvenido, ${nombre}. Gracias por liderar y servir con excelencia en Iglesia La RED.`,

    servidor:
      `Bienvenido, ${nombre}. Gracias por servir y contribuir con las estadísticas oficiales.`
  };

  mensajeBienvenida.textContent =
    mensajes[rol] ||
    `Bienvenido, ${nombre}, a la plataforma oficial de estadísticas de Iglesia La RED.`;

}


// ======================================================
// MENÚ SEGÚN PERMISOS
// ======================================================

function configurarPermisos(rol) {

  const rolesAdministrativos = [
    "superadmin",
    "admin"
  ];

  if (rolesAdministrativos.includes(rol)) {
    menuUsuarios.classList.remove("hidden");
    menuUsuarios.classList.add("flex");
  }

}


// ======================================================
// MENÚ MÓVIL
// ======================================================

function abrirMenu() {

  menuLateral.classList.remove("-translate-x-full");
  fondoMenu.classList.remove("hidden");

}


function cerrarMenu() {

  menuLateral.classList.add("-translate-x-full");
  fondoMenu.classList.add("hidden");

}


btnAbrirMenu?.addEventListener("click", abrirMenu);
fondoMenu?.addEventListener("click", cerrarMenu);


// ======================================================
// NAVEGACIÓN PROVISIONAL
// ======================================================

document.querySelectorAll(".opcion-menu").forEach((boton) => {

  boton.addEventListener("click", () => {

    document.querySelectorAll(".opcion-menu").forEach((opcion) => {

      opcion.classList.remove("bg-white/15");
      opcion.classList.add("text-blue-100");

    });

    boton.classList.add("bg-white/15");
    boton.classList.remove("text-blue-100");

    if (window.innerWidth < 1024) {
      cerrarMenu();
    }

    const modulo = boton.dataset.modulo;

    console.log("Módulo seleccionado:", modulo);

  });

});


// ======================================================
// CERRAR SESIÓN
// ======================================================

btnCerrarSesion?.addEventListener("click", async () => {

  try {

    btnCerrarSesion.disabled = true;

    await signOut(auth);

    localStorage.removeItem("redStatsUsuario");
    sessionStorage.clear();

    window.location.href = "login.html";

  } catch (error) {

    console.error("Error al cerrar sesión:", error);

    alert(
      "No fue posible cerrar la sesión. Inténtalo nuevamente."
    );

    btnCerrarSesion.disabled = false;

  }

});


// ======================================================
// PROTEGER EL PANEL
// ======================================================

onAuthStateChanged(auth, (usuarioFirebase) => {

  if (!usuarioFirebase) {

    localStorage.removeItem("redStatsUsuario");
    window.location.href = "login.html";
    return;

  }

  const datosUsuario = obtenerDatosUsuario();

  mostrarUsuario(datosUsuario, usuarioFirebase);

  pantallaCarga.classList.add("hidden");

});
