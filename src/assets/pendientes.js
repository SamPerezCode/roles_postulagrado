
(() => {
    const fmtCred = (n) => (n == null ? '—' : String(n));

    const $modal = document.getElementById('modal-pendientes');
    const $title = document.getElementById('mp-title');
    const $total = document.getElementById('mp-total');
    const $tbody = document.getElementById('mp-tbody');
    const $cards = document.getElementById('mp-cards');
    const $empty = document.getElementById('mp-empty');
    const $search = document.getElementById('mp-search');
    const $filtro = document.getElementById('mp-filtro');
    const $closeX = document.getElementById('mp-close');
    const $cerrarBtn = document.getElementById('mp-cerrar');

    // >>> NUEVO: caché por área (persiste entre aperturas)
    const cache = new Map();  // Map<string, Row[]>

    // estado de render
    let dataRaw = [];
    let areaAct = '';

    const trHTML = (r) => `
    <tr class="[&>td]:px-2 [&>td]:py-2">
        <td>${r.codigo}</td>
        <td>${r.documento}</td>
        <td class="font-medium text-gray-900">${r.nombre}</td>
        <td>
            <div class="flex items-center gap-3 text-[11px] text-gray-600">
                <span class="inline-flex items-center gap-1">
                    <span class="h-2.5 w-2.5 rounded-full ${r.enlace ? 'bg-blue-600' : 'bg-gray-300'}"></span> Enlace
                </span>
                <span class="inline-flex items-center gap-1">
                    <span class="h-2.5 w-2.5 rounded-full ${r.resp ? 'bg-emerald-500' : 'bg-gray-300'}"></span> Resp.
                </span>
            </div>
        </td>
        <td class="text-center">${fmtCred(r.credPend)}</td>
        <td class="text-center">
            <div class="flex justify-center gap-2">
                <button data-act="ver" data-cod="${r.codigo}"
                    class="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100">Ver</button>
            </div>
        </td>
    </tr>
    `;

    const cardHTML = (r) => `
  <article class="rounded-xl border border-gray-200 p-3">
    <div class="min-w-0">
      <p class="text-xs text-gray-500">Código ${r.codigo} • Doc. ${r.documento}</p>
      <h6 class="text-gray-900 font-semibold leading-5 truncate">${r.nombre}</h6>
      <div class="mt-1 flex items-center gap-3 text-[11px] text-gray-600">
        <span class="inline-flex items-center gap-1">
          <span class="h-2.5 w-2.5 rounded-full ${r.enlace ? 'bg-blue-600' : 'bg-gray-300'}"></span> Enlace
        </span>
        <span class="inline-flex items-center gap-1">
          <span class="h-2.5 w-2.5 rounded-full ${r.resp ? 'bg-emerald-500' : 'bg-gray-300'}"></span> Resp.
        </span>
        <span class="ml-auto text-gray-700">
          <span class="text-xs">Créd. pend.:</span> <b>${fmtCred(r.credPend)}</b>
        </span>
      </div>
    </div>
    <div class="mt-3">
      <button data-act="ver" data-cod="${r.codigo}"
        class="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100">Ver</button>
    </div>
  </article>
`;


    function getFilter() {
        const q = ($search.value || '').trim().toLowerCase();
        const f = ($filtro.value || '').toUpperCase(); // '', ENLACE, RESP
        return dataRaw.filter(r => {
            const okQ = !q || r.nombre.toLowerCase().includes(q) || String(r.codigo).includes(q);
            let okF = true;
            if (f === 'ENLACE') okF = !!r.enlace;
            if (f === 'RESP') okF = !!r.resp;
            return okQ && okF;
        });
    }

    function render() {
        const rows = getFilter();
        $total.textContent = rows.length;
        if ($tbody) $tbody.innerHTML = rows.map(trHTML).join('');
        if ($cards) $cards.innerHTML = rows.map(cardHTML).join('');
        $empty.classList.toggle('hidden', rows.length > 0);
    }

    function goToStudent(cod) {
        // Cierra el modal de pendientes
        $modal.classList.add('hidden');

        // Abre tu modal principal (usa tu alias global expuesto arriba)
        if (typeof window.openStudentsModal === 'function') {
            window.openStudentsModal();
        } else if (typeof window.openModal === 'function') {
            window.openModal();
        } else {
            // fallback mínimo
            document.getElementById('modal-estudiantes')?.classList.remove('hidden');
            document.documentElement.style.overflow = 'hidden';
        }

        // Muestra el detalle del estudiante
        if (typeof window.verDetalleEstudiante === 'function') {
            window.verDetalleEstudiante(String(cod));
        } else {
            // fallback: al menos filtra por código
            const input = document.getElementById('buscarModalEst');
            if (input) { input.value = String(cod); input.dispatchEvent(new Event('input')); }
        }
    }

    function delegate(container) {
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-act]');
            if (!btn) return;
            if (btn.dataset.act === 'ver') {
                goToStudent(btn.dataset.cod);
            }
        });
    }

    $tbody && delegate($tbody);
    $cards && delegate($cards);

    // ===== API interna
    function open(area, dataset) {
        areaAct = area || 'Área';
        $title.textContent = `Pendientes · ${areaAct}`;

        // Si llega un dataset, lo guardamos en caché (clon ligero para evitar mutaciones externas).
        if (Array.isArray(dataset)) {
            cache.set(areaAct, dataset.map(x => ({ ...x })));
        }
        // Si NO llega dataset, reutilizamos el último guardado.
        dataRaw = (cache.get(areaAct) || []).map(x => ({ ...x }));

        // reset filtros/busqueda en cada apertura
        if ($search) $search.value = '';
        if ($filtro) $filtro.value = '';
        render();

        $modal.classList.remove('hidden');
    }
    function close() { $modal.classList.add('hidden'); }

    // cierres
    $closeX?.addEventListener('click', close);
    $cerrarBtn?.addEventListener('click', close);
    $modal?.addEventListener('click', (e) => { if (e.target === $modal) close(); });

    $search?.addEventListener('input', render);
    $filtro?.addEventListener('change', render);

    // ===== API pública
    // 1) Abrir modal (dataset opcional; si se omite, usa caché):
    window.openPendientesModal = open;

    // 2) Pre-cargar/actualizar datos de un área sin abrir el modal:
    window.setPendientesData = function (area, dataset) {
        if (!area || !Array.isArray(dataset)) return;
        cache.set(area, dataset.map(x => ({ ...x })));
    };

    // <<< Precarga demo (opcional). Debe ir DESPUÉS de definir setPendientesData.
    setPendientesData('Financiera', [
        { codigo: 605030223, documento: '1073721918', nombre: 'BELTRAN CANO LEIDY JOHANA', enlace: true, resp: false, credPend: 0 },
        { codigo: 605032223, documento: '1030599627', nombre: 'CALDERÓN ROBINSON', enlace: false, resp: true, credPend: 1 }
    ]);

})();


