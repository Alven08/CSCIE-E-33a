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
            document.getElementById('exampleModalLabel').innerHTML = data.name;
        });
}