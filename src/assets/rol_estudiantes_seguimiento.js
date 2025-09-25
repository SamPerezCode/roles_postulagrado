// helpers modal OK
const mdOk = document.getElementById('md-ok');
function openOk(titulo, texto) {
    document.getElementById('md-ok-title').textContent = titulo || 'Listo';
    document.getElementById('md-ok-text').textContent = texto || 'Acción realizada correctamente.';
    mdOk.classList.remove('hidden'); mdOk.classList.add('flex');
    document.documentElement.style.overflow = 'hidden';
}
document.querySelectorAll('[data-close="md-ok"]').forEach(b => {
    b.addEventListener('click', () => { mdOk.classList.add('hidden'); mdOk.classList.remove('flex'); document.documentElement.style.overflow = ''; });
});

// notificaciones: marcar leído / marcar todo
document.getElementById('btnMarcarTodo')?.addEventListener('click', () => {
    document.querySelectorAll('#listaNotif li').forEach(li => {
        li.classList.remove('bg-gray-50'); li.classList.add('bg-white', 'opacity-70');
        li.querySelector('.h-2.5')?.classList.add('bg-gray-300');
    });
    openOk('¡Hecho!', 'Todas las notificaciones fueron marcadas como leídas.');
});
document.querySelectorAll('#listaNotif li button').forEach(btn => {
    btn.addEventListener('click', () => {
        const li = btn.closest('li');
        li.classList.remove('bg-gray-50'); li.classList.add('bg-white', 'opacity-70');
        li.querySelector('.h-2.5')?.classList.add('bg-gray-300');
    });
});

// pago: descargar/validar (simulado)
document.getElementById('btnDescargarRecibo')?.addEventListener('click', () => {
    openOk('Descarga iniciada', 'Estamos generando tu recibo RG-2025-001234.');
});
document.getElementById('btnVerificarPago')?.addEventListener('click', () => {
    // Simula que ahora está pagado
    const estado = document.getElementById('pago-estado');
    estado.innerHTML = '<span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span> Pagado';
    openOk('Pago verificado', 'Tu pago fue registrado correctamente.');
});

// contacto (simulado)
document.getElementById('frmContacto')?.addEventListener('submit', (e) => {
    e.preventDefault();
    openOk('Mensaje enviado', 'Tu consulta fue enviada al programa. Te llegará una copia a tu correo.');
    e.target.reset();
});