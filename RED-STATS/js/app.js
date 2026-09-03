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
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import { renderProgramaciones } from "./modules/programaciones.js";
import { renderAcomodacion } from "./modulos/acomodacion.js";
import { renderSeguridad } from "./modulos/seguridad.js";
import { renderComunicaciones } from "./modulos/comunicaciones.js";



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
  configurarPermisos(rol, datosUsuario?.ministerioStats || null);

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

function configurarPermisos(
  rol,
  ministerioStats = null
) {

  const rolesAdministrativos = [
    "superadmin",
    "admin"
  ];

  const esAdministrador =
    rolesAdministrativos.includes(rol);

  const ministeriosOperativos = [
    "acomodacion",
    "seguridad",
    "comunicaciones"
  ];

  const esUsuarioMinisterial =
    ministeriosOperativos.includes(
      ministerioStats
    );


  // ==========================================
  // USUARIOS
  // ==========================================

  if (menuUsuarios) {

    if (esAdministrador) {

      menuUsuarios.classList.remove("hidden");
      menuUsuarios.classList.add("flex");

    } else {

      menuUsuarios.classList.add("hidden");
      menuUsuarios.classList.remove("flex");

    }

  }


  // ==========================================
  // PROGRAMACIONES
  // ==========================================

  const menuProgramaciones =
    document.querySelector(
      '[data-modulo="programaciones"]'
    );

  if (menuProgramaciones) {

    menuProgramaciones.classList.toggle(
      "hidden",
      esUsuarioMinisterial
    );

  }


  // ==========================================
  // ESTADÍSTICAS
  // ==========================================

  const menuEstadisticas =
    document.querySelector(
      '[data-modulo="estadisticas"]'
    );

  if (menuEstadisticas) {

    menuEstadisticas.classList.toggle(
      "hidden",
      esUsuarioMinisterial
    );

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

  // ====================================================
  // DASHBOARD
  // ====================================================

  if (modulo === "dashboard") {

    contenidoModulo.className =
      "mt-7 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-7";

    contenidoModulo.innerHTML = `
      <div class="flex min-h-52 items-center justify-center text-center">

        <div>

          <div class="text-5xl">
            ⏳
          </div>

          <p class="mt-4 font-bold text-blue-950">
            Cargando estado semanal...
          </p>

          <p class="mt-2 text-sm text-slate-500">
            RED Stats está consultando las programaciones de esta semana.
          </p>

        </div>

      </div>
    `;

    cargarDashboard();

    return;

  }

// ======================================================
// DASHBOARD — ESTADO SEMANAL
// ======================================================

async function cargarDashboard() {

  try {

    // ====================================================
    // OBTENER SEMANA ACTUAL
    // ====================================================

    const hoy =
      new Date();

    const diaSemana =
      hoy.getDay();

    const diferenciaLunes =
      diaSemana === 0
        ? -6
        : 1 - diaSemana;

    const lunes =
      new Date(hoy);

    lunes.setDate(
      hoy.getDate() + diferenciaLunes
    );

    lunes.setHours(
      0,
      0,
      0,
      0
    );

    const domingo =
      new Date(lunes);

    domingo.setDate(
      lunes.getDate() + 6
    );

    domingo.setHours(
      23,
      59,
      59,
      999
    );


    // ====================================================
    // CONVERTIR FECHAS A YYYY-MM-DD
    // ====================================================

    const convertirFecha =
      (fecha) => {

        const year =
          fecha.getFullYear();

        const month =
          String(
            fecha.getMonth() + 1
          ).padStart(
            2,
            "0"
          );

        const day =
          String(
            fecha.getDate()
          ).padStart(
            2,
            "0"
          );

        return `${year}-${month}-${day}`;

      };


    const fechaInicio =
      convertirFecha(lunes);

    const fechaFin =
      convertirFecha(domingo);


    // ====================================================
    // LEER PROGRAMACIONES
    // ====================================================

    const snapshot =
      await getDocs(
        collection(
          db,
          "programaciones"
        )
      );


    const programaciones =
      snapshot.docs
        .map(
          (documento) => ({
            id: documento.id,
            ...documento.data()
          })
        )
        .filter(
          (programacion) =>
            programacion.fecha >= fechaInicio &&
            programacion.fecha <= fechaFin
        );


    // ====================================================
    // CALCULAR INDICADORES
    // ====================================================

    const recibidos =
      programaciones.filter(
        (programacion) =>
          programacion.estado ===
          "completado"
      ).length;


    const pendientes =
      programaciones.filter(
        (programacion) =>
          programacion.estado !==
          "completado"
      ).length;


    // Un servicio puede tener tres programaciones:
    // Acomodación, Seguridad y Comunicaciones.
    // Aquí se cuenta solamente una vez.

    const servicios =
      new Set(
        programaciones.map(
          (programacion) =>
            `${programacion.fecha}|${programacion.servicio}`
        )
      );


    const ministerios =
      new Set(
        programaciones
          .map(
            (programacion) =>
              programacion.ministerio
          )
          .filter(Boolean)
      );


    // ====================================================
    // ACTUALIZAR TARJETAS
    // ====================================================

    const tarjetaRecibidos =
      document.getElementById(
        "dashboardReportesRecibidos"
      );

    const tarjetaPendientes =
      document.getElementById(
        "dashboardReportesPendientes"
      );

    const tarjetaServicios =
      document.getElementById(
        "dashboardServicios"
      );

    const tarjetaMinisterios =
      document.getElementById(
        "dashboardMinisterios"
      );


    if (tarjetaRecibidos) {
      tarjetaRecibidos.textContent =
        recibidos;
    }


    if (tarjetaPendientes) {
      tarjetaPendientes.textContent =
        pendientes;
    }


    if (tarjetaServicios) {
      tarjetaServicios.textContent =
        servicios.size;
    }


    if (tarjetaMinisterios) {
      tarjetaMinisterios.textContent =
        ministerios.size;
    }


    // ====================================================
    // CENTRO DE MANDO
    // ====================================================

    contenidoModulo.innerHTML = `
      <div>

        <p class="text-sm font-semibold text-cyan-600">
          Resumen semanal
        </p>

        <h3 class="mt-1 text-2xl font-black text-blue-950">
          Estado general de los reportes
        </h3>

        <p class="mt-2 text-sm text-slate-500">
          Semana del ${fechaInicio} al ${fechaFin}
        </p>


        <div class="mt-7 grid gap-4 sm:grid-cols-3">

          <div
            class="rounded-2xl border border-green-200 bg-green-50 p-5"
          >

            <p class="text-sm font-semibold text-green-700">
              Reportes recibidos
            </p>

            <p class="mt-2 text-3xl font-black text-green-800">
              ${recibidos}
            </p>

          </div>


          <div
            class="rounded-2xl border border-amber-200 bg-amber-50 p-5"
          >

            <p class="text-sm font-semibold text-amber-700">
              Reportes pendientes
            </p>

            <p class="mt-2 text-3xl font-black text-amber-800">
              ${pendientes}
            </p>

          </div>


          <div
            class="rounded-2xl border border-blue-200 bg-blue-50 p-5"
          >

            <p class="text-sm font-semibold text-blue-700">
              Progreso semanal
            </p>

            <p class="mt-2 text-3xl font-black text-blue-950">
              ${recibidos} / ${programaciones.length}
            </p>

          </div>

        </div>


        <div
          class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5"
        >

          <p class="font-bold text-blue-950">
            📊 RED Stats ya está leyendo Firestore
          </p>

          <p class="mt-2 text-sm text-slate-500">
            Encontramos ${programaciones.length}
            programaciones correspondientes a la semana actual.
          </p>

        </div>

      </div>
    `;


    console.log(
      "RED Stats | Dashboard:",
      {
        fechaInicio,
        fechaFin,
        programaciones:
          programaciones.length,
        recibidos,
        pendientes,
        servicios:
          servicios.size,
        ministerios:
          ministerios.size
      }
    );


  } catch (error) {

    console.error(
      "Error al cargar Dashboard:",
      error
    );


    contenidoModulo.innerHTML = `
      <div class="py-12 text-center">

        <div class="text-5xl">
          ⚠️
        </div>

        <p class="mt-4 font-bold text-red-700">
          No fue posible cargar el Dashboard.
        </p>

        <p class="mt-2 text-sm text-slate-500">
          Revisa la consola para obtener más información.
        </p>

      </div>
    `;

  }

}
  
  // ====================================================
  // PROGRAMACIONES
  // ====================================================

  if (modulo === "programaciones") {

    contenidoModulo.className = "mt-7";

    contenidoModulo.innerHTML =
      renderProgramaciones();

    configurarEventosProgramaciones();

    return;

  }


  // ====================================================
  // REPORTES
  // ====================================================

  if (modulo === "reportes") {

    contenidoModulo.className = "mt-7";

    const datosUsuario =
      obtenerDatosUsuario();

    const rol =
      datosUsuario?.rol || "";

    const ministerioStats =
      datosUsuario?.ministerioStats || null;


    contenidoModulo.innerHTML = `
      <section class="space-y-6">

        <div>

          <p class="text-sm font-semibold text-cyan-600">
            Gestión de reportes
          </p>

          <h2 class="mt-1 text-3xl font-black text-blue-950">
            ${
              rol === "admin" || rol === "superadmin"
                ? "Reportes ministeriales"
                : "Mis reportes"
            }
          </h2>

          <p class="mt-2 text-sm text-slate-500">
            ${
              rol === "admin" || rol === "superadmin"
                ? "Supervisa los reportes asignados a los ministerios."
                : "Aquí aparecerán los reportes asignados a tu ministerio."
            }
          </p>

        </div>


        <div
          id="listaReportes"
          class="space-y-4"
        >

          <div class="flex min-h-52 items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center">

            <div>

              <div class="text-4xl">
                ⏳
              </div>

              <p class="mt-3 font-bold text-blue-950">
                Cargando reportes...
              </p>

            </div>

          </div>

        </div>

      </section>
    `;


    cargarReportesUsuario(
      datosUsuario,
      rol,
      ministerioStats
    );

    return;

  }


  // ====================================================
  // MÓDULOS PENDIENTES
  // ====================================================

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
          "Error al guardar programación:",
          error
        );

        alert(
          "No fue posible guardar la programación."
        );

      } finally {

        if (botonGuardar) {

          botonGuardar.disabled = false;
          botonGuardar.textContent = "Guardar programación";

        }

      }

    }
  );


  // ====================================================
  // SERVICIO → HORA AUTOMÁTICA
  // ====================================================

  servicioSelect?.addEventListener(
    "change",
    () => {

      const horasPorServicio = {

        martes: "19:00",
        jueves: "19:00",
        domingo8: "08:00",
        domingo10: "10:00"

      };

      const hora =
        horasPorServicio[
          servicioSelect.value
        ];

      if (hora && horaInput) {
        horaInput.value = hora;
      }

    }
  );


  // ====================================================
  // CARGAR PROGRAMACIONES
  // ====================================================

  async function cargarProgramaciones() {

    if (!listaProgramaciones) {
      return;
    }

// ====================================================
// MOSTRAR SOLO SEMANA ACTUAL Y FUTURAS
// ====================================================

const hoy = new Date();

hoy.setHours(0, 0, 0, 0);


// Obtener el lunes de la semana actual
const inicioSemana = new Date(hoy);

const diaSemana =
  hoy.getDay();

const diferenciaLunes =
  diaSemana === 0
    ? -6
    : 1 - diaSemana;

inicioSemana.setDate(
  hoy.getDate() + diferenciaLunes
);


const anioInicio =
  inicioSemana.getFullYear();

const mesInicio =
  String(
    inicioSemana.getMonth() + 1
  ).padStart(2, "0");

const diaInicio =
  String(
    inicioSemana.getDate()
  ).padStart(2, "0");


const fechaInicioSemana =
  `${anioInicio}-${mesInicio}-${diaInicio}`;

    
    listaProgramaciones.innerHTML = `
      <div class="flex min-h-52 items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center">

        <div>

          <div class="text-4xl">
            ⏳
          </div>

          <p class="mt-3 font-bold text-blue-950">
            Cargando programaciones...
          </p>

        </div>

      </div>
    `;


    try {

      const consulta =
        query(
          collection(
            db,
            "programaciones"
          ),
          orderBy(
            "fecha",
            "desc"
          )
        );


      const resultado =
        await getDocs(
          consulta
        );


      if (resultado.empty) {

        listaProgramaciones.innerHTML = `
          <div class="flex min-h-52 items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center">

            <div>

              <div class="text-5xl">
                📅
              </div>

              <p class="mt-4 font-bold text-blue-950">
                No hay programaciones registradas
              </p>

              <p class="mt-2 text-sm text-slate-500">
                Crea la primera programación de RED Stats.
              </p>

            </div>

          </div>
        `;

        return;

      }


      listaProgramaciones.innerHTML =
        resultado.docs
          .map((documento) => {

            const datos =
  documento.data();


// ==================================================
// NORMALIZAR MINISTERIO
// Compatible con estructura nueva y antigua
// ==================================================

const ministerio =
  datos.ministerio &&
  typeof datos.ministerio === "object"
    ? datos.ministerio.id || ""
    : datos.ministerio || "";


// ==================================================
// NORMALIZAR SERVICIO
// Compatible con estructura nueva y antigua
// ==================================================

const servicio =
  datos.servicio &&
  typeof datos.servicio === "object"
    ? datos.servicio.id || ""
    : datos.servicio || "";


// ==================================================
// NORMALIZAR FECHA Y HORA
// ==================================================

let fecha =
  datos.fecha || "";

let hora =
  datos.hora || "";


if (
  fecha &&
  typeof fecha.toDate === "function"
) {

  const fechaJS =
    fecha.toDate();

  const anio =
    fechaJS.getFullYear();

  const mes =
    String(
      fechaJS.getMonth() + 1
    ).padStart(2, "0");

  const dia =
    String(
      fechaJS.getDate()
    ).padStart(2, "0");


  fecha =
  `${anio}-${mes}-${dia}`;


  // Si el documento antiguo no tiene
  // una hora separada, tomarla del Timestamp
  if (!hora) {

    const horas =
      String(
        fechaJS.getHours()
      ).padStart(2, "0");

    const minutos =
      String(
        fechaJS.getMinutes()
      ).padStart(2, "0");

    hora =
  `${horas}:${minutos}`;

  }

}


// ==================================================
// PROGRAMACIÓN NORMALIZADA
// ==================================================

const programacion = {

  ...datos,

  ministerio,
  servicio,
  fecha,
  hora

};

// ==================================================
// OCULTAR PROGRAMACIONES HISTÓRICAS
// ==================================================

if (
  programacion.fecha &&
  programacion.fecha < fechaInicioSemana
) {

  return "";

}
            const estado =
              programacion.estado ||
              "pendiente";


            const esPendiente =
              estado === "pendiente";


            return `
              <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

                <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                  <div>

                    <div class="flex flex-wrap items-center gap-2">

                      <span
                        class="rounded-full px-3 py-1 text-xs font-bold ${
                          esPendiente
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                        }"
                      >
                        ${
                          esPendiente
                            ? "⏳ Pendiente"
                            : "✅ Completado"
                        }
                      </span>

                      <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
                        ${
                          obtenerNombreMinisterio(
                            programacion.ministerio
                          )
                        }
                      </span>

                    </div>


                    <h3 class="mt-4 text-2xl font-black text-blue-950">
                      ${
                        obtenerNombreServicio(
                          programacion.servicio
                        )
                      }
                    </h3>


                    <p class="mt-1 text-sm text-slate-500">
                      ${
                        formatearFechaReporte(
                          programacion.fecha
                        )
                      }
                      ·
                      ${
                        formatearHoraReporte(
                          programacion.hora
                        )
                      }
                    </p>


                    <p class="mt-3 text-sm text-slate-600">

                      Responsable:

                      <span class="font-bold text-blue-950">
                        ${
                          programacion.responsable
                            ?.nombre ||
                          "Sin responsable"
                        }
                      </span>

                    </p>


                    ${
                      programacion.suplente
                        ?.nombre
                        ? `
                          <p class="mt-1 text-sm text-slate-500">

                            Suplente:

                            <span class="font-semibold text-blue-900">
                              ${
                                programacion
                                  .suplente
                                  .nombre
                              }
                            </span>

                          </p>
                        `
                        : ""
                    }

                  </div>

                </div>

              </article>
            `;

          })
          .join("");

      // ====================================================
// SIN PROGRAMACIONES PARA ESTA SEMANA
// ====================================================

if (
  !listaProgramaciones.innerHTML.trim()
) {

  listaProgramaciones.innerHTML = `
    <div class="flex min-h-52 items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center">

      <div>

        <div class="text-5xl">
          📅
        </div>

        <p class="mt-4 font-bold text-blue-950">
          No hay programaciones para esta semana
        </p>

        <p class="mt-2 text-sm text-slate-500">
          Las programaciones anteriores permanecen guardadas como historial.
        </p>

      </div>

    </div>
  `;

}


    } catch (error) {

      console.error(
        "Error al cargar programaciones:",
        error
      );


      listaProgramaciones.innerHTML = `
        <div class="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">

          <p class="font-bold text-red-700">
            No fue posible cargar las programaciones.
          </p>

        </div>
      `;

    }

  }


  // ====================================================
  // INICIAR
  // ====================================================

  await cargarServidores();

  await cargarProgramaciones();

}


// ======================================================
// REPORTES
// ======================================================

async function cargarReportesUsuario(
  datosUsuario,
  rol,
  ministerioStats
) {

  const listaReportes =
    document.getElementById(
      "listaReportes"
    );


  if (!listaReportes) {
    return;
  }


  try {

    // ====================================================
    // CARGAR PROGRAMACIONES
    // ====================================================

    const consulta =
      query(
        collection(
          db,
          "programaciones"
        ),
        orderBy(
          "fecha",
          "desc"
        )
      );


    const resultado =
      await getDocs(
        consulta
      );


    // ====================================================
    // NORMALIZAR PROGRAMACIONES
    //
    // RED Stats ha tenido dos estructuras:
    //
    // NUEVA:
    // ministerio: "acomodacion"
    // servicio: "domingo10"
    // fecha: "2026-08-23"
    //
    // ANTIGUA:
    // ministerio: { id, nombre }
    // servicio: { id, nombre }
    // fecha: Timestamp
    //
    // Aquí hacemos compatibles ambas.
    // ====================================================

    let programaciones =
      resultado.docs.map((documento) => {

        const datos =
          documento.data();


        // ==================================================
        // NORMALIZAR MINISTERIO
        // ==================================================

        const ministerio =
          datos.ministerio &&
          typeof datos.ministerio === "object"
            ? datos.ministerio.id || ""
            : datos.ministerio || "";


        // ==================================================
        // NORMALIZAR SERVICIO
        // ==================================================

        const servicio =
          datos.servicio &&
          typeof datos.servicio === "object"
            ? datos.servicio.id || ""
            : datos.servicio || "";


        // ==================================================
        // NORMALIZAR FECHA Y HORA
        // ==================================================

        let fecha =
          datos.fecha || "";

        let hora =
          datos.hora || "";


        if (
          fecha &&
          typeof fecha.toDate === "function"
        ) {

          const fechaJS =
            fecha.toDate();


          const anio =
            fechaJS.getFullYear();

          const mes =
            String(
              fechaJS.getMonth() + 1
            ).padStart(
              2,
              "0"
            );

          const dia =
            String(
              fechaJS.getDate()
            ).padStart(
              2,
              "0"
            );


          fecha =
            `${anio}-${mes}-${dia}`;


          if (!hora) {

            const horas =
              String(
                fechaJS.getHours()
              ).padStart(
                2,
                "0"
              );

            const minutos =
              String(
                fechaJS.getMinutes()
              ).padStart(
                2,
                "0"
              );


            hora =
              `${horas}:${minutos}`;

          }

        }


        return {

          id:
            documento.id,

          ...datos,

          ministerio,

          servicio,

          fecha,

          hora

        };

      });


    // ====================================================
    // SOLO MINISTERIOS QUE REPORTAN POR SERVICIO
    // ====================================================

    const MINISTERIOS_REPORTES_REGULARES = [
      "acomodacion",
      "seguridad",
      "comunicaciones"
    ];


    programaciones =
      programaciones.filter(
        (programacion) =>
          MINISTERIOS_REPORTES_REGULARES.includes(
            programacion.ministerio
          )
      );


    // ====================================================
    // FILTRAR SEGÚN PERMISOS
    // ====================================================

    const esAdministrador =
      rol === "admin" ||
      rol === "superadmin";


    if (!esAdministrador) {

      if (!ministerioStats) {

        listaReportes.innerHTML = `
          <div class="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">

            <p class="font-bold text-amber-800">
              Tu usuario no tiene un ministerio asignado en RED Stats.
            </p>

          </div>
        `;

        return;

      }


      programaciones =
        programaciones.filter(
          (programacion) =>
            programacion.ministerio ===
            ministerioStats
        );

    }


    // ====================================================
    // SIN REPORTES
    // ====================================================

    if (
      programaciones.length === 0
    ) {

      listaReportes.innerHTML = `
        <div class="flex min-h-52 items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 text-center">

          <div>

            <div class="text-5xl">
              📝
            </div>

            <p class="mt-4 font-bold text-blue-950">
              No hay reportes asignados
            </p>

            <p class="mt-2 text-sm text-slate-500">
              Cuando exista una programación aparecerá aquí.
            </p>

          </div>

        </div>
      `;

      return;

    }


    // ====================================================
    // MOSTRAR REPORTES
    // ====================================================

    listaReportes.innerHTML =
      programaciones
        .map((programacion) => {

          const nombreMinisterio =
            obtenerNombreMinisterio(
              programacion.ministerio
            );


          const nombreServicio =
            obtenerNombreServicio(
              programacion.servicio
            );


          const estado =
            programacion.estado ||
            "pendiente";


          const esPendiente =
            estado === "pendiente";


          return `
            <article class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

              <div class="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                <div>

                  <div class="flex flex-wrap items-center gap-2">

                    <span
                      class="rounded-full px-3 py-1 text-xs font-bold ${
                        esPendiente
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                      }"
                    >
                      ${
                        esPendiente
                          ? "⏳ Pendiente"
                          : "✅ Recibido"
                      }
                    </span>


                    <span class="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-800">
                      ${nombreMinisterio}
                    </span>

                  </div>


                  <h3 class="mt-4 text-2xl font-black text-blue-950">
                    ${nombreServicio}
                  </h3>


                  <p class="mt-1 text-sm text-slate-500">
                    ${
                      formatearFechaReporte(
                        programacion.fecha
                      )
                    }
                    ·
                    ${
                      formatearHoraReporte(
                        programacion.hora
                      )
                    }
                  </p>


                  <p class="mt-3 text-sm text-slate-600">

                    Responsable:

                    <span class="font-bold text-blue-950">
                      ${
                        programacion.responsable
                          ?.nombre ||
                        "Sin responsable"
                      }
                    </span>

                  </p>

                </div>


               <button
  type="button"
  class="btnAbrirReporte rounded-xl bg-blue-900 px-5 py-3 font-bold text-white transition hover:bg-blue-800"
  data-id="${programacion.id}"
  data-ministerio="${programacion.ministerio}"
  data-servicio="${programacion.servicio}"
  data-fecha="${programacion.fecha}"
  data-estado="${estado}"
  data-responsable="${programacion.responsable?.nombre || ""}"
>
                  ${
                    esPendiente
                      ? "Abrir reporte"
                      : "Ver reporte"
                  }
                </button>

              </div>

            </article>
          `;

        })
        .join("");


    // ====================================================
    // ABRIR REPORTE
    // ====================================================

    listaReportes
      .querySelectorAll(
        ".btnAbrirReporte"
      )
      .forEach((boton) => {

        boton.addEventListener(
          "click",
          async () => {

const ministerio =
  boton.dataset.ministerio;

const programacionId =
  boton.dataset.id;

const servicio =
  boton.dataset.servicio;

const fecha =
  boton.dataset.fecha;

const estado =
  boton.dataset.estado ||
  "pendiente";

const responsable =
  boton.dataset.responsable ||
  "";


            // ==================================================
            // MÓDULO ACOMODACIÓN
            // ==================================================

            if (
              ministerio ===
              "acomodacion"
            ) {

              contenidoModulo.className =
                "mt-7";

              contenidoModulo.innerHTML =
                "";


              if (
                estado !==
                "pendiente"
              ) {

                try {

                  const reporteRef =
                    doc(
                      db,
                      "reportes",
                      programacionId
                    );


                  const reporteSnap =
                    await getDoc(
                      reporteRef
                    );


                  if (
                    !reporteSnap.exists()
                  ) {

                    alert(
                      "El reporte figura como recibido, pero no se encontró el documento guardado."
                    );

                    return;

                  }


                  renderAcomodacion(
                    contenidoModulo,
                    {

                      programacionId,

                      servicioId:
                        servicio,

                      servicio:
                        obtenerNombreServicio(
                          servicio
                        ),

                      fecha,

                      modo:
                        "lectura",

                      reporteExistente:
                        reporteSnap.data()

                    }
                  );


                } catch (error) {

                  console.error(
                    "Error al cargar reporte recibido de Acomodación:",
                    error
                  );


                  alert(
                    "No fue posible cargar el reporte recibido de Acomodación."
                  );

                }


                return;

              }


renderAcomodacion(
  contenidoModulo,
  {
    programacionId,

    servicioId:
      servicio,

    servicio:
      obtenerNombreServicio(
        servicio
      ),

    fecha,

    responsable,

    modo:
      "edicion"
  }
);


              return;

            }


            // ==================================================
            // MÓDULO SEGURIDAD
            // ==================================================

            if (
              ministerio ===
              "seguridad"
            ) {

              contenidoModulo.className =
                "mt-7";

              contenidoModulo.innerHTML =
                "";


              if (
                estado !==
                "pendiente"
              ) {

                try {

                  const reporteRef =
                    doc(
                      db,
                      "reportes",
                      programacionId
                    );


                  const reporteSnap =
                    await getDoc(
                      reporteRef
                    );


                  if (
                    !reporteSnap.exists()
                  ) {

                    alert(
                      "El reporte figura como recibido, pero no se encontró el documento guardado."
                    );

                    return;

                  }


                  renderSeguridad(
                    contenidoModulo,
                    {

                      programacionId,

                      servicioId:
                        servicio,

                      servicio:
                        obtenerNombreServicio(
                          servicio
                        ),

                      fecha,

                      modo:
                        "lectura",

                      reporteExistente:
                        reporteSnap.data()

                    }
                  );


                } catch (error) {

                  console.error(
                    "Error al cargar reporte recibido de Seguridad:",
                    error
                  );


                  alert(
                    "No fue posible cargar el reporte recibido de Seguridad."
                  );

                }


                return;

              }


renderSeguridad(
  contenidoModulo,
  {
    programacionId,

    servicioId:
      servicio,

    servicio:
      obtenerNombreServicio(
        servicio
      ),

    fecha,

    responsable,

    modo:
      "edicion"
  }
);


              return;

            }


            // ==================================================
            // MÓDULO COMUNICACIONES
            // ==================================================

            if (
              ministerio ===
              "comunicaciones"
            ) {

              contenidoModulo.className =
                "mt-7";

              contenidoModulo.innerHTML =
                "";


              if (
                estado !==
                "pendiente"
              ) {

                try {

                  const reporteRef =
                    doc(
                      db,
                      "reportes",
                      programacionId
                    );


                  const reporteSnap =
                    await getDoc(
                      reporteRef
                    );


                  if (
                    !reporteSnap.exists()
                  ) {

                    alert(
                      "El reporte figura como recibido, pero no se encontró el documento guardado."
                    );

                    return;

                  }


                  renderComunicaciones(
                    contenidoModulo,
                    {

                      programacionId,

                      servicioId:
                        servicio,

                      servicio:
                        obtenerNombreServicio(
                          servicio
                        ),

                      fecha,

                      modo:
                        "lectura",

                      reporteExistente:
                        reporteSnap.data()

                    }
                  );


                } catch (error) {

                  console.error(
                    "Error al cargar reporte recibido de Comunicaciones:",
                    error
                  );


                  alert(
                    "No fue posible cargar el reporte recibido de Comunicaciones."
                  );

                }


                return;

              }


renderComunicaciones(
  contenidoModulo,
  {
    programacionId,

    servicioId:
      servicio,

    servicio:
      obtenerNombreServicio(
        servicio
      ),

    fecha,

    responsable,

    modo:
      "edicion"
  }
);


              return;

            }


            alert(
              "Este ministerio todavía no tiene formulario conectado."
            );

          }
        );

      });


  } catch (error) {

    console.error(
      "Error al cargar reportes:",
      error
    );


    listaReportes.innerHTML = `
      <div class="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">

        <p class="font-bold text-red-700">
          No fue posible cargar los reportes.
        </p>

      </div>
    `;

  }

}


// ======================================================
// NOMBRES Y FORMATO DE REPORTES
// ======================================================

function obtenerNombreMinisterio(
  ministerio
) {

  const nombres = {

    acomodacion:
      "Acomodación",

    seguridad:
      "Seguridad",

    comunicaciones:
      "Comunicaciones"

  };


  return (
    nombres[ministerio] ||
    ministerio
  );

}


function obtenerNombreServicio(
  servicio
) {

  const nombres = {

    martes:
      "Martes · 7:00 p. m.",

    jueves:
      "Jueves · 7:00 p. m.",

    domingo8:
      "Domingo · 8:00 a. m.",

    domingo10:
      "Domingo · 10:00 a. m."

  };


  return (
    nombres[servicio] ||
    servicio
  );

}


function formatearFechaReporte(
  fecha
) {

  if (!fecha) {
    return "Sin fecha";
  }


  const partes =
    String(fecha).split("-");


  if (
    partes.length !== 3
  ) {

    return fecha;

  }


  return (
    `${partes[2]}/` +
    `${partes[1]}/` +
    `${partes[0]}`
  );

}


function formatearHoraReporte(
  hora
) {

  if (!hora) {
    return "Sin hora";
  }


  const partes =
    String(hora).split(":");


  if (
    partes.length < 2
  ) {

    return hora;

  }


  let horas =
    Number(
      partes[0]
    );


  const minutos =
    partes[1];


  if (
    !Number.isFinite(
      horas
    )
  ) {

    return hora;

  }


  const periodo =
    horas >= 12
      ? "p. m."
      : "a. m.";


  horas =
    horas % 12 || 12;


  return (
    `${horas}:` +
    `${minutos} ` +
    `${periodo}`
  );

}


// ======================================================
// CERRAR SESIÓN
// ======================================================

btnCerrarSesion?.addEventListener(
  "click",
  async () => {

    try {

      btnCerrarSesion.disabled =
        true;


      await signOut(
        auth
      );


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


      btnCerrarSesion.disabled =
        false;

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
