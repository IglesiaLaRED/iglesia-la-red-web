export default {

  async fetch(request, env) {

    const url = new URL(request.url);

    // =====================================================
    // YOUTARS API
    // FASE 2.5: DIAGNÓSTICO DE CANDIDATOS
    // =====================================================
    if (url.pathname === "/api/youtars") {

      try {

        const API_KEY = env.YOUTUBE_API_KEY;

        if (!API_KEY) {
          return Response.json(
            {
              ok: false,
              sistema: "YouTARS",
              error: "YOUTUBE_API_KEY no está configurada"
            },
            { status: 500 }
          );
        }


        // =================================================
        // 1. LOCALIZAR EL CANAL OFICIAL
        // =================================================
        const canalUrl =
          "https://www.googleapis.com/youtube/v3/channels" +
          "?part=snippet,contentDetails" +
          "&forHandle=iglesialaredsv" +
          `&key=${API_KEY}`;

        const respuestaCanal = await fetch(canalUrl);
        const datosCanal = await respuestaCanal.json();

        if (!respuestaCanal.ok) {
          return Response.json(
            {
              ok: false,
              sistema: "YouTARS",
              paso: "buscar_canal",
              error:
                datosCanal?.error?.message ||
                "No fue posible consultar el canal"
            },
            { status: respuestaCanal.status }
          );
        }


        if (!datosCanal.items?.length) {
          return Response.json(
            {
              ok: false,
              sistema: "YouTARS",
              paso: "buscar_canal",
              error: "No se encontró el canal @iglesialaredsv"
            },
            { status: 404 }
          );
        }


        const canal = datosCanal.items[0];

        const channelId = canal.id;

        const uploadsPlaylistId =
          canal.contentDetails
            ?.relatedPlaylists
            ?.uploads;


        if (!uploadsPlaylistId) {
          return Response.json(
            {
              ok: false,
              sistema: "YouTARS",
              paso: "obtener_playlist",
              error:
                "No se encontró la playlist de uploads del canal"
            },
            { status: 404 }
          );
        }


        // =================================================
        // 2. OBTENER LOS ÚLTIMOS 10 VIDEOS
        // =================================================
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
          return Response.json(
            {
              ok: false,
              sistema: "YouTARS",
              paso: "leer_playlist",
              error:
                datosPlaylist?.error?.message ||
                "No fue posible leer los videos del canal"
            },
            { status: respuestaPlaylist.status }
          );
        }


        const ids = (datosPlaylist.items || [])
          .map(item => item.contentDetails?.videoId)
          .filter(Boolean);


        if (!ids.length) {
          return Response.json(
            {
              ok: false,
              sistema: "YouTARS",
              paso: "leer_playlist",
              error: "No se encontraron videos recientes"
            },
            { status: 404 }
          );
        }


        // =================================================
        // 3. CONSULTAR DATOS COMPLETOS DE LOS VIDEOS
        // =================================================
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
          return Response.json(
            {
              ok: false,
              sistema: "YouTARS",
              paso: "analizar_videos",
              error:
                datosVideos?.error?.message ||
                "No fue posible analizar los videos"
            },
            { status: respuestaVideos.status }
          );
        }


        // =================================================
        // 4. DURACIÓN ISO 8601 → SEGUNDOS
        // =================================================
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


        // =================================================
        // 5. FORMATEAR DURACIÓN
        // =================================================
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


        // =================================================
// 6. ANALIZAR CADA VIDEO
//    BLINDAJE YOUTARS v1.0
// =================================================
const diagnostico =
  (datosVideos.items || [])

    .map(video => {

      const titulo =
        video.snippet?.title || "";

      const duracionISO =
        video.contentDetails?.duration || "";

      const duracionSegundos =
        duracionEnSegundos(duracionISO);

      const partes =
        titulo
          .split("|")
          .map(parte => parte.trim());

      const razones = [];

      let aceptado = true;


      // =============================================
      // REGLA 1
      // ESTRUCTURA EDITORIAL
      //
      // Título | Predicador | Iglesia La Red
      // =============================================
      if (partes.length < 3) {

        aceptado = false;

        razones.push(
          "Estructura incompleta"
        );

      } else {

        razones.push(
          "Estructura de prédica válida"
        );

      }


      // =============================================
      // REGLA 2
      // DEBE EXISTIR PREDICADOR
      // =============================================
      const predicador =
        partes[1] || "";

      if (!predicador.trim()) {

        aceptado = false;

        razones.push(
          "Predicador no identificado"
        );

      } else {

        razones.push(
          `Predicador detectado: ${predicador}`
        );

      }


      // =============================================
      // REGLA 3
      // TERCERA PARTE DEBE IDENTIFICAR LA IGLESIA
      // =============================================
      const firma =
        (partes[2] || "")
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .trim();

      const firmaValida =
        firma.includes("iglesia la red");

      if (!firmaValida) {

        aceptado = false;

        razones.push(
          "No contiene firma Iglesia La Red"
        );

      } else {

        razones.push(
          "Firma Iglesia La Red válida"
        );

      }


      // =============================================
      // REGLA 4
      // DURACIÓN
      //
      // Si YouTube ya informa duración:
      // mínimo 20 minutos.
      //
      // Si todavía informa 0:
      // NO rechazamos automáticamente porque
      // puede ser un Live recién terminado.
      // =============================================
      if (duracionSegundos === 0) {

        razones.push(
          "Duración pendiente / posible Live reciente"
        );

      } else if (duracionSegundos < 1200) {

        aceptado = false;

        razones.push(
          "Duración menor a 20 minutos"
        );

      } else {

        razones.push(
          "Duración compatible con prédica"
        );

      }


      // =============================================
      // REGLA 5
      // DESCARTAR SHORTS POR TÍTULO
      // =============================================
      const tituloNormalizado =
        titulo.toLowerCase();

      if (
        tituloNormalizado.includes("#shorts") ||
        tituloNormalizado.includes("#short")
      ) {

        aceptado = false;

        razones.push(
          "Contenido marcado como Short"
        );

      }


      // =============================================
      // RESULTADO
      // =============================================
      return {

        videoId:
          video.id,

        tituloYoutube:
          titulo,

        tituloDetectado:
          partes[0] || titulo,

        predicadorDetectado:
          predicador,

        firmaDetectada:
          partes[2] || "",

        publicado:
          video.snippet?.publishedAt || "",

        duracionISO,

        duracion:
          formatearDuracion(
            duracionSegundos
          ),

        duracionSegundos,

        esLive:
          Boolean(
            video.liveStreamingDetails
          ),

        aceptado,

        razones

      };

    })

    .sort((a, b) => {

      return (
        new Date(b.publicado) -
        new Date(a.publicado)
      );

    });

        // =================================================
        // 7. CANDIDATOS ACEPTADOS
        // =================================================
        const candidatos =
          diagnostico.filter(
            video => video.aceptado
          );


        // =================================================
        // 8. ÚLTIMA PRÉDICA SEGÚN LAS REGLAS ACTUALES
        // =================================================
        const ultimaPredica =
          candidatos.length
            ? candidatos[0]
            : null;


        // =================================================
        // 9. RESPUESTA DE DIAGNÓSTICO
        // =================================================
        return Response.json({

          ok: true,

          sistema: "YouTARS",

          estado: "MODO_DIAGNOSTICO",

          canal: {

            nombre:
              canal.snippet?.title || "",

            channelId,

            uploadsPlaylistId

          },

          resumen: {

            videosRevisados:
              diagnostico.length,

            aceptados:
              candidatos.length,

            rechazados:
              diagnostico.length -
              candidatos.length

          },

          ultimaPredicaActual:
            ultimaPredica,

          diagnostico

        });


      } catch (error) {

        console.error(
          "Error YouTARS:",
          error
        );

        return Response.json(
          {
            ok: false,
            sistema: "YouTARS",
            error: "Error interno",
            detalle: error.message
          },
          { status: 500 }
        );

      }

    }


    // =====================================================
    // SITIO WEB NORMAL
    // =====================================================
    return env.ASSETS.fetch(request);

  }

};
