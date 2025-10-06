
// ===== DERECHO A GRADO: habilitar solo si Formulario = Revisado y Paz y Salvo = OK =====
document.addEventListener('DOMContentLoaded', () => {
    const $ = (s, el = document) => el.querySelector(s);

    // ---- 1) Detectores de estado (sin forzar nada) ----
    function datosPersonalesOK() {
        const pill = document.getElementById('st-formulario');
        return !!pill && /Revisado/i.test(pill.textContent || '');
    }

    function pazYSalvoOK() {
        // Si no hay selects aún, consideramos que aún no está listo => no habilitar
        const selects = document.querySelectorAll('#ps-list select[data-area]');
        if (selects.length === 0) return false;

        for (const sel of selects) {
            const hasDetalle = Array.from(sel.options).some(o => (o.value || '').startsWith('detalle:'));
            if (hasDetalle) return false;
        }
        return true;
    }

    function computeDGEnabled() {
        return datosPersonalesOK() && pazYSalvoOK();
    }

    // ---- 2) Pintar UI según el estado ----
    function setDGEnabledUI(enabled) {
        const section = document.getElementById('blk-derecho');
        const pill = document.getElementById('st-derecho');
        if (!section || !pill) return;

        if (enabled) {
            section.classList.remove('opacity-60', 'pointer-events-none');
            pill.className =
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 bg-emerald-50 text-emerald-700 ring-emerald-200';
            pill.innerHTML = '<span class="h-2 w-2 rounded-full bg-emerald-500"></span> Habilitado';
        } else {
            section.classList.add('opacity-60', 'pointer-events-none');
            pill.className =
                'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 bg-yellow-50 text-yellow-800 ring-yellow-200';
            pill.innerHTML = '<span class="h-2 w-2 rounded-full bg-yellow-500"></span> No habilitado';
        }
    }

    // Exponer por si otras secciones quieren refrescar manualmente
    window.refreshDerechoAGradoState = function () {
        setDGEnabledUI(computeDGEnabled());
    };

    // ---- 3) Observadores: re-evaluar cuando cambien Formulario o Paz y Salvo ----
    // 3a) Pill de Formulario
    const stFormulario = document.getElementById('st-formulario');
    if (stFormulario) {
        new MutationObserver(() => window.refreshDerechoAGradoState())
            .observe(stFormulario, { childList: true, characterData: true, subtree: true, attributes: true });
    }

    // 3b) Lista de Paz y Salvo
    const psList = document.getElementById('ps-list');
    if (psList) {
        new MutationObserver(() => window.refreshDerechoAGradoState())
            .observe(psList, { childList: true, subtree: true, attributes: true, characterData: false });
    }

    // 3c) Escucha un evento global opcional (si tu otro código lo dispara)
    window.addEventListener('estadoActualizado', () => window.refreshDerechoAGradoState());

    // ---- 4) Inicializar estado al cargar ----
    window.refreshDerechoAGradoState();

    // ---- 5) Modal: abrir/cerrar SOLO cuando está habilitado ----
    const modal = $('#dg-modal');
    const openModal = () => modal?.classList.remove('hidden');
    const closeModal = () => modal?.classList.add('hidden');

    $('#dg-btn-notificar')?.addEventListener('click', (e) => {
        e.preventDefault();
        if (!computeDGEnabled()) {
            // Si prefieres permitir abrir aun no habilitado, comenta el return:
            return alert('Aún no está habilitado: faltan datos personales o paz y salvo.');
        }
        openModal();
    });

    $('#dg-close')?.addEventListener('click', closeModal);
    $('#dg-cancel')?.addEventListener('click', closeModal);
    $('#dg-modal')?.addEventListener('click', (e) => { if (e.target.id === 'dg-modal') closeModal(); });

    $('#dg-send')?.addEventListener('click', () => {
        const msg = ($('#dg-text')?.value || '').trim();
        if (!msg) { alert('Escribe un mensaje para el estudiante.'); return; }
        // TODO: enviar al backend
        alert('Notificación enviada al estudiante.');
        $('#dg-text').value = '';
        closeModal();
    });
});
