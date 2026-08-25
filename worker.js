export default {

  async fetch(request, env) {

    const url = new URL(request.url);


    // =====================================================
    // CONFIGURACIÓN
    // =====================================================

    const FIREBASE_PROJECT_ID = "iglesia-la-red";


    // =====================================================
    // FUNCIÓN: AUTENTICAR A YOUTARS EN FIREBASE
    // =====================================================

    async function autenticarYouTARS() {

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
    // YOUTARS AUTH TEST
    // =====================================================

    if (url.pathname === "/api/youtars-auth") {

      try {

        const auth = await autenticarYouTARS();


        return Response.json({

          ok: true,

          sistema: "YouTARS",

          estado: "AUTENTICADO",

          usuario: {
            email: auth.email,
            localId: auth.localId
          },

          tokenRecibido: Boolean(auth.idToken),

          expiresIn: auth.expiresIn

        });


      } catch (error) {

        console.error(
          "Error autenticando YouTARS:",
          error
        );


        return Response.json(
          {
            ok: false,
            sistema: "YouTARS",
            paso: "autenticacion",
            error: error.message
          },
          {
            status: 500
          }
        );

      }

    }


    // =====================================================
    // YOUTARS FIRESTORE TEST A
    //
    // PRUEBA NEGATIVA:
    // intenta escribir en contenido/youtarsPrueba
    //
    // RESULTADO ESPERADO:
    // Firestore debe responder 403
    // =====================================================

    if (url.pathname === "/api/youtars-firestore-test") {

      try {

        const auth = await autenticarYouTARS();


        const firestoreUrl =
          `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}` +
          "/databases/(default)/documents/contenido/youtarsPrueba";


        const documentoPrueba = {

          fields: {

            sistema: {
              stringValue: "YouTARS"
            },

            estado: {
              stringValue: "PRUEBA_FIRESTORE_OK"
            },

            usuario: {
              stringValue: auth.email
            },

            mensaje: {
              stringValue:
                "Prueba controlada de escritura de YouTARS"
            },

            fechaPrueba: {
              timestampValue:
                new Date().toISOString()
            }

          }

        };


        const respuestaFirestore =
          await fetch(
            firestoreUrl,
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
                  documentoPrueba
                )

            }
          );


        const datosFirestore =
          await respuestaFirestore.json();


        if (!respuestaFirestore.ok) {

          return Response.json(
            {

              ok: false,

              sistema: "YouTARS",

              paso: "firestore",

              autenticado: true,

              escritura: false,

              statusFirestore:
                respuestaFirestore.status,

              error:
                datosFirestore
                  ?.error
                  ?.message ||
                "Firestore rechazó la escritura"

            },
            {
              status:
                respuestaFirestore.status
            }
          );

        }


        return Response.json({

          ok: true,

          sistema: "YouTARS",

          estado:
            "PRUEBA_FIRESTORE_EXITOSA",

          autenticado: true,

          escritura: true,

          documento:
            "contenido/youtarsPrueba",

          usuario:
            auth.email

        });


      } catch (error) {

        console.error(
          "Error prueba A Firestore YouTARS:",
          error
        );


        return Response.json(
          {

            ok: false,

            sistema: "YouTARS",

            paso:
              "firestore_test_a",

            error:
              error.message

          },
          {
            status: 500
          }
        );

      }

    }


    // =====================================================
    // YOUTARS FIRESTORE TEST B
    //
    // PRUEBA POSITIVA:
    // escribe temporalmente en
    // contenido/ultimaPredica
    //
    // luego elimina el campo de prueba
    // =====================================================

    if (url.pathname === "/api/youtars-firestore-test-b") {

      try {

        const auth =
          await autenticarYouTARS();


        const baseUrl =
          `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}` +
          "/databases/(default)/documents/contenido/ultimaPredica";


        // -------------------------------------------------
        // AGREGAR CAMPO TEMPORAL
        // -------------------------------------------------

        const pruebaValor =
          `YouTARS_OK_${Date.now()}`;


        const urlAgregar =
          baseUrl +
          "?updateMask.fieldPaths=youtarsPrueba";


        const respuestaAgregar =
          await fetch(
            urlAgregar,
            {

              method: "PATCH",

              headers: {

                "Content-Type":
                  "application/json",

                "Authorization":
                  `Bearer ${auth.idToken}`

              },

              body: JSON.stringify({

                fields: {

                  youtarsPrueba: {
                    stringValue:
                      pruebaValor
                  }

                }

              })

            }
          );


        const datosAgregar =
          await respuestaAgregar.json();


        if (!respuestaAgregar.ok) {

          return Response.json(
            {

              ok: false,

              sistema:
                "YouTARS",

              paso:
                "escritura_positiva",

              autenticado:
                true,

              escritura:
                false,

              statusFirestore:
                respuestaAgregar.status,

              error:
                datosAgregar
                  ?.error
                  ?.message ||
                "Firestore rechazó la escritura en ultimaPredica"

            },
            {
              status:
                respuestaAgregar.status
            }
          );

        }


        // -------------------------------------------------
        // ELIMINAR CAMPO TEMPORAL
        // -------------------------------------------------

        const urlBorrar =
          baseUrl +
          "?updateMask.fieldPaths=youtarsPrueba";


        const respuestaBorrar =
          await fetch(
            urlBorrar,
            {

              method: "PATCH",

              headers: {

                "Content-Type":
                  "application/json",

                "Authorization":
                  `Bearer ${auth.idToken}`

              },

              body:
                JSON.stringify({
                  fields: {}
                })

            }
          );


        const datosBorrar =
          await respuestaBorrar.json();


        if (!respuestaBorrar.ok) {

          return Response.json(
            {

              ok: false,

              sistema:
                "YouTARS",

              paso:
                "limpieza",

              autenticado:
                true,

              escritura:
                true,

              limpieza:
                false,

              statusFirestore:
                respuestaBorrar.status,

              error:
                datosBorrar
                  ?.error
                  ?.message ||
                "El campo temporal se escribió, pero no pudo limpiarse"

            },
            {
              status:
                respuestaBorrar.status
            }
          );

        }


        return Response.json({

          ok: true,

          sistema:
            "YouTARS",

          estado:
            "PRUEBA_B_EXITOSA",

          autenticado:
            true,

          escrituraPermitida:
            true,

          documento:
            "contenido/ultimaPredica",

          campoTemporalAgregado:
            true,

          campoTemporalEliminado:
            true,

          usuario:
            auth.email

        });


      } catch (error) {

        console.error(
          "Error prueba B Firestore YouTARS:",
          error
        );


        return Response.json(
          {

            ok: false,

            sistema:
              "YouTARS",

            paso:
              "firestore_test_b",

            error:
              error.message

          },
          {
            status: 500
          }
        );

      }

    }


    // =====================================================
    // YOUTARS API
    // DETECTOR AUTOMÁTICO DE PRÉDICAS
    // =====================================================

    if (url.pathname === "/api/youtars") {

      try {

        const API_KEY =
          env.YOUTUBE_API_KEY;


        if (!API_KEY) {

          return Response.json(
            {

              ok: false,

              sistema:
                "YouTARS",

              error:
                "YOUTUBE_API_KEY no está configurada"

            },
            {
              status: 500
            }
          );

        }


        // =================================================
        // 1. LOCALIZAR CANAL OFICIAL
        // =================================================

        const canalUrl =
          "https://www.googleapis.com/youtube/v3/channels" +
          "?part=snippet,contentDetails" +
          "&forHandle=iglesialaredsv" +
          `&key=${API_KEY}`;


        const respuestaCanal =
          await fetch(canalUrl);


        const datosCanal =
          await respuestaCanal.json();


        if (!respuestaCanal.ok) {

          return Response.json(
            {

              ok: false,

              sistema:
                "YouTARS",

              paso:
                "buscar_canal",

              error:
                datosCanal
                  ?.error
                  ?.message ||
                "No fue posible consultar el canal"

            },
            {
              status:
                respuestaCanal.status
            }
          );

        }


        if (!datosCanal.items?.length) {

          return Response.json(
            {

              ok: false,

              sistema:
                "YouTARS",

              paso:
                "buscar_canal",

              error:
                "No se encontró el canal @iglesialaredsv"

            },
            {
              status: 404
            }
          );

        }


        const canal =
          datosCanal.items[0];


        const channelId =
          canal.id;


        const uploadsPlaylistId =
          canal
            .contentDetails
            ?.relatedPlaylists
            ?.uploads;


        if (!uploadsPlaylistId) {

          return Response.json(
            {

              ok: false,

              sistema:
                "YouTARS",

              paso:
                "obtener_playlist",

              error:
                "No se encontró la playlist de uploads del canal"

            },
            {
              status: 404
            }
          );

        }


        // =================================================
        // 2. OBTENER ÚLTIMOS 10 VIDEOS
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

              sistema:
                "YouTARS",

              paso:
                "leer_playlist",

              error:
                datosPlaylist
                  ?.error
                  ?.message ||
                "No fue posible leer los videos del canal"

            },
            {
              status:
                respuestaPlaylist.status
            }
          );

        }


        const ids =
          (datosPlaylist.items || [])

            .map(
              item =>
                item
                  .contentDetails
                  ?.videoId
            )

            .filter(Boolean);


        if (!ids.length) {

          return Response.json(
            {

              ok: false,

              sistema:
                "YouTARS",

              paso:
                "leer_playlist",

              error:
                "No se encontraron videos recientes"

            },
            {
              status: 404
            }
          );

        }


        // =================================================
        // 3. DATOS COMPLETOS DE LOS VIDEOS
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

              sistema:
                "YouTARS",

              paso:
                "analizar_videos",

              error:
                datosVideos
                  ?.error
                  ?.message ||
                "No fue posible analizar los videos"

            },
            {
              status:
                respuestaVideos.status
            }
          );

        }


        // =================================================
        // DURACIÓN ISO → SEGUNDOS
        // =================================================

        function duracionEnSegundos(iso) {

          const match =
            /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/
              .exec(iso || "");


          if (!match) {
            return 0;
          }


          const horas =
            Number(match[1] || 0);

          const minutos =
            Number(match[2] || 0);

          const segundos =
            Number(match[3] || 0);


          return (
            horas * 3600 +
            minutos * 60 +
            segundos
          );

        }


        // =================================================
        // FORMATEAR DURACIÓN
        // =================================================

        function formatearDuracion(
          segundosTotales
        ) {

          const horas =
            Math.floor(
              segundosTotales / 3600
            );


          const minutos =
            Math.floor(
              (
                segundosTotales %
                3600
              ) / 60
            );


          const segundos =
            segundosTotales % 60;


          return [

            horas,

            minutos
              .toString()
              .padStart(2, "0"),

            segundos
              .toString()
              .padStart(2, "0")

          ].join(":");

        }


        // =================================================
        // 4. BLINDAJE YOUTARS
        // =================================================

        const diagnostico =
          (datosVideos.items || [])

            .map(video => {

              const titulo =
                video.snippet
                  ?.title || "";


              const duracionISO =
                video
                  .contentDetails
                  ?.duration || "";


              const duracionSegundos =
                duracionEnSegundos(
                  duracionISO
                );


              const partes =
                titulo
                  .split("|")
                  .map(
                    parte =>
                      parte.trim()
                  );


              const razones = [];

              let aceptado = true;


              // -----------------------------------------
              // ESTRUCTURA
              // -----------------------------------------

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


              // -----------------------------------------
              // PREDICADOR
              // -----------------------------------------

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


              // -----------------------------------------
              // FIRMA IGLESIA LA RED
              // -----------------------------------------

              const firma =
                (partes[2] || "")

                  .toLowerCase()

                  .normalize("NFD")

                  .replace(
                    /[\u0300-\u036f]/g,
                    ""
                  )

                  .trim();


              const firmaValida =
                firma.includes(
                  "iglesia la red"
                );


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


              // -----------------------------------------
              // DURACIÓN
              // -----------------------------------------

              if (duracionSegundos === 0) {

                razones.push(
                  "Duración pendiente / posible Live reciente"
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


              // -----------------------------------------
              // SHORTS
              // -----------------------------------------

              const tituloNormalizado =
                titulo.toLowerCase();


              if (
                tituloNormalizado
                  .includes("#shorts")
                ||
                tituloNormalizado
                  .includes("#short")
              ) {

                aceptado = false;

                razones.push(
                  "Contenido marcado como Short"
                );

              }


              return {

                videoId:
                  video.id,

                tituloYoutube:
                  titulo,

                tituloDetectado:
                  partes[0] ||
                  titulo,

                predicadorDetectado:
                  predicador,

                firmaDetectada:
                  partes[2] || "",

                publicado:
                  video.snippet
                    ?.publishedAt || "",

                duracionISO,

                duracion:
                  formatearDuracion(
                    duracionSegundos
                  ),

                duracionSegundos,

                esLive:
                  Boolean(
                    video
                      .liveStreamingDetails
                  ),

                aceptado,

                razones

              };

            })

            .sort(
              (a, b) =>

                new Date(b.publicado) -
                new Date(a.publicado)

            );


        // =================================================
        // 5. CANDIDATOS
        // =================================================

        const candidatos =
          diagnostico.filter(
            video =>
              video.aceptado
          );


        const ultimaPredica =
          candidatos.length
            ? candidatos[0]
            : null;


        // =================================================
        // RESPUESTA DIAGNÓSTICA
        // =================================================

        return Response.json({

          ok: true,

          sistema:
            "YouTARS",

          estado:
            "MODO_DIAGNOSTICO",

          canal: {

            nombre:
              canal.snippet
                ?.title || "",

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

            sistema:
              "YouTARS",

            error:
              "Error interno",

            detalle:
              error.message

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
