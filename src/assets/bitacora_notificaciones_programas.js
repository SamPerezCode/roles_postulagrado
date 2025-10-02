(() => {
  // ====== Config ======
  const MAX_COLLAPSED = 5;
  const TYPE_STYLES = {
    notificacion: { dot: 'bg-blue-600', label: 'Notificación enviada' },
    observacion: { dot: 'bg-amber-500', label: 'Observación registrada' },
    area: { dot: 'bg-indigo-600', label: 'Área notificada' },
    pago: { dot: 'bg-emerald-600', label: 'Pago registrado' },
    sistema: { dot: 'bg-gray-400', label: 'Evento del sistema' },
  };

  // ====== Estado ======
  const $list = document.getElementById('log-timeline');
  const $btnAdd = document.getElementById('btn-nueva-nota');
  const $btnAll = document.getElementById('btn-ver-todas');

  if (!$list) return;

  let expanded = false;
  const logs = [];

  // Semilla demo
  pushLog('notificacion', 'Instrucciones de derecho a grado.', { ts: '2025-10-01 10:22' });

  // ====== API pública ======
  function pushLog(type, text, meta = {}) {
    const ts = meta.ts || nowStr();
    logs.unshift({ type: (type || 'sistema'), text: (text || ''), ts });
    paint();
  }

  // Exponer función global para que otros módulos registren:
  window.addToLog = pushLog;

  // También escuchar eventos desacoplados
  document.addEventListener('bitacora:add', (e) => {
    const { type, text, meta } = (e.detail || {});
    pushLog(type, text, meta);
  });

  // ====== UI ======
  function paint() {
    const items = (expanded ? logs : logs.slice(0, MAX_COLLAPSED))
      .map(renderItem)
      .join('');
    $list.innerHTML = items || emptyState();

    // Botón "Ver todas"
    if ($btnAll) {
      if (logs.length <= MAX_COLLAPSED) {
        $btnAll.classList.add('hidden');
      } else {
        $btnAll.classList.remove('hidden');
        $btnAll.textContent = expanded ? 'Ver menos' : 'Ver todas las notificaciones';
      }
    }
  }

  function renderItem(item) {
    const style = TYPE_STYLES[item.type] || TYPE_STYLES.sistema;
    const label = style.label || 'Evento';
    return `
      <li class="relative pl-6">
        <span class="absolute left-0 top-1.5 h-2 w-2 rounded-full ${style.dot}"></span>
        <p class="text-gray-800">
          <span class="font-medium">${label}</span>
          ${item.text ? ` · ${escapeHTML(item.text)}` : ''}
        </p>
        <p class="text-xs text-gray-500">${item.ts}</p>
      </li>
    `;
  }

  function emptyState() {
    return `
      <li class="rounded-lg bg-slate-50 ring-1 ring-slate-200 px-3 py-2 text-sm text-gray-600">
        Aún no hay eventos en la bitácora.
      </li>
    `;
  }

  function nowStr() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function escapeHTML(s = '') {
    return s.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  // ====== Composer simple para "Añadir nota" ======
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
        <button id="log-cancel"
          class="rounded-lg bg-white ring-1 ring-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancelar
        </button>
        <button id="log-save"
          class="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-blue-700">
          Guardar
        </button>
      </div>
    `;
    // Insertar justo después del título (contenedor padre de la tarjeta)
    const card = $list.closest('.rounded-2xl.border.bg-white.shadow-sm') || $list.parentElement;
    card.insertBefore(composerEl, $list);

    // Eventos composer
    composerEl.querySelector('#log-cancel').addEventListener('click', () => {
      composerEl.classList.add('hidden');
    });
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

  // Handlers
  $btnAdd?.addEventListener('click', () => {
    const el = ensureComposer();
    el.classList.toggle('hidden');
    if (!el.classList.contains('hidden')) {
      el.querySelector('#log-new-text').focus();
    }
  });

  $btnAll?.addEventListener('click', () => {
    expanded = !expanded;
    paint();
  });

  // Primera pintura
  paint();

})();