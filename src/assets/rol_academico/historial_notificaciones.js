// ===== Simulación: notificaciones + observaciones =====
document.addEventListener('DOMContentLoaded', () => {
    const previewList = document.getElementById('log-timeline');
    const btnVerTodas = document.getElementById('btn-ver-todas');

    // Modal refs
    const md = document.getElementById('notif-history-modal');
    const mdClose = document.getElementById('notif-history-close');
    const mdOverlay = document.getElementById('notif-history-overlay');
    const mdOk = document.getElementById('notif-history-ok');
    const mdList = document.getElementById('notif-history-list');
    const mdEmpty = document.getElementById('notif-history-empty');
    const mdCount = document.getElementById('notif-history-count');
    const mdFilters = Array.from(document.querySelectorAll('.nh-filter'));

    // Dataset de ejemplo (puedes reemplazar por datos reales del backend)
    const HISTORY = [
        { type: 'notif', title: 'Notificación enviada', text: 'Instrucciones de derecho a grado enviadas.', at: '2025-10-04 23:52' },
        { type: 'obs', title: 'Observación / estado', text: 'Nombre: marcado como pendiente por inconsistencias.', at: '2025-10-04 23:52' },
        { type: 'obs', title: 'Observación / estado', text: 'Número de documento: revisado y aprobado.', at: '2025-10-04 23:52' },
        { type: 'notif', title: 'Notificación enviada', text: 'Se solicitó corrección de nombre al estudiante.', at: '2025-10-04 23:52' },
        { type: 'notif', title: 'Notificación enviada', text: 'Recordatorio de actualización de datos personales.', at: '2025-09-28 09:10' },
    ];

    const DOT = {
        notif: 'bg-blue-600',
        obs: 'bg-yellow-500',
        ok: 'bg-emerald-500',
        err: 'bg-red-600',
        neutral: 'bg-gray-300'
    };

    function escapeHTML(s = '') {
        return s.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
    }

    // --- Preview en la tarjeta (últimos 4)
    function renderPreview() {
        if (!previewList) return;
        previewList.innerHTML = '';
        const latest = HISTORY.slice(0, 4);
        latest.forEach(it => {
            const dot = DOT[it.type] || DOT.neutral;
            const li = document.createElement('li');
            li.className = 'relative pl-6';
            li.innerHTML = `
        <span class="absolute left-0 top-1.5 h-2 w-2 rounded-full ${dot}"></span>
        <p class="text-gray-800"><span class="font-medium">${escapeHTML(it.title)}</span> · ${escapeHTML(it.text)}</p>
        <p class="text-xs text-gray-500">${escapeHTML(it.at)}</p>
      `;
            previewList.appendChild(li);
        });
        if (latest.length === 0) {
            previewList.innerHTML = '<li class="text-sm text-gray-500">No hay notificaciones todavía.</li>';
        }
    }

    // --- Modal: render con filtros
    let activeFilter = 'all'; // all | notif | obs

    function filteredHistory() {
        if (activeFilter === 'all') return HISTORY;
        return HISTORY.filter(x => x.type === activeFilter);
    }

    function renderHistory() {
        const rows = filteredHistory();
        mdList.innerHTML = '';
        if (rows.length === 0) {
            mdEmpty.classList.remove('hidden');
            mdCount.textContent = '0 registros';
            return;
        }
        mdEmpty.classList.add('hidden');
        rows.forEach(it => {
            const dot = DOT[it.type] || DOT.neutral;
            const li = document.createElement('li');
            li.className = 'relative pl-6';
            li.innerHTML = `
        <span class="absolute left-0 top-1.5 h-2 w-2 rounded-full ${dot}"></span>
        <p class="text-gray-800"><span class="font-medium">${escapeHTML(it.title)}</span> · ${escapeHTML(it.text)}</p>
        <p class="text-xs text-gray-500">${escapeHTML(it.at)}</p>
      `;
            mdList.appendChild(li);
        });
        mdCount.textContent = `${rows.length} registro${rows.length !== 1 ? 's' : ''}`;
    }

    // --- Abrir / cerrar modal
    function openModal() { md.classList.remove('hidden'); md.classList.add('flex'); }
    function closeModal() { md.classList.add('hidden'); md.classList.remove('flex'); }

    btnVerTodas?.addEventListener('click', () => {
        activeFilter = 'all';
        updateFilterButtons();
        renderHistory();
        openModal();
    });
    mdClose?.addEventListener('click', closeModal);
    mdOverlay?.addEventListener('click', closeModal);
    mdOk?.addEventListener('click', closeModal);

    // Filtros
    function updateFilterButtons() {
        mdFilters.forEach(b => {
            const on = b.getAttribute('data-filter') === activeFilter;
            b.classList.toggle('ring-2', on);
            b.classList.toggle('ring-gray-300', !on);
            b.classList.toggle('opacity-100', on);
            b.classList.toggle('opacity-80', !on);
        });
    }
    mdFilters.forEach(b => b.addEventListener('click', () => {
        activeFilter = b.getAttribute('data-filter') || 'all';
        updateFilterButtons();
        renderHistory();
    }));

    // Render inicial
    renderPreview();
});