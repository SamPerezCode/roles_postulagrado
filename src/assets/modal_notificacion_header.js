// --- helpers de visibilidad
function openEl(el) { el.classList.remove('invisible', 'opacity-0', 'pointer-events-none'); }
function closeEl(el) { el.classList.add('invisible', 'opacity-0', 'pointer-events-none'); }

// refs
const btnBell = document.getElementById('btnBell');
const menuBell = document.getElementById('menuBell');
const badgeUnread = document.getElementById('badge-unread');
const listUnread = document.getElementById('list-unread');
const listRead = document.getElementById('list-read');

// abrir/cerrar dropdown campana
btnBell?.addEventListener('click', (e) => {
    e.stopPropagation();
    const isHidden = menuBell.classList.contains('invisible');
    document.querySelectorAll('#menuUser, #menuBell').forEach(closeEl);
    if (isHidden) openEl(menuBell);
});
document.addEventListener('click', (e) => {
    if (!menuBell.contains(e.target) && e.target !== btnBell) closeEl(menuBell);
});

// actualizar contador
function refreshUnreadBadge() {
    const n = listUnread?.querySelectorAll('li').length || 0;
    badgeUnread.textContent = n ? `${n} sin leer` : 'Al día';
    badgeUnread.classList.toggle('bg-blue-50', n > 0);
    badgeUnread.classList.toggle('text-blue-700', n > 0);
    badgeUnread.classList.toggle('bg-emerald-50', n === 0);
    badgeUnread.classList.toggle('text-emerald-700', n === 0);
}
refreshUnreadBadge();

// marcar todo leído
document.getElementById('btnMarkAllRead')?.addEventListener('click', () => {
    [...listUnread.querySelectorAll('li')].forEach(li => {
        li.querySelector('span.h-2\\.5').classList.remove('bg-blue-600');
        li.querySelector('span.h-2\\.5').classList.add('bg-gray-300');
        // quitar botón mark-read / añadir mark-unread
        const actions = li.querySelector('[data-mark-read]')?.parentElement;
        if (actions) {
            actions.querySelector('[data-mark-read]')?.remove();
            const btn = document.createElement('button');
            btn.className = 'text-blue-700 hover:underline';
            btn.textContent = 'Marcar no leída';
            btn.setAttribute('data-mark-unread', '');
            actions.prepend(btn);
        }
        listRead.prepend(li);
    });
    refreshUnreadBadge();
});

// delegación en dropdown: marcar leído / no leído / ver todas
menuBell.addEventListener('click', (e) => {
    const t = e.target;
    if (t.matches('[data-open-all]')) { openAllModal(); }
    if (t.matches('[data-mark-read]')) {
        const li = t.closest('li');
        li.querySelector('span.h-2\\.5').classList.replace('bg-blue-600', 'bg-gray-300');
        // swap botones
        t.remove();
        const btn = document.createElement('button');
        btn.className = 'text-blue-700 hover:underline';
        btn.textContent = 'Marcar no leída';
        btn.setAttribute('data-mark-unread', '');
        li.querySelector('.mt-1.flex')?.prepend(btn);
        listRead.prepend(li);
        refreshUnreadBadge();
    }
    if (t.matches('[data-mark-unread]')) {
        const li = t.closest('li');
        li.querySelector('span.h-2\\.5').classList.replace('bg-gray-300', 'bg-blue-600');
        // swap botones
        t.remove();
        const btn = document.createElement('button');
        btn.className = 'text-blue-700 hover:underline';
        btn.textContent = 'Marcar leído';
        btn.setAttribute('data-mark-read', '');
        li.querySelector('.mt-1.flex')?.prepend(btn);
        listUnread.prepend(li);
        refreshUnreadBadge();
    }
});

// -------- Modal "Ver todas"
const mdAll = document.getElementById('md-all-notifs');
function openAllModal() { mdAll.classList.remove('hidden'); closeEl(menuBell); }
function closeAllModal() { mdAll.classList.add('hidden'); }

mdAll.addEventListener('click', (e) => {
    if (e.target.dataset.close === 'md-all-notifs') closeAllModal();
    if (e.target.closest('[data-close="md-all-notifs"]')) closeAllModal();
});

// abrir modal desde links del dropdown
document.querySelectorAll('[data-open-all]').forEach(b => b.addEventListener('click', openAllModal));

// filtros simples dentro del modal
document.querySelectorAll('#md-all-notifs [data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
        const mode = btn.dataset.filter; // all|unread|read
        document.querySelectorAll('#all-notifs-list [data-state]').forEach(card => {
            const st = card.dataset.state;
            card.style.display = (mode === 'all' || mode === st) ? '' : 'none';
        });
    });
});

// marcar (no) leído dentro del modal (solo estilos)
document.getElementById('all-notifs-list')?.addEventListener('click', (e) => {
    const t = e.target;
    const card = t.closest('[data-state]');
    if (!card) return;
    if (t.matches('[data-mark-read]')) {
        card.dataset.state = 'read';
        const dot = card.querySelector('span.h-2\\.5');
        dot.classList.replace('bg-blue-600', 'bg-gray-300');
        // sincronizar contador rápidamente (no movemos al dropdown en esta demo)
        refreshUnreadBadge();
    }
    if (t.matches('[data-mark-unread]')) {
        card.dataset.state = 'unread';
        const dot = card.querySelector('span.h-2\\.5');
        dot.classList.replace('bg-gray-300', 'bg-blue-600');
        refreshUnreadBadge();
    }
});