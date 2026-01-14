# Bulk Email Sending System

A scalable, microservices-based bulk email sending application built with Node.js, TypeScript, and modern architectural patterns. This system enables users to create email campaigns, manage recipients, configure SMTP senders, and send bulk emails efficiently using a distributed queue system.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Local Setup Guide](#local-setup-guide)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Development](#development)

---

## Overview

This is a production-ready bulk email sending system designed with microservices architecture. The system allows users to:

- **User Management**: Register, authenticate, and manage user accounts
- **Sender Configuration**: Configure and manage SMTP sender accounts with encrypted credentials
- **Recipient Management**: Upload and manage email recipients via CSV files
- **Campaign Management**: Create, update, and manage email campaigns with HTML/text content
- **Email Processing**: Asynchronously process and send emails using a distributed queue system
- **Campaign Tracking**: Monitor campaign status, metrics, and email delivery logs

---

## Architecture

### High-Level Architecture

The system follows a **microservices architecture** with clear separation of concerns:

```
┌─────────────────┐
│   API Gateway   │  (Port: 5000)
│  (Entry Point)  │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┬──────────┐
    │         │          │          │          │
┌───▼───┐ ┌──▼───┐  ┌───▼───┐  ┌───▼───┐  ┌───▼───┐
│ User  │ │Campaign│ │Recipient│ │Sender │ │Worker │
│Service│ │Service │ │ Service │ │Service│ │Service│
│ :5001 │ │ :5002  │ │  :5003  │ │ :5005 │ │ :5004 │
└───┬───┘ └───┬───┘  └───┬───┘  └───┬───┘  └───┬───┘
    │         │          │          │          │
    └─────────┴──────────┴──────────┴──────────┘
              │                    │
         ┌────▼────┐          ┌────▼────┐
         │PostgreSQL│          │  Redis  │
         │  :5433  │          │  :6379  │
         └─────────┘          └─────────┘
```

### Service Responsibilities

#### 1. **API Gateway** (Port: 5000)
- **Role**: Single entry point for all client requests
- **Responsibilities**:
  - Request routing to appropriate microservices
  - Authentication and authorization (JWT-based)
  - Rate limiting
  - Request/response transformation
  - Distributed tracing (trace ID propagation)
- **Key Features**:
  - Validates JWT tokens
  - Extracts user context from tokens
  - Forwards requests to downstream services
  - Aggregates responses

#### 2. **User Service** (Port: 5001)
- **Role**: User account management and authentication
- **Responsibilities**:
  - User registration and authentication
  - Password hashing (bcrypt)
  - JWT token generation
  - User profile management
- **Database**: Own PostgreSQL schema (`user_schema`)
- **Key Features**:
  - Secure password storage
  - JWT-based authentication
  - User CRUD operations

#### 3. **Campaign Service** (Port: 5002)
- **Role**: Email campaign lifecycle management
- **Responsibilities**:
  - Campaign CRUD operations
  - Campaign state machine (DRAFT → READY → QUEUED → SENDING → COMPLETED/FAILED)
  - Email job enqueueing to Redis queue
  - Campaign metrics and status tracking
  - Read model caching (sender and recipient data)
- **Database**: Own PostgreSQL schema (`campaign_schema`)
- **Key Features**:
  - State machine validation
  - Campaign preparation and validation
  - Integration with queue system
  - Event consumption for cache updates

#### 4. **Recipient Service** (Port: 5003)
- **Role**: Email recipient management
- **Responsibilities**:
  - CSV file upload and parsing
  - Recipient CRUD operations
  - Recipient validation
  - Event publishing for cache synchronization
- **Database**: Own PostgreSQL schema (`recipient_schema`)
- **Key Features**:
  - CSV parsing with validation
  - Bulk recipient import
  - Event-driven cache updates

#### 5. **Sender Service** (Port: 5005)
- **Role**: SMTP sender configuration management
- **Responsibilities**:
  - SMTP account configuration
  - Encrypted credential storage
  - Sender validation and activation
  - Event publishing for cache synchronization
- **Database**: Own PostgreSQL schema (`sender_schema`)
- **Key Features**:
  - AES encryption for SMTP passwords
  - Sender activation/deactivation
  - Event-driven cache updates

#### 6. **Worker Service** (Port: 5004)
- **Role**: Background email processing
- **Responsibilities**:
  - Consuming email jobs from Redis queue (BullMQ)
  - Sending emails via SMTP (Nodemailer)
  - Email delivery status tracking
  - Event publishing for status updates
- **Database**: Reads from campaign service database for email logs
- **Key Features**:
  - Asynchronous email processing
  - Retry mechanism (3 attempts with exponential backoff)
  - Email delivery logging
  - Decryption of SMTP credentials

### Architectural Patterns

#### 1. **Microservices Architecture**
- Each service is independently deployable
- Services communicate via HTTP/REST
- Each service has its own database schema
- Services are loosely coupled

#### 2. **API Gateway Pattern**
- Single entry point for clients
- Centralized authentication and authorization
- Request routing and aggregation
- Cross-cutting concerns (logging, tracing, rate limiting)

#### 3. **Event-Driven Architecture**
- Services communicate via Redis pub/sub for cache synchronization
- Event consumers update read models
- Decoupled service communication

#### 4. **CQRS (Command Query Responsibility Segregation)**
- Read models (cached data) for performance
- Write models (source of truth) in respective services
- Cache synchronization via events

#### 5. **Queue-Based Processing**
- BullMQ for reliable job processing
- Redis as queue backend
- Retry mechanism for failed jobs
- Job prioritization and scheduling

#### 6. **Distributed Tracing**
- Trace ID propagation across services
- Request correlation
- Logging with trace context

### Data Flow

#### Campaign Creation Flow:
```
1. Client → API Gateway → Campaign Service
2. Campaign Service creates campaign (DRAFT status)
3. Client uploads recipients → API Gateway → Recipient Service
4. Recipient Service publishes event → Campaign Service updates cache
5. Client prepares campaign → Campaign Service validates → Status: READY
6. Client starts campaign → Campaign Service enqueues jobs → Status: QUEUED
7. Worker Service processes jobs → Sends emails → Updates status
```

#### Email Sending Flow:
```
1. Campaign Service enqueues email job to Redis queue
2. Worker Service picks up job from queue
3. Worker Service decrypts SMTP credentials
4. Worker Service sends email via Nodemailer
5. Worker Service logs email status
6. Worker Service publishes event → Campaign Service updates metrics
```

### Database Architecture

Each service maintains its own database schema:

- **user_schema**: User accounts and authentication data
- **campaign_schema**: Campaigns, email logs, read models (sender cache, recipient cache)
- **recipient_schema**: Recipient data
- **sender_schema**: SMTP sender configurations

**Read Models** (in campaign_schema):
- `campaign_sender_cache`: Cached sender data for fast access
- `campaign_recipient`: Cached recipient data for fast access

### Security Features

- **Password Hashing**: bcrypt with configurable salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Credential Encryption**: AES encryption for SMTP passwords
- **Rate Limiting**: API Gateway rate limiting
- **Input Validation**: DTO validation at service boundaries

---

## Technology Stack

### Core Technologies
- **Runtime**: Node.js (>=18)
- **Language**: TypeScript 5.9.3
- **Framework**: Express.js 5.2.1
- **Package Manager**: pnpm 9.0.0

### Databases & Caching
- **PostgreSQL**: 15 (via Docker)
- **Redis**: 7 (via Docker)
- **ORM**: TypeORM 0.3.28

### Queue & Messaging
- **BullMQ**: 5.66.4 (Job queue)
- **ioredis**: 5.8.2 (Redis client)

### Authentication & Security
- **jsonwebtoken**: 9.0.3 (JWT)
- **bcrypt**: 6.0.0 (Password hashing)
- **crypto**: Built-in (AES encryption)

### Email
- **nodemailer**: 6.9.8 (SMTP email sending)

### Development Tools
- **Turborepo**: 2.7.2 (Monorepo build system)
- **ts-node-dev**: 2.0.0 (Development server)
- **Prettier**: 3.7.4 (Code formatting)

### Shared Packages
- `@packages/config`: Centralized configuration management
- `@packages/errors`: Error handling and custom exceptions
- `@packages/logger`: Structured logging (Pino)
- `@packages/queue`: Queue abstraction (BullMQ)
- `@packages/tracing`: Distributed tracing utilities

---

## Prerequisites

Before setting up the project, ensure you have the following installed:

### Required Software

1. **Node.js** (>=18)
   ```bash
   node --version  # Should be >= 18.0.0
   ```

2. **pnpm** (9.0.0)
   ```bash
   npm install -g pnpm@9.0.0
   pnpm --version  # Should be 9.0.0
   ```

3. **Docker** and **Docker Compose**
   ```bash
   docker --version
   docker-compose --version
   ```

4. **Git**
   ```bash
   git --version
   ```

### Optional (Recommended)
- **PostgreSQL Client** (for direct database access)
- **Redis CLI** (for queue inspection)
- **VS Code** or your preferred IDE

---

## Local Setup Guide

Follow these steps to set up and run the project locally:

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd bulk-email-sending-app-ms
```

### Step 2: Install Dependencies

Install all dependencies for the monorepo:

```bash
pnpm install
```

This will install dependencies for all apps and packages in the workspace.

### Step 3: Start Infrastructure Services

Start PostgreSQL and Redis using Docker Compose:

```bash
docker-compose up -d
```

This will start:
- **PostgreSQL** on port `5433` (host) / `5432` (container)
  - Username: `admin`
  - Password: `Hem@2810`
  - Database: `email_system`
- **Redis** on port `6379`

Verify services are running:

```bash
docker ps
```

You should see `email-system-postgres` and `email-system-redis` containers running.

### Step 4: Configure Environment Variables

Create environment files for each service. The system uses environment-specific files (`.env.development`, `.env.production`) and falls back to `.env`.

#### API Gateway (`.env.development` in `apps/api-gateway/`)

```env
NODE_ENV=development
SERVICE_NAME=api-gateway
PORT=5000
SERVICE_PORT=5000

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
SALT_ROUNDS=10

# Service URLs
USER_SERVICE_URL=http://localhost:5001
CAMPAIGN_SERVICE_URL=http://localhost:5002
RECIPIENT_SERVICE_URL=http://localhost:5003
SENDER_SERVICE_URL=http://localhost:5005
WORKER_SERVICE_URL=http://localhost:5004
```

#### User Service (`.env.development` in `apps/user-service/`)

```env
NODE_ENV=development
SERVICE_NAME=user-service
PORT=5001
SERVICE_PORT=5001

# Database Configuration
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5433
DB_NAME=email_system
DB_USER=admin
DB_PASSWORD=Hem@2810
DB_LOGGING=true
DB_SYNC=false

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
SALT_ROUNDS=10
```

#### Campaign Service (`.env.development` in `apps/campaign-service/`)

```env
NODE_ENV=development
SERVICE_NAME=campaign-service
PORT=5002
SERVICE_PORT=5002

# Database Configuration
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5433
DB_NAME=email_system
DB_USER=admin
DB_PASSWORD=Hem@2810
DB_LOGGING=true
DB_SYNC=false

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
```

#### Recipient Service (`.env.development` in `apps/recipient-service/`)

```env
NODE_ENV=development
SERVICE_NAME=recipient-service
PORT=5003
SERVICE_PORT=5003

# Database Configuration
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5433
DB_NAME=email_system
DB_USER=admin
DB_PASSWORD=Hem@2810
DB_LOGGING=true
DB_SYNC=false

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
```

#### Sender Service (`.env.development` in `apps/sender-service/`)

```env
NODE_ENV=development
SERVICE_NAME=sender-service
PORT=5005
SERVICE_PORT=5005

# Database Configuration
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5433
DB_NAME=email_system
DB_USER=admin
DB_PASSWORD=Hem@2810
DB_LOGGING=true
DB_SYNC=false

# Encryption Key (32-byte key for AES-256)
ENCRYPTION_KEY=your-32-byte-encryption-key-here-change-in-production

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
```

#### Worker Service (`.env.development` in `apps/worker-service/`)

```env
NODE_ENV=development
SERVICE_NAME=worker-service
PORT=5004
SERVICE_PORT=5004

# Database Configuration (Read-only access to campaign schema)
DB_TYPE=postgres
DB_HOST=localhost
DB_PORT=5433
DB_NAME=email_system
DB_USER=admin
DB_PASSWORD=Hem@2810
DB_LOGGING=true
DB_SYNC=false

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379

# Encryption Key (Must match sender-service key)
ENCRYPTION_KEY=your-32-byte-encryption-key-here-change-in-production
```

**Important Notes:**
- Replace `your-super-secret-jwt-key-change-in-production` with a secure random string
- Replace `your-32-byte-encryption-key-here-change-in-production` with a 32-byte (256-bit) key for AES encryption
- The encryption key must be the same in both `sender-service` and `worker-service`
- In production, use strong, randomly generated secrets

### Step 5: Run Database Migrations

Each service has its own migrations. Run them in order:

```bash
# User Service migrations
cd apps/user-service
pnpm migration:run
cd ../..

# Campaign Service migrations
cd apps/campaign-service
pnpm migration:run
cd ../..

# Recipient Service migrations
cd apps/recipient-service
pnpm migration:run
cd ../..

# Sender Service migrations
cd apps/sender-service
pnpm migration:run
cd ../..
```

### Step 6: Start All Services

From the root directory, start all services in development mode:

```bash
pnpm dev
```

This will start all services concurrently using Turborepo.

Alternatively, start services individually in separate terminals:

```bash
# Terminal 1: API Gateway
cd apps/api-gateway
pnpm dev

# Terminal 2: User Service
cd apps/user-service
pnpm dev

# Terminal 3: Campaign Service
cd apps/campaign-service
pnpm dev

# Terminal 4: Recipient Service
cd apps/recipient-service
pnpm dev

# Terminal 5: Sender Service
cd apps/sender-service
pnpm dev

# Terminal 6: Worker Service
cd apps/worker-service
pnpm dev
```

### Step 7: Verify Services are Running

Check that all services are running:

- **API Gateway**: http://localhost:5000
- **User Service**: http://localhost:5001
- **Campaign Service**: http://localhost:5002
- **Recipient Service**: http://localhost:5003
- **Worker Service**: http://localhost:5004 (no HTTP endpoint, runs as background worker)
- **Sender Service**: http://localhost:5005

You can test the API Gateway health endpoint:

```bash
curl http://localhost:5000/health
```

---

## Project Structure

```
bulk-email-sending-app-ms/
├── apps/                          # Microservices
│   ├── api-gateway/               # API Gateway service
│   │   ├── src/
│   │   │   ├── controllers/       # Request handlers
│   │   │   ├── middlewares/       # Auth, rate limiting, tracing
│   │   │   ├── routes/            # Route definitions
│   │   │   ├── services/          # Service clients (HTTP calls)
│   │   │   ├── app.ts             # Express app setup
│   │   │   └── main.ts            # Entry point
│   │   └── package.json
│   ├── user-service/              # User management service
│   │   ├── migrations/            # Database migrations
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── repositories/      # Data access layer
│   │   │   ├── services/          # Business logic
│   │   │   ├── shared/
│   │   │   │   ├── entities/      # TypeORM entities
│   │   │   │   └── dto/           # Data transfer objects
│   │   │   └── config/            # Database configuration
│   │   └── package.json
│   ├── campaign-service/          # Campaign management service
│   ├── recipient-service/        # Recipient management service
│   ├── sender-service/           # SMTP sender configuration service
│   └── worker-service/           # Background email processing worker
├── packages/                      # Shared packages
│   ├── config/                    # Configuration management
│   ├── errors/                    # Error handling utilities
│   ├── logger/                    # Logging utilities (Pino)
│   ├── queue/                     # Queue abstraction (BullMQ)
│   └── tracing/                   # Distributed tracing
├── docker-compose.yml             # Infrastructure services
├── package.json                   # Root package.json
├── pnpm-workspace.yaml           # pnpm workspace configuration
├── turbo.json                     # Turborepo configuration
└── tsconfig.base.json             # Base TypeScript configuration
```

---

## Environment Variables

### Common Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment (development/production) | Yes | `development` |
| `SERVICE_NAME` | Service identifier | Yes | - |
| `PORT` / `SERVICE_PORT` | Service port | Yes | - |

### Database Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DB_TYPE` | Database type | Yes | `postgres` |
| `DB_HOST` | Database host | Yes | `localhost` |
| `DB_PORT` | Database port | Yes | `5433` |
| `DB_NAME` | Database name | Yes | `email_system` |
| `DB_USER` | Database user | Yes | `admin` |
| `DB_PASSWORD` | Database password | Yes | - |
| `DB_LOGGING` | Enable query logging | No | `false` |
| `DB_SYNC` | Auto-sync schema (dev only) | No | `false` |

### Redis Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `REDIS_HOST` | Redis host | Yes | `localhost` |
| `REDIS_PORT` | Redis port | Yes | `6379` |

### Security Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `JWT_SECRET` | JWT signing secret | Yes | - |
| `SALT_ROUNDS` | bcrypt salt rounds | Yes | `10` |
| `ENCRYPTION_KEY` | AES encryption key (32 bytes) | Yes* | - |

*Required only for sender-service and worker-service

### Service URL Variables (API Gateway)

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `USER_SERVICE_URL` | User service URL | No | `http://localhost:5001` |
| `CAMPAIGN_SERVICE_URL` | Campaign service URL | No | `http://localhost:5002` |
| `RECIPIENT_SERVICE_URL` | Recipient service URL | No | `http://localhost:5003` |
| `SENDER_SERVICE_URL` | Sender service URL | No | `http://localhost:5005` |
| `WORKER_SERVICE_URL` | Worker service URL | No | `http://localhost:5004` |

---

## Running the Application

### Development Mode

Start all services in development mode with hot reload:

```bash
pnpm dev
```

### Production Mode

1. Build all services:
   ```bash
   pnpm build
   ```

2. Start all services:
   ```bash
   pnpm start:prod
   ```

### Individual Service Commands

Each service supports the following commands:

```bash
# Development mode (with hot reload)
pnpm dev

# Build for production
pnpm build

# Start in development mode
pnpm start:dev

# Start in production mode
pnpm start:prod
```

### Database Migrations

Each service has migration commands:

```bash
# Generate migration
pnpm migration:generate src/migrations/MigrationName

# Create empty migration
pnpm migration:create src/migrations/MigrationName

# Run migrations
pnpm migration:run

# Revert last migration
pnpm migration:revert

# Show migration status
pnpm migration:show
```

---

## API Documentation

### Base URL

All API requests should be made to the API Gateway:

```
http://localhost:5000
```

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Available Endpoints

#### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token

#### User Management
- `GET /user/profile` - Get current user profile
- `PUT /user/profile` - Update user profile

#### Campaign Management
- `POST /campaign` - Create a new campaign
- `GET /campaign/:id` - Get campaign by ID
- `GET /campaign` - List campaigns (paginated)
- `PUT /campaign/:id` - Update campaign (DRAFT only)
- `DELETE /campaign/:id` - Delete campaign (DRAFT only)
- `POST /campaign/:id/prepare` - Prepare campaign (DRAFT → READY)
- `POST /campaign/:id/start` - Start campaign (READY → QUEUED)
- `GET /campaign/:id/status` - Get campaign status
- `GET /campaign/:id/metrics` - Get campaign metrics

#### Recipient Management
- `POST /recipient` - Create recipient
- `POST /recipient/upload` - Upload recipients via CSV
- `GET /recipient` - List recipients (paginated)
- `GET /recipient/:id` - Get recipient by ID
- `PUT /recipient/:id` - Update recipient
- `DELETE /recipient/:id` - Delete recipient

#### Sender Management
- `POST /sender` - Create SMTP sender configuration
- `GET /sender` - List senders
- `GET /sender/:id` - Get sender by ID
- `PUT /sender/:id` - Update sender
- `DELETE /sender/:id` - Delete sender
- `POST /sender/:id/activate` - Activate sender
- `POST /sender/:id/deactivate` - Deactivate sender

---

## Development

### Code Structure

- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic layer
- **Repositories**: Data access layer (TypeORM)
- **DTOs**: Data transfer objects for validation
- **Entities**: Database entities (TypeORM)
- **Middlewares**: Cross-cutting concerns (auth, tracing, rate limiting)

### Adding a New Service

1. Create service directory in `apps/`
2. Copy structure from existing service
3. Update `packages/config/src/index.ts` with service URL
4. Add service route in API Gateway
5. Update `docker-compose.yml` if needed

### Shared Packages

Shared packages are located in `packages/` and can be imported using:

```typescript
import { loadConfig } from '@packages/config';
import { logInfo } from '@packages/logger';
import { BadRequestException } from '@packages/errors';
```

### Logging

All services use structured logging via `@packages/logger`:

```typescript
import { logInfo, logError, logWarn } from '@packages/logger';

logInfo('Operation completed', { userId, campaignId });
logError('Operation failed', { error, userId });
```

### Error Handling

Use custom exceptions from `@packages/errors`:

```typescript
import { BadRequestException, NotFoundException } from '@packages/errors';

throw new BadRequestException('Invalid input');
throw new NotFoundException('Resource not found');
```

### Testing

Run linting:

```bash
pnpm lint
```

Format code:

```bash
pnpm format
```

Type checking:

```bash
pnpm check-types
```

---

## Troubleshooting

### Services Not Starting

1. **Check Docker services**: Ensure PostgreSQL and Redis are running
   ```bash
   docker ps
   ```

2. **Check ports**: Ensure ports are not already in use
   ```bash
   # Windows
   netstat -ano | findstr :5000
   
   # Linux/Mac
   lsof -i :5000
   ```

3. **Check environment variables**: Ensure all required variables are set

### Database Connection Issues

1. **Verify PostgreSQL is running**:
   ```bash
   docker ps | grep postgres
   ```

2. **Check connection string**: Verify DB_HOST, DB_PORT, DB_USER, DB_PASSWORD

3. **Test connection**:
   ```bash
   psql -h localhost -p 5433 -U admin -d email_system
   ```

### Redis Connection Issues

1. **Verify Redis is running**:
   ```bash
   docker ps | grep redis
   ```

2. **Test connection**:
   ```bash
   redis-cli -h localhost -p 6379 ping
   ```

### Migration Issues

1. **Check migration status**:
   ```bash
   pnpm migration:show
   ```

2. **Revert and re-run**:
   ```bash
   pnpm migration:revert
   pnpm migration:run
   ```

---

## Postman Collection

API documentation and Postman collection will be available at:

**[Postman Collection Link - To be added]**

The Postman collection includes:
- All API endpoints
- Request/response examples
- Authentication setup
- Environment variables
- Test scripts

---

## License

[Add your license information here]

---

## Contributing

[Add contributing guidelines here]

---

## Support

For issues and questions, please [create an issue](link-to-issues) or contact the development team.
