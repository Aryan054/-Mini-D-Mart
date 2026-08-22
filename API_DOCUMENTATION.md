# Mini D-Mart API Documentation

The Mini D-Mart backend provides a RESTful API to manage the e-commerce store. 
Base URL (default): `http://localhost:8000/api/v1`

## Authentication (`/api/v1/auth/`)

- `POST /register/`: Register a new user. Required fields: email, password, first_name, last_name, role.
- `POST /login/`: Obtain JWT tokens (access and refresh).
- `POST /token/refresh/`: Refresh an expired access token using a refresh token.
- `POST /logout/`: Blacklist the provided refresh token.

## Product Catalog (`/api/v1/products/`)

- `GET /`: List all active products. Supports pagination, search, and category filtering.
- `GET /categories/`: List all product categories.
- `GET /<id>/`: Retrieve details for a specific product.

## Shopping Cart (`/api/v1/cart/`)

- `GET /`: Retrieve the current user's shopping cart and items.
- `POST /add/`: Add an item to the cart. Required: `product_id`, `quantity`.
- `POST /update/`: Update the quantity of a specific cart item.
- `POST /remove/`: Remove a specific item from the cart.
- `POST /clear/`: Empty the user's cart.

## Checkout & Orders (`/api/v1/orders/`)

- `POST /checkout/`: Convert the shopping cart into an Order. Required fields depending on fulfillment type: `fulfillment_type` (HOME_DELIVERY or STORE_PICKUP).
- `GET /`: Retrieve order history for the current user.
- `GET /<id>/`: Retrieve specific order details.
- `POST /<id>/cancel/`: Request cancellation for a pending order.

## Returns & Exchanges (`/api/v1/returns/`)

- `GET /`: List the current user's return requests.
- `POST /`: Create a new return request. Required: `order`, `order_item`, `quantity`, `reason`, `description`.
- `POST /<id>/cancel/`: Cancel an active return request.

## Admin & Staff APIs (`/api/v1/staff/`)

> **Note:** These endpoints require `STAFF`, `MANAGER`, or `ADMIN` roles.

- `GET /orders/`: View all system orders.
- `PATCH /orders/<id>/status/`: Update the status of an order.
- `GET /inventory/`: Monitor current stock levels and see low stock warnings.
- `POST /inventory/<id>/adjust/`: Adjust stock counts manually.
- `GET /returns/`: View all customer return requests.
- `POST /returns/<id>/<action>/`: Process a return request. Valid actions: `approve`, `reject`, `complete`.
