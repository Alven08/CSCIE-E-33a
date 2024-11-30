function changeProductFormToPost() {
    let product_form = document.querySelector('#product-form');
    product_form.action = "/product";
}

function changeProductFormToPut(product_id) {
    let product_form = document.querySelector('#product-form');
    product_form.action = "/product/" + product_id;
}

function closeForm() {
    const product_form = document.querySelector('#product-form');
    document.getElementById('id_description').innerHTML = '';
    product_form.reset();
}

function onProductClick(product_id) {
    changeProductFormToPut(product_id);

    const url = "/product/" + product_id;

    fetch(url, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(response => response.form)
        .then(data => {
            // setUpProductForm(data);
            document.getElementById('id_name').value = data.name;
            document.getElementById('id_description').innerHTML = data.description;
            document.getElementById('id_category').value = data.category.id;
            document.getElementById('id_img_url').value = data.img_url;
            document.getElementById('id_price').value = data.price;
            document.getElementById('id_in_stock_quantity').value = data.in_stock_quantity;
            document.getElementById('id_is_active').checked = data.is_active;
        });
}

// function setUpProductForm(data) {
//     document.getElementById('id_name').value = data != null ? data.name : null;
//     document.getElementById('id_description').innerHTML = data != null ? data.description : null;
//     document.getElementById('id_category').value = data != null ? data.category.id : null;
//     document.getElementById('id_img_url').value = data != null ? data.img_url : null;
//     document.getElementById('id_price').value = data != null ? data.price : null;
//     document.getElementById('id_in_stock_quantity').value = data != null ? data.in_stock_quantity : null;
//     document.getElementById('id_is_active').checked = data != null ? data.is_active : true;
// }




// document.addEventListener('DOMContentLoaded', function() {}
