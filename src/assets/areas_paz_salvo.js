(() => {
    // ====== Estado demo por área (ajústalo a tus datos reales)
    const psEstado = {
        "Financiera": "pendiente",
        "Admisiones": "ok",
        "Biblioteca": "observacion",
        "Recursos educativos": "pendiente",
        "Centro de idiomas": "ok",
    };

    // ====== Referencias al modal (sin colisionar con otros)
    const psModalEl = document.getElementById('ps-modal');
    const psTextEl = document.getElementById('ps-text');
    const psTitleEl = document.getElementById('ps-modal-title');
    const psBtnClose = document.getElementById('ps-close');
    const psBtnCancel = document.getElementById('ps-cancel');
    const psBtnSend = document.getElementById('ps-send');
    let psCurrentArea = null;

    // ====== Helpers de UI del modal (namespaced)
    function psOpenModal(area) {
        psCurrentArea = area;
        psTitleEl.textContent = `Notificar área · ${area}`;
        psTextEl.value = '';
        psModalEl.classList.remove('hidden');
    }
    function psCloseModal() {
        psModalEl.classList.add('hidden');
    }

    // Cerrar modal
    psBtnClose?.addEventListener('click', psCloseModal);
    psBtnCancel?.addEventListener('click', psCloseModal);
    psModalEl?.addEventListener('click', (e) => { if (e.target === psModalEl) psCloseModal(); });

    // Enviar notificación (integra tu backend aquí)
    psBtnSend?.addEventListener('click', () => {
        const msg = psTextEl.value.trim();
        if (!msg) return;
        console.log('[PS] Notificar área', { area: psCurrentArea, mensaje: msg });
        // Si tienes bitácora:
        if (typeof addToLog === 'function') {
            addToLog(`Notificación enviada a ${psCurrentArea}: ${msg}`);
        }
        psCloseModal();
    });

    // Wire por tarjeta
    document.querySelectorAll('#ps-areas article').forEach(card => {
        const area = card.dataset.area;

        card.querySelector('.ps-notificar')?.addEventListener('click', () => psOpenModal(area));
        card.querySelector('.ps-detalle')?.addEventListener('click', () => {
            alert(`Detalle de ${area} (demo)`);
        });
        card.querySelector('.ps-observar')?.addEventListener('click', () => {
            alert(`Registrar observación para ${area} (demo)`);
        });
    });

    // Pill general
    function refreshPsPill() {
        const pill = document.getElementById('st-pazysalvo');
        const vals = Object.values(psEstado);
        const tienePend = vals.includes('pendiente');
        const tieneObs = vals.includes('observacion');

        if (!tienePend && !tieneObs) {
            pill.className = "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 bg-emerald-50 text-emerald-800 ring-emerald-200";
            pill.innerHTML = '<span class="h-2 w-2 rounded-full bg-emerald-500"></span> OK';
        } else if (tieneObs && !tienePend) {
            pill.className = "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 bg-orange-50 text-orange-800 ring-orange-200";
            pill.innerHTML = '<span class="h-2 w-2 rounded-full bg-orange-500"></span> Observación';
        } else {
            pill.className = "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 bg-yellow-50 text-yellow-800 ring-yellow-200";
            pill.innerHTML = '<span class="h-2 w-2 rounded-full bg-yellow-500"></span> Pendiente';
        }
    }
    refreshPsPill();

    // Botones globales
    document.getElementById('btn-refrescar-areas')?.addEventListener('click', refreshPsPill);
    document.getElementById('btn-notificar-areas')?.addEventListener('click', () => psOpenModal('Todas las áreas'));
})();

// ===== Helpers de estilo (no rompen lo existente) =====
function psClassForCard(state) {
    switch ((state || '').toLowerCase()) {
        case 'ok': return 'bg-emerald-50 ring-emerald-200';
        case 'observacion':
        case 'warn':
            return 'bg-orange-50 ring-orange-200';
        case 'error':
        case 'bloqueo':
        case 'rojo':
            return 'bg-rose-50 ring-rose-200';
        default: return 'bg-yellow-50 ring-yellow-200'; // pendiente
    }
}
function psClassForChip(state) {
    switch ((state || '').toLowerCase()) {
        case 'ok': return 'bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200';
        case 'observacion':
        case 'warn':
            return 'bg-orange-100 text-orange-800 ring-1 ring-orange-200';
        case 'error':
        case 'bloqueo':
        case 'rojo':
            return 'bg-rose-100 text-rose-800 ring-1 ring-rose-200';
        default: return 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200';
    }
}
function psTextForChip(state) {
    switch ((state || '').toLowerCase()) {
        case 'ok': return 'OK';
        case 'observacion':
        case 'warn': return 'Observación';
        case 'error':
        case 'bloqueo': return 'Bloqueo';
        default: return 'Pendiente';
    }
}

// ===== Aplica estado visual a UNA tarjeta (card) =====
function psApplyStateToCard(card, state) {
    if (!card) return;
    // Card
    card.className = `rounded-xl px-3 py-3 ring-1 ${psClassForCard(state)}`;
    // Chip
    const chip = card.querySelector('.ps-chip');
    if (chip) {
        chip.className = `ps-chip inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${psClassForChip(state)}`;
        chip.textContent = psTextForChip(state);
    }
}

// ===== Recalcula el pill global sin tocar tu lógica =====
function psRefreshGlobalPill(psEstado) {
    const pill = document.getElementById('st-pazysalvo');
    if (!pill) return;

    const vals = Object.values(psEstado).map(v => (v || '').toLowerCase());
    const allOk = vals.length > 0 && vals.every(v => v === 'ok');
    const hasPend = vals.includes('pendiente');
    const hasObs = vals.includes('observacion') || vals.includes('warn') || vals.includes('observación');

    if (allOk) {
        pill.className = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 bg-emerald-50 text-emerald-800 ring-emerald-200';
        pill.innerHTML = '<span class="h-2 w-2 rounded-full bg-emerald-500"></span> OK';
    } else if (!hasPend && hasObs) {
        pill.className = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 bg-orange-50 text-orange-800 ring-orange-200';
        pill.innerHTML = '<span class="h-2 w-2 rounded-full bg-orange-500"></span> Observación';
    } else {
        pill.className = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 bg-yellow-50 text-yellow-800 ring-yellow-200';
        pill.innerHTML = '<span class="h-2 w-2 rounded-full bg-yellow-500"></span> Pendiente';
    }

    function psRefreshGlobalPill(psEstado) {
        const pill = document.getElementById('st-pazysalvo');
        const vals = Object.values(psEstado).map(v => (v || '').toLowerCase());
        const allOk = vals.length > 0 && vals.every(v => v === 'ok');
        const hasPend = vals.includes('pendiente');
        const hasObs = vals.includes('observacion') || vals.includes('observación') || vals.includes('warn');

        if (allOk) {
            pill.className = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 bg-emerald-50 text-emerald-800 ring-emerald-200';
            pill.innerHTML = '<span class="h-2 w-2 rounded-full bg-emerald-500"></span> OK';
        } else if (!hasPend && hasObs) {
            pill.className = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 bg-orange-50 text-orange-800 ring-orange-200';
            pill.innerHTML = '<span class="h-2 w-2 rounded-full bg-orange-500"></span> Observación';
        } else {
            pill.className = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 bg-yellow-50 text-yellow-800 ring-yellow-200';
            pill.innerHTML = '<span class="h-2 w-2 rounded-full bg-yellow-500"></span> Pendiente';
        }

        // 🔔 Notifica a Derecho a grado (y a quien quiera escuchar)
        document.dispatchEvent(new CustomEvent('pazysalvo:updated', { detail: { allOk } }));
    }

}

// ====== BOTÓN: Marcar todo OK ======
document.getElementById('btn-ps-ok-todo')?.addEventListener('click', () => {
    // 1) Si ya manejas un objeto con estados, recógelo; si no, créalo al vuelo:
    //    Intenta reusar el que ya tienes:
    let estados = window.psEstado;
    if (!estados) {
        estados = {};
        document.querySelectorAll('#ps-areas article').forEach(card => {
            const area = card.dataset.area?.trim() || '';
            if (area) estados[area] = 'ok';
        });
        window.psEstado = estados; // para reutilizar después
    } else {
        // set a ok en tu objeto actual
        Object.keys(estados).forEach(k => estados[k] = 'ok');
    }

    // 2) Pinta cada tarjeta con OK
    document.querySelectorAll('#ps-areas article').forEach(card => psApplyStateToCard(card, 'ok'));

    // 3) Actualiza el pill global
    psRefreshGlobalPill(estados);
});

// === Botón "Dar OK" por tarjeta de Paz y Salvo (Tailwind-only) ===
(() => {
    const WRAP = document.getElementById('ps-areas');
    if (!WRAP) return;

    // Lee el estado actual desde el chip
    const parseStatus = (chip) => {
        const t = chip?.textContent.trim().toLowerCase() || '';
        if (t.includes('ok')) return 'ok';
        if (t.includes('observ')) return 'observacion';
        return 'pendiente';
    };

    // Aplica clases/etiquetas según estado
    function applyCardStatus(card, status) {
        const chip = card.querySelector('.ps-chip');
        // reset contenedor
        card.className = 'rounded-xl px-3 py-3 ring-1';
        if (status === 'ok') {
            card.classList.add('bg-emerald-50', 'ring-emerald-200');
            chip.className = 'ps-chip inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200';
            chip.textContent = 'OK';
        } else if (status === 'observacion') {
            card.classList.add('bg-orange-50', 'ring-orange-200');
            chip.className = 'ps-chip inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium bg-orange-100 text-orange-800 ring-1 ring-orange-200';
            chip.textContent = 'Observación';
        } else {
            card.classList.add('bg-yellow-50', 'ring-yellow-200');
            chip.className = 'ps-chip inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200';
            chip.textContent = 'Pendiente';
        }

        // Mostrar/ocultar el botón "Dar OK" en esta tarjeta
        const okBtn = card.querySelector('.ps-make-ok');
        if (okBtn) okBtn.classList.toggle('hidden', status === 'ok');

        refreshGlobalPill();
    }

    // Actualiza el pill general del bloque
    function refreshGlobalPill() {
        const pill = document.getElementById('st-pazysalvo');
        const statuses = [...WRAP.querySelectorAll('.ps-chip')].map(parseStatus);
        const allOk = statuses.length > 0 && statuses.every(s => s === 'ok');
        const hasPend = statuses.includes('pendiente');
        const hasObs = statuses.includes('observacion');

        if (allOk) {
            pill.className = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 bg-emerald-50 text-emerald-800 ring-emerald-200';
            pill.innerHTML = '<span class="h-2 w-2 rounded-full bg-emerald-500"></span> OK';
        } else if (!hasPend && hasObs) {
            pill.className = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 bg-orange-50 text-orange-800 ring-orange-200';
            pill.innerHTML = '<span class="h-2 w-2 rounded-full bg-orange-500"></span> Observación';
        } else {
            pill.className = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 bg-yellow-50 text-yellow-800 ring-yellow-200';
            pill.innerHTML = '<span class="h-2 w-2 rounded-full bg-yellow-500"></span> Pendiente';
        }

        // opcional: emite evento para módulos que lo usen (Derecho a grado, etc.)
        document.dispatchEvent(new CustomEvent('pazysalvo:updated', {
            detail: {
                allOk
            }
        }));
    }

    // Inyecta el botón “Dar OK” en cada tarjeta (solo visible si no está en OK)
    [...WRAP.querySelectorAll('article')].forEach((card) => {
        const actions = card.querySelector('.mt-2') || card; // contenedor de botones
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ps-make-ok px-2 py-1 text-xs rounded-md bg-emerald-600 text-white hover:bg-emerald-700';
        btn.textContent = 'Dar OK';
        actions.appendChild(btn);

        // visibilidad inicial
        const st = parseStatus(card.querySelector('.ps-chip'));
        if (st === 'ok') btn.classList.add('hidden');

        // al hacer click → pone la tarjeta en OK
        btn.addEventListener('click', () => applyCardStatus(card, 'ok'));
    });

    // primera evaluación del pill general
    refreshGlobalPill();

    // expón helper por si quieres marcar una tarjeta por código:
    window.psSetAreaStatus = (area, status) => {
        const card = [...WRAP.querySelectorAll('article')].find(a => a.dataset.area === area);
        if (card) applyCardStatus(card, (status || '').toLowerCase());
    };
})();

(() => {
    // Demo: pendientes asociados a cada área
    const psPendientes = {
        "Financiera": ["Pago pendiente", "Comprobante no cargado"],
        "Admisiones": [],
        "Biblioteca": ["Multa pendiente"],
        "Recursos educativos": ["Devolución de libro"],
        "Centro de idiomas": []
    };

    // Mostrar/ocultar botón según estado
    document.querySelectorAll('#ps-areas article').forEach(card => {
        const area = card.dataset.area;
        const btnPend = card.querySelector('.ps-pendientes');
        const pendientes = psPendientes[area] || [];

        if (pendientes.length > 0) {
            btnPend.classList.remove('hidden');
            btnPend.querySelector('.count').textContent = `(${pendientes.length})`;

            btnPend.addEventListener('click', () => {
                // Aquí puedes cambiar alert() por un modal real
                alert(`Pendientes en ${area}:\n\n- ${pendientes.join('\n- ')}`);
            });
        }
    });
})();

