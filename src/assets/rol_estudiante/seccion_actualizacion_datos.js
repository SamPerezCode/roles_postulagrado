// === Configuración de ejemplo (ajusta a tu backend después)
const DEADLINE_ISO = '2025-11-12';         // fecha límite para actualizar
const PROCESS_START_ISO = '2025-10-01';    // inicio del proceso (para comparar updates)
let lastUpdateISO = null;                  // null => no ha actualizado

// === Helpers
const $ = (s) => document.querySelector(s);
const fmtFecha = (d) => {
    const f = (d instanceof Date) ? d : new Date(d);
    return f.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
};

// === NUEVO: refs de secciones y función para alternar visibilidad
function toggleSections(isUpdated) {
    const secAct = $('#sec-actualiza');
    const secVer = $('#sec-verificacion');
    if (!secAct || !secVer) return;

    if (isUpdated) {
        secAct.classList.add('hidden');
        secVer.classList.remove('hidden');
    } else {
        secAct.classList.remove('hidden');
        secVer.classList.add('hidden');
    }
}

function renderActCard() {
    const msg = $('#act-msg');
    const det = $('#act-det');
    const btn = $('#btn-act');
    const badge = $('#badge-ok');

    const deadline = new Date(DEADLINE_ISO);
    const start = new Date(PROCESS_START_ISO);
    const updated = lastUpdateISO ? new Date(lastUpdateISO) : null;
    const isUpdated = !!(updated && updated >= start);

    if (isUpdated) {
        // Estado: Actualizado
        msg.textContent = `Tus datos fueron actualizados el ${fmtFecha(updated)}.`;
        det.textContent = '¡Gracias! Puedes volver a actualizar si necesitas corregir algo.';
        btn?.classList.add('hidden');
        badge?.classList.remove('hidden');
    } else {
        // Estado: Debe actualizar
        msg.textContent = `Debes verificar y actualizar tus datos antes del ${fmtFecha(deadline)}.`;
        det.textContent = 'Esta actualización es obligatoria para continuar con el proceso de grado.';
        btn?.classList.remove('hidden');
        badge?.classList.add('hidden');
    }

    // === NUEVO: aplicar regla de visibilidad
    toggleSections(isUpdated);
}

// Inicializa la tarjeta al cargar y enlaza el botón (simulación 5s)
document.addEventListener('DOMContentLoaded', () => {
    renderActCard();

    const btn = $('#btn-act');
    let updateTimer = null;

    if (btn) {
        // Ya abre en nueva pestaña gracias al target="_blank"
        btn.addEventListener('click', () => {
            // No hacemos e.preventDefault(): dejamos que se abra la nueva pestaña

            // Evita timers duplicados si el usuario hace múltiples clics
            if (updateTimer) clearTimeout(updateTimer);

            // Simulación: a los 5s marcamos como actualizado y alternamos secciones
            updateTimer = setTimeout(() => {
                lastUpdateISO = new Date().toISOString();
                renderActCard(); // esto llama a toggleSections(true)

                // Lleva el foco visual a la verificación (opcional)
                document.getElementById('sec-verificacion')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 2000);
        });
    }
});

