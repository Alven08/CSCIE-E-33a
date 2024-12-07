document.addEventListener("DOMContentLoaded", setup);

function getCookie(name) {
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
    //Load wishlist data
    fetch(`/get-wishlists`)
    .then(response => response.json())
    .then(data => {
        addWishlishItems(data.wishlist);
    });
}


function createNewWishtList() {
    this.event.preventDefault();
    let bla = new FormData(document.getElementById("create-wishlist-form"));
    fetch(`/wishlist`, {
        method: "POST",
        body: bla
    })
    .then(response => response.json())
    .then(data => {
        // data.wishlist.forEach(addWishlishItems);
        addWishlishItems(data.wishlist);
        onWishlistModalClose();
    });

    return false;
}

function addWishlishItems(list) {
    // Remove current item list
    let current_items= document.getElementsByClassName("wishlist-name-item");
    if (current_items.length > 0) {
        // Iterate and remove each element
        Array.from(current_items).forEach(element => {
          element.remove();
        });
    }

    const menu = document.getElementById("wishlist-dropdown-menu");
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
        const item = document.createElement("p");
        item.className = "dropdown-item wishlist-name-item";
        item.innerHTML = "You do not have any wishlists.";
        menu.prepend(item);
    }
}

function onWishlistModalClose() {
    const product_form = document.querySelector('#create-wishlist-form');
    product_form.reset();
    const button_close = document.getElementById("button-wishlist-modal-close");
    button_close.click();
}

function getCart() {
    fetch(`/cart`)
    .then(response => response.json())
    .then(data => {
        if (data.cart.length > 0) {
            addItemsToCartPanel(data.cart);
            addCartInformation(data.subtotal, data.itemcount);
            document.getElementById("button-cart-checkout").disabled = false;
        }
        else {
            document.getElementById("button-cart-checkout").disabled = true;
        }
    });
}

function addItemsToCartPanel(cartItems) {
    // Clean container
    const cartContainer = document.getElementById("cart-product-container");
    const cartChildren = Array.from(cartContainer.children);
    if (cartChildren.length > 0) {
        cartChildren.forEach(child => child.remove());
    }

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
    const subTotalHeader = document.getElementById("cart-sub-total");
    subTotalHeader.innerHTML = `Sub total: $${subtotal}`;

    const itemCountHeader = document.getElementById("cart-item-count");
    itemCountHeader.innerHTML = `Items: ${count}`;
}

function deleteItemFromCart(itemId)  {
    const csrftoken = getCookie('csrftoken');
    fetch(`/remove-from-cart/${itemId}/`, {
        method: 'POST',
        headers: {
        'X-CSRFToken': csrftoken
        }
    })
    .then(response => response.json())
    .then(data => {
        getCart();
        checkoutReload();
    });
}

function cartItemQuantityChange(quantity, id) {
    const csrftoken = getCookie('csrftoken');
    fetch(`/update-item-quantity/${id}/${quantity}`, {
        method: 'POST',
        headers: {
        'X-CSRFToken': csrftoken
        }
    })
    .then(response => response.json())
    .then(data => {
        getCart();
        checkoutReload();
    });
}


function checkoutReload() {
    // reload if in checkout
        const currentUrl = window.location.href;
        if (currentUrl.includes("checkout"))
            location.reload();
}