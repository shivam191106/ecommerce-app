function showFormError(message) {
  const errorBox = document.getElementById('form-error');
  if (!errorBox) return;
  errorBox.textContent = message;
  errorBox.classList.add('visible');
}

function hideFormError() {
  const errorBox = document.getElementById('form-error');
  if (!errorBox) return;
  errorBox.classList.remove('visible');
}

function setButtonLoading(button, isLoading, loadingText = 'Please wait...') {
  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.textContent = loadingText;
    button.disabled = true;
  } else {
    button.textContent = button.dataset.originalText || button.textContent;
    button.disabled = false;
  }
}

// ===========================
// Login form handling
// ===========================
function initLoginForm() {
  const form = document.getElementById('login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFormError();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const submitBtn = form.querySelector('button[type="submit"]');

    setButtonLoading(submitBtn, true, 'Logging in...');

    try {
      const userData = await AuthAPI.login(email, password);
      Session.setUser(userData);
      window.location.href = 'index.html';
    } catch (error) {
      showFormError(error.message);
      setButtonLoading(submitBtn, false);
    }
  });
}

// ===========================
// Register form handling
// ===========================
function initRegisterForm() {
  const form = document.getElementById('register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideFormError();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const submitBtn = form.querySelector('button[type="submit"]');

    if (password !== confirmPassword) {
      showFormError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      showFormError('Password must be at least 6 characters');
      return;
    }

    setButtonLoading(submitBtn, true, 'Creating account...');

    try {
      const userData = await AuthAPI.register(name, email, password);
      Session.setUser(userData);
      window.location.href = 'index.html';
    } catch (error) {
      showFormError(error.message);
      setButtonLoading(submitBtn, false);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initLoginForm();
  initRegisterForm();
});