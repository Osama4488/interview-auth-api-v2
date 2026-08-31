# Interview SaaS V2 — Authentication API

An independently deployable authentication service for the Interview SaaS V2 platform.

## Responsibilities

- User signup and password login
- Password hashing with bcrypt
- Optional email OTP verification
- JWT access and refresh tokens
- HTTP-only authentication cookies
- Authenticated current-user endpoint
- Request validation with Zod
- Centralized error handling and environment validation

## API routes

| Method | Route | Purpose |
| --- | --- | --- |
| `POST` | `/api/auth/signup` | Create an account |
| `POST` | `/api/auth/login` | Authenticate a user |
| `POST` | `/api/auth/verify-otp` | Complete optional OTP verification |
| `POST` | `/api/auth/refresh` | Issue a new access token |
| `POST` | `/api/auth/logout` | Clear authentication cookies |
| `GET` | `/api/auth/me` | Return the authenticated user identifier |

## Technology

Node.js · Express 5 · TypeScript · MongoDB · Mongoose · JWT · Zod · bcrypt · Docker

## Local development

```bash
npm install
npm run dev
```

Create a local `.env` file from safe placeholders and provide the MongoDB connection, JWT secrets, cookie configuration, CORS origin, and optional email/OTP settings required by the application.

## Build and run

```bash
npm run typecheck
npm run build
npm start
```

## Docker

This service is designed to run as the `auth-api` container in the parent Docker Compose application and listens on port `4001` in that setup.

> Never commit real MongoDB credentials, JWT secrets, or email-provider keys.

