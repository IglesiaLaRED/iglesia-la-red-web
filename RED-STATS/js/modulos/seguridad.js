// ============================================================
// RED STATS
// Módulo: Seguridad
// Iglesia La RED
// ============================================================

import { db, auth } from "../../firebase.js";

import {
  doc,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


// ============================================================
// CONFIGURACIÓN
// ============================================================

const CAMPOS_SEGURIDAD = [
  {
    id: "ninos",
    nombre: "Niños",
    icono: "👧"
  },
  {
    id: "parqueo",
    nombre: "Servidores de Parqueo",
    icono: "🚗"
  },
  {
    id: "seguridad",
    nombre: "Servidores de Seguridad",
    icono: "🛡️"
  },
  {
    id: "escuelaBiblica",
    nombre: "Servidores de Escuela Bíblica",
    icono: "📖"
  }
];


// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================

export function renderSeguridad(
  contenedor,
  contexto = {}
) {

  if (!contenedor) {

    console.error(
      "RED Stats: No se encontró el contenedor de Seguridad."
    );

    return;

  }


  const {
    programacionId = "",
    servicioId = "",
    servicio = "",
    fecha = "",
    responsable = "",
    modo = "edicion",
    reporteExistente = null
  } = contexto;


  contenedor.innerHTML = `

    <div class="space-y-7">


      <!-- ENCABEZADO -->

      <section>

        <p class="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-600">
          Ministerio
        </p>


        <div class="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <h2 class="text-3xl font-black text-blue-950">
              Seguridad
            </h2>

            <p class="mt-2 text-sm text-slate-500">
              Registro complementario de asistencia y servidores.
            </p>

          </div>


          <div
            class="inline-flex items-center gap-2 self-start rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-900"
          >
            🛡️ SecuriTARS
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


        ${
          modo === "edicion" && responsable
            ? `
              <div class="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50 px-5 py-4">

                <p class="font-black text-blue-950">
                  👋 ¡Hola, ${responsable}!
                </p>

                <p class="mt-1 text-sm text-slate-600">
                  Tienes asignado el reporte de Seguridad para este servicio.
                </p>

              </div>
            `
            : ""
        }


      </section>

      </section>


      <!-- CAPTURA -->

      <section class="grid gap-5 md:grid-cols-2">

        ${CAMPOS_SEGURIDAD
          .map(
            (campo) => `

              <article
                class="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
              >

                <div class="flex items-center gap-3">

                  <div
                    class="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-2xl"
                  >
                    ${campo.icono}
                  </div>

                  <div>

                    <p class="text-sm font-bold text-slate-600">
                      ${campo.nombre}
                    </p>

                  </div>

                </div>


                <input
                  type="number"
                  min="0"
                  step="1"
                  inputmode="numeric"
                  value=""
                  data-campo="${campo.id}"
                  class="campo-seguridad mt-5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-2xl font-black text-blue-950 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                  placeholder="0"
                >

              </article>

            `
          )
          .join("")}

      </section>


      <!-- RESUMEN -->

      <section
        class="rounded-3xl bg-blue-950 p-6 text-white shadow-xl sm:p-7"
      >

        <div>

          <p class="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
            Consolidado
          </p>

          <h3 class="mt-1 text-2xl font-black">
            Resumen de Seguridad
          </h3>

        </div>


        <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">


          <article class="rounded-2xl bg-white/10 p-4">

            <p class="text-sm text-blue-200">
              👧 Niños
            </p>

            <p
              id="totalNinosSeguridad"
              class="mt-2 text-3xl font-black"
            >
              0
            </p>

          </article>


          <article class="rounded-2xl bg-white/10 p-4">

            <p class="text-sm text-blue-200">
              🤝 Total Servidores
            </p>

            <p
              id="totalServidoresSeguridad"
              class="mt-2 text-3xl font-black"
            >
              0
            </p>

          </article>


          <article
            class="rounded-2xl bg-cyan-400 p-4 text-blue-950"
          >

            <p class="text-sm font-bold">
              👥 Total Registrado
            </p>

            <p
              id="totalGeneralSeguridad"
              class="mt-2 text-4xl font-black"
            >
              0
            </p>

          </article>

        </div>

      </section>


      <!-- ACCIONES -->

      <section
        id="accionesSeguridad"
        class="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end"
      >

        <button
          id="btnLimpiarSeguridad"
          type="button"
          class="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-100"
        >
          Limpiar
        </button>


        <button
          id="btnGuardarSeguridad"
          type="button"
          class="rounded-xl bg-blue-900 px-6 py-3 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Guardar reporte
        </button>

      </section>


      <!-- ESTADO -->

      <div
        id="estadoSeguridad"
        class="hidden rounded-2xl px-5 py-4 text-sm font-semibold"
      ></div>


    </div>
  `;


  conectarEventosSeguridad(
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

    cargarReporteExistente(
      contenedor,
      reporteExistente
    );

    activarModoLectura(
      contenedor
    );

  } else {

    calcularTotalesSeguridad(
      contenedor
    );

  }

}


// ============================================================
// EVENTOS
// ============================================================

function conectarEventosSeguridad(
  contenedor,
  contexto
) {

  const campos =
    contenedor.querySelectorAll(
      ".campo-seguridad"
    );


  campos.forEach(
    (campo) => {

      campo.addEventListener(
        "input",
        () => {

          if (
            Number(campo.value) < 0
          ) {

            campo.value = 0;

          }


          calcularTotalesSeguridad(
            contenedor
          );

        }
      );

    }
  );


  const btnLimpiar =
    contenedor.querySelector(
      "#btnLimpiarSeguridad"
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


      campos.forEach(
        (campo) => {

          campo.value = "";

        }
      );


      calcularTotalesSeguridad(
        contenedor
      );

      ocultarEstado(
        contenedor
      );

    }
  );


  const btnGuardar =
    contenedor.querySelector(
      "#btnGuardarSeguridad"
    );


  btnGuardar?.addEventListener(
    "click",
    async () => {

      await guardarReporteSeguridad(
        contenedor,
        contexto
      );

    }
  );

}


// ============================================================
// GUARDAR REPORTE
// ============================================================

async function guardarReporteSeguridad(
  contenedor,
  contexto
) {

  const btnGuardar =
    contenedor.querySelector(
      "#btnGuardarSeguridad"
    );


  const {
    programacionId,
    servicioId,
    fecha
  } = contexto;


  if (!programacionId) {

    mostrarEstado(
      contenedor,
      "No fue posible identificar la programación.",
      "error"
    );

    return;

  }


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


  const datos =
    obtenerDatosSeguridad(
      contenedor
    );


  const confirmar =
    window.confirm(
      "¿Confirmas que los datos de Seguridad están correctos?\n\n" +
      `Niños: ${datos.totales.ninos}\n` +
      `Servidores: ${datos.totales.totalServidores}`
    );


  if (!confirmar) {
    return;
  }


  try {

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


    const reporte = {

      programacionId,

      ministerio:
        "seguridad",

      servicio:
        servicioId || "",

      fecha:
        fecha || "",

      datos:
        datos.datos,

      totales:
        datos.totales,

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


    console.log(
      "RED Stats | Reporte de Seguridad guardado:",
      programacionId,
      reporte
    );


    mostrarEstado(
      contenedor,
      "✅ Reporte guardado correctamente.",
      "exito"
    );


    alert(
      "✅ Reporte de Seguridad guardado correctamente."
    );


    bloquearFormulario(
      contenedor
    );


  } catch (error) {

    console.error(
      "Error al guardar reporte de Seguridad:",
      error
    );


    mostrarEstado(
      contenedor,
      "No fue posible guardar el reporte.",
      "error"
    );


    alert(
      "No fue posible guardar el reporte de Seguridad."
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
// OBTENER DATOS
// ============================================================

export function obtenerDatosSeguridad(
  contenedor
) {

  const datos = {

    ninos: 0,
    parqueo: 0,
    seguridad: 0,
    escuelaBiblica: 0

  };


  CAMPOS_SEGURIDAD.forEach(
    (campo) => {

      const input =
        contenedor.querySelector(
          `[data-campo="${campo.id}"]`
        );


      datos[campo.id] =
        obtenerNumero(
          input?.value
        );

    }
  );


  const totalServidores =
    datos.parqueo +
    datos.seguridad +
    datos.escuelaBiblica;


  const totalGeneral =
    datos.ninos +
    totalServidores;


  return {

    ministerio:
      "seguridad",

    datos,

    totales: {

      ninos:
        datos.ninos,

      parqueo:
        datos.parqueo,

      seguridad:
        datos.seguridad,

      escuelaBiblica:
        datos.escuelaBiblica,

      totalServidores,

      totalGeneral

    }

  };

}


// ============================================================
// CALCULAR TOTALES
// ============================================================

function calcularTotalesSeguridad(
  contenedor
) {

  const datos =
    obtenerDatosSeguridad(
      contenedor
    );


  actualizarTexto(
    contenedor,
    "#totalNinosSeguridad",
    datos.totales.ninos
  );


  actualizarTexto(
    contenedor,
    "#totalServidoresSeguridad",
    datos.totales.totalServidores
  );


  actualizarTexto(
    contenedor,
    "#totalGeneralSeguridad",
    datos.totales.totalGeneral
  );

}


// ============================================================
// CARGAR REPORTE EXISTENTE
// ============================================================

function cargarReporteExistente(
  contenedor,
  reporte
) {

  const datos =
    reporte?.datos || {};


  CAMPOS_SEGURIDAD.forEach(
    (campo) => {

      const input =
        contenedor.querySelector(
          `[data-campo="${campo.id}"]`
        );


      if (!input) {
        return;
      }


      input.value =
        obtenerNumero(
          datos[campo.id]
        );

    }
  );


  calcularTotalesSeguridad(
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
      ".campo-seguridad"
    );


  campos.forEach(
    (campo) => {

      campo.disabled = true;

      campo.classList.add(
        "bg-slate-100",
        "cursor-not-allowed"
      );

    }
  );


  const acciones =
    contenedor.querySelector(
      "#accionesSeguridad"
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
// BLOQUEAR DESPUÉS DE GUARDAR
// ============================================================

function bloquearFormulario(
  contenedor
) {

  const campos =
    contenedor.querySelectorAll(
      ".campo-seguridad"
    );


  campos.forEach(
    (campo) => {

      campo.disabled = true;

      campo.classList.add(
        "bg-slate-100",
        "cursor-not-allowed"
      );

    }
  );


  const btnLimpiar =
    contenedor.querySelector(
      "#btnLimpiarSeguridad"
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
      "#btnGuardarSeguridad"
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
// ESTADO
// ============================================================

function mostrarEstado(
  contenedor,
  mensaje,
  tipo = "info"
) {

  const estado =
    contenedor.querySelector(
      "#estadoSeguridad"
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


function ocultarEstado(
  contenedor
) {

  const estado =
    contenedor.querySelector(
      "#estadoSeguridad"
    );


  estado?.classList.add(
    "hidden"
  );

}


// ============================================================
// UTILIDADES
// ============================================================

function actualizarTexto(
  contenedor,
  selector,
  valor
) {

  const elemento =
    contenedor.querySelector(
      selector
    );


  if (elemento) {

    elemento.textContent =
      valor;

  }

}


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


function formatearFecha(
  fecha
) {

  if (!fecha) {
    return "";
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
