

(() => {
    // -------- Utils --------
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
    const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
    const mqDesktop = window.matchMedia("(min-width: 768px)"); // md

    const cls = {
        hidden: "hidden",
        drawerClosed: "translate-x-[-100%]",
        overlayShift: "left-72",
        // dropdown
        ddInvisible: ["invisible", "pointer-events-none", "opacity-0"],
        ddVisible: ["opacity-100"],
        // desktop collapse
        mdW64: "md:w-64",
        mdW0: "md:w-0",
    };

    // -------- Dropdowns (campana / usuario) --------
    function initDropdowns() {
        const btnBell = $("#btnBell");
        const menuBell = $("#menuBell");
        const btnUser = $("#btnUser");
        const menuUser = $("#menuUser");

        if (!btnBell || !menuBell || !btnUser || !menuUser) return;

        const closeMenu = (menu, btn) => {
            menu.classList.add(...cls.ddInvisible);
            menu.classList.remove(...cls.ddVisible);
            btn.setAttribute("aria-expanded", "false");
        };

        const toggleMenu = (btn, menu) => {
            const open = menu.classList.contains("opacity-100");
            btn.setAttribute("aria-expanded", String(!open));
            menu.classList.toggle("invisible");
            menu.classList.toggle("pointer-events-none");
            menu.classList.toggle("opacity-0");
            menu.classList.toggle("opacity-100");
            menu.classList.toggle("translate-y-1");
        };

        on(btnBell, "click", (e) => {
            e.stopPropagation();
            toggleMenu(btnBell, menuBell);
            closeMenu(menuUser, btnUser);
        });

        on(btnUser, "click", (e) => {
            e.stopPropagation();
            toggleMenu(btnUser, menuUser);
            closeMenu(menuBell, btnBell);
        });

        // click fuera
        on(document, "click", () => {
            closeMenu(menuBell, btnBell);
            closeMenu(menuUser, btnUser);
        });
    }

    // -------- Sidebar (desktop collapse + mobile drawer) --------
    function initSidebar() {
        const btnSidebar = $("#btnSidebar");
        const sidebar = $("#sidebar");
        const overlay = $("#overlay");

        if (!btnSidebar || !sidebar || !overlay) return;

        let collapsed = false;

        const openMobileSidebar = () => {
            sidebar.classList.remove(cls.drawerClosed);
            overlay.classList.remove(cls.hidden);
            overlay.classList.add(cls.overlayShift); // no cubre el sidebar
            document.body.classList.add("overflow-hidden");
        };

        const closeMobileSidebar = () => {
            sidebar.classList.add(cls.drawerClosed);
            overlay.classList.add(cls.hidden);
            overlay.classList.remove(cls.overlayShift);
            document.body.classList.remove("overflow-hidden");
        };

        const toggleDesktopSidebar = () => {
            collapsed = !collapsed;
            if (collapsed) {
                sidebar.classList.remove(cls.mdW64);
                sidebar.classList.add(cls.mdW0);
            } else {
                sidebar.classList.remove(cls.mdW0);
                sidebar.classList.add(cls.mdW64);
            }
        };

        on(btnSidebar, "click", () => {
            if (mqDesktop.matches) {
                toggleDesktopSidebar();
            } else {
                const isOpen = !sidebar.classList.contains(cls.drawerClosed);
                isOpen ? closeMobileSidebar() : openMobileSidebar();
            }
            // quita el focus visual
            btnSidebar.blur();
        });

        on(overlay, "click", closeMobileSidebar);

        // reset por cambio de breakpoint
        mqDesktop.addEventListener("change", (e) => {
            if (e.matches) {
                // entramos a desktop
                closeMobileSidebar();
                sidebar.classList.add(cls.mdW64);
                sidebar.classList.remove(cls.mdW0);
            } else {
                // entramos a móvil
                collapsed = false;
            }
        });
    }

    // -------- Accordion (cards móviles) --------
    function initAccordion() {
        const root = $("#cardsProcesos");
        if (!root) return;

        on(root, "click", (e) => {
            const trigger = e.target.closest('[data-accordion="trigger"]');
            if (!trigger) return;

            const item = trigger.closest('[data-accordion="item"]');
            const panel = $('[data-accordion="panel"]', item);
            const chevron = $('[data-accordion="chevron"]', item);

            const isOpen = trigger.getAttribute("aria-expanded") === "true";

            // cerrar todos
            $$
                ('[data-accordion="item"]', root)
                .forEach((el) => {
                    const t = $('[data-accordion="trigger"]', el);
                    const p = $('[data-accordion="panel"]', el);
                    const c = $('[data-accordion="chevron"]', el);
                    el.dataset.open = "false";
                    t && t.setAttribute("aria-expanded", "false");
                    if (p) p.style.maxHeight = null;
                    c && c.classList.remove("rotate-180");
                });

            // abrir seleccionado si estaba cerrado
            if (!isOpen) {
                item.dataset.open = "true";
                trigger.setAttribute("aria-expanded", "true");
                panel.style.maxHeight = panel.scrollHeight + "px";
                chevron && chevron.classList.add("rotate-180");
            }
        });

        // prevenir alturas congeladas al redimensionar
        on(window, "resize", () => {
            $$('[data-accordion="panel"]', root).forEach((p) => (p.style.maxHeight = null));
            $$('[data-accordion="item"]', root).forEach((i) => (i.dataset.open = "false"));
            $$('[data-accordion="trigger"]', root).forEach((t) => t.setAttribute("aria-expanded", "false"));
            $$('[data-accordion="chevron"]', root).forEach((c) => c.classList.remove("rotate-180"));
        });
    }

    // -------- Init --------
    function init() {
        initDropdowns();
        initSidebar();
        initAccordion();
    }

    // monta cuando el DOM esté listo
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init, { once: true });
    } else {
        init();
    }
})();
