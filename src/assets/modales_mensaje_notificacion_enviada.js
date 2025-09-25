// helpers modales
function showModal(id) { const m = document.getElementById(id); if (!m) return; m.classList.remove('hidden'); m.classList.add('flex'); }
function hideModal(id) { const m = document.getElementById(id); if (!m) return; m.classList.add('hidden'); m.classList.remove('flex'); }

// cerrar por overlay / X
document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-close]');
    if (!target) return;
    hideModal(target.getAttribute('data-close'));
});

// ABRIR confirmación desde el botón principal
function openConfirmSendModal() { showModal('md-confirm-send'); }

// Al confirmar: muestra "Enviando...", simula petición y termina en "Enviado"
function confirmSendLinks() {
    hideModal('md-confirm-send');
    showModal('md-sending');

    // Cuenta total (desde la tabla del modal de vinculados). Ajusta el selector si tu tabla difiere:
    const total = document.querySelectorAll('#tabla-estudiantes-vinculados-proceso tbody tr').length
        || Number(document.getElementById('total-vinculados')?.textContent) || 0;

    // Simulación de envío async (reemplaza este setTimeout por tu fetch real)
    setTimeout(() => {
        // si usas fetch: cuando resuelva OK, continúa:
        hideModal('md-sending');
        // Actualiza el texto con el total
        document.getElementById('md-sent-detail').textContent = `Solicitudes enviadas: ${total}/${total}`;
        showModal('md-sent');
    }, 1400);
}