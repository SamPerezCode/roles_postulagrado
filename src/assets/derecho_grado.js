// === Derecho a grado: se habilita cuando checklist y pazysalvo están OK ===
(() => {
    const $ = (id) => document.getElementById(id);

    let areasOk = false;
    let checklistOk = false;

    // Nodos dentro del bloque
    const pill = document.querySelector('#blk-derecho #st-derecho') || document.createElement('span');
    const blk = document.getElementById('blk-derecho');

    const btnNotif = document.getElementById('btn-enviar-instrucciones');
    const btnOrden = document.getElementById('btn-ver-orden');
    const btnPago = document.getElementById('btn-registrar-pago');

    function setEnabled(enabled) {
        if (!blk) return;

        if (enabled) {
            // habilitar
            blk.classList.remove('opacity-60', 'pointer-events-none');
            if (pill) {
                pill.className = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 bg-emerald-50 text-emerald-800 ring-emerald-200';
                pill.innerHTML = '<span class="h-2 w-2 rounded-full bg-emerald-500"></span> OK';
            }
            btnNotif?.removeAttribute('disabled');
            btnOrden?.removeAttribute('disabled');
            btnPago?.removeAttribute('disabled');
        } else {
            // bloquear
            blk.classList.add('opacity-60', 'pointer-events-none');
            if (pill) {
                pill.className = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 bg-yellow-50 text-yellow-800 ring-yellow-200';
                pill.innerHTML = '<span class="h-2 w-2 rounded-full bg-yellow-500"></span> Pendiente';
            }
            btnNotif?.setAttribute('disabled', '');
            btnOrden?.setAttribute('disabled', '');
            btnPago?.setAttribute('disabled', '');
        }
    }

    function recompute() {
        setEnabled(areasOk && checklistOk);
    }

    // Escuchar eventos de los otros módulos
    document.addEventListener('pazysalvo:updated', (e) => {
        areasOk = !!(e.detail && e.detail.allOk);
        recompute();
    });

    document.addEventListener('checklist:updated', (e) => {
        checklistOk = !!(e.detail && e.detail.allReviewed);
        recompute();
    });

    // Estado inicial (bloqueado hasta recibir ambos OK)
    setEnabled(false);
})();

// Opción A: callback global (lo llamo desde psRefreshGlobalPill)
window.onPazYSalvoOk = function (allOk) {
    // si además tu checklist está OK, habilita el bloque:
    enableDerechoGrado(allOk && checklistOk);
};