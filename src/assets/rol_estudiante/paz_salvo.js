
(function () {
    // Ejemplo. Sustituye por lo que te dé el backend si ya lo tienes.
    // ok=true -> “OK”; ok=false -> “Pendiente” (clickeable para ver detalle)
    const AREAS = [
        { id: 'adm', nombre: 'Admisiones', ok: true, pendientes: [] },
        { id: 'fin', nombre: 'Financiera', ok: false, pendientes: ['Saldo pendiente en caja.'] },
        { id: 'bib', nombre: 'Biblioteca', ok: false, pendientes: ['Devolución de libro: “Metodología de la investigación”.'] },
        { id: 'sec', nombre: 'Secretaría Académica', ok: true, pendientes: [] },
        { id: 'prog', nombre: 'Programa Académico', ok: true, pendientes: [] },
    ];

    const tbody = document.querySelector('#areas-table tbody');

    const chipOK = () =>
        `<span class="inline-flex rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-2 py-0.5 text-[11px] font-semibold">OK</span>`;

    const chipPend = (idx) =>
        `<button data-pend="${idx}"
           title="Ver detalle de pendientes"
           aria-label="Ver detalle de pendientes"
           aria-haspopup="dialog"
           class="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200 px-2.5 py-0.5 text-[11px] font-semibold
        hover:bg-amber-100 hover:ring-amber-300 hover:shadow-sm transition cursor-pointer">
     Pendiente <span class="hidden sm:inline font-normal underline ml-0.5">ver</span>
   </button>`;


    function render() {
        tbody.innerHTML = AREAS.map((a, i) => `
      <tr>
        <td class="px-4 py-3">${a.nombre}</td>
        <td class="px-4 py-3">${a.ok ? chipOK() : chipPend(i)}</td>
      </tr>
    `).join('');
    }

    // Modal existente en tu página:
    // #md-area, #area-pend-title, #area-pend-list (ya vienen en tu HTML)
    const md = document.getElementById('md-area');
    const mTitle = document.getElementById('area-pend-title');
    const mList = document.getElementById('area-pend-list');

    // Delegación: click en “Pendiente” abre modal con detalles
    tbody.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-pend]');
        if (!btn) return;
        const idx = +btn.dataset.pend;
        const area = AREAS[idx];

        mTitle.textContent = `Pendientes — ${area.nombre}`;
        if (area.pendientes?.length) {
            mList.innerHTML = area.pendientes
                .map(t => `<li class="rounded-lg border px-3 py-2 text-sm">${t}</li>`)
                .join('');
        } else {
            mList.innerHTML =
                `<li class="rounded-lg bg-slate-50 ring-1 ring-slate-200 px-3 py-2 text-sm text-slate-600">
           Sin detalle.
         </li>`;
        }
        md.classList.remove('hidden');
    });

    render();
})();
