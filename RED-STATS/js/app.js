// ======================================================
// RED STATS — Aplicación principal
// Iglesia La RED
// ======================================================

import { auth, db } from "../firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { renderProgramaciones } from "./modules/programaciones.js";


// ======================================================
// ELEMENTOS
// ======================================================

const pantallaCarga = document.getElementById("pantallaCarga");

const menuLateral = document.getElementById("menuLateral");
const fondoMenu = document.getElementById("fondoMenu");
const btnAbrirMenu = document.getElementById("btnAbrirMenu");

const btnCerrarSesion = document.getElementById("btnCerrarSesion");

const nombreUsuario = document.getElementById("nombreUsuario");
const nombreUsuarioHeader =
  document.getElementById("nombreUsuarioHeader");

const rolUsuarioHeader =
  document.getElementById("rolUsuarioHeader");

const avatarUsuario =
  document.getElementById("avatarUsuario");

const mensajeBienvenida =
  document.getElementById("mensajeBienvenida");

const menuUsuarios =
  document.getElementById("menuUsuarios");

const contenidoModulo =
  document.getElementById("contenidoModulo");


// ======================================================
// LEER DATOS LOCALES
// ======================================================

function obtenerDatosUsuario() {

  const datosGuardados =
    localStorage.getItem("redStatsUsuario");

  if (!datosGuardados) {
    return null;
  }

  try {

    return JSON.parse(datosGuardados);

  } catch (error) {

    console.error(
      "No fue posible leer los datos del usuario:",
      error
    );

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

  if (nombreUsuario) {
    nombreUsuario.textContent = nombre;
  }

  if (nombreUsuarioHeader) {
    nombreUsuarioHeader.textContent = nombre;
  }

  if (rolUsuarioHeader) {
    rolUsuarioHeader.textContent = rol;
  }

  if (avatarUsuario) {
    avatarUsuario.textContent = primeraLetra;
  }

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

  if (!mensajeBienvenida) return;

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

  if (
    menuUsuarios &&
    rolesAdministrativos.includes(rol)
  ) {

    menuUsuarios.classList.remove("hidden");
    menuUsuarios.classList.add("flex");

  }

}


// ======================================================
// MENÚ MÓVIL
// ======================================================

function abrirMenu() {

  menuLateral?.classList.remove("-translate-x-full");
  fondoMenu?.classList.remove("hidden");

}


function cerrarMenu() {

  menuLateral?.classList.add("-translate-x-full");
  fondoMenu?.classList.add("hidden");

}


btnAbrirMenu?.addEventListener(
  "click",
  abrirMenu
);

fondoMenu?.addEventListener(
  "click",
  cerrarMenu
);


// ======================================================
// NAVEGACIÓN
// ======================================================

document
  .querySelectorAll(".opcion-menu")
  .forEach((boton) => {

    boton.addEventListener("click", () => {

      document
        .querySelectorAll(".opcion-menu")
        .forEach((opcion) => {

          opcion.classList.remove("bg-white/15");
          opcion.classList.add("text-blue-100");

        });

      boton.classList.add("bg-white/15");
      boton.classList.remove("text-blue-100");

      if (window.innerWidth < 1024) {
        cerrarMenu();
      }

      const modulo = boton.dataset.modulo;

      cargarModulo(modulo);

    });

  });


// ======================================================
// CARGAR MÓDULOS
// ======================================================

function cargarModulo(modulo) {

  if (!contenidoModulo) return;

  if (modulo === "programaciones") {

    contenidoModulo.className = "mt-7";

    contenidoModulo.innerHTML =
      renderProgramaciones();

    configurarEventosProgramaciones();

    return;

  }

  contenidoModulo.className =
    "mt-7 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-7";

  contenidoModulo.innerHTML = `
    <div class="flex min-h-72 items-center justify-center text-center">

      <div>

        <div class="text-5xl">
          🏗️
        </div>

        <p class="mt-4 text-xl font-black text-blue-950">
          Módulo ${modulo}
        </p>

        <p class="mt-2 text-sm text-slate-500">
          Este espacio se encuentra en construcción.
        </p>

      </div>

    </div>
  `;

}


// ======================================================
// EVENTOS DE PROGRAMACIONES
// ======================================================

async function configurarEventosProgramaciones() {

  const btnNuevaProgramacion =
    document.getElementById("btnNuevaProgramacion");

  const modalNuevaProgramacion =
    document.getElementById("modalNuevaProgramacion");

  const btnCerrarModalProgramacion =
    document.getElementById("btnCerrarModalProgramacion");

  const btnCancelarProgramacion =
    document.getElementById("btnCancelarProgramacion");

  const formNuevaProgramacion =
    document.getElementById("formNuevaProgramacion");
const fechaInput =
  document.getElementById("fechaProgramacion");

const horaInput =
  document.getElementById("horaProgramacion");

const servicioSelect =
  document.getElementById("servicioProgramacion");

const ministerioSelect =
  document.getElementById("ministerioProgramacion");

const listaProgramaciones =
  document.getElementById("listaProgramaciones");

const botonGuardar =
  formNuevaProgramacion?.querySelector(
    'button[type="submit"]'
  );
  
  const responsableInput =
    document.getElementById("responsableProgramacion");

  const responsableId =
    document.getElementById("responsableId");

  const resultadosResponsable =
    document.getElementById("resultadosResponsable");

  const suplenteInput =
    document.getElementById("suplenteProgramacion");

  const suplenteId =
    document.getElementById("suplenteId");

  const resultadosSuplente =
    document.getElementById("resultadosSuplente");


  let servidores = [];


  // ====================================================
  // NORMALIZAR TEXTO
  // ====================================================

  function normalizarTexto(texto) {

    return String(texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  }


  // ====================================================
  // CARGAR SERVIDORES DESDE FIRESTORE
  // ====================================================

  async function cargarServidores() {

    try {

      const resultado =
        await getDocs(collection(db, "servidores"));

      servidores = resultado.docs
        .map((documento) => {

          const datos = documento.data();

          return {
            id: documento.id,
            nombre: datos.nombre || "Sin nombre",
            ministerio:
              datos.ministerioPrincipal ||
              datos.ministerios ||
              "Sin ministerio",
            telefono: datos.telefono || ""
          };

        })
        .sort((a, b) =>
          a.nombre.localeCompare(
            b.nombre,
            "es",
            { sensitivity: "base" }
          )
        );

      console.log(
        `${servidores.length} servidores cargados.`
      );

    } catch (error) {

      console.error(
        "Error al cargar servidores:",
        error
      );

      alert(
        "No fue posible cargar la lista de servidores."
      );

    }

  }


  // ====================================================
  // MOSTRAR RESULTADOS
  // ====================================================

  function mostrarResultados(
    texto,
    contenedor,
    inputNombre,
    inputId
  ) {

    const busqueda = normalizarTexto(texto);

    inputId.value = "";

    if (busqueda.length < 2) {

      contenedor.innerHTML = "";
      contenedor.classList.add("hidden");
      return;

    }

    const coincidencias = servidores
      .filter((servidor) =>
        normalizarTexto(servidor.nombre)
          .includes(busqueda)
      )
      .slice(0, 8);


    if (coincidencias.length === 0) {

      contenedor.innerHTML = `
        <div class="px-4 py-4 text-sm text-slate-500">
          No se encontraron servidores.
        </div>
      `;

      contenedor.classList.remove("hidden");
      return;

    }


    contenedor.innerHTML = coincidencias
      .map((servidor) => `
        <button
          type="button"
          class="resultado-servidor flex w-full items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-blue-50"
          data-id="${servidor.id}"
          data-nombre="${servidor.nombre}"
        >
          <div>
            <p class="font-bold text-blue-950">
              ${servidor.nombre}
            </p>

            <p class="mt-1 text-xs text-slate-500">
              ${servidor.ministerio}
            </p>
          </div>

          <span class="text-blue-700">
            Seleccionar
          </span>
        </button>
      `)
      .join("");

    contenedor.classList.remove("hidden");


    contenedor
      .querySelectorAll(".resultado-servidor")
      .forEach((boton) => {

        boton.addEventListener("click", () => {

          inputNombre.value =
            boton.dataset.nombre;

          inputId.value =
            boton.dataset.id;

          contenedor.classList.add("hidden");
          contenedor.innerHTML = "";

        });

      });

  }


  // ====================================================
  // ABRIR Y CERRAR MODAL
  // ====================================================

  function abrirModalProgramacion() {

    modalNuevaProgramacion?.classList.remove(
      "hidden"
    );

    modalNuevaProgramacion?.classList.add(
      "flex"
    );

    document.body.classList.add(
      "overflow-hidden"
    );

  }


  function cerrarModalProgramacion() {

    modalNuevaProgramacion?.classList.add(
      "hidden"
    );

    modalNuevaProgramacion?.classList.remove(
      "flex"
    );

    document.body.classList.remove(
      "overflow-hidden"
    );

    formNuevaProgramacion?.reset();

    if (responsableId) {
      responsableId.value = "";
    }

    if (suplenteId) {
      suplenteId.value = "";
    }

    resultadosResponsable?.classList.add("hidden");
    resultadosSuplente?.classList.add("hidden");

  }


  // ====================================================
  // BUSCADORES
  // ====================================================

  responsableInput?.addEventListener(
    "input",
    () => {

      mostrarResultados(
        responsableInput.value,
        resultadosResponsable,
        responsableInput,
        responsableId
      );

    }
  );


  suplenteInput?.addEventListener(
    "input",
    () => {

      mostrarResultados(
        suplenteInput.value,
        resultadosSuplente,
        suplenteInput,
        suplenteId
      );

    }
  );


  // ====================================================
  // EVENTOS DEL MODAL
  // ====================================================

  btnNuevaProgramacion?.addEventListener(
    "click",
    abrirModalProgramacion
  );

  btnCerrarModalProgramacion?.addEventListener(
    "click",
    cerrarModalProgramacion
  );

  btnCancelarProgramacion?.addEventListener(
    "click",
    cerrarModalProgramacion
  );

  modalNuevaProgramacion?.addEventListener(
    "click",
    (evento) => {

      if (evento.target === modalNuevaProgramacion) {
        cerrarModalProgramacion();
      }

    }
  );


  // ====================================================
  // VALIDAR FORMULARIO
  // ====================================================

 formNuevaProgramacion?.addEventListener(
  "submit",
  async (evento) => {

    evento.preventDefault();


    // ====================================================
    // VALIDAR RESPONSABLE
    // ====================================================

    if (!responsableId.value) {

      alert(
        "Selecciona un responsable de la lista de resultados."
      );

      responsableInput.focus();
      return;

    }


    // ====================================================
    // VALIDAR DATOS PRINCIPALES
    // ====================================================

    if (
      !fechaInput.value ||
      !horaInput.value ||
      !servicioSelect.value ||
      !ministerioSelect.value
    ) {

      alert(
        "Completa la fecha, hora, servicio y ministerio."
      );

      return;

    }


    try {

      if (botonGuardar) {

        botonGuardar.disabled = true;
        botonGuardar.textContent = "Guardando...";

      }


      // ==================================================
      // PREPARAR DATOS
      // ==================================================

      const datosProgramacion = {

        fecha: fechaInput.value,

        hora: horaInput.value,

        servicio: servicioSelect.value,

        ministerio: ministerioSelect.value,

        responsable: {
          id: responsableId.value,
          nombre: responsableInput.value.trim()
        },

        suplente: {
          id: suplenteId.value || "",
          nombre: suplenteInput.value.trim() || ""
        },

        estado: "pendiente",

        creadoPor: {
          uid: auth.currentUser?.uid || "",
          email: auth.currentUser?.email || ""
        },

        creadoEn: serverTimestamp()

      };


      // ==================================================
      // GUARDAR EN FIRESTORE
      // ==================================================

      const referenciaDocumento =
        await addDoc(
          collection(db, "programaciones"),
          datosProgramacion
        );


      console.log(
        "RED Stats | Programación guardada:",
        referenciaDocumento.id,
        datosProgramacion
      );


      alert(
        "✅ Programación guardada correctamente."
      );


      cerrarModalProgramacion();


    } catch (error) {

      console.error(
        "Error al guardar la programación:",
        error
      );


      alert(
        "No fue posible guardar la programación. Revisa la consola para más detalles."
      );


    } finally {

      if (botonGuardar) {

        botonGuardar.disabled = false;
        botonGuardar.textContent = "Guardar programación";

      }

    }

  }
);


  await cargarServidores();

}
// ======================================================
// CERRAR SESIÓN
// ======================================================

btnCerrarSesion?.addEventListener(
  "click",
  async () => {

    try {

      btnCerrarSesion.disabled = true;

      await signOut(auth);

      localStorage.removeItem(
        "redStatsUsuario"
      );

      sessionStorage.clear();

      window.location.href =
        "login.html";

    } catch (error) {

      console.error(
        "Error al cerrar sesión:",
        error
      );

      alert(
        "No fue posible cerrar la sesión. Inténtalo nuevamente."
      );

      btnCerrarSesion.disabled = false;

    }

  }
);


// ======================================================
// PROTEGER EL PANEL
// ======================================================

onAuthStateChanged(
  auth,
  (usuarioFirebase) => {

    if (!usuarioFirebase) {

      localStorage.removeItem(
        "redStatsUsuario"
      );

      window.location.href =
        "login.html";

      return;

    }

    const datosUsuario =
      obtenerDatosUsuario();

    mostrarUsuario(
      datosUsuario,
      usuarioFirebase
    );

    pantallaCarga?.classList.add(
      "hidden"
    );

  }
);
