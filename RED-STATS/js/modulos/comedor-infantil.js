// ======================================================
// RED STATS — COMEDOR INFANTIL
// Iglesia La RED
// ======================================================

import {
  db,
  auth
} from "../../firebase.js";

import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


// ======================================================
// CONFIGURACIÓN
// ======================================================

const COLECCION =
  "reportesComedorInfantil";

const DIAS = [
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes"
];

const NOMBRES_DIAS = {
  lunes: "Lunes",
  martes: "Martes",
  miercoles: "Miércoles",
  jueves: "Jueves",
  viernes: "Viernes"
};


// ======================================================
// RENDER PRINCIPAL
// ======================================================

export async function renderComedorInfantil(
  contenedor
) {

  if (!contenedor) {
    return;
  }


  contenedor.innerHTML = `

    <section class="space-y-6">

      <!-- ENCABEZADO -->

      <div>

        <p
          class="text-sm font-semibold text-cyan-600"
        >
          Reporte semanal
        </p>

        <h2
          class="mt-1 text-3xl font-black text-blue-950"
        >
          🍽️ Comedor Infantil
        </h2>

        <p
          class="mt-2 text-sm text-slate-500"
        >
          Registro semanal de platos servidos y servidores.
        </p>

      </div>


      <!-- FORMULARIO -->

      <div
        class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >

        <!-- SEMANA -->

        <div>

          <label
            class="text-sm font-bold text-blue-950"
          >
            📅 Semana del reporte
          </label>

          <input
            id="fechaComedorInfantil"
            type="date"
            class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-cyan-500"
          >

          <p
            class="mt-2 text-xs text-slate-500"
          >
            Puedes seleccionar cualquier día de la semana.
            RED Stats identificará automáticamente el lunes y viernes correspondientes.
          </p>

        </div>


        <!-- COMEDOR INFANTIL -->

        <section class="mt-8">

          <div>

            <p
              class="text-xs font-black uppercase tracking-wider text-orange-600"
            >
              🍽️ Platos servidos
            </p>

            <h3
              class="mt-1 text-xl font-black text-blue-950"
            >
              Comedor Infantil
            </h3>

          </div>


          <div
            class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
          >

            ${crearCamposDias(
              "comedor",
              "Platos"
            )}

          </div>


          <div
            class="mt-4 rounded-2xl border border-orange-200 bg-orange-50 p-4"
          >

            <p
              class="text-sm font-semibold text-orange-700"
            >
              Total semanal · Comedor Infantil
            </p>

            <p
              id="totalComedorInfantil"
              class="mt-1 text-3xl font-black text-orange-800"
            >
              0
            </p>

          </div>

        </section>


        <!-- PENAL -->

        <section
          class="mt-8 border-t border-slate-200 pt-8"
        >

          <div>

            <p
              class="text-xs font-black uppercase tracking-wider text-blue-600"
            >
              🍱 Platos servidos
            </p>

            <h3
              class="mt-1 text-xl font-black text-blue-950"
            >
              Penal
            </h3>

          </div>


          <div
            class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
          >

            ${crearCamposDias(
              "penal",
              "Platos"
            )}

          </div>


          <div
            class="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4"
          >

            <p
              class="text-sm font-semibold text-blue-700"
            >
              Total semanal · Penal
            </p>

            <p
              id="totalPenal"
              class="mt-1 text-3xl font-black text-blue-950"
            >
              0
            </p>

          </div>

        </section>


        <!-- SERVIDORES -->

        <section
          class="mt-8 border-t border-slate-200 pt-8"
        >

          <div>

            <p
              class="text-xs font-black uppercase tracking-wider text-violet-600"
            >
              👏 Equipo de servicio
            </p>

            <h3
              class="mt-1 text-xl font-black text-blue-950"
            >
              Servidores por día
            </h3>

          </div>


          <div
            class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
          >

            ${crearCamposDias(
              "servidores",
              "Servidores"
            )}

          </div>


          <div
            class="mt-4 rounded-2xl border border-violet-200 bg-violet-50 p-4"
          >

            <p
              class="text-sm font-semibold text-violet-700"
            >
              Total semanal · Servidores
            </p>

            <p
              id="totalServidoresComedor"
              class="mt-1 text-3xl font-black text-violet-800"
            >
              0
            </p>

          </div>

        </section>


        <!-- GUARDAR -->

        <button
          id="btnGuardarComedorInfantil"
          type="button"
          class="mt-8 w-full rounded-2xl bg-cyan-600 px-5 py-4 font-black text-white shadow-sm transition hover:bg-cyan-700"
        >
          💾 Guardar reporte semanal
        </button>


        <p
          id="estadoComedorInfantil"
          class="mt-3 text-center text-sm font-semibold text-slate-500"
        ></p>


        <!-- PANEL SEMANAL -->

        <section
          id="panelComedorInfantil"
          class="mt-8 border-t border-slate-200 pt-8"
        >

          <div class="py-8 text-center">

            <div class="text-4xl">
              ⏳
            </div>

            <p
              class="mt-3 font-bold text-blue-950"
            >
              Cargando estado semanal...
            </p>

          </div>

        </section>

      </div>

    </section>
  `;


  establecerFechaActual(
    contenedor
  );


  conectarEventosComedorInfantil(
    contenedor
  );


 await cargarReporteSemanaComedor(
  contenedor
);


recalcularTotales(
  contenedor
);


await cargarPanelComedorInfantil(
  contenedor
);

}


// ======================================================
// CREAR CAMPOS POR DÍA
// ======================================================

function crearCamposDias(
  grupo,
  etiqueta
) {

  return DIAS
    .map(
      (dia) => `

        <div>

          <label
            for="${grupo}-${dia}"
            class="text-sm font-semibold text-slate-600"
          >
            ${NOMBRES_DIAS[dia]}
          </label>

          <input
            id="${grupo}-${dia}"
            type="number"
            min="0"
            step="1"
            value="0"
            inputmode="numeric"
            aria-label="${etiqueta} ${NOMBRES_DIAS[dia]}"
            class="campo-comedor mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg font-bold text-blue-950 outline-none transition focus:border-cyan-500"
          >

        </div>

      `
    )
    .join("");

}


// ======================================================
// FECHA ACTUAL
// ======================================================

function establecerFechaActual(
  contenedor
) {

  const campoFecha =
    contenedor.querySelector(
      "#fechaComedorInfantil"
    );


  if (!campoFecha) {
    return;
  }


  const hoy =
    new Date();


  campoFecha.value =
    convertirFechaISO(
      hoy
    );

}


// ======================================================
// EVENTOS
// ======================================================

function conectarEventosComedorInfantil(
  contenedor
) {

  contenedor
    .querySelectorAll(
      ".campo-comedor"
    )
    .forEach(
      (campo) => {

        campo.addEventListener(
          "input",
          () => {

            recalcularTotales(
              contenedor
            );

          }
        );

      }
    );

  const campoFecha =
  contenedor.querySelector(
    "#fechaComedorInfantil"
  );


campoFecha?.addEventListener(
  "change",
  async () => {

    await cargarReporteSemanaComedor(
      contenedor
    );

  }
);

  const btnGuardar =
    contenedor.querySelector(
      "#btnGuardarComedorInfantil"
    );


  btnGuardar?.addEventListener(
    "click",
    async () => {

      await guardarReporteComedorInfantil(
        contenedor
      );

    }
  );

}


// ======================================================
// OBTENER NÚMERO
// ======================================================

function obtenerNumero(
  contenedor,
  id
) {

  const valor =
    Number(
      contenedor
        .querySelector(
          `#${id}`
        )
        ?.value || 0
    );


  return Number.isFinite(valor)
    ? Math.max(
        0,
        Math.trunc(valor)
      )
    : 0;

}


// ======================================================
// OBTENER GRUPO
// ======================================================

function obtenerGrupo(
  contenedor,
  grupo
) {

  const datos = {};


  DIAS.forEach(
    (dia) => {

      datos[dia] =
        obtenerNumero(
          contenedor,
          `${grupo}-${dia}`
        );

    }
  );


  datos.total =
    DIAS.reduce(
      (total, dia) =>
        total +
        datos[dia],
      0
    );


  return datos;

}


// ======================================================
// RECALCULAR TOTALES
// ======================================================

function recalcularTotales(
  contenedor
) {

  const comedor =
    obtenerGrupo(
      contenedor,
      "comedor"
    );


  const penal =
    obtenerGrupo(
      contenedor,
      "penal"
    );


  const servidores =
    obtenerGrupo(
      contenedor,
      "servidores"
    );


  const totalComedor =
    contenedor.querySelector(
      "#totalComedorInfantil"
    );


  const totalPenal =
    contenedor.querySelector(
      "#totalPenal"
    );


  const totalServidores =
    contenedor.querySelector(
      "#totalServidoresComedor"
    );


  if (totalComedor) {

    totalComedor.textContent =
      comedor.total;

  }


  if (totalPenal) {

    totalPenal.textContent =
      penal.total;

  }


  if (totalServidores) {

    totalServidores.textContent =
      servidores.total;

  }

}


// ======================================================
// OBTENER DATOS
// ======================================================

function obtenerDatosComedorInfantil(
  contenedor
) {

  const fechaSeleccionada =
    contenedor
      .querySelector(
        "#fechaComedorInfantil"
      )
      ?.value || "";


  if (!fechaSeleccionada) {

    return {
      fechaSeleccionada: "",
      fechaInicio: "",
      fechaFin: "",
      comedorInfantil: {},
      penal: {},
      servidores: {}
    };

  }


  const semana =
    obtenerSemanaLaboral(
      fechaSeleccionada
    );


  return {

    fechaSeleccionada,

    fechaInicio:
      semana.fechaInicio,

    fechaFin:
      semana.fechaFin,

    comedorInfantil:
      obtenerGrupo(
        contenedor,
        "comedor"
      ),

    penal:
      obtenerGrupo(
        contenedor,
        "penal"
      ),

    servidores:
      obtenerGrupo(
        contenedor,
        "servidores"
      )

  };

}


// ======================================================
// OBTENER SEMANA LABORAL
// LUNES → VIERNES
// ======================================================

function obtenerSemanaLaboral(
  fechaTexto
) {

  const fecha =
    new Date(
      `${fechaTexto}T12:00:00`
    );


  const diaSemana =
    fecha.getDay();


  const diferenciaLunes =
    diaSemana === 0
      ? -6
      : 1 - diaSemana;


  const lunes =
    new Date(
      fecha
    );


  lunes.setDate(
    fecha.getDate() +
    diferenciaLunes
  );


  const viernes =
    new Date(
      lunes
    );


  viernes.setDate(
    lunes.getDate() + 4
  );


  return {

    fechaInicio:
      convertirFechaISO(
        lunes
      ),

    fechaFin:
      convertirFechaISO(
        viernes
      )

  };

}


// ======================================================
// CONVERTIR FECHA A YYYY-MM-DD
// ======================================================

function convertirFechaISO(
  fecha
) {

  const anio =
    fecha.getFullYear();


  const mes =
    String(
      fecha.getMonth() + 1
    ).padStart(
      2,
      "0"
    );


  const dia =
    String(
      fecha.getDate()
    ).padStart(
      2,
      "0"
    );


  return `${anio}-${mes}-${dia}`;

}

// ======================================================
// CARGAR REPORTE EXISTENTE DE LA SEMANA
// ======================================================

async function cargarReporteSemanaComedor(
  contenedor
) {

  try {

    const campoFecha =
      contenedor.querySelector(
        "#fechaComedorInfantil"
      );


    const fechaSeleccionada =
      campoFecha?.value || "";


    if (!fechaSeleccionada) {
      return;
    }


    const semana =
      obtenerSemanaLaboral(
        fechaSeleccionada
      );


    const reporteId =
      `comedor-infantil_${semana.fechaInicio}`;


    const reporteRef =
      doc(
        db,
        COLECCION,
        reporteId
      );


    const snapshot =
      await getDoc(
        reporteRef
      );


    // --------------------------------------------------
    // SI NO EXISTE, LIMPIAR CAMPOS
    // --------------------------------------------------

    if (!snapshot.exists()) {

      limpiarCamposComedor(
        contenedor
      );

      recalcularTotales(
        contenedor
      );

      return;
    }


    const reporte =
      snapshot.data();


    cargarGrupoEnFormulario(
      contenedor,
      "comedor",
      reporte.comedorInfantil
    );


    cargarGrupoEnFormulario(
      contenedor,
      "penal",
      reporte.penal
    );


    cargarGrupoEnFormulario(
      contenedor,
      "servidores",
      reporte.servidores
    );


    recalcularTotales(
      contenedor
    );


    console.log(
      "RED Stats | Reporte semanal de Comedor precargado:",
      {
        reporteId,
        reporte
      }
    );


  } catch (error) {

    console.error(
      "RED Stats | Error precargando Comedor Infantil:",
      error
    );

  }

}


// ======================================================
// CARGAR GRUPO EN FORMULARIO
// ======================================================

function cargarGrupoEnFormulario(
  contenedor,
  grupo,
  datos = {}
) {

  DIAS.forEach(
    (dia) => {

      const campo =
        contenedor.querySelector(
          `#${grupo}-${dia}`
        );


      if (campo) {

        campo.value =
          Number(
            datos?.[dia] || 0
          );

      }

    }
  );

}


// ======================================================
// LIMPIAR CAMPOS
// ======================================================

function limpiarCamposComedor(
  contenedor
) {

  [
    "comedor",
    "penal",
    "servidores"
  ].forEach(
    (grupo) => {

      DIAS.forEach(
        (dia) => {

          const campo =
            contenedor.querySelector(
              `#${grupo}-${dia}`
            );


          if (campo) {

            campo.value =
              0;

          }

        }
      );

    }
  );

}

// ======================================================
// GUARDAR REPORTE
// ======================================================

async function guardarReporteComedorInfantil(
  contenedor
) {

  const estado =
    contenedor.querySelector(
      "#estadoComedorInfantil"
    );


  const btnGuardar =
    contenedor.querySelector(
      "#btnGuardarComedorInfantil"
    );


  try {

    const user =
      auth.currentUser;


    if (!user) {

      throw new Error(
        "No hay una sesión activa."
      );

    }


    const datos =
      obtenerDatosComedorInfantil(
        contenedor
      );


    if (!datos.fechaInicio) {

      throw new Error(
        "Selecciona una fecha para el reporte."
      );

    }


    if (btnGuardar) {

      btnGuardar.disabled =
        true;

      btnGuardar.textContent =
        "⏳ Guardando...";

    }


    if (estado) {

      estado.textContent =
        "Guardando reporte semanal...";

    }


    // --------------------------------------------------
    // ID ÚNICO POR SEMANA
    // --------------------------------------------------

    const reporteId =
      `comedor-infantil_${datos.fechaInicio}`;


    const reporteRef =
      doc(
        db,
        COLECCION,
        reporteId
      );


    const snapshotExistente =
      await getDoc(
        reporteRef
      );


    const existe =
      snapshotExistente.exists();


    const reporte = {

      tipo:
        "comedor-infantil",

      fechaInicio:
        datos.fechaInicio,

      fechaFin:
        datos.fechaFin,

      comedorInfantil:
        datos.comedorInfantil,

      penal:
        datos.penal,

      servidores:
        datos.servidores

    };


    // --------------------------------------------------
    // ACTUALIZAR
    // --------------------------------------------------

    if (existe) {

      await setDoc(
        reporteRef,
        {

          ...reporte,

          actualizadoPor: {

            uid:
              user.uid,

            email:
              user.email
                ?.toLowerCase()
                .trim() || ""

          },

          actualizadoEn:
            serverTimestamp()

        },
        {
          merge: true
        }
      );

    }


    // --------------------------------------------------
    // CREAR
    // --------------------------------------------------

    else {

      await setDoc(
        reporteRef,
        {

          ...reporte,

          estado:
            "completado",

          enviadoPor: {

            uid:
              user.uid,

            email:
              user.email
                ?.toLowerCase()
                .trim() || ""

          },

          enviadoEn:
            serverTimestamp()

        }
      );

    }


    console.log(
      "RED Stats | Comedor Infantil:",
      {

        accion:
          existe
            ? "actualizado"
            : "creado",

        reporteId,

        datos

      }
    );


    if (estado) {

      estado.textContent =
        existe
          ? "✅ Reporte semanal actualizado correctamente."
          : "✅ Reporte semanal guardado correctamente.";

    }


    alert(
      existe
        ? "✅ Reporte de Comedor Infantil actualizado correctamente."
        : "✅ Reporte de Comedor Infantil guardado correctamente."
    );


    await cargarPanelComedorInfantil(
      contenedor
    );


  } catch (error) {

    console.error(
      "RED Stats | Error Comedor Infantil:",
      error
    );


    if (estado) {

      estado.textContent =
        `❌ ${error.message}`;

    }


    alert(
      `No fue posible guardar el reporte.\n\n${error.message}`
    );


  } finally {

    if (btnGuardar) {

      btnGuardar.disabled =
        false;

      btnGuardar.textContent =
        "💾 Guardar reporte semanal";

    }

  }

}


// ======================================================
// PANEL SEMANAL
// ======================================================

async function cargarPanelComedorInfantil(
  contenedor
) {

  const panel =
    contenedor.querySelector(
      "#panelComedorInfantil"
    );


  if (!panel) {
    return;
  }


  try {

    const hoy =
      convertirFechaISO(
        new Date()
      );


    const semanaActual =
      obtenerSemanaLaboral(
        hoy
      );


    const snapshot =
      await getDocs(
        collection(
          db,
          COLECCION
        )
      );


    const reportesSemana =
      snapshot.docs
        .map(
          (documento) => ({

            id:
              documento.id,

            ...documento.data()

          })
        )
        .filter(
          (reporte) =>

            reporte.estado ===
              "completado"

            &&

            reporte.fechaInicio ===
              semanaActual.fechaInicio

        );


    const totalComedor =
      reportesSemana.reduce(
        (total, reporte) =>
          total +
          Number(
            reporte
              .comedorInfantil
              ?.total || 0
          ),
        0
      );


    const totalPenal =
      reportesSemana.reduce(
        (total, reporte) =>
          total +
          Number(
            reporte
              .penal
              ?.total || 0
          ),
        0
      );


    const totalServidores =
      reportesSemana.reduce(
        (total, reporte) =>
          total +
          Number(
            reporte
              .servidores
              ?.total || 0
          ),
        0
      );


    const totalPlatos =
      totalComedor +
      totalPenal;


    panel.innerHTML = `

      <div>

        <p
          class="text-sm font-semibold text-cyan-600"
        >
          Centro de Control
        </p>

        <h3
          class="mt-1 text-2xl font-black text-blue-950"
        >
          🍽️ Estado semanal · Comedor Infantil
        </h3>

        <p
          class="mt-2 text-sm text-slate-500"
        >
          Semana laboral del
          ${fechaHumana(
            semanaActual.fechaInicio
          )}
          al
          ${fechaHumana(
            semanaActual.fechaFin
          )}
        </p>

      </div>


      <div
        class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >

        <!-- COMEDOR -->

        <article
          class="rounded-2xl border border-orange-200 bg-orange-50 p-5"
        >

          <p
            class="text-sm font-semibold text-orange-700"
          >
            🍽️ Comedor Infantil
          </p>

          <p
            class="mt-2 text-3xl font-black text-orange-800"
          >
            ${totalComedor}
          </p>

          <p
            class="mt-1 text-xs font-semibold text-orange-600"
          >
            platos servidos
          </p>

        </article>


        <!-- PENAL -->

        <article
          class="rounded-2xl border border-blue-200 bg-blue-50 p-5"
        >

          <p
            class="text-sm font-semibold text-blue-700"
          >
            🍱 Penal
          </p>

          <p
            class="mt-2 text-3xl font-black text-blue-950"
          >
            ${totalPenal}
          </p>

          <p
            class="mt-1 text-xs font-semibold text-blue-600"
          >
            platos servidos
          </p>

        </article>


        <!-- TOTAL PLATOS -->

        <article
          class="rounded-2xl border border-green-200 bg-green-50 p-5"
        >

          <p
            class="text-sm font-semibold text-green-700"
          >
            📊 Total platos
          </p>

          <p
            class="mt-2 text-3xl font-black text-green-800"
          >
            ${totalPlatos}
          </p>

          <p
            class="mt-1 text-xs font-semibold text-green-600"
          >
            comedor + penal
          </p>

        </article>


        <!-- SERVIDORES -->

        <article
          class="rounded-2xl border border-violet-200 bg-violet-50 p-5"
        >

          <p
            class="text-sm font-semibold text-violet-700"
          >
            👏 Servidores
          </p>

          <p
            class="mt-2 text-3xl font-black text-violet-800"
          >
            ${totalServidores}
          </p>

          <p
            class="mt-1 text-xs font-semibold text-violet-600"
          >
            participaciones semanales
          </p>

        </article>

      </div>


      <div
        class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5"
      >

        <p
          class="text-sm font-semibold text-slate-600"
        >
          📋 Reportes recibidos esta semana
        </p>

        <p
          class="mt-2 text-3xl font-black text-blue-950"
        >
          ${reportesSemana.length}
        </p>

      </div>

    `;


    console.log(
      "RED Stats | Panel Comedor Infantil:",
      {

        fechaInicio:
          semanaActual.fechaInicio,

        fechaFin:
          semanaActual.fechaFin,

        reportes:
          reportesSemana.length,

        comedorInfantil:
          totalComedor,

        penal:
          totalPenal,

        totalPlatos,

        servidores:
          totalServidores

      }
    );


  } catch (error) {

    console.error(
      "RED Stats | Error panel Comedor Infantil:",
      error
    );


    panel.innerHTML = `

      <div
        class="rounded-2xl border border-red-200 bg-red-50 p-6 text-center"
      >

        <p
          class="font-bold text-red-700"
        >
          ⚠️ No fue posible cargar el panel semanal.
        </p>

      </div>
    `;

  }

}


// ======================================================
// FECHA HUMANA
// ======================================================

function fechaHumana(
  fechaTexto
) {

  const fecha =
    new Date(
      `${fechaTexto}T12:00:00`
    );


  return fecha.toLocaleDateString(
    "es-SV",
    {

      day:
        "numeric",

      month:
        "long"

    }
  );

}
