
(() => {
    // ====== REFS ======
    const $btnOpen = document.getElementById('btn-enviar-ps-prog');
    const $modal = document.getElementById('modal-enviar-ps-prog');
    const $closeX = document.getElementById('epsp-close');
    const $cancel = document.getElementById('epsp-cancel');
    const $send = document.getElementById('epsp-send');

    const $progCount = document.getElementById('epsp-prog-count');
    const $selector = document.getElementById('epsp-selector');
    const $search = document.getElementById('epsp-search');
    const $list = document.getElementById('epsp-list');
    const $empty = document.getElementById('epsp-empty');
    const $msg = document.getElementById('epsp-msg');
    const $resumen = document.getElementById('epsp-resumen');

    const $status = document.getElementById('epsp-status');
    const $statusTxt = document.getElementById('epsp-status-text');

    if (!$btnOpen || !$modal) return;

    // ====== HELPERS ======
    const normalize = (s = '') => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    function getAprobados() {
        return (window.students || []).filter(s => s.estado === 'APROBADO');
    }

    function groupByPrograma(aprobados) {
        const map = new Map();
        for (const s of aprobados) {
            const k = s.prog || 'Sin programa';
            if (!map.has(k)) map.set(k, []);
            map.get(k).push(s);
        }
        return map; // Map<programa, Student[]>
    }

    function resumenTexto(map) {
        const totalProgs = map.size;
        let totalAprob = 0;
        for (const arr of map.values()) totalAprob += arr.length;
        return `${totalAprob} aprobados en ${totalProgs} programa(s).`;
    }

    // Render de lista de programas (modo = "uno")
    function renderProgramList(query = '') {
        if (!$list || !$empty) return;

        const aprobados = getAprobados();
        const map = groupByPrograma(aprobados);

        const items = [...map.entries()].map(([prog, arr]) => ({ prog, count: arr.length }));
        const nq = normalize(query);
        const rows = !nq ? items : items.filter(it => normalize(it.prog).includes(nq));

        $list.innerHTML = rows.map(it => `
      <li class="flex items-center justify-between gap-2 px-3 py-2 hover:bg-gray-50">
        <div class="min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">${it.prog}</p>
          <p class="text-xs text-gray-500">${it.count} aprobado(s)</p>
        </div>
        <button data-prog="${it.prog}"
          class="epsp-send-one rounded-md bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-purple-700">
          Enviar
        </button>
      </li>
    `).join('');

        $empty.classList.toggle('hidden', rows.length > 0);
    }

    // ====== OPEN/CLOSE ======
    function open() {
        const aprobados = getAprobados();
        const map = groupByPrograma(aprobados);

        $progCount.textContent = [...map.values()].filter(arr => arr.length > 0).length;
        $msg.value = '';
        $resumen.textContent = resumenTexto(map);

        // reset modo: todos
        document.querySelectorAll('input[name="epsp-mode"]').forEach(r => { if (r.value === 'todos') r.checked = true; });
        $selector.classList.add('hidden');
        renderProgramList('');
        if ($search) $search.value = '';

        $modal.classList.remove('hidden');
        document.documentElement.style.overflow = 'hidden';
    }

    function close() {
        $modal.classList.add('hidden');
        document.documentElement.style.overflow = '';
    }

    // ====== EVENTS ======
    $btnOpen.addEventListener('click', open);
    $closeX.addEventListener('click', close);
    $cancel.addEventListener('click', close);
    $modal.addEventListener('click', (e) => { if (e.target === $modal) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$modal.classList.contains('hidden')) close(); });

    // Cambiar modo (todos | uno)
    document.querySelectorAll('input[name="epsp-mode"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            const v = e.target.value;
            if (v === 'uno') {
                $selector.classList.remove('hidden');
                setTimeout(() => $search?.focus(), 50);
            } else {
                $selector.classList.add('hidden');
            }
        });
    });

    // Buscar en lista de programas
    $search?.addEventListener('input', (e) => {
        renderProgramList(e.target.value || '');
    });

    // Enviar a un programa (botón de cada ítem)
    $list?.addEventListener('click', (e) => {
        const btn = e.target.closest('.epsp-send-one');
        if (!btn) return;
        const prog = btn.dataset.prog;
        if (!prog) return;
        doSendProg({ mode: 'uno', targets: [prog], message: $msg.value.trim() });
    });

    // Enviar principal
    $send.addEventListener('click', () => {
        const mode = (document.querySelector('input[name="epsp-mode"]:checked')?.value) || 'todos';

        const aprobados = getAprobados();
        if (aprobados.length === 0) {
            alert('No hay estudiantes aprobados para enviar.');
            return;
        }
        const map = groupByPrograma(aprobados);

        if (mode === 'todos') {
            const progs = [...map.entries()].filter(([, arr]) => arr.length > 0).map(([p]) => p);
            if (progs.length === 0) { alert('No hay programas con aprobados para enviar.'); return; }
            doSendProg({ mode: 'todos', targets: progs, message: $msg.value.trim() });
        } else {
            // modo “uno”: si no clicaron en un ítem, tomamos el primero visible como ejemplo
            const first = $list?.querySelector('.epsp-send-one')?.dataset?.prog;
            if (!first) { alert('Selecciona un programa.'); return; }
            doSendProg({ mode: 'uno', targets: [first], message: $msg.value.trim() });
        }
    });

    // ====== SIMULACIÓN DE ENVÍO ======
    function doSendProg({ mode, targets, message }) {
        // Mostrar overlay "Enviando..."
        $status.classList.remove('hidden');
        $statusTxt.textContent = "Enviando...";

        // Simular envío con delay
        setTimeout(() => {
            // Agrupar aprobados por programa para payload (simulado)
            const aprob = getAprobados();
            const map = groupByPrograma(aprob);

            const payload = targets.map(p => ({
                programa: p,
                aprobados: (map.get(p) || []).map(s => ({ cod: s.cod, nom: s.nom, doc: s.doc }))
            }));

            console.log('[Paz y Salvo] Enviar lista a Programas', { mode, targets, message, payload });

            // Bitácora si está disponible
            if (typeof window.addToLog === 'function') {
                const texto = mode === 'todos'
                    ? `Lista de aprobados enviada a ${targets.length} programa(s).`
                    : `Lista de aprobados enviada al programa ${targets[0]}.`;
                window.addToLog('notificacion', texto);
            }

            // Cambiar a éxito
            $statusTxt.textContent = "✅ Enviado con éxito";

            // Ocultar después de 1.5s
            setTimeout(() => {
                $status.classList.add('hidden');
                close(); // cierra el modal
            }, 1500);

        }, 1200); // tiempo de "envío"
    }
})();
