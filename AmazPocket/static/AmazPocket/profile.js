// Start with first post
let counter = 0;

// Load posts 10 at a time
const quantity = 9;

// Flags
let endOfData = false;
let loadOrdersFlag = true;

// Constants
const ORDER_TAB = "order";
const PRODUCT_TAB = "product";


document.addEventListener("DOMContentLoaded", loadOrders);

// The page will load more items as the user scrolls the items already loaded
window.onscroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        if (loadOrdersFlag)
            loadOrders();
        else
            loadProducts();
    }
};

function resetLoadParameters() {
    /**
     * Method to reset the load parameters.
     * This is call when a vendor switches between
     * orders tab and products tab
     */
    counter = 0;
    endOfData = false;
}

function changeActiveTab(tab) {
    /**
     * Method to switch between the orders and the products tabs
     */
    const productTab = document.getElementById("showYourProducts");
    const orderTab = document.getElementById("showYourOrders");

    // Set the active tab
    if (tab == ORDER_TAB) {
        orderTab.className = "nav-link active";

        if (productTab != null)
            productTab.className = "nav-link";

    } else {
        orderTab.className = "nav-link";

        if (productTab != null)
            productTab.className = "nav-link active";
    }
}


//////////////////////////////////////////////
// Vendor profile
//////////////////////////////////////////////

function showYourProducts() {
    /**
     * Method used to load the "Your Products" tab.
     */

    // Display the products container
    const productsContainer = document.getElementById("profile-products");
    productsContainer.style.display = "flex";

    // Hide the orders container
    const ordersContainer = document.getElementById("profile-orders-container");
    ordersContainer.style.display = "none";

    // Reset the parameters, set the tab active
    resetLoadParameters();
    changeActiveTab(PRODUCT_TAB);
    loadOrdersFlag = false;

    // Reset the product container and load the products
    resetProductSpace();
    loadProducts();
}

function changeProductFormToPost() {
    /**
     * Method to setup the form for the creation of a new product
     */
    let product_form = document.querySelector('#product-form');
    product_form.action = "/product";
    const popupLabel = document.getElementById('exampleModalLabel');
    popupLabel.innerHTML = 'Add New Product';
}

function changeProductFormToPut(product_id) {
    /**
     * Method to setup the form for the update of an existing product
     */
    let product_form = document.querySelector('#product-form');
    product_form.action = "/product/" + product_id;
    const popupLabel = document.getElementById('exampleModalLabel');
    popupLabel.innerHTML = 'Update Product';
}

function closeForm() {
    /**
     * Method to close the product modal popup.
     * This will reset the product form.
     */
    const product_form = document.querySelector('#product-form');
    document.getElementById('id_description').innerHTML = '';
    product_form.reset();
}

function onProductClick(product_id) {
    /**
     * Method to load the product data on product click.
     */

    // Set the product form to update
    changeProductFormToPut(product_id);

    const url = "/product/" + product_id;

    fetch(url, {
        method: 'GET'
    })
        .then(response => response.json())
        .then(response => response.form)
        .then(data => {
            // Update the DOM with the product's information
            document.getElementById('id_name').value = data.name;
            document.getElementById('id_description').innerHTML = data.description;
            document.getElementById('id_category').value = data.category.id;
            document.getElementById('id_img_url').value = data.img_url;
            document.getElementById('id_price').value = data.price;
            document.getElementById('id_in_stock_quantity').value = data.in_stock_quantity;
            document.getElementById('id_is_active').checked = data.is_active;
        });
}

function loadProducts() {
    /**
     * Method to load the products by calling the API
     */

    // Checking if we reached the end of products
    if (endOfData)
        return;

    // Set start and end post numbers, and update counter
    const start = counter;
    const end = start + quantity;
    counter = end;

    // Get new posts and add posts
    fetch(`/load-vendor-products?start=${start}&end=${end}`)
    .then(response => response.json())
    .then(data => {
        // Add the products to the DOM if any
        if (data.products.length > 0)
            data.products.forEach(add_products);
        else {
            if (start === 0)
                add_no_product_tag();

            endOfData = true;
        }
    });
}

function resetProductSpace() {
    /**
     * Method to reset the product container
     * this is call before be add the products to the DOM
     */
    const allDisplayingProducts = document.getElementsByClassName("col-md-4 product-space");
    const arrayOfProducts = Array.from(allDisplayingProducts);
    arrayOfProducts.forEach(product => product.remove());
}

function add_products(content) {
    /**
     * Add a new product with given contents to DOM
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
    document.querySelector('#profile-products').append(container);
}

function add_no_product_tag() {
    /**
     * Method to add a tag indicating there are no products
     */
    const hTag = document.createElement("h3");
    hTag.innerHTML = "There are no products";
    document.querySelector('#profile-products').append(hTag);
}


//////////////////////////////////////////////
// User Profile
//////////////////////////////////////////////

function showYourOrders() {
     /**
     * Method used to load the "Your Orders" tab.
     */

     // Hide the products container
    const productsContainer = document.getElementById("profile-products");
    if (productsContainer != null)
        productsContainer.style.display = "none";

    // Display the orders container
    const ordersContainer = document.getElementById("profile-orders-container");
    ordersContainer.style.display = "flex";

    // Reset the parameters, set the tab active
    changeActiveTab(ORDER_TAB);
    resetLoadParameters();
    loadOrdersFlag = true;

    // Reset the order container and load the orders
    resetOrderSpace();
    loadOrders();
}

function loadOrders() {
    /**
     * Method to load the orders by calling the API
     */

    // Checking if we reached the end of products
    if (endOfData)
        return;

    // Set start and end post numbers, and update counter
    const start = counter;
    const end = start + quantity;
    counter = end;

    // Get new posts and add posts
    fetch(`/load-orders?start=${start}&end=${end}`)
    .then(response => response.json())
    .then(data => {
        // Add the orders if there are any
        if (data.orders.length > 0)
            addOrdersToDom(data.orders);
        else {
            if (start === 0)
                addNoProductTag();

            endOfData = true;
        }
    });
}

function resetOrderSpace() {
    /**
     * Method to reset order container
     */
    const accordion = document.getElementById("accordionExample");
    if (accordion != null)
        accordion.remove();
}

function addOrdersToDom(orders) {
    /**
     * Method to add the order with given contents to DOM
     */
    const container = document.getElementById("profile-orders-container");

    // If no container is found it means the logged-in user is not a vendor
    if (container == null)
        return;

    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    //Create the accordion if it does not exist
    let accordion = document.getElementById("accordionExample");
    let accordionCreation = accordion == null;
    if (accordionCreation) {
        accordion = document.createElement("div");
        accordion.id = "accordionExample";
        accordion.className = "accordion";
    }

    // The first order should be active
    let firstItem = true;
    orders.forEach(order => {
        // Create bootstrap accordion
        const accordionItem = document.createElement("div");
        accordionItem.className = "accordion-item";

        // Create header
        const header = document.createElement("h2");
        header.className = "accordion-header";
        header.id = `heading${order.id}`;
        accordionItem.append(header);

        // Create accordion button
        const button = document.createElement("button");
        button.className = "accordion-button order";
        if (!firstItem)
            button.classList.add("collapsed");
        button.type = "button";
        button.setAttribute("data-bs-toggle", "collapse");
        button.setAttribute("data-bs-target", `#${order.id}`);
        button.setAttribute("aria-expanded", firstItem);
        button.setAttribute("aria-controls", `${order.id}`);
        button.innerHTML = `Order ID: ${order.id} - Item count: ${order.total_items} - Ordered on ${new Date(order.order_date).toLocaleDateString("en-US", dateOptions)}`;
        header.append(button);

        // Create accordion container
        const accordionContentContainer = document.createElement("div");
        accordionContentContainer.className = "accordion-collapse collapse";
        if (firstItem)
            accordionContentContainer.classList.add("show");
        accordionContentContainer.id = `${order.id}`;
        accordionContentContainer.setAttribute("aria-labelledby", `heading${order.id}`);
        accordionContentContainer.setAttribute("data-bs-parent", "#accordionExample");
        accordionItem.append(accordionContentContainer);

        const accordionContent = document.createElement("div");
        accordionContent.className = "accordion-body";
        accordionContentContainer.append(accordionContent);


        // Container of order information.
        // It goes inside the accordion content
        const orderContainer = document.createElement("div");
        orderContainer.className = "row p-b-1 p-t-1";
        orderContainer.dataset.id = order.id;

        const orderInfo = document.createElement("div");
        orderInfo.className = "col-md-6";

        const orderCostInfoPTag = document.createElement("p");
        orderCostInfoPTag.innerHTML = `<strong>Total items:</strong> ${order.total_items} - <strong>Total cost:</strong> $${order.total}`;
        orderInfo.append(orderCostInfoPTag);

        const deliverTo = document.createElement("p");
        deliverTo.innerHTML = `<strong>Deliver to:</strong> ${order.order_detail.name}`;
        orderInfo.append(deliverTo);

        const deliveryAddress = document.createElement("p");
        deliveryAddress.innerHTML = `<strong>Shipping Addess:</strong> ${order.order_detail.address}, ${order.order_detail.city}, ${order.order_detail.state} ${order.order_detail.zipcode}`;
        orderInfo.append(deliveryAddress);

        orderContainer.append(orderInfo);

        const orderItems = document.createElement("div");
        orderItems.className = "col-md-6";
        orderContainer.append(orderItems);

        order.items.forEach(item => {

            const orderItemsRow = document.createElement("div");
            orderItemsRow.className = "row";
            orderItems.append(orderItemsRow);

            accordionContent.append(orderContainer);

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
            orderItemsRow.append(imgContainer);

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
            quantityContainer.className = "col-md-12";

            // Quantity
            const quantity = document.createElement("label");
            quantity.innerHTML = `<strong>Quantity:</strong> ${item.quantity}`;
            quantityContainer.append(quantity);
            labelAndQuantityAndOpsContainer.append(quantityContainer);

             // Price container
            const priceContainer = document.createElement("div");
            priceContainer.className = "col-md-12";

            // Price label
            const priceLabel = document.createElement("label");
            //priceLabel.className = "bold m-t-1";
            priceLabel.innerHTML = `<strong>Price:</strong> $${item.individual_item_price}`;

            priceContainer.append(priceLabel);
            labelAndQuantityAndOpsContainer.append(priceContainer);

            // Adding label and quantity to product container
            orderItemsRow.append(labelAndQuantityAndOpsContainer);
        });

        //Add whole content to the accordion
        accordion.append(accordionItem);

        firstItem = false;
    });

    //Finally add elements to the DOM
    if (accordionCreation)
        container.append(accordion);
}

function addNoProductTag() {
    /**
     * Method to add a h tag indicating that there are no products
     * @type {HTMLElement}
     */
    const container = document.getElementById("sub-header-profile");
    const noProductTag = document.createElement("h4");
    noProductTag.innerHTML = "You have not orders yet.";
    container.append(noProductTag);
}

