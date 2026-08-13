// ============================================================
// RED STATS
// Módulo: Acomodación
// Iglesia La RED
// ============================================================

const BLOQUES_ACOMODACION = [
  "Bloque 1",
  "Bloque 2",
  "Bloque 3",
  "Bloque 4",
  "Mezanine"
];

const CAMPOS_ACOMODACION = [
  { id: "hombres", nombre: "Hombres", icono: "👨" },
  { id: "mujeres", nombre: "Mujeres", icono: "👩" },
  { id: "jovenes", nombre: "Jóvenes", icono: "🧑" },
  { id: "servidores", nombre: "Servidores", icono: "🤝" },
  { id: "primeraVez", nombre: "Primera Vez", icono: "✨" }
];


// ============================================================
// FUNCIÓN PRINCIPAL
// ============================================================

export function renderAcomodacion(contenedor) {

  if (!contenedor) {
    console.error("RED Stats: No se encontró el contenedor de Acomodación.");
    return;
  }

  contenedor.innerHTML = `
    <div class="space-y-7">

      <!-- Encabezado -->
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
      </section>


      <!-- Bloques -->
      <section
        id="contenedorBloquesAcomodacion"
        class="grid gap-5 xl:grid-cols-2"
      >
        ${BLOQUES_ACOMODACION.map((bloque, indice) =>
          crearTarjetaBloque(bloque, indice)
        ).join("")}
      </section>


      <!-- Resumen general -->
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

          ${CAMPOS_ACOMODACION.map(campo => `
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
          `).join("")}


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


      <!-- Acciones -->
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
          class="rounded-xl bg-blue-900 px-6 py-3 font-bold text-white transition hover:bg-blue-800"
        >
          Guardar reporte
        </button>

      </section>

    </div>
  `;


  conectarEventosAcomodacion(contenedor);

  calcularTotalesAcomodacion(contenedor);
}


// ============================================================
// CREAR TARJETA DE BLOQUE
// ============================================================

function crearTarjetaBloque(nombreBloque, indice) {

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

        ${CAMPOS_ACOMODACION.map(campo => `
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
        `).join("")}


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

function conectarEventosAcomodacion(contenedor) {

  const campos = contenedor.querySelectorAll(".campo-acomodacion");

  campos.forEach(campo => {

    campo.addEventListener("input", () => {

      if (Number(campo.value) < 0) {
        campo.value = 0;
      }

      calcularTotalesAcomodacion(contenedor);
    });

  });


  const btnLimpiar = contenedor.querySelector("#btnLimpiarAcomodacion");

  btnLimpiar?.addEventListener("click", () => {

    campos.forEach(campo => {
      campo.value = "";
    });

    calcularTotalesAcomodacion(contenedor);
  });


  const btnGuardar = contenedor.querySelector("#btnGuardarAcomodacion");

  btnGuardar?.addEventListener("click", () => {

    const datos = obtenerDatosAcomodacion(contenedor);

    console.log("RED Stats | Acomodación:", datos);

    alert(
      "Reporte calculado correctamente.\\n\\n" +
      "En la siguiente fase conectaremos este botón con Firebase."
    );

  });

}


// ============================================================
// CALCULAR TOTALES
// ============================================================

function calcularTotalesAcomodacion(contenedor) {

  const totalesCategorias = {
    hombres: 0,
    mujeres: 0,
    jovenes: 0,
    servidores: 0,
    primeraVez: 0
  };


  BLOQUES_ACOMODACION.forEach((bloque, indice) => {

    let totalBloque = 0;

    CAMPOS_ACOMODACION.forEach(campo => {

      const input = contenedor.querySelector(
        `[data-bloque="${indice}"][data-campo="${campo.id}"]`
      );

      const valor = obtenerNumero(input?.value);

      totalBloque += valor;

      totalesCategorias[campo.id] += valor;

    });


    const elementoTotalBloque = contenedor.querySelector(
      `#total-bloque-${indice}`
    );

    if (elementoTotalBloque) {
      elementoTotalBloque.textContent = totalBloque;
    }

  });


  CAMPOS_ACOMODACION.forEach(campo => {

    const elemento = contenedor.querySelector(`#total-${campo.id}`);

    if (elemento) {
      elemento.textContent = totalesCategorias[campo.id];
    }

  });


  const totalGeneral =
    totalesCategorias.hombres +
    totalesCategorias.mujeres +
    totalesCategorias.jovenes +
    totalesCategorias.servidores +
    totalesCategorias.primeraVez;


  const elementoTotalGeneral = contenedor.querySelector(
    "#totalGeneralAcomodacion"
  );

  if (elementoTotalGeneral) {
    elementoTotalGeneral.textContent = totalGeneral;
  }

}


// ============================================================
// OBTENER DATOS DEL FORMULARIO
// ============================================================

export function obtenerDatosAcomodacion(contenedor) {

  const bloques = {};

  const totales = {
    hombres: 0,
    mujeres: 0,
    jovenes: 0,
    servidores: 0,
    primeraVez: 0,
    totalGeneral: 0
  };


  BLOQUES_ACOMODACION.forEach((nombreBloque, indice) => {

    const claveBloque = normalizarClaveBloque(nombreBloque);

    const datosBloque = {};

    let totalBloque = 0;


    CAMPOS_ACOMODACION.forEach(campo => {

      const input = contenedor.querySelector(
        `[data-bloque="${indice}"][data-campo="${campo.id}"]`
      );

      const valor = obtenerNumero(input?.value);

      datosBloque[campo.id] = valor;

      totalBloque += valor;

      totales[campo.id] += valor;

    });


    datosBloque.total = totalBloque;

    bloques[claveBloque] = datosBloque;

  });


  totales.totalGeneral =
    totales.hombres +
    totales.mujeres +
    totales.jovenes +
    totales.servidores +
    totales.primeraVez;


  return {
    ministerio: "acomodacion",
    bloques,
    totales
  };
}


// ============================================================
// UTILIDADES
// ============================================================

function obtenerNumero(valor) {

  const numero = Number(valor);

  if (!Number.isFinite(numero) || numero < 0) {
    return 0;
  }

  return Math.floor(numero);
}


function normalizarClaveBloque(nombre) {

  return nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
}
