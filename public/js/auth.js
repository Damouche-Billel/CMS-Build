document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('error-message');

    function setLoading(formType, isLoading) {
        const spinner = document.getElementById(`${formType}-spinner`);
        const button = document.getElementById(`${formType}-button`);
        
        if (spinner && button) {
            spinner.style.display = isLoading ? 'block' : 'none';
            button.disabled = isLoading;
            button.textContent = isLoading ? 
                (formType === 'login' ? 'Logging in...' : 'Registering...') : 
                (formType === 'login' ? 'Login to CMS' : 'Register');
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (errorMessage) {
                errorMessage.textContent = '';
                errorMessage.style.display = 'none';
            }

            if (!username || !password) {
                showError('Please enter both username and password');
                return;
            }

            setLoading('login', true);

            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                    credentials: 'include'
                });

                const data = await response.json();

                if (data.success) {
                    localStorage.setItem('fennec_user', JSON.stringify(data.user));
                    window.location.href = 'dashboard.html';
                } else {
                    showError(data.message || 'Invalid username or password');
                }
            } catch (error) {
                showError('Login failed. Please try again later.');
            } finally {
                setLoading('login', false);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            const username = document.getElementById('reg-username').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('reg-confirm-password').value;

            if (password !== confirmPassword) {
                showError('Passwords do not match');
                return;
            }

            setLoading('register', true);

            try {
                const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username,
                        email,
                        password
                    })
                });

                const data = await response.json();

                if (data.success) {
                    alert('Registration successful! Please check your email to verify your account.');
                    window.location.href = '/login.html';
                } else {
                    showError(data.message || 'Registration failed');
                }
            } catch (error) {
                console.error('Registration error:', error);
                showError('Registration failed. Please try again.');
            } finally {
                setLoading('register', false);
            }
        });
    }

    checkAuthStatus();

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }

    function showError(message) {
        if (errorMessage) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        } else {
            alert(message);
        }
    }

    function checkAuthStatus() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        const protectedPages = ['dashboard.html', 'news.html', 'fixtures.html', 'merchandise.html', 'profile.html', 'users.html'];
        
        fetch('/api/auth/check-auth', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('Auth check response:', data);
            
            if (data.success && data.isAuthenticated) {
                if (data.user) {
                    localStorage.setItem('fennec_user', JSON.stringify(data.user));
                    updateUserDisplay(data.user);
                }
                
                if (['login.html', 'register.html', 'index.html', ''].includes(currentPage)) {
                    window.location.href = 'dashboard.html';
                }
            } else {
                localStorage.removeItem('fennec_user');
                if (protectedPages.includes(currentPage)) {
                    window.location.href = 'login.html';
                }
            }
        })
        .catch(error => {
            console.error('Auth check error:', error);
            fallbackAuthCheck(currentPage, protectedPages);
        });
    }

    function fallbackAuthCheck(currentPage, protectedPages) {
        const userData = localStorage.getItem('fennec_user');
        if (userData) {
            const user = JSON.parse(userData);
            updateUserDisplay(user);
            if (['login.html', 'index.html', ''].includes(currentPage)) window.location.href = 'dashboard.html';
        } else {
            if (protectedPages.includes(currentPage)) window.location.href = 'login.html';
        }
    }

    function updateUserDisplay(user) {
        const usernameDisplay = document.getElementById('username-display');
        if (usernameDisplay && user) usernameDisplay.textContent = user.username;

        document.querySelectorAll('.admin-only').forEach(e => {
            if (user && user.role === 'admin') {
                e.classList.remove('locked');
                e.style.display = 'list-item';
            } else {
                e.classList.add('locked');
                e.style.display = 'list-item';
            }
        });

        // Show sidebar after role check
        const sidebar = document.querySelector('.dashboard-sidebar');
        if (sidebar) sidebar.style.visibility = 'visible';
    }

    function logout() {
        fetch('/api/auth/logout', {
            method: 'GET',
            credentials: 'include'
        })
        .then(r => r.json())
        .then(data => {
            localStorage.removeItem('fennec_user');
            window.location.href = 'login.html';
        })
        .catch(() => {
            localStorage.removeItem('fennec_user');
            window.location.href = 'login.html';
        });
    }

    // Check URL parameters on login page
    if (window.location.href.includes('login.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('verified') === 'true') {
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message';
            successMessage.style.display = 'block';
            successMessage.textContent = 'Email verified successfully! You can now login.';
            
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.prepend(successMessage);
            }
        }
    }
});
