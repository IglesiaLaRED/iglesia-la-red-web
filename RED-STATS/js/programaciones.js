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


      <!-- MODAL NUEVA PROGRAMACIÓN -->
      <div
        id="modalNuevaProgramacion"
        class="fixed inset-0 z-50 hidden items-center justify-center bg-slate-950/60 p-4"
      >

        <div
          class="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white shadow-2xl"
        >

          <div class="flex items-center justify-between border-b border-slate-200 px-6 py-5">

            <div>
              <p class="text-sm font-semibold text-cyan-600">
                Nueva asignación
              </p>

              <h3 class="mt-1 text-2xl font-black text-blue-950">
                Crear programación
              </h3>
            </div>

            <button
              id="btnCerrarModalProgramacion"
              type="button"
              class="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Cerrar modal"
            >
              ✕
            </button>

          </div>


          <form id="formNuevaProgramacion" class="space-y-5 p-6">

            <div class="grid gap-5 sm:grid-cols-2">

              <div>
                <label
                  for="fechaProgramacion"
                  class="mb-2 block text-sm font-bold text-blue-950"
                >
                  Fecha
                </label>

                <input
                  id="fechaProgramacion"
                  name="fecha"
                  type="date"
                  required
                  class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                >
              </div>


              <div>
                <label
                  for="horaProgramacion"
                  class="mb-2 block text-sm font-bold text-blue-950"
                >
                  Hora
                </label>

                <input
                  id="horaProgramacion"
                  name="hora"
                  type="time"
                  required
                  class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
                >
              </div>

            </div>


            <div>
              <label
                for="servicioProgramacion"
                class="mb-2 block text-sm font-bold text-blue-950"
              >
                Servicio
              </label>

              <select
                id="servicioProgramacion"
                name="servicio"
                required
                class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Selecciona un servicio</option>
                <option value="martes">Martes</option>
                <option value="jueves">Jueves</option>
                <option value="domingo8">Domingo 8:00 a. m.</option>
                <option value="domingo10">Domingo 10:00 a. m.</option>
              </select>
            </div>


            <div>
              <label
                for="ministerioProgramacion"
                class="mb-2 block text-sm font-bold text-blue-950"
              >
                Ministerio
              </label>

              <select
                id="ministerioProgramacion"
                name="ministerio"
                required
                class="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">Selecciona un ministerio</option>
                <option value="parqueo">Ministerio de Parqueo</option>
                <option value="seguridad">Ministerio de Seguridad</option>
                <option value="acomodacion">Ministerio de Acomodación</option>
                <option value="multimedia">Ministerio de Multimedia</option>
                <option value="fotografia">Ministerio de Fotografía</option>
                <option value="escuela-biblica">Escuela Bíblica</option>
              </select>
            </div>


            <div>
              <label
                for="responsableProgramacion"
                class="mb-2 block text-sm font-bold text-blue-950"
              >
                Responsable
              </label>

              <input
                id="responsableProgramacion"
                name="responsable"
                type="text"
                placeholder="Buscar servidor por nombre..."
                autocomplete="off"
                required
                class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              >
            </div>


            <div>
              <label
                for="suplenteProgramacion"
                class="mb-2 block text-sm font-bold text-blue-950"
              >
                Suplente
                <span class="font-normal text-slate-400">
                  (opcional)
                </span>
              </label>

              <input
                id="suplenteProgramacion"
                name="suplente"
                type="text"
                placeholder="Buscar suplente por nombre..."
                autocomplete="off"
                class="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-700 focus:ring-2 focus:ring-blue-100"
              >
            </div>


            <div class="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">

              <button
                id="btnCancelarProgramacion"
                type="button"
                class="rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Cancelar
              </button>

              <button
                type="submit"
                class="rounded-xl bg-blue-900 px-5 py-3 font-semibold text-white transition hover:bg-blue-800"
              >
                Guardar programación
              </button>

            </div>

          </form>

        </div>

      </div>

    </section>
  `;
}
