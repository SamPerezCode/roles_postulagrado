//  ===================== JS de la vista ===================== 

// Mock inicial (simula $procesoActividad->actividades)
const actividades = [
    { id: 1, descripcion: 'Publicación del cronograma y lineamientos', fecha_inicio: '2025-08-04', fecha_fin: '2025-08-06' },
    { id: 2, descripcion: 'Consolidado preliminar de posibles graduandos', fecha_inicio: '2025-08-05', fecha_fin: '2025-08-08' },
    { id: 3, descripcion: 'Apertura de postulación y actualización de datos', fecha_inicio: '2025-08-07', fecha_fin: '2025-08-22' },
    { id: 4, descripcion: 'Solicitud y arranque de Paz y Salvo institucional', fecha_inicio: '2025-08-08', fecha_fin: '2025-09-30' },
    { id: 5, descripcion: 'Verificación de requisitos académicos', fecha_inicio: '2025-08-12', fecha_fin: '2025-09-20' },
];

// Estado del formulario (null = crear)
let editIndex = null;

// Nodos
const tbActividades = document.getElementById('tbActividades');
const formBox = document.getElementById('formActividad');
const formTitulo = document.getElementById('formTitulo');
const fDesc = document.getElementById('f_descripcion');
const fInicio = document.getElementById('f_inicio');
const fFin = document.getElementById('f_fin');
const btnNueva = document.getElementById('btnNuevaActividad');
const btnGuardarForm = document.getElementById('btnGuardarForm');
const btnCancelarForm = document.getElementById('btnCancelarForm');
const btnGuardarTodo = document.getElementById('btnGuardarTodo');

// Helpers
const showForm = () => formBox.classList.remove('hidden');
const hideForm = () => formBox.classList.add('hidden');
const clearForm = () => { fDesc.value = ''; fInicio.value = ''; fFin.value = ''; };

function pintarTabla() {
    tbActividades.innerHTML = '';
    actividades.forEach((a, i) => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50';
        tr.innerHTML = `
        <td class="px-4 py-3 align-top text-gray-900">${a.descripcion}</td>
        <td class="px-4 py-3 text-gray-900">${a.fecha_inicio}</td>
        <td class="px-4 py-3 text-gray-900">${a.fecha_fin}</td>
        <td class="px-4 py-3">
            <div class="flex flex-wrap items-center gap-2">
                <button data-edit="${i}"
                class="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300">Editar</button>
                <button data-del="${i}"
                class="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300">Eliminar</button>
            </div>
            </td>
            `;
        tbActividades.appendChild(tr);
    });
}

function openCreate() {
    editIndex = null;
    formTitulo.textContent = 'Agregar Nueva Actividad';
    btnGuardarForm.textContent = 'Agregar Actividad';
    clearForm();
    showForm();
}

function openEdit(index) {
    editIndex = index;
    const a = actividades[index];
    fDesc.value = a.descripcion;
    fInicio.value = a.fecha_inicio;
    fFin.value = a.fecha_fin;
    formTitulo.textContent = 'Editar Actividad';
    btnGuardarForm.textContent = 'Actualizar Actividad';
    showForm();
}

function saveForm() {
    const d = fDesc.value.trim();
    const i = fInicio.value;
    const f = fFin.value;
    if (!d || !i || !f) return alert('Completa todos los campos.');

    if (editIndex === null) {
        actividades.push({ id: 0, descripcion: d, fecha_inicio: i, fecha_fin: f });
    } else {
        actividades[editIndex] = { ...actividades[editIndex], descripcion: d, fecha_inicio: i, fecha_fin: f };
    }
    hideForm(); clearForm(); pintarTabla();
}

function deleteItem(index) {
    actividades.splice(index, 1);
    pintarTabla();
}

// Listeners
btnNueva.addEventListener('click', openCreate);
btnCancelarForm.addEventListener('click', () => { hideForm(); clearForm(); editIndex = null; });
btnGuardarForm.addEventListener('click', saveForm);

tbActividades.addEventListener('click', (e) => {
    const editBtn = e.target.closest('[data-edit]');
    const delBtn = e.target.closest('[data-del]');
    if (editBtn) openEdit(Number(editBtn.dataset.edit));
    if (delBtn) deleteItem(Number(delBtn.dataset.del));
});

btnGuardarTodo.addEventListener('click', () => {
    // aquí enviarías al backend; por ahora solo mostramos
    console.log('Actividades a guardar:', actividades);
    alert('Cambios guardados y notificación enviada (demo).');
});

// Init
pintarTabla();


// Nodos extra para móvil
const cardsActividades = document.getElementById('cardsActividades');

// --- render de tabla (igual que tenías) ---
function pintarTabla() {
    tbActividades.innerHTML = '';
    actividades.forEach((a, i) => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-gray-50';
        tr.innerHTML = `
      <td class="px-4 py-3 align-top text-gray-900">${a.descripcion}</td>
      <td class="px-4 py-3 text-gray-900">${a.fecha_inicio}</td>
      <td class="px-4 py-3 text-gray-900">${a.fecha_fin}</td>
      <td class="px-4 py-3">
        <div class="flex flex-wrap items-center gap-2">
          <button data-edit="${i}" class="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300">Editar</button>
          <button data-del="${i}" class="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300">Eliminar</button>
        </div>
      </td>`;
        tbActividades.appendChild(tr);
    });
}

// --- render de cards (móvil) ---
function pintarCards() {
    if (!cardsActividades) return;
    cardsActividades.innerHTML = '';
    actividades.forEach((a, i) => {
        const card = document.createElement('article');
        card.className = 'rounded-xl border bg-white p-3 shadow-sm';
        card.innerHTML = `
      <h3 class="text-sm font-semibold text-gray-900">${a.descripcion}</h3>
      <div class="mt-2 grid grid-cols-2 gap-3 text-xs text-gray-700">
        <div>
          <p class="font-medium text-gray-800">Inicio</p>
          <p>${a.fecha_inicio}</p>
        </div>
        <div>
          <p class="font-medium text-gray-800">Fin</p>
          <p>${a.fecha_fin}</p>
        </div>
      </div>
      <div class="mt-3 flex flex-wrap gap-2">
        <button data-edit="${i}" class="rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300">Editar</button>
        <button data-del="${i}" class="rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300">Eliminar</button>
      </div>`;
        cardsActividades.appendChild(card);
    });
}

// Redibuja ambas vistas
function pintarUI() {
    pintarTabla();
    pintarCards();
}

// Listeners existentes: añade manejo para clicks en cards
if (cardsActividades) {
    cardsActividades.addEventListener('click', (e) => {
        const editBtn = e.target.closest('[data-edit]');
        const delBtn = e.target.closest('[data-del]');
        if (editBtn) openEdit(Number(editBtn.dataset.edit));
        if (delBtn) deleteItem(Number(delBtn.dataset.del));
    });
}

// En lugar de pintarTabla(), llama:
pintarUI();

// y tras guardar/editar/eliminar:
hideForm(); clearForm(); pintarUI();

