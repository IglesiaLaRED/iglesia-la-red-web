function crearAnalisis(datos){

    return{

        totalClinicas: datos.length,

        grupos:{
            Azul:0,
            Rojo:0,
            Verde:0,
            Naranja:0
        },

        areas:{},

        alertas:{}

    };

}


function analizarClinicas(datos){

    const ANALISIS = crearAnalisis(datos);

    contarGrupos(datos, ANALISIS);

    analizarAreas(datos, ANALISIS);

    contarIncidenciasAreas(datos, ANALISIS);

    calcularPorcentajes(ANALISIS);

    detectarPrincipales(ANALISIS);

    return ANALISIS;

}
    
function contarGrupos(datos, ANALISIS){

    datos.forEach(clinica=>{

        if(ANALISIS.grupos[clinica.grupo]!==undefined){

            ANALISIS.grupos[clinica.grupo]++;

        }

    });

}
function analizarAreas(datos, ANALISIS){

    CONFIG_CLINICA.areas.forEach(area=>{

        ANALISIS.areas[area.id]={

            nombre:area.nombre,

            icono:area.icono,

            color:area.color,

            total:0,

            porcentaje:0,

            principal:"",

            incidencias:{}

        };

    });

}

function contarIncidenciasAreas(datos, ANALISIS) {
  datos.forEach(clinica => {
    Object.entries(clinica.respuestas).forEach(([pregunta, respuesta]) => {
      if (!respuestaMarcada(respuesta)) return;

      const preguntaLimpia = limpiarTexto(pregunta);

      CONFIG_CLINICA.areas.forEach(area => {
        area.preguntas.forEach(palabra => {
          if (preguntaLimpia.includes(limpiarTexto(palabra))) {
            ANALISIS.areas[area.id].total++;

            ANALISIS.areas[area.id].incidencias[pregunta] =
              (ANALISIS.areas[area.id].incidencias[pregunta] || 0) + 1;
          }
        });
      });
    });
  });
}

function calcularPorcentajes(ANALISIS){

    Object.values(ANALISIS.areas).forEach(area=>{

        area.porcentaje=Math.round(

            (area.total/ANALISIS.totalClinicas)*100

        );

    });

}

function detectarPrincipales(ANALISIS){

    Object.values(ANALISIS.areas).forEach(area=>{

        let mayor = 0;
        let principal = "";

        Object.entries(area.incidencias).forEach(([pregunta,total])=>{

            if(total > mayor){
                mayor = total;
                principal = pregunta;
            }

        });

        area.principal = principal;

    });

}
