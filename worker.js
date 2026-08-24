export default {

  async fetch(request, env) {

    const url = new URL(request.url);

    // =====================================================
    // YOUTARS API
    // FASE 2: DETECTOR AUTOMÁTICO
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
        // 1. LOCALIZAR EL CANAL POR SU HANDLE OFICIAL
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
        // 2. OBTENER LOS ÚLTIMOS 10 VIDEOS SUBIDOS
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
        // 3. CONSULTAR DATOS COMPLETOS DE ESOS VIDEOS
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
        // 4. CONVERTIR DURACIÓN ISO 8601 A SEGUNDOS
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
        // 5. FILTRAR CANDIDATOS A PRÉDICA
        // =================================================
        const candidatos =
          (datosVideos.items || [])

            .filter(video => {

              const titulo =
                video.snippet?.title || "";

              const duracion =
                duracionEnSegundos(
                  video.contentDetails?.duration
                );

              // Una prédica debe tener una duración
              // razonable. Por ahora usamos 20 minutos.
              if (duracion < 1200) {
                return false;
              }

              // Nuestro formato habitual contiene:
              // TITULO | PREDICADOR | IGLESIA
              const partes =
                titulo.split("|");

              if (partes.length < 2) {
                return false;
              }

              return true;

            })

            .sort((a, b) => {

              const fechaA =
                new Date(
                  a.snippet?.publishedAt || 0
                );

              const fechaB =
                new Date(
                  b.snippet?.publishedAt || 0
                );

              return fechaB - fechaA;

            });


        if (!candidatos.length) {

          return Response.json(
            {
              ok: false,
              sistema: "YouTARS",
              estado: "SIN_CANDIDATOS",
              mensaje:
                "No se encontró una prédica válida entre los videos recientes"
            }
          );
        }


        // =================================================
        // 6. ELEGIR LA PRÉDICA MÁS RECIENTE
        // =================================================
        const ultimaPredica =
          candidatos[0];

        const tituloYoutube =
          ultimaPredica.snippet?.title || "";

        const partes =
          tituloYoutube
            .split("|")
            .map(parte => parte.trim());


        const titulo =
          partes[0] || tituloYoutube;

        const predicador =
          partes[1] || "";


        // =================================================
        // 7. RESPUESTA DE YOUTARS
        // =================================================
        return Response.json({

          ok: true,

          sistema: "YouTARS",

          estado: "DETECTANDO_AUTOMATICAMENTE",

          canal: {
            nombre:
              canal.snippet?.title || "",

            channelId,

            uploadsPlaylistId
          },

          analisis: {
            videosRevisados:
              datosVideos.items?.length || 0,

            candidatosEncontrados:
              candidatos.length
          },

          ultimaPredica: {

            videoId:
              ultimaPredica.id,

            tituloYoutube,

            titulo,

            predicador,

            publicado:
              ultimaPredica.snippet
                ?.publishedAt || "",

            duracionISO:
              ultimaPredica.contentDetails
                ?.duration || "",

            miniatura:
              ultimaPredica.snippet
                ?.thumbnails
                ?.high
                ?.url || "",

            enlace:
              `https://www.youtube.com/watch?v=${ultimaPredica.id}`

          }

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
