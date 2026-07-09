const btnImportarClinic = document.getElementById("btnImportarClinic");
const archivoClinic = document.getElementById("archivoClinic");
const estadoImportacion = document.getElementById("estadoImportacion");
const contenedorAreas = document.getElementById("contenedorAreas");
const contenedorAlertas = document.getElementById("contenedorAlertas");

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

    console.log("===== ANALISIS RED CLINIC =====");
    console.log(ANALISIS);

    console.table(
      Object.values(ANALISIS.areas).map(area => ({
        Area: area.nombre,
        Personas: area.personas,
        Respuestas: area.total,
        Porcentaje: area.porcentaje + "%",
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
    estadoImportacion.textContent = "❌ No se pudo leer el archivo.";
    alert("❌ No se pudo leer el archivo.");
  }
});

function actualizarGrupos(ANALISIS) {
  const tarjetas = document.querySelectorAll("section.grid.md\\:grid-cols-4 h3");

  tarjetas[0].textContent = ANALISIS.grupos.Azul;
  tarjetas[1].textContent = ANALISIS.grupos.Rojo;
  tarjetas[2].textContent = ANALISIS.grupos.Verde;
  tarjetas[3].textContent = ANALISIS.grupos.Naranja;
}

function limpiarNombreArea(nombre) {
  return nombre.replace(/\s*\(.*?\)\s*/g, "").trim();
}

function generarAreas(ANALISIS) {
  const areasOrdenadas = Object.values(ANALISIS.areas)
    .filter(area => area.personas > 0)
    .sort((a, b) => b.porcentaje - a.porcentaje);

  contenedorAreas.innerHTML = "";

  if (areasOrdenadas.length === 0) {
    contenedorAreas.innerHTML = `
      <p class="text-gray-500">No se detectaron áreas clínicas todavía.</p>
    `;
    return;
  }

  areasOrdenadas.forEach(area => {
    const tituloLimpio = limpiarNombreArea(area.nombre);
    const descripcion = tituloLimpio.toLowerCase();

    contenedorAreas.innerHTML += `
      <div class="bg-slate-50 rounded-2xl p-5 border border-slate-200">
        <p class="font-bold text-slate-700">
          ${area.icono} ${tituloLimpio}
        </p>

        <h4 class="text-3xl font-extrabold text-cyan-700 mt-2">
          ${area.porcentaje}%
        </h4>

        <p class="text-sm text-gray-500">
          ${area.personas} de ${ANALISIS.totalClinicas} personas
        </p>

        <p class="text-sm text-gray-500">
          presentan ${descripcion}
        </p>

        <p class="text-sm font-semibold text-slate-700 mt-3">
          Mayor incidencia:
          <span class="text-cyan-700 capitalize">
            ${area.principal || "No definido"}
          </span>
        </p>
      </div>
    `;
  });
}

function generarAlertas(ANALISIS) {
  const alertasOrdenadas = Object.entries(ANALISIS.alertas || {})
    .sort((a, b) => b[1] - a[1]);

  contenedorAlertas.innerHTML = "";

  if (alertasOrdenadas.length === 0) {
    contenedorAlertas.innerHTML = `
      <p class="text-gray-500">No se detectaron alertas críticas.</p>
    `;
    return;
  }

  alertasOrdenadas.forEach(([alerta, total]) => {
    const porcentaje = ANALISIS.totalClinicas
      ? Math.round((total / ANALISIS.totalClinicas) * 100)
      : 0;

    contenedorAlertas.innerHTML += `
      <div class="bg-red-50 border border-red-200 rounded-2xl p-4">
        <p class="font-extrabold text-red-700 capitalize">
          ⚠ ${alerta}
        </p>

        <p class="text-2xl font-black text-red-800 mt-1">
          ${porcentaje}%
        </p>

        <p class="text-sm text-red-600">
          ${total} casos detectados
        </p>
      </div>
    `;
  });
}
