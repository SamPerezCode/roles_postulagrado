(() => {
    // ---------- Utils ----------
    const $ = s => document.querySelector(s);
    const norm = s => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    // ---------- 1) Cargar dataset (o demo) ----------
    let data = Array.isArray(window.students) ? window.students : [];
    if (!data.length) {
        try {
            const raw = localStorage.getItem('pg_students') || localStorage.getItem('students_demo');
            if (raw) data = JSON.parse(raw);
        } catch { }
    }
    if (!Array.isArray(data)) data = [];

    // Alumno DEMO (respaldo si no hay match)
    const demoStudent = {
        doc: '1030599627',
        cod: '605034223',
        nom: 'Calderón Barrios Robinson',
        prog: 'Derecho Internacional',
        estado: 'PENDIENTE',        // 'PENDIENTE' | 'APROBADO' | 'OBSERVACION'
        obs: []                     // aquí irán las observaciones
    };

    // ---------- 2) Buscar por parámetros de URL ----------
    const params = new URLSearchParams(location.search);
    const procParam = params.get('proc') || 'Grados 2025-1';
    const rawQ = (params.get('q') || params.get('codigo') || params.get('cod') || params.get('doc') || '').trim();

    let student = null;
    if (rawQ) {
        const nq = norm(rawQ);
        student =
            data.find(s => norm(s.doc) === nq || norm(s.cod) === nq) ||
            data.find(s => norm(s.nom).includes(nq)) ||
            null;
    }

    // Si no hubo match → usa demo SIEMPRE para que puedas trabajar
    if (!student) {
        student = demoStudent;
    }

    // Que quede accesible por si otros módulos lo requieren
    window.currentStudent = student;

    // ---------- 3) Helpers de UI ----------
    const stName = $('#st-name'), stDoc = $('#st-doc'), stCod = $('#st-cod'),
        stProg = $('#st-prog'), stProc = $('#st-proc'),
        stBadge = $('#st-badge'), stPend = $('#st-pend-count');

    const obsList = $('#obs-list'), obsEmpty = $('#obs-empty');
    const btnAddObs = $('#btn-add-obs'), btnAprobar = $('#btn-aprobar'), btnNotif = $('#btn-notificar');

    const mdObs = $('#md-obs'), obsTxt = $('#obs-text'), obsSave = $('#obs-save');
    const mdNotif = $('#md-notif'), notifTxt = $('#notif-text'), notifSend = $('#notif-send');

    function badgeHTML(estado) {
        if (estado === 'APROBADO')
            return `<span class="rounded-lg bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Aprobado</span>`;
        if (estado === 'OBSERVACION')
            return `<span class="rounded-lg bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">Pendiente con observación</span>`;
        return `<span class="rounded-lg bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-yellow-700">Pendiente por revisar</span>`;
    }

    function paintStudent() {
        stName && (stName.textContent = student.nom);
        stDoc && (stDoc.textContent = student.doc);
        stCod && (stCod.textContent = student.cod);
        stProg && (stProg.textContent = student.prog);
        stProc && (stProc.textContent = procParam);
        stBadge && (stBadge.innerHTML = badgeHTML(student.estado));
        paintObs();
        if (btnAprobar && student.estado === 'APROBADO') {
            btnAprobar.disabled = true;
            btnAprobar.classList.add('opacity-60', 'cursor-not-allowed');
        }
    }

    function paintObs() {
        const list = Array.isArray(student.obs) ? student.obs : [];
        stPend && (stPend.textContent = list.length);
        if (!obsList || !obsEmpty) return;
        if (!list.length) {
            obsEmpty.classList.remove('hidden');
            obsList.innerHTML = '';
            return;
        }
        obsEmpty.classList.add('hidden');
        obsList.innerHTML = list.map((t, i) => `
      <li class="rounded-lg border px-3 py-2 flex items-start justify-between gap-3">
        <p class="text-gray-800">${t}</p>
        <button data-del="${i}" class="text-xs rounded-md bg-red-50 px-2 py-1 text-red-700 hover:bg-red-100">Quitar</button>
      </li>
    `).join('');
    }

    function persist() {
        try {
            // Mete/actualiza en tu dataset si el alumno demo ya existe por doc/cod
            const idx = data.findIndex(s => s.doc === student.doc || s.cod === student.cod);
            if (idx >= 0) data[idx] = student; else data.push(student);
            const json = JSON.stringify(data);
            localStorage.setItem('pg_students', json);
            localStorage.setItem('students_demo', json);
            window.students = data;
        } catch { }
    }

    // ---------- 4) Eventos ----------
    // Quitar observación
    obsList?.addEventListener('click', (e) => {
        const del = e.target.closest('[data-del]');
        if (!del) return;
        const i = +del.dataset.del;
        if (!Number.isInteger(i)) return;
        student.obs.splice(i, 1);
        if (!student.obs.length && student.estado === 'OBSERVACION') {
            student.estado = 'PENDIENTE';
            stBadge.innerHTML = badgeHTML(student.estado);
        }
        paintObs();
        persist();
    });

    // Abrir modal "Añadir observación" (si no existe modal, usa prompt)
    btnAddObs?.addEventListener('click', () => {
        if (mdObs && obsTxt) {
            mdObs.classList.remove('hidden');
            document.documentElement.style.overflow = 'hidden';
            setTimeout(() => obsTxt.focus(), 50);
        } else {
            const txt = prompt('Describe brevemente la observación:');
            if (txt && txt.trim()) {
                student.obs = Array.isArray(student.obs) ? student.obs : [];
                student.obs.unshift(txt.trim());
                student.estado = 'OBSERVACION';
                stBadge.innerHTML = badgeHTML(student.estado);
                paintObs();
                persist();
            }
        }
    });

    // Guardar observación (modal)
    obsSave?.addEventListener('click', () => {
        const txt = (obsTxt.value || '').trim();
        if (!txt) return;
        student.obs = Array.isArray(student.obs) ? student.obs : [];
        student.obs.unshift(txt);
        student.estado = 'OBSERVACION';
        stBadge.innerHTML = badgeHTML(student.estado);
        paintObs();
        persist();
        mdObs.classList.add('hidden');
        document.documentElement.style.overflow = '';
        obsTxt.value = '';
    });

    // Cerrar modal obs con backdrop o botones [data-close="md-obs"]
    mdObs?.addEventListener('click', e => { if (e.target === mdObs) { mdObs.classList.add('hidden'); document.documentElement.style.overflow = ''; } });
    document.querySelectorAll('[data-close="md-obs"]').forEach(b => b.addEventListener('click', () => { mdObs.classList.add('hidden'); document.documentElement.style.overflow = ''; }));

    // Aprobar
    btnAprobar?.addEventListener('click', () => {
        student.estado = 'APROBADO';
        stBadge.innerHTML = badgeHTML(student.estado);
        paintObs();
        btnAprobar.disabled = true;
        btnAprobar.classList.add('opacity-60', 'cursor-not-allowed');
        persist();
    });

    // (Opcional) Enviar notificación si tienes modal. Si no, simple alert:
    // notifSend?.addEventListener('click', () => {
    //     const msg = (notifTxt.value || '').trim() || 'Tienes novedades en tu Paz y Salvo.';
    //     alert('Notificación enviada: ' + msg);
    //     document.getElementById('md-notif')?.classList.add('hidden');
    //     document.documentElement.style.overflow = '';
    //     notifTxt.value = '';
    // });

    // ---------- 5) Pintar por primera vez ----------
    paintStudent();
})();

(() => {
    const $ = s => document.querySelector(s);
    const $all = s => document.querySelectorAll(s);

    // ----- Bitácora mínima -----
    const logEl = $('#log');
    const logEmpty = $('#log-empty');
    // Reutiliza si ya existe; si no, crea.
    window.__psLogs = window.__psLogs || [];

    function paintLog() {
        if (!logEl || !logEmpty) return;
        if (!window.__psLogs.length) {
            logEmpty.classList.remove('hidden');
            logEl.innerHTML = '';
            return;
        }
        logEmpty.classList.add('hidden');

        logEl.innerHTML = window.__psLogs.map(item => {
            const color = item.type === 'notif' ? 'bg-indigo-600'
                : item.type === 'obs' ? 'bg-amber-500'
                    : 'bg-gray-400';
            const label = item.type === 'notif' ? 'Notificación'
                : item.type === 'obs' ? 'Observación'
                    : 'Nota';
            return `
      <li class="relative pl-6">
        <span class="absolute left-0 top-1.5 h-2 w-2 rounded-full ${color}"></span>

        <!-- Encabezado -->
        <p class="text-gray-900">
          <span class="font-semibold">${label}</span>
        </p>

        <!-- CONTENIDO visible -->
        <p class="mt-1 text-sm text-gray-700 whitespace-pre-line">
          ${escapeHTML(item.text || '')}
        </p>

        <!-- Fecha -->
        <p class="mt-1 text-xs text-gray-500">${item.ts}</p>
      </li>
    `;
        }).join('');
    }

    function pushLog(type, text) {
        const ts = new Date().toLocaleString();
        window.__psLogs = window.__psLogs || [];
        window.__psLogs.unshift({ type, text, ts });
        paintLog();
    }

    function escapeHTML(s = '') { return s.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m])); }
    paintLog();

    // Si tu script de Observaciones ya empuja logs, perfecto;
    // si no, puedes llamarlo así donde guardas la observación:
    //   window.pushProcessLog?.('obs', 'Observación añadida: ' + txt);
    window.pushProcessLog = pushLog;

    // ----- Modal de NOTIFICACIÓN -----
    const btnOpenNotif = $('#btn-notificar');
    const mdNotif = $('#md-notif');
    const notifText = $('#notif-text');
    const notifSend = $('#notif-send');

    const sendOverlay = $('#send-overlay');
    const sendState = $('#send-state');
    const sendIcon = $('#send-icon');

    function openNotif() {
        if (!mdNotif) return;
        notifText.value = '';
        mdNotif.classList.remove('hidden');
        document.documentElement.style.overflow = 'hidden';
        setTimeout(() => notifText.focus(), 50);
    }
    function closeNotif() {
        if (!mdNotif) return;
        mdNotif.classList.add('hidden');
        document.documentElement.style.overflow = '';
    }
    btnOpenNotif?.addEventListener('click', openNotif);
    $all('[data-close="md-notif"]').forEach(b => b.addEventListener('click', closeNotif));
    mdNotif?.addEventListener('click', e => { if (e.target === mdNotif) closeNotif(); });

    notifSend?.addEventListener('click', () => {
        const msg = (notifText.value || '').trim() || 'Tienes novedades en tu Paz y Salvo.';

        // overlay de envío…
        sendOverlay.classList.remove('hidden');
        sendState.textContent = 'Enviando…';
        sendIcon.classList.add('animate-spin');

        setTimeout(() => {
            // ÉXITO: registrar el **contenido real** en la bitácora
            pushLog('notif', msg);

            // cerrar modal y feedback visual
            sendIcon.classList.remove('animate-spin');
            sendIcon.className = 'mx-auto mb-2 h-10 w-10 rounded-full grid place-items-center';
            sendIcon.innerHTML = '<svg viewBox="0 0 24 24" class="h-8 w-8 text-emerald-600"><path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg>';
            sendState.textContent = 'Enviado con éxito';
            closeNotif();

            setTimeout(() => {
                // restaurar overlay
                sendOverlay.classList.add('hidden');
                sendIcon.innerHTML = '';
                sendIcon.className = 'mx-auto mb-2 h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600';
                sendState.textContent = 'Enviando…';
            }, 900);
        }, 900);
    });



    // ----- Modal de NOTA -----
    const btnAddNote = $('#btn-add-note');
    const mdNote = $('#md-note');
    const noteText = $('#note-text');
    const noteSave = $('#note-save');

    function openNote() {
        if (!mdNote) return;
        noteText.value = '';
        mdNote.classList.remove('hidden');
        document.documentElement.style.overflow = 'hidden';
        setTimeout(() => noteText.focus(), 50);
    }
    function closeNote() {
        if (!mdNote) return;
        mdNote.classList.add('hidden');
        document.documentElement.style.overflow = '';
    }
    btnAddNote?.addEventListener('click', openNote);
    $all('[data-close="md-note"]').forEach(b => b.addEventListener('click', closeNote));
    mdNote?.addEventListener('click', e => { if (e.target === mdNote) closeNote(); });
    noteSave?.addEventListener('click', () => {
        const txt = (noteText.value || '').trim();
        if (!txt) return;
        pushLog('note', txt);
        closeNote();
    });
})();