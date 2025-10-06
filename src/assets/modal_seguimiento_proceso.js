// Simulación global: áreas con pendientes por código de estudiante
window.PEND_SIM = window.PEND_SIM || {
    '605030223': [], // BELTRAN...
    '605032223': [], // CALDERÓN...
    '605034223': [], // CORTES...
    '605049223': [], // HURTADO...
    '605040115': ['Financiera', 'Biblioteca', 'Recursos educativos'],
    '605041789': ['Admisiones']
};

// ==== Simulación: pago derecho a grado (quién pagó / quién debe) ====
window.DG_SIM = window.DG_SIM || {
    '605030223': 'PAGARON',
    '605032223': 'PAGARON',
    '605034223': 'PENDIENTES',
    '605049223': 'PAGARON',
    '605040115': 'PENDIENTES',
    '605041789': 'PAGARON'
};

// --- Simulación simple de graduación por código ---
window.GRAD_SIM = window.GRAD_SIM || {
    '605030223': 'GRADUADO',
    '605032223': 'GRADUADO',
    '605034223': 'NO_GRADUADO',
    '605049223': 'NO_GRADUADO',
    '605040115': 'NO_GRADUADO',
    '605041789': 'NO_GRADUADO'
};

window.DOC_SIM = window.DOC_SIM || {
    '605030223': 'https://www.uma.es/ejemplo-grupo-de-investigacion/navegador_de_ficheros/repositorio-grupos-de-investigacion/descargar/documentaci%C3%B3n%20becas%20junta/documento%20de%20prueba.pdf',
    '605032223': 'https://www.uma.es/ejemplo-grupo-de-investigacion/navegador_de_ficheros/repositorio-grupos-de-investigacion/descargar/documentaci%C3%B3n%20becas%20junta/documento%20de%20prueba.pdf',
    '605034223': 'https://www.uma.es/ejemplo-grupo-de-investigacion/navegador_de_ficheros/repositorio-grupos-de-investigacion/descargar/documentaci%C3%B3n%20becas%20junta/documento%20de%20prueba.pdf',
    // agrega más códigos si quieres
};


// =============================
//  Modal + Listado + Detalle
// =============================
document.addEventListener('DOMContentLoaded', () => {
    // ---------- refs ----------
    const modal = document.getElementById('modal-estudiantes');
    const btnOpen = document.getElementById('btnOpenStudents');
    const btnClose = document.getElementById('btnCloseStudents');

    const formBox = document.getElementById('form-add-student');
    const btnToggleForm = document.getElementById('btnToggleAddForm');
    const btnCloseForm = document.getElementById('btnCloseAddForm');
    const btnCancelForm = document.getElementById('btnCancelAddForm');
    const inputAdd = document.getElementById('inputAddStudent');

    const TABLE_ID = 'tabla-estudiantes-vinculados-proceso';
    const CARDS_ID = 'cards-estudiantes';
    const SEARCH_ID = 'buscarModalEst';
    const PAG_ID = 'paginator-estudiantes';

    // =============================
    //  Utils de detalle / layout
    // =============================
    function isDetailVisible() {
        const d = document.getElementById('detalle-estudiante');
        return !!d && !d.classList.contains('hidden');
    }

    function scrollModalTop() {
        const box = document.querySelector('#modal-estudiantes .max-w-7xl');
        box?.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function syncListViewToBreakpoint() {
        // Solo si NO estamos en detalle
        if (isDetailVisible()) return;

        const isMd = window.matchMedia('(min-width: 768px)').matches;
        const tableEl = document.getElementById(TABLE_ID);
        const cardsEl = document.getElementById(CARDS_ID);

        if (isMd) {
            tableEl?.classList.remove('hidden');
            cardsEl?.classList.add('hidden');
        } else {
            cardsEl?.classList.remove('hidden');
            tableEl?.classList.add('hidden');
        }
    }

    // =============================
    //  Abrir / cerrar modal
    // =============================
    function openModal() {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        document.documentElement.style.overflow = 'hidden';

        syncListViewToBreakpoint();
        // refresca paginación por si había cambios previos
        if (typeof window.refreshStudentsPaginator === 'function') {
            window.refreshStudentsPaginator();
        }
    }

    // 👇 añade esto:
    window.openStudentsModal = openModal;   // alias global para usarlo desde otros scripts

    function closeModal() {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.documentElement.style.overflow = '';

        // vuelve al listado por si estabas en detalle
        if (typeof window.volverAListadoEstudiantes === 'function') {
            window.volverAListadoEstudiantes();
        }
    }

    // Exponer para otros onclick inline
    window.openModal = openModal;
    window.closeModal = closeModal;

    // =============================
    //  Form Agregar
    // =============================
    function toggleAddForm(force) {
        if (!formBox) return;
        if (force === 'show') formBox.classList.remove('hidden');
        else if (force === 'hide') formBox.classList.add('hidden');
        else formBox.classList.toggle('hidden');

        if (!formBox.classList.contains('hidden')) {
            inputAdd?.focus();
        } else {
            const res = document.getElementById('addStudentResult');
            if (res) res.innerHTML = '';
            if (inputAdd) inputAdd.value = '';
        }
    }
    window.toggleAddForm = toggleAddForm;

    // =============================
    //  Botones básicos
    // =============================
    // antes tenías: btnOpen?.addEventListener('click', openModal);
    btnOpen?.addEventListener('click', () => {
        // si existe, limpia el filtro externo
        window.clearExternalFilter?.();
        openModal();
    });

    btnClose?.addEventListener('click', closeModal);

    // cerrar con clic en backdrop
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    // cerrar con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
    });

    btnToggleForm?.addEventListener('click', () => toggleAddForm());
    btnCloseForm?.addEventListener('click', () => toggleAddForm('hide'));
    btnCancelForm?.addEventListener('click', () => toggleAddForm('hide'));

    window.addEventListener('resize', syncListViewToBreakpoint);

    // =============================
    //  Helpers para leer la tabla
    // =============================
    function getTableRows() {
        const tbody = document.querySelector(`#${TABLE_ID} tbody`);
        return tbody ? Array.from(tbody.querySelectorAll('tr')) : [];
    }

    function rowToData(row) {
        const tds = row.querySelectorAll('td');
        if (tds.length < 7) return null;                 // ahora 7 es el mínimo

        // Si hay 8 columnas, la 0 es "pensum"; si hay 7, empieza en "código"
        const base = (tds.length >= 8) ? 1 : 0;

        const pensum = (tds.length >= 8) ? tds[0].innerText.trim() : '';
        const codigo = tds[0 + base].innerText.trim();
        const documento = tds[1 + base].innerText.trim();
        const nombre = tds[2 + base].innerText.trim();
        const categoria = tds[3 + base].innerText.trim();
        const situacion = tds[4 + base].innerText.trim();
        const credPend = tds[5 + base].innerText.trim();
        const accionesTD = tds[6 + base];

        const btns = accionesTD ? accionesTD.querySelectorAll('button, a') : [];
        const btnVer = btns[0] || null;
        const btnQuitar = btns[1] || null;

        return {
            row, pensum, codigo, documento, nombre,
            categoria, situacion, credPend, btnVer, btnQuitar
        };
    }

    window.rowToData = rowToData; // (por si lo necesitas afuera)

    function buildCardHTML(d) {
        return `
<article class="rounded-2xl border bg-white p-4 shadow-sm">
  <div class="flex items-start justify-between gap-3">
    <div class="min-w-0">
      <h4 class="font-semibold text-gray-900 truncate">${d.nombre}</h4>
      <p class="text-xs text-gray-500 mt-0.5">
        <span class="font-medium">Código:</span> ${d.codigo}
        <span class="mx-1">·</span>
        <span class="font-medium">Documento:</span> ${d.documento}
      </p>
      <p class="text-xs text-gray-500">
        <span class="font-medium">Categoría:</span> ${d.categoria}
      </p>
      <p class="text-xs text-gray-500">
        <span class="font-medium">Situación:</span> ${d.situacion}
      </p>
    </div>

    <div class="shrink-0 self-start rounded-full bg-gray-100 ring-1 ring-gray-200 px-2 py-1 text-[10px] text-gray-700">
      ${d.credPend} cred. pend.
    </div>
  </div>

  <div class="mt-3 flex justify-start gap-2">
    <!-- Botón Ver -->
    <button
      data-codigo="${d.codigo}"
      class="btn-card-ver rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 transition">
      Ver
    </button>

    <!-- Botón Historial -->
    <button
      data-codigo="${d.codigo}"
      class="btn-card-historial rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition">
      Historial notificaciones
    </button>

    <!-- Botón Quitar -->
    <button
      class="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 transition">
      Quitar
    </button>
  </div>
</article>
`.trim();
    }

    window.buildCardHTML = buildCardHTML; // (por si lo necesitas afuera)

    // =============================
    //  Paginación (única fuente de UI)
    // =============================
    (function paginationIIFE() {
        const PAGE_SIZE = 5;

        let allRows = [];
        let filteredRows = [];
        let currentPage = 1;



        function hideAllRows() { allRows.forEach(r => (r.style.display = 'none')); }
        function showSliceOnTable(slice) { slice.forEach(r => (r.style.display = '')); }

        function buildCardsFromSlice(slice) {
            if (isDetailVisible()) return; // no pintar detrás del detalle
            const container = document.getElementById(CARDS_ID);
            if (!container) return;
            container.innerHTML = '';
            slice.forEach((row) => {
                const d = rowToData(row);
                if (!d) return;
                const wrap = document.createElement('div');
                wrap.innerHTML = buildCardHTML(d);
                const card = wrap.firstElementChild;

                // botón Ver de la card
                const btnVer = card.querySelector('.btn-card-ver');
                if (btnVer) {
                    btnVer.addEventListener('click', (e) => {
                        e.preventDefault();
                        const code = (d.btnVer && d.btnVer.dataset.codigo) || d.codigo || d.documento || '';
                        if (code) window.verDetalleEstudiante(code);
                        else if (d.btnVer) d.btnVer.click();
                    });
                }

                // botón Historial de la card
                const btnHistorial = card.querySelector('.btn-card-historial');
                if (btnHistorial) {
                    btnHistorial.addEventListener('click', (e) => {
                        e.preventDefault();
                        const code = (d.codigo || '');
                        // Entra al detalle, pero activa directamente la vista de notificaciones
                        if (typeof window.verDetalleEstudiante === 'function') {
                            window.verDetalleEstudiante(code, 'historial');
                        }
                    });
                }

                container.appendChild(card);
            });
        }

        function renderPaginator(total, start, end, page, totalPages) {
            const host = document.getElementById(PAG_ID);
            if (!host) return;

            // En detalle: nada de paginador
            if (isDetailVisible()) {
                host.classList.add('hidden');
                host.innerHTML = '';
                return;
            }

            // Si no hace falta paginar
            if (total <= PAGE_SIZE) {
                host.classList.remove('hidden');
                host.style.display = total === 0 ? 'none' : '';
                host.innerHTML = '';
                return;
            }

            host.classList.remove('hidden');
            host.style.display = '';

            const prevDisabled = page <= 1;
            const nextDisabled = page >= totalPages;

            const prevBtnCls = prevDisabled
                ? 'bg-blue-300 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-400';

            const nextBtnCls = nextDisabled
                ? 'bg-blue-300 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-400';

            host.innerHTML = `
        <div class="w-full">
        <div class="flex items-center justify-center">
            <div class="inline-flex items-center gap-3 rounded-full bg-white/80 px-4 py-2 ring-1 ring-gray-200 shadow-sm">
            <button type="button" id="pg-prev"
                class="px-3 py-1.5 text-xs font-semibold rounded-full transition ${prevBtnCls}">
                Anterior
            </button>

            <span class="text-xs sm:text-sm text-gray-600">
                Mostrando
                <span class="font-semibold text-gray-800">${start + 1}</span>–<span class="font-semibold text-gray-800">${end}</span>
                de <span class="font-semibold text-gray-800">${total}</span>
            </span>

            <span class="inline-flex items-center gap-1 text-xs sm:text-sm text-gray-700">
                <span class="rounded-full bg-blue-50 px-2 py-0.5 font-semibold text-blue-700">Página ${page}</span>
                <span class="text-gray-400">/</span>
                <span class="rounded-full bg-gray-100 px-2 py-0.5 font-medium text-gray-700">${totalPages}</span>
            </span>

            <button type="button" id="pg-next"
                class="px-3 py-1.5 text-xs font-semibold rounded-full transition ${nextBtnCls}">
                Siguiente
            </button>
            </div>
    </div>
    </div>
`.trim();

            const prev = document.getElementById('pg-prev');
            const next = document.getElementById('pg-next');
            if (!prevDisabled) prev.addEventListener('click', () => { currentPage = Math.max(1, currentPage - 1); renderPage(); });
            if (!nextDisabled) next.addEventListener('click', () => { currentPage = Math.min(totalPages, currentPage + 1); renderPage(); });
        }

        // Inserta un dropdown (kebab) de acciones en la celda "Acciones" (solo desktop)
        // ======== Trigger por fila (desktop) ========
        // ======== Trigger por fila (desktop): sin clases md: y ocultando botones por style ========
        function ensureDesktopActionsTrigger(row) {
            const d = rowToData(row);
            if (!d) return;

            const accionesTD = row.querySelector('td:last-child') || d.row?.querySelector('td:last-child');
            if (!accionesTD) return;

            // Evita duplicar
            if (accionesTD.querySelector('.actions-kebab')) return;

            // Centrar contenido en la celda
            accionesTD.style.textAlign = 'center';

            // Oculta los botones inline existentes (Ver / Quitar) en la tabla desktop
            // (Las cards móviles no se tocan)
            accionesTD.querySelectorAll('button, a').forEach(el => { el.style.display = 'none'; });

            // Trigger: solo el ícono (3 puntos), sin círculo
            const trigger = document.createElement('button');
            trigger.type = 'button';
            trigger.className = 'actions-kebab inline-flex items-center justify-center p-0 bg-transparent text-gray-500 hover:text-gray-800 focus:outline-none';
            trigger.setAttribute('aria-label', 'Acciones');
            trigger.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"
                    class="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true">
                <path d="M10 3a1.5 1.5 0 110 3 1.5 1.5 0 010-3zm0 5.5a1.5 1.5 0 110 3 1.5 1.5 0 010-3zM11.5 16a1.5 1.5 0 10-3 0 1.5 1.5 0 003 0z"/>
                </svg>
            `;

            trigger.addEventListener('click', (e) => {
                e.stopPropagation();
                const rect = trigger.getBoundingClientRect();
                window.__openActionsFlyout?.(rect, {
                    codigo: d.codigo || d.documento || '',
                    btnVer: d.btnVer || null,
                    btnQuitar: d.btnQuitar || null
                });
            });

            accionesTD.appendChild(trigger);
        }




        // ======== FLYOUT GLOBAL DE ACCIONES (outside table) ========
        (function initGlobalActionsFlyout() {
            if (document.getElementById('actions-flyout')) return;

            const flyout = document.createElement('div');
            flyout.id = 'actions-flyout';
            flyout.className = 'fixed z-[10080] hidden w-44 rounded-md bg-white shadow-lg ring-1 ring-black/5';
            flyout.innerHTML = `
    <div class="py-1 text-xs">
      <button type="button" id="af-ver"  class="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-800">Ver</button>
      <button type="button" id="af-hist" class="w-full text-left px-3 py-2 hover:bg-gray-50 text-gray-800">Historial</button>
      <div class="my-1 h-px bg-gray-100"></div>
      <button type="button" id="af-quitar" class="w-full text-left px-3 py-2 hover:bg-red-50 text-red-600">Quitar</button>
    </div>
  `;
            document.body.appendChild(flyout);

            let currentData = { codigo: '', btnVer: null, btnQuitar: null };

            function closeFlyout() {
                flyout.classList.add('hidden');
                flyout.style.top = '';
                flyout.style.left = '';
            }
            function openFlyoutFor(triggerRect, data) {
                currentData = data || currentData;
                const MENU_W = flyout.offsetWidth || 176;
                const MENU_H = flyout.offsetHeight || 140;
                const GAP = 6;

                // Centrado horizontal respecto al trigger
                let left = triggerRect.left + (triggerRect.width / 2) - (MENU_W / 2);
                left = Math.max(8, Math.min(left, window.innerWidth - MENU_W - 8));

                // Drop-down si hay espacio; si no, drop-up
                let top = triggerRect.bottom + GAP;
                const hayAbajo = (window.innerHeight - triggerRect.bottom) > (MENU_H + GAP);
                if (!hayAbajo) top = triggerRect.top - MENU_H - GAP;

                flyout.style.left = `${left}px`;
                flyout.style.top = `${Math.max(8, Math.min(top, window.innerHeight - MENU_H - 8))}px`;
                flyout.classList.remove('hidden');
            }

            window.__openActionsFlyout = openFlyoutFor;
            window.__closeActionsFlyout = closeFlyout;

            document.getElementById('af-ver')?.addEventListener('click', () => {
                const code = (currentData.btnVer?.dataset.codigo) || currentData.codigo || '';
                if (code) window.verDetalleEstudiante?.(code); else currentData.btnVer?.click();
                closeFlyout();
            });
            document.getElementById('af-hist')?.addEventListener('click', () => {
                if (currentData.codigo) window.verDetalleEstudiante?.(currentData.codigo, 'historial');
                closeFlyout();
            });
            document.getElementById('af-quitar')?.addEventListener('click', () => {
                currentData.btnQuitar?.click();
                closeFlyout();
            });

            document.addEventListener('click', (e) => { if (!flyout.contains(e.target)) closeFlyout(); });
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeFlyout(); });
            window.addEventListener('scroll', closeFlyout, true);
            window.addEventListener('resize', closeFlyout);
        })();


        function renderPage() {
            const total = filteredRows.length;
            const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
            currentPage = Math.min(currentPage, totalPages);

            const start = (currentPage - 1) * PAGE_SIZE;
            const endIdx = Math.min(start + PAGE_SIZE, total);
            const slice = filteredRows.slice(start, endIdx);

            // desktop: mostrar filas del slice
            hideAllRows();
            showSliceOnTable(slice);

            // ⬇️ Reemplaza cualquier llamada a ensureDesktopActionsDropdown por esta:
            slice.forEach((row) => {
                try { ensureDesktopActionsTrigger(row); } catch (e) { console.warn(e); }
            });

            // móvil: cards del slice
            buildCardsFromSlice(slice);

            // paginador
            renderPaginator(total, start, endIdx, currentPage, totalPages);

        }
        // --- Filtro externo por área (se aplica además del buscador)
        let externalPredicate = null;   // (row) => boolean
        let externalLabel = '';         // texto para UI opcional


        function computeFilteredRows(needle) {
            const n = (needle || '').toLowerCase().trim();

            // 1) parte de allRows
            let rows = allRows.slice();

            // 2) buscador
            if (n) {
                rows = rows.filter(r => r.innerText.toLowerCase().includes(n));
            }

            // 3) filtro externo (área)
            if (typeof externalPredicate === 'function') {
                rows = rows.filter(r => {
                    try { return externalPredicate(r); } catch { return false; }
                });
            }

            filteredRows = rows;
        }

        // ----------------------------- 
        // “Filtrando: … / Quitar filtro” y helpers públicos
        // === UI del filtro externo (chip + botón Quitar) ===
        let __filterBar = null, __filterChip = null, __filterClearBtn = null;

        function ensureFilterBar() {
            if (__filterBar) return;

            const searchInput = document.getElementById(SEARCH_ID);
            if (!searchInput) return;

            const bar = document.createElement('div');
            bar.id = 'ps-filterbar';
            bar.className = 'mb-3 hidden items-center gap-2';
            bar.innerHTML = `
    <span id="ps-filterchip" class="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
      Filtrando
    </span>
    <button id="ps-filterclear" type="button"
      class="rounded-full ring-1 ring-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50">
      Quitar filtro
    </button>
  `;

            // Colócala justo encima del buscador
            searchInput.parentElement?.insertAdjacentElement('beforebegin', bar);

            __filterBar = bar;
            __filterChip = bar.querySelector('#ps-filterchip');
            __filterClearBtn = bar.querySelector('#ps-filterclear');

            __filterClearBtn?.addEventListener('click', () => {
                window.clearExternalFilter();
            });
        }

        function showFilterBar(label) {
            ensureFilterBar();
            if (!__filterBar) return;
            __filterChip.textContent = `Filtrando: ${label}`;
            __filterBar.classList.remove('hidden');
        }

        function hideFilterBar() {
            if (!__filterBar) return;
            __filterBar.classList.add('hidden');
        }

        // === Helpers públicos para (des)aplicar filtro externo ===
        window.setExternalFilter = function (label, predicateFn) {
            externalPredicate = predicateFn;      // usa la variable que ya declaraste arriba
            externalLabel = label || '';
            showFilterBar(externalLabel);

            const q = (document.getElementById(SEARCH_ID)?.value || '').toLowerCase().trim();
            computeFilteredRows(q);
            currentPage = 1;
            renderPage();
        };

        window.clearExternalFilter = function () {
            externalPredicate = null;
            externalLabel = '';
            hideFilterBar();

            const q = (document.getElementById(SEARCH_ID)?.value || '').toLowerCase().trim();
            computeFilteredRows(q);
            currentPage = 1;
            renderPage();
        };


        function applySearch(q) {
            const needle = (q || '').toLowerCase().trim();
            computeFilteredRows(needle);   // <- usa tu función existente
            currentPage = 1;
            renderPage();
        }


        // Exponer refresco público
        window.refreshStudentsPaginator = function () {
            allRows = getTableRows();
            // usa lo que haya en el buscador
            const q = document.getElementById(SEARCH_ID)?.value || '';
            computeFilteredRows(q.toLowerCase().trim());
            currentPage = 1;
            renderPage();
        };


        // Buscar integrado (usa el mismo dataset del paginador)
        (function wireSearchWithPaginator() {
            const input = document.getElementById(SEARCH_ID);
            if (!input) return;
            input.addEventListener('input', function () { applySearch(this.value); });
        })();

        // Arranque
        window.refreshStudentsPaginator();

        // Reconstruir cards del slice actual en cambios de ancho
        window.addEventListener('resize', () => {
            if (isDetailVisible()) return;
            const total = filteredRows.length;
            const start = (currentPage - 1) * PAGE_SIZE;
            const endIdx = Math.min(start + PAGE_SIZE, total);
            buildCardsFromSlice(filteredRows.slice(start, endIdx));
        });

        // ====== Filtro externo expuesto (se aplica además del buscador) ======
        // window.setExternalFilter = function (label, predicateFn) {
        //     externalPredicate = typeof predicateFn === 'function' ? predicateFn : null;
        //     externalLabel = label || '';

        //     const q = (document.getElementById(SEARCH_ID)?.value || '').toLowerCase().trim();
        //     computeFilteredRows(q);
        //     currentPage = 1;
        //     renderPage();

        //     // (Opcional: si agregaste el pill de UI, lo mostramos/ocultamos en forma segura)
        //     const pill = document.getElementById('pill-filtro-externo');
        //     const pillText = document.getElementById('pill-filtro-externo-text');
        //     if (pill && pillText) {
        //         if (externalPredicate) {
        //             pillText.textContent = `Filtrando: ${externalLabel}`;
        //             pill.classList.remove('hidden');
        //         } else {
        //             pill.classList.add('hidden');
        //         }
        //     }
        // };

        // window.clearExternalFilter = function () {
        //     window.setExternalFilter('', null);
        // };

        // ====== Abrir el modal principal y filtrar por área (usando la simulación) ======
        window.openPendientesEnTabla = function (area) {
            // 1) Abre el modal grande de estudiantes
            (window.openStudentsModal || window.openModal)?.();

            // 2) Aplica filtro externo contra el mapa PEND_SIM
            window.setExternalFilter(area, function (row) {
                const d = rowToData(row);
                if (!d || !d.codigo) return false;
                const areas = PEND_SIM[d.codigo] || [];
                return areas.includes(area);
            });
        };

    })();

    // =============================
    //  Paginador visible/oculto
    // =============================
    function togglePaginator(show = true) {
        const el = document.getElementById(PAG_ID);
        if (!el) return;
        el.classList.toggle('hidden', !show);
        el.style.display = show ? '' : 'none'; // por si quedó display:none inline
    }
    window.togglePaginator = togglePaginator;

    // =============================
    //  Vista de Detalle
    // =============================
    window.verDetalleEstudiante = function (codigo, vista = 'checklist') {
        // Oculta paginador
        togglePaginator(false);
        // Cargar el PDF (demo) para el código actual
        setPreviewDocFor(codigo);

        // Oculta listado (wrapper tabla + cards)
        const wrapEl = document.getElementById('listado-estudiantes');
        const tableEl = document.getElementById(TABLE_ID);
        const cardsEl = document.getElementById(CARDS_ID);

        wrapEl?.classList.add('hidden');          // evita que md:table reaparezca
        tableEl?.classList.add('hidden', 'md:hidden');
        cardsEl?.classList.add('hidden');

        // Oculta buscador y encabezados
        document.getElementById(SEARCH_ID)?.parentElement?.classList.add('hidden');
        document.getElementById('encabezado-contextual')?.classList.add('hidden');

        // Oculta form si está abierto
        if (formBox && !formBox.classList.contains('hidden')) {
            toggleAddForm('hide');
        }

        // Muestra detalle
        document.getElementById('detalle-estudiante')?.classList.remove('hidden');
        scrollModalTop();
        // Cargar automáticamente el PDF del estudiante en el visor derecho
        if (codigo != null && typeof window.loadIdentityDocFor === 'function') {
            window.loadIdentityDocFor(codigo);
        }


        // Inicializa checklist en el próximo tick
        setTimeout(() => {
            if (typeof window.initFormularioChecklist === 'function') {
                window.initFormularioChecklist();
            } else {
                console.warn('[checklist] initFormularioChecklist no está cargado todavía.');
            }

            // 👇 NUEVO: si se pidió abrir el historial directamente
            if (vista === 'historial') {
                const tabChecklist = document.getElementById('seccion-checklist');
                const tabHistorial = document.getElementById('seccion-historial');

                // oculta checklist, muestra historial
                tabChecklist?.classList.add('hidden');
                tabHistorial?.classList.remove('hidden');
            }
        }, 0);

        if (codigo != null) console.log('verDetalleEstudiante →', codigo, vista);
    };




    window.volverAListadoEstudiantes = function () {
        // Oculta detalle
        document.getElementById('detalle-estudiante')?.classList.add('hidden');

        // Muestra el wrapper del listado y limpia bloqueos que pusimos
        const wrapEl = document.getElementById('listado-estudiantes');
        const tableEl = document.getElementById(TABLE_ID);
        const cardsEl = document.getElementById(CARDS_ID);

        wrapEl?.classList.remove('hidden');
        tableEl?.classList.remove('md:hidden');   // habilita que el breakpoint decida
        tableEl?.classList.remove('hidden');      // luego el sync decide si ocultar/mostrar
        cardsEl?.classList.remove('hidden');

        // Según breakpoint, muestra tabla o cards
        syncListViewToBreakpoint();

        // Vuelve a mostrar buscador/encabezado
        document.getElementById(SEARCH_ID)?.parentElement?.classList.remove('hidden');
        document.getElementById('encabezado-contextual')?.classList.remove('hidden');

        // Muestra paginador otra vez
        togglePaginator(true);

        // Recalcula paginación por si cambió algo
        if (typeof window.refreshStudentsPaginator === 'function') {
            window.refreshStudentsPaginator();
        }

        scrollModalTop();
    };


    // Botón “volver al listado” (si existe)
    document.getElementById('btn-volver-listado')?.addEventListener('click', window.volverAListadoEstudiantes);



});

function countPendByArea(area) {
    const sim = window.PEND_SIM || {};
    let n = 0;
    for (const areas of Object.values(sim)) {
        if (Array.isArray(areas) && areas.includes(area)) n++;
    }
    return n;
}

(function hydratePSButtons() {
    document.querySelectorAll('[data-ps-area]').forEach(btn => {
        const area = btn.dataset.psArea;
        const n = countPendByArea(area);

        if (n === 0) {
            // Sin pendientes: deshabilitar y cambiar estilo/texto
            btn.textContent = 'Sin pendientes';
            btn.disabled = true;
            btn.classList.remove('bg-blue-600', 'hover:bg-blue-700', 'text-white', 'focus:ring-2', 'focus:ring-blue-300');
            btn.classList.add('bg-gray-200', 'text-gray-500', 'cursor-not-allowed');
            btn.removeAttribute('onclick'); // opcional
        } else {
            // Con pendientes: asegurar onclick en caso de que lo quites del HTML
            if (!btn.hasAttribute('onclick')) {
                btn.setAttribute('onclick', `openPendientesEnTabla('${area}')`);
            }
        }
    });
})();


// Abre el modal grande y aplica filtro externo por estado de pago
window.openDerechoGradoModal = function (estado) {
    // abre el modal grande
    (window.openStudentsModal || window.openModal)?.();

    const label = (estado === 'PAGARON')
        ? 'Pago derecho a grado — Pagaron'
        : 'Pago derecho a grado — Pendientes';

    // usa el mismo sistema de filtro externo ya existente
    window.setExternalFilter(label, function (row) {
        const d = (typeof window.rowToData === 'function') ? window.rowToData(row) : null;
        if (!d || !d.codigo) return false;
        const s = (window.DG_SIM || {})[d.codigo] || '';
        return (estado === 'PAGARON')
            ? (s === 'PAGARON' || s === 'PAGADO')
            : (s === 'PENDIENTES' || s === 'PENDIENTE');
    });
};

// --- Helpers UI: actualizar contadores y (des)habilitar botones ---
function dgCount(estado) {
    const sim = window.DG_SIM || {};
    let n = 0;
    for (const v of Object.values(sim)) {
        if (estado === 'PAGARON' && /^pagar/i.test(v)) n++;
        if (estado === 'PENDIENTES' && /^pend/i.test(v)) n++;
    }
    return n;
}

(function hydrateDG() {
    // pintar contadores desde la simulación
    const nPag = dgCount('PAGARON');
    const nPen = dgCount('PENDIENTES');
    const elPag = document.getElementById('dg-pagaron');
    const elPen = document.getElementById('dg-pendientes');
    if (elPag) elPag.textContent = nPag;
    if (elPen) elPen.textContent = nPen;

    // deshabilitar botones si no hay registros
    const btnPag = document.querySelector('button[onclick*="openDerechoGradoModal(\'PAGARON\')"]');
    const btnPen = document.querySelector('button[onclick*="openDerechoGradoModal(\'PENDIENTES\')"]');

    if (btnPag && nPag === 0) {
        btnPag.textContent = 'Sin registros';
        btnPag.disabled = true;
        btnPag.classList.remove('bg-emerald-600', 'hover:bg-emerald-700', 'text-white');
        btnPag.classList.add('bg-gray-200', 'text-gray-500', 'cursor-not-allowed');
        btnPag.removeAttribute('onclick');
    }
    if (btnPen && nPen === 0) {
        btnPen.textContent = 'Sin registros';
        btnPen.disabled = true;
        btnPen.classList.remove('bg-red-600', 'hover:bg-red-700', 'text-white');
        btnPen.classList.add('bg-gray-200', 'text-gray-500', 'cursor-not-allowed');
        btnPen.removeAttribute('onclick');
    }
})();




// Abre el modal grande y aplica filtro externo por graduación
window.openGraduadosEnTabla = function (estado) {
    // 1) abrir modal grande de estudiantes
    (window.openStudentsModal || window.openModal)?.();

    // 2) aplicar filtro externo reutilizando tu setExternalFilter
    const label = (estado === 'GRADUADO')
        ? 'Graduación — Graduados'
        : 'Graduación — No graduados';

    window.setExternalFilter?.(label, function (row) {
        const d = (typeof window.rowToData === 'function') ? window.rowToData(row) : null;
        if (!d || !d.codigo) return false;
        const st = (window.GRAD_SIM || {})[d.codigo] || 'NO_GRADUADO';
        return (estado === 'GRADUADO') ? (st === 'GRADUADO') : (st !== 'GRADUADO');
    });
};

// Helpers UI: contar y (des)habilitar botones si no hay registros
function gradCount(estado) {
    const sim = window.GRAD_SIM || {};
    let n = 0;
    for (const v of Object.values(sim)) {
        if (estado === 'GRADUADO' && v === 'GRADUADO') n++;
        if (estado === 'NO_GRADUADO' && v !== 'GRADUADO') n++;
    }
    return n;
}

(function hydrateGraduadosSummary() {
    // Pintar contadores
    const nG = gradCount('GRADUADO');
    const nN = gradCount('NO_GRADUADO');
    const elG = document.getElementById('grd-count-g');
    const elN = document.getElementById('grd-count-n');
    if (elG) elG.textContent = nG;
    if (elN) elN.textContent = nN;

    // Deshabilitar botones si no hay registros (y ajustar estilos)
    const btnG = document.querySelector('button[data-grad="GRADUADO"]');
    const btnN = document.querySelector('button[data-grad="NO_GRADUADO"]');

    if (btnG && nG === 0) {
        btnG.textContent = 'Sin registros';
        btnG.disabled = true;
        btnG.classList.remove('bg-emerald-600', 'hover:bg-emerald-700', 'text-white');
        btnG.classList.add('bg-gray-200', 'text-gray-500', 'cursor-not-allowed');
        btnG.removeAttribute('onclick');
    }
    if (btnN && nN === 0) {
        btnN.textContent = 'Sin registros';
        btnN.disabled = true;
        btnN.classList.remove('bg-blue-600', 'hover:bg-blue-700', 'text-white');
        btnN.classList.add('bg-gray-200', 'text-gray-500', 'cursor-not-allowed');
        btnN.removeAttribute('onclick');
    }
})();

function getDocUrlByCodigo(codigo) {
    // TODO: cámbialo por tu lógica real (AJAX, dataset, etc.).
    return (window.DOC_URLS && window.DOC_URLS[codigo]) || '';
}




// Setea el PDF del visor (o muestra "sin documento")
function setPreviewDocFor(codigo) {
    const url = (window.DOC_SIM || {})[codigo] || '';
    const frame = document.getElementById('doc-preview-frame');
    const empty = document.getElementById('doc-preview-empty');
    const name = document.getElementById('doc-preview-filename');

    if (!frame || !empty || !name) return;

    if (url) {
        // Para la demo: PDF directo. Si usas tu servidor, pon aquí la URL real
        frame.src = url + '#view=FitH';
        frame.classList.remove('hidden');
        empty.classList.add('hidden');
        name.textContent = url.split('/').pop();
    } else {
        // Sin doc
        frame.src = '';
        frame.classList.add('hidden');
        empty.classList.remove('hidden');
        name.textContent = '—';
    }
}

// Toggle mostrar/ocultar visor (no afecta notificaciones)
(function wireDocPreviewToggle() {
    const btn = document.getElementById('doc-preview-toggle');
    const body = document.getElementById('doc-preview-body');
    if (!btn || !body) return;

    btn.addEventListener('click', () => {
        const hidden = body.classList.toggle('hidden');
        btn.textContent = hidden ? 'Mostrar' : 'Ocultar';
    });
})();