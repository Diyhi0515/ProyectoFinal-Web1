document.addEventListener("DOMContentLoaded", async () => {
    const apiUrl = "http://localhost:3000/api/subcategoria";
    const apiProductosUrl = "http://localhost:3000/api/producto";
    const menuCategorias = document.querySelector(".menu-cat ul");
    const productosContainer = document.querySelector(".productos");

    try {
        const subcategorias = await obtenerSubcategorias(apiUrl);
        const categoriasAgrupadas = agruparSubcategoriasPorCategoria(subcategorias);

      
        rellenarMenuCategorias(menuCategorias, categoriasAgrupadas);

        
        crearSelectoresDinamicamente(categoriasAgrupadas, apiProductosUrl, productosContainer);

        
        await inicializarProductos(apiProductosUrl, productosContainer);

       
        menuCategorias.addEventListener("click", (e) => filtrarPorSubcategoria(e, apiProductosUrl, productosContainer));

        
        const todosLink = menuCategorias.querySelector("a[href='#todos']");
        todosLink.addEventListener("click", () => mostrarTodosLosProductos(apiProductosUrl, productosContainer));

    } catch (error) {
        console.error("Error al cargar las subcategorías:", error);
    }
});

function crearSelectoresDinamicamente(categoriasAgrupadas, apiProductosUrl, productosContainer) {
    const selectWrapperContainer = document.querySelector(".select-container");

    Object.entries(categoriasAgrupadas).forEach(([categoria, subcats]) => {
        const selectWrapper = document.createElement("div");
        selectWrapper.classList.add("select-wrapper");

        const select = document.createElement("select");
        select.id = `select-${categoria}`;
        select.name = `subcategoria-${categoria}`;

        const option = document.createElement("option");
        option.value = "";
        option.textContent = `${categoria}`;
        select.appendChild(option);

        subcats.forEach((subcat) => {
            const option = document.createElement("option");
            option.value = subcat.id_subcat;
            option.textContent = subcat.nombre;
            select.appendChild(option);
        });

        select.addEventListener("change", (e) => filtrarProductosPorSelect(e, categoria, apiProductosUrl, productosContainer));
        selectWrapper.appendChild(select);
        selectWrapperContainer.appendChild(selectWrapper);
    });
}

async function filtrarProductosPorSelect(e, categoria, apiProductosUrl, productosContainer) {
    console.log(e.target.value);
    const subcategoriaId = e.target.value;
    if (subcategoriaId) {
        const productos = await fetchProductosPorSubcategoria(apiProductosUrl, subcategoriaId);
        renderProductos(productos, `${categoria} - ${e.target.selectedOptions[0].textContent}`, productosContainer);
    } else {
        await inicializarProductos(apiProductosUrl, productosContainer);
    }
}

async function obtenerSubcategorias(apiUrl) {
    const response = await fetch(apiUrl);
    return await response.json();
}

function agruparSubcategoriasPorCategoria(subcategorias) {
    return subcategorias.reduce((acc, subcat) => {
        if (!acc[subcat.categoria_nombre]) {
            acc[subcat.categoria_nombre] = [];
        }
        acc[subcat.categoria_nombre].push(subcat);
        return acc;
    }, {});
}

function rellenarMenuCategorias(menuCategorias, categoriasAgrupadas) {
    const todosLi = document.createElement("li");
    const todosLink = document.createElement("a");
    todosLink.href = "#todos";
    todosLink.textContent = "Todos";
    todosLi.appendChild(todosLink);
    menuCategorias.appendChild(todosLi);


    Object.entries(categoriasAgrupadas).forEach(([categoria, subcats]) => {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = "#";
        link.textContent = categoria;
        li.appendChild(link);

        if (subcats.length > 0) {
            const subUl = document.createElement("ul");
            subcats.forEach((subcat) => {
                const subLi = document.createElement("li");
                const subLink = document.createElement("a");
                subLink.href = "#";
                subLink.textContent = subcat.nombre;
                subLink.dataset.subcatId = subcat.id_subcat;
                subLi.appendChild(subLink);
                subUl.appendChild(subLi);
            });
            li.appendChild(subUl);
        }
        menuCategorias.appendChild(li);
    });
}

async function inicializarProductos(apiProductosUrl, productosContainer) {
    const response = await fetch(apiProductosUrl);
    const productos = await response.json();
    renderProductos(productos, "Todos los productos", productosContainer);
}

function renderProductos(productos, filtro, productosContainer) {
    productosContainer.innerHTML = ""; 

    const title = document.createElement("h2");
    title.classList.add("destacado-title");
    title.textContent = filtro;
    productosContainer.appendChild(title);

    const listadoProductos = document.createElement("section");
    listadoProductos.classList.add("listado-productos");

    productos.forEach((producto) => {
        const articulo = document.createElement("article");
        articulo.classList.add("destacado-item");
        articulo.innerHTML = `
            <img src="http://localhost:3000/api/imagen/${producto.imagen_id}" alt="${producto.producto_nombre}">
            <h2 class="destacado-item-Precio">Bs ${producto.precio}</h2>
            <p class="marcar">${producto.categorias.find(c => c.nombre_categoria === "Marca")?.nombre_subcategoria || "Sin Marca"}</p>
            <p class="titulo">
                <strong>${producto.producto_nombre}</strong>
            </p>
            <p class="peso">${producto.uni_medida}</p> 
            <button class="carrito" data-id="${producto.id_prod}">Ver Producto</button>
        `;
        listadoProductos.appendChild(articulo);

        articulo.addEventListener("click", (e) => {
            if (e.target.tagName === "BUTTON") return;
            const productoId = producto.id_prod;
            window.location.href = `detalleProducto.html?id=${productoId}`;
        });
    });

    productosContainer.appendChild(listadoProductos);
    document.querySelectorAll(".carrito").forEach(button => {
        button.addEventListener("click", (e) => {
            const productoId = e.target.dataset.id;
            window.location.href = `detalleProducto.html?id=${productoId}`;
        });
    });
}

async function filtrarPorSubcategoria(e, apiProductosUrl, productosContainer) {
    if (e.target.tagName === "A" && e.target.dataset.subcatId) {
        e.preventDefault();
        const subcategoriaId = e.target.dataset.subcatId;
        const productos = await fetchProductosPorSubcategoria(apiProductosUrl, subcategoriaId);
        renderProductos(productos, `${e.target.textContent}`, productosContainer);
    }
}

async function fetchProductosPorSubcategoria(apiProductosUrl, subcategoriaId) {
    try {
        const response = await fetch(`${apiProductosUrl}/subcategoria/${subcategoriaId}`);
        return await response.json();
    } catch (error) {
        console.error("Error al cargar productos:", error);
        return [];
    }
}

async function mostrarTodosLosProductos(apiProductosUrl, productosContainer) {
    await inicializarProductos(apiProductosUrl, productosContainer);
}
