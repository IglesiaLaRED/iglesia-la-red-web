// ======================================================
// RED STATS — Módulo de Programaciones
// Iglesia La RED
// ======================================================

export function renderProgramaciones() {
  return `
    <section class="space-y-6">

      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <p class="text-sm font-semibold text-cyan-600">
            Gestión semanal
          </p>

          <h2 class="mt-1 text-3xl font-black text-blue-950">
            Programaciones
          </h2>

          <p class="mt-2 text-sm text-slate-500">
            Asigna responsables por ministerio, servicio y fecha.
          </p>
        </div>

        <button
          id="btnNuevaProgramacion"
          type="button"
          class="rounded-xl bg-blue-900 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
        >
          + Nueva programación
        </button>

      </div>


      <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <article class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <p class="text-sm font-medium text-slate-500">
            Programaciones activas
          </p>

          <p class="mt-2 text-3xl font-black text-blue-950">
            0
          </p>

          <p class="mt-3 text-xs text-slate-400">
            Semana actual
          </p>
        </article>


        <article class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <p class="text-sm font-medium text-slate-500">
            Ministerios asignados
          </p>

          <p class="mt-2 text-3xl font-black text-blue-950">
            0
          </p>

          <p class="mt-3 text-xs text-slate-400">
            Con responsable definido
          </p>
        </article>


        <article class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <p class="text-sm font-medium text-slate-500">
            Servicios programados
          </p>

          <p class="mt-2 text-3xl font-black text-blue-950">
            0
          </p>

          <p class="mt-3 text-xs text-slate-400">
            Durante la semana
          </p>
        </article>


        <article class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
          <p class="text-sm font-medium text-slate-500">
            Sin responsable
          </p>

          <p class="mt-2 text-3xl font-black text-amber-600">
            0
          </p>

          <p class="mt-3 text-xs text-slate-400">
            Requieren atención
          </p>
        </article>

      </div>


      <div class="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">

        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <h3 class="text-xl font-black text-blue-950">
              Programación semanal
            </h3>

            <p class="mt-1 text-sm text-slate-500">
              Aquí aparecerán las asignaciones registradas.
            </p>
          </div>


          <div class="flex flex-col gap-3 sm:flex-row">

            <select
              id="filtroServicio"
              class="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-700"
            >
              <option value="">Todos los servicios</option>
              <option value="martes">Martes</option>
              <option value="jueves">Jueves</option>
              <option value="domingo8">Domingo 8:00 a. m.</option>
              <option value="domingo10">Domingo 10:00 a. m.</option>
            </select>


            <select
              id="filtroMinisterio"
              class="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-700"
            >
              <option value="">Todos los ministerios</option>
            </select>

          </div>

        </div>


        <div
          id="listaProgramaciones"
          class="mt-6 overflow-hidden rounded-2xl border border-slate-200"
        >

          <div class="flex min-h-64 items-center justify-center bg-slate-50 p-8 text-center">

            <div>
              <div class="text-5xl">
                📅
              </div>

              <p class="mt-4 font-bold text-blue-950">
                Aún no hay programaciones registradas
              </p>

              <p class="mt-2 text-sm text-slate-500">
                Presiona “Nueva programación” para crear la primera.
              </p>
            </div>

          </div>

        </div>

      </div>

    </section>
  `;
}
