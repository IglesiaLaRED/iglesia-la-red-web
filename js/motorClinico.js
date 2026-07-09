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
      porcentaje: 0,
      principal: "",
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

      respuestas.forEach(respuesta => {
        ANALISIS.areas[area.id].total++;

        ANALISIS.areas[area.id].incidencias[respuesta] =
          (ANALISIS.areas[area.id].incidencias[respuesta] || 0) + 1;
      });
    });
  });
}

function calcularPorcentajes(ANALISIS) {
  Object.values(ANALISIS.areas).forEach(area => {
    const personasConArea = Object.values(area.incidencias).reduce(
      (mayor, total) => Math.max(mayor, total),
      0
    );

    area.personas = personasConArea;

    area.porcentaje = Math.round(
      (personasConArea / ANALISIS.totalClinicas) * 100
    );
  });
}

function detectarPrincipales(ANALISIS) {
  Object.values(ANALISIS.areas).forEach(area => {
    let mayor = 0;
    let principal = "";

    Object.entries(area.incidencias).forEach(([respuesta, total]) => {
      if (total > mayor) {
        mayor = total;
        principal = respuesta;
      }
    });

    area.principal = principal;
  });
}
