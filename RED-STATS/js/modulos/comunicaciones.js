// ============================================================
// RED STATS
// Módulo: Comunicaciones
// Iglesia La RED
// ============================================================

import { db, auth } from "../../firebase.js";

import {
  doc,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================

export function renderComunicaciones(
  contenedor,
  contexto = {}
) {

  if (!contenedor) {

    console.error(
      "RED Stats: No se encontró el contenedor de Comunicaciones."
    );

    return;
  }


  const {
    programacionId = "",
    servicioId = "",
    servicio = "",
    fecha = "",
    modo = "edicion",
    reporteExistente = null
  } = contexto;


  contenedor.innerHTML = `

    <div class="space-y-7">

      <!-- ==================================================
           ENCABEZADO
      =================================================== -->

      <section>

        <p class="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-600">
          Ministerio
        </p>

        <div class="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 class="text-3xl font-black text-blue-950">
              Comunicaciones
            </h2>

            <p class="mt-2 text-sm text-slate-500">
              Registro de audiencia en línea y servidores del ministerio.
            </p>

          </div>

          <div
            class="inline-flex items-center gap-2 self-start rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-900"
          >
            📡 Alcance digital
          </div>

        </div>


        ${
          servicio || fecha
            ? `
              <div class="mt-5 rounded-2xl border border-blue-100 bg-blue-50 px-5 py-4">

                <p class="text-xs font-bold uppercase tracking-wider text-cyan-600">
                  Programación
                </p>

                <p class="mt-1 font-black text-blue-950">
                  ${servicio || "Servicio"}
                </p>

                ${
                  fecha
                    ? `
                      <p class="mt-1 text-sm text-blue-700">
                        ${formatearFecha(fecha)}
                      </p>
                    `
                    : ""
                }

              </div>
            `
            : ""
        }

      </section>


      <!-- ==================================================
           CAPTURA DE DATOS
      =================================================== -->

      <section class="grid gap-5 lg:grid-cols-3">


        <!-- YOUTUBE -->

        <article
          class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >

          <div class="flex items-center justify-between">

            <div>

              <p class="text-xs font-bold uppercase tracking-wider text-red-500">
                Plataforma
              </p>

              <h3 class="mt-1 text-xl font-black text-blue-950">
                YouTube
              </h3>

            </div>

            <div
              class="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-2xl"
            >
              📺
            </div>

          </div>

          <label class="mt-6 block">

            <span class="mb-2 block text-sm font-bold text-slate-600">
              Vistas
            </span>

            <input
              id="youtubeComunicaciones"
              type="number"
              min="0"
              step="1"
              inputmode="numeric"
              placeholder="0"
              class="campo-comunicaciones w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-2xl font-black text-blue-950 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            >

          </label>

        </article>


        <!-- FACEBOOK -->

        <article
          class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >

          <div class="flex items-center justify-between">

            <div>

              <p class="text-xs font-bold uppercase tracking-wider text-blue-600">
                Plataforma
              </p>

              <h3 class="mt-1 text-xl font-black text-blue-950">
                Facebook
              </h3>

            </div>

            <div
              class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl"
            >
              📘
            </div>

          </div>

          <label class="mt-6 block">

            <span class="mb-2 block text-sm font-bold text-slate-600">
              Vistas
            </span>

            <input
              id="facebookComunicaciones"
              type="number"
              min="0"
              step="1"
              inputmode="numeric"
              placeholder="0"
              class="campo-comunicaciones w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-2xl font-black text-blue-950 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            >

          </label>

        </article>


        <!-- SERVIDORES -->

        <article
          class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
        >

          <div class="flex items-center justify-between">

            <div>

              <p class="text-xs font-bold uppercase tracking-wider text-cyan-600">
                Equipo
              </p>

              <h3 class="mt-1 text-xl font-black text-blue-950">
                Comunicaciones
              </h3>

            </div>

            <div
              class="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-2xl"
            >
              🎥
            </div>

          </div>

          <label class="mt-6 block">

            <span class="mb-2 block text-sm font-bold text-slate-600">
              Servidores
            </span>

            <input
              id="servidoresComunicaciones"
              type="number"
              min="0"
              step="1"
              inputmode="numeric"
              placeholder="0"
              class="campo-comunicaciones w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-2xl font-black text-blue-950 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
            >

          </label>

        </article>

      </section>


      <!-- ==================================================
           RESUMEN
      =================================================== -->

      <section
        class="rounded-3xl bg-blue-950 p-6 text-white shadow-xl sm:p-7"
      >

        <div>

          <p class="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
            Consolidado
          </p>

          <h3 class="mt-1 text-2xl font-black">
            Audiencia en Línea
          </h3>

          <p class="mt-2 text-sm text-blue-200">
            RED Stats suma automáticamente YouTube + Facebook.
          </p>

        </div>


        <div class="mt-6 grid gap-4 sm:grid-cols-3">

          <article class="rounded-2xl bg-white/10 p-4">

            <p class="text-sm text-blue-200">
              📺 YouTube
            </p>

            <p
              id="totalYoutubeComunicaciones"
              class="mt-2 text-3xl font-black"
            >
              0
            </p>

          </article>


          <article class="rounded-2xl bg-white/10 p-4">

            <p class="text-sm text-blue-200">
              📘 Facebook
            </p>

            <p
              id="totalFacebookComunicaciones"
              class="mt-2 text-3xl font-black"
            >
              0
            </p>

          </article>


          <article class="rounded-2xl bg-cyan-400 p-4 text-blue-950">

            <p class="text-sm font-bold">
              🌐 Total Online
            </p>

            <p
              id="totalOnlineComunicaciones"
              class="mt-2 text-4xl font-black"
            >
              0
            </p>

          </article>

        </div>


        <div
          class="mt-4 flex items-center justify-between rounded-2xl bg-white/10 px-5 py-4"
        >

          <span class="text-sm font-semibold text-blue-200">
            🎥 Servidores de Comunicaciones
          </span>

          <span
            id="totalServidoresComunicaciones"
            class="text-2xl font-black"
          >
            0
          </span>

        </div>

      </section>


      <!-- ==================================================
           ACCIONES
      =================================================== -->

      <section
        id="accionesComunicaciones"
        class="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end"
      >

        <button
          id="btnLimpiarComunicaciones"
          type="button"
          class="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-100"
        >
          Limpiar
        </button>


        <button
          id="btnGuardarComunicaciones"
          type="button"
          class="rounded-xl bg-blue-900 px-6 py-3 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Guardar reporte
        </button>

      </section>


      <!-- ==================================================
           ESTADO
      =================================================== -->

      <div
        id="estadoComunicaciones"
        class="hidden rounded-2xl px-5 py-4 text-sm font-semibold"
      ></div>

    </div>
  `;


  conectarEventosComunicaciones(
    contenedor,
    {
      programacionId,
      servicioId,
      servicio,
      fecha,
      modo
    }
  );


  if (
    modo === "lectura" &&
    reporteExistente
  ) {

    cargarDatosReporteExistente(
      contenedor,
      reporteExistente
    );

    activarModoLectura(
      contenedor
    );

  } else {

    calcularTotalesComunicaciones(
      contenedor
    );

  }

}


// ============================================================
// EVENTOS
// ============================================================

function conectarEventosComunicaciones(
  contenedor,
  contexto
) {

  const campos =
    contenedor.querySelectorAll(
      ".campo-comunicaciones"
    );


  // ==========================================================
  // RECALCULAR
  // ==========================================================

  campos.forEach((campo) => {

    campo.addEventListener(
      "input",
      () => {

        if (Number(campo.value) < 0) {
          campo.value = 0;
        }

        calcularTotalesComunicaciones(
          contenedor
        );

      }
    );

  });


  // ==========================================================
  // LIMPIAR
  // ==========================================================

  const btnLimpiar =
    contenedor.querySelector(
      "#btnLimpiarComunicaciones"
    );


  btnLimpiar?.addEventListener(
    "click",
    () => {

      const confirmar =
        window.confirm(
          "¿Deseas limpiar todos los datos ingresados?"
        );

      if (!confirmar) {
        return;
      }


      campos.forEach((campo) => {
        campo.value = "";
      });


      calcularTotalesComunicaciones(
        contenedor
      );

      ocultarEstado(
        contenedor
      );

    }
  );


  // ==========================================================
  // GUARDAR
  // ==========================================================

  const btnGuardar =
    contenedor.querySelector(
      "#btnGuardarComunicaciones"
    );


  btnGuardar?.addEventListener(
    "click",
    async () => {

      await guardarReporteComunicaciones(
        contenedor,
        contexto
      );

    }
  );

}


// ============================================================
// GUARDAR REPORTE
// ============================================================

async function guardarReporteComunicaciones(
  contenedor,
  contexto
) {

  const btnGuardar =
    contenedor.querySelector(
      "#btnGuardarComunicaciones"
    );


  const {
    programacionId,
    servicioId,
    fecha
  } = contexto;


  // ==========================================================
  // VALIDAR PROGRAMACIÓN
  // ==========================================================

  if (!programacionId) {

    mostrarEstado(
      contenedor,
      "No fue posible identificar la programación de este reporte.",
      "error"
    );

    console.error(
      "RED Stats | Falta programacionId en Comunicaciones."
    );

    return;
  }


  // ==========================================================
  // VALIDAR USUARIO
  // ==========================================================

  const user =
    auth.currentUser;


  if (!user?.email) {

    mostrarEstado(
      contenedor,
      "Tu sesión no está disponible. Inicia sesión nuevamente.",
      "error"
    );

    return;
  }


  // ==========================================================
  // OBTENER DATOS
  // ==========================================================

  const datos =
    obtenerDatosComunicaciones(
      contenedor
    );


  // ==========================================================
  // CONFIRMACIÓN
  // ==========================================================

  const confirmar =
    window.confirm(
      "¿Confirmas que los datos de Comunicaciones están correctos?\n\n" +
      `YouTube: ${datos.youtube}\n` +
      `Facebook: ${datos.facebook}\n` +
      `Total online: ${datos.totalOnline}\n` +
      `Servidores: ${datos.servidores}`
    );


  if (!confirmar) {
    return;
  }


  try {

    // ========================================================
    // BLOQUEAR BOTÓN
    // ========================================================

    if (btnGuardar) {

      btnGuardar.disabled = true;

      btnGuardar.textContent =
        "Guardando...";

    }


    mostrarEstado(
      contenedor,
      "Guardando reporte...",
      "info"
    );


    // ========================================================
    // REFERENCIAS
    // ========================================================

    const reporteRef =
      doc(
        db,
        "reportes",
        programacionId
      );


    const programacionRef =
      doc(
        db,
        "programaciones",
        programacionId
      );


    // ========================================================
    // PREPARAR REPORTE
    // ========================================================

    const reporte = {

      programacionId,

      ministerio:
        "comunicaciones",

      servicio:
        servicioId || "",

      fecha:
        fecha || "",

      youtube:
        datos.youtube,

      facebook:
        datos.facebook,

      servidores:
        datos.servidores,

      totalOnline:
        datos.totalOnline,

      totales: {

        youtube:
          datos.youtube,

        facebook:
          datos.facebook,

        servidores:
          datos.servidores,

        totalOnline:
          datos.totalOnline

      },

      estado:
        "completado",

      enviadoPor: {

        uid:
          user.uid,

        email:
          user.email
            .toLowerCase()
            .trim()

      },

      enviadoEn:
        serverTimestamp()

    };


    // ========================================================
    // TRANSACCIÓN
    //
    // 1. Guardar reporte
    // 2. Marcar programación como completada
    // ========================================================

    const lote =
      writeBatch(db);


    lote.set(
      reporteRef,
      reporte
    );


    lote.update(
      programacionRef,
      {

        estado:
          "completado",

        reporteId:
          programacionId,

        completadoEn:
          serverTimestamp(),

        completadoPor:
          user.email
            .toLowerCase()
            .trim()

      }
    );


    await lote.commit();


    // ========================================================
    // ÉXITO
    // ========================================================

    console.log(
      "RED Stats | Reporte de Comunicaciones guardado:",
      programacionId,
      reporte
    );


    mostrarEstado(
      contenedor,
      "✅ Reporte guardado correctamente.",
      "exito"
    );


    alert(
      "✅ Reporte de Comunicaciones guardado correctamente."
    );


    bloquearFormulario(
      contenedor
    );


  } catch (error) {

    console.error(
      "Error al guardar reporte de Comunicaciones:",
      error
    );


    mostrarEstado(
      contenedor,
      "No fue posible guardar el reporte. Revisa los permisos o inténtalo nuevamente.",
      "error"
    );


    alert(
      "No fue posible guardar el reporte de Comunicaciones."
    );


  } finally {

    if (
      btnGuardar &&
      !btnGuardar.dataset.guardado
    ) {

      btnGuardar.disabled = false;

      btnGuardar.textContent =
        "Guardar reporte";

    }

  }

}


// ============================================================
// BLOQUEAR FORMULARIO
// ============================================================

function bloquearFormulario(
  contenedor
) {

  const campos =
    contenedor.querySelectorAll(
      ".campo-comunicaciones"
    );


  campos.forEach((campo) => {

    campo.disabled = true;

    campo.classList.add(
      "bg-slate-100",
      "cursor-not-allowed"
    );

  });


  const btnLimpiar =
    contenedor.querySelector(
      "#btnLimpiarComunicaciones"
    );


  if (btnLimpiar) {

    btnLimpiar.disabled = true;

    btnLimpiar.classList.add(
      "opacity-50",
      "cursor-not-allowed"
    );

  }


  const btnGuardar =
    contenedor.querySelector(
      "#btnGuardarComunicaciones"
    );


  if (btnGuardar) {

    btnGuardar.disabled = true;

    btnGuardar.dataset.guardado =
      "true";

    btnGuardar.textContent =
      "✓ Reporte guardado";

  }

}


// ============================================================
// CARGAR REPORTE EXISTENTE
// ============================================================

function cargarDatosReporteExistente(
  contenedor,
  reporte
) {

  const youtube =
    reporte?.youtube ??
    reporte?.totales?.youtube ??
    0;

  const facebook =
    reporte?.facebook ??
    reporte?.totales?.facebook ??
    0;

  const servidores =
    reporte?.servidores ??
    reporte?.totales?.servidores ??
    0;


  const inputYoutube =
    contenedor.querySelector(
      "#youtubeComunicaciones"
    );

  const inputFacebook =
    contenedor.querySelector(
      "#facebookComunicaciones"
    );

  const inputServidores =
    contenedor.querySelector(
      "#servidoresComunicaciones"
    );


  if (inputYoutube) {
    inputYoutube.value =
      obtenerNumero(youtube);
  }

  if (inputFacebook) {
    inputFacebook.value =
      obtenerNumero(facebook);
  }

  if (inputServidores) {
    inputServidores.value =
      obtenerNumero(servidores);
  }


  calcularTotalesComunicaciones(
    contenedor
  );

}


// ============================================================
// MODO CONSULTA
// ============================================================

function activarModoLectura(
  contenedor
) {

  const campos =
    contenedor.querySelectorAll(
      ".campo-comunicaciones"
    );


  campos.forEach((campo) => {

    campo.disabled = true;

    campo.classList.add(
      "bg-slate-100",
      "cursor-not-allowed"
    );

  });


  const acciones =
    contenedor.querySelector(
      "#accionesComunicaciones"
    );


  acciones?.classList.add(
    "hidden"
  );


  mostrarEstado(
    contenedor,
    "✅ Reporte recibido. Esta información se muestra en modo consulta.",
    "exito"
  );

}


// ============================================================
// CALCULAR TOTALES
// ============================================================

function calcularTotalesComunicaciones(
  contenedor
) {

  const datos =
    obtenerDatosComunicaciones(
      contenedor
    );


  const totalYoutube =
    contenedor.querySelector(
      "#totalYoutubeComunicaciones"
    );

  const totalFacebook =
    contenedor.querySelector(
      "#totalFacebookComunicaciones"
    );

  const totalOnline =
    contenedor.querySelector(
      "#totalOnlineComunicaciones"
    );

  const totalServidores =
    contenedor.querySelector(
      "#totalServidoresComunicaciones"
    );


  if (totalYoutube) {
    totalYoutube.textContent =
      datos.youtube;
  }

  if (totalFacebook) {
    totalFacebook.textContent =
      datos.facebook;
  }

  if (totalOnline) {
    totalOnline.textContent =
      datos.totalOnline;
  }

  if (totalServidores) {
    totalServidores.textContent =
      datos.servidores;
  }

}


// ============================================================
// OBTENER DATOS
// ============================================================

export function obtenerDatosComunicaciones(
  contenedor
) {

  const youtube =
    obtenerNumero(
      contenedor.querySelector(
        "#youtubeComunicaciones"
      )?.value
    );


  const facebook =
    obtenerNumero(
      contenedor.querySelector(
        "#facebookComunicaciones"
      )?.value
    );


  const servidores =
    obtenerNumero(
      contenedor.querySelector(
        "#servidoresComunicaciones"
      )?.value
    );


  const totalOnline =
    youtube + facebook;


  return {

    ministerio:
      "comunicaciones",

    youtube,

    facebook,

    servidores,

    totalOnline

  };

}


// ============================================================
// MOSTRAR ESTADO
// ============================================================

function mostrarEstado(
  contenedor,
  mensaje,
  tipo = "info"
) {

  const estado =
    contenedor.querySelector(
      "#estadoComunicaciones"
    );


  if (!estado) return;


  estado.textContent =
    mensaje;


  estado.className =
    "rounded-2xl px-5 py-4 text-sm font-semibold";


  if (tipo === "exito") {

    estado.classList.add(
      "bg-green-50",
      "text-green-700",
      "border",
      "border-green-200"
    );

    return;
  }


  if (tipo === "error") {

    estado.classList.add(
      "bg-red-50",
      "text-red-700",
      "border",
      "border-red-200"
    );

    return;
  }


  estado.classList.add(
    "bg-blue-50",
    "text-blue-700",
    "border",
    "border-blue-200"
  );

}


// ============================================================
// OCULTAR ESTADO
// ============================================================

function ocultarEstado(
  contenedor
) {

  const estado =
    contenedor.querySelector(
      "#estadoComunicaciones"
    );


  estado?.classList.add(
    "hidden"
  );

}


// ============================================================
// UTILIDADES
// ============================================================

function obtenerNumero(
  valor
) {

  const numero =
    Number(valor);


  if (
    !Number.isFinite(numero) ||
    numero < 0
  ) {

    return 0;
  }


  return Math.floor(
    numero
  );

}


// ============================================================
// FORMATEAR FECHA
// ============================================================

function formatearFecha(
  fecha
) {

  if (!fecha) {
    return "";
  }


  const partes =
    String(fecha).split("-");


  if (partes.length !== 3) {
    return fecha;
  }


  return (
    `${partes[2]}/` +
    `${partes[1]}/` +
    `${partes[0]}`
  );

}
