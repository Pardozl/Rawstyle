if (getToken()) window.location.href = '../index.html';

async function registrarse() {
    const nombre   = document.getElementById('nombre').value.trim();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('error');
    const exitoDiv = document.getElementById('exito');
    const btn      = document.getElementById('btn-reg');

    errorDiv.classList.add('hidden');
    exitoDiv.classList.add('hidden');

    if (!nombre || !email || !password) {
        errorDiv.textContent = 'Completa todos los campos.';
        errorDiv.classList.remove('hidden');
        return;
    }
    if (password.length < 6) {
        errorDiv.textContent = 'La contraseña debe tener al menos 6 caracteres.';
        errorDiv.classList.remove('hidden');
        return;
    }

    btn.textContent = 'Creando cuenta...';
    btn.disabled = true;

    try {
        await auth.registro({ nombre, email, password });
        exitoDiv.textContent = 'Cuenta creada. Redirigiendo al login...';
        exitoDiv.classList.remove('hidden');
        setTimeout(() => window.location.href = 'login.html', 1500);
    } catch (err) {
        errorDiv.textContent = err.mensaje || 'Error al registrarse.';
        errorDiv.classList.remove('hidden');
        btn.textContent = 'Crear cuenta';
        btn.disabled = false;
    }
}