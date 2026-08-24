export default {

  async fetch(request, env) {

    const url = new URL(request.url);

    // ==========================================
    // YOUTARS API
    // ==========================================
    if (url.pathname === "/api/youtars") {

      return Response.json({
        ok: true,
        sistema: "YouTARS",
        estado: "ONLINE"
      });

    }

    // ==========================================
    // SITIO WEB NORMAL
    // ==========================================
    return env.ASSETS.fetch(request);

  }

};
