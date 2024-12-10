// Start with first post
let counter = 0;

// Load posts 10 at a time
const quantity = 9;

let endOfProducts = false;
let listTypeSetup = false;
let productCatId = null;
let productWishId = null;
let searchCriteria = null;

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
        productCatId = Number(productsContainer.dataset.catId == "" ? -1 : productsContainer.dataset.catId);
        productWishId = Number(productsContainer.dataset.wishId == "" ? -1 : productsContainer.dataset.wishId);
        searchCriteria = productsContainer.dataset.searchCriteria == "" ? "" : productsContainer.dataset.searchCriteria;
        listTypeSetup = true;
    }

    // Set start and end post numbers, and update counter
    const start = counter;
    const end = start + quantity;
    counter = end;

    // Get new posts and add posts
    fetch(`/load-products?start=${start}&end=${end}&cat-id=${productCatId}&wish-id=${productWishId}&criteria=${searchCriteria}`)
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

    // A tag to open modal
    const aTag = document.createElement("a");
    aTag.setAttribute("data-bs-toggle", "modal");
    aTag.setAttribute("data-bs-target", "#exampleModal");
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
    const hTag = document.createElement("h3");
    hTag.innerHTML = "There are no products";

    let placeholder = document.querySelector("#sub-header-wishlist")
    if (placeholder === undefined || placeholder === null) {
        placeholder = document.querySelector('#products-container');
        const container = document.createElement("div");
        container.className = "col-md-4";

        container.append(hTag);
        placeholder.append(container);
    } else {
        const moveToCartButton = document.getElementById("move-wishlist-to-cart");
        moveToCartButton.remove();
        placeholder.classList.add("in-between");
        placeholder.prepend(hTag);
    }
}


function onProductClick(product_id) {
    const url = "/product/" + product_id;

    fetch(url, {
        method: 'GET'
    })
        .then(response => response.json())
        // .then(response => response.form)
        .then(data => {
            // Remove any pre-existing img tags
            const currentImg = document.getElementById("selected-product-img");
            if(currentImg)
                currentImg.remove();

            const parentModel = document.getElementById("product-modal");
            let img_element =  document.createElement("img");
            img_element.src = data.form.img_url;
            img_element.id = "selected-product-img";
            img_element.alt = data.form.name;
            parentModel.prepend(img_element);

            document.getElementById("product-description").innerHTML = data.form.description;
            document.getElementById("id_price").innerHTML = `<strong>Price:</strong> $${data.form.price}`;
            document.getElementById("exampleModalLabel").innerHTML = data.form.name;
            document.getElementById("sell-by").innerHTML = `Sell by <strong>${data.form.vendor.vendor_name}</strong>`;

            parentModel.dataset.productid = data.form.id;

            //Enable disable add to cart button
            const addToCartButton = document.getElementById("add-to-cart-button");
            if (data.is_in_cart) {
                addToCartButton.disabled = true;
                addToCartButton.innerHTML = "Product is Already in the Cart";
            } else {
                addToCartButton.disabled = false;
                addToCartButton.innerHTML = "Add to Cart";
            }

            //is_in_cart

            // Add wishlist items from layout to product modal
            populateModalWishlists(product_id, data.wishlists);
        });
}


function populateModalWishlists(product_id, wishlists) {
    const menu = document.getElementById("product-modal-wishlist-menu");
    Array.from(menu.children).forEach((item) => item.remove());

    if (wishlists.length > 0) {
        wishlists.forEach((content) => {
            const itemContainer = document.createElement("li");
            const button = document.createElement("button");
            button.type = "button";
            button.className = "dropdown-item wishlist-name-item-product";
            button.innerHTML = content.name;
            if (content.is_in_list !== undefined) {
                button.disabled = content.is_in_list;
            } else {
                button.addEventListener("click", () => addProductToWishlist(content.id, product_id));
            }

            itemContainer.append(button);
            menu.prepend(itemContainer);
        });
    }
    else {
        const item = document.createElement("p");
        item.className = "dropdown-item wishlist-name-item";
        item.innerHTML = "You do not have any wishlists.";
        menu.prepend(item);
    }
}

function addProductToWishlist(wish_id, prod_id) {
    const csrftoken = getCookie('csrftoken');

    fetch(`/add-to-wishlist/${wish_id}/${prod_id}/`, {
        method: 'POST',
        headers: {
        'X-CSRFToken': csrftoken
        }
    })
    .then(response => response.json())
    .then(data => {
        onProductClick(prod_id);
    });
}

function deleteWishlist(wish_id) {
    const csrftoken = getCookie('csrftoken');
    fetch(`/wishlist/delete/${wish_id}/`, {
        method: 'POST',
        headers: {
        'X-CSRFToken': csrftoken
        }
    })
    .then(response => response.json())
    .then(data => {
        window.location.replace("/");
    });
}

function removeFromWishlist(wishId) {
    const modalWithProduct = document.getElementById("product-modal")
    const productId = modalWithProduct.dataset.productid;
    const csrftoken = getCookie('csrftoken');
    fetch(`/remove-from-wishlist/${wishId}/${productId}/`, {
        method: 'POST',
        headers: {
        'X-CSRFToken': csrftoken
        }
    })
    .then(response => response.json())
    .then(data => {
        window.location.reload();
    });
}

function addProductToCart() {
    const modalWithProduct = document.getElementById("product-modal")
    const productId = modalWithProduct.dataset.productid;
    const csrftoken = getCookie('csrftoken');
    fetch(`/add-to-cart/${productId}/`, {
        method: 'POST',
        headers: {
        'X-CSRFToken': csrftoken
        }
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("product-modal-close-button").click();
        document.getElementById("cart-link").click();
    });
}