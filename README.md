# AmazPocket
Final Project for CSCI E-33a. AmazPocket is a lightweight e-commerce web application built using Django, HTML, CSS, and Javascript.
The application allows users to register, log in, and log out. With an account, the user can add products to the cart. The application also has a feature that allows users to create multiple wishlists. A user can add products to any wishlist.


### Products, Cart and Wishlists
The user can interact with products without loading a different page. The user can click on any product and a popup with the product's information and possible actions. The same approach was implemented for the cart, as the user can see the cart without loading a different page. By clicking on the cart link in the navigation bar, the application displays a side panel with the cart, showing the products in the cart. In the cart, the user can change the quantity of the product or even delete it from the cart. Finally, the user can click on the checkout button to be redirected to the checkout screen.

An interesting feature of the web application is that only nine products are loaded on all pages. As the user scrolls down, more products, if any, are loaded and displayed. This decision was made to decrease the load times by reducing the number of products loaded simultaneously. If the user wants to see more products scrolling down the page will load more. This is a better approach than loading all the possible products at once and waiting for the client to render them.


### Checkout
In the checkout screen, the user can see the items to be purchased. There is also a form requesting the delivery information. 


### Orders, Vendors and Profile Page
The application allows users to be vendors too. During registration, a user can indicate that it is a vendor and provide a vendor name. Users can go to the profile page by clicking on their name in the navigation bar. On the profile page, users can see all their orders under the "Your Orders" tab. If a user is also a vendor, the user will see a second tab "Your Products". There, the user can add, update, or delete products.


## Files
### fixtures/intial_data.json
The initial data fixture file contains the initial data to be loaded into the database. Once loaded, the database will have five categories, one vendor user, and thirteen products, all belonging to that single vendor user.


### static/AmazPocket/product.js
The product.js file contains methods for fetching, rendering, and interacting with the products. The file will load only 10 products each time the user scrolls past a certain point in the page until there are no more products to load. The script will also create the div, img, h, and p tags with the products' information and add them to a modal popup that displays the product's complete information. This file allows for a single-page interaction because it loads:
All the products
Category products
Search products
Wishlist products


### static/AmazPocket/profile.js
The profile.js file will load the orders the user made. If the user is a vendor it will also load the vendor's products. It follows the nine items at a time approach, for the orders and the products. It organizes the two types of data in tabs. Your Orders tab and Your Products tab. If the user is not a vendor the Your Products tab will be hidden. When loading the orders, the file creates accordions that contain the order information. The first accordion will be open by default and the other accordions will be closed. Only one accordion at a time can be opened.


### static/AmazPocket/register.js
The register.js file only contains one method that hides or displays the "Vendor Name" input element when the user interacts with the "Is Vendor" checkbox.


### static/AmazPocket/site.js
The site.js controls the interactions that should happen across the website. It controls:
User's initial interaction with wishlist. It populates the dropdown in the navbar with the user's wishlist. If a wishlist name is clicked it will redirect to the index page and there the products will be loaded.
The user's interactions with the cart. It fetches and renders the products in the cart in the DOM. It handles the quantity change of products and the deletion of products from the cart.


### static/AmazPocket/styles.css
It contains the web application style definitions. The file is broken down into sections.
The common classes to be used across the website.
Styling for buttons
Styling for the Categories page
Styling for the Index page
Styling for the Wishlist page
Styling for the off-canvas Cart
Styling for the Checkout page
Styling for the Profile page
Styling for the Profile's page Orders tab


### templates/AmazPocket/categories.html
Basic HTML file containing the structure of the page. It displays all the categories existing in the application. This page loads all the categories at once as there are not that many categories.


### templates/AmazPocket/checkout.html
HTML page that displays the products to be purchased and a form requesting delivery and payment information. There is a button to complete the purchase.


### templates/AmazPocket/index.html
This is the main HTML page. It contains a section for displaying the title of the page if the page is not the home page. It also contains a modal popup for products to display the product's complete information. It loads the product.js.


### templates/AmazPocket/layout.html
This is the HTML containing the basic structure of the web application. It contains the navigation bar, the off-canvas cart, and the modal popup for creating wishlists. Wishlists can be created from anywhere on the website. This file also contains the references to:
Bootstrap 5
JQuery (necessary for bootstrap)
React Scripts
Style Scripts


### templates/AmazPocket/login.html
This HTML page contains the basic structure for the login page. It has input elements for email and password.


### templates/AmazPocket/order_confirmation.html
This HTML page contains three h tags informing the user that the order has been made successfully. It provides the order ID.


### templates/AmazPocket/profile.html
This HTML page contains the user's:
Orders
Products (if the user is a vendor)
The HTML contains the tab structure to switch between the orders and the products owned by the vendor. It also contains a modal with a form to create new products, if the user is a vendor.


### templates/AmazPocket/register.html
This HTML page contains a form to create a new account. It contains a checkbox to indicate if the account is a vendor. If the checkbox is checked, a new input element for a vendor name displays.


### admin.py
This file registers the models created in models.py to be accessible through the Django admin page. It registers the models: User, Product, Category, Order, OrderDetails, and OrderItem.


### forms.py
This file contains definitions for the product and order detail forms. The product form contains the fields to create or update a product. It specifies that the description field should be a text area. The OrderDetail form specifies the fields to display in the UI necessary to carry on the purchase. For both forms, the fields should have the "form-control" class and a placeholder.


### models.py
This file contains the models used in the application.
The user model extends from the abstract user class and in addition it has two more properties, is_vendor and vendor_name. It has a method that returns the wishlists the user has. 

The category model contains properties that identify a category to group products. It has a name, description, img_url, and is_active.

The product model contains the properties that define a product. The properties are name, description, category, img_url, price, in_stock_quantity, is_active, vendor, and created_date. 

The Order model represents the basic information of an order. It has a user, subtotal, tax, total, and created_date. The order model as one to one relationship with the OrderDetails model. The OrderDetails model has the order, the name, the address, city, state, zip code, and credit_card. Also, the Order model has a one-to-many relationship with the OrderItem model. The OrderItem model has an order, product, quantity, and price.

The Cart model is the representation of the user's cart. It has a property for the user and the total. It has a method to get the subtotal of the order and a method to get the number of items in the cart. The cart has a one-to-many relationship with CartItem model. The CartItem model represents a single item in the cart. It has a reference to the cart, a reference to the product, and a quantity field.

The Wishlist model represents the wishlists the user has. It has a foreign key to the user and a field for the name of the wishlist. Also, it has a one-to-many relationship with the WishlistItem model. The WishlistItem model is the representation of the cart items. It has a foreign key for the wishlist and a foreign key for the product.

Finally, all models have a serialized method that returns a JSON format representation of the model.


### urls.py
This file contains all the urls the web application supports. They are grouped by section.


### views.py
This file contains the business logic and the processing of the web application. It is the API of the application. It contains methods to render the index, login, register, profile, categories, checkout, and order confirmation pages. It also has methods for the CRUD operations of:
Products
Wishlist
Cart
User

## How To Run
To run the application run:
1. python manage.py makemigrations AmazPocket
2. python manage.py migrate
3. Load the fixtures: python manage.py loaddata AmazPocket/fixtures/initial_data.json
4. python manage.py createsuperuser
5. python manage.py runserver


## Youtube Video
https://youtu.be/yEdQEfnLXd0