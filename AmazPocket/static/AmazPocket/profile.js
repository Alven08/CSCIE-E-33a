function changeProductFormToPost() {
    const product_form = document.querySelector('#product-form');
    product_form.method = 'POST';
}

function changeProductFormToPut() {
    const product_form = document.querySelector('#product-form');
    product_form.method = 'PUT';
}

function closeForm() {
    const product_form = document.querySelector('#product-form');
    product_form.reset();
}


// document.addEventListener('DOMContentLoaded', function() {}
