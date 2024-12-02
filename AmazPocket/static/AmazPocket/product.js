// Start with first post
let counter = 0;

// Load posts 20 at a time
const quantity = 9;

let endOfProducts = false;
let productCatId = null;

document.addEventListener("DOMContentLoaded", loadProducts);

window.onscroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        loadProducts();
    }
};

function loadProducts() {
    // Checking if we reached the end of products
    if (endOfProducts)
        return;

    // Setting the category id of the products if this is the category products page
    if (productCatId == null) {
        let productsContainer = document.getElementById("products-container")
        if (("catid" in productsContainer.dataset))
             productCatId = productsContainer.dataset.catid;
        else
            productCatId = -1;
    }

    // Set start and end post numbers, and update counter
    const start = counter;
    const end = start + quantity;
    counter = end;

    // Get new posts and add posts
    fetch(`/load-products?start=${start}&end=${end}&cat-id=${productCatId}`)
    .then(response => response.json())
    .then(data => {
        if (data.products.length > 0)
            data.products.forEach(add_products);
        else
            endOfProducts = true;
    });
}

// Add a new product with given contents to DOM
function add_products(content) {

    // Create new product
    // boostrap div
    const container = document.createElement("div");
    container.className = "col-md-4 product-space";
    // container.innerHTML = content

    // A tag to open modal
    const aTag = document.createElement("a");
    aTag.dataset.toggle = "modal";
    aTag.dataset.target = "#exampleModal";
    aTag.addEventListener("click", () => onProductClick(content.id));

    // Label tag
    const label = document.createElement("label");
    label.className = "bold";
    label.innerHTML = content.name;
    aTag.append(label);

    //Img tag
    const img = document.createElement("img");
    img.className = "product-img";
    img.src = content.img_url;
    img.alt = content.name;
    aTag.append(img);

    container.append(aTag);

    // Add product to DOM
    document.querySelector('#products-container').append(container);
}


function onProductClick(product_id) {
    const url = "/product/" + product_id;

    fetch(url, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(response => response.form)
        .then(data => {
            // Remove any pre-existing img tags
            const currentImg = document.getElementById("selected-product-img");
            if(currentImg)
                currentImg.remove();

            const parentModel = document.getElementById("product-modal");
            let img_element =  document.createElement("img");
            img_element.src = data.img_url;
            img_element.id = "selected-product-img";
            img_element.alt = data.name;
            parentModel.prepend(img_element);

            document.getElementById("product-description").innerHTML = data.description;
            document.getElementById("id_price").innerHTML = `<strong>Price:</strong> $${data.price}`;
            document.getElementById("exampleModalLabel").innerHTML = data.name;
            document.getElementById("sell-by").innerHTML = `Sell by <strong>${data.vendor.vendor_name}</strong>`;
        });
}
