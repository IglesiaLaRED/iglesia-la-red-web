const CONFIG_CLINICA = {
  version: "2.0",

  encuentros: {
    hombres: {
      id: "hombres",
      titulo: "Encuentro de Hombres",
      icono: "👨",
      grupos: [
        { id: "Azul", nombre: "Grupo Azul", icono: "🔵", borde: "border-blue-500", texto: "text-blue-700" },
        { id: "Rojo", nombre: "Grupo Rojo", icono: "🔴", borde: "border-red-500", texto: "text-red-700" },
        { id: "Verde", nombre: "Grupo Verde", icono: "🟢", borde: "border-green-500", texto: "text-green-700" },
        { id: "Naranja", nombre: "Grupo Naranja", icono: "🟠", borde: "border-orange-500", texto: "text-orange-700" }
      ]
    },

    mujeres: {
      id: "mujeres",
      titulo: "Encuentro de Mujeres",
      icono: "👩",
      grupos: [
        { id: "Rosa", nombre: "Grupo Rosa", icono: "🌸", borde: "border-pink-500", texto: "text-pink-700" },
        { id: "Rojo", nombre: "Grupo Rojo", icono: "🔴", borde: "border-red-500", texto: "text-red-700" },
        { id: "Amarillo", nombre: "Grupo Amarillo", icono: "🟡", borde: "border-yellow-500", texto: "text-yellow-700" },
        { id: "Lila", nombre: "Grupo Lila", icono: "🟣", borde: "border-purple-500", texto: "text-purple-700" }
      ]
    }
  },

  areas: [
    { id: "emocionales", nombre: "Problemas Emocionales (Raíces)", columna: "1. problemas emocionales", icono: "🧠", color: "blue" },
    { id: "mentales", nombre: "Problemas Mentales", columna: "2. problemas mentales", icono: "🧩", color: "indigo" },
    { id: "lengua", nombre: "Problemas de la Lengua, el Habla", columna: "3. problemas de la lengua", icono: "👄", color: "cyan" },
    { id: "sexuales", nombre: "Problemas Sexuales", columna: "4. problemas sexuales", icono: "⚠️", color: "rose" },
    { id: "enfermedades", nombre: "Problemas de Enfermedades Físicas", columna: "5. problemas de enfermedades", icono: "🩺", color: "emerald" },
    { id: "adicciones", nombre: "Problemas de Adicción", columna: "6. problemas de adiccion", icono: "⛓️", color: "orange" },
    { id: "ocultismos", nombre: "Ocultismos", columna: "7. ocultismos", icono: "🔮", color: "red" },
    { id: "sectas", nombre: "Grupos Doctrinales o Sectas", columna: "8. grupos doctrinales", icono: "📖", color: "slate" }
  ]
};

function obtenerConfigEncuentro(tipo) {
  return CONFIG_CLINICA.encuentros[tipo] || CONFIG_CLINICA.encuentros.hombres;
}

