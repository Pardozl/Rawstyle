if (!getToken()) window.location.href = 'login.html';

const colores = {
    pendiente:  'bg-yellow-100 text-yellow-800',
    procesando: 'bg-blue-100 text-blue-800',
    enviado:    'bg-purple-100 text-purple-800',
    entregado:  'bg-green-100 text-green-800',
    cancelado:  'bg-red-100 text-red-800',
};

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const lista = await pedidos.misPedidos();
        document.getElementById('loading').classList.add('hidden');

        if (lista.length === 0) {
            document.getElementById('sin-pedidos').classList.remove('hidden');
            return;
        }

        const contenedor = document.getElementById('lista-pedidos');
        contenedor.classList.remove('hidden');

        contenedor.innerHTML = lista.map(p => `
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <div>
            <span class="font-semibold text-gray-900">Pedido #${p.id}</span>
            <span class="text-sm text-gray-400 ml-3">
              ${new Date(p.creado_en).toLocaleDateString('es-CO', { year:'numeric', month:'long', day:'numeric' })}
            </span>
          </div>
          <span class="text-xs px-3 py-1 rounded-full font-medium ${colores[p.estado] || 'bg-gray-100 text-gray-600'}">
            ${p.estado.charAt(0).toUpperCase() + p.estado.slice(1)}
          </span>
        </div>
        <div class="px-6 py-4">
          <div class="space-y-2 mb-4">
            ${p.productos.map(prod => `
              <div class="flex items-center justify-between text-sm">
                <div class="flex items-center gap-3">
                  <img src="${prod.imagen_url || 'https://placehold.co/40x40/f3f4f6/9ca3af?text=RS'}"
                       class="w-10 h-10 object-cover rounded-lg bg-gray-100"/>
                  <span class="text-gray-700">${prod.nombre} × ${prod.cantidad}</span>
                </div>
                <span class="font-medium">$${(prod.precio_unitario * prod.cantidad).toLocaleString('es-CO')}</span>
              </div>
            `).join('')}
          </div>
          <div class="border-t pt-3 flex items-center justify-between text-sm text-gray-500">
            <span>Método: ${p.metodo_pago?.replace('_', ' ')}</span>
            <span class="font-bold text-gray-900 text-base">
              Total: $${Number(p.total).toLocaleString('es-CO')}
            </span>
          </div>
        </div>
      </div>
    `).join('');
    } catch (err) {
        document.getElementById('loading').textContent = 'Error al cargar pedidos.';
    }
});