(function () {
    const form = document.querySelector("#register-form");
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        manejarRegistro();
    });

    document.getElementById("imageUploader").addEventListener("change", function () {
        uploadImage();
    });
})();

function manejarRegistro() {
    limpiarErrores();

    const usuario = obtenerDatosFormulario();
    const errores = validarDatos(usuario);

    const imageId = document.querySelector("#imageId").value;
    if (imageId === "0") {
        errores.imageUploader = "Debes seleccionar una foto de perfil.";
    }

    if (Object.keys(errores).length > 0) {
        mostrarErroresIndividuales(errores);
        return;
    }

    usuario.imagen_id = imageId;

    registrarUsuario(usuario)
        .then(() => {
            document.location.href = "login.html?msg=registroExitoso";
        })
        .catch((error) => {
            mostrarErrorGeneral(error.message || "Error en el registro. Inténtalo de nuevo.");
        });
}

function obtenerDatosFormulario() {
    return {
        nombre: document.querySelector("#nombre").value.trim(),
        ap_paterno: document.querySelector("#ap_paterno").value.trim(),
        ap_materno: document.querySelector("#ap_materno").value.trim(),
        nombre_user: document.querySelector("#nombre_user").value.trim(),
        email: document.querySelector("#email").value.trim(),
        contrasena: document.querySelector("#contrasena").value.trim(),
        imagen_id: document.querySelector("#imageId").value.trim()
    };
}

function validarDatos(usuario) {
    const errores = {};

    for (const [key, value] of Object.entries(usuario)) {
        if (!value && key !== "imageId") {
            errores[key] = `El campo ${key.replace(/_/g, " ")} no puede estar vacío.`;
        }
    }

    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (usuario.email && !emailPattern.test(usuario.email)) {
        errores.email = "El correo electrónico no es válido.";
    }

    if (usuario.imageId === "0") {
        errores.imageUploader = "Debes seleccionar una foto de perfil.";
    }

    return errores;
}

function limpiarErrores() {
    document.querySelectorAll(".error-msg").forEach((msg) => (msg.innerHTML = ""));
    document.querySelector("#msg-error-register").style.display = "none";
}

function mostrarErroresIndividuales(errores) {
    for (const [key, mensaje] of Object.entries(errores)) {
        const errorContainer = document.querySelector(`#error-${key}`);
        if (errorContainer) {
            errorContainer.innerHTML = mensaje;
        }
    }

    if (errores.imageUploader) {
        const errorImage = document.querySelector("#error-image");
        if (errorImage) {
            errorImage.innerHTML = errores.imageUploader;
        }
    }
}

function mostrarErrorGeneral(mensaje) {
    const msgErrorGeneral = document.querySelector("#msg-error-register");
    msgErrorGeneral.innerHTML = mensaje;
    msgErrorGeneral.style.display = "block";
}

async function registrarUsuario(usuario) {
    const response = await fetch("http://localhost:3000/api/usuario", {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(usuario),
    });

    if (!response.ok) {
        if (response.status === 409) {
            throw new Error("El nombre de usuario o correo ya está registrado.");
        }
        throw new Error("Error en el servidor.");
    }

    return response.json();
}

function uploadImage() {
    const input = document.querySelector("#imageUploader");

    if (input.files.length === 0) {
        alert("Por favor, seleccione una imagen.");
        return;
    }

    const data = new FormData();
    data.append("file", input.files[0]);

    fetch("http://localhost:3000/api/imagen", {
        method: "POST",
        body: data,
    })
        .then((response) => response.json())
        .then((imageId) => {
            document.getElementById("imageId").value = imageId;
        })
        .catch((error) => {
            console.error("Error al subir la imagen:", error);
        });
}
