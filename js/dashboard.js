const btnImportarClinic = document.getElementById("btnImportarClinic");
const archivoClinic = document.getElementById("archivoClinic");
const estadoImportacion = document.getElementById("estadoImportacion");
const contenedorAreas = document.getElementById("contenedorAreas");
const contenedorAlertas = document.getElementById("contenedorAlertas");

let ANALISIS_ACTUAL = null;

/* =========================================================
   IMPORTACIÓN DEL ARCHIVO
========================================================= */

btnImportarClinic.addEventListener("click", () => {
  archivoClinic.click();
});

archivoClinic.addEventListener("change", async (e) => {
  const archivo = e.target.files[0];

  if (!archivo) return;

  try {
    estadoImportacion.textContent = "Analizando archivo...";

    const datosArchivo = await archivo.arrayBuffer();

    const workbook = XLSX.read(datosArchivo, {
      type: "array"
    });

    const nombrePrimeraHoja = workbook.SheetNames[0];
    const hoja = workbook.Sheets[nombrePrimeraHoja];

    const filas = XLSX.utils.sheet_to_json(hoja, {
      defval: ""
    });

    const datosNormalizados = normalizarClinicas(filas);
    const ANALISIS = analizarClinicas(datosNormalizados);

    ANALISIS_ACTUAL = ANALISIS;

    console.log("===== ANÁLISIS RED CLINIC =====");
    console.log(ANALISIS);

    console.table(
      Object.values(ANALISIS.areas).map(area => ({
        Área: area.nombre,
        Personas: area.personas,
        Respuestas: area.total,
        Porcentaje: `${area.porcentaje}%`,
        Principal: area.principal
      }))
    );

    actualizarGrupos(ANALISIS);
    generarAreas(ANALISIS);
    generarAlertas(ANALISIS);

    estadoImportacion.textContent =
      `✅ RED Clinic actualizado: ${ANALISIS.totalClinicas} clínicas procesadas.`;

    console.log("✅ Hoja leída:", nombrePrimeraHoja);
    console.log("✅ Datos normalizados:", datosNormalizados);

  } catch (error) {
    console.error("❌ Error leyendo archivo:", error);

    estadoImportacion.textContent =
      "❌ No se pudo leer el archivo.";

    alert("❌ No se pudo leer el archivo.");
  } finally {
    archivoClinic.value = "";
  }
});

/* =========================================================
   DISTRIBUCIÓN POR GRUPOS
========================================================= */

function actualizarGrupos(ANALISIS) {
  const tarjetas = document.querySelectorAll(
    "section.grid.md\\:grid-cols-4 h3"
  );

  if (tarjetas.length < 4) {
    console.warn(
      "⚠ No se encontraron las cuatro tarjetas de grupos."
    );

    return;
  }

  tarjetas[0].textContent = ANALISIS.grupos.Azul || 0;
  tarjetas[1].textContent = ANALISIS.grupos.Rojo || 0;
  tarjetas[2].textContent = ANALISIS.grupos.Verde || 0;
  tarjetas[3].textContent = ANALISIS.grupos.Naranja || 0;
}

/* =========================================================
   FUNCIONES AUXILIARES
========================================================= */

function limpiarNombreArea(nombre = "") {
  return String(nombre)
    .replace(/\s*\(.*?\)\s*/g, "")
    .trim();
}

function escaparHTML(texto = "") {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/* =========================================================
   TARJETAS DE ÁREAS
========================================================= */

function generarAreas(ANALISIS) {
  const areasOrdenadas = Object.values(ANALISIS.areas)
    .filter(area => area.personas > 0)
    .sort((a, b) => b.porcentaje - a.porcentaje);

  contenedorAreas.innerHTML = "";

  if (areasOrdenadas.length === 0) {
    contenedorAreas.innerHTML = `
      <p class="text-gray-500">
        No se detectaron áreas clínicas todavía.
      </p>
    `;

    return;
  }

  areasOrdenadas.forEach((area, indice) => {
    const tituloLimpio = limpiarNombreArea(area.nombre);
    const descripcion = tituloLimpio.toLowerCase();

    contenedorAreas.innerHTML += `
      <button
        type="button"
        data-indice-area="${indice}"
        class="
          tarjeta-area
          w-full
          text-left
          bg-slate-50
          rounded-2xl
          p-5
          border
          border-slate-200
          transition
          duration-200
          hover:border-cyan-400
          hover:shadow-lg
          hover:-translate-y-1
          focus:outline-none
          focus:ring-2
          focus:ring-cyan-500
        "
      >
        <div class="flex items-start justify-between gap-3">
          <p class="font-bold text-slate-700">
            ${escaparHTML(area.icono)}
            ${escaparHTML(tituloLimpio)}
          </p>

          <span
            class="
              shrink-0
              text-xs
              font-bold
              text-cyan-700
              bg-cyan-100
              rounded-full
              px-3
              py-1
            "
          >
            Ver Top 5
          </span>
        </div>

        <h4 class="text-3xl font-extrabold text-cyan-700 mt-3">
          ${area.porcentaje}%
        </h4>

        <p class="text-sm text-gray-500 mt-1">
          <strong class="text-slate-700">
            ${area.personas} de ${ANALISIS.totalClinicas} personas
          </strong>
        </p>

        <p class="text-sm text-gray-500">
          presentan ${escaparHTML(descripcion)}
        </p>

        <div class="border-t border-slate-200 mt-4 pt-3">
          <p class="text-sm font-semibold text-slate-700">
            Mayor incidencia:
          </p>

          <p class="text-sm font-bold text-cyan-700 capitalize mt-1">
            ${escaparHTML(area.principal || "No definido")}
          </p>
        </div>
      </button>
    `;
  });

  const tarjetasAreas =
    contenedorAreas.querySelectorAll(".tarjeta-area");

  tarjetasAreas.forEach(tarjeta => {
    tarjeta.addEventListener("click", () => {
      const indice = Number(tarjeta.dataset.indiceArea);
      const areaSeleccionada = areasOrdenadas[indice];

      abrirModalTop5(areaSeleccionada, ANALISIS);
    });
  });
}

/* =========================================================
   MODAL TOP 5
========================================================= */

function crearModalTop5() {
  if (document.getElementById("modalTop5Clinic")) return;

  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div
        id="modalTop5Clinic"
        class="
          fixed
          inset-0
          z-50
          hidden
          items-center
          justify-center
          bg-slate-950/70
          p-4
          backdrop-blur-sm
        "
      >
        <div
          class="
            w-full
            max-w-2xl
            max-h-[90vh]
            overflow-y-auto
            bg-white
            rounded-3xl
            shadow-2xl
          "
        >
          <div
            class="
              sticky
              top-0
              z-10
              flex
              items-center
              justify-between
              gap-4
              bg-white
              border-b
              border-slate-200
              rounded-t-3xl
              px-6
              py-5
            "
          >
            <div>
              <p
                id="modalTop5Subtitulo"
                class="text-xs font-bold uppercase tracking-widest text-cyan-700"
              >
                Inteligencia pastoral
              </p>

              <h3
                id="modalTop5Titulo"
                class="text-xl md:text-2xl font-black text-slate-800"
              >
                Top 5
              </h3>
            </div>

            <button
              id="cerrarModalTop5"
              type="button"
              aria-label="Cerrar"
              class="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                bg-slate-100
                text-xl
                font-black
                text-slate-600
                transition
                hover:bg-red-100
                hover:text-red-700
              "
            >
              ×
            </button>
          </div>

          <div id="modalTop5Contenido" class="p-6"></div>
        </div>
      </div>
    `
  );

  const modal = document.getElementById("modalTop5Clinic");
  const btnCerrar = document.getElementById("cerrarModalTop5");

  btnCerrar.addEventListener("click", cerrarModalTop5);

  modal.addEventListener("click", e => {
    if (e.target === modal) {
      cerrarModalTop5();
    }
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      cerrarModalTop5();
    }
  });
}

function abrirModalTop5(area, ANALISIS) {
  crearModalTop5();

  const modal = document.getElementById("modalTop5Clinic");
  const titulo = document.getElementById("modalTop5Titulo");
  const contenido = document.getElementById("modalTop5Contenido");

  const tituloLimpio = limpiarNombreArea(area.nombre);
  const top5 = Array.isArray(area.top5) ? area.top5 : [];

  titulo.innerHTML = `
    ${escaparHTML(area.icono)}
    ${escaparHTML(tituloLimpio)}
  `;

  const top5HTML = top5.length
    ? top5
        .map((incidencia, indice) => {
          const porcentaje = Number(incidencia.porcentaje) || 0;
          const total = Number(incidencia.total) || 0;

          return `
            <div
              class="
                bg-slate-50
                border
                border-slate-200
                rounded-2xl
                p-4
              "
            >
              <div class="flex items-start gap-4">
                <div
                  class="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-cyan-100
                    font-black
                    text-cyan-800
                  "
                >
                  ${indice + 1}
                </div>

                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-4">
                    <p
                      class="
                        font-extrabold
                        text-slate-800
                        capitalize
                      "
                    >
                      ${escaparHTML(incidencia.nombre)}
                    </p>

                    <p
                      class="
                        shrink-0
                        text-lg
                        font-black
                        text-cyan-700
                      "
                    >
                      ${porcentaje}%
                    </p>
                  </div>

                  <div
                    class="
                      h-2.5
                      w-full
                      overflow-hidden
                      rounded-full
                      bg-slate-200
                      mt-3
                    "
                  >
                    <div
                      class="
                        h-full
                        rounded-full
                        bg-cyan-600
                      "
                      style="width: ${Math.min(porcentaje, 100)}%"
                    ></div>
                  </div>

                  <p class="text-xs text-slate-500 mt-2">
                    ${total} de ${ANALISIS.totalClinicas} personas
                  </p>
                </div>
              </div>
            </div>
          `;
        })
        .join("")
    : `
        <p class="text-center text-gray-500 py-6">
          No hay incidencias suficientes para mostrar el Top 5.
        </p>
      `;

  contenido.innerHTML = `
    <div
      class="
        bg-gradient-to-r
        from-cyan-50
        to-blue-50
        border
        border-cyan-200
        rounded-2xl
        p-5
        mb-6
      "
    >
      <div class="grid grid-cols-2 gap-4">
        <div>
          <p class="text-xs uppercase font-bold tracking-wider text-slate-500">
            Personas afectadas
          </p>

          <p class="text-2xl font-black text-slate-800 mt-1">
            ${area.personas} de ${ANALISIS.totalClinicas}
          </p>
        </div>

        <div>
          <p class="text-xs uppercase font-bold tracking-wider text-slate-500">
            Porcentaje del área
          </p>

          <p class="text-2xl font-black text-cyan-700 mt-1">
            ${area.porcentaje}%
          </p>
        </div>
      </div>
    </div>

    <div class="mb-4">
      <p class="text-xs uppercase font-bold tracking-widest text-slate-500">
        Cinco incidencias principales
      </p>

      <h4 class="text-xl font-black text-slate-800 mt-1">
        Top 5 del área
      </h4>
    </div>

    <div class="space-y-3">
      ${top5HTML}
    </div>
  `;

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  document.body.classList.add("overflow-hidden");
}

function cerrarModalTop5() {
  const modal = document.getElementById("modalTop5Clinic");

  if (!modal) return;

  modal.classList.add("hidden");
  modal.classList.remove("flex");

  document.body.classList.remove("overflow-hidden");
}

/* =========================================================
   ALERTAS CRÍTICAS
========================================================= */

function generarAlertas(ANALISIS) {
  const alertasOrdenadas = Object.entries(
    ANALISIS.alertas || {}
  ).sort((a, b) => obtenerTotalAlerta(b[1]) - obtenerTotalAlerta(a[1]));

  contenedorAlertas.innerHTML = "";

  if (alertasOrdenadas.length === 0) {
    contenedorAlertas.innerHTML = `
      <p class="text-gray-500">
        No se detectaron alertas críticas.
      </p>
    `;

    return;
  }

  alertasOrdenadas.forEach(([alerta, datosAlerta]) => {
    const total = obtenerTotalAlerta(datosAlerta);

    const porcentaje = ANALISIS.totalClinicas
      ? Math.round((total / ANALISIS.totalClinicas) * 100)
      : 0;

    contenedorAlertas.innerHTML += `
      <div
        class="
          bg-red-50
          border
          border-red-200
          rounded-2xl
          p-4
        "
      >
        <p class="font-extrabold text-red-700 capitalize">
          ⚠ ${escaparHTML(alerta)}
        </p>

        <p class="text-2xl font-black text-red-800 mt-1">
          ${porcentaje}%
        </p>

        <p class="text-sm text-red-600">
          ${total} ${total === 1 ? "caso detectado" : "casos detectados"}
        </p>
      </div>
    `;
  });
}

function obtenerTotalAlerta(datosAlerta) {
  if (typeof datosAlerta === "number") {
    return datosAlerta;
  }

  if (
    datosAlerta &&
    typeof datosAlerta === "object" &&
    typeof datosAlerta.total === "number"
  ) {
    return datosAlerta.total;
  }

  return 0;
}
