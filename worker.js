export default {

  async fetch(request, env) {

    const url = new URL(request.url);

    // =====================================================
    // YOUTARS API
    // =====================================================
    if (url.pathname === "/api/youtars") {

      try {

        // Video oficial de prueba:
        // "Encontrando mi propósito" | Ps. Roberto Aguilar
        const videoId = "ePx-AWS4sIA";

        // -------------------------------------------------
        // CONSULTAR YOUTUBE DATA API
        // -------------------------------------------------
        const youtubeUrl =
          `https://www.googleapis.com/youtube/v3/videos` +
          `?part=snippet,contentDetails` +
          `&id=${videoId}` +
          `&key=${env.YOUTUBE_API_KEY}`;

        const respuesta = await fetch(youtubeUrl);

        const datos = await respuesta.json();


        // -------------------------------------------------
        // ERROR DE YOUTUBE
        // -------------------------------------------------
        if (!respuesta.ok) {

          return Response.json(
            {
              ok: false,
              sistema: "YouTARS",
              error: "YouTube API respondió con error",
              detalle: datos?.error?.message || "Error desconocido"
            },
            {
              status: respuesta.status
            }
          );

        }


        // -------------------------------------------------
        // VIDEO NO ENCONTRADO
        // -------------------------------------------------
        if (!datos.items || datos.items.length === 0) {

          return Response.json(
            {
              ok: false,
              sistema: "YouTARS",
              error: "Video no encontrado"
            },
            {
              status: 404
            }
          );

        }


        const video = datos.items[0];

        const tituloYoutube =
          video.snippet?.title || "";

        const partes =
          tituloYoutube
            .split("|")
            .map(parte => parte.trim());


        // -------------------------------------------------
        // SEPARAR TÍTULO Y PREDICADOR
        // -------------------------------------------------
        const titulo =
          partes[0] || tituloYoutube;

        const predicador =
          partes[1] || "";


        // -------------------------------------------------
        // RESPUESTA DE YOUTARS
        // -------------------------------------------------
        return Response.json({

          ok: true,

          sistema: "YouTARS",

          estado: "TRABAJANDO",

          video: {

            videoId,

            tituloYoutube,

            titulo,

            predicador,

            canal:
              video.snippet?.channelTitle || "",

            publicado:
              video.snippet?.publishedAt || "",

            duracionISO:
              video.contentDetails?.duration || "",

            miniatura:
              video.snippet?.thumbnails?.high?.url || ""

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
          {
            status: 500
          }
        );

      }

    }


    // =====================================================
    // SITIO WEB NORMAL
    // =====================================================
    return env.ASSETS.fetch(request);

  }

};
