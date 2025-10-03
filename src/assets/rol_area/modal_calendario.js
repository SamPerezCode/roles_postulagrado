(() => {
    // Refs
    const $btnOpen = document.getElementById('btn-ver-calendario');
    const $modal = document.getElementById('modal-calendario');
    const $closeX = document.getElementById('mc-close');
    const $cerrar = document.getElementById('mc-cerrar');
    const $search = document.getElementById('mc-search');
    const $fechasOL = document.getElementById('mc-fechas');
    const $recsOL = document.getElementById('mc-records');
    const $empty = document.getElementById('mc-empty');

    if (!$modal) return;

    // Demo data (ajústalo a tu backend)
    const fechasClave = [
        { fecha: '2025-11-12', titulo: 'Fecha límite revisión', detalle: 'Todas las áreas deben registrar su decisión.' },
        { fecha: '2025-11-08', titulo: 'Corte de notificación', detalle: 'Último día para enviar recordatorios masivos.' },
        { fecha: '2025-11-15', titulo: 'Reporte consolidado', detalle: 'Exportar listado oficial de estudiantes con OK.' },
    ];

    const recordatorios = [
        { fecha: '2025-11-03 09:00', titulo: 'Recordatorio a estudiantes', detalle: 'Enviar instructivo de derecho a grado.' },
        { fecha: '2025-11-05 16:00', titulo: 'Aviso a Financiera', detalle: 'Cruce de pagos parcial.' },
        { fecha: '2025-11-10 08:00', titulo: 'Último recordatorio', detalle: 'Pendientes antes del corte de notificación.' },
    ];

    // Utils
    const fmtDate = (isoStr, withTime = false) => {
        try {
            const d = new Date(isoStr.replace(' ', 'T'));
            const opts = withTime
                ? { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }
                : { day: '2-digit', month: 'short', year: 'numeric' };
            return new Intl.DateTimeFormat('es-CO', opts).format(d).replace('.', '');
        } catch { return isoStr; }
    };

    function normalize(s = '') {
        return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    }

    // Render
    function liFecha(f) {
        return `
      <li class="relative pl-6">
        <span class="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-blue-600"></span>
        <p class="text-gray-800">
          <span class="font-medium">${f.titulo}</span> · ${f.detalle}
        </p>
        <p class="text-xs text-gray-500">${fmtDate(f.fecha)}</p>
      </li>
    `;
    }
    function liRec(r) {
        return `
      <li class="relative pl-6">
        <span class="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-amber-500"></span>
        <p class="text-gray-800">
          <span class="font-medium">${r.titulo}</span> · ${r.detalle}
        </p>
        <p class="text-xs text-gray-500">${fmtDate(r.fecha, true)}</p>
      </li>
    `;
    }

    let q = '';
    function render() {
        const nq = normalize(q);
        const f = !nq ? fechasClave : fechasClave.filter(x =>
            normalize(x.titulo).includes(nq) || normalize(x.detalle).includes(nq) || normalize(x.fecha).includes(nq)
        );
        const r = !nq ? recordatorios : recordatorios.filter(x =>
            normalize(x.titulo).includes(nq) || normalize(x.detalle).includes(nq) || normalize(x.fecha).includes(nq)
        );

        $fechasOL.innerHTML = f.map(liFecha).join('');
        $recsOL.innerHTML = r.map(liRec).join('');

        const hay = (f.length + r.length) > 0;
        $empty.classList.toggle('hidden', hay);
    }

    // Open/Close
    function open() {
        render();
        $modal.classList.remove('hidden');
        document.documentElement.style.overflow = 'hidden';
        setTimeout(() => $search?.focus(), 50);
    }
    function close() {
        $modal.classList.add('hidden');
        document.documentElement.style.overflow = '';
    }

    $btnOpen?.addEventListener('click', open);
    $closeX?.addEventListener('click', close);
    $cerrar?.addEventListener('click', close);
    $modal?.addEventListener('click', (e) => { if (e.target === $modal) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !$modal.classList.contains('hidden')) close(); });

    // Search
    $search?.addEventListener('input', (e) => { q = e.target.value || ''; render(); });

    // API pública opcional (por si quieres empujar eventos desde otros módulos)
    window.addCalendarItem = function (type, item) {
        if (type === 'fecha') fechasClave.unshift(item);
        if (type === 'recordatorio') recordatorios.unshift(item);
        render();
    };
})();