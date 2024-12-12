# AmazPocket
Final Project for CSCI E-33a. AmazPocket is a lightweight e-commerce web application built using Django, HTML, CSS, and Javascript.
The application allows users to register, log in, and log out. With an account, the user can add products to the cart. The application also has a feature that allows users to create multiple wishlists. A user can add products to any wishlist.

### Products, Cart and Wishlists
The user can interact with products without loading a different page. The user can click on any product and a popup with the product's information and possible actions. The same approach was implemented for the cart, as the user can see the cart without loading a different page. By clicking on the cart link in the navigation bar, the application displays a side panel with the cart, showing the products in the cart. In the cart, the user can change the quantity of the product or even delete it from the cart. Finally, the user can click on the checkout button to be redirected to the checkout screen.

An interesting feature of the web application is that only ten products are loaded on all pages. As the user scrolls down, more products, if any, are loaded and displayed.

### Checkout
In the checkout screen, the user can see the items to be purchased. There is also a form requesting the delivery information. 

### Orders, Vendors and Profile Page
The application allows users to be vendors too. During registration, a user can indicate that it is a vendor and provide a vendor name. Users can go to the profile page by clicking on their name in the navigation bar. On the profile page, users can see all their orders under the "Your Orders" tab. If a user is also a vendor, the user will see a second tab "Your Products". There, the user can add, update, or delete products.

## How To Run
To run the application run:
1. python manage.py makemigrations AmazPocket
2. python manage.py migrate
3. Load the fixtures: python manage.py loaddata AmazPocket/fixtures/initial_data.json