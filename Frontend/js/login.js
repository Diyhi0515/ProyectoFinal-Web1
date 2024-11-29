(function () {

    if (localStorage.getItem("userInSession")) {
        document.location.href = "index.html";
        return;
    }

    const form = document.querySelector("#login-form");
    const msgError = document.querySelector("#msg-error-login");

    form.addEventListener('submit', (e) => {
        e.preventDefault();

  
        document.querySelector("#validation-username").style.display = "none";
        document.querySelector("#validation-password").style.display = "none";
        msgError.style.display = "none";

        const inputUsername = document.querySelector("#inputUsername");
        const inputPassword = document.querySelector("#inputPassword");

        let hasError = false;


        if (inputUsername.value.trim() === "") {
            hasError = true;
            document.querySelector("#validation-username").style.display = "block";
        }

        if (inputPassword.value.trim() === "") {
            hasError = true;
            document.querySelector("#validation-password").style.display = "block";
        }

        if (hasError) {
            return;
        }

        const usuario = {
            "loginInput": inputUsername.value,
            "password": inputPassword.value
        };

        fetch('http://localhost:3000/api/usuario/login', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(usuario)
        })
        .then((response) => {
            if (!response.ok) {
                throw new Error(response.status);
            }
            return response.json();
        })
        .then((data) => {
            if (data.message) { 
                msgError.innerHTML = data.message; 
                msgError.style.display = "block"; 
                return;
            }

            
            localStorage.setItem("userInSession", JSON.stringify(data));

            
            if (data.rol_id === 2) {
                document.location.href = "index.html"; 
            } else {
                document.location.href = "adminProductos.html";
            }
        })
        .catch((error) => {
            msgError.innerHTML = "Usuario y/o Contraseña son inválidos"; 
            msgError.style.display = "block"; 
        });
    });

})();
