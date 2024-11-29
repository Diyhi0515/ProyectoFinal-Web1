document.addEventListener("DOMContentLoaded", () => {
    const roleForm = document.getElementById("roleForm");
    const rolesTable = document.getElementById("rolesTable").querySelector("tbody");

    roleForm.addEventListener("submit", handleRoleFormSubmit);
    loadRoles(rolesTable);
});

function handleRoleFormSubmit(event) {
    event.preventDefault();
    const roleName = document.getElementById("roleName").value.trim();
    const roleNameError = document.getElementById("roleNameError");

    if (!roleName) {
        roleNameError.textContent = "El nombre del rol es obligatorio.";
        return;
    } else {
        roleNameError.textContent = "";
    }

    const method = roleName.dataset.roleId ? "PUT" : "POST";
    const url = method === "PUT" 
        ? `http://localhost:3000/api/roles` 
        : `http://localhost:3000/api/roles`;

    fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: roleName }),
    })
        .then((res) => res.json())
        .then(() => {
            alert("Rol guardado correctamente");
            loadRoles(document.getElementById("rolesTable").querySelector("tbody"));
            roleForm.reset();
        })
        .catch((error) => console.error("Error al guardar el rol:", error));
}

function loadRoles(rolesTable) {
    fetch("http://localhost:3000/api/roles")
        .then((res) => res.json())
        .then((roles) => {
            rolesTable.innerHTML = roles.map(
                (role) => `
                <tr>
                    <td>${role.id}</td>
                    <td>${role.nombre}</td>
                    <td><button onclick="editRole(${role.id})">✏️</button></td>
                    <td><button onclick="deleteRole(${role.id})">🗑️</button></td>
                </tr>`
            ).join("");
        });
}

function editRole(roleId) {
    fetch(`http://localhost:3000/api/roles/${roleId}`)
        .then((res) => res.json())
        .then((role) => {
            const roleName = document.getElementById("roleName");
            roleName.value = role.nombre;
            roleName.dataset.roleId = role.id;
        });
}

function deleteRole(roleId) {
    if (confirm("¿Estás seguro de eliminar este rol?")) {
        fetch(`http://localhost:3000/api/roles/${roleId}`, { method: "DELETE" })
            .then(() => {
                alert("Rol eliminado");
                loadRoles(document.getElementById("rolesTable").querySelector("tbody"));
            });
    }
}
