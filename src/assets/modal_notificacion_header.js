// modal_notificacion_header.js (versión robusta)
(() => {
    // helpers
    const openEl = (el) => el && el.classList.remove('invisible', 'opacity-0', 'pointer-events-none');
    const closeEl = (el) => el && el.classList.add('invisible', 'opacity-0', 'pointer-events-none');

    // refs mínimas (requeridas)
    const btnBell = document.getElementById('btnBell');
    const menuBell = document.getElementById('menuBell');
    const menuUser = document.getElementById('menuUser');

    if (!btnBell || !menuBell) return; // si no existe la campana en esta vista, no hacemos nada

    // abrir/cerrar dropdown campana
    btnBell.addEventListener('click', (e) => {
        e.stopPropagation();
        const estabaOculto = menuBell.classList.contains('invisible');
        closeEl(menuUser);
        closeEl(menuBell);
        if (estabaOculto) openEl(menuBell);
    });

    // cerrar por click fuera (usa contains para cubrir svg dentro del botón)
    document.addEventListener('click', (e) => {
        if (!menuBell.contains(e.target) && !btnBell.contains(e.target)) closeEl(menuBell);
    });

    // --- Opcional: “badge” y listas, solo si existen en esta página ---
    const badgeUnread = document.getElementById('badge-unread');   // opcional
    const listUnread = document.getElementById('list-unread');    // opcional
    const listRead = document.getElementById('list-read');      // opcional

    function refreshUnreadBadge() {
        if (!badgeUnread) return;               // si no hay badge, no intentamos actualizar
        const n = listUnread ? listUnread.querySelectorAll('li').length : 0;
        badgeUnread.textContent = n ? `${n} sin leer` : 'Al día';
        badgeUnread.classList.toggle('bg-blue-50', n > 0);
        badgeUnread.classList.toggle('text-blue-700', n > 0);
        badgeUnread.classList.toggle('bg-emerald-50', n === 0);
        badgeUnread.classList.toggle('text-emerald-700', n === 0);
    }
    refreshUnreadBadge();

    // Delegación dentro del dropdown (solo si hay listas/acciones)
    menuBell.addEventListener('click', (e) => {
        const t = e.target;
        if (t.matches('[data-open-all]')) {
            const mdAll = document.getElementById('md-all-notifs');
            if (mdAll) { mdAll.classList.remove('hidden'); closeEl(menuBell); }
        }
        if (!listUnread || !listRead) return;

        if (t.matches('[data-mark-read]')) {
            const li = t.closest('li');
            li?.querySelector('span.h-2\\.5')?.classList.replace('bg-blue-600', 'bg-gray-300');
            t.remove();
            const btn = document.createElement('button');
            btn.className = 'text-blue-700 hover:underline';
            btn.textContent = 'Marcar no leída';
            btn.setAttribute('data-mark-unread', '');
            li?.querySelector('.mt-1.flex')?.prepend(btn);
            listRead?.prepend(li);
            refreshUnreadBadge();
        }
        if (t.matches('[data-mark-unread]')) {
            const li = t.closest('li');
            li?.querySelector('span.h-2\\.5')?.classList.replace('bg-gray-300', 'bg-blue-600');
            t.remove();
            const btn = document.createElement('button');
            btn.className = 'text-blue-700 hover:underline';
            btn.textContent = 'Marcar leído';
            btn.setAttribute('data-mark-read', '');
            li?.querySelector('.mt-1.flex')?.prepend(btn);
            listUnread?.prepend(li);
            refreshUnreadBadge();
        }
    });

    // Modal "ver todas" (si existe)
    const mdAll = document.getElementById('md-all-notifs');
    if (mdAll) {
        const closeAllModal = () => mdAll.classList.add('hidden');
        mdAll.addEventListener('click', (e) => {
            if (e.target.dataset.close === 'md-all-notifs') closeAllModal();
            if (e.target.closest('[data-close="md-all-notifs"]')) closeAllModal();
        });
        // filtros simples dentro del modal
        mdAll.querySelectorAll('[data-filter]').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.filter; // all|unread|read
                mdAll.querySelectorAll('#all-notifs-list [data-state]').forEach(card => {
                    const st = card.dataset.state;
                    card.style.display = (mode === 'all' || mode === st) ? '' : 'none';
                });
            });
        });
        // marcar (no) leído dentro del modal (solo estilos)
        mdAll.querySelector('#all-notifs-list')?.addEventListener('click', (e) => {
            const t = e.target;
            const card = t.closest('[data-state]');
            if (!card) return;
            const dot = card.querySelector('span.h-2\\.5');
            if (t.matches('[data-mark-read]')) { card.dataset.state = 'read'; dot?.classList.replace('bg-blue-600', 'bg-gray-300'); refreshUnreadBadge(); }
            if (t.matches('[data-mark-unread]')) { card.dataset.state = 'unread'; dot?.classList.replace('bg-gray-300', 'bg-blue-600'); refreshUnreadBadge(); }
        });
    }
})();
