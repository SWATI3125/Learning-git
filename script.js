// Global state management
let currentUser = null;
let isNewUser = false;

// DOM elements
const landingPage = document.getElementById('landing-page');
const dashboardPage = document.getElementById('dashboard-page');
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const welcomeMessage = document.getElementById('welcome-message');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    checkAuthStatus();
    
    // Add form event listeners
    setupFormHandlers();
    
    // Add keyboard navigation
    setupKeyboardNavigation();
});

// Authentication status check
function checkAuthStatus() {
    const savedUser = localStorage.getItem('educonnect_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showDashboard();
    } else {
        showLandingPage();
    }
}

// Page navigation functions
function showLandingPage() {
    landingPage.classList.add('active');
    dashboardPage.classList.remove('active');
}

function showDashboard() {
    landingPage.classList.remove('active');
    dashboardPage.classList.add('active');
    
    if (currentUser) {
        const greeting = isNewUser ? `Welcome New ${currentUser.name}` : `Welcome ${currentUser.name}`;
        welcomeMessage.textContent = greeting;
        isNewUser = false; // Reset after showing
    }
}

// Modal management functions
function openModal(type) {
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    if (type === 'login') {
        showLoginForm();
    } else if (type === 'register') {
        showRegisterForm();
    }
    
    // Focus on first input field
    setTimeout(() => {
        const firstInput = modalOverlay.querySelector('input');
        if (firstInput) firstInput.focus();
    }, 300);
}

function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = 'auto';
    
    // Clear form data
    clearForms();
}

function switchModal(type) {
    if (type === 'login') {
        showLoginForm();
    } else if (type === 'register') {
        showRegisterForm();
    }
}

function showLoginForm() {
    modalTitle.textContent = 'Welcome Back';
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    clearForms();
}

function showRegisterForm() {
    modalTitle.textContent = 'Create Account';
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    clearForms();
}

function clearForms() {
    // Clear all form inputs
    const inputs = modalOverlay.querySelectorAll('input');
    inputs.forEach(input => {
        input.value = '';
        input.classList.remove('error');
    });
    
    // Clear any error messages
    const errorMessages = modalOverlay.querySelectorAll('.error-message');
    errorMessages.forEach(msg => msg.remove());
}

// Form handling setup
function setupFormHandlers() {
    // Login form handler
    loginForm.addEventListener('submit', handleLogin);
    
    // Register form handler
    registerForm.addEventListener('submit', handleRegister);
    
    // Input validation on blur
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', validateInput);
        input.addEventListener('input', clearInputError);
    });
}

// Login handler
async function handleLogin(e) {
    e.preventDefault();
    
    const formData = new FormData(loginForm);
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Validate inputs
    if (!validateLoginForm(email, password)) {
        return;
    }
    
    // Show loading state
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
    submitBtn.disabled = true;
    
    try {
        // Simulate API call
        await simulateApiCall(1000);
        
        // Check if user exists in localStorage
        const users = JSON.parse(localStorage.getItem('educonnect_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Successful login
            currentUser = user;
            localStorage.setItem('educonnect_user', JSON.stringify(user));
            isNewUser = false;
            
            closeModal();
            showDashboard();
            showNotification('Welcome back!', 'success');
        } else {
            // Login failed
            showFormError(loginForm, 'Invalid email or password. Please try again.');
        }
    } catch (error) {
        showFormError(loginForm, 'Login failed. Please try again.');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Register handler
async function handleRegister(e) {
    e.preventDefault();
    
    const formData = new FormData(registerForm);
    const name = formData.get('name');
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    // Validate inputs
    if (!validateRegisterForm(name, email, password, confirmPassword)) {
        return;
    }
    
    // Show loading state
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    submitBtn.disabled = true;
    
    try {
        // Simulate API call
        await simulateApiCall(1500);
        
        // Check if user already exists
        const users = JSON.parse(localStorage.getItem('educonnect_users') || '[]');
        const existingUser = users.find(u => u.email === email);
        
        if (existingUser) {
            showFormError(registerForm, 'An account with this email already exists.');
            return;
        }
        
        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: password,
            createdAt: new Date().toISOString()
        };
        
        // Save to localStorage
        users.push(newUser);
        localStorage.setItem('educonnect_users', JSON.stringify(users));
        localStorage.setItem('educonnect_user', JSON.stringify(newUser));
        
        currentUser = newUser;
        isNewUser = true;
        
        closeModal();
        showDashboard();
        showNotification('Account created successfully!', 'success');
        
    } catch (error) {
        showFormError(registerForm, 'Registration failed. Please try again.');
    } finally {
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Form validation functions
function validateLoginForm(email, password) {
    let isValid = true;
    
    if (!email || !isValidEmail(email)) {
        showInputError('login-email', 'Please enter a valid email address');
        isValid = false;
    }
    
    if (!password || password.length < 6) {
        showInputError('login-password', 'Password must be at least 6 characters');
        isValid = false;
    }
    
    return isValid;
}

function validateRegisterForm(name, email, password, confirmPassword) {
    let isValid = true;
    
    if (!name || name.trim().length < 2) {
        showInputError('register-name', 'Name must be at least 2 characters');
        isValid = false;
    }
    
    if (!email || !isValidEmail(email)) {
        showInputError('register-email', 'Please enter a valid email address');
        isValid = false;
    }
    
    if (!password || password.length < 6) {
        showInputError('register-password', 'Password must be at least 6 characters');
        isValid = false;
    }
    
    if (password !== confirmPassword) {
        showInputError('register-confirm', 'Passwords do not match');
        isValid = false;
    }
    
    return isValid;
}

function validateInput(e) {
    const input = e.target;
    const value = input.value.trim();
    
    clearInputError(input);
    
    switch (input.type) {
        case 'email':
            if (value && !isValidEmail(value)) {
                showInputError(input.id, 'Please enter a valid email address');
            }
            break;
        case 'password':
            if (value && value.length < 6) {
                showInputError(input.id, 'Password must be at least 6 characters');
            }
            break;
        case 'text':
            if (input.name === 'name' && value && value.length < 2) {
                showInputError(input.id, 'Name must be at least 2 characters');
            }
            break;
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Error handling functions
function showInputError(inputId, message) {
    const input = document.getElementById(inputId);
    const formGroup = input.parentElement;
    
    // Remove existing error
    const existingError = formGroup.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error styling
    input.classList.add('error');
    
    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    formGroup.appendChild(errorDiv);
}

function clearInputError(input) {
    if (typeof input === 'object') {
        input.classList.remove('error');
        const formGroup = input.parentElement;
        const errorMessage = formGroup.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    } else {
        // If called from event listener
        const target = input.target || input;
        target.classList.remove('error');
        const formGroup = target.parentElement;
        const errorMessage = formGroup.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
}

function showFormError(form, message) {
    // Remove existing error
    const existingError = form.querySelector('.form-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Add error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.style.cssText = `
        color: #e74c3c;
        background: #fdf2f2;
        padding: 1rem;
        border-radius: 8px;
        margin-bottom: 1rem;
        text-align: center;
        font-weight: 500;
    `;
    errorDiv.textContent = message;
    
    form.insertBefore(errorDiv, form.firstChild);
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#00b894' : '#0984e3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        font-weight: 500;
        animation: slideInRight 0.3s ease-out;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Logout function
function logout() {
    currentUser = null;
    isNewUser = false;
    localStorage.removeItem('educonnect_user');
    showLandingPage();
    showNotification('You have been logged out', 'info');
}

// Mobile menu toggle
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}

// Keyboard navigation setup
function setupKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        // Close modal with Escape key
        if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
            closeModal();
        }
        
        // Submit form with Enter key when focused on form elements
        if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
            const form = e.target.closest('form');
            if (form) {
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn && !submitBtn.disabled) {
                    submitBtn.click();
                }
            }
        }
    });
}

// Utility function to simulate API calls
function simulateApiCall(delay = 1000) {
    return new Promise(resolve => {
        setTimeout(resolve, delay);
    });
}

// Add CSS for error states and notifications
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .form-group input.error {
        border-color: #e74c3c;
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
    }
    
    .error-message {
        color: #e74c3c;
        font-size: 0.875rem;
        margin-top: 0.5rem;
        display: flex;
        align-items: center;
        gap: 0.25rem;
    }
    
    .error-message::before {
        content: '⚠';
        font-size: 0.75rem;
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .nav-menu.active {
        display: flex;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        flex-direction: column;
        padding: 1rem 2rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        gap: 1rem;
    }
    
    @media (max-width: 768px) {
        .nav-menu {
            display: none;
        }
    }
`;

document.head.appendChild(additionalStyles);

// Export functions for global access (if needed)
window.openModal = openModal;
window.closeModal = closeModal;
window.switchModal = switchModal;
window.logout = logout;
window.toggleMobileMenu = toggleMobileMenu;