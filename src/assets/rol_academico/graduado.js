
// ===== Graduado (informativo): se marca "Graduado" si las 3 previas están OK =====
document.addEventListener('DOMContentLoaded', () => {
    // 1) Lectores de estado (no forzamos nada)
    function isFormularioRevisado() {
        const pill = document.getElementById('st-formulario');
        return !!pill && /Revisado/i.test(pill.textContent || '');
    }
    function isPazYSalvoOK() {
        const selects = document.querySelectorAll('#ps-list select[data-area]');
        if (selects.length === 0) return false; // aún no hay datos => no graduado
        for (const sel of selects) {
            const hasDetalle = Array.from(sel.options).some(o => (o.value || '').startsWith('detalle:'));
            if (hasDetalle) return false;
        }
        return true;
    }
    function isDerechoAGradoHabilitado() {
        const blk = document.getElementById('blk-derecho');
        const pill = document.getElementById('st-derecho');
        const pillOk = !!pill && /Habilitado/i.test(pill.textContent || '');
        const noBloq = !!blk && !blk.classList.contains('pointer-events-none');
        return pillOk || noBloq;
    }
    function isGraduado() {
        return isFormularioRevisado() && isPazYSalvoOK() && isDerechoAGradoHabilitado();
    }

    // 2) Pintar UI (informativo)
    function paintGraduado() {
        const section = document.getElementById('blk-graduado');
        const pill = document.getElementById('st-graduado');
        if (!section || !pill) return;

        if (isGraduado()) {
            // Visual “habilitado” y pill verde: Graduado
            section.classList.remove('opacity-60', 'pointer-events-none');
            pill.className = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 bg-emerald-50 text-emerald-700 ring-emerald-200';
            pill.innerHTML = '<span class="h-2 w-2 rounded-full bg-emerald-500"></span> Graduado';
        } else {
            // Visual atenuado e informativo: No graduado
            section.classList.add('opacity-60', 'pointer-events-none');
            pill.className = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 bg-gray-100 text-gray-700 ring-gray-200';
            pill.innerHTML = '<span class="h-2 w-2 rounded-full bg-gray-300"></span> No graduado';
        }
    }

    // 3) Observar cambios en las 3 secciones previas
    const stFormulario = document.getElementById('st-formulario');
    if (stFormulario) {
        new MutationObserver(paintGraduado)
            .observe(stFormulario, { childList: true, characterData: true, subtree: true, attributes: true });
    }
    const psList = document.getElementById('ps-list');
    if (psList) {
        new MutationObserver(paintGraduado)
            .observe(psList, { childList: true, subtree: true, attributes: true });
    }
    const stDerecho = document.getElementById('st-derecho');
    const blkDerecho = document.getElementById('blk-derecho');
    if (stDerecho) {
        new MutationObserver(paintGraduado)
            .observe(stDerecho, { childList: true, characterData: true, subtree: true, attributes: true });
    }
    if (blkDerecho) {
        new MutationObserver(paintGraduado)
            .observe(blkDerecho, { attributes: true, attributeFilter: ['class'] });
    }

    // 4) Evento global opcional que ya usas en otras secciones
    window.addEventListener('estadoActualizado', paintGraduado);

    // 5) Inicializar
    paintGraduado();
});
