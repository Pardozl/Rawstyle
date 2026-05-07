let productoActual = null;
let cantidad = 1;
let tallaSeleccionada = null;

document.addEventListener('DOMContentLoaded', async () => {
    renderNavbar();
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('no-encontrado').classList.remove('hidden');
        return;
    }

    try {
        productoActual = await productos.porId(id);
        renderProducto(productoActual);
    } catch (err) {
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('no-encontrado').classList.remove('hidden');
    }
});

function renderNavbar() {
    const usuario = getUsuario();
    const nav = document.getElementById('nav-acciones');
    if (usuario) {
        nav.innerHTML = `
      <a href="carrito.html" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none"
             viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.4 7h12.8M7 13H5.4
               M17 21a1 1 0 100-2 1 1 0 000 2zm-10 0a1 1 0 100-2 1 1 0 000 2z"/>
        </svg>
      </a>
      <button onclick="cerrarSesion()"
        class="text-sm text-gray-500 hover:text-black transition-colors">Salir</button>
    `;
    } else {
        nav.innerHTML = `
      <a href="login.html"
        class="text-sm font-medium text-gray-600 hover:text-black transition-colors">Iniciar sesión</a>
      <a href="registro.html"
        class="text-sm font-medium bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
        Registrarse
      </a>
    `;
    }
}

function renderProducto(p) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('producto-contenido').classList.remove('hidden');

    document.getElementById('bread-categoria').textContent  = p.categoria;
    document.getElementById('bread-nombre').textContent     = p.nombre;
    document.getElementById('prod-imagen').src              = p.imagen_url || 'https://placehold.co/600x600/f3f4f6/9ca3af?text=Rawstyle';
    document.getElementById('prod-imagen').alt              = p.nombre;
    document.getElementById('prod-categoria').textContent   = p.categoria;
    document.getElementById('prod-nombre').textContent      = p.nombre;
    document.getElementById('prod-descripcion').textContent = p.descripcion || 'Sin descripción disponible.';
    document.getElementById('prod-precio').textContent      = `$${Number(p.precio).toLocaleString('es-CO')}`;

    const stockEl  = document.getElementById('prod-stock');
    const stockDot = document.getElementById('stock-dot');
    if (p.stock > 0) {
        stockEl.textContent = `${p.stock} unidades disponibles`;
        stockDot.className  = 'w-2 h-2 rounded-full bg-green-500';
    } else {
        stockEl.textContent = 'Agotado';
        stockDot.className  = 'w-2 h-2 rounded-full bg-red-500';
        document.getElementById('btn-agregar').disabled = true;
        document.getElementById('btn-agregar').classList.add('opacity-50', 'cursor-not-allowed');
    }

    if (p.tallas && p.tallas.length > 0) {
        document.getElementById('seccion-tallas').classList.remove('hidden');
        const container = document.getElementById('tallas-container');
        container.innerHTML = p.tallas.map(t => `
      <button onclick="seleccionarTalla('${t}')" id="talla-${t}"
        class="talla-btn px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium
               text-gray-700 hover:border-black transition-all">
        ${t}
      </button>
    `).join('');
    }

    document.title = `${p.nombre} — Rawstyle`;
}

function seleccionarTalla(talla) {
    document.querySelectorAll('.talla-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById(`talla-${talla}`).classList.add('selected');
    tallaSeleccionada = talla;
    document.getElementById('talla-seleccionada').textContent = `Seleccionada: ${talla}`;
    document.getElementById('error-talla').classList.add('hidden');
}

function cambiarCantidad(delta) {
    const max = productoActual?.stock || 1;
    cantidad = Math.max(1, Math.min(cantidad + delta, max));
    document.getElementById('cantidad-display').textContent = cantidad;
}

async function agregarAlCarrito() {
    if (!getToken()) {
        window.location.href = 'login.html';
        return;
    }

    if (productoActual.tallas && productoActual.tallas.length > 0 && !tallaSeleccionada) {
        document.getElementById('error-talla').classList.remove('hidden');
        return;
    }

    const btn = document.getElementById('btn-agregar');
    btn.textContent = 'Agregando...';
    btn.disabled = true;

    try {
        await carrito.agregar({ producto_id: productoActual.id, cantidad });
        const toast = document.getElementById('toast-prod');
        toast.textContent = `¡Agregado al carrito! (Talla: ${tallaSeleccionada || 'Única'})`;
        toast.classList.remove('hidden');
        setTimeout(() => toast.classList.add('hidden'), 3000);
    } catch (err) {
        const toast = document.getElementById('toast-prod');
        toast.textContent = err.mensaje || 'Error al agregar.';
        toast.className = toast.className.replace('green', 'red');
        toast.classList.remove('hidden');
    } finally {
        btn.textContent = 'Agregar al carrito';
        btn.disabled = false;
    }
}