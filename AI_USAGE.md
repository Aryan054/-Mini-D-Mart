# AI Usage & Architecture Decisions

This project was built primarily by an AI coding assistant, architected strictly following the constraints of a senior full-stack developer prompt.

## Architectural Decisions

- **Strict Frontend/Backend Separation**: The frontend (React+Vite) and backend (Django) are completely separate repositories containing their own configs. They communicate solely over REST APIs.
- **No Django Templates**: Django was forced strictly into an API-only mode, using Django REST Framework for JSON endpoints. 
- **Centralized Authentication**: Context API was used on the frontend to manage JWT tokens across the app. Protected routes check against roles (`CUSTOMER` vs. `STAFF/ADMIN`) to dynamically render different dashboard layouts.
- **Dynamic CSS vs Utility**: Tailwind CSS was heavily leveraged to create modern, responsive layouts rapidly without polluting standard CSS files.
- **RESTful Best Practices**: Nested serializers, generic views, and explicit validation (e.g. stopping orders with insufficient stock at the DB level) were heavily utilized for robust data integrity.

## AI Involvement

- Bootstrapped standard boilerplates (Vite setup, Django setup).
- Wrote detailed models with custom validators.
- Engineered complex React-Router setup for multi-role redirection and nested layouts.
- Auto-generated 50+ fake products, categories, and inventory via a custom python seed script (`seed.py`).
- Automated integration test execution and debugging via `pytest`.
