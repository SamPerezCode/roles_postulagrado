// Helpers
function setText(id, v) { const el = document.getElementById(id); if (el) el.textContent = (v ?? '—'); }
function calcularPorcentajePazYSalvo(estados) {
    const total = estados.length || 1;
    const ok = estados.filter(e => (e || '').toLowerCase() === 'paz y salvo').length;
    const p = Math.round((ok / total) * 100);
    setText('det-pazsalvo-porcentaje', p + '%');
    const bar = document.getElementById('barra-pazsalvo');
    if (bar) bar.style.width = p + '%';
}

// Mostrar detalle
async function verDetalleEstudiante(codigo) {
    // Oculta listado/tabla y muestras detalle
    document.getElementById('tabla-estudiantes-vinculados-proceso')?.classList.add('hidden');
    document.getElementById('detalle-estudiante')?.classList.remove('hidden');

    // Aquí harías fetch(código). Yo dejo mock para que veas el flujo.
    const d = {
        primerNombre: 'LEIDY', segundoNombre: 'JOHANA',
        primerApellido: 'BELTRAN', segundoApellido: 'CANO',
        programa: 'Especialización Derecho Internacional Público',
        genero: 'Femenino', grupoInvestigacion: { pertenece: false, nombre: '' },
        hijoFuncionario: false, hijoDocente: false,
        tipoDocumento: 'CÉDULA DE CIUDADANÍA COLOMBIANA', documento: codigo, lugarExpedicion: 'SOACHA',
        correoInstitucional: 'ljbeltran@universidadmayor.edu.co', correoPersonal: '', telefono: '3000000000', direccion: '-',
        documentoURL: '', codigoSaberProTYT: '', certificadoSaberProURL: '',
        funcionarioUCMC: false, docenteUCMC: false,
        esPostgrado: true, tituloPregrado: '—', universidadPregrado: '—', fechaGradoPregrado: '—',
        creditos: 24, formularioActualizado: false, esEgresado: false,
        pazSalvo: { financiera: 'Pendiente', admisiones: 'Pendiente', biblioteca: 'Pendiente', recursos: 'Pendiente', idiomas: 'Pendiente' }
    };

    // Pinta
    setText('det-primer-nombre', d.primerNombre);
    setText('det-segundo-nombre', d.segundoNombre);
    setText('det-primer-apellido', d.primerApellido);
    setText('det-segundo-apellido', d.segundoApellido);
    setText('det-programa', d.programa);
    setText('det-genero', d.genero);
    setText('det-grupo-investigacion', d.grupoInvestigacion?.pertenece ? 'Sí' : 'No');
    const filaGrupo = document.getElementById('fila-nombre-grupo');
    if (filaGrupo) filaGrupo.classList.toggle('hidden', !(d.grupoInvestigacion?.pertenece && d.grupoInvestigacion?.nombre));
    setText('det-nombre-grupo', d.grupoInvestigacion?.nombre || '—');
    setText('det-hijo-funcionario', d.hijoFuncionario ? 'Sí' : 'No');
    setText('det-hijo-docente', d.hijoDocente ? 'Sí' : 'No');

    setText('det-tipo-documento', d.tipoDocumento);
    setText('det-documento', d.documento);
    setText('det-lugar-expedicion', d.lugarExpedicion);
    setText('det-codigo-saber', d.codigoSaberProTYT || '—');

    setText('det-correo', d.correoInstitucional);
    setText('det-correo-personal', d.correoPersonal || '—');
    setText('det-telefono', d.telefono);
    setText('det-direccion', d.direccion);

    setText('det-es-funcionario-uni', d.funcionarioUCMC ? 'Sí' : 'No');
    setText('det-es-docente-uni', d.docenteUCMC ? 'Sí' : 'No');

    // posgrado
    const bloque = document.getElementById('bloque-pregrado');
    if (bloque) bloque.classList.toggle('hidden', !d.esPostgrado);
    setText('det-titulo-pregrado', d.tituloPregrado);
    setText('det-universidad-pregrado', d.universidadPregrado);
    setText('det-fecha-grado-pregrado', d.fechaGradoPregrado);

    // métricas
    setText('det-creditos', d.creditos);
    setText('det-formulario', d.formularioActualizado ? 'Sí' : 'No');
    setText('det-egresado', d.esEgresado ? 'Sí' : 'No');

    // paz y salvo
    setText('det-financiera', d.pazSalvo.financiera);
    setText('det-admisiones', d.pazSalvo.admisiones);
    setText('det-biblioteca', d.pazSalvo.biblioteca);
    setText('det-recursos', d.pazSalvo.recursos);
    setText('det-idiomas', d.pazSalvo.idiomas);
    calcularPorcentajePazYSalvo(Object.values(d.pazSalvo));
}

function volverAListadoEstudiantes() {
    document.getElementById('detalle-estudiante')?.classList.add('hidden');
    document.getElementById('tabla-estudiantes-vinculados-proceso')?.classList.remove('hidden');
}

// Wire-up
// 1) Botones Ver (delegación por si recargas la tabla)
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-ver');
    if (!btn) return;
    const codigo = btn.dataset.codigo || '';
    verDetalleEstudiante(codigo);
});

// 2) Volver
document.getElementById('btn-volver-listado')?.addEventListener('click', volverAListadoEstudiantes);
