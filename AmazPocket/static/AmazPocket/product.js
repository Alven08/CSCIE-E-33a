function onProductClick(product_id) {
    const url = "/product/" + product_id;

    fetch(url, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(response => response.form)
        .then(data => {
            const parentModel = document.getElementById('product-modal');
            let img_element =  document.createElement('img');
            img_element.src = data.img_url;
            img_element.id = 'selected-product-img';
            img_element.alt = data.name;
            parentModel.prepend(img_element);

            document.getElementById('product-description').innerHTML = data.description;
            document.getElementById('id_price').innerHTML = `<strong>Price:</strong> $${data.price}`;

            // setUpProductForm(data);
            // document.getElementById('selected-product-img').src = data.img_url;
            // document.getElementById('exampleModal').innerHTML = data.name;
            //
            // document.getElementById('id_category').value = data.category.id;
            // document.getElementById('id_img_url').value = data.img_url;
            // document.getElementById('id_price').value = data.price;
            // document.getElementById('id_in_stock_quantity').value = data.in_stock_quantity;
            // document.getElementById('id_is_active').checked = data.is_active;
        });
}