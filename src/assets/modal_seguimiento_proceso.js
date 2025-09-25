const modal = document.getElementById('modal-estudiantes');
const btnOpen = document.getElementById('btnOpenStudents');
const btnClose = document.getElementById('btnCloseStudents');

const formBox = document.getElementById('form-add-student');
const btnToggleForm = document.getElementById('btnToggleAddForm');
const btnCloseForm = document.getElementById('btnCloseAddForm');
const btnCancelForm = document.getElementById('btnCancelAddForm');
const inputAdd = document.getElementById('inputAddStudent');

function openModal() {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.documentElement.style.overflow = 'hidden'; // lock scroll
    // reconstruye/actualiza las cards al abrir
    if (typeof window.refreshMobileCards === 'function') {
        window.refreshMobileCards();
    }
}
function closeModal() {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.documentElement.style.overflow = ''; // unlock
    // al cerrar, esconde el formulario si estaba abierto
    if (formBox && !formBox.classList.contains('hidden')) toggleAddForm('hide');
    // por si estabas dentro del detalle, vuelve al listado
    if (typeof window.volverAListadoEstudiantes === 'function') {
        window.volverAListadoEstudiantes();
    }
}

function toggleAddForm(force) {
    if (!formBox) return;
    if (force === 'show') formBox.classList.remove('hidden');
    else if (force === 'hide') formBox.classList.add('hidden');
    else formBox.classList.toggle('hidden');

    if (!formBox.classList.contains('hidden')) {
        inputAdd?.focus();
    } else {
        const res = document.getElementById('addStudentResult');
        if (res) res.innerHTML = '';
        if (inputAdd) inputAdd.value = '';
    }
}

// Abrir
btnOpen?.addEventListener('click', openModal);
// Cerrar con la X
btnClose?.addEventListener('click', closeModal);
// Cerrar con clic en fondo (solo si click en el backdrop, no en la caja)
modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});
// Cerrar con Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) closeModal();
});

// Toggle del formulario “Agregar estudiante”
btnToggleForm?.addEventListener('click', () => toggleAddForm());
btnCloseForm?.addEventListener('click', () => toggleAddForm('hide'));
btnCancelForm?.addEventListener('click', () => toggleAddForm('hide'));

(function () {
    const TABLE_ID = 'tabla-estudiantes-vinculados-proceso';
    const CARDS_ID = 'cards-estudiantes';
    const SEARCH_ID = 'buscarModalEst';

    function getTableRows() {
        const tbody = document.querySelector(`#${TABLE_ID} tbody`);
        return tbody ? Array.from(tbody.querySelectorAll('tr')) : [];
    }

    function rowToData(row) {
        const tds = row.querySelectorAll('td');
        if (tds.length < 8) return null;

        const pensum = tds[0].innerText.trim();
        const codigo = tds[1].innerText.trim();
        const documento = tds[2].innerText.trim();
        const nombre = tds[3].innerText.trim();
        const categoria = tds[4].innerText.trim();
        const situacion = tds[5].innerText.trim();
        const credPend = tds[6].innerText.trim();
        const accionesTD = tds[7];

        const btnVer = accionesTD.querySelector('button, a'); // primero
        const btnQuitar =
            accionesTD.querySelectorAll('button, a')[1] || null; // segundo (no usado ahora)

        return {
            row,
            pensum,
            codigo,
            documento,
            nombre,
            categoria,
            situacion,
            credPend,
            btnVer,
            btnQuitar,
        };
    }

    function buildCardHTML(d) {
        return `
      <article class="rounded-xl border bg-white p-3 shadow-sm">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h4 class="font-semibold text-gray-900">${d.nombre}</h4>
            <p class="text-xs text-gray-500 mt-0.5">
              <span class="font-medium">Código:</span> ${d.codigo} ·
              <span class="font-medium">Documento:</span> ${d.documento}
            </p>
            <p class="text-xs text-gray-500">
              <span class="font-medium">Categoría:</span> ${d.categoria}
            </p>
            <p class="text-xs text-gray-500">
              <span class="font-medium">Situación:</span> ${d.situacion}
            </p>
          </div>
          <div class="shrink-0 self-start rounded-full bg-gray-100 px-2 py-1 text-[10px] text-gray-600">
            ${d.credPend} cred. pend.
          </div>
        </div>

        <div class="mt-3 flex justify-end gap-2">
          <button class="btn-card-ver inline-flex items-center px-2.5 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700" type="button">
            Ver
          </button>
          <button class="btn-card-ver inline-flex items-center px-2.5 py-1.5 text-xs font-medium bg-red-600 text-white rounded hover:bg-blue-700" type="button">
            Quitar
          </button>
        </div>
      </article>
    `;
    }

    function buildMobileCardsFromTable() {
        const container = document.getElementById(CARDS_ID);
        if (!container) return;

        const rows = getTableRows();
        container.innerHTML = '';

        rows.forEach((row) => {
            const data = rowToData(row);
            if (!data) return;

            const wrapper = document.createElement('div');
            wrapper.innerHTML = buildCardHTML(data).trim();
            const card = wrapper.firstElementChild;

            // Botón Ver de la card
            const btnVerCard = card.querySelector('.btn-card-ver');

            if (btnVerCard) {
                btnVerCard.addEventListener('click', (e) => {
                    e.preventDefault();

                    // Prioridad: dataset del botón real -> columna "Código" -> columna "Documento"
                    const code =
                        (data.btnVer && data.btnVer.dataset.codigo) ||
                        data.codigo ||
                        data.documento ||
                        '';

                    if (code && typeof window.verDetalleEstudiante === 'function') {
                        window.verDetalleEstudiante(code);
                    } else if (data.btnVer) {
                        // Fallback: dispara el botón de la fila original
                        data.btnVer.click();
                    }
                });
            }

            container.appendChild(card);
        });
    }

    function wireSearch() {
        const input = document.getElementById(SEARCH_ID);
        if (!input) return;

        input.addEventListener('input', function () {
            const q = this.value.toLowerCase().trim();

            // Filtra filas de la tabla
            getTableRows().forEach((row) => {
                row.style.display = row.innerText.toLowerCase().includes(q) ? '' : 'none';
            });

            // Filtra cards
            const cards = document.querySelectorAll(`#${CARDS_ID} article`);
            cards.forEach((card) => {
                card.style.display = card.innerText.toLowerCase().includes(q) ? '' : 'none';
            });
        });
    }

    // Reconstruye cards cuando se abre el modal (openModal lo llama)
    window.refreshMobileCards = buildMobileCardsFromTable;

    // En DOM listo
    document.addEventListener('DOMContentLoaded', () => {
        buildMobileCardsFromTable();
        wireSearch();
    });

    // Rearmar al redimensionar (solo en móvil)
    window.addEventListener('resize', () => {
        if (window.innerWidth < 768) buildMobileCardsFromTable();
    });
})();

// === Vista de detalle (global) ===
(function () {
    const TABLE_ID = 'tabla-estudiantes-vinculados-proceso';
    const CARDS_ID = 'cards-estudiantes';

    // Muestra detalle y oculta listado
    window.verDetalleEstudiante = async function (codigo) {
        // Oculta listado (tabla + cards) y controles
        document.getElementById(TABLE_ID)?.classList.add('hidden');
        document.getElementById(CARDS_ID)?.classList.add('hidden');
        document.getElementById('form-add-student')?.classList.add('hidden');
        document.getElementById('buscarModalEst')?.parentElement?.classList.add('hidden');
        document.getElementById('boton-agregar-nuevo-estudiante')?.classList.add('hidden');
        document.getElementById('encabezado-contextual')?.classList.add('hidden');

        // Muestra detalle
        document.getElementById('detalle-estudiante')?.classList.remove('hidden');

        // Aquí podrías hacer tu fetch real y poblar campos:
        // await cargarDetalleEstudianteDesdeAPI(codigo);
        console.log('verDetalleEstudiante → código:', codigo);
    };

    // Regresa al listado
    window.volverAListadoEstudiantes = function () {
        document.getElementById('detalle-estudiante')?.classList.add('hidden');

        document.getElementById(TABLE_ID)?.classList.remove('hidden');
        document.getElementById(CARDS_ID)?.classList.remove('hidden');
        document.getElementById('buscarModalEst')?.parentElement?.classList.remove('hidden');
        document.getElementById('boton-agregar-nuevo-estudiante')?.classList.remove('hidden');
        document.getElementById('encabezado-contextual')?.classList.remove('hidden');

        // Mantén cerrado el form al volver
        if (!formBox?.classList.contains('hidden')) toggleAddForm('hide');
    };
})();
