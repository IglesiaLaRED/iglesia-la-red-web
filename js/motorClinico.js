function crearAnalisis(datos) {
  return {
    totalClinicas: datos.length,
    grupos: {
      Azul: 0,
      Rojo: 0,
      Verde: 0,
      Naranja: 0
    },
    areas: {},
    alertas: {}
  };
}

function analizarClinicas(datos) {
  const ANALISIS = crearAnalisis(datos);

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
    if (ANALISIS.grupos[clinica.grupo] !== undefined) {
      ANALISIS.grupos[clinica.grupo]++;
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
    "Violación",
    "Abuso Sexual",
    "Incesto",
    "Aborto",
    "Intento De Suicidio",
    "Suicidio",
    "Brujería",
    "Hechicería",
    "Pactos",
    "Ocultismo",
    "Satanismo",
    "Homicidio",
    "Asesinato"
  ];

  datos.forEach(clinica => {
    const respuestasTexto = Object.values(clinica.respuestas || {})
      .join(" ")
      .toLowerCase();

    alertasCriticas.forEach(alerta => {
      if (respuestasTexto.includes(alerta.toLowerCase())) {
        ANALISIS.alertas[alerta] = (ANALISIS.alertas[alerta] || 0) + 1;
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
