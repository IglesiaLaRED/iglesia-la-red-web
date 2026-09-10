// ======================================================
// RED STATS — MÓDULO BARCAS
// Iglesia La RED
// ======================================================

import { db, auth } from "../../firebase.js";

import {
  collection,
  getDocs,
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";


// ======================================================
// RENDER PRINCIPAL
// ======================================================

export async function renderBarcas(
  contenedor,
  contexto = {}
) {

  if (!contenedor) {
    return;
  }

  contenedor.innerHTML = `
    <section class="space-y-6">

      <div>
        <p class="text-sm font-semibold text-cyan-600">
          Reporte semanal
        </p>

        <h2 class="mt-1 text-3xl font-black text-blue-950">
          🚤 Barcas
        </h2>

        <p class="mt-2 text-sm text-slate-500">
          Registra la asistencia semanal de las Barcas de Iglesia La RED.
        </p>
      </div>


      <div
        class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
      >

        <div
          id="estadoCargaBarcas"
          class="py-10 text-center"
        >

          <div class="text-4xl">
            ⏳
          </div>

          <p class="mt-3 font-bold text-blue-950">
            Cargando Barcas...
          </p>

        </div>

        <div
          id="contenidoBarcas"
          class="hidden"
        ></div>

      </div>

    </section>
  `;


  await cargarCatalogoBarcas(
    contenedor,
    contexto
  );
}


// ======================================================
// CARGAR CATÁLOGO DE BARCAS
// ======================================================

async function cargarCatalogoBarcas(
  contenedor,
  contexto
) {

  const estadoCarga =
    contenedor.querySelector(
      "#estadoCargaBarcas"
    );

  const contenido =
    contenedor.querySelector(
      "#contenidoBarcas"
    );


  try {

    const snapshot =
      await getDocs(
        collection(
          db,
          "barcas"
        )
      );


    const barcas =
      snapshot.docs
        .map(
          (documento) => ({
            id: documento.id,
            ...documento.data()
          })
        )
        .filter(
          (barca) =>
            barca.nombre
        )
        .sort(
          (a, b) =>
            String(a.nombre)
              .localeCompare(
                String(b.nombre),
                "es",
                {
                  sensitivity: "base"
                }
              )
        );


    mostrarFormularioBarcas(
      contenido,
      barcas,
      contexto
    );


    estadoCarga?.classList.add(
      "hidden"
    );

    contenido?.classList.remove(
      "hidden"
    );


  } catch (error) {

    console.error(
      "RED Stats | Error al cargar Barcas:",
      error
    );


    if (estadoCarga) {

      estadoCarga.innerHTML = `
        <div class="text-4xl">
          ⚠️
        </div>

        <p class="mt-3 font-bold text-red-700">
          No fue posible cargar las Barcas.
        </p>

        <p class="mt-2 text-sm text-slate-500">
          Revisa la consola para obtener más información.
        </p>
      `;

    }

  }
}


// ======================================================
// FORMULARIO
// ======================================================

function mostrarFormularioBarcas(
  contenedor,
  barcas,
  contexto
) {

  if (!contenedor) {
    return;
  }


const opciones =
  barcas
    .map(
      (barca) => {

        const anfitrion =
          String(
            barca.anfitrion || ""
          ).trim();

        return `
          <option value="${barca.id}">
            ${barca.nombre}${
              anfitrion
                ? ` — ${anfitrion}`
                : ""
            }
          </option>
        `;

      }
    )
    .join("");


  contenedor.innerHTML = `

    <div class="space-y-6">

      <!-- SELECTOR DE BARCA -->

      <div>

        <label
          class="text-sm font-bold text-blue-950"
        >
          🚤 Seleccionar Barca
        </label>

        <select
          id="selectorBarca"
          class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-cyan-500"
        >

          <option value="">
            Selecciona una Barca
          </option>

          ${opciones}

        </select>

      </div>


      <!-- INFORMACIÓN DE LA BARCA -->

      <div
        id="informacionBarca"
        class="hidden rounded-2xl border border-blue-100 bg-blue-50 p-5"
      ></div>


      <!-- FECHA -->

      <div>

        <label
          class="text-sm font-bold text-blue-950"
        >
          📅 Fecha de reunión
        </label>

        <input
          id="fechaBarca"
          type="date"
          class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-cyan-500"
        >

      </div>


      <!-- ASISTENCIA -->

      <div>

        <p
          class="text-xs font-black uppercase tracking-wider text-cyan-600"
        >
          Asistencia
        </p>


        <div
          class="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
        >

          ${crearCampoNumero(
            "ninosBarca",
            "👶 Niños"
          )}

          ${crearCampoNumero(
            "jovenesBarca",
            "👦 Jóvenes"
          )}

          ${crearCampoNumero(
            "mujeresBarca",
            "👩 Mujeres"
          )}

          ${crearCampoNumero(
            "hombresBarca",
            "👨 Hombres"
          )}

          ${crearCampoNumero(
            "primeraVezBarca",
            "✨ Primera Vez"
          )}

        </div>

      </div>


      <!-- TOTAL -->

      <div
        class="rounded-2xl bg-blue-950 p-6 text-center text-white"
      >

        <p class="text-sm font-semibold text-blue-200">
          Total asistencia
        </p>

        <p
          id="totalBarca"
          class="mt-1 text-5xl font-black"
        >
          0
        </p>

      </div>


      <!-- GUARDAR -->

      <button
        id="btnGuardarBarca"
        type="button"
        class="w-full rounded-2xl bg-cyan-600 px-5 py-4 font-black text-white shadow-sm transition hover:bg-cyan-700"
      >
        💾 Guardar reporte
      </button>


      <p
        id="estadoBarca"
        class="text-center text-sm font-semibold text-slate-500"
      ></p>

    </div>
  `;


  conectarEventosBarcas(
    contenedor,
    barcas,
    contexto
  );
}


// ======================================================
// CREAR CAMPO NUMÉRICO
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
        class="campoBarca mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-lg font-bold text-blue-950 outline-none transition focus:border-cyan-500"
      >

    </div>
  `;
}


// ======================================================
// EVENTOS
// ======================================================

function conectarEventosBarcas(
  contenedor,
  barcas,
  contexto
) {

  const selector =
    contenedor.querySelector(
      "#selectorBarca"
    );

  const informacion =
    contenedor.querySelector(
      "#informacionBarca"
    );


  selector?.addEventListener(
    "change",
    () => {

      const barca =
        barcas.find(
          (item) =>
            item.id === selector.value
        );


      if (!barca) {

        informacion.classList.add(
          "hidden"
        );

        informacion.innerHTML = "";

        return;
      }


      informacion.innerHTML = `

        <p class="font-black text-blue-950">
          ${barca.nombre || ""}
        </p>

        <div
          class="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-3"
        >

          <p>
            🏠 <strong>Anfitrión:</strong>
            ${barca.anfitrion || "No registrado"}
          </p>

          <p>
            📍 <strong>Zona:</strong>
            ${barca.zona || "No registrada"}
          </p>

          <p>
            🕐 <strong>Horario:</strong>
            ${barca.horario || "No registrado"}
          </p>

        </div>
      `;


      informacion.classList.remove(
        "hidden"
      );

    }
  );


  contenedor
    .querySelectorAll(
      ".campoBarca"
    )
    .forEach(
      (campo) => {

        campo.addEventListener(
          "input",
          () =>
            calcularTotalBarca(
              contenedor
            )
        );

      }
    );


  const btnGuardar =
    contenedor.querySelector(
      "#btnGuardarBarca"
    );


  btnGuardar?.addEventListener(
    "click",
    () => {

      console.log(
        "RED Stats | Barca preparada para guardar:",
        obtenerDatosFormularioBarca(
          contenedor,
          barcas
        )
      );

    }
  );
}


// ======================================================
// CALCULAR TOTAL
// ======================================================

function calcularTotalBarca(
  contenedor
) {

  const numero =
    (id) => {

      const valor =
        Number(
          contenedor
            .querySelector(`#${id}`)
            ?.value || 0
        );

      return Number.isFinite(valor)
        ? Math.max(0, valor)
        : 0;
    };


  const total =
    numero("ninosBarca") +
    numero("jovenesBarca") +
    numero("mujeresBarca") +
    numero("hombresBarca") +
    numero("primeraVezBarca");


  const elementoTotal =
    contenedor.querySelector(
      "#totalBarca"
    );


  if (elementoTotal) {
    elementoTotal.textContent =
      total;
  }


  return total;
}


// ======================================================
// OBTENER DATOS DEL FORMULARIO
// ======================================================

function obtenerDatosFormularioBarca(
  contenedor,
  barcas
) {

  const selector =
    contenedor.querySelector(
      "#selectorBarca"
    );


  const barca =
    barcas.find(
      (item) =>
        item.id === selector?.value
    );


  const numero =
    (id) =>
      Math.max(
        0,
        Number(
          contenedor
            .querySelector(`#${id}`)
            ?.value || 0
        )
      );


  return {

    barcaId:
      barca?.id || "",

    barca:
      barca?.nombre || "",

    anfitrion:
      barca?.anfitrion || "",

    zona:
      barca?.zona || "",

    horario:
      barca?.horario || "",

    fecha:
      contenedor
        .querySelector(
          "#fechaBarca"
        )
        ?.value || "",

    ninos:
      numero("ninosBarca"),

    jovenes:
      numero("jovenesBarca"),

    mujeres:
      numero("mujeresBarca"),

    hombres:
      numero("hombresBarca"),

    primeraVez:
      numero("primeraVezBarca"),

    total:
      calcularTotalBarca(
        contenedor
      )

  };
}
