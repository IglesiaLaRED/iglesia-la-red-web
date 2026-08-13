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
import { renderAcomodacion } from "./modulos/acomodacion.js";


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
// REPORTES
// ======================================================

async function cargarReportesUsuario(
  datosUsuario,
  rol,
  ministerioStats
) {

  const listaReportes =
    document.getElementById("listaReportes");

  if (!listaReportes) return;


  try {

    const consultaProgramaciones =
      query(
        collection(db, "programaciones"),
        orderBy("fecha", "desc")
      );


    const resultado =
      await getDocs(consultaProgramaciones);


    let programaciones =
      resultado.docs.map((documento) => ({
        id: documento.id,
        ...documento.data()
      }));


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
            programacion.ministerio === ministerioStats
        );

    }


    // ====================================================
    // SIN REPORTES
    // ====================================================

    if (programaciones.length === 0) {

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
            programacion.estado || "pendiente";

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
                    ${formatearFechaReporte(programacion.fecha)}
                    ·
                    ${formatearHoraReporte(programacion.hora)}
                  </p>


                  <p class="mt-3 text-sm text-slate-600">
                    Responsable:
                    <span class="font-bold text-blue-950">
                      ${
                        programacion.responsable?.nombre ||
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
                >
                  Abrir reporte
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
      .querySelectorAll(".btnAbrirReporte")
      .forEach((boton) => {

        boton.addEventListener(
          "click",
          () => {

            const ministerio =
              boton.dataset.ministerio;

            const programacionId =
              boton.dataset.id;
            
            const servicio =
              boton.dataset.servicio;

            const fecha =
              boton.dataset.fecha;
           
            if (ministerio === "acomodacion") {

              contenidoModulo.className = "mt-7";
              contenidoModulo.innerHTML = "";

              renderAcomodacion(
  contenidoModulo,
  {
    programacionId,
    servicio:
      obtenerNombreServicio(servicio),
    fecha
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

function obtenerNombreMinisterio(ministerio) {

  const nombres = {
    acomodacion: "Acomodación",
    seguridad: "Seguridad",
    comunicaciones: "Comunicaciones"
  };

  return nombres[ministerio] || ministerio;

}


function obtenerNombreServicio(servicio) {

  const nombres = {
    martes: "Martes · 7:00 p. m.",
    jueves: "Jueves · 7:00 p. m.",
    domingo8: "Domingo · 8:00 a. m.",
    domingo10: "Domingo · 10:00 a. m."
  };

  return nombres[servicio] || servicio;

}


function formatearFechaReporte(fecha) {

  if (!fecha) {
    return "Sin fecha";
  }

  const partes =
    String(fecha).split("-");

  if (partes.length !== 3) {
    return fecha;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


function formatearHoraReporte(hora) {

  if (!hora) {
    return "Sin hora";
  }

  const partes =
    String(hora).split(":");

  if (partes.length < 2) {
    return hora;
  }

  let horas =
    Number(partes[0]);

  const minutos =
    partes[1];

  if (!Number.isFinite(horas)) {
    return hora;
  }

  const periodo =
    horas >= 12 ? "p. m." : "a. m.";

  horas =
    horas % 12 || 12;

  return `${horas}:${minutos} ${periodo}`;

}


// ======================================================
// CERRAR SESIÓN
// ======================================================
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
