function limpiarTexto(texto) {
  return String(texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function normalizarClinicas(filas) {
  return filas.map((fila, index) => {
    const nuevaFila = {};

    Object.entries(fila).forEach(([clave, valor]) => {
      const claveLimpia = limpiarTexto(clave);
      nuevaFila[claveLimpia] = valor;
    });

    return {
      id: index + 1,
      grupo: detectarGrupo(nuevaFila),
      respuestas: nuevaFila
    };
  });
}

function detectarGrupo(fila) {
  const posiblesCampos = ["grupo", "color", "equipo", "elegir color"];

  for (const campo of posiblesCampos) {
    if (fila[campo]) {
      const valor = limpiarTexto(fila[campo]);

      if (valor.includes("rosa")) return "Rosa";
      if (valor.includes("rojo")) return "Rojo";
      if (valor.includes("lila")) return "Lila";
      if (valor.includes("amarilo")) return "Amarillo";
    }
  }

  return "Sin grupo";
}

function respuestaMarcada(valor) {
  const texto = limpiarTexto(valor);

  return (
    texto === "si" ||
    texto === "sí" ||
    texto === "x" ||
    texto === "verdadero" ||
    texto === "true" ||
    texto === "1"
  );
}
