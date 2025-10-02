// check_list_datos_personales.js
// Inicializa el checklist del bloque "Formulario de datos personales" cuando el detalle esté visible
(function () {
    let inited = false;
    let data = [];

    // Espera a que exista un selector (máx ~1s)
    function waitFor(sel, tries = 20, delay = 50) {
        return new Promise((resolve, reject) => {
            (function tick() {
                const el = document.querySelector(sel);
                if (el) return resolve(el);
                if (--tries <= 0) return reject(new Error('timeout'));
                setTimeout(tick, delay);
            })();
        });
    }

    // Render helpers
    const pill = (estado) =>
        estado === 'revisado'
            ? `<span class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200"><span class="h-2 w-2 rounded-full bg-emerald-500"></span> Revisado</span>`
            : `<span class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium bg-orange-100 text-orange-800 ring-1 ring-orange-200"><span class="h-2 w-2 rounded-full bg-orange-500"></span> Pendiente</span>`;

    const buttons = (id, estado) =>
        estado === 'revisado'
            ? `
    <div class="mt-3 sm:mt-0 flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:ml-auto">
      <button data-act="pendiente" data-id="${id}" class="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-white px-3 py-1.5 text-xs font-medium text-gray-700 ring-1 ring-amber-300 hover:bg-amber-50">Marcar pendiente</button>
      <button data-act="notificar" data-id="${id}" class="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">Notificar estudiante</button>
      <button data-act="quitar"     data-id="${id}" class="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-rose-100 px-3 py-1.5 text-xs font-medium text-rose-800 ring-1 ring-rose-200 hover:bg-rose-200/60">Quitar</button>
    </div>`
            : `
    <div class="mt-3 sm:mt-0 flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:ml-auto">
      <button data-act="revisar"    data-id="${id}" class="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">Revisar</button>
      <button data-act="notificar"  data-id="${id}" class="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">Notificar estudiante</button>
      <button data-act="quitar"     data-id="${id}" class="w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-rose-100 px-3 py-1.5 text-xs font-medium text-rose-800 ring-1 ring-rose-200 hover:bg-rose-200/60">Quitar</button>
    </div>`;

    const item = (o) => `
  <article class="rounded-xl border border-gray-200 p-3">
    <div class="flex flex-col sm:flex-row sm:items-start gap-2">
      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <h6 class="text-gray-900 font-semibold leading-5">${o.campo}</h6>
          ${pill(o.estado)}
        </div>
        <p class="mt-1 text-sm text-gray-700 whitespace-pre-line">${o.texto}</p>
        <p class="mt-2 text-[11px] text-gray-500">Recibido: ${o.fecha}</p>
      </div>
      ${buttons(o.id, o.estado)}
    </div>
  </article>`;

    function normalize(raw) {
        return raw.map((r) => ({
            id: r.id,
            campo: r.titulo,
            texto: r.observacion,
            fecha: r.recibido,
            estado: r.estado === 'reviewed' ? 'revisado' : 'pendiente',
        }));
    }

    function refreshCounters($resumen, $chipBloque) {
        const revisadas = data.filter((d) => d.estado === 'revisado').length;
        const pendientes = data.length - revisadas;
        if ($resumen) $resumen.textContent = `${revisadas} revisadas · ${pendientes} pendientes`;

        // chip del bloque (st-formulario)
        if ($chipBloque) {
            if (pendientes === 0 && data.length) {
                $chipBloque.className =
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 bg-emerald-50 text-emerald-800 ring-emerald-200';
                $chipBloque.innerHTML = '<span class="h-2 w-2 rounded-full bg-emerald-500"></span> Revisado';
            } else {
                $chipBloque.className =
                    'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 bg-yellow-50 text-yellow-800 ring-yellow-200';
                $chipBloque.innerHTML = '<span class="h-2 w-2 rounded-full bg-yellow-500"></span> Sin revisar';
            }
        }
    }

    function render($list, $resumen, $chipBloque) {
        $list.innerHTML = data.map(item).join('');
        refreshCounters($resumen, $chipBloque);
    }

    async function init() {
        if (inited) return;

        // Espera a que esté montado el detalle
        await waitFor('#lista-observaciones').catch(() => {
            console.warn('[checklist] #lista-observaciones no apareció a tiempo.');
        });

        const $list = document.getElementById('lista-observaciones');
        if (!$list) return; // aborta silenciosamente

        const $resumen = document.getElementById('resumen-cant');
        const $ok = document.getElementById('alert-ok');
        const $chipBloque = document.getElementById('st-formulario');
        const $btnAll = document.getElementById('btn-marcar-todo-revisado');
        const $btnVerForm = document.getElementById('btn-ver-form');
        const $ultimaAct = document.getElementById('form-ultima-actualizacion');

        // Datos demo (cámbialo por fetch)
        data = normalize([
            { id: 'nombre', titulo: 'Nombre', observacion: 'Mi documento dice LEIDY JOHANA (corrige segundo nombre).', recibido: '2025-09-20 10:12', estado: 'pending' },
            { id: 'documento', titulo: 'Número de documento', observacion: 'El número en el sistema no coincide con el PDF que adjunté.', recibido: '2025-09-21 08:30', estado: 'reviewed' },
            { id: 'problema', titulo: 'Sin acceso', observacion: 'Mi enlace ya expiró', recibido: '2025-09-21 08:30', estado: 'pending' },
        ]);

        // Render inicial
        render($list, $resumen, $chipBloque);
        if ($ultimaAct) $ultimaAct.textContent = '2025-09-21 10:12';

        // Delegación de eventos (acciones por ítem)
        $list.addEventListener('click', (e) => {
            const btn = e.target.closest('button[data-act]');
            if (!btn) return;
            const id = btn.dataset.id;
            const act = btn.dataset.act;
            const it = data.find((d) => d.id === id);
            if (!it) return;

            if (act === 'revisar') {
                // Abre modal pequeño con la observación
                openReviewModal(it, () => {
                    it.estado = 'revisado';
                    render($list, $resumen, $chipBloque);
                });
            } else if (act === 'pendiente') {
                it.estado = 'pendiente';
                render($list, $resumen, $chipBloque);
            } else if (act === 'quitar') {
                data = data.filter((d) => d.id !== id);
                render($list, $resumen, $chipBloque);
            } else if (act === 'notificar') {
                if (typeof window.openNotifyStudentModal === 'function') {
                    window.openNotifyStudentModal(it);
                } else {
                    alert(`Notificar estudiante\n\nAsunto: ${it.campo}\n\n${it.texto}`);
                }
            }
        });

        // Marcar todo como revisado
        $btnAll?.addEventListener('click', () => {
            data.forEach((d) => (d.estado = 'revisado'));
            render($list, $resumen, $chipBloque);
            if ($ok) $ok.classList.remove('hidden');
        });

        // Ver formulario en nueva pestaña
        $btnVerForm?.addEventListener('click', () => {
            window.open('https://tu-sitio/formulario-identificacion-demo', '_blank', 'noopener');
        });

        inited = true;
    }

    // Modal de revisión (usa tus IDs del HTML actual)
    function openReviewModal(item, onReviewed) {
        const $m = document.getElementById('modal-revision');
        if (!$m) return;

        $m.querySelector('#modal-title').textContent = item.campo;
        $m.querySelector('#modal-obs').textContent = item.texto;
        $m.querySelector('#modal-recibido').textContent = `Recibido: ${item.fecha}`;

        const close = () => $m.classList.add('hidden');

        $m.querySelector('#modal-close').onclick = close;
        $m.querySelector('#modal-pendiente').onclick = () => {
            // solo cierra; el estado lo pones con el botón "Marcar pendiente"
            close();
        };
        $m.querySelector('#modal-revisado').onclick = () => {
            try { onReviewed && onReviewed(); } finally { close(); }
        };

        $m.classList.remove('hidden');
    }

    // Exponer inicializador para llamarlo al entrar al detalle
    window.initFormularioChecklist = function () {
        // ejecuta tras un micro-tick por si el DOM está pintando
        setTimeout(init, 0);
    };
})();


// === Controlador del MODAL: Notificar estudiante (Tailwind-only) ===
(() => {
    const modal = document.getElementById('modal-notificar');
    if (!modal) return; // evita errores si no existe en esta página

    const $title = document.getElementById('notif-title');
    const $text = document.getElementById('notif-text');
    const $close = document.getElementById('notif-close');
    const $cancel = document.getElementById('notif-cancel');
    const $send = document.getElementById('notif-send');

    function show() {
        modal.classList.remove('hidden');
        document.documentElement.style.overflow = 'hidden'; // bloquea scroll fondo
    }
    function hide() {
        modal.classList.add('hidden');
        document.documentElement.style.overflow = '';
        $text.value = '';
        delete modal.dataset.ctxId;
    }

    // API global para que el checklist la use
    window.openNotifyStudentModal = function (ctx) {
        // ctx puede venir de una observación: { id, campo, texto, ... }
        const asunto = ctx?.campo ? ` — ${ctx.campo}` : '';
        $title.textContent = `Notificar al estudiante${asunto}`;
        $text.value = ctx?.texto ? `Sobre ${ctx.campo}: ${ctx.texto}` : '';
        modal.dataset.ctxId = ctx?.id || '';
        show();
    };

    // Cerrar: X, Cancelar, clic en backdrop, Escape
    $close?.addEventListener('click', hide);
    $cancel?.addEventListener('click', hide);
    modal.addEventListener('click', (e) => { if (e.target === modal) hide(); });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && !modal.classList.contains('hidden')) hide();
    });

    // Enviar (simulado): añade a Bitácora y cierra
    $send?.addEventListener('click', () => {
        const msg = $text.value.trim();
        if (!msg) { alert('Escribe un mensaje u observación antes de enviar.'); return; }

        const id = modal.dataset.ctxId || null;
        appendToBitacora(
            `Notificación enviada${id ? ` (item: ${id})` : ''}`,
            msg
        );
        hide();
    });

    // Utilidad: agrega entrada a la bitácora (si existe el #log-timeline)
    function appendToBitacora(titulo, detalle) {
        const log = document.getElementById('log-timeline');
        if (!log) return;
        const li = document.createElement('li');
        li.className = 'relative pl-6';
        li.innerHTML = `
      <span class="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-blue-600"></span>
      <p class="text-gray-800"><span class="font-medium">${titulo}</span> · ${detalle}</p>
      <p class="text-xs text-gray-500">${new Date().toISOString().slice(0, 16).replace('T', ' ')}</p>
    `;
        log.prepend(li);
    }
})();
