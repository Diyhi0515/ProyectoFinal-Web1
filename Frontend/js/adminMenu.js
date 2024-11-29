const userIcon = document.getElementById('user-icon');
const userProfilePic = document.getElementById('user-profile-pic');
const menuPerfil = document.getElementById('menu-perfil');
const btnSalir = document.getElementById('btn-salir');


userIcon.addEventListener('click', () => {
   
    menuPerfil.style.display = menuPerfil.style.display === 'none' || menuPerfil.style.display === '' ? 'block' : 'none';
    
    if (userProfilePic.style.display === 'none') {
        userProfilePic.style.display = 'block';
    }
});


btnSalir.addEventListener('click', () => {
    localStorage.removeItem('userInSession');
    document.location.href = "index.html";
});
