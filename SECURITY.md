# Security Policy

## Supported Versions

Currently, the master branch of this project is the only branch supported with security updates.

## Authentication and Authorization

Mini D-Mart uses **JSON Web Tokens (JWT)** for authentication.
- Access tokens are issued with a short lifespan (e.g., 60 minutes).
- Refresh tokens are issued to request new access tokens securely.
- Role-based Access Control (RBAC) is heavily enforced on all API endpoints. For example, customers can only access their own data, while staff can view overall catalog and order information.

## Security Features Enabled

- **CORS Mitigation**: Cross-Origin Resource Sharing is locked down to specific frontend origins (e.g., `localhost:5173` for development).
- **Rate Limiting**: Critical endpoints (such as `/api/v1/auth/login/`) are rate-limited to prevent brute-force attacks.
- **SQL Injection Prevention**: Django's ORM is utilized for all database interactions.
- **CSRF Protection**: Native Django CSRF protection is configured when session-based auth is layered, although JWTs are primarily used.

## Reporting a Vulnerability

If you discover a security vulnerability within Mini D-Mart, please send an e-mail to the development team or open a private issue in the repository. We aim to address all security issues promptly.
