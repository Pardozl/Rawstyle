if (getToken()) window.location.href = '../index.html';

document.addEventListener('keydown', e => {
    if (e.key === 'Enter') iniciarSesion();
});

async function iniciarSesion() {
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('error');
    const btn      = document.getElementById('btn-login');

    errorDiv.classList.add('hidden');

    if (!email || !password) {
        errorDiv.textContent = 'Completa todos los campos.';
        errorDiv.classList.remove('hidden');
        return;
    }

    btn.textContent = 'Ingresando...';
    btn.disabled = true;

    try {
        const data = await auth.login({ email, password });
        localStorage.setItem('token',   data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));

        if (data.usuario.rol === 'admin') {
            window.location.href = 'admin.html';
        } else {
            window.location.href = '../index.html';
        }
    } catch (err) {
        errorDiv.textContent = err.mensaje || 'Error al iniciar sesión.';
        errorDiv.classList.remove('hidden');
        btn.textContent = 'Iniciar sesión';
        btn.disabled = false;
    }
}