document.addEventListener("DOMContentLoaded", function () {
    const listadoProductos = document.querySelector('.listado-productos');
    
  
    fetch("http://localhost:3000/api/producto/mejores")  
        .then(response => response.json())  
        .then(productos => {

            function filtrarProductos(tipo) {
                listadoProductos.innerHTML = '';  

                productos.forEach(producto => {
                   
                    let esPerro = producto.categorias.some(categoria => categoria.id_subcat === 1);  
                    let esGato = producto.categorias.some(categoria => categoria.id_subcat === 6); 
                    

                    if (tipo === 'perro' && esPerro) {
                        agregarProducto(producto);
                    } else if (tipo === 'gato' && esGato) {
                        agregarProducto(producto);
                    } else if (tipo === 'otros' && !esPerro && !esGato) {
                        agregarProducto(producto);
                    } else if (tipo === 'todos') {
                        agregarProducto(producto);
                    }
                });
            }


            function agregarProducto(producto) {
                let marca = "";
                producto.categorias.forEach(categoria => {
                    if (categoria.id_cat === 4) {
                        marca = categoria.nombre_subcategoria;  
                    }
                });

                const productoElemento = document.createElement('article');
                productoElemento.classList.add('destacado-item');
                
                productoElemento.innerHTML = `
                    <img src="http://localhost:3000/api/imagen/${producto.imagen_id}" alt="${producto.producto_nombre}">
                    <h2 class="destacado-item-Precio">Bs ${producto.precio}</h2>
                    <p class="marcar">${marca}</p> 
                    <p class="titulo">
                        <strong>${producto.producto_nombre}</strong>
                    </p>
                    <p class="peso">${producto.uni_medida}</p> 
                    <button class="carrito" data-id="${producto.id_prod}">Ver Producto</button>
                `;
                productoElemento.addEventListener("click", (e) => {
                    if (e.target.tagName === "BUTTON") return;
                    const productoId = producto.id_prod;
                    window.location.href = `detalleProducto.html?id=${productoId}`;
                });
                
                listadoProductos.appendChild(productoElemento);

                document.querySelectorAll(".carrito").forEach(button => {
                    button.addEventListener("click", (e) => {
                        const productoId = e.target.dataset.id;
                        window.location.href = `detalleProducto.html?id=${productoId}`;
                    });
                });
    
            }

            

            filtrarProductos('todos');


            document.querySelector('.category-selectors').addEventListener('click', function (e) {
                if (e.target.closest('.category')) {
 
                    document.querySelectorAll('.category').forEach(button => button.classList.remove('active'));
                    
                    e.target.closest('.category').classList.add('active');
                    
                    const categoria = e.target.closest('.category').textContent.trim();
                    console.log(categoria);
                    if (categoria === 'Perros') {
                        filtrarProductos('perro');
                    } else if (categoria === 'Gatos') {
                        filtrarProductos('gato');
                    } else if (categoria === 'Otros') {
                        filtrarProductos('otros');
                    }else if (categoria === 'Todos') {
                        filtrarProductos('todos');  
                    }
                }
            });
        })
        .catch(error => {

            console.error("Error al cargar los productos:", error);
            listadoProductos.innerHTML = "<p>Hubo un problema al cargar los productos.</p>";
        });
});
