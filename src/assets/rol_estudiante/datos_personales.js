
/* ============================
    RESUMEN DEL FORM (ACORDEONES)
   ============================ */

(function () {
  // === 1) Datos de ejemplo (reemplaza por lo que venga del backend)
  // Perfil que el sistema tenía al iniciar el proceso:
  const perfilBase = {
    // Identificación
    primerNombre: "LEIDY",
    segundoNombre: "JOHANA",
    primerApellido: "BELTRAN",
    segundoApellido: "CANO",
    tipoDoc: "Cédula de ciudadanía colombiana",
    numeroDoc: "1073721918",
    lugarExpedicion: "SOACHA",
    genero: "Femenino",
    correoInstitucional: "ljbeltran@universidadmayor.edu.co",

    // Anexos
    docIdentidadCargado: true,
    certificadoSaber: true,
    codigoSaber: "6544585",

    // Contacto y vínculos
    perteneceGrupoInv: "No",
    telefono: "3005759643",
    correoPersonal: "leidy@gmail.com",
    departamento: "Cundinamarca",
    ciudad: "Soacha",
    direccion: "Calle 10 # 5-23 Apto 301",

    // Vínculos con la institución
    hijoFuncionario: "No",
    hijoDocente: "No",
    funcionario: "No",
    docente: "No",

    // Información adicional (postgrado)
    tituloPregrado: "Derecho",
    universidadPregrado: "U. Cundinamarca ",
    fechaGradoPregrado: " 2018-06-29 "
  };

  // Datos que el/la estudiante envió en "Actualizar mis datos":
  const perfilEnviado = {
    // Identificación (simulo un cambio en 2º nombre)
    primerNombre: "LEIDY",
    segundoNombre: "JOHANA",            // ← cambia esto para ver “Actualizado”
    primerApellido: "BELTRAN",
    segundoApellido: "CANO",
    tipoDoc: "Cédula de ciudadanía colombiana",
    numeroDoc: "1073721918",
    lugarExpedicion: "SOACHA",
    genero: "Femenino",
    correoInstitucional: "ljbeltran@universidadmayor.edu.co",

    // Anexos (simulo cargado de documento)
    docIdentidadCargado: true,
    certificadoSaber: true,
    codigoSaber: "6544585",

    // Contacto y vínculos (simulo cambios)
    perteneceGrupoInv: "No",
    telefono: "3005759643",
    correoPersonal: "leidy@gmail.com",
    departamento: "Cundinamarca",
    ciudad: "Soacha",
    direccion: "Calle 10 # 5-23 Apto 301",

    // Vínculos con la institución
    hijoFuncionario: "No",
    hijoDocente: "No",
    funcionario: "No",
    docente: "No",

    // Información adicional
    tituloPregrado: "Derecho",
    universidadPregrado: "U. Cundinamarca",
    fechaGradoPregrado: "2018-06-30"
  };

  // === 2) Definición de las secciones y campos a comparar
  const SECCIONES = [
    {
      id: 'ident',
      titulo: 'Identificación',
      campos: [
        { k: 'primerNombre', label: 'Primer nombre' },
        { k: 'segundoNombre', label: 'Segundo nombre' },
        { k: 'primerApellido', label: 'Primer apellido' },
        { k: 'segundoApellido', label: 'Segundo apellido' },
        { k: 'tipoDoc', label: 'Tipo de documento' },
        { k: 'numeroDoc', label: 'Número de documento' },
        { k: 'lugarExpedicion', label: 'Lugar de expedición' },
        { k: 'genero', label: 'Género' },
        { k: 'correoInstitucional', label: 'Correo institucional' },
      ]
    },
    {
      id: 'anexos',
      titulo: 'Anexos prioritarios',
      campos: [
        { k: 'docIdentidadCargado', label: 'Documento de identidad (PDF/JPG/PNG)', isBool: true },
        { k: 'certificadoSaber', label: 'Certificado asistencia a SaberPro/TyT (PDF)', isBool: true },
        { k: 'codigoSaber', label: 'Código SaberPro o TyT' }
      ]
    },
    {
      id: 'contacto',
      titulo: 'Contacto y vínculos',
      campos: [
        { k: 'perteneceGrupoInv', label: '¿Pertenece a grupo de investigación?' },
        { k: 'telefono', label: 'Número de teléfono' },
        { k: 'correoPersonal', label: 'Correo electrónico personal' },
        { k: 'departamento', label: 'Departamento' },
        { k: 'ciudad', label: 'Ciudad o Municipio' },
        { k: 'direccion', label: 'Dirección' },
      ]
    },
    {
      id: 'vinculos',
      titulo: 'Vínculos con la institución',
      campos: [
        { k: 'hijoFuncionario', label: '¿Es hijo(a) de funcionario?' },
        { k: 'hijoDocente', label: '¿Es hijo(a) de docente?' },
        { k: 'funcionario', label: '¿Es funcionario de la Universidad?' },
        { k: 'docente', label: '¿Es docente de la Universidad?' },
      ]
    },
    {
      id: 'postgrado',
      titulo: 'Información adicional (postgrado)',
      campos: [
        { k: 'tituloPregrado', label: 'Título de pregrado' },
        { k: 'universidadPregrado', label: 'Universidad de egreso (pregrado)' },
        { k: 'fechaGradoPregrado', label: 'Fecha de grado (pregrado)', fmt: (v) => v ? new Date(v).toLocaleDateString('es-CO') : '' },
      ]
    }
  ];

  // === 3) Helpers
  const $ = (s) => document.querySelector(s);
  const esc = (v) => (v == null ? '' : String(v));

  function same(a, b) {
    // comparación básica (string/boolean/number)
    return esc(a).trim() === esc(b).trim();
  }

  function chipEstado(cambio) {
    return cambio
      ? '<span class="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">Actualizado</span>'
      : '<span class="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200">Sin cambios</span>';
  }
  function chipActualizado() {
    return '<span class="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">Actualizado</span>';
  }


  function fmtValor(val, opt = {}) {
    if (opt.isBool) return val ? 'Cargado' : 'Pendiente';
    if (opt.fmt) return opt.fmt(val);
    return esc(val) || '—';
  }

  // === 4) Render
  const root = document.getElementById('verif-accordions');
  if (!root) return;

  root.innerHTML = SECCIONES.map(sec => {
    return `
    <article class="rounded-xl border">
      <!-- Header del acordeón (sin contador) -->
      <button type="button"
              class="w-full flex items-center justify-between gap-3 px-4 py-3 text-left"
              data-acc-toggle="${sec.id}">
        <div class="min-w-0">
          <h3 class="font-semibold text-blue-900">${sec.titulo}</h3>
        </div>
        <div class="shrink-0 inline-flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-700">
          <svg viewBox="0 0 24 24" class="h-4 w-4"><path fill="currentColor" d="M7 10l5 5 5-5z"/></svg>
        </div>
      </button>

      <!-- Cuerpo -->
      <div id="acc-${sec.id}" class="hidden border-t bg-white">
        <dl class="divide-y">
          ${sec.campos.map(f => {
      const baseV = perfilBase[f.k];
      const envV = perfilEnviado[f.k];
      const cambio = esc(baseV).trim() !== esc(envV).trim(); // misma lógica de 'same' inline

      return `
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 px-4 py-3">
                <dt class="text-sm text-gray-600">${f.label}</dt>
                <dd class="sm:col-span-2 text-sm text-gray-900 flex flex-col sm:flex-row sm:items-center sm:gap-3">
                  <span class="truncate">${fmtValor(envV, f)}</span>
                  ${cambio ? `<span class="sm:ml-auto mt-1 sm:mt-0">${chipActualizado()}</span>` : ''}
                </dd>
              </div>
            `;
    }).join('')}
        </dl>
      </div>
    </article>
  `;
  }).join('');


  // === 5) Acordeones: abrir/cerrar
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-acc-toggle]');
    if (!btn) return;
    const id = btn.getAttribute('data-acc-toggle');
    const body = document.getElementById(`acc-${id}`);
    body?.classList.toggle('hidden');
    // Rotación simple del chevron
    const ico = btn.querySelector('svg');
    ico?.classList.toggle('rotate-180');
  });

})();

