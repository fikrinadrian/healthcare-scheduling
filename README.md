# Healthcare Scheduling API

A GraphQL backend for user authentication and managing customers, doctors, and appointments. The project consists of an Auth Service and a Schedule Service that share a PostgreSQL database.

## Technology stack

- NestJS and GraphQL
- Prisma ORM
- PostgreSQL
- Docker Compose

## System architecture

```mermaid
flowchart LR
    Client[Client / GraphQL IDE]
    Auth[Auth Service<br/>:3001]
    Schedule[Schedule Service<br/>:3002]
    DB[(PostgreSQL<br/>:5432)]

    Client -->|signup / signin| Auth
    Client -->|Bearer access token| Schedule
    Schedule -->|validateToken + Bearer token| Auth
    Auth --> DB
    Schedule --> DB
```

All containers connect through the `app-network` network. The Schedule Service validates each request by calling the Auth Service's `validateToken` query. The `migrate` service applies Prisma migrations before either API starts. PostgreSQL data is stored in the Docker volume `postgres_data`.

## Run with Docker Compose

Prerequisite: Docker Desktop or Docker Engine with Docker Compose.

1. Create a local environment file from the example:

   ```bash
   cp .env.example .env
   ```

   In PowerShell, use `Copy-Item .env.example .env`.

2. Build the images and start all services:

   ```bash
   docker compose up --build -d
   ```

3. Check service status and logs when needed:

   ```bash
   docker compose ps
   docker compose logs -f auth schedule
   ```

GraphQL endpoints:

| Service | URL |
| --- | --- |
| Auth Service | `http://localhost:3001/graphql` |
| Schedule Service | `http://localhost:3002/graphql` |

PostgreSQL is available from the host at `localhost:5432`. Connect to the database configured by `POSTGRES_DB` (default: `healthcare`). To stop the containers:

```bash
docker compose down
```

This command preserves the database volume. Running `docker compose down -v` also deletes PostgreSQL data.

## Environment variables

| Variable | Compose default | Description |
| --- | --- | --- |
| `POSTGRES_DB` | `healthcare` | PostgreSQL database name. |
| `POSTGRES_USER` | `postgres` | PostgreSQL user. |
| `POSTGRES_PASSWORD` | `postgres` | PostgreSQL password. Change it outside local development. |
| `POSTGRES_PORT` | `5432` | PostgreSQL port published to the host. |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/healthcare?schema=public` | URL for running Prisma commands from the host. Compose builds an internal URL using the `postgres` hostname. |
| `AUTH_PORT` | `3001` | Auth Service port. |
| `SCHEDULE_PORT` | `3002` | Schedule Service port. |
| `AUTH_SERVICE_URL` | `http://auth:3001/graphql` | Auth Service URL used by Schedule Service on the Compose network. Update the port if `AUTH_PORT` changes. |
| `AUTH_SERVICE_TIMEOUT_MS` | `3000` | Auth Service token validation timeout in milliseconds. |
| `JWT_ACCESS_SECRET` | `change-this-access-secret` | Access token signing secret. Use a strong secret value. |
| `JWT_REFRESH_SECRET` | `change-this-refresh-secret` | Refresh token signing secret. Use a strong secret value. |

Set local values in `.env`. Do not use the example secrets in a deployment.

## Authentication

Sign up or sign in through the Auth Service. Copy the returned `accessToken` and send it with every Schedule Service request using the `Authorization` header:

```json
{
  "Authorization": "Bearer <ACCESS_TOKEN>"
}
```

Set this header in the GraphQL IDE's **HTTP HEADERS** section. Missing or invalid tokens return a GraphQL error with the `UNAUTHENTICATED` code.

## GraphQL examples

Send Auth Service operations to `http://localhost:3001/graphql`. Send data management operations to `http://localhost:3002/graphql`.

### Auth Service

Sign up:

```graphql
mutation SignUp($input: SignInput!) {
  signup(signUpInput: $input) {
    accessToken
    user {
      id
      email
    }
  }
}
```

Variables:

```json
{
  "input": {
    "email": "budi@example.com",
    "password": "secure-password"
  }
}
```

Sign in to get an access token:

```graphql
mutation SignIn($input: SignInput!) {
  signin(signInInput: $input) {
    accessToken
    user {
      id
      email
    }
  }
}
```

Use the same variables format as the `signup` mutation. You can also call `validateToken` with a Bearer header to check a token:

```graphql
query ValidateToken {
  validateToken {
    valid
    user {
      id
      email
    }
  }
}
```

### Schedule Service

All examples in this section require a Bearer header.

Create a customer:

```graphql
mutation CreateCustomer($input: CreateCustomerInput!) {
  createCustomer(createCustomerInput: $input) {
    id
    name
  }
}
```

Variables:

```json
{
  "input": {
    "name": "Budi Santoso",
    "email": "budi@example.com"
  }
}
```

List customers:

```graphql
query Customers {
  customers {
    id
    name
  }
}
```

Create a doctor:

```graphql
mutation CreateDoctor($input: CreateDoctorInput!) {
  createDoctor(createDoctorInput: $input) {
    id
    name
  }
}
```

Variables:

```json
{
  "input": {
    "name": "Dr. Siti Aminah"
  }
}
```

Create an appointment. Replace `customerId` and `doctorId` with IDs returned by the previous operations:

```graphql
mutation CreateSchedule($input: CreateScheduleInput!) {
  createSchedule(createScheduleInput: $input) {
    id
    objective
    scheduledAt
    customer {
      id
      name
    }
    doctor {
      id
      name
    }
  }
}
```

Variables:

```json
{
  "input": {
    "customerId": "<CUSTOMER_ID>",
    "doctorId": "<DOCTOR_ID>",
    "objective": "General consultation",
    "scheduledAt": "2026-11-10T09:00:00.000Z"
  }
}
```

List appointments:

```graphql
query Schedules {
  schedules {
    id
    objective
    scheduledAt
    customer { id name }
    doctor { id name }
  }
}
```

## GraphQL Playground files

The [`graphql-playground`](graphql-playground) directory contains all currently exposed GraphQL operations, split by service endpoint:

- [`auth.graphql`](graphql-playground/auth.graphql) for Auth Service (`http://localhost:3001/graphql`)
- [`schedule.graphql`](graphql-playground/schedule.graphql) for Schedule Service (`http://localhost:3002/graphql`)

With the GraphQL Playground desktop app, open a `.graphql` file directly (or double-click it in your file manager). Select an operation from the operation selector, then enter that operation's JSON in **QUERY VARIABLES**. In the browser-based Playground, paste the contents of the relevant file into the editor.

For Schedule Service operations, set **HTTP HEADERS** to `{"Authorization":"Bearer <ACCESS_TOKEN>"}`. First run `SignUp` or `SignIn` in `auth.graphql`, copy the returned access token, then use it in the Schedule Service header. Create a customer and doctor before creating a schedule; remove the schedule before removing its customer or doctor.

The `CreateUserDirectly` operation is included to reflect the Auth schema, but its resolver stores the password as provided. Use `SignUp` for accounts that need to sign in.

## Run without Docker

Set up PostgreSQL and configure `DATABASE_URL` in `.env` to point to that database. Then run:

```bash
pnpm install
pnpm prisma:generate
pnpm prisma:migrate:deploy
```

Start each service in a separate terminal from the project root:

```bash
pnpm exec nest start auth --watch
```

```bash
AUTH_SERVICE_URL=http://localhost:3001/graphql pnpm exec nest start schedule --watch
```

In PowerShell, start the Schedule Service with:

```powershell
$env:AUTH_SERVICE_URL = 'http://localhost:3001/graphql'
pnpm exec nest start schedule --watch
```
