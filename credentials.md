# Mini D-Mart Credentials Documentation

This document contains the default credentials for testing the different roles in the Mini D-Mart application.

These credentials are for testing and demonstration purposes only. Do not use them in a production environment.

## 🔑 Default Accounts

### 1. Admin (Superuser)
- **Email:** `admin@minidmart.com`
- **Password:** `adminpass`
- **Role Permissions:** Read-only access to all dashboards. Full access to User Management to assign and revoke roles.

### 2. Manager
- **Email:** `manager@minidmart.com`
- **Password:** `managerpass`
- **Role Permissions:** Full access to Products (Add/Edit/Delete), access to process Returns (Approve/Reject/Complete), and view access to Operations and KPIs.

### 3. Staff
- **Email:** `staff@minidmart.com`
- **Password:** `staffpass`
- **Role Permissions:** Full access to Order pipelines (processing orders) and Inventory Management (adjusting stock levels).

### 4. Customer
- **Email:** `customer@minidmart.com`
- **Password:** `custpass`
- **Role Permissions:** Access to the storefront to browse products, add items to the cart, place orders, and view order history.

## 📝 Usage

You can use these credentials to log in at `http://localhost:5173/login`. 
The application will automatically route you to the appropriate dashboard or storefront based on your assigned role!
