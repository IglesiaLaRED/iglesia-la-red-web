// ============================================================
// RED STATS
// Módulo: Acomodación
// Iglesia La RED
// ============================================================

import { db, auth } from "../../firebase.js";

import {
  doc,
  getDoc,
  writeBatch,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


// ============================================================
// CONFIGURACIÓN
// ============================================================

const BLOQUES_ACOMODACION = [
  "Bloque 1",
  "Bloque 2",
  "Bloque 3",
  "Bloque 4",
  "Mezanine"
];


const CAMPOS_ACOMODACION = [
  {
    id: "hombres",
    nombre: "Hombres",
    icono: "👨"
  },
  {
    id: "mujeres",
    nombre: "Mujeres",
    icono: "👩"
  },
  {
    id: "jovenes",
    nombre: "Jóvenes",
    icono: "🧑"
  },
  {
    id: "servidores",
    nombre: "Servidores",
    icono: "🤝"
  },
  {
    id: "primeraVez",
    nombre: "Primera Vez",
    icono: "✨"
  }
];


// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================

export function renderAcomodacion(
  contenedor,
  contexto = {}
) {

  if (!contenedor) {

    console.error(
      "RED Stats: No se encontró el contenedor de Acomodación."
    );

    return;

  }


  const {
  programacionId = "",
  servicioId = "",
  servicio = "",
  fecha = ""
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
              Acomodación
            </h2>

            <p class="mt-2 text-sm text-slate-500">
              Registro de asistencia general por bloque.
            </p>

          </div>


          <div
            class="inline-flex items-center gap-2 self-start rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-900"
          >
            🪑 Asistencia presencial
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
           BLOQUES
      =================================================== -->

      <section
        id="contenedorBloquesAcomodacion"
        class="grid gap-5 xl:grid-cols-2"
      >

        ${BLOQUES_ACOMODACION
          .map(
            (bloque, indice) =>
              crearTarjetaBloque(
                bloque,
                indice
              )
          )
          .join("")}

      </section>


      <!-- ==================================================
           RESUMEN GENERAL
      =================================================== -->

      <section
        class="rounded-3xl bg-blue-950 p-6 text-white shadow-xl sm:p-7"
      >

        <div>

          <p class="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">
            Consolidado
          </p>

          <h3 class="mt-1 text-2xl font-black">
            Resumen de Acomodación
          </h3>

          <p class="mt-2 text-sm text-blue-200">
            RED Stats calcula automáticamente todos los totales.
          </p>

        </div>


        <div
          class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >

          ${CAMPOS_ACOMODACION
            .map(
              (campo) => `

                <article class="rounded-2xl bg-white/10 p-4">

                  <p class="text-sm text-blue-200">
                    ${campo.icono} ${campo.nombre}
                  </p>

                  <p
                    id="total-${campo.id}"
                    class="mt-2 text-3xl font-black"
                  >
                    0
                  </p>

                </article>

              `
            )
            .join("")}


          <article
            class="rounded-2xl bg-cyan-400 p-4 text-blue-950 sm:col-span-2 lg:col-span-1"
          >

            <p class="text-sm font-bold">
              👥 Total General
            </p>

            <p
              id="totalGeneralAcomodacion"
              class="mt-2 text-4xl font-black"
            >
              0
            </p>

          </article>

        </div>

      </section>


      <!-- ==================================================
           ACCIONES
      =================================================== -->

      <section
        class="flex flex-col gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end"
      >

        <button
          id="btnLimpiarAcomodacion"
          type="button"
          class="rounded-xl border border-slate-300 px-5 py-3 font-bold text-slate-600 transition hover:bg-slate-100"
        >
          Limpiar
        </button>


        <button
          id="btnGuardarAcomodacion"
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
        id="estadoAcomodacion"
        class="hidden rounded-2xl px-5 py-4 text-sm font-semibold"
      ></div>


    </div>
  `;


  conectarEventosAcomodacion(
  contenedor,
  {
    programacionId,
    servicioId,
    servicio,
    fecha
  }
);


  calcularTotalesAcomodacion(
    contenedor
  );

}


// ============================================================
// CREAR TARJETA DE BLOQUE
// ============================================================

function crearTarjetaBloque(
  nombreBloque,
  indice
) {

  return `

    <article
      class="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-200"
    >

      <div
        class="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-4"
      >

        <div>

          <p class="text-xs font-semibold uppercase tracking-wider text-cyan-600">
            Área ${indice + 1}
          </p>

          <h3 class="text-xl font-black text-blue-950">
            ${nombreBloque}
          </h3>

        </div>


        <div
          class="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-100 text-xl"
        >
          🪑
        </div>

      </div>


      <div class="grid gap-4 p-5 sm:grid-cols-2">

        ${CAMPOS_ACOMODACION
          .map(
            (campo) => `

              <label class="block">

                <span class="mb-2 block text-sm font-bold text-slate-600">
                  ${campo.icono} ${campo.nombre}
                </span>

                <input
                  type="number"
                  min="0"
                  step="1"
                  inputmode="numeric"
                  value=""
                  data-bloque="${indice}"
                  data-campo="${campo.id}"
                  class="campo-acomodacion w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg font-bold text-blue-950 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                  placeholder="0"
                >

              </label>

            `
          )
          .join("")}


        <div
          class="flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-4 sm:col-span-2"
        >

          <span class="font-bold text-blue-900">
            Total ${nombreBloque}
          </span>

          <span
            id="total-bloque-${indice}"
            class="text-2xl font-black text-blue-950"
          >
            0
          </span>

        </div>

      </div>

    </article>

  `;

}


// ============================================================
// EVENTOS
// ============================================================

function conectarEventosAcomodacion(
  contenedor,
  contexto
) {

  const campos =
    contenedor.querySelectorAll(
      ".campo-acomodacion"
    );


  // ==========================================================
  // RECALCULAR
  // ==========================================================

  campos.forEach((campo) => {

    campo.addEventListener(
      "input",
      () => {

        if (
          Number(campo.value) < 0
        ) {

          campo.value = 0;

        }


        calcularTotalesAcomodacion(
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
      "#btnLimpiarAcomodacion"
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


      calcularTotalesAcomodacion(
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
      "#btnGuardarAcomodacion"
    );


  btnGuardar?.addEventListener(
    "click",
    async () => {

      await guardarReporteAcomodacion(
        contenedor,
        contexto
      );

    }
  );

}


// ============================================================
// GUARDAR REPORTE EN FIRESTORE
// ============================================================

async function guardarReporteAcomodacion(
  contenedor,
  contexto
) {

  const btnGuardar =
    contenedor.querySelector(
      "#btnGuardarAcomodacion"
    );


  const {
  programacionId,
  servicioId,
  servicio,
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
      "RED Stats | Falta programacionId en Acomodación."
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
    obtenerDatosAcomodacion(
      contenedor
    );


  // ==========================================================
  // CONFIRMACIÓN
  // ==========================================================

  const confirmar =
    window.confirm(
      "¿Confirmas que los datos de Acomodación están correctos?\n\n" +
      `Total general: ${datos.totales.totalGeneral}`
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
    // COMPROBAR SI YA EXISTE
    // ========================================================

    const reporteExistente =
      await getDoc(
        reporteRef
      );


    if (
      reporteExistente.exists()
    ) {

      mostrarEstado(
        contenedor,
        "Este reporte ya fue enviado anteriormente.",
        "error"
      );

      alert(
        "⚠️ Este reporte ya existe y no se guardó una copia duplicada."
      );

      return;

    }


    // ========================================================
    // PREPARAR REPORTE
    // ========================================================

    const reporte = {

      programacionId,

      ministerio:
        "acomodacion",

     servicio:
  servicioId || "",

      fecha:
        fecha || "",

      bloques:
        datos.bloques,

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


    // ========================================================
    // TRANSACCIÓN DE ESCRITURA
    //
    // 1. Crear reporte
    // 2. Marcar programación como completada
    //
    // Ambas operaciones se confirman juntas.
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

console.log(
  "========== RED STATS DEBUG =========="
);

console.log(
  "programacionId:",
  programacionId
);

console.log(
  "servicioId:",
  servicioId
);

console.log(
  "servicio visual:",
  servicio
);

console.log(
  "fecha:",
  fecha
);

console.log(
  "usuario Firebase:",
  {
    uid: user.uid,
    email: user.email
  }
);

console.log(
  "REPORTE QUE INTENTAMOS GUARDAR:",
  reporte
);

console.log(
  "====================================="
);
    
    await lote.commit();


    // ========================================================
    // ÉXITO
    // ========================================================

    console.log(
      "RED Stats | Reporte de Acomodación guardado:",
      programacionId,
      reporte
    );


    mostrarEstado(
      contenedor,
      "✅ Reporte guardado correctamente.",
      "exito"
    );


    alert(
      "✅ Reporte de Acomodación guardado correctamente."
    );


    // ========================================================
    // BLOQUEAR FORMULARIO
    // ========================================================

    bloquearFormulario(
      contenedor
    );


  } catch (error) {

    console.error(
      "Error al guardar reporte de Acomodación:",
      error
    );


    mostrarEstado(
      contenedor,
      "No fue posible guardar el reporte. Revisa los permisos o inténtalo nuevamente.",
      "error"
    );


    alert(
      "No fue posible guardar el reporte de Acomodación."
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
// BLOQUEAR FORMULARIO DESPUÉS DE GUARDAR
// ============================================================

function bloquearFormulario(
  contenedor
) {

  const campos =
    contenedor.querySelectorAll(
      ".campo-acomodacion"
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
      "#btnLimpiarAcomodacion"
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
      "#btnGuardarAcomodacion"
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
// MOSTRAR ESTADO
// ============================================================

function mostrarEstado(
  contenedor,
  mensaje,
  tipo = "info"
) {

  const estado =
    contenedor.querySelector(
      "#estadoAcomodacion"
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
      "#estadoAcomodacion"
    );


  estado?.classList.add(
    "hidden"
  );

}


// ============================================================
// CALCULAR TOTALES
// ============================================================

function calcularTotalesAcomodacion(
  contenedor
) {

  const totalesCategorias = {

    hombres: 0,
    mujeres: 0,
    jovenes: 0,
    servidores: 0,
    primeraVez: 0

  };


  BLOQUES_ACOMODACION.forEach(
    (bloque, indice) => {

      let totalBloque = 0;


      CAMPOS_ACOMODACION.forEach(
        (campo) => {

          const input =
            contenedor.querySelector(
              `[data-bloque="${indice}"][data-campo="${campo.id}"]`
            );


          const valor =
            obtenerNumero(
              input?.value
            );


          totalBloque +=
            valor;


          totalesCategorias[
            campo.id
          ] += valor;

        }
      );


      const elementoTotalBloque =
        contenedor.querySelector(
          `#total-bloque-${indice}`
        );


      if (
        elementoTotalBloque
      ) {

        elementoTotalBloque.textContent =
          totalBloque;

      }

    }
  );


  CAMPOS_ACOMODACION.forEach(
    (campo) => {

      const elemento =
        contenedor.querySelector(
          `#total-${campo.id}`
        );


      if (elemento) {

        elemento.textContent =
          totalesCategorias[
            campo.id
          ];

      }

    }
  );


  const totalGeneral =
    totalesCategorias.hombres +
    totalesCategorias.mujeres +
    totalesCategorias.jovenes +
    totalesCategorias.servidores +
    totalesCategorias.primeraVez;


  const elementoTotalGeneral =
    contenedor.querySelector(
      "#totalGeneralAcomodacion"
    );


  if (
    elementoTotalGeneral
  ) {

    elementoTotalGeneral.textContent =
      totalGeneral;

  }

}


// ============================================================
// OBTENER DATOS DEL FORMULARIO
// ============================================================

export function obtenerDatosAcomodacion(
  contenedor
) {

  const bloques = {};


  const totales = {

    hombres: 0,
    mujeres: 0,
    jovenes: 0,
    servidores: 0,
    primeraVez: 0,
    totalGeneral: 0

  };


  BLOQUES_ACOMODACION.forEach(
    (nombreBloque, indice) => {

      const claveBloque =
        normalizarClaveBloque(
          nombreBloque
        );


      const datosBloque = {};


      let totalBloque = 0;


      CAMPOS_ACOMODACION.forEach(
        (campo) => {

          const input =
            contenedor.querySelector(
              `[data-bloque="${indice}"][data-campo="${campo.id}"]`
            );


          const valor =
            obtenerNumero(
              input?.value
            );


          datosBloque[
            campo.id
          ] = valor;


          totalBloque +=
            valor;


          totales[
            campo.id
          ] += valor;

        }
      );


      datosBloque.total =
        totalBloque;


      bloques[
        claveBloque
      ] = datosBloque;

    }
  );


  totales.totalGeneral =
    totales.hombres +
    totales.mujeres +
    totales.jovenes +
    totales.servidores +
    totales.primeraVez;


  return {

    ministerio:
      "acomodacion",

    bloques,

    totales

  };

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
// NORMALIZAR CLAVE DE BLOQUE
// ============================================================

function normalizarClaveBloque(
  nombre
) {

  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    )
    .replace(
      /\s+/g,
      ""
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
