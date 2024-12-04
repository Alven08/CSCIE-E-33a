// Start with first post
let counter = 0;

// Load posts 20 at a time
const quantity = 9;

let endOfProducts = false;
let listTypeSetup = false;
let productCatId = null;
let productWishId = null;

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
    // productCatId == null && productWishId == null
    if (listTypeSetup === false) {
        let productsContainer = document.getElementById("products-container")
        productCatId = productsContainer.dataset.catId == "" ? -1 : productsContainer.dataset.catId ;
        productWishId = productsContainer.dataset.wishId == "" ? -1 : productsContainer.dataset.wishId;
        listTypeSetup = true;
    }

    // Set start and end post numbers, and update counter
    const start = counter;
    const end = start + quantity;
    counter = end;

    // Get new posts and add posts
    fetch(`/load-products?start=${start}&end=${end}&cat-id=${productCatId}&wish-id=${productWishId}`)
    .then(response => response.json())
    .then(data => {
        if (data.products.length > 0)
            data.products.forEach(add_products);
        else {
            if (start === 0)
                add_no_product_tag();

            endOfProducts = true;
        }
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

function add_no_product_tag() {
    const container = document.createElement("div");
    container.className = "col-md-4";
    const hTag = document.createElement("h3");
    hTag.innerHTML = "There are no products";
    container.append(hTag);
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

            // Add wishlist items from layout to product modal
            populateModalWishlists(product_id);
        });
}


function populateModalWishlists(product_id) {
    const wishlist_dd_items = document.querySelectorAll(".wishlist-name-item");
    const wishlist_container = document.getElementById("product-modal-wishlist-menu");

    Array.from(wishlist_container.children).forEach((item) => item.remove());

    wishlist_dd_items.forEach((item) => {
        const copy = item.cloneNode(true);
        copy.className = "dropdown-item wishlist-name-item-product";
        href_part = copy.href.split("/");
        copy.href = "#";
        copy.addEventListener("click", () => addProductToWishlist(href_part[4], product_id));
        wishlist_container.append(copy);
    });
}

function addProductToWishlist(wish_id, prod_id) {
    const data = {
        "wishlist_id": wish_id,
        "product_id": prod_id
    }

    fetch(`/add-to-wishlist?wishlist_id=${wish_id}&product_id=${prod_id}`, {
        method: 'POST',
        body: data
    })
        .then(response => response.json())
        .then(response => {
            alert("all good");
        });
}
