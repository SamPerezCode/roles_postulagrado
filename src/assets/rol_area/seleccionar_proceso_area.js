document.addEventListener('DOMContentLoaded', () => {
    const procEl = document.getElementById('ps-proc');
    const mountEl = document.getElementById('prog-mount');
    const btnClear = document.getElementById('ps-clear');

    const PROGRAMAS_BY_PROC = {
        '2025-03': [
            { id: 'DER-ESP-DIP', nombre: 'Especialización Derecho Internacional Público' },
            { id: 'ADM-ESP-GRH', nombre: 'Especialización en Gestión del Recurso Humano' },
            { id: 'ENF-ESP-UCI', nombre: 'Especialización en Cuidado Crítico (UCI)' },
            { id: 'ODT-PRE', nombre: 'Odontología' },
            { id: 'DER-PRE', nombre: 'Derecho' },
        ]
    };

    let programRendered = false;
    let progEl = null;

    function renderProgramSelect() {
        if (programRendered) return;
        programRendered = true;
        mountEl.innerHTML = `
      <label for="ps-prog" class="block text-sm font-medium text-gray-700">Programa</label>
      <select id="ps-prog"
        class="mt-1 w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
        <option value="">Seleccionar…</option>
      </select>
      <p class="mt-1 text-xs text-gray-500">Selecciona un programa ver los estudiantes relacionados.</p>
    `;
        progEl = document.getElementById('ps-prog');

        progEl.addEventListener('change', () => {
            const proc = procEl.value || '';
            const prog = progEl.value || '';
            if (!proc || !prog) return;
            window.location.href = `detalle_proceso_paz_salvo.html?proc=${encodeURIComponent(proc)}&prog=${encodeURIComponent(prog)}`;
        });
    }

    function fillProgramas(proc) {
        if (!progEl) return;
        progEl.innerHTML = '<option value="">Seleccionar…</option>';
        const items = PROGRAMAS_BY_PROC[proc] || [];
        for (const p of items) {
            const opt = document.createElement('option');
            opt.value = p.id;
            opt.textContent = p.nombre;
            progEl.appendChild(opt);
        }
        progEl.disabled = items.length === 0;
    }

    // Solo al seleccionar una opción del proceso
    procEl.addEventListener('change', () => {
        const proc = procEl.value;
        if (!proc) return;           // aún en placeholder
        renderProgramSelect();
        fillProgramas(proc);
        if (progEl) progEl.value = '';
    });

    // Limpiar: vuelve al placeholder y oculta Programa
    btnClear?.addEventListener('click', () => {
        procEl.value = '';           // vuelve al "Seleccionar…"
        mountEl.innerHTML = '';
        programRendered = false;
        progEl = null;
        procEl.focus();
    });
});