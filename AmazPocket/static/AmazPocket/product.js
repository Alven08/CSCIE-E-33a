// Start with first post
let counter = 0;

// Load posts 10 at a time
const quantity = 9;

// Flags
let endOfProducts = false;
let listTypeSetup = false;

// Sections (Product, Wishlist, Search) flags/ids
let productCatId = null;
let productWishId = null;
let searchCriteria = null;

document.addEventListener("DOMContentLoaded", loadProducts);

// The page will load more items as the user scrolls the items already loaded
window.onscroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        loadProducts();
    }
};

function loadProducts() {
    /**
     * Method to load more products by calling the API.
     * This method will load the products for the home page,
     * for the Category page products, for the wishlist products, and
     * for the search page
     */

    // Checking if we reached the end of products.
    // If so, do not try to get any more items
    if (endOfProducts)
        return;

    // Setting the search criterias
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

    // Fetch the products by calling the API
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

function add_products(content) {
    /**
     * Add product content to the DOM
     */

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
    /**
     * Method to add a h3 tag indicating that there are no products
     */
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
        placeholder.classList.add("in-between");
        placeholder.prepend(hTag);
    }
}


function onProductClick(product_id) {
    /**
     * Method to load the full product information on click
     */

    const url = "/product/" + product_id;

    fetch(url, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(data => {
            // Remove any pre-existing img tags
            const currentImg = document.getElementById("selected-product-img");
            if(currentImg)
                currentImg.remove();

            // Create html elements and add them to the DOM
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
            if (addToCartButton != null) {
                // Change the text and disable the add to cart button if the item is already in the cart
                if (data.is_in_cart) {
                    addToCartButton.disabled = true;
                    addToCartButton.innerHTML = "Product is Already in the Cart";
                } else {
                    addToCartButton.disabled = false;
                    addToCartButton.innerHTML = "Add to Cart";
                }
            }

            // Add wishlist items from layout to product modal
            populateModalWishlists(product_id, data.wishlists);
        });
}


function populateModalWishlists(product_id, wishlists) {
    /**
     * Add the user's wishlists to the modal popup.
     * Allowing the user to add a product to the wishlist on the popup
     */
    const menu = document.getElementById("product-modal-wishlist-menu");

    // If the menu is null it means the user is not logged-in
    if (menu == null)
        return;

    // Remove any wishlist previously added to the modal
    Array.from(menu.children).forEach((item) => item.remove());

    if (wishlists.length > 0) {
        // Add all the user's wishlist to the modal by creating
        // the html elements and adding them to the DOM
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
        // If the user has no wishlists add a p tag indicating so.
        const item = document.createElement("p");
        item.className = "dropdown-item wishlist-name-item";
        item.innerHTML = "You do not have any wishlists.";
        menu.prepend(item);
    }
}

function addProductToWishlist(wish_id, prod_id) {
    /**
     * Method to add a product to the user's wishlist
     * by calling the API
     */

    const csrftoken = getCookie('csrftoken');

    fetch(`/add-to-wishlist/${wish_id}/${prod_id}/`, {
        method: 'POST',
        headers: {
        'X-CSRFToken': csrftoken
        }
    })
    .then(response => response.json())
    .then(data => {
        // Reload the product information once the product is in the wishlist
        onProductClick(prod_id);
    });
}

function deleteWishlist(wish_id) {
    /**
     * Method to delete a wishlist by calling the API
     */
    const csrftoken = getCookie('csrftoken');
    fetch(`/wishlist/delete/${wish_id}/`, {
        method: 'POST',
        headers: {
        'X-CSRFToken': csrftoken
        }
    })
    .then(response => response.json())
    .then(data => {
        // Redirect to the home page
        window.location.replace("/");
    });
}

function removeFromWishlist(wishId) {
    /**
     * Remove product from wishlist by calling the API
     */
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
        // Reload the wishlist page
        window.location.reload();
    });
}

function addProductToCart() {
    /**
     * Add product to the cart by calling the API
     */
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
        // close the modal popup and open the cart side canvas
        document.getElementById("product-modal-close-button").click();
        document.getElementById("cart-link").click();
    });
}