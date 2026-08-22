# Mini D-Mart

Mini D-Mart is a full-stack e-commerce application built with Django REST Framework (Backend) and React + TypeScript (Frontend). It features a robust multi-role authentication system, comprehensive product catalog, inventory management, shopping cart, checkout processing, and a complete return/exchange workflow.

## Features

- **Multi-Role Authentication**: Support for Customers, Staff, Managers, and Admins using JWT.
- **Product Catalog**: Dynamic catalog with category filtering, search, and pagination.
- **Inventory Management**: Real-time stock tracking and low-stock alerts.
- **Shopping Cart & Checkout**: Add products to cart, calculate subtotals, and process orders with varying fulfillment types (Home Delivery, Store Pickup).
- **Returns & Exchanges**: Fully integrated workflow for customers to request returns, and for staff to approve and restock items.
- **Role-Based Dashboards**: Tailored UI dashboards based on the logged-in user role (Customer vs. Admin/Staff).
- **Secure APIs**: Robust backend REST API with proper permission checks and rate limiting configurations.

## Architecture

The system is separated into two completely independent repositories/projects:

1. `mini-dmart-backend`: A Python-based Django REST Framework API.
2. `mini-dmart-frontend`: A React + TypeScript Single Page Application (SPA).

They communicate strictly via REST APIs over HTTP/JSON.

## Setup Instructions

### Backend (Django)

1. Navigate to the backend directory: `cd mini-dmart-backend`
2. Create a virtual environment: `python -m venv venv`
3. Activate the virtual environment:
   - Windows: `.\venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Run migrations: `python manage.py migrate`
6. Seed the database (optional): `python seed.py`
7. Start the server: `python manage.py runserver`

### Frontend (React/Vite)

1. Navigate to the frontend directory: `cd mini-dmart-frontend`
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

## Deployment

This project is configured for seamless "Monorepo" deployment on Vercel, allowing both the frontend React app and backend Django API to run simultaneously from a single deployment instance.

### Vercel Deployment Steps
1. Push the entire `mini-dmart` root directory to a GitHub repository.
2. Log into [Vercel](https://vercel.com/) and import the repository.
3. The root `vercel.json` will automatically configure Vercel to:
   - Build the frontend using Node.js and serve it statically.
   - Run the backend via Vercel's Python Serverless functions using `vercel_wsgi.py`.
   - Route all `/api/*` traffic automatically to the Python backend!
4. Ensure you set your environment variables in the Vercel dashboard:
   - `DJANGO_SETTINGS_MODULE=config.settings.production`
   - `SECRET_KEY=your_secret_key`

*Example Public URL: https://mini-dmart-demo.vercel.app*

## Security Findings & Features

- **Authentication & Authorization**: Implemented using stateless JWTs. Token rotation is handled securely.
- **RBAC**: Strict Role-Based Access Control enforced at the View/Serializer level (e.g. `IsAdminUser`, custom `IsStaffOrManager` permissions).
- **Password Security**: Django's native PBKDF2 password hasher is used.
- **Input Validation**: DRF Serializers rigorously validate data (e.g., ensuring order quantities do not exceed available inventory).
- **Environment Secrets**: All sensitive keys are loaded via `.env` files and `python-dotenv`.

## Testing & Debugging

The backend includes a comprehensive Pytest suite focusing on core business logic:
- **Transactional Integrity**: Checkout processes are wrapped in `transaction.atomic` to ensure inventory is never decremented if an order fails to save.
- **Run tests locally**: `pytest` or `pytest -v` from the backend directory.
