document.addEventListener('DOMContentLoaded', () => {
    const $form = document.getElementById('ps-form');
    const $proc = document.getElementById('ps-proc');
    const $prog = document.getElementById('ps-prog');
    const $q = document.getElementById('ps-q');
    const $dl = document.getElementById('ps-datalist');
    const $hint = document.getElementById('ps-hint');
    const $clear = document.getElementById('ps-clear');

    if (!$form || !$q) return; // seguridad

    const norm = s => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const data = Array.isArray(window.students) ? window.students : [];

    // ---- Hidratar datalist (doc, código y nombre por separado) ----
    if ($dl && data.length) {
        const opts = [];
        data.forEach(s => {
            if (s.doc) opts.push(`<option value="${s.doc}"></option>`);
            if (s.cod) opts.push(`<option value="${s.cod}"></option>`);
            if (s.nom) opts.push(`<option value="${s.nom}"></option>`);
        });
        $dl.innerHTML = opts.join('');
    }

    // ---- Buscar coincidencia en data (si existe) ----
    function matchStudent(q) {
        if (!data.length) return null;
        const nq = norm(q);
        // primero exacto por doc/código
        let m = data.find(s => norm(s.doc) === nq || norm(s.cod) === nq);
        if (m) return m;
        // luego por nombre contiene
        m = data.find(s => norm(s.nom).includes(nq));
        return m || null;
    }

    // ---- Submit ----
    $form.addEventListener('submit', (e) => {
        e.preventDefault();
        const proc = $proc?.value || '';
        const prog = $prog?.value || '';
        const raw = ($q.value || '').trim();

        if (!raw) { $hint?.classList.remove('hidden'); return; }
        $hint?.classList.add('hidden');

        const match = matchStudent(raw);
        const qParam = match ? (match.cod || match.doc || match.nom) : raw;

        const params = new URLSearchParams();
        if (proc) params.set('proc', proc);
        if (prog) params.set('prog', prog);
        params.set('q', qParam);

        window.location.href = `detalle_proceso_paz_salvo.html?${params.toString()}`;
    });

    // ---- Limpiar ----
    $clear?.addEventListener('click', () => {
        if ($proc) $proc.value = '';
        if ($prog) $prog.value = '';
        $q.value = '';
        $hint?.classList.add('hidden');
        $q.focus();
    });
});