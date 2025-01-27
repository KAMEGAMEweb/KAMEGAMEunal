// Guardar usuarios registrados en localStorage
function getUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

function saveUsers(users) {
    localStorage.setItem('users', JSON.stringify(users));
}

// Registrar un nuevo usuario
function registerUser(username, password, country, avatar) {
    const users = getUsers();

    if (users.find(user => user.username === username)) {
        alert('El nombre de usuario ya está registrado.');
        return false;
    }

    users.push({
        username,
        password,
        country,
        avatar,
        xp: 0, // Experiencia inicial
    });

    saveUsers(users);
    alert('Usuario registrado con éxito.');
    return true;
}

// Iniciar sesión
function loginUser(username, password) {
    const users = getUsers();
    const user = users.find(user => user.username === username && user.password === password);

    if (!user) {
        alert('Usuario o contraseña incorrectos.');
        return false;
    }

    localStorage.setItem('loggedInUser', JSON.stringify(user));
    return true;
}

// Obtener el usuario actualmente logueado
function getLoggedInUser() {
    const user = localStorage.getItem('loggedInUser');
    return user ? JSON.parse(user) : null;
}

// Cerrar sesión
function logoutUser() {
    localStorage.removeItem('loggedInUser');
    window.location.href = 'login.html';
}


// Cerrar sesión del usuario
function logoutUser() {
    localStorage.removeItem('loggedInUser'); // Elimina al usuario logueado
    window.location.href = 'login.html'; // Redirige al login
}