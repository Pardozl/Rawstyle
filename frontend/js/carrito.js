document.addEventListener('DOMContentLoaded', () => {
    if (!getToken()) {
        window.location.href = 'login.html';
        return;
    }
    cargarCarrito();
});

async function cargarCarrito() {
    try {
        const data = await carrito.ver();
        renderCarrito(data);
    } catch (err) {
        document.getElementById('loading').textContent = 'Error al cargar el carrito.';
    }
}

function renderCarrito(data) {
    document.getElementById('loading').classList.add('hidden');

    if (data.items.length === 0) {
        document.getElementById('carrito-vacio').classList.remove('hidden');
        return;
    }

    document.getElementById('carrito-contenido').classList.remove('hidden');

    const lista = document.getElementById('items-lista');
    lista.innerHTML = data.items.map(item => `
    <div class="bg-white rounded-2xl border border-gray-100 p-4 flex gap-4 shadow-sm" id="item-${item.id}">
      <img src="${item.imagen_url || 'https://placehold.co/80x80/f3f4f6/9ca3af?text=RS'}"
           class="w-20 h-20 object-cover rounded-xl bg-gray-100"/>
      <div class="flex-1">
        <h3 class="font-semibold text-gray-900">${item.nombre}</h3>
        <p class="text-sm text-gray-500 mt-0.5">$${Number(item.precio).toLocaleString('es-CO')} c/u</p>
        <div class="flex items-center gap-3 mt-3">
          <div class="flex items-center border border-gray-200 rounded-lg overflow-hidden">
            <button onclick="cambiarCantidad(${item.id}, ${item.cantidad - 1})"
              class="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors font-medium">−</button>
            <span class="px-3 py-1 text-sm font-medium border-x border-gray-200">${item.cantidad}</span>
            <button onclick="cambiarCantidad(${item.id}, ${item.cantidad + 1})"
              class="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors font-medium">+</button>
          </div>
          <button onclick="quitarItem(${item.id})"
            class="text-sm text-red-400 hover:text-red-600 transition-colors">Eliminar</button>
        </div>
      </div>
      <div class="text-right">
        <span class="font-bold text-gray-900">
          $${Number(item.subtotal).toLocaleString('es-CO')}
        </span>
      </div>
    </div>
  `).join('');

    const envio = 10000;
    const subtotalNum = parseFloat(data.total);
    document.getElementById('subtotal').textContent    = `$${subtotalNum.toLocaleString('es-CO')}`;
    document.getElementById('total-final').textContent = `$${(subtotalNum + envio).toLocaleString('es-CO')}`;
}

async function cambiarCantidad(detalleId, nuevaCantidad) {
    if (nuevaCantidad < 1) {
        quitarItem(detalleId);
        return;
    }
    try {
        await carrito.actualizar(detalleId, { cantidad: nuevaCantidad });
        cargarCarrito();
    } catch (err) {
        alert(err.mensaje || 'Error al actualizar.');
    }
}

async function quitarItem(detalleId) {
    try {
        await carrito.eliminar(detalleId);
        cargarCarrito();
    } catch (err) {
        alert('Error al eliminar el producto.');
    }
}

async function confirmarVaciar() {
    if (!confirm('¿Vaciar todo el carrito?')) return;
    try {
        await carrito.vaciar();
        cargarCarrito();
    } catch (err) {
        alert('Error al vaciar el carrito.');
    }
}

function abrirCheckout() {
    document.getElementById('modal-checkout').classList.remove('hidden');
}

function cerrarCheckout() {
    document.getElementById('modal-checkout').classList.add('hidden');
}

async function confirmarPedido() {
    const direccion   = document.getElementById('direccion').value.trim();
    const metodo_pago = document.getElementById('metodo-pago').value;
    const errorDiv    = document.getElementById('error-checkout');
    const btn         = document.getElementById('btn-confirmar');

    errorDiv.classList.add('hidden');

    if (!direccion) {
        errorDiv.textContent = 'Ingresa tu dirección de envío.';
        errorDiv.classList.remove('hidden');
        return;
    }

    btn.textContent = 'Procesando...';
    btn.disabled = true;

    try {
        const resultado = await pedidos.crear({ metodo_pago, direccion_envio: direccion, costo_envio: 10000 });
        cerrarCheckout();
        alert(`¡Pedido #${resultado.pedido_id} creado! Total: $${Number(resultado.total).toLocaleString('es-CO')}`);
        window.location.href = 'historial.html';
    } catch (err) {
        errorDiv.textContent = err.mensaje || 'Error al procesar el pedido.';
        errorDiv.classList.remove('hidden');
        btn.textContent = 'Confirmar pedido';
        btn.disabled = false;
    }
}