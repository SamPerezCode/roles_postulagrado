
// ================= Paz y Salvo - JS =================
document.addEventListener('DOMContentLoaded', () => {
    // Datos de ejemplo (sustituye por tu API)
    // estado: 'ok' | 'pendiente'
    const areas = [
        {
            id: 'fin', nombre: 'Financiera', desc: 'Paz y Salvo institucional', estado: 'pendiente',
            motivos: ['Saldo pendiente por $120.000', 'Interés por mora del mes anterior']
        },
        { id: 'adm', nombre: 'Admisiones', desc: 'Validación de requisitos', estado: 'ok', motivos: [] },
        {
            id: 'bib', nombre: 'Biblioteca', desc: 'Devoluciones y multas', estado: 'pendiente',
            motivos: ['Multa por entrega tardía: $8.000']
        },
        {
            id: 'rec', nombre: 'Recursos educativos', desc: 'Materiales y equipos', estado: 'pendiente',
            motivos: ['Entrega de kit de laboratorio pendiente']
        },
        { id: 'idi', nombre: 'Centro de idiomas', desc: 'Exámenes y certificaciones', estado: 'ok', motivos: [] },
    ];

    const $ = (s, el = document) => el.querySelector(s);
    const dot = (estado) => estado === 'ok' ? 'bg-emerald-500' : 'bg-yellow-500';

    // Select estilizado (centrado + sombra)
    const selectCls = [
        'rounded-lg', 'border-gray-300', 'text-sm', 'text-center',
        'focus:ring-2', 'focus:ring-blue-300',
        'min-w-[12rem]', 'shadow-sm', 'hover:shadow', 'ring-1', 'ring-slate-300'
    ].join(' ');

    function renderRow(a) {
        // Opciones del select: si está pendiente => Ver detalle
        const verDetalleOpt = a.estado === 'pendiente'
            ? `<option value="detalle:${a.id}">Ver detalle</option>` : '';

        return `
      <li class="px-3 py-3 flex items-center justify-between gap-3">
        <div class="min-w-0">
          <p class="font-medium text-gray-900">${a.nombre}</p>
          <p class="mt-0.5 text-xs text-gray-600">${a.desc}</p>
        </div>
        <div class="flex items-center gap-3">
          <span class="inline-block h-2.5 w-2.5 rounded-full ${dot(a.estado)}"></span>
          <select data-area="${a.id}" class="${selectCls}">
            <option value="" selected disabled>Acciones</option>
            ${verDetalleOpt}
            <option value="notificar-area:${a.id}">Notificar área</option>
          </select>
        </div>
      </li>
    `;
    }

    function mountList() {
        const ul = $('#ps-list');
        ul.innerHTML = areas.map(renderRow).join('');
        bindRowActions();
    }

    // ===== Acciones de fila
    function bindRowActions() {
        document.querySelectorAll('#ps-list select[data-area]').forEach(sel => {
            sel.addEventListener('change', (e) => {
                const value = e.target.value || '';
                const [tipo, id] = value.split(':');
                const area = areas.find(x => x.id === id);
                if (!area) { sel.value = ''; return; }

                if (tipo === 'detalle') {
                    openDetalle(area);
                } else if (tipo === 'notificar-area') {
                    const msg = prompt(`Mensaje para el área “${area.nombre}”`);
                    if (msg && msg.trim()) {
                        // TODO: enviar al backend
                        alert('Mensaje enviado al área.');
                    }
                }
                sel.value = '';
            });
        });
    }

    // ===== Modal Detalle
    function openDetalle(area) {
        $('#ps-detalle-title').textContent = `Detalle de pendientes — ${area.nombre}`;
        const list = $('#ps-detalle-list');
        list.innerHTML = area.motivos.length
            ? area.motivos.map(m => `<li>${m}</li>`).join('')
            : '<li>No hay detalles registrados.</li>';
        $('#ps-detalle-modal').classList.remove('hidden');
    }
    function closeDetalle() { $('#ps-detalle-modal').classList.add('hidden'); }
    $('#ps-detalle-close').addEventListener('click', closeDetalle);
    $('#ps-detalle-ok').addEventListener('click', closeDetalle);
    $('#ps-detalle-modal').addEventListener('click', (e) => {
        if (e.target.id === 'ps-detalle-modal') closeDetalle();
    });

    // ===== Modal Notificar estudiante
    function openStudentModal() { $('#ps-modal').classList.remove('hidden'); }
    function closeStudentModal() { $('#ps-modal').classList.add('hidden'); }
    $('#btn-notificar-estudiante').addEventListener('click', openStudentModal);
    $('#ps-close').addEventListener('click', closeStudentModal);
    $('#ps-cancel').addEventListener('click', closeStudentModal);
    $('#ps-modal').addEventListener('click', (e) => {
        if (e.target.id === 'ps-modal') closeStudentModal();
    });
    $('#ps-send').addEventListener('click', () => {
        const txt = ($('#ps-text').value || '').trim();
        if (!txt) { alert('Escribe un mensaje antes de enviar.'); return; }
        // TODO: enviar al backend
        alert('Mensaje enviado al estudiante.');
        $('#ps-text').value = '';
        closeStudentModal();
    });

    // Init
    mountList();
});
