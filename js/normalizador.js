function limpiarTexto(texto) {
  return String(texto ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function normalizarClinicas(filas) {
  return filas.map((fila, index) => {
    const nuevaFila = {};

    Object.entries(fila).forEach(([clave, valor]) => {
      nuevaFila[limpiarTexto(clave)] = valor;
    });

    return {
      id: index + 1,
      grupo: detectarGrupo(nuevaFila),
      respuestas: nuevaFila
    };
  });
}

function detectarGrupo(fila) {
  const posiblesCampos = [
    "grupo",
    "color",
    "equipo",
    "elegir color",
    "elige color",
    "selecciona color"
  ];

  for (const campo of posiblesCampos) {
    if (!fila[campo]) continue;

    const valor = limpiarTexto(fila[campo]);

    if (valor.includes("azul")) return "Azul";
    if (valor.includes("rojo")) return "Rojo";
    if (valor.includes("verde")) return "Verde";
    if (valor.includes("naranja")) return "Naranja";
    if (valor.includes("rosa") || valor.includes("rosado")) return "Rosa";
    if (valor.includes("amarillo") || valor.includes("amarilla")) return "Amarillo";

    if (
      valor.includes("lila") ||
      valor.includes("morado") ||
      valor.includes("morada") ||
      valor.includes("violeta")
    ) {
      return "Lila";
    }
  }

  return "Sin grupo";
}

function detectarTipoEncuentro(datos) {
  const grupos = new Set(
    datos.map(clinica => clinica.grupo).filter(grupo => grupo !== "Sin grupo")
  );

  const puntosMujeres = ["Rosa", "Amarillo", "Lila"]
    .filter(color => grupos.has(color)).length;

  const puntosHombres = ["Azul", "Verde", "Naranja"]
    .filter(color => grupos.has(color)).length;

  if (puntosMujeres > puntosHombres) return "mujeres";
  if (puntosHombres > puntosMujeres) return "hombres";

  return null;
}

function respuestaMarcada(valor) {
  const texto = limpiarTexto(valor);

  return (
    texto === "si" ||
    texto === "x" ||
    texto === "verdadero" ||
    texto === "true" ||
    texto === "1"
  );
}

