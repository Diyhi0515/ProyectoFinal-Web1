let isEditing = false;
let editingProductId = null;

document.addEventListener("DOMContentLoaded", () => {
    const productForm = document.getElementById("productForm");
    const saveButton = document.getElementById("saveButton");
    const productList = document.getElementById("productList").querySelector("tbody");
    const categoriaSelect = document.getElementById("categoria");
    const subcategoriaSelect = document.getElementById("subcategoria");
    const selectedCategories = document.getElementById("selectedCategories");

    attachFormSubmitEvent(productForm, saveButton, selectedCategories);
    attachCategoryEvents(categoriaSelect, subcategoriaSelect, selectedCategories);
    attachImageUploadEvent();
    loadCategories(categoriaSelect, subcategoriaSelect);
    loadProducts(productList);
});


function attachFormSubmitEvent(productForm, saveButton, selectedCategories) {
    productForm.addEventListener("submit", (event) => {
        event.preventDefault();
        saveProduct(productForm, saveButton, selectedCategories);
    });
}

function attachCategoryEvents(categoriaSelect, subcategoriaSelect, selectedCategories) {
    document.getElementById("addCategory").addEventListener("click", () => {
        addCategory(categoriaSelect, subcategoriaSelect, selectedCategories);
    });
}


function attachImageUploadEvent() {
    document.getElementById("imageUploader").addEventListener("change", uploadImage);
}

function addCategory(categoriaSelect, subcategoriaSelect, selectedCategories) {
    const categoriaId = categoriaSelect.value;
    const subcategoriaId = subcategoriaSelect.value;
    const categoriaText = categoriaSelect.options[categoriaSelect.selectedIndex].text;
    const subcategoriaText = subcategoriaSelect.options[subcategoriaSelect.selectedIndex].text;


    const div = document.createElement("div");
    div.textContent = `${categoriaText} > ${subcategoriaText}`;
    div.dataset.categoriaId = categoriaId;
    div.dataset.subcategoriaId = subcategoriaId;
    div.className = "selected-category";


    const deleteButton = document.createElement("button");
    deleteButton.textContent = "❌";
    deleteButton.className = "delete-category-btn";
    deleteButton.style.marginLeft = "10px";


    deleteButton.addEventListener("click", () => {
        selectedCategories.removeChild(div);
    });


    div.appendChild(deleteButton);

    selectedCategories.appendChild(div);
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


function saveProduct(productForm, saveButton, selectedCategories) {
    if (!validateForm(productForm)) {
        console.log("Formulario inválido");
        return; 
    }
    const productData = {
        nombre: productForm.nombre.value,
        descripcion: productForm.descripcion.value,
        precio: parseFloat(productForm.precio.value),
        uni_medida: productForm.uni_medida.value,
        stock: parseInt(productForm.stock.value, 10),
        calificacion: parseInt(productForm.calificacion.value,10),
        estado: parseInt(productForm.estado.value, 10),
        imagen_id: parseInt(productForm.imageId.value, 10),
        subcategorias: Array.from(selectedCategories.children).map((child) => ({
            id_subcat: parseInt(child.dataset.subcategoriaId),
            id_cat: parseInt(child.dataset.categoriaId),
        })),
    };
    console.log(productData);
    
    const url = isEditing
        ? `http://localhost:3000/api/producto`
        : `http://localhost:3000/api/producto`;
    const method = isEditing ? "PUT" : "POST";

    fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEditing ? { ...productData, id_prod: editingProductId } : productData),
    })
        .then((res) => res.json())
        .then(() => {
            alert(isEditing ? "Producto actualizado" : "Producto creado");
            resetForm(productForm, saveButton, selectedCategories);
            loadProducts(document.getElementById("productList").querySelector("tbody"));
        });
}


function resetForm(productForm, saveButton, selectedCategories) {
    isEditing = false;
    editingProductId = null;
    saveButton.textContent = "Crear";
    productForm.reset();
    selectedCategories.innerHTML = "";
}


function loadCategories(categoriaSelect, subcategoriaSelect) {
    fetch("http://localhost:3000/api/categoria")
        .then((res) => res.json())
        .then((categories) => {
            categoriaSelect.innerHTML = categories
                .map((cat) => `<option value="${cat.id_cat}">${cat.nombre}</option>`)
                .join("");

            categoriaSelect.addEventListener("change", () => {
                loadSubcategories(categoriaSelect, subcategoriaSelect);
            });
        });
}

function loadSubcategories(categoriaSelect, subcategoriaSelect) {
    fetch(`http://localhost:3000/api/subcategoria/categoria/${categoriaSelect.value}`)
        .then((res) => res.json())
        .then((subcategories) => {
            subcategoriaSelect.innerHTML = subcategories
                .map((sub) => `<option value="${sub.id_subcat}">${sub.nombre}</option>`)
                .join("");
        });
}


function loadProducts(productList) {
    fetch("http://localhost:3000/api/producto")
        .then((res) => res.json())
        .then((products) => {
            productList.innerHTML = products
                .map(
                    (prod) => `
                <tr>
                    <td>${prod.id_prod}</td>
                    <td><img src="http://localhost:3000/api/imagen/${prod.imagen_id}" alt="Producto" width="50"></td>
                    <td>${prod.producto_nombre}</td>
                    <td>${prod.precio}</td>
                    <td>${prod.stock}</td>
                    <td>
                        <button onclick="editProduct(${prod.id_prod})" class="editar-btn">✏️</button>
                    </td>
                    <td>
                        <button onclick="deleteProduct(${prod.id_prod})" class="eliminar-btn">🗑️</button>
                    </td>
                </tr>`
                )
                .join("");
                
        });
}


function editProduct(productId) {
    fetch(`http://localhost:3000/api/producto/${productId}`)
        .then((res) => res.json())
        .then((product) => {
            const productForm = document.getElementById("productForm");
            const saveButton = document.getElementById("saveButton");
            const selectedCategories = document.getElementById("selectedCategories");

            productForm.nombre.value = product.producto_nombre;
            productForm.descripcion.value = product.descripcion;
            productForm.precio.value = product.precio;
            productForm.uni_medida.value = product.uni_medida;
            productForm.stock.value = product.stock;
            productForm.estado.value = product.estado;
            productForm.calificacion.value = product.calificacion;
            productForm.imageId.value = product.imagen_id;


            selectedCategories.innerHTML = "";

            product.categorias.forEach((sub) => {
                const div = document.createElement("div");
                div.textContent = `${sub.nombre_categoria} > ${sub.nombre_subcategoria}`;
                div.dataset.categoriaId = sub.id_cat;
                div.dataset.subcategoriaId = sub.id_subcat;
                div.className = "selected-category";

                const deleteButton = document.createElement("button");
                deleteButton.textContent = "❌";
                deleteButton.className = "delete-category-btn";
                deleteButton.style.marginLeft = "10px";

                deleteButton.addEventListener("click", () => {
                    selectedCategories.removeChild(div);
                });

                div.appendChild(deleteButton);
                selectedCategories.appendChild(div);
            });

            isEditing = true;
            editingProductId = productId;
            saveButton.textContent = "Actualizar";
        });
}


function deleteProduct(productId) {
    if (confirm("¿Estás seguro de eliminar este producto?")) {
        fetch(`http://localhost:3000/api/producto/${productId}`, { method: "DELETE" })
            .then(async (response) => {
                if (!response.ok) {
                    const errorData = await response.json();
                    alert("Error al eliminar el producto: " + (errorData.message || "Desconocido"));
                    throw new Error(errorData.message || "Error desconocido");
                }
                return response.json();
            })
            .then(() => {
                alert("Producto eliminado");
                loadProducts(document.getElementById("productList").querySelector("tbody"));
            })
            .catch((error) => {
                console.error("Error al eliminar el producto:", error);
            });
    }
}



function validateForm(productForm) {
    let isValid = true;


    const nombre = productForm.nombre.value.trim();
    const errorNombre = document.getElementById("error-nombre");
    if (!nombre) {
        errorNombre.textContent = "El nombre es obligatorio.";
        isValid = false;
    } else {
        errorNombre.textContent = "";
    }

    const descripcion = productForm.descripcion.value.trim();
    const errorDescripcion = document.getElementById("error-descripcion");
    if (!descripcion) {
        errorDescripcion.textContent = "La descripción es obligatoria.";
        isValid = false;
    } else {
        errorDescripcion.textContent = "";
    }


    const precio = parseFloat(productForm.precio.value);
    const errorPrecio = document.getElementById("error-precio");
    if (isNaN(precio) || precio <= 0) {
        errorPrecio.textContent = "El precio debe ser un número positivo.";
        isValid = false;
    } else {
        errorPrecio.textContent = "";
    }

    const uniMedida = productForm.uni_medida.value.trim();
    const errorUniMedida = document.getElementById("error-uni_medida");
    if (!uniMedida) {
        errorUniMedida.textContent = "La unidad de medida o peso es obligatoria.";
        isValid = false;
    } else {
        errorUniMedida.textContent = "";
    }


    const stock = parseInt(productForm.stock.value, 10);
    const errorStock = document.getElementById("error-stock");
    if (isNaN(stock) || stock < 0) {
        errorStock.textContent = "El stock debe ser un número mayor o igual a 0.";
        isValid = false;
    } else {
        errorStock.textContent = "";
    }

    const calificacion = parseInt(productForm.calificacion.value, 10);
    const errorCalificacion = document.getElementById("error-calificacion");
    if (isNaN(calificacion) || calificacion < 0) {
        errorCalificacion.textContent = "La calificación debe ser un número mayor o igual a 0.";
        isValid = false;
    } else {
        errorCalificacion.textContent = "";
    }


    const imageUploader = document.getElementById("imageId");
    const errorImage = document.getElementById("error-image");
    if (imageUploader.value == 0) {
        errorImage.textContent = "Debe seleccionar una imagen.";
        isValid = false;
    } else {
        errorImage.textContent = "";
    }

    const estado = productForm.estado.value;
    const errorEstado = document.getElementById("error-estado");
    if (!estado) {
        errorEstado.textContent = "Debe seleccionar un estado.";
        isValid = false;
    } else {
        errorEstado.textContent = "";
    }


    const selectedCategories = document.getElementById("selectedCategories");
    const errorSelectedCategories = document.getElementById("error-selectedCategories");

    if (selectedCategories.children.length === 0) {
        errorSelectedCategories.textContent = "Debe añadir al menos una categoría con subcategoría.";
        isValid = false;
    } else {
        errorSelectedCategories.textContent = "";
    }

    return isValid;
}