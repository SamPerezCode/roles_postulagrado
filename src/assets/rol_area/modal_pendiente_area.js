(() => {
    // ---------- Refs ----------
    const $openers = [
        document.getElementById('btn-notificar-area'),
        ...Array.from(document.querySelectorAll('[data-open="notificar"]')),
    ].filter(Boolean);

    const $modal = document.getElementById('modal-notificar');
    const $closeX = document.getElementById('ntf-close');
    const $cancel = document.getElementById('ntf-cancel');
    const $send = document.getElementById('ntf-send');

    const $countAll = document.getElementById('ntf-count-all');
    const $countPend = document.getElementById('ntf-count-pend');
    const $countObs = document.getElementById('ntf-count-obs');

    const $selector = document.getElementById('ntf-selector');
    const $search = document.getElementById('ntf-search');
    const $list = document.getElementById('ntf-list');
    const $empty = document.getElementById('ntf-empty');
    const $msg = document.getElementById('ntf-msg');

    const $overlay = document.getElementById('ntf-overlay');
    const $spinner = document.getElementById('ntf-spinner');
    const $status = document.getElementById('ntf-status');

    if (!$modal) return;

    // Exigir arreglo global
    const getStudents = () => (window.students || []);

    // Normalizador (ignora tildes / case-insensitive)
    const norm = (s = '') => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    const isPend = s => s.estado === 'PENDIENTE';
    const isObs = s => s.estado === 'OBSERVACION';

    // --------- UI helpers ---------
    function open() {
        // contar
        const all = getStudents().filter(s => isPend(s) || isObs(s)).length;
        const pend = getStudents().filter(isPend).length;
        const obs = getStudents().filter(isObs).length;
        $countAll.textContent = all;
        $countPend.textContent = pend;
        $countObs.textContent = obs;

        // reset
        document.querySelectorAll('input[name="ntf-mode"]').forEach(r => r.checked = (r.value === 'todos'));
        $selector.classList.add('hidden');
        $search.value = '';
        $list.innerHTML = '';
        $empty.classList.add('hidden');
        $msg.value = '';

        $modal.classList.remove('hidden');
        $modal.classList.add('flex');
        document.documentElement.style.overflow = 'hidden';
    }

    function close() {
        $modal.classList.add('hidden');
        $modal.classList.remove('flex');
        document.documentElement.style.overflow = '';
    }

    function showOverlay(text = 'Enviando…', done = false) {
        $status.textContent = text;
        $spinner.classList.toggle('hidden', !!done);
        $overlay.classList.remove('hidden');
        $overlay.classList.add('flex');
    }
    function hideOverlay() {
        $overlay.classList.add('hidden');
        $overlay.classList.remove('flex');
    }

    // Render listado (modo "uno")
    function renderList(query = '') {
        const data = getStudents().filter(s => isPend(s) || isObs(s));
        const q = norm(query);
        const rows = !q ? data : data.filter(s =>
            norm(s.nom).includes(q) || norm(s.doc).includes(q) || norm(s.cod).includes(q)
        );

        $list.innerHTML = rows.map(s => `
      <li class="flex items-center justify-between gap-2 px-3 py-2 hover:bg-gray-50">
        <div class="min-w-0">
          <p class="text-sm font-medium text-gray-900 truncate">${s.nom}</p>
          <p class="text-xs text-gray-500">Doc: ${s.doc} · Código: ${s.cod} · ${s.estado === 'OBSERVACION' ? 'Observación' : 'Pendiente'}</p>
        </div>
        <button data-cod="${s.cod}" class="ntf-one rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">Enviar</button>
      </li>
    `).join('');

        $empty.classList.toggle('hidden', rows.length > 0);
    }

    // --------- Wire ---------
    // Abrir
    $openers.forEach(btn => btn.addEventListener('click', open));

    // Cerrar
    $closeX.addEventListener('click', close);
    $cancel.addEventListener('click', close);
    $modal.addEventListener('click', e => { if (e.target === $modal || e.target.dataset.close === 'modal-notificar') close(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$modal.classList.contains('hidden')) close(); });

    // Cambiar modo
    document.querySelectorAll('input[name="ntf-mode"]').forEach(r => {
        r.addEventListener('change', e => {
            if (e.target.value === 'uno') {
                $selector.classList.remove('hidden');
                setTimeout(() => $search.focus(), 50);
                renderList('');
            } else {
                $selector.classList.add('hidden');
            }
        });
    });

    // Buscar en lista
    $search.addEventListener('input', e => renderList(e.target.value || ''));

    // Enviar a uno desde la lista
    $list.addEventListener('click', e => {
        const btn = e.target.closest('.ntf-one');
        if (!btn) return;
        const cod = btn.dataset.cod;
        doSend({ mode: 'uno', targets: [cod], message: $msg.value.trim() });
    });

    // Enviar (botón principal)
    $send.addEventListener('click', () => {
        const mode = document.querySelector('input[name="ntf-mode"]:checked')?.value || 'todos';
        let targets = [];

        if (mode === 'todos') {
            targets = getStudents().filter(s => isPend(s) || isObs(s)).map(s => s.cod);
        } else if (mode === 'pendientes') {
            targets = getStudents().filter(isPend).map(s => s.cod);
        } else if (mode === 'obs') {
            targets = getStudents().filter(isObs).map(s => s.cod);
        } else {
            // modo "uno": si no presionaron un item, tomamos el primero visible
            const first = $list.querySelector('.ntf-one')?.dataset?.cod;
            if (first) targets = [first];
        }

        if (!targets.length) {
            alert('No hay destinatarios para notificar.');
            return;
        }

        doSend({ mode, targets, message: $msg.value.trim() });
    });

    // Simulación de envío
    function doSend({ mode, targets, message }) {
        showOverlay('Enviando…', false);

        // Simulación breve
        setTimeout(() => {
            // Bitácora opcional
            if (typeof window.addToLog === 'function') {
                const txt =
                    mode === 'uno'
                        ? `Notificación enviada al estudiante ${targets[0]}.`
                        : `Notificación enviada a ${targets.length} estudiantes (${mode}).`;
                window.addToLog('notificacion', txt);
            }

            // Finaliza
            $status.textContent = 'Enviado con éxito';
            $spinner.classList.add('hidden');

            setTimeout(() => {
                hideOverlay();
                close();
            }, 900);
        }, 900);
    }
})();