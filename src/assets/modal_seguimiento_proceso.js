
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
    btnOpen?.addEventListener('click', openModal);
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

  <div class="mt-3 flex items-center justify-between">
    <div class="flex items-center gap-4 text-[11px] text-gray-500">
      <span class="inline-flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-full bg-blue-500"></span> Enlace</span>
      <span class="inline-flex items-center gap-1"><span class="h-2.5 w-2.5 rounded-full bg-gray-300"></span> Resp.</span>
    </div>

    <div class="flex justify-center gap-2">
      <button
        data-codigo="${d.codigo}"
        class="btn-card-ver rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 transition">
        Ver
      </button>

      <button
        class="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 transition">
        Quitar
      </button>
    </div>
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

            // móvil: cards del slice
            buildCardsFromSlice(slice);

            // paginador
            renderPaginator(total, start, endIdx, currentPage, totalPages);
        }

        function applySearch(q) {
            const needle = (q || '').toLowerCase().trim();
            filteredRows = !needle ? allRows.slice() : allRows.filter(r => r.innerText.toLowerCase().includes(needle));
            currentPage = 1;
            renderPage();
        }

        // Exponer refresco público
        window.refreshStudentsPaginator = function () {
            allRows = getTableRows();
            filteredRows = allRows.slice();
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
    window.verDetalleEstudiante = function (codigo) {
        // Oculta paginador
        togglePaginator(false);

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

        // Inicializa checklist en el próximo tick
        setTimeout(() => {
            if (typeof window.initFormularioChecklist === 'function') {
                window.initFormularioChecklist();
            } else {
                console.warn('[checklist] initFormularioChecklist no está cargado todavía.');
            }
        }, 0);

        if (codigo != null) console.log('verDetalleEstudiante →', codigo);
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



