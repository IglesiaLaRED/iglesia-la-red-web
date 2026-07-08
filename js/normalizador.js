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
  const posiblesCampos = ["grupo", "color", "equipo"];

  for (const campo of posiblesCampos) {
    if (fila[campo]) {
      const valor = limpiarTexto(fila[campo]);

      if (valor.includes("azul")) return "Azul";
      if (valor.includes("rojo")) return "Rojo";
      if (valor.includes("verde")) return "Verde";
      if (valor.includes("naranja")) return "Naranja";
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
