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
            { id: 'codigo_saberpro', label: 'Código SaberPro o TYT', estado: 'pendiente' } // sin archivo ⇒ no muestra Descargar
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
            { id: 'titulo_pre', label: 'Título de pregrado', valor: '—', estado: 'pendiente' },
            { id: 'universidad_pre', label: 'Universidad de egreso (pregrado)', valor: '—', estado: 'pendiente' },
            { id: 'fecha_grado', label: 'Fecha de grado (pregrado)', valor: '—', estado: 'pendiente' },
        ]
    };

    // ============ Helpers ============
    const $ = (sel, el = document) => el.querySelector(sel);
    const dotClass = (estado) => (estado === 'revisado' ? 'bg-emerald-500' : 'bg-yellow-500');
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
        const estadoOpp = item.estado === 'revisado' ? 'pendiente' : 'revisado';
        const estadoOppLabel = item.estado === 'revisado' ? 'Marcar como: Sin revisar' : 'Marcar como: Revisado';

        const obsBadge = item.obs
            ? `<button type="button" data-obs-toggle="${item.id}"
           class="inline-flex items-center gap-1 rounded-full bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 px-2.5 py-1 text-xs hover:bg-indigo-100">
           <span class="h-1.5 w-1.5 rounded-full bg-indigo-500"></span> Con observación
         </button>`
            : `<span class="inline-flex items-center gap-1 rounded-full bg-slate-50 text-slate-600 ring-1 ring-slate-200 px-2.5 py-1 text-xs">
           <span class="h-1.5 w-1.5 rounded-full bg-slate-400"></span> Sin observación
         </span>`;

        // Select “Acciones” centrado y con sombra
        const selectClasses = [
            'rounded-lg', 'border-gray-300', 'text-sm',
            'focus:ring-2', 'focus:ring-blue-300',
            'min-w-[14rem]', 'text-start',
            'shadow-sm', 'hover:shadow',
            'ring-1', 'ring-slate-300'
        ].join(' ');

        // Acciones del select
        let actionOptions = '';
        if (item.file_url) actionOptions += `<option value="accion:descargar">Descargar archivo</option>`;
        if (item.obs) actionOptions += `<option value="accion:verobs">Ver/ocultar observación</option>`;
        actionOptions += `<option value="accion:quitar">Quitar</option>`;

        return `
      <div class="rounded-xl bg-white ring-1 ring-slate-200 px-3 py-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="min-w-0">
            <p class="font-medium text-gray-900">${item.label}</p>
            ${valueLine(item)}
            <div class="mt-1 flex items-center gap-3">
              ${obsBadge}
            </div>
          </div>

          <div class="flex items-center gap-2">
            <!-- Punto de estado -->
            <span data-dot="${item.id}" class="inline-block h-2.5 w-2.5 rounded-full ${dotClass(item.estado)}"></span>

            <!-- SELECT: Acciones (centrado + sombra) -->
            <select data-select="${item.id}" class="${selectClasses}">
              <option value="" selected disabled>Acciones</option>
              <optgroup label="Estado">
                <option value="estado:${estadoOpp}">${estadoOppLabel}</option>
              </optgroup>
              <optgroup label="Acciones">
                ${actionOptions}
              </optgroup>
            </select>
          </div>
        </div>

        <!-- Panel colapsable de observación -->
        <div data-obs-panel="${item.id}" class="mt-2 hidden rounded-lg bg-slate-50 ring-1 ring-slate-200 px-3 py-2">
          <p class="text-sm text-gray-800">${item.obs ?? '—'}</p>
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
        mountSection('lista-anexos', schema.anexos);
        mountSection('lista-contacto', schema.contacto);
        mountSection('lista-institucion', schema.institucion);
        mountSection('lista-postgrado', schema.postgrado);
    }

    // ============ Estado global / resumen ============
    function refreshCountsAndGlobal() {
        const items = allActiveItems();
        const revisadas = items.filter(i => i.estado === 'revisado').length;
        const pendientes = items.length - revisadas;

        const resumen = $('#resumen-cant');
        if (resumen) resumen.textContent = `${revisadas} revisadas · ${pendientes} pendientes`;

        const st = $('#st-formulario');
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
                const item = allActiveItems().find(x => x.id === id) ||
                    schema.personales.find(x => x.id === id) ||
                    schema.anexos.find(x => x.id === id) ||
                    schema.contacto.find(x => x.id === id) ||
                    schema.institucion.find(x => x.id === id) ||
                    schema.postgrado.find(x => x.id === id);
                if (!item) { sel.value = ''; return; }

                const [tipo, valor] = (e.target.value || '').split(':');

                // Cambiar estado
                if (tipo === 'estado') {
                    item.estado = valor; // 'revisado' | 'pendiente'

                    // Actualiza punto de color
                    const dot = document.querySelector(`[data-dot="${id}"]`);
                    if (dot) {
                        dot.classList.remove('bg-emerald-500', 'bg-yellow-500');
                        dot.classList.add(dotClass(item.estado));
                    }

                    // Re-render tarjeta para refrescar select y badge
                    const card = sel.closest('.rounded-xl.bg-white.ring-1');
                    if (card) card.outerHTML = renderField(item);

                    // Re-enlaza eventos
                    bindRowHandlers(document);
                    bindObsToggles(document);
                    refreshCountsAndGlobal();

                    sel.value = '';
                    return;
                }

                // Acciones
                if (tipo === 'accion') {
                    if (valor === 'verobs') {
                        const panel = document.querySelector(`[data-obs-panel="${id}"]`);
                        const btn = document.querySelector(`[data-obs-toggle="${id}"]`);
                        if (panel) {
                            panel.classList.toggle('hidden');
                            const expanded = !panel.classList.contains('hidden');
                            if (btn) {
                                btn.classList.toggle('bg-indigo-100', expanded);
                                btn.innerHTML = expanded
                                    ? `<span class="h-1.5 w-1.5 rounded-full bg-indigo-500"></span> Ocultar observación`
                                    : `<span class="h-1.5 w-1.5 rounded-full bg-indigo-500"></span> Con observación`;
                            }
                        }
                    } else if (valor === 'descargar') {
                        if (item.file_url) window.open(item.file_url, '_blank');
                    } else if (valor === 'quitar') {
                        item._hidden = true;
                        sel.closest('.rounded-xl.bg-white.ring-1')?.remove();
                        refreshCountsAndGlobal();
                    }
                    sel.value = '';
                }
            });
        });
    }

    // ============ Render inicial + acciones globales ============
    function rerender() {
        mountAllSections();
        bindRowHandlers(document);
        bindObsToggles(document);
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
});