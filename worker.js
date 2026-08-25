// =====================================================
// YOUTARS — PRODUCCIÓN
// Iglesia La RED
// =====================================================

const FIREBASE_PROJECT_ID = "iglesia-la-red";
const YOUTUBE_HANDLE = "iglesialaredsv";


// =====================================================
// AUTENTICAR YOUTARS EN FIREBASE
// =====================================================
async function autenticarYouTARS(env) {

  const FIREBASE_API_KEY = env.FIREBASE_API_KEY;
  const email = env.YOUTARS_EMAIL;
  const password = env.YOUTARS_PASSWORD;

  if (!FIREBASE_API_KEY || !email || !password) {
    throw new Error(
      "Faltan credenciales de Firebase en Cloudflare"
    );
  }

  const authUrl =
    "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword" +
    `?key=${FIREBASE_API_KEY}`;

  const respuesta = await fetch(authUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email,
      password,
      returnSecureToken: true
    })
  });

  const datos = await respuesta.json();

  if (!respuesta.ok || !datos.idToken) {
    throw new Error(
      datos?.error?.message ||
      "Firebase Authentication rechazó el acceso"
    );
  }

  return {
    idToken: datos.idToken,
    email: datos.email || email,
    localId: datos.localId || "",
    expiresIn: datos.expiresIn || ""
  };
}


// =====================================================
// DURACIÓN ISO 8601 → SEGUNDOS
// =====================================================
function duracionEnSegundos(iso) {

  const match =
    /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/
      .exec(iso || "");

  if (!match) return 0;

  const horas = Number(match[1] || 0);
  const minutos = Number(match[2] || 0);
  const segundos = Number(match[3] || 0);

  return (
    horas * 3600 +
    minutos * 60 +
    segundos
  );
}


// =====================================================
// FORMATEAR DURACIÓN
// =====================================================
function formatearDuracion(segundosTotales) {

  const horas =
    Math.floor(segundosTotales / 3600);

  const minutos =
    Math.floor((segundosTotales % 3600) / 60);

  const segundos =
    segundosTotales % 60;

  return [
    horas,
    minutos.toString().padStart(2, "0"),
    segundos.toString().padStart(2, "0")
  ].join(":");
}


// =====================================================
// FORMATEAR FECHA PARA LA WEB
// =====================================================
function formatearFechaPredica(fechaISO) {

  const fecha = new Date(fechaISO);

  if (isNaN(fecha.getTime())) {
    return "";
  }

  const texto =
    new Intl.DateTimeFormat(
      "es-SV",
      {
        timeZone: "America/El_Salvador",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
      }
    ).format(fecha);

  // Ej:
  // domingo, 24 de agosto de 2026
  //
  // Lo dejamos:
  // Domingo 24 de agosto de 2026

  const limpio =
    texto.replace(",", "");

  return (
    limpio.charAt(0).toUpperCase() +
    limpio.slice(1)
  );
}


// =====================================================
// DETECTAR ÚLTIMA PRÉDICA EN YOUTUBE
// =====================================================
async function detectarUltimaPredica(env) {

  const API_KEY = env.YOUTUBE_API_KEY;

  if (!API_KEY) {
    throw new Error(
      "YOUTUBE_API_KEY no está configurada"
    );
  }


  // ===================================================
  // 1. LOCALIZAR CANAL
  // ===================================================
  const canalUrl =
    "https://www.googleapis.com/youtube/v3/channels" +
    "?part=snippet,contentDetails" +
    `&forHandle=${YOUTUBE_HANDLE}` +
    `&key=${API_KEY}`;

  const respuestaCanal =
    await fetch(canalUrl);

  const datosCanal =
    await respuestaCanal.json();

  if (!respuestaCanal.ok) {
    throw new Error(
      datosCanal?.error?.message ||
      "No fue posible consultar el canal"
    );
  }

  if (!datosCanal.items?.length) {
    throw new Error(
      `No se encontró el canal @${YOUTUBE_HANDLE}`
    );
  }


  const canal =
    datosCanal.items[0];

  const uploadsPlaylistId =
    canal
      .contentDetails
      ?.relatedPlaylists
      ?.uploads;

  if (!uploadsPlaylistId) {
    throw new Error(
      "No se encontró la playlist de uploads"
    );
  }


  // ===================================================
  // 2. ÚLTIMOS 10 VIDEOS
  // ===================================================
  const playlistUrl =
    "https://www.googleapis.com/youtube/v3/playlistItems" +
    "?part=snippet,contentDetails" +
    `&playlistId=${uploadsPlaylistId}` +
    "&maxResults=10" +
    `&key=${API_KEY}`;

  const respuestaPlaylist =
    await fetch(playlistUrl);

  const datosPlaylist =
    await respuestaPlaylist.json();

  if (!respuestaPlaylist.ok) {
    throw new Error(
      datosPlaylist?.error?.message ||
      "No fue posible leer la playlist"
    );
  }


  const ids =
    (datosPlaylist.items || [])
      .map(
        item =>
          item.contentDetails?.videoId
      )
      .filter(Boolean);

  if (!ids.length) {
    throw new Error(
      "No se encontraron videos recientes"
    );
  }


  // ===================================================
  // 3. DATOS COMPLETOS
  // ===================================================
  const videosUrl =
    "https://www.googleapis.com/youtube/v3/videos" +
    "?part=snippet,contentDetails,liveStreamingDetails" +
    `&id=${ids.join(",")}` +
    `&key=${API_KEY}`;

  const respuestaVideos =
    await fetch(videosUrl);

  const datosVideos =
    await respuestaVideos.json();

  if (!respuestaVideos.ok) {
    throw new Error(
      datosVideos?.error?.message ||
      "No fue posible analizar los videos"
    );
  }


  // ===================================================
  // 4. ANALIZAR CANDIDATOS
  // ===================================================
  const diagnostico =
    (datosVideos.items || [])

      .map(video => {

        const tituloYoutube =
          video.snippet?.title || "";

        const partes =
          tituloYoutube
            .split("|")
            .map(
              parte =>
                parte.trim()
            );

        const duracionISO =
          video.contentDetails?.duration || "";

        const duracionSegundos =
          duracionEnSegundos(
            duracionISO
          );

        const firma =
          (partes[2] || "")
            .toLowerCase()
            .normalize("NFD")
            .replace(
              /[\u0300-\u036f]/g,
              ""
            )
            .trim();

        const tituloNormalizado =
          tituloYoutube.toLowerCase();

        const estadoLive =
          video.snippet
            ?.liveBroadcastContent || "none";

        const razones = [];

        let aceptado = true;


        // ---------------------------------------------
        // REGLA 1 — ESTRUCTURA
        // ---------------------------------------------
        if (partes.length < 3) {

          aceptado = false;

          razones.push(
            "Estructura incompleta"
          );

        } else {

          razones.push(
            "Estructura válida"
          );

        }


        // ---------------------------------------------
        // REGLA 2 — PREDICADOR
        // ---------------------------------------------
        const predicador =
          partes[1] || "";

        if (!predicador.trim()) {

          aceptado = false;

          razones.push(
            "Predicador no identificado"
          );

        } else {

          razones.push(
            `Predicador: ${predicador}`
          );

        }


        // ---------------------------------------------
        // REGLA 3 — FIRMA IGLESIA
        // ---------------------------------------------
        if (
          !firma.includes(
            "iglesia la red"
          )
        ) {

          aceptado = false;

          razones.push(
            "Firma Iglesia La Red ausente"
          );

        } else {

          razones.push(
            "Firma Iglesia La Red válida"
          );

        }


        // ---------------------------------------------
        // REGLA 4 — SHORTS
        // ---------------------------------------------
        if (
          tituloNormalizado.includes("#shorts") ||
          tituloNormalizado.includes("#short")
        ) {

          aceptado = false;

          razones.push(
            "Contenido marcado como Short"
          );

        }


        // ---------------------------------------------
        // REGLA 5 — LIVE ACTUAL / PROGRAMADO
        // ---------------------------------------------
        if (
          estadoLive === "live" ||
          estadoLive === "upcoming"
        ) {

          aceptado = false;

          razones.push(
            "Transmisión todavía activa o programada"
          );

        }


        // ---------------------------------------------
        // REGLA 6 — DURACIÓN
        // ---------------------------------------------
        if (duracionSegundos === 0) {

          // Puede ser un Live ya finalizado
          // todavía en procesamiento.

          razones.push(
            "Duración pendiente de procesamiento"
          );

        } else if (
          duracionSegundos < 1200
        ) {

          aceptado = false;

          razones.push(
            "Duración menor a 20 minutos"
          );

        } else {

          razones.push(
            "Duración compatible con prédica"
          );

        }


        return {

          videoId:
            video.id,

          tituloYoutube,

          titulo:
            partes[0] ||
            tituloYoutube,

          predicador,

          firma:
            partes[2] || "",

          publicado:
            video.snippet
              ?.publishedAt || "",

          fecha:
            formatearFechaPredica(
              video.snippet
                ?.publishedAt || ""
            ),

          duracionISO,

          duracion:
            formatearDuracion(
              duracionSegundos
            ),

          duracionSegundos,

          estadoLive,

          esLive:
            Boolean(
              video.liveStreamingDetails
            ),

          miniatura:
            video.snippet
              ?.thumbnails
              ?.high
              ?.url || "",

          enlace:
            `https://www.youtube.com/watch?v=${video.id}`,

          aceptado,

          razones

        };

      })

      .sort(
        (a, b) =>
          new Date(b.publicado) -
          new Date(a.publicado)
      );


  const candidatos =
    diagnostico.filter(
      video =>
        video.aceptado
    );


  if (!candidatos.length) {
    throw new Error(
      "No se encontró una prédica válida"
    );
  }


  return {

    canal: {
      nombre:
        canal.snippet?.title || "",
      channelId:
        canal.id,
      uploadsPlaylistId
    },

    diagnostico,

    candidatos,

    ultimaPredica:
      candidatos[0]

  };

}


// =====================================================
// LEER ÚLTIMA PRÉDICA ACTUAL DE FIRESTORE
// =====================================================
async function leerUltimaPredicaFirestore() {

  const url =
    `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}` +
    "/databases/(default)/documents/contenido/ultimaPredica";

  const respuesta =
    await fetch(url);

  if (respuesta.status === 404) {
    return null;
  }

  const datos =
    await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(
      datos?.error?.message ||
      "No fue posible leer ultimaPredica"
    );
  }

  return {
    videoId:
      datos.fields
        ?.videoId
        ?.stringValue || "",

    titulo:
      datos.fields
        ?.titulo
        ?.stringValue || "",

    predicador:
      datos.fields
        ?.predicador
        ?.stringValue || "",

    fecha:
      datos.fields
        ?.fecha
        ?.stringValue || ""
  };

}


// =====================================================
// ACTUALIZAR FIRESTORE
// =====================================================
async function guardarUltimaPredica(
  env,
  predica
) {

  const auth =
    await autenticarYouTARS(env);


  const baseUrl =
    `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}` +
    "/databases/(default)/documents/contenido/ultimaPredica";


  const url =
    new URL(baseUrl);


  [
    "titulo",
    "predicador",
    "fecha",
    "videoId",
    "activo",
    "actualizado"
  ].forEach(
    campo =>
      url.searchParams.append(
        "updateMask.fieldPaths",
        campo
      )
  );


  const documento = {

    fields: {

      titulo: {
        stringValue:
          predica.titulo
      },

      predicador: {
        stringValue:
          predica.predicador
      },

      fecha: {
        stringValue:
          predica.fecha
      },

      videoId: {
        stringValue:
          predica.videoId
      },

      activo: {
        booleanValue:
          true
      },

      actualizado: {
        timestampValue:
          new Date().toISOString()
      }

    }

  };


  const respuesta =
    await fetch(
      url.toString(),
      {

        method: "PATCH",

        headers: {

          "Content-Type":
            "application/json",

          "Authorization":
            `Bearer ${auth.idToken}`

        },

        body:
          JSON.stringify(
            documento
          )

      }
    );


  const datos =
    await respuesta.json();


  if (!respuesta.ok) {
    throw new Error(
      datos?.error?.message ||
      "Firestore rechazó la actualización"
    );
  }


  return true;

}


// =====================================================
// SINCRONIZACIÓN REAL
// =====================================================
async function sincronizarUltimaPredica(env) {

  const deteccion =
    await detectarUltimaPredica(env);


  const nueva =
    deteccion.ultimaPredica;


  const actual =
    await leerUltimaPredicaFirestore();


  // ===================================================
  // MISMO VIDEO → NO HACER NADA
  // ===================================================
  if (
    actual &&
    actual.videoId === nueva.videoId
  ) {

    return {

      ok: true,

      sistema:
        "YouTARS",

      estado:
        "SIN_CAMBIOS",

      mensaje:
        "La última prédica ya está actualizada.",

      ultimaPredica:
        nueva,

      firestoreActual:
        actual

    };

  }


  // ===================================================
  // VIDEO NUEVO → ACTUALIZAR
  // ===================================================
  await guardarUltimaPredica(
    env,
    nueva
  );


  return {

    ok: true,

    sistema:
      "YouTARS",

    estado:
      "ACTUALIZADO",

    mensaje:
      "Nueva prédica guardada en Firestore.",

    anterior:
      actual,

    nueva

  };

}


// =====================================================
// WORKER PRINCIPAL
// =====================================================
export default {

  async fetch(request, env) {

    const url =
      new URL(request.url);


    // =================================================
    // TEST AUTENTICACIÓN
    // =================================================
    if (
      url.pathname ===
      "/api/youtars-auth"
    ) {

      try {

        const auth =
          await autenticarYouTARS(env);

        return Response.json({

          ok: true,

          sistema:
            "YouTARS",

          estado:
            "AUTENTICADO",

          usuario: {
            email:
              auth.email,
            localId:
              auth.localId
          },

          tokenRecibido:
            true,

          expiresIn:
            auth.expiresIn

        });

      } catch (error) {

        return Response.json(
          {

            ok: false,

            sistema:
              "YouTARS",

            estado:
              "ERROR_AUTH",

            error:
              error.message

          },
          {
            status: 500
          }
        );

      }

    }


    // =================================================
    // DIAGNÓSTICO YOUTUBE
    // NO ESCRIBE FIRESTORE
    // =================================================
    if (
      url.pathname ===
      "/api/youtars"
    ) {

      try {

        const deteccion =
          await detectarUltimaPredica(env);

        return Response.json({

          ok: true,

          sistema:
            "YouTARS",

          estado:
            "MODO_DIAGNOSTICO",

          canal:
            deteccion.canal,

          resumen: {

            videosRevisados:
              deteccion
                .diagnostico
                .length,

            aceptados:
              deteccion
                .candidatos
                .length,

            rechazados:
              deteccion
                .diagnostico
                .length -
              deteccion
                .candidatos
                .length

          },

          ultimaPredicaActual:
            deteccion
              .ultimaPredica,

          diagnostico:
            deteccion
              .diagnostico

        });

      } catch (error) {

        return Response.json(
          {

            ok: false,

            sistema:
              "YouTARS",

            estado:
              "ERROR",

            error:
              error.message

          },
          {
            status: 500
          }
        );

      }

    }


    // =================================================
    // SINCRONIZACIÓN REAL
    // =================================================
    if (
      url.pathname ===
      "/api/youtars-sync"
    ) {

      try {

        const resultado =
          await sincronizarUltimaPredica(
            env
          );

        return Response.json(
          resultado
        );

      } catch (error) {

        console.error(
          "Error sincronizando YouTARS:",
          error
        );

        return Response.json(
          {

            ok: false,

            sistema:
              "YouTARS",

            estado:
              "ERROR_SYNC",

            error:
              error.message

          },
          {
            status: 500
          }
        );

      }

    }


    // =================================================
    // SITIO WEB NORMAL
    // =================================================
    return env.ASSETS.fetch(
      request
    );

  },


  // ===================================================
  // EJECUCIÓN PROGRAMADA
  // ===================================================
  async scheduled(
    event,
    env,
    ctx
  ) {

    ctx.waitUntil(

      sincronizarUltimaPredica(
        env
      )

    );

  }

};
