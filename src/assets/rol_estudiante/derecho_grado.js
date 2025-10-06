(function () {
    // ====== Datos simulados ======
    const DG = {
        monto: 198000,
        fechaMax: '2025-10-20',
        urlRecibo: '/files/recibo-dg-605032223.pdf',
        urlPago: 'https://pagos.unicolmayor.edu/pasarela',
        pagado: true,
        fechaPago: '2025-10-03T16:20:00Z',
        updatedAt: new Date().toISOString()
    };

    // ====== Helpers ======
    const fmtCOP = (n) => (n ?? 0).toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
    const fmtFecha = (x) => new Date(x).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: '2-digit' });
    const diasFalt = (x) => Math.ceil((new Date(x) - new Date()) / 86400000);

    // ====== Refs del DOM ======
    const v = document.getElementById('dg-valor');
    const f = document.getElementById('dg-fecha');
    const c = document.getElementById('dg-count');
    const chip = document.getElementById('dg-chip');
    const alertBox = document.getElementById('dg-alert');

    const btnRecibo = document.getElementById('dg-btn-recibo');
    const btnPagar = document.getElementById('dg-btn-pagar');

    const cardValor = document.getElementById('dg-card-valor');
    const cardFecha = document.getElementById('dg-card-fecha');
    const cardRecibo = document.getElementById('dg-card-recibo'); // por si lo necesitas luego
    const lblValor = document.getElementById('dg-valor-label');
    const lblFecha = document.getElementById('dg-fecha-label');

    // Si falta algo crítico, no seguimos (evita errores de null)
    if (!v || !f || !c || !chip || !alertBox || !btnRecibo || !btnPagar || !lblValor || !lblFecha || !cardValor || !cardFecha) {
        console.warn('Derecho a grado: faltan nodos en el DOM. Revisa los IDs.', {
            v, f, c, chip, alertBox, btnRecibo, btnPagar, lblValor, lblFecha, cardValor, cardFecha
        });
        return;
    }

    // ====== Pintar datos fijos ======
    v.textContent = fmtCOP(DG.monto);
    f.textContent = fmtFecha(DG.fechaMax);
    btnRecibo.href = DG.urlRecibo || '#';
    if (DG.urlPago) btnPagar.href = DG.urlPago;

    // ====== Estado ======
    if (DG.pagado) {
        chip.textContent = 'Pago registrado';
        chip.className = 'rounded-full px-3 py-1 text-xs font-semibold ring-1 bg-emerald-50 text-emerald-700 ring-emerald-200';

        alertBox.className = 'mt-3 rounded-xl px-3 py-2 text-sm ring-1 bg-emerald-50 text-emerald-800 ring-emerald-200';
        alertBox.innerHTML = `Tu pago fue <b>registrado</b> el ${fmtFecha(DG.fechaPago)}. ¡Gracias!`;

        // Opacar tarjetas/labels
        lblValor.textContent = 'Monto pagado';
        lblFecha.textContent = 'Fecha límite (no aplica tras pago)';
        cardValor.classList.add('opacity-60');
        cardFecha.classList.add('opacity-60');

        // Ocultar pagar, deshabilitar recibo
        btnPagar.classList.add('hidden');
        btnRecibo.classList.add('opacity-50', 'cursor-not-allowed');
        btnRecibo.setAttribute('aria-disabled', 'true');
        btnRecibo.removeAttribute('href');
        btnRecibo.addEventListener('click', (e) => e.preventDefault());

        c.textContent = 'Comprobante disponible en tu historial de pagos.';
        c.className = 'text-xs mt-1 text-gray-500';

    } else {
        chip.textContent = 'Pendiente';
        chip.className = 'rounded-full px-3 py-1 text-xs font-semibold ring-1 bg-amber-50 text-amber-700 ring-amber-200';

        const d = diasFalt(DG.fechaMax);
        const urg = d <= 3 ? 'text-rose-600' : (d <= 7 ? 'text-amber-600' : 'text-gray-600');

        alertBox.className = 'mt-3 rounded-xl px-3 py-2 text-sm ring-1 bg-amber-50 text-amber-800 ring-amber-200';
        alertBox.innerHTML = `Aún no registramos tu pago. <b>Descarga el recibo</b> y realiza el pago antes de la fecha límite.`;

        // Restaurar estilos por si antes estuvo en pagado
        lblValor.textContent = 'Monto a pagar';
        lblFecha.textContent = 'Fecha máxima para el pago';
        cardValor.classList.remove('opacity-60');
        cardFecha.classList.remove('opacity-60');

        // Recibo habilitado si hay URL
        if (DG.urlRecibo) {
            btnRecibo.href = DG.urlRecibo;
            btnRecibo.classList.remove('opacity-50', 'cursor-not-allowed');
            btnRecibo.removeAttribute('aria-disabled');
        }
        // Pagar en línea visible si hay URL
        if (DG.urlPago) {
            btnPagar.classList.remove('hidden');
            btnPagar.href = DG.urlPago;
        } else {
            btnPagar.classList.add('hidden');
        }

        c.textContent = d >= 0 ? `Faltan ${d} día${d === 1 ? '' : 's'} para el vencimiento.` : 'Venció el plazo de pago.';
        c.className = `text-xs mt-1 ${urg}`;
    }
})();
