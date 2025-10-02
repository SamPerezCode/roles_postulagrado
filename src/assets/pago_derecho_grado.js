(() => {
    const $modal = document.getElementById('modal-derecho-grado');
    const $title = document.getElementById('dg-title');
    const $total = document.getElementById('dg-total');
    const $tbody = document.getElementById('dg-tbody');
    const $cards = document.getElementById('dg-cards');
    const $empty = document.getElementById('dg-empty');
    const $search = document.getElementById('dg-search');
    const $closeX = document.getElementById('dg-close');
    const $cerrarBtn = document.getElementById('dg-cerrar');
    // id del modal raíz
    const $dgRoot = document.getElementById('modal-derecho-grado');

    const cache = { PAGARON: [], PENDIENTES: [] };
    let current = 'PAGARON';

    // ---------- helpers de navegación al modal principal ----------
    function focusStudentInsideMainModal(codigo) {
        // Intenta localizar un input de búsqueda dentro del modal grande y filtrar por código
        const candidateIds = [
            'modal-search', 'students-search', 'buscar-estudiante',
            'search-estudiantes', 'SEARCH_ID'
        ];
        for (const id of candidateIds) {
            const el = document.getElementById(id);
            if (el) {
                el.value = String(codigo);
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Enter' }));
                return true;
            }
        }
        // Si tienes alguna función pública para posicionar/filtrar:
        if (typeof window.gotoStudentInModal === 'function') {
            window.gotoStudentInModal(String(codigo));
            return true;
        }
        if (typeof window.searchStudentInModal === 'function') {
            window.searchStudentInModal(String(codigo));
            return true;
        }
        return false;
    }

    function goToStudentInMainModal(codigo) {
        if (typeof window.openModal === 'function') {
            window.openModal(); // abre tu modal grande
            // da un pequeño tiempo a que pinte el DOM del modal y luego filtra
            setTimeout(() => {
                const ok = focusStudentInsideMainModal(codigo);
                if (!ok) {
                    console.log('[dg] No pude auto-filtrar dentro del modal grande. Código:', codigo);
                }
            }, 180);
        } else {
            alert(`Abrir modal de estudiantes (demo)\nCódigo: ${codigo}`);
        }
    }
    // -------------------------------------------------------------

    const rowHTML = r => `
    <tr class="[&>td]:px-2 [&>td]:py-2">
      <td>${r.codigo}</td>
      <td>${r.documento}</td>
      <td class="font-medium text-gray-900">${r.nombre}</td>
      <td>${current === 'PAGARON' ? 'Pagó ✅' : 'Pendiente ❌'}</td>
      <td class="text-center">
        <button data-act="ver" data-cod="${r.codigo}"
          class="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100">
          Ver
        </button>
      </td>
    </tr>
  `;

    const cardHTML = r => `
    <article class="rounded-xl border border-gray-200 p-3">
      <p class="text-xs text-gray-500">Código ${r.codigo} • Doc. ${r.documento}</p>
      <h6 class="text-gray-900 font-semibold leading-5 truncate">${r.nombre}</h6>
      <p class="mt-1 text-sm ${current === 'PAGARON' ? 'text-emerald-600' : 'text-red-600'}">
        ${current === 'PAGARON' ? 'Pagó' : 'Pendiente'}
      </p>
      <div class="mt-3">
        <button data-act="ver" data-cod="${r.codigo}"
         class="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100">
          Ver
        </button>
      </div>
    </article>
  `;

    function render() {
        const q = ($search.value || '').toLowerCase();
        const rows = cache[current].filter(r =>
            !q || r.nombre.toLowerCase().includes(q) || String(r.codigo).includes(q)
        );
        $total.textContent = rows.length;
        $tbody.innerHTML = rows.map(rowHTML).join('');
        $cards.innerHTML = rows.map(cardHTML).join('');
        $empty.classList.toggle('hidden', rows.length > 0);
    }

    // delegación de eventos para botones "Ver"
    function delegate(container) {
        container.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-act]');
            if (!btn || btn.dataset.act !== 'ver') return;

            const cod = btn.dataset.cod; // <- este es el data-* que pones en el botón del modal de pagos
            if (!cod) return;

            // Cierra este modal de pagos
            close?.();

            // Abre modal principal y se va directo al detalle del estudiante
            if (typeof window.openMainModalAndFocusStudent === 'function') {
                window.openMainModalAndFocusStudent(cod, { interval: 120, maxTries: 25 });
                return;
            }

            // Fallback mínimo si el helper aún no está disponible
            if (typeof window.openModal === 'function') {
                window.openModal();
                setTimeout(() => {
                    if (typeof window.verDetalleEstudiante === 'function') {
                        window.verDetalleEstudiante(String(cod));
                    }
                }, 250);
            }
        });
    }
    if ($tbody) delegate($tbody);
    if ($cards) delegate($cards);


    function open(tipo) {
        current = tipo;
        $title.textContent = tipo === 'PAGARON' ? 'Estudiantes que pagaron' : 'Estudiantes pendientes';
        $search.value = '';
        render();
        $modal.classList.remove('hidden');
    }
    function close() { $modal.classList.add('hidden'); }

    $closeX.addEventListener('click', close);
    $cerrarBtn.addEventListener('click', close);
    $modal.addEventListener('click', e => { if (e.target === $modal) close(); });
    $search.addEventListener('input', render);

    // API pública
    window.openDerechoGradoModal = open;
    window.setDerechoGradoData = (tipo, data) => {
        if (!['PAGARON', 'PENDIENTES'].includes(tipo)) return;
        cache[tipo] = data.map(x => ({ ...x }));
        render();
        // Actualiza contadores en las cards de la sección
        if (tipo === 'PAGARON') {
            const el = document.getElementById('dg-pagaron');
            if (el) el.textContent = data.length;
        } else {
            const el = document.getElementById('dg-pendientes');
            if (el) el.textContent = data.length;
        }
    };

    // DEMO
    window.setDerechoGradoData('PAGARON', [
        { codigo: 1001, documento: '12345678', nombre: 'Juan Pérez' },
        { codigo: 1002, documento: '87654321', nombre: 'Ana López' }
    ]);
    window.setDerechoGradoData('PENDIENTES', [
        { codigo: 2001, documento: '11111111', nombre: 'Pedro Gómez' },
        { codigo: 2002, documento: '44443333', nombre: 'María Díaz' }
    ]);
})();

/**
 * Abre el modal principal y navega directamente al detalle del estudiante.
 * - Autocompleta el buscador (#buscarModalEst)
 * - Intenta clickear el botón "Ver" del estudiante (tabla o cards)
 * - Como fallback llama verDetalleEstudiante(codigo)
 */
window.openMainModalAndFocusStudent = function (codigo, opts = {}) {
    const cod = String(codigo);

    // 1) Cerrar el modal de pagos si está abierto (opcional)
    try {
        const m = document.getElementById('modal-pagos-derecho'); // usa tu id real si cambió
        if (m && !m.classList.contains('hidden')) m.classList.add('hidden');
    } catch { }

    // 2) Abrir modal principal
    if (typeof window.openModal === 'function') {
        window.openModal();
    }

    // 3) Reintentos: esperar a que el DOM del modal esté listo y posicionarnos
    const MAX_TRIES = opts.maxTries ?? 20;
    const INTERVAL = opts.interval ?? 120;
    let tries = 0;

    const attempt = () => {
        tries += 1;

        // a) Autocompleta buscador
        const $search = document.getElementById('buscarModalEst'); // tu input dentro del modal
        if ($search) {
            $search.value = cod;
            $search.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // b) Intentar click al botón "Ver" (tabla o cards)
        const $btn =
            document.querySelector(`#tabla-estudiantes-vinculados-proceso button[data-codigo="${cod}"]`) ||
            document.querySelector(`#cards-estudiantes button[data-codigo="${cod}"]`);

        if ($btn) { $btn.click(); return; }

        // c) Fallback directo
        if (typeof window.verDetalleEstudiante === 'function') {
            window.verDetalleEstudiante(cod);
            return;
        }

        if (tries < MAX_TRIES) {
            setTimeout(attempt, INTERVAL);
        }
    };

    // pequeño delay para dar tiempo a montar el modal
    setTimeout(attempt, 180);
};