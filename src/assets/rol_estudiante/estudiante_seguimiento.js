// ===== SEGUIMIENTO ESTUDIANTE (info, tareas y áreas + modal + subida) =====
(() => {
    // ------- Utils -------
    const $ = s => document.querySelector(s);
    const norm = s => (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    // ------- Datos demo -------
    const student = window.currentStudent || {
        doc: '1030599627', cod: '605032223',
        nom: 'Calderón Barrios Robinson', prog: 'Derecho Internacional',
        mail: 'rb.calderon@unicolmayor.edu.co', tel: '+57 320 000 0000'
    };

    const enProceso = true;

    // ------- Tareas -------
    const STORAGE_KEY = 'pg_student_tasks';
    const defaultTasks = [
        { id: 'obs-1', text: 'Subir soporte de pago de derechos de grado', done: false },
        { id: 'obs-2', text: 'Entregar copia autenticada del diploma de pregrado', done: false },
        { id: 'cron-1', text: 'Responder encuesta de graduandos', done: true },
        { id: 'cron-2', text: 'Validar datos personales y de contacto', done: false },
    ];
    let tasks;
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        tasks = (Array.isArray(saved) && saved.length) ? saved : defaultTasks.slice();
    } catch { tasks = defaultTasks.slice(); }

    // ------- Refs comunes -------
    const tareasList = $('#tareas-list');
    const tareasEmpty = $('#tareas-empty');
    const tareasResumen = $('#tareas-resumen');
    const noProceso = $('#no-proceso');
    const btnActualizar = $('#btnActualizarDatos');

    // Info personal
    const stDoc = $('#st-doc'), stCod = $('#st-cod'), stNom = $('#st-nom'),
        stProg = $('#st-prog'), stMail = $('#st-mail'), stTel = $('#st-tel');

    // ------- Áreas -------
    const areas = [
        {
            name: 'Financiera', desc: 'Paz y Salvo institucional', pendientes: 2, progreso: 90,
            items: ['Pagar derecho de grado', 'Subir soporte de pago (PDF)']
        },
        {
            name: 'Admisiones', desc: 'Validación de requisitos', pendientes: 5, progreso: 95,
            items: ['Subir copia de cédula ampliada al 150%', 'Actualizar contacto alterno', 'Firmar consentimiento de datos', 'Confirmar participación en ceremonia', 'Encuesta de graduandos']
        },
        {
            name: 'Biblioteca', desc: 'Devoluciones y multas', pendientes: 3, progreso: 77,
            items: ['Devolver libro: “Metodología de la investigación”', 'Cancelar multa $12.000', 'Solicitar paz y salvo biblioteca']
        },
        {
            name: 'Recursos educativos', desc: 'Materiales y equipos', pendientes: 1, progreso: 85,
            items: ['Entregar kit de laboratorio']
        },
        {
            name: 'Centro de idiomas', desc: 'Exámenes y certificaciones', pendientes: 3, progreso: 70,
            items: ['Presentar examen de suficiencia B1', 'Subir certificado vigente', 'Agendar tutoría de refuerzo']
        },
    ];

    // ------- Pintado -------
    function paintNoProceso() { noProceso?.classList.toggle('hidden', !!enProceso); }

    function paintInfo() {
        stDoc && (stDoc.textContent = student.doc || '—');
        stCod && (stCod.textContent = student.cod || '—');
        stNom && (stNom.textContent = student.nom || '—');
        stProg && (stProg.textContent = student.prog || '—');
        stMail && (stMail.textContent = student.mail || '—');
        stTel && (stTel.textContent = student.tel || '—');
    }

    function persistTasks() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }

    function paintTasks() {
        if (!tareasList || !tareasEmpty || !tareasResumen) return;
        const total = tasks.length, done = tasks.filter(t => t.done).length;
        tareasResumen.textContent = `${done}/${total} completadas`;
        if (!total) { tareasEmpty.classList.remove('hidden'); tareasList.innerHTML = ''; return; }
        tareasEmpty.classList.add('hidden');
        tareasList.innerHTML = tasks.map(t => `
      <li class="rounded-xl border p-3 bg-gray-50 flex items-start gap-3">
        <input type="checkbox" data-id="${t.id}" ${t.done ? 'checked' : ''}
          class="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500">
        <div class="min-w-0">
          <p class="text-sm ${t.done ? 'text-gray-500 line-through' : 'text-gray-800'}">${t.text}</p>
          <span class="inline-flex mt-1 items-center gap-1 rounded-full ${t.done ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'} px-2 py-0.5 text-xs">
            <span class="h-1.5 w-1.5 rounded-full ${t.done ? 'bg-emerald-500' : 'bg-amber-400'}"></span>
            ${t.done ? 'Realizado' : 'Pendiente'}
          </span>
        </div>
      </li>`).join('');
    }

    function wireTasks() {
        tareasList?.addEventListener('change', (e) => {
            const cb = e.target.closest('input[type="checkbox"][data-id]');
            if (!cb) return;
            const ix = tasks.findIndex(t => t.id === cb.dataset.id);
            if (ix >= 0) { tasks[ix].done = !!cb.checked; persistTasks(); paintTasks(); }
        });
    }

    function paintAreas() {
        const grid = document.getElementById('areas-grid');
        if (!grid) return;
        grid.innerHTML = areas.map((a, idx) => {
            const pct = Math.max(0, Math.min(100, a.progreso));
            const risk = a.pendientes > 0 ? 'ring-1 ring-amber-200 bg-amber-50/20' : 'bg-white';
            return `
        <article class="rounded-2xl border ${risk} p-5">
          <header class="flex items-start gap-3">
            <span class="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 text-lg">🏛️</span>
            <div class="min-w-0">
              <h3 class="text-base font-semibold text-gray-900 leading-5">${a.name}</h3>
              <p class="text-xs text-gray-500">${a.desc}</p>
            </div>
          </header>

          <div class="mt-3 grid grid-cols-2 gap-y-1 text-sm">
            <p class="text-gray-600">Pendientes</p>
            <p class="text-red-600 font-semibold">${a.pendientes}</p>
          </div>

          <div class="mt-3">
            <p class="text-sm font-medium text-gray-700 mb-1">Progreso</p>
            <div class="h-2.5 w-full rounded-full bg-gray-200 overflow-hidden" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}">
              <div class="h-full bg-indigo-600" style="width:${pct}%"></div>
            </div>
            <p class="mt-1 text-right text-xs text-gray-500">${pct}%</p>
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            <button data-act="pend" data-idx="${idx}"
              class="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-100">Ver pendientes</button>
            <button data-act="upload" data-idx="${idx}"
              class="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">Subir soporte</button>
          </div>
        </article>`;
        }).join('');
    }

    // ------- Modal "Ver pendientes" -------
    const mdArea = document.getElementById('md-area');
    const areaPendTitle = document.getElementById('area-pend-title');
    const areaPendList = document.getElementById('area-pend-list');

    function openAreaModal(area) {
        areaPendTitle.textContent = `Pendientes — ${area.name}`;
        if (!Array.isArray(area.items) || !area.items.length) {
            areaPendList.innerHTML = `<li class="rounded-lg border px-3 py-2 text-sm text-slate-600 bg-slate-50">No hay pendientes listados por esta área.</li>`;
        } else {
            areaPendList.innerHTML = area.items.map(txt => `
        <li class="rounded-lg border px-3 py-2 flex items-start gap-2 bg-white">
          <span class="mt-1 h-2 w-2 rounded-full bg-amber-500"></span>
          <p class="text-sm text-gray-800">${txt}</p>
        </li>`).join('');
        }
        mdArea?.classList.remove('hidden');
        document.documentElement.style.overflow = 'hidden';
    }
    mdArea?.addEventListener('click', (e) => {
        if (e.target === mdArea) { mdArea.classList.add('hidden'); document.documentElement.style.overflow = ''; }
    });
    document.querySelectorAll('[data-close="md-area"]').forEach(b =>
        b.addEventListener('click', () => { mdArea?.classList.add('hidden'); document.documentElement.style.overflow = ''; })
    );

    // ------- Subida de archivo (simulada) -------
    let hiddenFileInput = document.getElementById('hidden-area-upload');
    if (!hiddenFileInput) {
        hiddenFileInput = document.createElement('input');
        hiddenFileInput.type = 'file';
        hiddenFileInput.id = 'hidden-area-upload';
        hiddenFileInput.accept = '.pdf,.png,.jpg,.jpeg,.doc,.docx';
        hiddenFileInput.className = 'hidden';
        document.body.appendChild(hiddenFileInput);
    }
    let uploadAreaIndex = null;
    hiddenFileInput.addEventListener('change', () => {
        const file = hiddenFileInput.files?.[0];
        if (!file) return;
        const a = areas[uploadAreaIndex ?? 0];

        const md = document.getElementById('md-ok');
        if (md) {
            document.getElementById('md-ok-title').textContent = 'Soporte subido';
            document.getElementById('md-ok-text').innerHTML =
                `Se subió <b>${file.name}</b> a <b>${a.name}</b>.<br>En breve será validado por el área.`;
            md.classList.remove('hidden');
        }

        if (a.pendientes > 0) a.pendientes -= 1; // demo
        paintAreas();

        hiddenFileInput.value = '';
        uploadAreaIndex = null;
    });

    // ------- Delegación de eventos en el grid de áreas -------
    document.getElementById('areas-grid')?.addEventListener('click', (e) => {
        const btn = e.target.closest('button[data-act]');
        if (!btn) return;
        const idx = +btn.dataset.idx;
        const act = btn.dataset.act;
        const area = areas[idx];
        if (!area) return;

        if (act === 'pend') { openAreaModal(area); }
        if (act === 'upload') { uploadAreaIndex = idx; hiddenFileInput.click(); }
    });

    // ------- Acciones -------
    btnActualizar?.addEventListener('click', () => {
        const md = document.getElementById('md-ok');
        if (!md) return;
        document.getElementById('md-ok-title').textContent = 'Abrir formulario';
        document.getElementById('md-ok-text').textContent = 'Aquí abriremos el formulario de actualización de datos.';
        md.classList.remove('hidden');
    });
    document.querySelectorAll('[data-close="md-ok"]').forEach(btn =>
        btn.addEventListener('click', () => document.getElementById('md-ok')?.classList.add('hidden'))
    );

    // ------- Init -------
    paintNoProceso();
    paintInfo();
    paintTasks();
    wireTasks();
    paintAreas();
})();



// ===== Información del grado (sección #sec-grado) =====
(() => {
    // Ponlo en true mientras lo pruebas (o calcula este valor según tu lógica real)
    const aprobado = true; // demo

    // Datos demo de la ceremonia
    const gradoInfo = {
        titulo: 'Ceremonia 2025-1',
        fecha: '22 de noviembre de 2025',
        hora: '10:00 a. m.',
        lugar: 'Auditorio Principal — Sede 28 #5B-02, Bogotá D.C.',
        direccion: 'Sede 28 #5B-02, Bogotá D.C.',
        cupos: 2,
        codigo: 'INV-25-605032223',
        pasos: [
            { text: 'Confirma tu asistencia al acto de grado', done: false },
            { text: 'Reclama tu toga y birrete (si aplica)', done: true },
            { text: 'Llega 60 minutos antes con documento de identidad', done: false },
            { text: 'Verifica ortografía de tu nombre para diploma', done: true },
        ]
    };

    const $ = s => document.querySelector(s);
    const sec = $('#sec-grado');
    const badge = $('#grado-badge');

    if (!sec) return; // por si se reutiliza el JS en otra vista

    function paintGrado() {
        if (!aprobado) {
            sec.classList.add('hidden');
            badge?.classList.add('hidden');
            return;
        }
        // Mostrar sección y badge
        sec.classList.remove('hidden');
        badge?.classList.remove('hidden');

        // Relleno de datos
        $('#cer-titulo').textContent = gradoInfo.titulo;
        $('#cer-fecha').textContent = gradoInfo.fecha;
        $('#cer-hora').textContent = gradoInfo.hora;
        $('#cer-lugar').textContent = gradoInfo.lugar;
        $('#cer-direccion').textContent = gradoInfo.direccion;
        $('#cer-cupos').textContent = `${gradoInfo.cupos} acompañantes`;
        $('#cer-codigo').textContent = gradoInfo.codigo;

        // Pasos
        const ul = $('#grado-pasos');
        ul.innerHTML = gradoInfo.pasos.map(p => `
      <li class="flex items-start gap-3 rounded-xl border bg-white p-3">
        <span class="mt-0.5 h-2.5 w-2.5 rounded-full ${p.done ? 'bg-emerald-500' : 'bg-amber-500'}"></span>
        <div class="min-w-0">
          <p class="text-gray-800 ${p.done ? 'line-through text-gray-500' : ''}">${p.text}</p>
          <span class="mt-1 inline-flex items-center gap-1 rounded-full ${p.done ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'} px-2 py-0.5 text-xs">
            ${p.done ? 'Completado' : 'Pendiente'}
          </span>
        </div>
      </li>
    `).join('');
    }

    // Acciones (feedback usando tu modal md-ok)
    $('#btnInvitacion')?.addEventListener('click', () => {
        const md = document.getElementById('md-ok');
        if (!md) return;
        document.getElementById('md-ok-title').textContent = 'Invitación descargada';
        document.getElementById('md-ok-text').innerHTML =
            'Se descargará tu invitación con el código: <b>' + gradoInfo.codigo + '</b>.';
        md.classList.remove('hidden');
    });

    $('#btnIndicaciones')?.addEventListener('click', () => {
        const md = document.getElementById('md-ok');
        if (!md) return;
        document.getElementById('md-ok-title').textContent = 'Indicaciones para el día del grado';
        document.getElementById('md-ok-text').innerHTML =
            '• Presentarse 60 minutos antes.<br>• Llevar documento de identidad.<br>• Revisar sillas asignadas el día del evento.';
        md.classList.remove('hidden');
    });

    paintGrado();
})();