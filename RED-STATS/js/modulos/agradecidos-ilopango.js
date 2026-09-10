// ======================================================
// RED STATS — AGRADECIDOS CON DIOS · ILOPANGO
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
// CONFIGURACIÓN DEL MÓDULO
// ======================================================

const SEDE = "ilopango";

const NOMBRE_SEDE =
  "Agradecidos con Dios · Ilopango";


// ======================================================
// RENDER PRINCIPAL
// ======================================================

export async function renderAgradecidosIlopango(
  contenedor
) {

  if (!contenedor) {
    return;
  }


  contenedor.innerHTML = `

    <section class="space-y-6">

      <div>

        <p
          class="text-sm font-semibold text-cyan-600"
        >
          Reporte semanal
        </p>

        <h2
          class="mt-1 text-3xl font-black text-blue-950"
        >
          🙏 Agradecidos con Dios
        </h2>

        <p
          class="mt-2 text-sm text-slate-500"
        >
          Sede Ilopango · Registro de atención y resultados ministeriales.
        </p>

      </div>


      <div
        class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >

        <!-- FECHA -->

        <div>

          <label
            class="text-sm font-bold text-blue-950"
          >
            📅 Fecha
          </label>

          <input
            id="fechaAgradecidosIlopango"
            type="date"
            class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-cyan-500"
          >

        </div>


        <!-- DATOS -->

        <div class="mt-6">

          <p
            class="text-xs font-black uppercase tracking-wider text-cyan-600"
          >
            Datos del ministerio
          </p>


          <div
            class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
          >

            ${crearCampoNumero(
              "platosAgradecidosIlopango",
              "🍽️ Platos entregados"
            )}

            ${crearCampoNumero(
              "refrigeriosAgradecidosIlopango",
              "🥤 Refrigerios"
            )}

            ${crearCampoNumero(
              "aceptaronAgradecidosIlopango",
              "🙏 Aceptaron"
            )}

            ${crearCampoNumero(
              "reconciliaronAgradecidosIlopango",
              "🤝 Reconciliaron"
            )}

            ${crearCampoNumero(
              "servidoresAgradecidosIlopango",
              "👏 Servidores"
            )}

          </div>

        </div>


        <!-- GUARDAR -->

        <button
          id="btnGuardarAgradecidosIlopango"
          type="button"
          class="mt-7 w-full rounded-2xl bg-cyan-600 px-5 py-4 font-black text-white shadow-sm transition hover:bg-cyan-700"
        >
          💾 Guardar reporte
        </button>


        <p
          id="estadoAgradecidosIlopango"
          class="mt-3 text-center text-sm font-semibold text-slate-500"
        ></p>


        <!-- PANEL SEMANAL -->

        <section
          id="panelAgradecidosIlopango"
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


  conectarEventosAgradecidosIlopango(
    contenedor
  );


  await cargarPanelAgradecidosIlopango(
    contenedor
  );

}


// ======================================================
// CAMPO NUMÉRICO
// ======================================================

function crearCampoNumero(
  id,
  etiqueta
) {

  return `

    <div>

      <label
        for="${id}"
        class="text-sm font-semibold text-slate-600"
      >
        ${etiqueta}
      </label>

      <input
        id="${id}"
        type="number"
        min="0"
        step="1"
        value="0"
        class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg font-bold text-blue-950 outline-none transition focus:border-cyan-500"
      >

    </div>
  `;

}


// ======================================================
// EVENTOS
// ======================================================

function conectarEventosAgradecidosIlopango(
  contenedor
) {

  const btnGuardar =
    contenedor.querySelector(
      "#btnGuardarAgradecidosIlopango"
    );


  btnGuardar?.addEventListener(
    "click",
    async () => {

      await guardarReporteAgradecidosIlopango(
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
        .querySelector(`#${id}`)
        ?.value || 0
    );


  return Number.isFinite(valor)
    ? Math.max(0, valor)
    : 0;

}


// ======================================================
// OBTENER DATOS
// ======================================================

function obtenerDatosAgradecidosIlopango(
  contenedor
) {

  return {

    fecha:
      contenedor
        .querySelector(
          "#fechaAgradecidosIlopango"
        )
        ?.value || "",

    platosEntregados:
      obtenerNumero(
        contenedor,
        "platosAgradecidosIlopango"
      ),

    refrigerios:
      obtenerNumero(
        contenedor,
        "refrigeriosAgradecidosIlopango"
      ),

    aceptaron:
      obtenerNumero(
        contenedor,
        "aceptaronAgradecidosIlopango"
      ),

    reconciliaron:
      obtenerNumero(
        contenedor,
        "reconciliaronAgradecidosIlopango"
      ),

    servidores:
      obtenerNumero(
        contenedor,
        "servidoresAgradecidosIlopango"
      )

  };

}


// ======================================================
// GUARDAR REPORTE
// ======================================================

async function guardarReporteAgradecidosIlopango(
  contenedor
) {

  const estado =
    contenedor.querySelector(
      "#estadoAgradecidosIlopango"
    );


  const btnGuardar =
    contenedor.querySelector(
      "#btnGuardarAgradecidosIlopango"
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
      obtenerDatosAgradecidosIlopango(
        contenedor
      );


    // --------------------------------------------------
    // VALIDACIÓN
    // --------------------------------------------------

    if (!datos.fecha) {

      throw new Error(
        "Selecciona la fecha del reporte."
      );

    }


    // --------------------------------------------------
    // ESTADO VISUAL
    // --------------------------------------------------

    if (btnGuardar) {

      btnGuardar.disabled =
        true;

      btnGuardar.textContent =
        "⏳ Guardando...";

    }


    if (estado) {

      estado.textContent =
        "Guardando reporte...";

    }


    // --------------------------------------------------
    // ID ÚNICO
    // Sede + fecha
    // --------------------------------------------------

    const reporteId =
      `${SEDE}_${datos.fecha}`;


    const reporteRef =
      doc(
        db,
        "reportesAgradecidos",
        reporteId
      );


    // --------------------------------------------------
    // COMPROBAR EXISTENCIA
    // --------------------------------------------------

    const snapshotExistente =
      await getDoc(
        reporteRef
      );


    const existe =
      snapshotExistente.exists();


    // --------------------------------------------------
    // DATOS DEL REPORTE
    // --------------------------------------------------

    const reporte = {

      tipo:
        "agradecidos",

      sede:
        SEDE,

      sedeNombre:
        NOMBRE_SEDE,

      fecha:
        datos.fecha,

      platosEntregados:
        datos.platosEntregados,

      refrigerios:
        datos.refrigerios,

      aceptaron:
        datos.aceptaron,

      reconciliaron:
        datos.reconciliaron,

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


    // --------------------------------------------------
    // ÉXITO
    // --------------------------------------------------

    console.log(
      "RED Stats | Agradecidos Ilopango:",
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
          ? "✅ Reporte actualizado correctamente."
          : "✅ Reporte guardado correctamente.";

    }


    alert(
      existe
        ? "✅ Reporte de Agradecidos Ilopango actualizado correctamente."
        : "✅ Reporte de Agradecidos Ilopango guardado correctamente."
    );


    await cargarPanelAgradecidosIlopango(
      contenedor
    );


  } catch (error) {

    console.error(
      "RED Stats | Error Agradecidos Ilopango:",
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
        "💾 Guardar reporte";

    }

  }

}


// ======================================================
// PANEL SEMANAL
// ======================================================

async function cargarPanelAgradecidosIlopango(
  contenedor
) {

  const panel =
    contenedor.querySelector(
      "#panelAgradecidosIlopango"
    );


  if (!panel) {
    return;
  }


  try {

    // --------------------------------------------------
    // SEMANA ACTUAL
    // --------------------------------------------------

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
      hoy.getDate() +
      diferenciaLunes
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


    const convertirFecha =
      (fecha) => {

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

      };


    const fechaInicio =
      convertirFecha(
        lunes
      );


    const fechaFin =
      convertirFecha(
        domingo
      );


    // --------------------------------------------------
    // LEER REPORTES
    // --------------------------------------------------

    const snapshot =
      await getDocs(
        collection(
          db,
          "reportesAgradecidos"
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

            reporte.sede ===
              SEDE

            &&

            reporte.fecha >=
              fechaInicio

            &&

            reporte.fecha <=
              fechaFin

        );


    // --------------------------------------------------
    // SUMATORIAS
    // --------------------------------------------------

    const sumar =
      (campo) =>
        reportesSemana.reduce(
          (total, reporte) =>
            total +
            Number(
              reporte[campo] || 0
            ),
          0
        );


    const totalPlatos =
      sumar(
        "platosEntregados"
      );


    const totalRefrigerios =
      sumar(
        "refrigerios"
      );


    const totalAceptaron =
      sumar(
        "aceptaron"
      );


    const totalReconciliaron =
      sumar(
        "reconciliaron"
      );


    const totalServidores =
      sumar(
        "servidores"
      );


    // --------------------------------------------------
    // FECHA HUMANA
    // --------------------------------------------------

    const fechaHumana =
      (fechaTexto) => {

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

      };


    // --------------------------------------------------
    // RENDER DEL PANEL
    // --------------------------------------------------

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
          🙏 Estado semanal · Ilopango
        </h3>

        <p
          class="mt-2 text-sm text-slate-500"
        >
          Semana del
          ${fechaHumana(fechaInicio)}
          al
          ${fechaHumana(fechaFin)}
        </p>

      </div>


      <div
        class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
      >

        <article
          class="rounded-2xl border border-orange-200 bg-orange-50 p-5"
        >

          <p
            class="text-sm font-semibold text-orange-700"
          >
            🍽️ Platos entregados
          </p>

          <p
            class="mt-2 text-3xl font-black text-orange-800"
          >
            ${totalPlatos}
          </p>

        </article>


        <article
          class="rounded-2xl border border-blue-200 bg-blue-50 p-5"
        >

          <p
            class="text-sm font-semibold text-blue-700"
          >
            🥤 Refrigerios
          </p>

          <p
            class="mt-2 text-3xl font-black text-blue-950"
          >
            ${totalRefrigerios}
          </p>

        </article>


        <article
          class="rounded-2xl border border-green-200 bg-green-50 p-5"
        >

          <p
            class="text-sm font-semibold text-green-700"
          >
            🙏 Aceptaron
          </p>

          <p
            class="mt-2 text-3xl font-black text-green-800"
          >
            ${totalAceptaron}
          </p>

        </article>


        <article
          class="rounded-2xl border border-cyan-200 bg-cyan-50 p-5"
        >

          <p
            class="text-sm font-semibold text-cyan-700"
          >
            🤝 Reconciliaron
          </p>

          <p
            class="mt-2 text-3xl font-black text-cyan-800"
          >
            ${totalReconciliaron}
          </p>

        </article>


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
      "RED Stats | Panel Agradecidos Ilopango:",
      {

        fechaInicio,
        fechaFin,

        reportes:
          reportesSemana.length,

        platos:
          totalPlatos,

        refrigerios:
          totalRefrigerios,

        aceptaron:
          totalAceptaron,

        reconciliaron:
          totalReconciliaron,

        servidores:
          totalServidores

      }
    );


  } catch (error) {

    console.error(
      "RED Stats | Error panel Agradecidos Ilopango:",
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
