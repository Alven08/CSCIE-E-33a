document.addEventListener("DOMContentLoaded", setup);

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
    // let form_data = JSON.stringify();
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
            const item = document.createElement("a");
            item.className = "dropdown-item wishlist-name-item";
            item.innerHTML = content.name;
            item.href = `/wishlist/${content.id}`;
            menu.prepend(item);
        });
    }
    else {
        const item = document.createElement("p");
        item.className = "dropdown-item";
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