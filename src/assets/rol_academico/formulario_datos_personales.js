// ================================================
// Revisión de actualizaciones - Lógica de interfaz
// ================================================
document.addEventListener('DOMContentLoaded', () => {
  /* ========= Datos de ejemplo (sustituye por tu API) =========
     estado: 'pendiente' | 'revisado'
     Para Anexos, agrega file_url cuando haya archivo del estudiante.
     Se agregó 'valor' para simular lo que aparece en el documento.
  */
  const schema = {
    personales: [
      { id: 'primer_nombre', label: 'Primer Nombre', valor: 'LEIDY', obs: 'Mi documento dice LEIDY (corrige segundo nombre).', recibido: '2025-09-20 10:12', estado: 'pendiente' },
      { id: 'segundo_nombre', label: 'Segundo Nombre', valor: 'JOHANA', estado: 'pendiente' },
      { id: 'primer_apellido', label: 'Primer Apellido', valor: 'BELTRAN', estado: 'pendiente' },
      { id: 'segundo_apellido', label: 'Segundo Apellido', valor: 'CANO', estado: 'pendiente' },
      { id: 'tipo_doc', label: 'Tipo de documento', valor: 'Cédula de ciudadanía colombiana', estado: 'pendiente' },
      { id: 'numero_doc', label: 'Número de documento', valor: '1073721918', obs: 'No coincide con el PDF adjunto.', recibido: '2025-09-21 08:30', estado: 'revisado' },
      { id: 'lugar_expedicion', label: 'Lugar de expedición', valor: 'SOACHA', estado: 'pendiente' },
      { id: 'genero', label: 'Género', valor: 'Femenino', estado: 'pendiente' },
      { id: 'correo_inst', label: 'Correo electrónico institucional', valor: 'ljbeltran@universidadmayor.edu.co', estado: 'pendiente' },
    ],
    anexos: [
      { id: 'doc_identidad', label: 'Documento de identificación (PDF/JPG/PNG)', estado: 'pendiente', file_url: 'https://ejemplo.com/identidad.pdf' },
      { id: 'cert_saberpro', label: 'Certificado de asistencia a SaberPro/TYT (PDF)', estado: 'pendiente', file_url: 'https://ejemplo.com/certificado.pdf' },
      { id: 'codigo_saberpro', label: 'Código SaberPro o TYT', valor: '1322544', estado: 'pendiente' }
    ],


    contacto: [
      { id: 'grupo_invest', label: '¿Pertenece a grupo de investigación?', valor: 'No', estado: 'pendiente' },
      { id: 'telefono', label: 'Número de teléfono', valor: '3005759643', estado: 'pendiente' },
      { id: 'correo_personal', label: 'Correo electrónico personal', valor: 'leidy@example.com', estado: 'pendiente' },
      { id: 'departamento', label: 'Departamento', valor: 'Cundinamarca', estado: 'pendiente' },
      { id: 'ciudad', label: 'Ciudad o Municipio', valor: 'Soacha', estado: 'pendiente' },
      { id: 'direccion', label: 'Dirección', valor: 'Calle 10 #5-23 Apto 301', estado: 'pendiente' },
    ],
    institucion: [
      { id: 'hijo_func', label: '¿Es hijo(a) de funcionario?', valor: 'No', estado: 'pendiente' },
      { id: 'hijo_doc', label: '¿Es hijo(a) de docente?', valor: 'No', estado: 'pendiente' },
      { id: 'es_func', label: '¿Es funcionario de la Universidad?', valor: 'No', estado: 'pendiente' },
      { id: 'es_doc', label: '¿Es docente de la Universidad?', valor: 'No', estado: 'pendiente' },
    ],
    postgrado: [
      { id: 'titulo_pre', label: 'Título de pregrado', valor: 'No', estado: 'pendiente' },
      { id: 'universidad_pre', label: 'Universidad de egreso (pregrado)', valor: '—', estado: 'pendiente' },
      { id: 'fecha_grado', label: 'Fecha de grado (pregrado)', valor: '—', estado: 'pendiente' },
    ]
  };

  // ============ Helpers ============
  const $ = (sel, el = document) => el.querySelector(sel);
  const dotClass = (estado) => (estado === 'pendiente' ? 'bg-rose-500' : 'hidden');
  const fileNameFromUrl = (url) => {
    try { return decodeURIComponent(url.split('/').pop().split('?')[0]); }
    catch { return 'archivo'; }
  };
  const active = (arr) => arr.filter(i => !i._hidden);
  const allActiveItems = () => [
    ...active(schema.personales),
    ...active(schema.anexos),
    ...active(schema.contacto),
    ...active(schema.institucion),
    ...active(schema.postgrado),
  ];

  function valueLine(item) {
    if (item?.valor) {
      return `<p class="text-sm text-gray-700 mt-0.5"><span class="text-gray-500">Valor:</span> ${item.valor}</p>`;
    }
    if (item?.file_url) {
      return `<p class="text-sm text-gray-700 mt-0.5"><span class="text-gray-500">Archivo:</span> ${fileNameFromUrl(item.file_url)}</p>`;
    }
    return '';
  }

  // ============ Render ============
  function renderField(item) {
    // Mostrar chip “Con observación” solo si existe obs y NO está revisado
    const obsBadge = (item.obs && item.estado !== 'revisado')
      ? `<button type="button" data-obs-toggle="${item.id}"
      class="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 px-2.5 py-1 text-xs hover:bg-indigo-100">
      <span class="h-1.5 w-1.5 rounded-full bg-indigo-500"></span> Con observación
    </button>`
      : '';


    const selectClasses = [
      'rounded-lg', 'border-gray-300', 'text-sm',
      'focus:ring-2', 'focus:ring-blue-300',
      'min-w-[14rem]', 'text-start', 'shadow-sm', 'hover:shadow',
      'ring-1', 'ring-slate-300'
    ].join(' ');

    const showDot = !!item.obs && item.estado === 'pendiente'; // << SOLO si hay obs y está pendiente

    return `
    <div class="rounded-xl bg-white ring-1 ring-slate-200 px-3 py-3" data-row="${item.id}">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="min-w-0">
          <p class="font-medium text-gray-900">${item.label}</p>
          ${item?.valor ? `<p class="text-sm text-gray-700 mt-0.5"><span class="text-gray-500">Valor:</span> ${item.valor}</p>` : ''}
          ${obsBadge ? `<div class="mt-1 flex items-center gap-3">${obsBadge}</div>` : ''}
        </div>

        <div class="flex items-center gap-2">
          <span data-dot="${item.id}" class="${showDot ? 'inline-block' : 'hidden'} h-2.5 w-2.5 rounded-full bg-rose-500"></span>

          <select data-select="${item.id}" class="${selectClasses}">
            <option value="" selected disabled>Acciones</option>
            <optgroup label="Estado">
              <option value="estado:sin_cambio">Sin cambio</option>
              <option value="estado:pendiente">Pendiente revisión</option>
              <option value="estado:revisado">Revisado</option>
            </optgroup>
          </select>
        </div>
      </div>

      <div data-obs-panel="${item.id}" class="mt-2 hidden rounded-lg bg-slate-50 ring-1 ring-slate-200 px-3 py-2">
        <p class="text-sm text-gray-800">${item.obs ?? ''}</p>
        ${item.recibido ? `<p class="text-xs text-gray-500 mt-1">Recibido: ${item.recibido}</p>` : ''}
      </div>
    </div>
  `;
  }



  function mountSection(containerId, items) {
    const el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = active(items).map(renderField).join('');
  }
  function mountAllSections() {
    mountSection('lista-personales', schema.personales);
    // Ya no montamos anexos/contacto/institución/postgrado aquí
    mountHeaderExtras(); // <- NUEVO
  }

  // ============ Estado global / resumen ============
  function refreshCountsAndGlobal() {
    const items = schema.personales.filter(i => !i._hidden);
    const pendientes = items.filter(i => i.estado === 'pendiente').length;
    const revisadasOSinCambio = items.length - pendientes;

    const resumen = document.querySelector('#resumen-cant');
    if (resumen) resumen.textContent = `${revisadasOSinCambio} revisadas/sin cambio · ${pendientes} pendientes`;

    const st = document.querySelector('#st-formulario');
    if (st) {
      if (pendientes === 0 && items.length > 0) {
        st.className = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 bg-emerald-50 text-emerald-700 ring-emerald-200';
        st.innerHTML = '<span class="h-2 w-2 rounded-full bg-emerald-500"></span> Revisado';
      } else {
        st.className = 'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 bg-yellow-50 text-yellow-800 ring-yellow-200';
        st.innerHTML = '<span class="h-2 w-2 rounded-full bg-yellow-500"></span> Sin revisar';
      }
    }
  }


  // ============ Interacciones ============
  function bindObsToggles(scopeEl = document) {
    scopeEl.querySelectorAll('[data-obs-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-obs-toggle');
        const panel = scopeEl.querySelector(`[data-obs-panel="${id}"]`);
        if (!panel) return;

        panel.classList.toggle('hidden');
        const expanded = !panel.classList.contains('hidden');
        btn.classList.toggle('bg-indigo-100', expanded);
        btn.innerHTML = expanded
          ? `<span class="h-1.5 w-1.5 rounded-full bg-indigo-500"></span> Ocultar observación`
          : `<span class="h-1.5 w-1.5 rounded-full bg-indigo-500"></span> Con observación`;
      });
    });
  }

  function bindRowHandlers(scopeEl = document) {
    scopeEl.querySelectorAll('select[data-select]').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const id = sel.getAttribute('data-select');
        const item = schema.personales.find(x => x.id === id); // solo personales
        if (!item) { sel.value = ''; return; }

        const [tipo, valor] = (e.target.value || '').split(':');
        if (tipo !== 'estado') { sel.value = ''; return; }

        // actualizar estado
        item.estado = valor; // 'sin_cambio' | 'pendiente' | 'revisado'

        // Reemplazar tarjeta con el nuevo render (para refrescar punto/obs chip)
        const card = sel.closest('[data-row]');
        if (card) card.outerHTML = renderField(item);

        // Re-enlazar eventos solo en la lista de personales
        bindRowHandlers(document.getElementById('lista-personales'));
        bindObsToggles(document.getElementById('lista-personales'));
        refreshCountsAndGlobal();

        sel.value = '';
      });
    });
  }


  // ============ Render inicial + acciones globales ============
  function rerender() {
    mountAllSections();
    bindRowHandlers(document.getElementById('lista-personales'));
    bindObsToggles(document.getElementById('lista-personales'));
    refreshCountsAndGlobal();
  }

  rerender();

  // Botón final: marcar todo revisado
  const btnAll = $('#btn-marcar-todo-revisado');
  if (btnAll) {
    btnAll.addEventListener('click', () => {
      Object.values(schema).forEach(arr => active(arr).forEach(i => i.estado = 'revisado'));
      rerender();

      const alert = $('#alert-ok');
      if (alert) {
        alert.classList.remove('hidden');
        setTimeout(() => alert.classList.add('hidden'), 1200);
      }
    });
  }

  // Ver formulario (placeholder)
  const btnVer = $('#btn-ver-form');
  if (btnVer) {
    btnVer.addEventListener('click', () => {
      alert('Abrir formulario del estudiante (implementar navegación real).');
    });
  }

  function mountHeaderExtras() {
    const wrap = document.getElementById('det-extra');
    if (!wrap) return;

    const get = (arr, id) => (arr || []).find(x => x.id === id);
    const val = (x) => (x && x.valor) ? x.valor : '—';

    const aDoc = get(schema.anexos, 'doc_identidad');
    const aCert = get(schema.anexos, 'cert_saberpro');
    const aCode = get(schema.anexos, 'codigo_saberpro');

    wrap.innerHTML = `
  <div class="mt-3 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
    <div>
      <h6 class="text-base/6 font-semibold text-gray-900 mb-2">Anexos prioritarios</h6>
      <ul class="text-[13.5px] leading-5 text-gray-700 space-y-1.5">
        <li>
          <span class="font-medium text-gray-900">Documento de identificación</span>
          ${aDoc?.file_url
        ? `<a href="#" data-download="${aDoc.file_url}" data-filename="documento_identidad.pdf"
                 class="ml-2 text-[12px] text-blue-700 hover:underline">descargar</a>` : ''}
        </li>
        <li>
          <span class="font-medium text-gray-900">Certificado SaberPro/TyT</span>
          ${aCert?.file_url
        ? `<a href="#" data-download="${aCert.file_url}" data-filename="certificado_saberpro.pdf"
                 class="ml-2 text-[12px] text-blue-700 hover:underline">descargar</a>` : ''}
        </li>
        <li>
          <span class="font-medium text-gray-900">Código Saber:</span> ${val(aCode)}
        </li>
      </ul>
    </div>

    <div>
      <h6 class="text-base/6 font-semibold text-gray-900 mb-2">Contacto y vínculos</h6>
      <ul class="text-[13.5px] leading-5 text-gray-700 space-y-1.5">
        <li><span class="font-medium text-gray-900">Teléfono:</span> ${val(get(schema.contacto, 'telefono'))}</li>
        <li><span class="font-medium text-gray-900">Correo personal:</span> ${val(get(schema.contacto, 'correo_personal'))}</li>
        <li><span class="font-medium text-gray-900">Departamento:</span> ${val(get(schema.contacto, 'departamento'))}</li>
        <li><span class="font-medium text-gray-900">Ciudad:</span> ${val(get(schema.contacto, 'ciudad'))}</li>
        <li><span class="font-medium text-gray-900">Dirección:</span> ${val(get(schema.contacto, 'direccion'))}</li>
      </ul>
    </div>

    <div>
      <h6 class="text-base/6 font-semibold text-gray-900 mb-2">Vínculos con la institución</h6>
      <ul class="text-[13.5px] leading-5 text-gray-700 space-y-1.5">
        <li><span class="font-medium text-gray-900">Hijo(a) de funcionario:</span> ${val(get(schema.institucion, 'hijo_func'))}</li>
        <li><span class="font-medium text-gray-900">Hijo(a) de docente:</span> ${val(get(schema.institucion, 'hijo_doc'))}</li>
        <li><span class="font-medium text-gray-900">Funcionario UCMC:</span> ${val(get(schema.institucion, 'es_func'))}</li>
        <li><span class="font-medium text-gray-900">Docente UCMC:</span> ${val(get(schema.institucion, 'es_doc'))}</li>
      </ul>
    </div>

    <div>
      <h6 class="text-base/6 font-semibold text-gray-900 mb-2">Información adicional</h6>
      <ul class="text-[13.5px] leading-5 text-gray-700 space-y-1.5">
        <li><span class="font-medium text-gray-900">Título de pregrado:</span> ${val(get(schema.postgrado, 'titulo_pre'))}</li>
        <li><span class="font-medium text-gray-900">Universidad de egreso:</span> ${val(get(schema.postgrado, 'universidad_pre'))}</li>
        <li><span class="font-medium text-gray-900">Fecha de grado:</span> ${val(get(schema.postgrado, 'fecha_grado'))}</li>
      </ul>
    </div>
  </div>
`;

  }


  // Forzar descarga (sin abrir nueva pestaña) – fallback simple
  // descarga directa sin cambiar de pestaña
  document.addEventListener('click', (e) => {
    const a = e.target.closest('[data-download]');
    if (!a) return;
    e.preventDefault();
    const url = a.getAttribute('data-download');
    const name = a.getAttribute('data-filename') || '';
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', name);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
  });



});