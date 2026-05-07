let productoEditandoId = null;

document.addEventListener('DOMContentLoaded', () => {
    const usuario = getUsuario();
    if (!usuario || usuario.rol !== 'admin') {
        window.location.href = '../index.html';
        return;
    }
    cargarProductosAdmin();
});

function mostrarTab(tab) {
    const btnProd = document.getElementById('tab-productos');
    const btnPed  = document.getElementById('tab-pedidos');

    ['productos', 'pedidos'].forEach(t => {
        document.getElementById(`section-${t}`).classList.add('hidden');
    });
    document.getElementById(`section-${tab}`).classList.remove('hidden');

    btnProd.className = 'py-4 text-sm font-medium border-b-2 transition-colors ' +
        (tab === 'productos' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black');
    btnPed.className = 'py-4 text-sm font-medium border-b-2 transition-colors ' +
        (tab === 'pedidos' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-black');

    if (tab === 'pedidos') cargarPedidosAdmin();
}

function actualizarTallas(categoriaId) {
    const esPantalon = String(categoriaId) === '2';
    document.getElementById('tallas-ropa').classList.toggle('hidden', esPantalon);
    document.getElementById('tallas-pantalon').classList.toggle('hidden', !esPantalon);
    // Desmarcar todo al cambiar categoría
    document.querySelectorAll('.talla-check input').forEach(i => i.checked = false);
}

function getTallasSeleccionadas() {
    const contenedor = document.getElementById('tallas-ropa').classList.contains('hidden')
        ? 'tallas-pantalon' : 'tallas-ropa';
    return [...document.querySelectorAll(`#${contenedor} input:checked`)].map(i => i.value);
}

function marcarTallas(tallas = []) {
    document.querySelectorAll('.talla-check input').forEach(i => {
        i.checked = tallas.includes(i.value);
    });
}

async function cargarProductosAdmin() {
    try {
        const lista = await productos.todosAdmin();
        document.getElementById('loading-prod').classList.add('hidden');
        document.getElementById('tabla-productos').classList.remove('hidden');

        document.getElementById('body-productos').innerHTML = lista.map(p => `
  <tr class="hover:bg-gray-50 transition-colors">
    <td class="px-6 py-4">
      <div class="flex items-center gap-3">
        <img src="${p.imagen_url || 'https://placehold.co/40x40/f3f4f6/9ca3af?text=RS'}"
             class="w-10 h-10 object-cover rounded-lg bg-gray-100"/>
        <span class="font-medium text-gray-900">${p.nombre}</span>
      </div>
    </td>
    <td class="px-6 py-4 text-gray-500">${p.categoria}</td>
    <td class="px-6 py-4 font-medium">$${Number(p.precio).toLocaleString('es-CO')}</td>
    <td class="px-6 py-4">
      <span class="${p.stock <= 5 ? 'text-red-500' : 'text-gray-700'} font-medium">${p.stock}</span>
    </td>
    <td class="px-6 py-4">
      <div class="flex flex-wrap gap-1">
        ${p.tallas && p.tallas.length > 0
            ? p.tallas.map(t => `<span class="text-xs border border-gray-200 rounded px-1.5 py-0.5 text-gray-500">${t}</span>`).join('')
            : '<span class="text-xs text-gray-400">—</span>'
        }
      </div>
    </td>
    <td class="px-6 py-4">
      <span class="text-xs px-2.5 py-1 rounded-full font-medium
        ${p.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}">
        ${p.activo ? 'Activo' : 'Inactivo'}
      </span>
    </td>
    <td class="px-6 py-4">
      <div class="flex gap-2">
        <button onclick="editarProducto(${p.id})"
          class="text-xs px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
          Editar
        </button>
        <button onclick="toggleProducto(${p.id}, ${p.activo})"
          class="text-xs px-3 py-1.5 border rounded-lg transition-colors
            ${p.activo
            ? 'border-red-200 text-red-500 hover:bg-red-50'
            : 'border-green-200 text-green-600 hover:bg-green-50'}">
          ${p.activo ? 'Desactivar' : 'Activar'}
        </button>
      </div>
    </td>
  </tr>
`).join('');
    } catch (err) {
        document.getElementById('loading-prod').textContent = 'Error al cargar productos.';
    }
}

function abrirModalProducto() {
    productoEditandoId = null;
    document.getElementById('modal-titulo').textContent   = 'Nuevo producto';
    document.getElementById('p-nombre').value      = '';
    document.getElementById('p-categoria').value   = '1';
    document.getElementById('p-descripcion').value = '';
    document.getElementById('p-precio').value      = '';
    document.getElementById('p-stock').value       = '';
    document.getElementById('p-imagen').value      = '';
    document.getElementById('p-activo-div').classList.add('hidden');
    document.getElementById('error-modal').classList.add('hidden');
    actualizarTallas(1);
    marcarTallas([]);
    document.getElementById('modal-producto').classList.remove('hidden');
}

async function editarProducto(id) {
    try {
        const p = await productos.porId(id);
        productoEditandoId = id;
        document.getElementById('modal-titulo').textContent   = 'Editar producto';
        document.getElementById('p-nombre').value      = p.nombre;
        document.getElementById('p-categoria').value   = p.categoria_id;
        document.getElementById('p-descripcion').value = p.descripcion || '';
        document.getElementById('p-precio').value      = p.precio;
        document.getElementById('p-stock').value       = p.stock;
        document.getElementById('p-imagen').value      = p.imagen_url || '';
        document.getElementById('p-activo-div').classList.remove('hidden');
        document.getElementById('p-activo').checked    = p.activo;
        document.getElementById('error-modal').classList.add('hidden');
        actualizarTallas(p.categoria_id);
        marcarTallas(p.tallas || []);
        document.getElementById('modal-producto').classList.remove('hidden');
    } catch (err) {
        alert('Error al cargar el producto.');
    }
}

function cerrarModalProducto() {
    document.getElementById('modal-producto').classList.add('hidden');
}

async function guardarProducto() {
    const nombre       = document.getElementById('p-nombre').value.trim();
    const categoria_id = document.getElementById('p-categoria').value;
    const descripcion  = document.getElementById('p-descripcion').value.trim();
    const precio       = document.getElementById('p-precio').value;
    const stock        = document.getElementById('p-stock').value;
    const imagen_url   = document.getElementById('p-imagen').value.trim();
    const activo       = document.getElementById('p-activo').checked;
    const tallas       = getTallasSeleccionadas();
    const errorDiv     = document.getElementById('error-modal');
    const btn          = document.getElementById('btn-guardar');

    errorDiv.classList.add('hidden');

    if (!nombre || !precio || stock === '') {
        errorDiv.textContent = 'Nombre, precio y stock son obligatorios.';
        errorDiv.classList.remove('hidden');
        return;
    }

    btn.textContent = 'Guardando...';
    btn.disabled = true;

    const body = {
        categoria_id,
        nombre,
        descripcion,
        precio:    parseFloat(precio),
        stock:     parseInt(stock),
        imagen_url,
        activo,
        tallas,
    };

    try {
        if (productoEditandoId) {
            await productos.actualizar(productoEditandoId, body);
        } else {
            await productos.crear(body);
        }
        cerrarModalProducto();
        cargarProductosAdmin();
    } catch (err) {
        errorDiv.textContent = err.mensaje || 'Error al guardar.';
        errorDiv.classList.remove('hidden');
    } finally {
        btn.textContent = 'Guardar';
        btn.disabled = false;
    }
}

async function toggleProducto(id, activo) {
    const accion = activo ? 'desactivar' : 'activar';
    if (!confirm(`¿Deseas ${accion} este producto?`)) return;

    try {
        const p = await productos.porId(id);
        await productos.actualizar(id, {
            categoria_id: p.categoria_id,
            nombre:       p.nombre,
            descripcion:  p.descripcion,
            precio:       p.precio,
            stock:        p.stock,
            imagen_url:   p.imagen_url,
            tallas:       p.tallas || [],
            activo:       activo ? 0 : 1,
        });
        cargarProductosAdmin();
    } catch (err) {
        alert('Error al cambiar estado del producto.');
    }
}


async function cargarPedidosAdmin() {
    const colores = {
        pendiente:  'bg-yellow-100 text-yellow-800',
        procesando: 'bg-blue-100 text-blue-800',
        enviado:    'bg-purple-100 text-purple-800',
        entregado:  'bg-green-100 text-green-800',
        cancelado:  'bg-red-100 text-red-800',
    };

    try {
        const lista = await pedidos.todos();
        document.getElementById('loading-ped').classList.add('hidden');
        const contenedor = document.getElementById('lista-pedidos-admin');
        contenedor.classList.remove('hidden');

        if (lista.length === 0) {
            contenedor.innerHTML = '<p class="text-center text-gray-400 py-10">No hay pedidos aún.</p>';
            return;
        }

        contenedor.innerHTML = lista.map(p => `
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div class="flex items-start justify-between mb-3">
          <div>
            <span class="font-semibold">Pedido #${p.id}</span>
            <span class="text-sm text-gray-400 ml-2">
              ${new Date(p.creado_en).toLocaleDateString('es-CO', { year:'numeric', month:'long', day:'numeric' })}
            </span>
            <div class="text-sm text-gray-500 mt-0.5">${p.cliente} — ${p.email}</div>
          </div>
          <div class="flex items-center gap-3">
            <span class="text-xs px-3 py-1 rounded-full font-medium ${colores[p.estado] || 'bg-gray-100 text-gray-600'}">
              ${p.estado}
            </span>
            <select onchange="actualizarEstado(${p.id}, this.value)"
              class="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-black">
              <option value="">Cambiar estado</option>
              <option value="pendiente">Pendiente</option>
              <option value="procesando">Procesando</option>
              <option value="enviado">Enviado</option>
              <option value="entregado">Entregado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>
        <div class="text-sm text-gray-600 space-y-1 mb-3">
          ${p.productos.map(pr => `
            <div class="flex justify-between">
              <span>${pr.nombre} × ${pr.cantidad}</span>
              <span>$${(pr.precio_unitario * pr.cantidad).toLocaleString('es-CO')}</span>
            </div>
          `).join('')}
        </div>
        <div class="border-t pt-3 flex justify-between text-sm">
          <span class="text-gray-500">${p.metodo_pago?.replace('_', ' ')} · ${p.direccion_envio}</span>
          <span class="font-bold">$${Number(p.total).toLocaleString('es-CO')}</span>
        </div>
      </div>
    `).join('');
    } catch (err) {
        document.getElementById('loading-ped').textContent = 'Error al cargar pedidos.';
    }
}

async function actualizarEstado(pedidoId, estado) {
    if (!estado) return;
    try {
        await pedidos.cambiarEstado(pedidoId, { estado });
        cargarPedidosAdmin();
    } catch (err) {
        alert('Error al actualizar el estado.');
    }
}