
// Confirmación simple (puedes cambiar por SweetAlert si quieres)
document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-del]');
    if (!btn) return;
    const ok = confirm('¿Eliminar este documento? Esta acción no se puede deshacer.');
    if (ok) {
        // aquí iría la llamada al backend; por ahora demo:
        // elimina visualmente el ítem
        const row = btn.closest('tr') || btn.closest('li');
        row?.remove();
    }
});

