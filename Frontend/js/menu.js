document.addEventListener("DOMContentLoaded", function () {
    initializeUserMenu();
    initializeMobileMenu();
    
});

async function initializeUserMenu() {
    const userInSession = localStorage.getItem("userInSession");
    const userInSessionParsed = JSON.parse(userInSession);

    const carritoId = localStorage.getItem("carritoId");

    const carritoCount = document.getElementById("carrito-count");
    
    const desktopProfileLink = document.getElementById("desktop-profile-link");
    const desktopCartLink = document.getElementById("desktop-cart-link");
    const desktopOrdersLink = document.getElementById("desktop-orders-link");

    const carritoicon = document.getElementById("carrito-icon");


    const mobileProfileLink = document.getElementById("mobile-profile-link");
    const mobileCartLink = document.getElementById("mobile-cart-link");
    const mobileOrdersLink = document.getElementById("mobile-orders-link");

    if (!userInSession) {

        const optionUser = document.getElementById("login-options");
        optionUser.style.display = "none";

        const userIcon = document.getElementById("user-icon");
        const toggleOptionUser = () => {
            optionUser.style.display = (optionUser.style.display === "block") ? "none" : "block";
        };
        userIcon.addEventListener("click", toggleOptionUser);

        document.getElementById("user-profile-pic").style.display = "none";


        desktopProfileLink.href = "login.html";
        desktopCartLink.href = "login.html";
        desktopOrdersLink.href = "login.html";

        mobileProfileLink.href = "login.html";
        mobileCartLink.href = "login.html";
        mobileOrdersLink.href = "login.html";

        return;
    }

    if(!carritoId) {
        desktopCartLink.href = "#";
        mobileCartLink.href = "#";
        carritoicon.href = "#";
    }else{
        desktopCartLink.href = "carrito.html";
        mobileCartLink.href = "carrito.html";
        carritoicon.href = "carrito.html";
        try {
            const response = await fetch(`http://localhost:3000/api/carrito/${carritoId}`);
            if (!response.ok) throw new Error("No se pudo obtener la información del carrito");

            const carrito = await response.json();

            if (carrito.importe_productos && carrito.importe_productos > 0) {
                console.log(carrito.importe_productos);
                carritoCount.textContent = carrito.importe_productos;
                carritoCount.style.display = "inline-block";
            } else {
                carritoCount.style.display = "none";
            }
        } catch (error) {
            console.error("Error al cargar el carrito:", error);
            carritoCount.style.display = "none";
        }
    }
    try {
        const pedidosResponse = await fetch(`http://localhost:3000/api/pedido/cliente/${userInSessionParsed.id}`);
        const pedidos = await pedidosResponse.json();
       
        if (pedidosResponse.status === 404) {
            desktopOrdersLink.href = "#";
            mobileOrdersLink.href = "#";
        }else
        {
            desktopOrdersLink.href = "pedidos.html";
            mobileOrdersLink.href = "pedidos.html";
        }
    } catch (error) {
        console.error("Error al verificar los pedidos:", error);
        desktopOrdersLink.href = "#";
        mobileOrdersLink.href = "#";
    }

    let usuarioNew = 0;

    const user = JSON.parse(userInSession);
    
    try {
        const response = await fetch(`http://localhost:3000/api/usuario/${user.id}`);
        if (!response.ok) throw new Error("Error al cargar los datos del usuario");

        const userData = await response.json();
        usuarioNew = userData;
    } catch (error) {
        console.error(error);
        alert("Error al cargar el perfil del usuario.");
    }

    const userImage = document.getElementById("user-profile-pic");
    const userIcon = document.getElementById("user-icon");

    if (usuarioNew.imagen_id && usuarioNew.imagen_id > 0) {
        userImage.src = `http://localhost:3000/api/imagen/${usuarioNew.imagen_id}`;
        userImage.style.display = "inline-block";
        userIcon.style.display = "none";
    } else {
        userIcon.style.display = "inline-block";
        userImage.style.display = "none";
    }

    const profileMenu = document.getElementById("menu-perfil");
    profileMenu.style.display = "none";

    const toggleProfileMenu = () => {
        profileMenu.style.display = (profileMenu.style.display === "block") ? "none" : "block";
    };

    if (userImage.style.display === "inline-block") {
        userImage.addEventListener("click", toggleProfileMenu);
    } else {
        userIcon.addEventListener("click", toggleProfileMenu);
    }

    document.getElementById("btn-salir").addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("userInSession");
        location.reload();
    });


    desktopProfileLink.href = "miPerfil.html";

    mobileProfileLink.href = "miPerfil.html";

}

function initializeMobileMenu() {
    const menuOption = document.getElementById("menu-option");
    const mobileMenu = document.getElementById("mobile-menu");

    if (!menuOption || !mobileMenu) {
        console.error("Elementos necesarios no encontrados en el DOM.");
        return;
    }

    menuOption.addEventListener("click", function () {
        const isMenuVisible = mobileMenu.style.display === "block";
        mobileMenu.style.display = isMenuVisible ? "none" : "block";
    });
}

