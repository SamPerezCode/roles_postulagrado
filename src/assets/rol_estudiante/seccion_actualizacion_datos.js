
// === Configuración de ejemplo (ajusta a tu backend después)
const DEADLINE_ISO = '2025-11-12';         // fecha límite para actualizar
const PROCESS_START_ISO = '2025-10-01';    // inicio del proceso (para comparar updates)
// Si ya se actualizó, coloca una fecha; si no, null
// Ejemplos:
// let lastUpdateISO = null;                              // No ha actualizado
// let lastUpdateISO = '2025-10-05T09:10:00-05:00';       // Sí actualizó
let lastUpdateISO = null;

// === Helpers
const $ = (s) => document.querySelector(s);
const fmtFecha = (d) => {
    const f = (d instanceof Date) ? d : new Date(d);
    return f.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
};

function renderActCard() {
    const msg = $('#act-msg');
    const det = $('#act-det');
    const btn = $('#btn-act');
    const badge = $('#badge-ok');

    const deadline = new Date(DEADLINE_ISO);
    const start = new Date(PROCESS_START_ISO);
    const updated = lastUpdateISO ? new Date(lastUpdateISO) : null;

    if (updated && updated >= start) {
        // Estado: Actualizado
        msg.textContent = `Tus datos fueron actualizados el ${fmtFecha(updated)}.`;
        det.textContent = '¡Gracias! Puedes volver a actualizar si necesitas corregir algo.';
        btn.classList.add('hidden');
        badge.classList.remove('hidden');
    } else {
        // Estado: Debe actualizar
        msg.textContent = `Debes verificar y actualizar tus datos antes del ${fmtFecha(deadline)}.`;
        det.textContent = 'Esta actualización es obligatoria para continuar con el proceso de grado.';
        btn.classList.remove('hidden');
        badge.classList.add('hidden');
    }
}

// Inicializa la tarjeta al cargar
document.addEventListener('DOMContentLoaded', renderActCard);

