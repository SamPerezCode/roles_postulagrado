(function () {
    const openBtn = document.getElementById('btnEnviarEnlace');
    const modal = document.getElementById('confirmEnviar');
    const overlay = document.getElementById('confirmEnviarOverlay');
    const confirmBt = document.getElementById('btnConfirmEnviar');
    const cancelBt = document.getElementById('btnCancelEnviar');

    function openConfirm() {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }
    function closeConfirm() {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    }

    openBtn?.addEventListener('click', openConfirm);
    overlay?.addEventListener('click', closeConfirm);
    cancelBt?.addEventListener('click', closeConfirm);

    // “Enviar”: aquí solo cerramos; si luego conectas a backend, haz fetch y al resolver cierras.
    confirmBt?.addEventListener('click', () => {
        // TODO: fetch(...) si quieres realmente enviar
        closeConfirm();
    });

    // Esc para cerrar
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeConfirm();
    });
})();