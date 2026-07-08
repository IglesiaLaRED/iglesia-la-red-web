const btnImportarClinic = document.getElementById("btnImportarClinic");
const archivoClinic = document.getElementById("archivoClinic");
const estadoImportacion = document.getElementById("estadoImportacion");
const contenedorAreas = document.getElementById("contenedorAreas");
const contenedorAlertas = document.getElementById("contenedorAlertas");

const grupos = {
  Azul: 0,
  Rojo: 0,
  Verde: 0,
  Naranja: 0
};

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

    actualizarGrupos(datosNormalizados);
    generarAreas(datosNormalizados);
    generarAlertas(datosNormalizados);

    estadoImportacion.textContent =
      `✅ RED Clinic actualizado: ${datosNormalizados.length} clínicas procesadas.`;

    console.log("✅ Hoja leída:", nombrePrimeraHoja);
    console.log("✅ Datos normalizados:", datosNormalizados);

  } catch (error) {
    console.error("❌ Error leyendo archivo:", error);
    estadoImportacion.textContent = "❌ No se pudo leer el archivo.";
    alert("❌ No se pudo leer el archivo.");
  }
});

function actualizarGrupos(datos) {
  grupos.Azul = 0;
  grupos.Rojo = 0;
  grupos.Verde = 0;
  grupos.Naranja = 0;

  datos.forEach(item => {
    if (grupos[item.grupo] !== undefined) {
      grupos[item.grupo]++;
    }
  });

  const tarjetas = document.querySelectorAll("section.grid.md\\:grid-cols-4 h3");

  tarjetas[0].textContent = grupos.Azul;
  tarjetas[1].textContent = grupos.Rojo;
  tarjetas[2].textContent = grupos.Verde;
  tarjetas[3].textContent = grupos.Naranja;
}

function generarAreas(datos) {
  const resultadosAreas = {};

  CONFIG_CLINICA.areas.forEach(area => {
    resultadosAreas[area.id] = {
      ...area,
      total: 0,
      elementos: {}
    };
  });

  datos.forEach(item => {
    Object.entries(item.respuestas).forEach(([pregunta, respuesta]) => {
      if (!respuestaMarcada(respuesta)) return;

      const preguntaLimpia = limpiarTexto(pregunta);

      CONFIG_CLINICA.areas.forEach(area => {
        area.preguntas.forEach(palabra => {
          if (preguntaLimpia.includes(limpiarTexto(palabra))) {
            resultadosAreas[area.id].total++;
            resultadosAreas[area.id].elementos[pregunta] =
              (resultadosAreas[area.id].elementos[pregunta] || 0) + 1;
          }
        });
      });
    });
  });

  const areasOrdenadas = Object.values(resultadosAreas)
    .filter(area => area.total > 0)
    .sort((a, b) => b.total - a.total);

  contenedorAreas.innerHTML = "";

  if (areasOrdenadas.length === 0) {
    contenedorAreas.innerHTML = `
      <p class="text-gray-500">No se detectaron áreas clínicas todavía.</p>
    `;
    return;
  }

  areasOrdenadas.forEach(area => {
    const porcentaje = Math.round((area.total / datos.length) * 100);

    const elementoPrincipal = Object.entries(area.elementos)
      .sort((a, b) => b[1] - a[1])[0];

    contenedorAreas.innerHTML += `
      <div class="bg-slate-50 rounded-2xl p-5 border border-slate-200">
        <p class="font-bold text-slate-700">${area.icono} ${area.nombre}</p>
        <h4 class="text-3xl font-extrabold text-cyan-700 mt-2">${porcentaje}%</h4>
        <p class="text-sm text-gray-500">${area.total} incidencias detectadas</p>
        <p class="text-sm font-semibold text-slate-700 mt-3">
          Mayor incidencia:
          <span class="text-cyan-700 capitalize">
            ${elementoPrincipal ? elementoPrincipal[0] : "No definido"}
          </span>
        </p>
      </div>
    `;
  });
}

function generarAlertas(datos) {
  const alertas = {};

  datos.forEach(item => {
    Object.entries(item.respuestas).forEach(([pregunta, respuesta]) => {
      if (!respuestaMarcada(respuesta)) return;

      const preguntaLimpia = limpiarTexto(pregunta);

      CONFIG_CLINICA.alertasCriticas.forEach(alerta => {
        if (preguntaLimpia.includes(limpiarTexto(alerta))) {
          alertas[alerta] = (alertas[alerta] || 0) + 1;
        }
      });
    });
  });

  const alertasOrdenadas = Object.entries(alertas)
    .sort((a, b) => b[1] - a[1]);

  contenedorAlertas.innerHTML = "";

  if (alertasOrdenadas.length === 0) {
    contenedorAlertas.innerHTML = `
      <p class="text-gray-500">No se detectaron alertas críticas.</p>
    `;
    return;
  }

  alertasOrdenadas.forEach(([alerta, total]) => {
    const porcentaje = Math.round((total / datos.length) * 100);

    contenedorAlertas.innerHTML += `
      <div class="bg-red-50 border border-red-200 rounded-2xl p-4">
        <p class="font-extrabold text-red-700 capitalize">⚠ ${alerta}</p>
        <p class="text-2xl font-black text-red-800 mt-1">${porcentaje}%</p>
        <p class="text-sm text-red-600">${total} casos detectados</p>
      </div>
    `;
  });
}
