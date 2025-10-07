(function () {
    // demo: cámbialo por tu data del backend
    const AREAS = [
        { id: 'adm', nombre: 'Admisiones', ok: true, pendientes: [] },
        { id: 'fin', nombre: 'Financiera', ok: false, pendientes: ['Saldo pendiente en caja.'] },
        { id: 'bib', nombre: 'Biblioteca', ok: false, pendientes: ['Devolución de libro: “Metodología de la investigación”.'] },
        { id: 'sec', nombre: 'Secretaría Académica', ok: true, pendientes: [] },
        { id: 'prog', nombre: 'Programa Académico', ok: true, pendientes: [] },
    ];

    const tbody = document.querySelector('#areas-table tbody');
    if (!tbody) { console.warn('No se encontró <tbody> dentro de #areas-table'); return; }

    const chipOK = () =>
        `<span class="inline-flex rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-2 py-0.5 text-[11px] font-semibold">OK</span>`;

    // ahora solo un chip no clickeable
    const chipPend = () =>
        `<span class="inline-flex rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200 px-2.5 py-0.5 text-[11px] font-semibold">No</span>`;

    function render() {
        tbody.innerHTML = AREAS.map(a => {
            const obsHtml = (a.pendientes && a.pendientes.length)
                // sin bullets: solo líneas
                ? `<div class="space-y-1">
             ${a.pendientes.map(t => `<div class="text-sm text-gray-700">${t}</div>`).join('')}
           </div>`
                : `<span class="text-xs italic text-slate-500">Sin observaciones</span>`;

            return `
        <tr>
          <td class="px-4 py-3 align-top">${a.nombre}</td>
          <td class="px-4 py-3 align-top">${a.ok ? chipOK() : chipPend()}</td>
          <td class="px-4 py-3 align-top">${obsHtml}</td>
        </tr>
      `;
        }).join('');
    }

    render();
})();
