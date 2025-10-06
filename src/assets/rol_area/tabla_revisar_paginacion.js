(() => {
    // ====== DEMO DATA (solo financiera) ======
    const students = [
        // estado: 'PENDIENTE' | 'APROBADO' | 'OBSERVACION'
        { doc: '1073721918', cod: '605030223', nom: 'Beltrán Cano Leidy Johana', prog: 'Idiomas', estado: 'PENDIENTE', obs: ['Factura vencida', 'Saldo por $120.000'] },
        { doc: '1030599627', cod: '605032223', nom: 'Calderón Barrios Robinson', prog: 'Derecho Internacional', estado: 'OBSERVACION', obs: ['Cruce pendiente con tesorería'] },
        { doc: '1026304707', cod: '605034223', nom: 'Cortés Hernández Michel Dayanna', prog: 'Derecho Internacional', estado: 'APROBADO', obs: [] },
        { doc: '1006507614', cod: '605049223', nom: 'Hurtado Novoa Julián Dario', prog: 'Derecho Internacional', estado: 'PENDIENTE', obs: [] },
        { doc: '1012345678', cod: '605040115', nom: 'Ramírez Lozano Camila Sofía', prog: 'Derecho Internacional', estado: 'OBSERVACION', obs: ['Plan de pagos sin soporte'] },
        { doc: '1122334455', cod: '605041789', nom: 'Morales Pérez Andrés Felipe', prog: 'Derecho Internacional', estado: 'PENDIENTE', obs: [] },
        { doc: '1098765432', cod: '605041790', nom: 'López García Ana María', prog: 'Derecho Internacional', estado: 'APROBADO', obs: [] },
        { doc: '1000000001', cod: '605041791', nom: 'Gómez Rojas Pedro', prog: 'Derecho Internacional', estado: 'OBSERVACION', obs: ['Descuento sin aplicar', 'Recibo ilegible'] },
        { doc: '1000000002', cod: '605041792', nom: 'Díaz Méndez Laura', prog: 'Idiomas', estado: 'PENDIENTE', obs: [] },
        { doc: '1000000003', cod: '605041793', nom: 'Torres Silva Juan', prog: 'Derecho Internacional', estado: 'PENDIENTE', obs: [] },
        { doc: '1000000004', cod: '605041794', nom: 'Pinto Vargas Sara', prog: 'Idiomas', estado: 'OBSERVACION', obs: ['Valor diferente en recibo'] },
        { doc: '1000000005', cod: '605041795', nom: 'Velasco León Camilo', prog: 'Derecho Internacional', estado: 'APROBADO', obs: [] },
    ];

    window.students = students;
    localStorage.setItem('students_demo', JSON.stringify(window.students));

    // ====== refs ======
    const $tableBody = document.querySelector('#fin-table tbody');
    const $cards = document.getElementById('fin-cards');
    const $pag = document.getElementById('fin-pag');
    const $s1 = document.getElementById('fin-search');
    const $s2 = document.getElementById('fin-search-m');


    $pag.addEventListener('click', (e) => {
        const btnPrev = e.target.closest('[data-pag="prev"]');
        const btnNext = e.target.closest('[data-pag="next"]');

        const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

        if (btnPrev && page > 1) {
            page = Math.max(1, page - 1);
            paint();
        }
        if (btnNext && page < totalPages) {
            page = Math.min(totalPages, page + 1);
            paint();
        }
    });


    // ====== estado UI ======
    const PAGE_SIZE = 4;
    let filtered = students.slice();
    let page = 1;

    // ====== helpers ======
    const badge = (estado) => {
        if (estado === 'APROBADO') {
            return `<span class="inline-flex items-center rounded-lg bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Aprobado</span>`;
        }
        if (estado === 'OBSERVACION') {
            return `<button class="estado-observaciones inline-flex items-center rounded-lg bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 hover:bg-amber-200" title="Ver observaciones">Pendiente con observación</button>`;
        }
        return `<span class="inline-flex items-center rounded-lg bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700">Pendiente por revisar</span>`;
    };

    function renderTable(rows) {
        $tableBody.innerHTML = rows.map(r => {
            const showAprobar = r.estado !== 'APROBADO';
            const showObsBtn = r.estado === 'OBSERVACION';

            // contenido de acciones
            let acciones = '';
            if (showAprobar) {
                acciones += `
        <button data-act="aprobar" data-cod="${r.cod}"
          class="rounded-md bg-blue-600 px-3 py-1 text-xs text-white font-semibold hover:bg-blue-700">
          Aprobar
        </button>`;
            } else {
                // Si ya está aprobado → badge gris de solo lectura
                acciones += `
        <span class="inline-flex items-center rounded-md bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
          Aprobado
        </span>`;
            }

            if (showObsBtn) {
                acciones += `
        <button data-act="obs" data-cod="${r.cod}"
          class="rounded-md bg-gray-200 px-3 py-1 text-xs text-gray-800 font-medium hover:bg-gray-300">
          Observaciones
        </button>`;
            }

            return `
      <tr class="hover:bg-gray-50">
        <td class="px-4 py-2">${r.doc}</td>
        <td class="px-4 py-2">${r.cod}</td>
        <td class="px-4 py-2">${r.nom}</td>
        <td class="px-4 py-2">${r.prog}</td>
        <td class="px-4 py-2 text-center">${badge(r.estado)}</td>
        <td class="px-4 py-2">
          <div class="flex items-center justify-center gap-2">
            ${acciones}
          </div>
        </td>
      </tr>`;
        }).join('');
    }



    function renderCards(rows) {
        $cards.innerHTML = rows.map(r => {
            const showAprobar = r.estado !== 'APROBADO';
            const showObsBtn = r.estado === 'OBSERVACION';

            return `
      <article class="rounded-2xl border bg-white p-4 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <h4 class="font-semibold text-gray-900 truncate">${r.nom}</h4>
            <p class="text-xs text-gray-500 mt-0.5">
              <b>Doc:</b> ${r.doc} · <b>Código:</b> ${r.cod}
            </p>
            <p class="text-xs text-gray-500"><b>Programa:</b> ${r.prog}</p>
          </div>
          <div class="shrink-0">${badge(r.estado)}</div>
        </div>
        <div class="mt-3 flex flex-wrap gap-2">
          ${showAprobar ? `
          <button data-act="aprobar" data-cod="${r.cod}"
            class="rounded-md bg-blue-600 px-3 py-1.5 text-xs text-white font-semibold hover:bg-blue-700">
            Aprobar
          </button>` : ''}
          ${showObsBtn ? `
          <button data-act="obs" data-cod="${r.cod}"
            class="rounded-md bg-gray-200 px-3 py-1.5 text-xs text-gray-800 font-medium hover:bg-gray-300">
            Observaciones
          </button>` : ''}
        </div>
      </article>`;
        }).join('');
    }


    function renderPaginator(total, start, end, page, totalPages) {
        if (total === 0) { $pag.innerHTML = ''; return; }

        const prevDisabled = page <= 1;
        const nextDisabled = page >= totalPages;

        const prevCls = prevDisabled
            ? 'bg-blue-300 text-white cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-400';

        const nextCls = nextDisabled
            ? 'bg-blue-300 text-white cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-400';

        $pag.innerHTML = `
    <div class="inline-flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 ring-1 ring-gray-200 shadow-sm">
      <button type="button" data-pag="prev"
        class="px-3 py-1.5 text-xs font-semibold rounded-full transition ${prevCls}"
        ${prevDisabled ? 'disabled' : ''}>
        Anterior
      </button>

      <span class="text-xs sm:text-sm text-gray-600">
        Mostrando <b class="text-gray-800">${start + 1}</b>–<b class="text-gray-800">${end}</b>
        de <b class="text-gray-800">${total}</b>
      </span>

      <span class="inline-flex items-center gap-1 text-xs sm:text-sm text-gray-700">
        <span class="rounded-full bg-blue-50 px-2 py-0.5 font-semibold text-blue-700">Página ${page}</span>
        <span class="text-gray-400">/</span>
        <span class="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-700">${totalPages}</span>
      </span>

      <button type="button" data-pag="next"
        class="px-3 py-1.5 text-xs font-semibold rounded-full transition ${nextCls}"
        ${nextDisabled ? 'disabled' : ''}>
        Siguiente
      </button>
    </div>
  `;
    }


    function paint() {
        const total = filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
        page = Math.min(page, totalPages);

        const start = (page - 1) * PAGE_SIZE;
        const end = Math.min(start + PAGE_SIZE, total);
        const slice = filtered.slice(start, end);

        // tabla + cards
        renderTable(slice);
        renderCards(slice);

        // paginador
        renderPaginator(total, start, end, page, totalPages);
    }

    // ====== acciones ======
    function findByCod(cod) { return students.find(s => s.cod === cod); }

    function goToObservaciones(cod) {
        // Llévalo a tu vista individual
        window.location.href = `detalle_proceso_paz_salvo.html?codigo=${encodeURIComponent(cod)}&area=Financiera`;
    }

    function delegate(container) {
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-act]');
            if (!btn) return;
            const act = btn.dataset.act;
            const cod = btn.dataset.cod;
            const s = findByCod(cod);
            if (!s) return;

            if (act === 'aprobar') {
                s.estado = 'APROBADO';
                applySearch(currentQuery);
            } else if (act === 'obs') {
                goToObservaciones(cod);
            }
        });
    }


    // click sobre la “pastilla” de estado OBSERVACION (en la tabla)
    $tableBody.addEventListener('click', (e) => {
        const pill = e.target.closest('.estado-observaciones');
        if (!pill) return;
        const tr = e.target.closest('tr');
        const cod = tr?.querySelector('td:nth-child(2)')?.textContent?.trim();
        if (cod) goToObservaciones(cod);
    });

    delegate($tableBody);
    delegate($cards);

    // Normaliza eliminando tildes y pasando a minúsculas
    function normalize(str) {
        return (str || "")
            .normalize("NFD")                // descompone caracteres acentuados
            .replace(/[\u0300-\u036f]/g, "") // elimina marcas diacríticas
            .toLowerCase();
    }

    // ===== búsqueda =====
    let currentQuery = '';
    function applySearch(q) {
        currentQuery = normalize(q.trim());
        filtered = !currentQuery
            ? students.slice()
            : students.filter(s =>
                normalize(s.doc).includes(currentQuery) ||
                normalize(s.cod).includes(currentQuery) ||
                normalize(s.nom).includes(currentQuery)
            );
        page = 1;
        paint();
    }

    $s1?.addEventListener('input', e => applySearch(e.target.value));
    $s2?.addEventListener('input', e => applySearch(e.target.value));


    // init
    paint();
})();



// ---------------------------------
// === Envío de Paz y Salvo ===
(() => {
    // Refs
    const $btnOpen = document.getElementById('btn-enviar-ps');
    const $modal = document.getElementById('modal-enviar-ps');
    const $closeX = document.getElementById('eps-close');
    const $cancel = document.getElementById('eps-cancel');
    const $send = document.getElementById('eps-send');
    const $count = document.getElementById('eps-count');
    const $selector = document.getElementById('eps-selector');
    const $search = document.getElementById('eps-search');
    const $list = document.getElementById('eps-list');
    const $empty = document.getElementById('eps-empty');
    const $msg = document.getElementById('eps-msg');

    if (!$btnOpen || !$modal) return;

    // Normalizador para búsquedas (sin tildes / case-insensitive)
    const normalize = (s = '') => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    function getAprobados() {
        // usa tu array `students`
        return (window.students || []).filter(s => s.estado === 'APROBADO');
    }

    // Render de lista de aprobados (cuando modo = 'uno')
    function renderList(query = '') {
        const data = getAprobados();
        const nq = normalize(query);
        const rows = !nq ? data : data.filter(s =>
            normalize(s.nom).includes(nq) ||
            normalize(s.doc).includes(nq) ||
            normalize(s.cod).includes(nq)
        );

        $list.innerHTML = rows.map(s => `
      <li class="flex items-center justify-between gap-2 px-3 py-2 hover:bg-gray-50">
        <div class="min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">${s.nom}</p>
          <p class="text-xs text-gray-500">Doc: ${s.doc} · Código: ${s.cod}</p>
        </div>
        <button data-cod="${s.cod}" class="eps-send-one rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">
          Enviar
        </button>
      </li>
    `).join('');

        $empty.classList.toggle('hidden', rows.length > 0);
    }

    // Abrir / cerrar
    function open() {
        const aprobados = getAprobados();
        $count.textContent = aprobados.length;
        $msg.value = '';
        // reset modo: todos
        document.querySelectorAll('input[name="eps-mode"]').forEach(r => { if (r.value === 'todos') r.checked = true; });
        $selector.classList.add('hidden');
        renderList('');
        $search.value = '';
        $modal.classList.remove('hidden');
        document.documentElement.style.overflow = 'hidden';
    }
    function close() {
        $modal.classList.add('hidden');
        document.documentElement.style.overflow = '';
    }

    // Handlers
    $btnOpen.addEventListener('click', open);
    $closeX.addEventListener('click', close);
    $cancel.addEventListener('click', close);
    $modal.addEventListener('click', (e) => { if (e.target === $modal) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$modal.classList.contains('hidden')) close(); });

    // Cambiar modo (todos | uno)
    document.querySelectorAll('input[name="eps-mode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const v = e.target.value;
            if (v === 'uno') {
                $selector.classList.remove('hidden');
                setTimeout(() => $search.focus(), 50);
            } else {
                $selector.classList.add('hidden');
            }
        });
    });

    // Buscar en lista de aprobados
    $search?.addEventListener('input', (e) => {
        renderList(e.target.value || '');
    });

    // Enviar a uno (botón de cada ítem)
    $list.addEventListener('click', (e) => {
        const btn = e.target.closest('.eps-send-one');
        if (!btn) return;
        const cod = btn.dataset.cod;
        doSend({ mode: 'uno', targets: [cod], message: $msg.value.trim() });
    });

    // Enviar (botón principal del modal)
    $send.addEventListener('click', () => {
        const mode = (document.querySelector('input[name="eps-mode"]:checked')?.value) || 'todos';
        if (mode === 'todos') {
            const aprobados = getAprobados().map(s => s.cod);
            if (aprobados.length === 0) {
                alert('No hay estudiantes aprobados para enviar.');
                return;
            }
            doSend({ mode: 'todos', targets: aprobados, message: $msg.value.trim() });
        } else {
            // modo “uno”: si no clicaron en un ítem, tomamos el primero visible como ejemplo
            const first = $list.querySelector('.eps-send-one')?.dataset?.cod;
            if (!first) { alert('Selecciona un estudiante aprobado para enviar.'); return; }
            doSend({ mode: 'uno', targets: [first], message: $msg.value.trim() });
        }
    });

    // Simulación de envío (con bitácora si está disponible)
    function doSend({ mode, targets, message }) {
        const $status = document.getElementById('eps-status');
        const $statusText = document.getElementById('eps-status-text');

        // Mostrar overlay "Enviando..."
        $status.classList.remove('hidden');
        $statusText.textContent = "Enviando...";

        // Simular envío con delay
        setTimeout(() => {
            console.log('[Paz y Salvo] Enviado', { mode, targets, message });

            if (typeof window.addToLog === 'function') {
                const texto = mode === 'todos'
                    ? `Paz y Salvo enviado a ${targets.length} aprobados.`
                    : `Paz y Salvo enviado al estudiante ${targets[0]}.`;
                window.addToLog('notificacion', texto);
            }

            // Cambiar a éxito
            $statusText.textContent = "✅ Enviado con éxito";

            // Ocultar después de 1.5s
            setTimeout(() => {
                $status.classList.add('hidden');
                close(); // cierra el modal
            }, 1500);

        }, 1200); // tiempo de "envío"
    }

})();