document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const eyeIcon = document.getElementById('eye-icon');
    const btnSubmit = document.getElementById('btn-submit');
    const alertBox = document.getElementById('alert-box');
    const alertMessage = document.getElementById('alert-message');

    if (togglePasswordBtn && eyeIcon) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPassword = passwordInput.getAttribute('type') === 'password';
            if (isPassword) {
                passwordInput.setAttribute('type', 'text');
                eyeIcon.innerHTML = `<path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" x2="22" y1="2" y2="22"></line>`;
            } else {
                passwordInput.setAttribute('type', 'password');
                eyeIcon.innerHTML = `<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle>`;
            }
        });
    }

    function showAlert(message, type = 'error') {
        if (alertBox && alertMessage) {
            alertBox.className = `alert ${type}`;
            alertMessage.textContent = message;
            alertBox.classList.remove('hidden');
        }
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) { showAlert('Preencha os campos.'); return; }

        const btnText = btnSubmit.querySelector('.btn-text');
        const btnLoader = btnSubmit.querySelector('.btn-loader');
        btnSubmit.disabled = true;
        if (btnText) btnText.classList.add('hidden');
        if (btnLoader) btnLoader.classList.remove('hidden');

        try {
            // Simulador de carregamento estético para a requisição
            await new Promise(resolve => setTimeout(resolve, 1200));
            showAlert('Acesso autorizado! Entrando...', 'success');
            
            setTimeout(() => {
                const currentPath = window.location.pathname;
                const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
                // Direciona para o painel de produtos de forma segura
                window.location.replace(window.location.origin + basePath + "painel.html");
            }, 800);
        } catch (error) {
            btnSubmit.disabled = false;
        }
    });
});
