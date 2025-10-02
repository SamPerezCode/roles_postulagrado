(() => {
    // ====== Estado en memoria ======
    // cacheFechas: { [fechaId]: { meta: {fechaLabel, lugar}, items: Row[] } }
    const cacheFechas = {};
    const $grid = document.getElementById('grd-fechas');

    // ====== Helpers para pintar tarjetas ======
    const cardFechaHTML = (id, meta, total, pendientes) => `
    <article class="rounded-2xl border bg-gray-50/60 p-5 shadow-sm">
      <header class="flex items-start justify-between gap-3">
        <div>
          <h3 class="text-lg font-semibold text-gray-900 leading-5">${meta.fechaLabel}</h3>
          ${meta.lugar ? `<p class="text-xs text-gray-500">${meta.lugar}</p>` : ``}
        </div>
        <span class="inline-flex items-center rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1 ring-1 ring-emerald-200">
          Programados
        </span>
      </header>

      <dl class="mt-4 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
        <div>
          <dt class="text-gray-600">Total graduandos</dt>
          <dd class="font-semibold text-gray-900">${total}</dd>
        </div>
        <div>
          <dt class="text-gray-600">Pend. requisito</dt>
          <dd class="font-semibold ${pendientes > 0 ? 'text-red-600' : 'text-emerald-700'}">${pendientes}</dd>
        </div>
      </dl>

      <div class="mt-4">
        <button onclick="openGraduadosModal('${id}')"
          class="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          Ver lista <span class="opacity-80">(${total})</span>
        </button>
      </div>
    </article>
  `;

    function renderFechas() {
        if (!$grid) return;
        const ids = Object.keys(cacheFechas);
        $grid.innerHTML = ids.map(id => {
            const { meta, items } = cacheFechas[id];
            const total = items.length;
            const pendientes = items.filter(x => x.estado !== 'APROBADO').length;
            return cardFechaHTML(id, meta, total, pendientes);
        }).join('') || `
      <div class="rounded-xl bg-slate-50 ring-1 ring-slate-200 px-3 py-3 text-sm text-gray-600">
        Aún no hay fechas de graduación cargadas.
      </div>`;
    }

    // ====== Modal ======
    const $modal = document.getElementById('modal-graduados');
    const $title = document.getElementById('grd-title');
    const $total = document.getElementById('grd-total');
    const $tbody = document.getElementById('grd-tbody');
    const $cards = document.getElementById('grd-cards');
    const $empty = document.getElementById('grd-empty');
    const $search = document.getElementById('grd-search');
    const $closeX = document.getElementById('grd-close');
    const $cerrarBtn = document.getElementById('grd-cerrar');

    let currentFecha = null;

    const rowHTML = (r) => `
    <tr class="[&>td]:px-2 [&>td]:py-2">
      <td>${r.codigo}</td>
      <td>${r.documento}</td>
      <td class="font-medium text-gray-900">${r.nombre}</td>
      <td>${r.programa ?? '—'}</td>
      <td>${r.estado === 'APROBADO' ? 'Aprobado ✅' : 'Pendiente ❌'}</td>
      <td class="text-center">
        <button data-act="ver" data-cod="${r.codigo}"
                class="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100">
          Ver
        </button>
      </td>
    </tr>
  `;

    const cardHTML = (r) => `
    <article class="rounded-xl border border-gray-200 p-3">
      <p class="text-xs text-gray-500">Código ${r.codigo} • Doc. ${r.documento}</p>
      <h6 class="text-gray-900 font-semibold leading-5 truncate">${r.nombre}</h6>
      <p class="text-xs text-gray-600">${r.programa ?? '—'}</p>
      <p class="mt-1 text-sm ${r.estado === 'APROBADO' ? 'text-emerald-600' : 'text-red-600'}">
        ${r.estado === 'APROBADO' ? 'Aprobado' : 'Pendiente'}
      </p>
      <div class="mt-3">
        <button data-act="ver" data-cod="${r.codigo}"
                class="w-full rounded-md bg-white ring-1 ring-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Ver
        </button>
      </div>
    </article>
  `;

    function getFilteredRows() {
        const q = ($search.value || '').trim().toLowerCase();
        const base = cacheFechas[currentFecha]?.items || [];
        return base.filter(r =>
            !q ||
            r.nombre.toLowerCase().includes(q) ||
            String(r.codigo).includes(q) ||
            (r.programa ?? '').toLowerCase().includes(q)
        );
    }

    function renderModal() {
        const rows = getFilteredRows();
        $total.textContent = rows.length;
        $tbody.innerHTML = rows.map(rowHTML).join('');
        $cards.innerHTML = rows.map(cardHTML).join('');
        $empty.classList.toggle('hidden', rows.length > 0);
    }

    function open(fechaId) {
        currentFecha = fechaId;
        const meta = cacheFechas[fechaId]?.meta || { fechaLabel: 'Graduación' };
        $title.textContent = `Graduados · ${meta.fechaLabel}`;
        $search.value = '';
        renderModal();
        $modal.classList.remove('hidden');
    }
    function close() { $modal.classList.add('hidden'); }

    // Delegación botón "Ver" dentro del modal
    function delegate(container) {
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-act="ver"]');
            if (!btn) return;
            const cod = btn.dataset.cod;
            close();
            // Si tienes helper global, úsalo:
            if (typeof window.openMainModalAndFocusStudent === 'function') {
                window.openMainModalAndFocusStudent(cod, { interval: 120, maxTries: 25 });
            } else if (typeof window.openModal === 'function') {
                // fallback mínimo
                window.openModal();
            }
        });
    }
    if ($tbody) delegate($tbody);
    if ($cards) delegate($cards);

    $closeX?.addEventListener('click', close);
    $cerrarBtn?.addEventListener('click', close);
    $modal?.addEventListener('click', (e) => { if (e.target === $modal) close(); });
    $search?.addEventListener('input', renderModal);

    // ===== API pública =====
    // Agrega/actualiza una fecha completa
    // id: string único (ej. "2025-12-12"), meta: {fechaLabel, lugar}, items: array de {codigo, documento, nombre, programa, estado}
    window.setGraduadosData = function (id, meta, items) {
        cacheFechas[id] = { meta: meta || {}, items: Array.isArray(items) ? items.map(x => ({ ...x })) : [] };
        renderFechas();
    };
    window.openGraduadosModal = open;

    // ===== Demo de ejemplo (quítalo en prod) =====
    window.setGraduadosData('2025-12-12',
        { fechaLabel: '12 de Dic de 2025', lugar: 'Ceremonia principal · Campus Bogotá' },
        [
            { codigo: 9001, documento: '111222333', nombre: 'Laura Méndez', programa: 'Ingeniería de Sistemas', estado: 'APROBADO' },
            { codigo: 9003, documento: '777888999', nombre: 'Sara Torres', programa: 'Enfermería', estado: 'APROBADO' },
        ]
    );
    window.setGraduadosData('2026-03-20',
        { fechaLabel: '20 de Mar de 2026', lugar: 'Sede Norte' },
        [
            { codigo: 9101, documento: '10101010', nombre: 'Andrés Pinto', programa: 'Derecho', estado: 'APROBADO' },
            { codigo: 9002, documento: '444555666', nombre: 'Camilo Ruiz', programa: 'Administración', estado: 'PENDIENTE' },
        ]
    );
})();