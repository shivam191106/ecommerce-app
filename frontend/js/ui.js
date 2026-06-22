function renderNavAuthState() {
  const authSlot = document.getElementById('nav-auth-slot');
  if (!authSlot) return;

  if (Session.isLoggedIn()) {
    const user = Session.getUser();
    const firstName = user.name.split(' ')[0];

    authSlot.innerHTML = `
      <div class="nav-user-menu">
        <button class="icon-btn nav-user-trigger" id="nav-user-trigger">
          Hi, ${firstName} ▾
        </button>
        <div class="nav-user-dropdown" id="nav-user-dropdown">
          <a href="profile.html">My Orders</a>
          ${user.role === 'admin' ? '<a href="admin.html">Admin Dashboard</a>' : ''}
          <button id="logout-btn">Log Out</button>
        </div>
      </div>
    `;

    const trigger = document.getElementById('nav-user-trigger');
    const dropdown = document.getElementById('nav-user-dropdown');

    trigger.addEventListener('click', () => {
      dropdown.classList.toggle('visible');
    });

    document.addEventListener('click', (e) => {
      if (!trigger.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('visible');
      }
    });

    document.getElementById('logout-btn').addEventListener('click', () => {
      Session.logout();
      window.location.href = 'index.html';
    });
  } else {
    authSlot.innerHTML = `<a href="login.html" class="btn btn-secondary">Login</a>`;
  }
}

document.addEventListener('DOMContentLoaded', renderNavAuthState);