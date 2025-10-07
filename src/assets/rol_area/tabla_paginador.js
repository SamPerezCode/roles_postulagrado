
(function () {
    // === Catálogo nombres de programa ===
    const PROG_NAME = {
        'DER-ESP-DIP': 'Especialización Derecho Internacional Público',
        'ADM-ESP-GRH': 'Especialización en Gestión del Recurso Humano',
        'ENF-ESP-UCI': 'Especialización en Cuidado Crítico (UCI)',
        'ODT-PRE': 'Odontología',
        'DER-PRE': 'Derecho',
    };

    // === Simulación de estudiantes por programa (incluye updatedAt) ===
    const SIM_DATA = {
        'DER-ESP-DIP': [
            { nombre: 'BELTRAN CANO LEIDY JOHANA', codigo: '605030223', ps: true, obs: '', updatedAt: '2025-10-03 14:10' },
            { nombre: 'CALDERÓN MESA LUISA', codigo: '605032223', ps: false, obs: 'Debe certificado EPS actualizado.', updatedAt: '2025-10-04 08:22' },
            { nombre: 'CORTES PARRA JOSÉ', codigo: '605034223', ps: true, obs: '', updatedAt: '2025-10-02 17:05' },
            { nombre: 'HURTADO RIVERA ANA', codigo: '605049223', ps: false, obs: '', updatedAt: '2025-10-01 11:31' },
            { nombre: 'GÓMEZ RAMÍREZ SARA', codigo: '605041789', ps: true, obs: '', updatedAt: '2025-10-03 12:40' },
            { nombre: 'PÉREZ DÍAZ MARTÍN', codigo: '605040115', ps: false, obs: 'Pendiente biblioteca.', updatedAt: '2025-10-04 09:10' },
        ],
        'ADM-ESP-GRH': [{ nombre: 'ALVARADO VEGA CAMILA', codigo: '605060101', ps: true, obs: '', updatedAt: '2025-10-03 10:12' }],
        'ENF-ESP-UCI': [{ nombre: 'MARTÍNEZ REY LINA', codigo: '605070202', ps: false, obs: '', updatedAt: '2025-10-02 09:55' }],
        'ODT-PRE': [{ nombre: 'RODRÍGUEZ LARA DIEGO', codigo: '605080404', ps: true, obs: '', updatedAt: '2025-09-29 16:40' }],
        'DER-PRE': [{ nombre: 'SUÁREZ PRIETO IVÁN', codigo: '605090909', ps: false, obs: 'Multa financiera.', updatedAt: '2025-10-01 15:00' }],
    };

    // === Contexto por querystring ===
    const qs = new URLSearchParams(location.search);
    const proc = qs.get('proc') || '2025-03';
    const prog = qs.get('prog') || 'DER-ESP-DIP';

    // === Estado local ===
    let rows = (SIM_DATA[prog] || []).map(r => ({ ...r }));
    let editingIndex = null;

    // Paginación
    let page = 1;
    const PAGE_SIZE = 3;

    // === Refs UI ===
    const elProgName = document.getElementById('pl-prog-name');
    const elProc = document.getElementById('pl-proc');
    const elTbody = document.getElementById('pl-tbody');
    const elEmpty = document.getElementById('pl-empty');
    const elBtnNotif = document.getElementById('pl-notificar-btn');
    const elCountOK = document.getElementById('pl-count-ok');

    const mdObs = document.getElementById('md-obs');
    // const obsText = document.getElementById('obs-text');
    // const obsSave = document.getElementById('obs-save');

    const mdProgNotif = document.getElementById('md-prog-notif');
    // const notifList = document.getElementById('pl-notif-list');
    // const notifCount = document.getElementById('pl-notif-count');
    // const notifEmpty = document.getElementById('pl-notif-empty');
    // const notifSendBtn = document.getElementById('pl-notif-send');

    const sendOverlay = document.getElementById('send-overlay');
    const sendIcon = document.getElementById('send-icon');
    const sendState = document.getElementById('send-state');

    // paginador
    const elPrev = document.getElementById('pl-prev');
    const elNext = document.getElementById('pl-next');
    const elRange = document.getElementById('pl-range');
    const elPage = document.getElementById('pl-page');
    const elPages = document.getElementById('pl-pages');

    // Encabezado
    elProgName.textContent = PROG_NAME[prog] || prog;
    elProc.textContent = proc;

    // === Helpers ===
    const nowFmt = () => {
        const d = new Date();
        const pad = n => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    const truncate = (s, n) => !s ? '' : (s.length > n ? s.slice(0, n - 1) + '…' : s);
    const countOK = () => rows.filter(r => !!r.ps).length;

    function updateNotifyButton() {
        const n = countOK();
        elCountOK.textContent = String(n);
        elBtnNotif.disabled = n === 0;
    }

    function setPagerLabels() {
        const total = rows.length;
        const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
        if (page > pages) page = pages;

        const start = total ? (page - 1) * PAGE_SIZE + 1 : 0;
        const end = Math.min(total, page * PAGE_SIZE);

        elRange.textContent = `Mostrando ${start}–${end} de ${total}`;
        elPage.textContent = `Página ${page}`;
        elPages.textContent = String(pages);

        elPrev.disabled = page <= 1;
        elNext.disabled = page >= pages;
    }

    function renderTable() {
        if (!elTbody) return;

        const total = rows.length;
        elEmpty.classList.toggle('hidden', total > 0);

        // slice de la página
        const start = (page - 1) * PAGE_SIZE;
        const end = Math.min(total, start + PAGE_SIZE);
        const view = rows.slice(start, end);

        elTbody.innerHTML = view.map((r, iInPage) => {
            const idx = start + iInPage; // índice real en rows

            // Select PS con punto verde cuando es "Sí"
            const psSelect = `
        <div class="flex items-center justify-center gap-2">
          <select data-idx="${idx}"
                  class="pl-ps-select rounded-md border-gray-300 text-sm focus:border-blue-500 focus:ring-blue-500">
            <option value="true"  ${r.ps ? 'selected' : ''}>Sí</option>
            <option value="false" ${!r.ps ? 'selected' : ''}>No</option>
          </select>
          
        </div>
      `;

            // Observación + link Actualizar
            const hasObs = !!(r.obs && r.obs.trim());

            // Texto del chip
            const obsText = hasObs ? truncate(r.obs, 36) : 'Sin observación';

            // Estilo del chip (ámbar si hay obs, gris si no hay)
            const obsChipClass = hasObs
                ? 'bg-amber-50 ring-amber-200 text-amber-800'
                : 'bg-slate-50 ring-slate-200 text-slate-600';

            const warn = (!r.ps && !hasObs)
                ? `<p class="mt-1 text-[11px] text-rose-600">Requiere observación si no está Paz y Salvo.</p>`
                : '';

            const obsMuted = r.ps ? 'opacity-60' : '';

            const obsCell = `
  <div class="${obsMuted}">
    <span class="inline-block rounded-full px-2 py-0.5 text-[11px] ${obsChipClass}">
      ${obsText}
    </span>
    <button data-idx="${idx}" class="pl-obs-btn ml-2 inline-flex items-center gap-1 text-xs text-blue-700 hover:underline">
      <svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25Zm17.71-10.21a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83Z"/></svg>
      Actualizar
    </button>
    ${warn}
  </div>
`;


            return `
        <tr>
          <td class="px-4 py-2">${r.nombre}</td>
          <td class="px-4 py-2">${r.codigo}</td>
          <td class="px-4 py-2 text-center">${psSelect}</td>
          <td class="px-4 py-2">${obsCell}</td>
          <td class="px-4 py-2 text-xs text-gray-500">${r.updatedAt || '—'}</td>
        </tr>
      `;
        }).join('');

        // Listeners del slice
        elTbody.querySelectorAll('.pl-ps-select').forEach(sel => {
            sel.addEventListener('change', (e) => {
                const idx = Number(e.target.getAttribute('data-idx'));
                const val = e.target.value === 'true';
                rows[idx].ps = val;
                rows[idx].updatedAt = nowFmt();
                renderTable();
                updateNotifyButton();
                setPagerLabels();
            });
        });

        elTbody.querySelectorAll('.pl-obs-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = Number(e.currentTarget.getAttribute('data-idx'));
                editingIndex = idx;
                document.getElementById('obs-text').value = rows[idx].obs || '';
                mdObs.classList.remove('hidden');
            });
        });

        // actualizar paginador
        setPagerLabels();
    }

    // Guardar observación
    document.getElementById('obs-save')?.addEventListener('click', () => {
        if (editingIndex == null) return;
        const txt = (document.getElementById('obs-text').value || '').trim();
        rows[editingIndex].obs = txt;
        rows[editingIndex].updatedAt = nowFmt();
        mdObs.classList.add('hidden');
        editingIndex = null;
        renderTable();
        updateNotifyButton();
    });

    // Cerrar modales por atributo data-close
    document.addEventListener('click', (e) => {
        const closeBtn = e.target.closest('[data-close]');
        if (closeBtn) {
            const id = closeBtn.getAttribute('data-close');
            document.getElementById(id)?.classList.add('hidden');
        }
    });

    // Abrir “Notificar al programa” (filtra PS = true)
    document.getElementById('pl-notificar-btn')?.addEventListener('click', () => {
        const oks = rows.filter(r => !!r.ps);
        document.getElementById('pl-notif-list').innerHTML = oks.map(r => `
      <li class="px-3 py-2 flex items-center justify-between">
        <div class="min-w-0">
          <p class="font-medium text-gray-900 truncate">${r.nombre}</p>
          <p class="text-xs text-gray-600">Código: ${r.codigo}</p>
        </div>
        <span class="rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 px-2 py-0.5 text-[11px]">Paz y Salvo</span>
      </li>
    `).join('');
        document.getElementById('pl-notif-count').textContent = String(oks.length);
        document.getElementById('pl-notif-empty').classList.toggle('hidden', oks.length > 0);
        document.getElementById('pl-notif-send').disabled = oks.length === 0;
        document.getElementById('md-prog-notif').classList.remove('hidden');
    });

    // Envío (simulado)
    document.getElementById('pl-notif-send')?.addEventListener('click', () => {
        mdProgNotif.classList.add('hidden');
        sendOverlay.classList.remove('hidden');
        sendIcon.classList.add('animate-spin');
        sendState.textContent = 'Enviando…';

        setTimeout(() => {
            sendIcon.classList.remove('animate-spin');
            sendState.textContent = 'Enviado ✅';
            setTimeout(() => { sendOverlay.classList.add('hidden'); }, 1100);
        }, 900);
    });

    // Paginador eventos
    elPrev?.addEventListener('click', () => { if (page > 1) { page--; renderTable(); } });
    elNext?.addEventListener('click', () => {
        const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
        if (page < pages) { page++; renderTable(); }
    });

    // Primera pinta
    renderTable();
    updateNotifyButton();
})();
