# API Reference

## Endpoints

### Authentication
- POST /auth/register
- POST /auth/login
- GET /auth/profile

### Products
- GET /products
- GET /products/:id
- POST /products
- PUT /products/:id
- DELETE /products/:id

### Orders
- GET /orders
- GET /orders/:id
- POST /orders
- POST /orders/:id/pay/dot
- POST /orders/:id/pay/mpesa
- POST /orders/:id/ship
- POST /orders/:id/confirm
- POST /orders/:id/dispute

### Admin
- GET /admin/disputes
- POST /admin/orders/:id/resolve
- GET /admin/users
- PUT /admin/users/:id/kyc

### Webhooks
- POST /mpesa/callback
- POST /mpesa/timeout
