document.addEventListener("DOMContentLoaded", () => {

    const roleForm = document.getElementById("roleForm");
    const rolesTable = document.getElementById("rolesTable").querySelector("tbody");

    const adminForm = document.getElementById("adminForm");
    const adminsTable = document.getElementById("adminsTable").querySelector("tbody");
    const adminRoleSelect = document.getElementById("adminRole");

    roleForm.addEventListener("submit", handleRoleFormSubmit);
    adminForm.addEventListener("submit", handleAdminFormSubmit);


    loadRolesTable(rolesTable);
    loadAdmins(adminsTable);
    loadRoles(adminRoleSelect); 
});

function handleRoleFormSubmit(event) {
    event.preventDefault();

    const roleName = document.getElementById("roleName").value.trim();

    if (!roleName) {
        document.getElementById("roleNameError").textContent = "El nombre del rol es obligatorio.";
        return;
    } else {
        document.getElementById("roleNameError").textContent = "";
    }

    const roleData = { nombre: roleName };
    const method = roleForm.dataset.roleId ? "PUT" : "POST";
    const url = method === "PUT"
        ? `http://localhost:3000/api/roles`
        : `http://localhost:3000/api/roles`;

    fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roleData),
    })
        .then(() => {
            alert("Rol guardado correctamente");
            loadRolesTable(document.getElementById("rolesTable").querySelector("tbody"));
            roleForm.reset();
        })
        .catch((error) => console.error("Error al guardar el rol:", error));
}

function handleAdminFormSubmit(event) {
    event.preventDefault();

    const adminName = document.getElementById("adminName").value.trim();
    const adminLastName = document.getElementById("adminLastName").value.trim();
    const adminSecondLastName = document.getElementById("adminSecondLastName").value.trim();
    const adminUsername = document.getElementById("adminUsername").value.trim();
    const adminEmail = document.getElementById("adminEmail").value.trim();
    const adminRole = document.getElementById("adminRole").value;
    const adminPassword = document.getElementById("adminPassword").value.trim();


    let valid = true;

    if (!adminName) {
        document.getElementById("adminNameError").textContent = "El nombre es obligatorio.";
        valid = false;
    } else {
        document.getElementById("adminNameError").textContent = "";
    }

    if (!adminLastName) {
        document.getElementById("adminLastNameError").textContent = "El apellido paterno es obligatorio.";
        valid = false;
    } else {
        document.getElementById("adminLastNameError").textContent = "";
    }

    if (!adminSecondLastName) {
        document.getElementById("adminSecondLastNameError").textContent = "El apellido materno es obligatorio.";
        valid = false;
    } else {
        document.getElementById("adminSecondLastNameError").textContent = "";
    }

    if (!adminUsername) {
        document.getElementById("adminUsernameError").textContent = "El username es obligatorio.";
        valid = false;
    } else {
        document.getElementById("adminUsernameError").textContent = "";
    }

    if (!adminEmail) {
        document.getElementById("adminEmailError").textContent = "El correo es obligatorio.";
        valid = false;
    } else {
        document.getElementById("adminEmailError").textContent = "";
    }

    if (!adminRole) {
        document.getElementById("adminRoleError").textContent = "Selecciona un rol.";
        valid = false;
    } else {
        document.getElementById("adminRoleError").textContent = "";
    }

    if (!adminPassword) {
        document.getElementById("adminPasswordError").textContent = "La contraseña es obligatoria.";
        valid = false;
    } else {
        document.getElementById("adminPasswordError").textContent = "";
    }

    if (!valid) return;

    const adminData = {
        nombre: adminName,
        ap_paterno: adminLastName,
        ap_materno: adminSecondLastName,
        nombre_user: adminUsername,
        email: adminEmail,
        rol_id: parseInt(adminRole),
        contrasena: adminPassword,
    };

    const method = adminForm.dataset.adminId ? "PUT" : "POST";
    const url = method === "PUT"
        ? `http://localhost:3000/api/admin`
        : `http://localhost:3000/api/admin`;

    fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adminData),
    })
        .then(() => {
            alert("Administrador guardado correctamente");
            loadAdmins(document.getElementById("adminsTable").querySelector("tbody"));
            adminForm.reset();
        })
        .catch((error) => console.error("Error al guardar el administrador:", error));
}


function loadRolesTable(rolesTable) {
    fetch("http://localhost:3000/api/roles")
        .then((res) => res.json())
        .then((roles) => {
            rolesTable.innerHTML = roles.map(
                (role) => `
                <tr>
                    <td>${role.id}</td>
                    <td>${role.nombre}</td>
                    <td><button onclick="editRole(${role.id})"  class="editar-btn">✏️</button></td>
                    <td><button onclick="deleteRole(${role.id})" class="eliminar-btn">🗑️</button></td>
                </tr>`
            ).join("");
        });
}

function editRole(roleId) {
    fetch(`http://localhost:3000/api/roles/${roleId}`)
        .then((res) => res.json())
        .then((role) => {
            document.getElementById("roleName").value = role.nombre;
            roleForm.dataset.roleId = role.id;
        });
}

function deleteRole(roleId) {
    if (confirm("¿Estás seguro de eliminar este rol?")) {
        fetch(`http://localhost:3000/api/roles/${roleId}`, { method: "DELETE" })
            .then(() => {
                alert("Rol eliminado");
                loadRolesTable(document.getElementById("rolesTable").querySelector("tbody"));
            });
    }
}

function loadAdmins(adminsTable) {
    fetch("http://localhost:3000/api/admin")
        .then((res) => res.json())
        .then((admins) => {
            adminsTable.innerHTML = admins.map(
                (admin) => `
                <tr>
                    <td>${admin.id}</td>
                    <td>${admin.nombre} ${admin.ap_paterno} ${admin.ap_materno}</td>
                    <td>${admin.rol_nombre}</td>
                    <td>${admin.email}</td>
                    <td>${admin.nombre_user}</td>
                    <td><button onclick="editAdmin(${admin.id})" class="editar-btn">✏️</button></td>
                    <td><button onclick="deleteAdmin(${admin.id})" class="eliminar-btn">🗑️</button></td>
                </tr>`
            ).join("");
        });
}

function loadRoles(selectElement) {
    fetch("http://localhost:3000/api/roles")
        .then((res) => res.json())
        .then((roles) => {
            selectElement.innerHTML = `<option value="">Seleccione un rol</option>` + 
                roles.map((role) => `<option value="${role.id}">${role.nombre}</option>`).join("");
        });
}

function editAdmin(adminId) {
    fetch(`http://localhost:3000/api/admin/${adminId}`)
        .then((res) => res.json())
        .then((admin) => {
            document.getElementById("adminName").value = admin.nombre;
            document.getElementById("adminLastName").value = admin.ap_paterno;
            document.getElementById("adminSecondLastName").value = admin.ap_materno;
            document.getElementById("adminUsername").value = admin.nombre_user;
            document.getElementById("adminEmail").value = admin.email;
            document.getElementById("adminRole").value = admin.rol_id;
            document.getElementById("adminPassword").value = ""; 
            adminForm.dataset.adminId = admin.id;
        });
}

function deleteAdmin(adminId) {
    if (confirm("¿Estás seguro de eliminar este administrador?")) {
        fetch(`http://localhost:3000/api/admin/${adminId}`, { method: "DELETE" })
            .then(() => {
                alert("Administrador eliminado");
                loadAdmins(document.getElementById("adminsTable").querySelector("tbody"));
            });
    }
}
