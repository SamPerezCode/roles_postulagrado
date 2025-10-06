(() => {
    // ===== Datos DEMO por área (llévalo luego a tu backend)
    const PENDIENTES = {
        "Financiera": [
            { codigo: "605030223", documento: "1073721918", nombre: "BELTRAN CANO LEIDY JOHANA", situacion: "ACTIVO", tipo: "ENLACE", cred_pend: 0 },
            { codigo: "605040115", documento: "1012345678", nombre: "RAMÍREZ LOZANO CAMILA SOFÍA", situacion: "EN PROCESO", tipo: "RESP", cred_pend: 3 },
        ],
        "Admisiones": [
            { codigo: "605032223", documento: "1030599627", nombre: "CALDERÓN BARRIOS ROBINSON DANIEL", situacion: "ACTIVO", tipo: "ENLACE", cred_pend: 0 },
            { codigo: "605041789", documento: "1122334455", nombre: "MORALES PÉREZ ANDRÉS FELIPE", situacion: "ACTIVO", tipo: "RESP", cred_pend: 1 },
        ],
        "Biblioteca": [
            { codigo: "605049223", documento: "1006507614", nombre: "HURTADO NOVOA JULIÁN DARIO", situacion: "ACTIVO", tipo: "RESP", cred_pend: 0 },
        ],
        "Recursos educativos": [
            { codigo: "605034223", documento: "1026304707", nombre: "CORTES HERNÁNDEZ MICHEL DAYANNA", situacion: "ACTIVO", tipo: "ENLACE", cred_pend: 0 },
        ],
        "Centro de idiomas": [
            { codigo: "605000001", documento: "900111222", nombre: "APELLIDOS NOMBRES", situacion: "ACTIVO", tipo: "ENLACE", cred_pend: 0 },
        ],
    };

    // ===== Referencias del modal
    const $modal = document.getElementById('modal-pendientes');
    const $title = document.getElementById('mp-title');
    const $tbody = document.getElementById('mp-tbody');
    const $total = document.getElementById('mp-total');
    const $empty = document.getElementById('mp-empty');
    const $search = document.getElementById('mp-search');
    const $filtro = document.getElementById('mp-filtro');
    const $closeX = document.getElementById('mp-close');
    const $cerrar = document.getElementById('mp-cerrar');

    let areaActual = null;
    let cache = [];

    // ===== Helpers
    function openModal(area) {
        areaActual = area;
        $title.textContent = `Pendientes · ${area}`;
        cache = (PENDIENTES[area] || []).slice(0);
        $search.value = '';
        $filtro.value = '';
        render(cache);
        $modal.classList.remove('hidden');
    }
    function closeModal() {
        $modal.classList.add('hidden');
    }
    function render(rows) {
        const q = $search.value.trim().toLowerCase();
        const tipo = $filtro.value;

        let data = rows.filter(r => {
            const okQ = !q || r.nombre.toLowerCase().includes(q) || r.codigo.includes(q);
            const okT = !tipo || r.tipo === tipo;
            return okQ && okT;
        });

        $total.textContent = data.length;
        $empty.classList.toggle('hidden', data.length > 0);

        $tbody.innerHTML = data.map(r => `
      <tr class="[&>td]:py-2 [&>td]:px-2">
        <td class="whitespace-nowrap">${r.codigo}</td>
        <td class="whitespace-nowrap">${r.documento}</td>
        <td class="text-gray-900">${r.nombre}</td>
        <td>
          <span class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ring-1
            ${r.situacion === 'ACTIVO'
                ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                : 'bg-yellow-50 text-yellow-800 ring-yellow-200'}">
            ${r.situacion}
          </span>
          <span class="ml-2 text-xs text-gray-500">${r.tipo}</span>
        </td>
        <td class="text-center">${r.cred_pend}</td>
        <td class="text-center">
          <button class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                  data-ver="${r.codigo}">
            Ver detalle
          </button>
        </td>
      </tr>
    `).join('');
    }

    // ===== Eventos modal
    $closeX.addEventListener('click', closeModal);
    $cerrar.addEventListener('click', closeModal);
    $modal.addEventListener('click', (e) => { if (e.target === $modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (!$modal.classList.contains('hidden') && e.key === 'Escape') closeModal(); });

    $search.addEventListener('input', () => render(cache));
    $filtro.addEventListener('change', () => render(cache));

    // Delegación para “Ver detalle”
    $tbody.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-ver]');
        if (!btn) return;
        const cod = btn.dataset.ver;
        if (typeof verDetalleEstudiante === 'function') {
            closeModal();
            verDetalleEstudiante(cod);
        } else {
            alert(`Ver detalle de estudiante ${cod}`);
        }
    });

    // ===== Wire en las cards
    document.querySelectorAll('.btn-pendientes[data-area]').forEach(btn => {
        const area = btn.dataset.area;
        const list = PENDIENTES[area] || [];
        // Si no hay pendientes, oculta el botón
        if (list.length === 0) {
            btn.classList.add('hidden');
            return;
        }
        // Actualiza contador visible
        const span = btn.querySelector('.count');
        if (span) span.textContent = `(${list.length})`;

        btn.addEventListener('click', () => openModal(area));
    });
})();

(() => {
    // === DEMO: pendientes por área (ajústalo a tu backend) ====================
    const PENDIENTES = {
        "Financiera": [
            { codigo: "605030223", documento: "1073721918", nombre: "BELTRAN CANO LEIDY JOHANA", situacion: "ACTIVO", tipo: "ENLACE", cred_pend: 0 },
            { codigo: "605040115", documento: "1012345678", nombre: "RAMÍREZ LOZANO CAMILA SOFÍA", situacion: "EN PROCESO", tipo: "RESP", cred_pend: 3 },
        ],
        "Admisiones": [
            { codigo: "605032223", documento: "1030599627", nombre: "CALDERÓN BARRIOS ROBINSON DANIEL", situacion: "ACTIVO", tipo: "ENLACE", cred_pend: 0 },
            { codigo: "605041789", documento: "1122334455", nombre: "MORALES PÉREZ ANDRÉS FELIPE", situacion: "ACTIVO", tipo: "RESP", cred_pend: 1 },
        ],
        "Biblioteca": [
            { codigo: "605049223", documento: "1006507614", nombre: "HURTADO NOVOA JULIÁN DARIO", situacion: "ACTIVO", tipo: "RESP", cred_pend: 0 },
        ],
        "Recursos educativos": [
            { codigo: "605034223", documento: "1026304707", nombre: "CORTES HERNÁNDEZ MICHEL DAYANNA", situacion: "ACTIVO", tipo: "ENLACE", cred_pend: 0 },
        ],
        "Centro de idiomas": [
            { codigo: "605000001", documento: "900111222", nombre: "APELLIDOS NOMBRES", situacion: "ACTIVO", tipo: "ENLACE", cred_pend: 0 },
        ],
    };

    // === Refs modal ============================================================
    const $modal = document.getElementById('modal-pendientes');
    const $title = document.getElementById('mp-title');
    const $tbody = document.getElementById('mp-tbody');
    const $total = document.getElementById('mp-total');
    const $empty = document.getElementById('mp-empty');
    const $search = document.getElementById('mp-search');
    const $filtro = document.getElementById('mp-filtro');
    const closeModal = () => $modal.classList.add('hidden');
    document.getElementById('mp-close').addEventListener('click', closeModal);
    document.getElementById('mp-cerrar').addEventListener('click', closeModal);
    $modal.addEventListener('click', e => { if (e.target === $modal) closeModal(); });

    let areaActual = null;
    let cache = [];

    function paint(rows) {
        const q = $search.value.trim().toLowerCase();
        const t = $filtro.value;
        const data = rows.filter(r => {
            const okQ = !q || r.nombre.toLowerCase().includes(q) || r.codigo.includes(q);
            const okT = !t || r.tipo === t;
            return okQ && okT;
        });

        $total.textContent = data.length;
        $empty.classList.toggle('hidden', data.length > 0);

        $tbody.innerHTML = data.map(r => `
      <tr class="[&>td]:py-2 [&>td]:px-2">
        <td class="whitespace-nowrap">${r.codigo}</td>
        <td class="whitespace-nowrap">${r.documento}</td>
        <td class="text-gray-900">${r.nombre}</td>
        <td>
          <span class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] ring-1
            ${r.situacion === 'ACTIVO'
                ? 'bg-emerald-50 text-emerald-800 ring-emerald-200'
                : 'bg-yellow-50 text-yellow-800 ring-yellow-200'}">
            ${r.situacion}
          </span>
          <span class="ml-2 text-xs text-gray-500">${r.tipo}</span>
        </td>
        <td class="text-center">${r.cred_pend}</td>
        <td class="text-center">
          <button class="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100"
                  data-ver="${r.codigo}">
            Ver detalle
          </button>
        </td>
      </tr>
    `).join('');
    }

    $search.addEventListener('input', () => paint(cache));
    $filtro.addEventListener('change', () => paint(cache));
    $tbody.addEventListener('click', e => {
        const btn = e.target.closest('button[data-ver]');
        if (!btn) return;
        const cod = btn.dataset.ver;
        if (typeof verDetalleEstudiante === 'function') {
            closeModal();
            verDetalleEstudiante(cod);
        } else {
            alert(`Ver detalle de estudiante ${cod}`);
        }
    });

    function openForArea(area, countAttr) {
        // si el contador es 0, no abrimos
        const n = parseInt(countAttr || '0', 10);
        if (!Number.isFinite(n) || n <= 0) return;

        areaActual = area;
        $title.textContent = `Pendientes · ${area}`;
        cache = (PENDIENTES[area] || []).slice(0);
        $search.value = '';
        $filtro.value = '';
        paint(cache);
        $modal.classList.remove('hidden');
    }

    // === Wire: toma el nombre del <h3> de cada card ============================
    document.querySelectorAll('section:has(> h2) article').forEach(card => {
        const h3 = card.querySelector('h3');
        const area = h3 ? h3.textContent.trim() : '';
        const btn = card.querySelector('.btn-pendientes');
        if (!area || !btn) return;

        // Si el área no tiene dataset en PENDIENTES, oculta el botón
        const list = PENDIENTES[area] || [];
        if (list.length === 0) {
            btn.classList.add('hidden');
            return;
        }

        btn.addEventListener('click', () => openForArea(area, btn.dataset.count));
    });
})();