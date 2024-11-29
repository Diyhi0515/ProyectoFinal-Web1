const API_BASE = "http://localhost:3000/api";

const loadCategories = async () => {
    const response = await fetch(`${API_BASE}/categoria`);
    const categories = await response.json();
    const categoryList = document.querySelector("#categoryList tbody");
    const subcategoryCategorySelect = document.querySelector("#subcategoryCategory");

    categoryList.innerHTML = categories.map(cat => `
        <tr>
            <td>${cat.id_cat}</td>
            <td>${cat.nombre}</td>
            <td><button onclick="editCategory(${cat.id_cat})" class="editar-btn">✏️</button></td>
            <td><button onclick="deleteCategory(${cat.id_cat})" class="eliminar-btn">🗑️</button></td>
        </tr>
    `).join("");

    subcategoryCategorySelect.innerHTML = categories.map(cat => `
        <option value="${cat.id_cat}">${cat.nombre}</option>
    `).join("");
};

const saveCategory = async (e) => {
    e.preventDefault();
    const categoryNameInput = document.querySelector("#categoryName");
    const categoryIdInput = document.querySelector("#categoryId");
    const errorCategoryName = document.querySelector("#error-categoryName");
    errorCategoryName.textContent = "";
    
    if (!categoryNameInput.value.trim()) {
        errorCategoryName.textContent = "Por favor, introduce un nombre válido.";
        return;
    }

    const name = categoryNameInput.value;
    const id = categoryIdInput.value;
    const method = id ? "PUT" : "POST";
    const endpoint = `${API_BASE}/categoria`;
    const body = id ? { id_cat: id, nombre: name } : { nombre: name };

    await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    loadCategories();
    document.querySelector("#categoryForm").reset();
};

const editCategory = async (id) => {
    const response = await fetch(`${API_BASE}/categoria/${id}`);
    const category = await response.json();

    document.querySelector("#categoryName").value = category.nombre;
    document.querySelector("#categoryId").value = category.id_cat;
};

const deleteCategory = async (id) => {
    if (confirm("¿Estás seguro de eliminar esta categoría?")) {
        await fetch(`${API_BASE}/categoria/${id}`, { method: "DELETE" });
        loadCategories();
    }
};

const loadSubcategories = async () => {
    const response = await fetch(`${API_BASE}/subcategoria`);
    const subcategories = await response.json();
    const subcategoryList = document.querySelector("#subcategoryList tbody");

    subcategoryList.innerHTML = subcategories.map(sub => `
        <tr>
            <td>${sub.id_subcat}</td>
            <td>${sub.nombre}</td>
            <td>${sub.categoria_nombre}</td>
            <td><button onclick="editSubcategory(${sub.id_subcat})" class="editar-btn">✏️</button></td>
            <td><button onclick="deleteSubcategory(${sub.id_subcat})" class="eliminar-btn">🗑️</button></td>
        </tr>
    `).join("");
};

const saveSubcategory = async (e) => {
    e.preventDefault();
    const subcategoryNameInput = document.querySelector("#subcategoryName");
    const subcategoryCategorySelect = document.querySelector("#subcategoryCategory");
    const subcategoryIdInput = document.querySelector("#subcategoryId");


    const errorSubcategoryName = document.querySelector("#error-subcategoryName");
    const errorSubcategoryCategory = document.querySelector("#error-subcategoryCategory");


    errorSubcategoryName.textContent = "";
    errorSubcategoryCategory.textContent = "";

    if (!subcategoryNameInput.value.trim()) {
        errorSubcategoryName.textContent = "Por favor, introduce un nombre válido.";
        return;
    }

    if (!subcategoryCategorySelect.value) {
        errorSubcategoryCategory.textContent = "Por favor, selecciona una categoría.";
        return;
    }

    const name = subcategoryNameInput.value;
    const categoryId = subcategoryCategorySelect.value;
    const id = subcategoryIdInput.value;
    const method = id ? "PUT" : "POST";
    const endpoint = `${API_BASE}/subcategoria`;
    const body = id
        ? { id_subcat: id, nombre: name, id_cat: categoryId }
        : { nombre: name, id_cat: categoryId };

    await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    });

    loadSubcategories();
    document.querySelector("#subcategoryForm").reset();
};

const editSubcategory = async (id) => {
    const response = await fetch(`${API_BASE}/subcategoria/${id}`);
    const subcategory = await response.json();

    document.querySelector("#subcategoryName").value = subcategory.nombre;
    document.querySelector("#subcategoryCategory").value = subcategory.id_cat;
    document.querySelector("#subcategoryId").value = subcategory.id_subcat;
};

const deleteSubcategory = async (id) => {
    if (confirm("¿Estás seguro de eliminar esta subcategoría?")) {
        await fetch(`${API_BASE}/subcategoria/${id}`, { method: "DELETE" });
        loadSubcategories();
    }
};


document.addEventListener("DOMContentLoaded", async () => {

    document.querySelector("#categoryForm").addEventListener("submit", saveCategory);
    document.querySelector("#subcategoryForm").addEventListener("submit", saveSubcategory);


    loadCategories();
    loadSubcategories();
});


window.editCategory = editCategory;
window.deleteCategory = deleteCategory;
window.editSubcategory = editSubcategory;
window.deleteSubcategory = deleteSubcategory;
