// src/assets/sidebar-active.js
(function () {
    const list = document.querySelector('#sidebar nav ul');
    if (!list) return;

    const ACTIVE_ADD = ['bg-white/15', 'text-white', 'font-semibold'];
    const ACTIVE_REMOVE = ['text-blue-100', 'hover:bg-white/10'];
    const INACTIVE_ADD = ['text-blue-100', 'hover:bg-white/10'];
    const INACTIVE_REMOVE = ['bg-white/15', 'text-white', 'font-semibold'];

    function ensureIndicator(a) {
        let ind = a.querySelector('[data-indicator]');
        if (!ind) {
            ind = document.createElement('span');
            ind.setAttribute('data-indicator', '');
            ind.className = 'absolute left-0 top-0 h-full w-1 bg-white rounded-tl-full rounded-bl-full opacity-0';
            a.prepend(ind);
        }
        return ind;
    }

    function activate(link) {
        list.querySelectorAll('a').forEach(a => {
            a.classList.remove(...INACTIVE_REMOVE, ...ACTIVE_ADD);
            a.classList.add(...INACTIVE_ADD);
            a.removeAttribute('aria-current');
            ensureIndicator(a).classList.add('opacity-0');
        });
        link.classList.remove(...ACTIVE_REMOVE, ...INACTIVE_REMOVE);
        link.classList.add(...ACTIVE_ADD);
        link.setAttribute('aria-current', 'page');
        ensureIndicator(link).classList.remove('opacity-0');
        setTimeout(() => link.blur(), 0);
    }

    // === Inicial: casar por URL ===
    const links = Array.from(list.querySelectorAll('a[href]'))
        .filter(a => a.getAttribute('href') && a.getAttribute('href') !== '#'); // ignorar "#"

    const current = links.find(a => {
        const u = new URL(a.getAttribute('href'), location.href);
        return u.pathname.replace(/\/+$/, '') === location.pathname.replace(/\/+$/, '');
    });

    const initial =
        current ||
        list.querySelector('a[aria-current="page"]') || // fallback si lo defines en el HTML
        links[0];

    if (initial) {
        ensureIndicator(initial);
        activate(initial);
    }

    // === Clicks: solo prevenir si es hash ===
    list.addEventListener('click', e => {
        const link = e.target.closest('a[href]');
        if (!link) return;

        // respetar nueva pestaña
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;

        const href = link.getAttribute('href') || '';
        if (href === '#' || href.startsWith('#')) {
            e.preventDefault();
            activate(link);
            return;
        }

        // no hacemos preventDefault: deja navegar
        // si quisieras cerrar el sidebar aquí, hazlo sin bloquear la navegación
    });
})();
