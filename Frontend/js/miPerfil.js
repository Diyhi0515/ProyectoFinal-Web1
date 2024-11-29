(async function cargarDatosPerfil() {
    const userInSession = JSON.parse(localStorage.getItem("userInSession"));

    if (!userInSession) {
        document.location.href = "login.html";
        return;
    }

    const userId = userInSession.id;
    const userProfilePic = document.getElementById("user-profile-pic-perfil");

    try {
        const response = await fetch(`http://localhost:3000/api/usuario/${userId}`);
        if (!response.ok) throw new Error("Error al cargar los datos del usuario");

        const userData = await response.json();

        const direccion = document.querySelector("#direccion");
        const imageId = document.querySelector("#idimage");

        
        document.querySelector("#nombre").value = userData.nombre;
        document.querySelector("#apellido-paterno").value = userData.ap_paterno;
        document.querySelector("#apellido-materno").value = userData.ap_materno;
        document.querySelector("#email").value = userData.email;
        document.querySelector("#usuario").value = userData.nombre_user;
        document.querySelector("#password").value = "******";
        document.querySelector("#nit-ci").value = userData.nit_ci || "";
        document.querySelector("#celular").value = userData.celular || "";
        direccion.value = userData.direccion.direccion || "Ingrse una direccion";
        direccion.dataset.id = userData.direcciones.length > 0 ? userData.direcciones[0].id_direc : 0;
        console.log(direccion.dataset.id);
        imageId.value = userData.imagen_id || 0;
       

        if (userData.imagen_id) {
            const imageUrl = `http://localhost:3000/api/imagen/${userData.imagen_id}`;
            userProfilePic.src = imageUrl;
            
        }

        if (userData.direcciones.length > 1) {
            let html = "";
            userData.direcciones.slice(1, userData.direcciones.length).forEach((direccion, index) => {
                html += createAddressElement(index, direccion.direccion, direccion.id_direc);
            });

            const extraAddressList = document.getElementById("address-list");
            extraAddressList.innerHTML = html;
        }

    } catch (error) {
        console.error(error);
        alert("Error al cargar el perfil del usuario.");
    }
    
})();

document.querySelector("#add-address").addEventListener("click", addAddress);



function addAddress() {
    let addresses = [...document.querySelectorAll(".extra-address")];
    const addressList = addresses.map(e => e.value);

    const index = addresses.length;
    const element = createAddressElement(index);
    const parent = document.querySelector("#address-list");
    parent.innerHTML += element;
    addresses = document.querySelectorAll(".extra-address")
    for (var i in addressList) {
        addresses[i].value = addressList[i];
    }
}

function createAddressElement(index, value = "", id = 0) {
    return `<div class="mt-3">
                <div class="input-group">
                    <input type="text" class="form-control address extra-address" 
                           value="${value}" data-id="${id || 0}" placeholder="Ingrese una Direccion">
                    <div class="input-group-append">
                        <span class="input-group-text pointer" onclick="removeAddress(${index})">
                            <i class="fa-solid fa-trash"></i>
                        </span>
                    </div>
                </div>
                <div class="text-danger validation" style="display: none">
                    La dirección es requerida
                </div>
            </div>`;
}

function removeAddress(index) {

    let addresses = [...document.querySelectorAll(".extra-address")];
    const addressList = addresses.map(e => { 
        return { 
            "value": e.value.trim(), 
            "id": e.dataset.id 
        }; 
    });


    addressList.splice(index, 1);

  
    let html = "";
    for (let i = 0; i < addressList.length; i++) {
        html += createAddressElement(i, addressList[i].value, addressList[i].id);
    }
    document.querySelector("#address-list").innerHTML = html;
}




document.querySelector(".perfil-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const userInSession = JSON.parse(localStorage.getItem("userInSession"));
    const userId = userInSession.id;
    console.log(userInSession);

    let hasError = false;

    const requiredFields = [
        { id: "#nombre", errorId: "#error-nombre", errorMessage: "El nombre es requerido." },
        { id: "#apellido-paterno", errorId: "#error-apellido-paterno", errorMessage: "El apellido paterno es requerido." },
        { id: "#apellido-materno", errorId: "#error-apellido-apellido-materno", errorMessage: "El apellido materno es requerido." },
        { id: "#email", errorId: "#error-apellido-apellido-materno", errorMessage: "El correo electrónico es requerido." },
        { id: "#usuario", errorId: "#error-usuario", errorMessage: "El nombre de usuario es requerido." }
    ];

    requiredFields.forEach((field) => {
        const input = document.querySelector(field.id);
        const errorElement = document.querySelector(field.errorId);

        if (input.value.trim() === "") {
            hasError = true;
            errorElement.textContent = field.errorMessage;
            errorElement.style.display = "block";
        } else {
            errorElement.style.display = "none";
        }
    });

    const direcciones = document.querySelectorAll(".address");
    direcciones.forEach((direccion) => {
        if (direccion.value.trim() === "") {
            hasError = true;
            direccion.parentElement.nextElementSibling.style.display = "block";
        } else {
            direccion.parentElement.nextElementSibling.style.display = "none";
        }
    });

    if (hasError)
        return;

    const nroDirecciones = [...direcciones].map((direccion) => {
        return {
            "direccion": direccion.value.trim(),
            "id_direc": direccion.dataset.id || 0, 
            "id_user": userId
        };
    });



    const updatedUser = {
        id: userId,
        nombre: document.querySelector("#nombre").value.trim(),
        ap_paterno: document.querySelector("#apellido-paterno").value.trim(),
        ap_materno: document.querySelector("#apellido-materno").value.trim(),
        email: document.querySelector("#email").value.trim(),
        nombre_user: document.querySelector("#usuario").value.trim(),
        nit_ci: document.querySelector("#nit-ci").value.trim(),
        celular: document.querySelector("#celular").value.trim(),
        imagen_id: document.querySelector("#idimage").value.trim(),
        direcciones: nroDirecciones,
    };
    console.log(updatedUser);
    
    try {
        const response = await fetch(`http://localhost:3000/api/usuario`, {
            method: "PUT",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedUser),
        });

        if (!response.ok) throw new Error("Error al actualizar los datos");

    } catch (error) {
        console.error(error);
    }
});

document.querySelector("#btn-change-photo").addEventListener("click", () => {
    document.querySelector("#change-photo").click();
});

document.querySelector("#change-photo").addEventListener("change", async function () {
    const input = this;

    if (input.files.length === 0) {
        alert("Por favor, selecciona una imagen.");
        return;
    }

    const data = new FormData();
    data.append("file", input.files[0]);

    try {
        const response = await fetch("http://localhost:3000/api/imagen", {
            method: "POST",
            body: data,
        });

        if (!response.ok) throw new Error("Error al subir la imagen");

        const imageId = await response.json();

        document.querySelector("#idimage").value = imageId;
        const userProfilePic = document.getElementById("user-profile-pic-perfil");
        userProfilePic.src = `http://localhost:3000/api/imagen/${imageId}`;


        const userInSession = JSON.parse(localStorage.getItem("userInSession"));
        userInSession.imageId = imageId;
        localStorage.setItem("userInSession", JSON.stringify(userInSession));

    } catch (error) {
        console.error(error);
    }
});







