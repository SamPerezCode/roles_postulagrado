// bitacora_notificaciones_programas.js
(() => {
  // ====== Config ======
  const MAX_COLLAPSED = 5;
  const TYPE_STYLES = {
    notificacion: { dot: 'bg-blue-600', label: 'Notificación enviada' },
    observacion: { dot: 'bg-amber-500', label: 'Observación / estado' },
    area: { dot: 'bg-indigo-600', label: 'Área notificada' },
    pago: { dot: 'bg-emerald-600', label: 'Pago registrado' },
    sistema: { dot: 'bg-gray-400', label: 'Evento del sistema' },
  };

  // ====== Estado / refs ======
  const $list = document.getElementById('log-timeline');
  const $btnAdd = document.getElementById('btn-nueva-nota');
  const $btnAll = document.getElementById('btn-ver-todas');
  if (!$list) return;

  let expanded = false;
  const logs = [];

  // ====== API pública ======
  function nowStr() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  function escapeHTML(s = '') {
    return s.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }
  function pushLog(type, text, meta = {}) {
    const ts = meta.ts || nowStr();
    logs.unshift({ type: (type || 'sistema'), text: (text || ''), ts });
    paint();
  }
  window.addToLog = pushLog;                      // para usar desde otros módulos
  document.addEventListener('bitacora:add', (e) => {
    const { type, text, meta } = (e.detail || {});
    pushLog(type, text, meta);
  });

  // ====== Semilla demo (muestra que sí se notificó y hubo movimiento) ======
  pushLog('notificacion', 'Instrucciones de derecho a grado enviadas.');
  pushLog('observacion', 'Nombre: marcado como pendiente por inconsistencias.');
  pushLog('observacion', 'Número de documento: revisado y aprobado.');
  pushLog('notificacion', 'Se solicitó corrección de nombre al estudiante.');

  // ====== Render ======
  function renderItem(item) {
    const s = TYPE_STYLES[item.type] || TYPE_STYLES.sistema;
    return `
      <li class="relative pl-6">
        <span class="absolute left-0 top-1.5 h-2 w-2 rounded-full ${s.dot}"></span>
        <p class="text-gray-800">
          <span class="font-medium">${s.label}</span>${item.text ? ` · ${escapeHTML(item.text)}` : ''}
        </p>
        <p class="text-xs text-gray-500">${item.ts}</p>
      </li>`;
  }
  function emptyState() {
    return `<li class="rounded-lg bg-slate-50 ring-1 ring-slate-200 px-3 py-2 text-sm text-gray-600">Aún no hay eventos en la bitácora.</li>`;
  }
  function paint() {
    const items = (expanded ? logs : logs.slice(0, MAX_COLLAPSED)).map(renderItem).join('');
    $list.innerHTML = items || emptyState();
    if ($btnAll) {
      if (logs.length <= MAX_COLLAPSED) $btnAll.classList.add('hidden');
      else {
        $btnAll.classList.remove('hidden');
        $btnAll.textContent = expanded ? 'Ver menos' : 'Ver todas las notificaciones';
      }
    }
  }

  // ====== Composer "Añadir nota" ======
  let composerEl = null;
  function ensureComposer() {
    if (composerEl) return composerEl;
    composerEl = document.createElement('div');
    composerEl.className = 'mt-3 rounded-xl border border-gray-200 p-3';
    composerEl.innerHTML = `
      <label class="block text-xs text-gray-500 mb-1">Nueva nota / comentario</label>
      <textarea id="log-new-text" rows="3"
        class="w-full rounded-md border-gray-300 text-sm focus:ring-blue-400 focus:border-blue-400"
        placeholder="Escribe una nota breve para la bitácora…"></textarea>
      <div class="mt-2 flex justify-end gap-2">
        <button id="log-cancel" class="rounded-lg bg-white ring-1 ring-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Cancelar</button>
        <button id="log-save"   class="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700">Guardar</button>
      </div>`;
    const card = $list.closest('.rounded-2xl.border.bg-white.shadow-sm') || $list.parentElement;
    card.insertBefore(composerEl, $list);

    composerEl.querySelector('#log-cancel').addEventListener('click', () => composerEl.classList.add('hidden'));
    composerEl.querySelector('#log-save').addEventListener('click', () => {
      const txt = composerEl.querySelector('#log-new-text').value.trim();
      if (!txt) return;
      pushLog('sistema', txt);
      composerEl.querySelector('#log-new-text').value = '';
      composerEl.classList.add('hidden');
    });
    composerEl.classList.add('hidden');
    return composerEl;
  }

  // ====== Autolog de acciones en “Observaciones / Solicitudes de revisión” ======
  // Delegación global: detecta clicks en botones comunes
  document.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button');
    if (!btn) return;

    const label = (btn.textContent || '').trim().toLowerCase();
    // Busco el contenedor de la observación (la card) y extraigo el título de la observación (ej. “Nombre”)
    const card = btn.closest('.rounded-2xl') || btn.closest('[class*="rounded"]');
    let titulo = '';
    if (card) {
      const h = card.querySelector('h3, h4, h5, h6, .font-semibold, .text-gray-900');
      titulo = (h && h.textContent.trim()) || '';
    }

    if (label.includes('notificar estudiante')) {
      pushLog('notificacion', titulo ? `Se notificó al estudiante sobre “${titulo}”.` : 'Se notificó al estudiante.');
    } else if (label === 'revisar' || label.includes('revisar')) {
      pushLog('observacion', titulo ? `Revisado: ${titulo}.` : 'Observación revisada.');
    } else if (label.includes('marcar pendiente')) {
      pushLog('observacion', titulo ? `${titulo}: marcado como pendiente.` : 'Observación marcada como pendiente.');
    } else if (label === 'quitar' || label.includes('quitar')) {
      pushLog('sistema', titulo ? `Se quitó la observación “${titulo}”.` : 'Se quitó una observación.');
    }
  });

  // ====== Botones de la tarjeta Bitácora ======
  $btnAdd?.addEventListener('click', () => {
    const el = ensureComposer();
    el.classList.toggle('hidden');
    if (!el.classList.contains('hidden')) el.querySelector('#log-new-text').focus();
  });
  $btnAll?.addEventListener('click', () => {
    expanded = !expanded;
    paint();
  });

  // Primera pintura
  paint();
})();
