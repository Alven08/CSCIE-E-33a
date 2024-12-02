document.addEventListener("DOMContentLoaded", setup);

function setup() {
    const wlDropdown = document.getElementById("wishlist-dropdown-menu");
    if (wlDropdown) {
        document.getElementById("create-wishlist-form").addEventListener("submit", createNewWishtList);
        loadData();
    }
}

function loadData() {
    //Load wishlist data
    fetch(`/get-wishlists`)
    .then(response => response.json())
    .then(data => {
        if (data.wishlist.length > 0)
            data.wishlist.forEach(addWishlishItems);
        else
            addWishlishItems(undefined);
    });
}


function createNewWishtList() {
    this.preventDefault();
//TODO
    fetch(`/wishlist`,
        method)
        .then(response => response.json())
        .then(data => {
            if (data.wishlist.length > 0)
                data.wishlist.forEach(addWishlishItems);
            else
                addWishlishItems(undefined);
        });
}

function addWishlishItems(content) {
    const menu = document.getElementById("wishlist-dropdown-menu");
    if (content === undefined) {
        const item = document.createElement("p");
        item.className = "dropdown-item";
        item.innerHTML = "You do not have any wishlists.";
        menu.prepend(item);
    }
    else {
        const item = document.createElement("a");
        item.className = "dropdown-item";
        item.innerHTML = content.name;
        item.href = `/wishlist/${content.id}`;
        menu.prepend(item);
    }
}