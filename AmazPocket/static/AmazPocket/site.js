document.addEventListener("DOMContentLoaded", setup);

function getCookie(name) {
    /**
     * Method to get cookies
     * It takes the name of the cookie and returns the value.
     * It's main purpose is to get the csrftoken cookie setup by django
    */
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function setup() {
    /**
     * Method to setup the wishlist list in the nav bar
     */

    // If the dropdown menu does not exist it means the user is not logged in.
    // Do not load the wishlists
    const wlDropdown = document.getElementById("wishlist-dropdown-menu");
    if (wlDropdown) {
        document.getElementById("create-wishlist-form").addEventListener("submit",() => {
            createNewWishtList();
            return false;
        });
        loadWishlists();
    }
}

function loadWishlists() {
    /**
     * Method to load the wishlists for the logged-in user
     */
    fetch(`/get-wishlists`)
    .then(response => response.json())
    .then(data => {
        addWishlishItems(data.wishlist);
    });
}


function createNewWishtList() {
    /**
     * Method to call the API to create a new wishlist.
     */
    this.event.preventDefault();
    let bla = new FormData(document.getElementById("create-wishlist-form"));
    fetch(`/wishlist`, {
        method: "POST",
        body: bla
    })
    .then(response => response.json())
    .then(data => {
        // Refresh the wishlists in the DOM
        addWishlishItems(data.wishlist);
        onWishlistModalClose();
    });

    return false;
}

function addWishlishItems(list) {
    /**
     * Method to add the wishlists to the DOM
     */

    // Remove the current lists if there are any in the DOM
    let current_items= document.getElementsByClassName("wishlist-name-item");
    if (current_items.length > 0) {
        // Iterate and remove each element
        Array.from(current_items).forEach(element => {
          element.remove();
        });
    }

    // Find the lists' container
    const menu = document.getElementById("wishlist-dropdown-menu");

    // Iterate over each list item,
    // create the html elements and add it to the DOM
    if (list.length > 0) {
        list.forEach((content) => {
            const itemContainer = document.createElement("li");
            const item = document.createElement("a");
            item.className = "dropdown-item wishlist-name-item";
            item.innerHTML = content.name;
            item.href = `/wishlist/${content.id}`;
            itemContainer.append(item);
            menu.prepend(itemContainer);
        });
    }
    else {
        // If the user has no wishlist, show that in the DOM
        const item = document.createElement("p");
        item.className = "dropdown-item wishlist-name-item";
        item.innerHTML = "You do not have any wishlists.";
        menu.prepend(item);
    }
}

function onWishlistModalClose() {
    // Reset the form on form close
    const product_form = document.querySelector('#create-wishlist-form');
    product_form.reset();
    const button_close = document.getElementById("button-wishlist-modal-close");
    button_close.click();
}

function getCart() {
    /**
     * Get the cart by calling the API
     */
    fetch(`/cart`)
    .then(response => response.json())
    .then(data => {
        // Add cart information and cart items to the DOM
        addItemsToCartPanel(data.cart);
        addCartInformation(data.subtotal, data.itemcount);

        // Enable/disable the checkout button based on the item count in the cart
        document.getElementById("button-cart-checkout").disabled = data.cart.length == 0;
    });
}

function addItemsToCartPanel(cartItems) {
    /**
     * Add the cart items to the panel
     */

    // Clean container first if there are any products there
    const cartContainer = document.getElementById("cart-product-container");
    const cartChildren = Array.from(cartContainer.children);
    if (cartChildren.length > 0) {
        cartChildren.forEach(child => child.remove());
    }

    // Iterate over the cart items, create the html elements and add them to the DOM
    cartItems.forEach(item => {
        const cartContainer = document.getElementById("cart-product-container");

        // Container of product information
        const productContainer = document.createElement("div");
        productContainer.className = "row p-b-1 p-t-1 border-bottom";
        productContainer.dataset.id = item.id;

        // Img container
        const imgContainer = document.createElement("div");
        imgContainer.className = "col-md-6";

        // Img
        const img = document.createElement("img");
        img.className = "product-img";
        img.src = item.product.img_url;
        img.alt = item.product.name;

        //Add img to product container
        imgContainer.append(img);
        productContainer.append(imgContainer);

        // Name, Quantity and options container
        const labelAndQuantityAndOpsContainer = document.createElement("div");
        labelAndQuantityAndOpsContainer.className = "col-md-6";

        // Label container
        const labelContainer = document.createElement("div");
        labelContainer.className = "col-md-12";

        // Label
        const label = document.createElement("label");
        label.innerHTML = item.product.name;
        label.className = "bold m-t-1";
        labelContainer.append(label);
        labelAndQuantityAndOpsContainer.append(labelContainer);

        // Quantity container
        const quantityContainer = document.createElement("div");
        labelContainer.className = "col-md-12";

        // Quantity
        const quantity = document.createElement("input");
        quantity.type = "number";
        quantity.min = "1";
        quantity.max = "99";
        quantity.value = item.quantity;
        quantity.className = "form-control";
        quantity.addEventListener("change", () => cartItemQuantityChange(quantity.value, item.id));
        quantityContainer.append(quantity);
        labelAndQuantityAndOpsContainer.append(quantityContainer);

         // Price container
        const priceContainer = document.createElement("div");
        priceContainer.className = "col-md-12";

        // Price label
        const priceLabel = document.createElement("label");
        priceLabel.className = "bold m-t-1";
        priceLabel.innerHTML = `$${item.product.price}`;

        priceContainer.append(priceLabel);
        labelAndQuantityAndOpsContainer.append(priceContainer);

        // Button container
        const buttonContainer = document.createElement("div");
        buttonContainer.className = "col-md-12";

        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "btn btn-primary careful btn-block m-t-1";
        deleteButton.innerHTML = "Delete";
        deleteButton.addEventListener("click", () => deleteItemFromCart(item.id));

        buttonContainer.append(deleteButton);
        labelAndQuantityAndOpsContainer.append(buttonContainer);

        // Adding label and quantity to product container
        productContainer.append(labelAndQuantityAndOpsContainer);

        //Add product container to DOM
        cartContainer.append(productContainer);
    });
}

function addCartInformation(subtotal, count) {
    /**
     * Add cart information, subtotal and number of items to the cart canvas
     */
    const subTotalHeader = document.getElementById("cart-sub-total");
    subTotalHeader.innerHTML = `Sub total: $${subtotal}`;

    const itemCountHeader = document.getElementById("cart-item-count");
    itemCountHeader.innerHTML = `Items: ${count}`;
}

function deleteItemFromCart(itemId)  {
    /**
     * Method that deletes an item from the cart by calling the delete API
     */
    const csrftoken = getCookie('csrftoken');
    fetch(`/remove-from-cart/${itemId}/`, {
        method: 'POST',
        headers: {
        'X-CSRFToken': csrftoken
        }
    })
    .then(response => response.json())
    .then(data => {
        // Once the deletion is done we load the car again
        getCart();
        // reload if the user is in the checkout page
        checkoutReload();
    });
}

function cartItemQuantityChange(quantity, id) {
    /**
     * Method to update the quantity of item in the cart by calling the API
     */
    const csrftoken = getCookie('csrftoken');
    fetch(`/update-item-quantity/${id}/${quantity}`, {
        method: 'POST',
        headers: {
        'X-CSRFToken': csrftoken
        }
    })
    .then(response => response.json())
    .then(data => {
        // Once the update is done, load the car again
        getCart();
        // Reload if the user is in the checkout page
        checkoutReload();
    });
}


function checkoutReload() {
    /**
     * Method to reload the page if the user is
     * in the checkout page
     */
    const currentUrl = window.location.href;
    if (currentUrl.includes("checkout"))
        location.reload();
}