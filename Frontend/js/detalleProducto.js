document.addEventListener("DOMContentLoaded", async () => {
    const apiProductosUrl = "http://localhost:3000/api/producto";
    const params = new URLSearchParams(window.location.search);
    const productoId = params.get("id");

    if (productoId) {
        try {
            const producto = await fetchProductoPorId(apiProductosUrl, productoId);
            renderDetalleProducto(producto);
        } catch (error) {
            console.error("Error al cargar el producto:", error);
        }
    } else {
        console.error("No se proporcionó un ID de producto.");
    }


    const userInSession = JSON.parse(localStorage.getItem("userInSession"));

});

async function fetchProductoPorId(apiUrl, productoId) {
    const response = await fetch(`${apiUrl}/${productoId}`);
    if (!response.ok) throw new Error("Error al obtener el producto.");
    return await response.json();
}

function renderDetalleProducto(producto) {
    const marca = producto.categorias.find(c => c.nombre_categoria === "Marca")?.nombre_subcategoria || "Sin Marca";
    document.querySelector(".detalle .imagen img").src = `http://localhost:3000/api/imagen/${producto.imagen_id}`;
    document.querySelector(".detalle .info h2").textContent = producto.producto_nombre;
    document.querySelector(".marca strong").textContent = marca;
    document.querySelector(".detalle .descripcion").innerHTML = producto.descripcion || "Sin descripción disponible.";
    document.querySelector(".precio-detalle strong").textContent = `Bs ${producto.precio}`;
    document.querySelector("#cantidad").value = 1; 
    document.querySelector(".detalle .peso").textContent = "Peso: " + producto.uni_medida;
}


document.querySelector(".carrito").addEventListener("click", async () => {
    const productoId = new URLSearchParams(window.location.search).get("id");
    const cantidad = document.querySelector("#cantidad").value;
    const userInSession = JSON.parse(localStorage.getItem("userInSession"));

    if (!productoId || cantidad <= 0) {
        alert("Por favor selecciona una cantidad válida.");
        return;
    }

    const carritoId = localStorage.getItem("carritoId"); 
    console.log(carritoId);
    const datosProducto = {
        producto_id: productoId,
        cantidad,
    };

    if (userInSession && userInSession.id) {
        datosProducto.id_cliente = userInSession.id; 
    }

    try {
        if (carritoId && carritoId !== "undefined") {
            await agregarProductoACarrito(carritoId, datosProducto);
        } else {
            
            const nuevoCarrito = await crearNuevoCarrito(datosProducto);
            localStorage.setItem("carritoId", nuevoCarrito.carritoId); 
            console.log(nuevoCarrito.carritoId);
        }
        window.location.href = "carrito.html";
    } catch (error) {
        console.error("Error al agregar el producto al carrito:", error);
        alert("Hubo un problema al agregar el producto al carrito.");
    }
});


async function agregarProductoACarrito(carritoId, datosProducto) {
    const response = await fetch(`http://localhost:3000/api/carrito/${carritoId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosProducto),
    });
    if (!response.ok) throw new Error("Error al agregar producto al carrito.");
}


async function crearNuevoCarrito(datosProducto) {
    const response = await fetch("http://localhost:3000/api/carrito", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datosProducto),
    });
    if (!response.ok) throw new Error("Error al crear un nuevo carrito.");
    return await response.json();
}
