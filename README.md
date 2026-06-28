# Retail Store

Inventory and point-of-sale app for a retail store. Built with Angular, NestJS, TypeORM, and MySQL.

## Run with Docker

```bash
docker compose up --build
```

- Frontend: http://localhost
- Backend API: http://localhost:3000/api

Wait until all services are healthy, then open the frontend URL and log in.

## Demo accounts

| Role     | Email                 | Password     |
|----------|-----------------------|--------------|
| Manager  | manager@retail.com    | password123  |
| Employee | employee@retail.com   | password123  |

### What each role can do

- **Manager** — manage products and categories, view dashboard/reports, process sales
- **Employee** — process sales and view sales history

## Local development (optional)

**Backend** (`retail-store-backend/`):

```bash
npm install
npm run start:dev
```

Runs on http://localhost:3000. Set `JWT_SECRET` and database env vars (see `docker-compose.yml` for reference).

**Frontend** (`retail-store-frontend/`):

```bash
npm install
npm start
```

Runs on http://localhost:4200 and talks to the backend at http://localhost:3000.

## Project layout

- `retail-store-backend/` — NestJS API, TypeORM, MySQL
- `retail-store-frontend/` — Angular UI
