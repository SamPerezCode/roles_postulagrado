// src/assets/sidebar-active.js
(function () {
    const list = document.querySelector('#sidebar nav ul');
    if (!list) return;

    const ACTIVE_ADD = ['bg-white/15', 'text-white', 'font-semibold'];
    const ACTIVE_REMOVE = ['text-blue-100', 'hover:bg-white/10'];
    const INACTIVE_ADD = ['text-blue-100', 'hover:bg-white/10'];
    const INACTIVE_REMOVE = ['bg-white/15', 'text-white', 'font-semibold'];

    function activate(link) {
        list.querySelectorAll('a').forEach(a => {
            a.classList.remove(...INACTIVE_REMOVE, ...ACTIVE_ADD);
            a.classList.add(...INACTIVE_ADD);
            a.removeAttribute('aria-current');
        });
        link.classList.remove(...ACTIVE_REMOVE, ...INACTIVE_REMOVE);
        link.classList.add(...ACTIVE_ADD);
        link.setAttribute('aria-current', 'page');
        setTimeout(() => link.blur(), 0);
    }

    // === Inicial: casar por URL ===
    const links = Array.from(list.querySelectorAll('a[href]'))
        .filter(a => a.getAttribute('href') && a.getAttribute('href') !== '#');

    const current = links.find(a => {
        const u = new URL(a.getAttribute('href'), location.href);
        return u.pathname.replace(/\/+$/, '') === location.pathname.replace(/\/+$/, '');
    });

    const initial =
        current ||
        list.querySelector('a[aria-current="page"]') ||
        links[0];

    if (initial) {
        activate(initial);
    }

    // === Clicks: solo prevenir si es hash ===
    list.addEventListener('click', e => {
        const link = e.target.closest('a[href]');
        if (!link) return;

        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;

        const href = link.getAttribute('href') || '';
        if (href === '#' || href.startsWith('#')) {
            e.preventDefault();
            activate(link);
            return;
        }
    });
})();
