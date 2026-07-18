function crearAnalisis(datos, tipoEncuentro = "hombres") {
  const encuentro = obtenerConfigEncuentro(tipoEncuentro);
  const grupos = {};

  encuentro.grupos.forEach(grupo => {
    grupos[grupo.id] = 0;
  });

  return {
    version: CONFIG_CLINICA.version,
    tipoEncuentro,
    encuentro,
    totalClinicas: datos.length,
    grupos,
    sinGrupo: 0,
    areas: {},
    alertas: {}
  };
}

function analizarClinicas(datos, tipoEncuentroForzado = null) {
  const tipoEncuentro =
    tipoEncuentroForzado ||
    detectarTipoEncuentro(datos) ||
    "hombres";

  const ANALISIS = crearAnalisis(datos, tipoEncuentro);

  contarGrupos(datos, ANALISIS);
  prepararAreas(ANALISIS);
  contarIncidenciasAreas(datos, ANALISIS);
  detectarAlertasCriticas(datos, ANALISIS);
  calcularPorcentajes(ANALISIS);
  detectarPrincipales(ANALISIS);

  return ANALISIS;
}

function contarGrupos(datos, ANALISIS) {
  datos.forEach(clinica => {
    if (Object.prototype.hasOwnProperty.call(ANALISIS.grupos, clinica.grupo)) {
      ANALISIS.grupos[clinica.grupo]++;
    } else {
      ANALISIS.sinGrupo++;
    }
  });
}

function prepararAreas(ANALISIS) {
  CONFIG_CLINICA.areas.forEach(area => {
    ANALISIS.areas[area.id] = {
      nombre: area.nombre,
      icono: area.icono,
      color: area.color,
      columna: area.columna,
      total: 0,
      personas: 0,
      porcentaje: 0,
      principal: "",
      top5: [],
      incidencias: {}
    };
  });
}

function contarIncidenciasAreas(datos, ANALISIS) {
  if (!datos.length) return;

  CONFIG_CLINICA.areas.forEach(area => {
    datos.forEach(clinica => {
      const columnaEncontrada = Object.keys(clinica.respuestas).find(campo =>
        limpiarTexto(campo).includes(limpiarTexto(area.columna))
      );

      if (!columnaEncontrada) return;

      const contenido = clinica.respuestas[columnaEncontrada];
      if (!contenido) return;

      const respuestas = String(contenido)
        .split(/\n|,|;/)
        .map(item => item.trim())
        .filter(Boolean);

      if (respuestas.length > 0) {
        ANALISIS.areas[area.id].personas++;
      }

      respuestas.forEach(respuesta => {
        ANALISIS.areas[area.id].total++;
        ANALISIS.areas[area.id].incidencias[respuesta] =
          (ANALISIS.areas[area.id].incidencias[respuesta] || 0) + 1;
      });
    });
  });
}

function detectarAlertasCriticas(datos, ANALISIS) {
  const alertasCriticas = [
    { nombre: "Soledad / Angustia / Suicidio", palabras: ["soledad", "angustia", "suicidio", "intento de suicidio"] },
    { nombre: "Depresión", palabras: ["depresion", "depresión"] },
    { nombre: "Culpabilidad por pecado imperdonable", palabras: ["culpabilidad por pecado imperdonable", "pecado imperdonable"] },
    { nombre: "Asesinato", palabras: ["asesinato", "homicidio"] },
    { nombre: "Violación", palabras: ["violacion", "violación"] },
    { nombre: "Aborto", palabras: ["aborto"] },
    { nombre: "Cleptomanía", palabras: ["cleptomania", "cleptomanía"] },
    { nombre: "Consumo de drogas", palabras: ["drogas", "consumo de drogas", "adiccion a drogas", "adicción a drogas"] },
    { nombre: "Brujería", palabras: ["brujo", "bruja", "brujeria", "brujería", "hechiceria", "hechicería"] },
    { nombre: "Oraciones satánicas", palabras: ["oraciones satanicas", "oraciones satánicas", "satanicas", "satánicas", "satanismo"] },
    { nombre: "Curanderos", palabras: ["curandero", "curanderos", "curanderismo"] }
  ];

  datos.forEach(clinica => {
    const respuestasTexto = limpiarTexto(
      Object.values(clinica.respuestas || {}).join(" ")
    );

    alertasCriticas.forEach(alerta => {
      const detectada = alerta.palabras.some(palabra =>
        respuestasTexto.includes(limpiarTexto(palabra))
      );

      if (detectada) {
        ANALISIS.alertas[alerta.nombre] =
          (ANALISIS.alertas[alerta.nombre] || 0) + 1;
      }
    });
  });
}

function calcularPorcentajes(ANALISIS) {
  Object.values(ANALISIS.areas).forEach(area => {
    area.porcentaje = ANALISIS.totalClinicas
      ? Math.round((area.personas / ANALISIS.totalClinicas) * 100)
      : 0;
  });
}

function detectarPrincipales(ANALISIS) {
  Object.values(ANALISIS.areas).forEach(area => {
    const ordenadas = Object.entries(area.incidencias)
      .sort((a, b) => b[1] - a[1]);

    area.principal = ordenadas.length ? ordenadas[0][0] : "Sin datos";

    area.top5 = ordenadas.slice(0, 5).map(([nombre, total]) => ({
      nombre,
      total,
      porcentaje: ANALISIS.totalClinicas
        ? Math.round((total / ANALISIS.totalClinicas) * 100)
        : 0
    }));
  });
}
