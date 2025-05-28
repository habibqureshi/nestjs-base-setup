# NestJS Base Setup

A comprehensive base project for NestJS with essential features and best practices.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Application](#running-the-application)
- [Database Setup](#database-setup)
- [Database Migrations](#database-migrations)
  - [Generate Migration](#generate-migration)
  - [Create Empty Migration](#create-empty-migration)
  - [Run Migrations](#run-migrations)
  - [Revert Migration](#revert-migration)
  - [Migration Files](#migration-files)
  - [Migration Best Practices](#migration-best-practices)
  - [Migration Workflow](#migration-workflow)
  - [Troubleshooting Migrations](#troubleshooting-migrations)
- [API Documentation](#api-documentation)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Testing](#testing)
- [Code Examples](#code-examples)
  - [Zod Schema Definition](#zod-schema-definition)
  - [ts-rest Contract Definition](#ts-rest-contract-definition)
  - [Controller Implementation](#controller-implementation)
- [Contributing](#contributing)
- [Authors](#authors)

## Features

- 🔐 Authentication with JWT
- 🛡️ Role-based Authorization
- 📝 Custom Logger
- 🚀 Rate Limiting
- 🔄 Redis Caching
- 📊 Database Integration (PostgreSQL/MySQL/MongoDB)
- 🐳 Docker Support
- 📚 API Documentation with Swagger
- ✅ TypeScript Support
- 🧪 Testing Setup with Jest
- 🔍 ESLint & Prettier Configuration
- 🎯 Git Hooks (pre-commit, post-commit)

## Prerequisites

- Node.js (v23.5.0 or higher)
- NestJS (v10.4.5 or higher)
- Yarn (v1.22.19 or higher)
- Docker
- PostgreSQL/MySQL/MongoDB (depending on your choice)
- Redis

## Installation

1. Clone the repository:

```bash
git clone https://github.com/habibqureshi/nestjs-base-setup.git
cd nestjs-base-setup
```

2. Install dependencies:

```bash
yarn install
```

## Environment Setup

1. Create a `.env` file in the root directory:

```bash
cp env.example .env
```

2. Update the environment variables in `.env` according to your setup.

## Database Setup

1. Start the database server:

```bash
yarn docker:dev
```

2. Run migrations:

```bash
yarn migration:run
```

## Database Migrations

The project uses TypeORM for database migrations. Here are the available migration commands:

### Generate Migration

Generate a new migration based on entity changes:

```bash
MIGRATION=add-user-table yarn migration:generate
```

### Create Empty Migration

Create an empty migration file:

```bash
MIGRATION=add-user-table yarn migration:create
```

### Run Migrations

Apply all pending migrations:

```bash
yarn migration:run
```

### Revert Migration

Revert the last applied migration:

```bash
yarn migration:revert
```

### Migration Files

- Migrations are stored in `src/db/migrations/`
- Each migration file follows the naming pattern: `TIMESTAMP-MIGRATION_NAME.ts`
- Migrations are executed in chronological order

### Migration Best Practices

1. Always generate migrations from entity changes
2. Review generated migrations before applying
3. Test migrations in development before production
4. Keep migrations small and focused
5. Include both up and down methods
6. Add proper indexes and constraints
7. Handle data migrations carefully

### Migration Workflow

1. Make changes to your entities
2. Generate migration with name:
   ```bash
   MIGRATION=add-user-table yarn migration:generate
   ```
3. Review the generated migration file
4. Run migration:
   ```bash
   yarn migration:run
   ```
5. Verify the changes in the database

### Troubleshooting Migrations

- If a migration fails, check the error message
- Use `yarn migration:revert` to undo the last migration
- For complex issues, you may need to:
  1. Revert the migration
  2. Fix the migration file
  3. Run the migration again

## Running the Application

### Local Mode

1. Start database and redis

```bash
yarn docker:dev
```

2. Start Application (it will also run the migration)

```bash
yarn start:local
```

### Production Mode

1. Build distribution

```bash
yarn build
```

2. Run application

```bash
yarn start:prod
```

## API Documentation

Once the application is running, you can access the Swagger documentation at:

```
http://localhost:3000/docs
```

## Architecture

### Overview

The application follows a modular, layered architecture pattern with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                      Client Layer                       │
└───────────────────────────┬─────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────┐
│                     AuthGuards Layer                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ JWT         │  │ Authz       │  │ Other Guards    │  │
│  │ Guard       │  │ Guard       │  │ (Local,         │  │
│  │             │  │             │  │  Refresh, etc)  │  │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘  │
└─────────┼────────────────┼──────────────────┼───────────┘
          │                │                  │
┌─────────▼────────────────▼──────────────────▼───────────┐
│                     Controller Layer                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Auth        │  │ Users       │  │ Other Modules   │  │
│  │ Controller  │  │ Controller  │  │ Controllers     │  │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘  │
└─────────┼────────────────┼──────────────────┼───────────┘
          │                │                  │
┌─────────▼────────────────▼──────────────────▼───────────┐
│                     Service Layer                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Auth        │  │ Users       │  │ Other Modules   │  │
│  │ Service     │  │ Service     │  │ Services        │  │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘  │
└─────────┼────────────────┼──────────────────┼───────────┘
          │                │                  │
┌─────────▼────────────────▼──────────────────▼───────────┐
│                    Repository Layer                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ Auth        │  │ Users       │  │ Other Modules   │  │
│  │ Repository  │  │ Repository  │  │ Repositories    │  │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘  │
└─────────┼────────────────┼──────────────────┼───────────┘
          │                │                  │
┌─────────▼────────────────▼──────────────────▼───────────┐
│                    Database Layer                       │
└─────────────────────────────────────────────────────────┘
```

### Key Components

#### 1. Core Modules

- **Auth Module**: Handles authentication and authorization

  - JWT-based authentication
  - Role-based access control
  - Refresh token mechanism
  - Redis-based token storage

- **Users Module**: Manages user-related operations

  - User CRUD operations
  - Profile management
  - Role assignments

- **Roles & Permissions**: Implements RBAC
  - Role management
  - Permission management
  - Role-permission mapping

#### 2. Infrastructure Layer

- **Database Integration**

  - TypeORM for database operations
  - Support for multiple databases (PostgreSQL, MySQL, MongoDB)
  - Migration management
  - Entity relationships

- **Caching Layer**
  - Redis integration
  - Cache management
  - Token storage
  - Session management

#### 3. Security Features

- **Authentication**

  - JWT-based authentication
  - Refresh token mechanism
  - Token blacklisting
  - Session management

- **Authorization**

  - Role-based access control
  - Permission-based authorization
  - Custom guards and decorators
  - Application Guards:
    - `JwtAuthGuard`: Validates JWT tokens and handles public routes
    - `AuthorizationGuard`: Enforces permission-based access control
    - `LocalAuthGuard`: Handles local authentication strategy
    - `JwtRefreshTokenGuard`: Manages refresh token validation
    - `ClientAuthzGuard`: Validates client credentials using Basic Auth
    - `ThrottlerGuard`: Implements rate limiting

- **Security Middleware**
  - Rate limiting
  - Request validation
  - CORS configuration
  - Helmet security headers

#### 4. Cross-Cutting Concerns

- **Logging**

  - Custom logger implementation
  - Request/Response logging
  - Error tracking
  - Performance monitoring

- **Error Handling**

  - Global exception filters
  - Custom error responses
  - Validation error handling
  - Error logging

- **Validation**
  - Request validation using Zod
  - Custom validation pipes
  - Schema validation
  - Type safety

#### 5. API Layer

- **REST API**

  - RESTful endpoints
  - Resource-based routing
  - HTTP method handling
  - Response formatting

- **Documentation**
  - Swagger/OpenAPI integration
  - API documentation
  - Schema documentation
  - Example requests/responses

### Data Flow

1. **Request Handling**

   - Client sends request
   - Request passes through middleware
   - Validation and authentication checks
   - Route handling

2. **Business Logic**

   - Controller receives request
   - Service layer processes business logic
   - Repository layer handles data operations
   - Database operations executed

3. **Response Generation**
   - Data transformation
   - Response formatting
   - Error handling
   - Client response

### Scalability & Performance

- **Horizontal Scaling**

  - Stateless architecture
  - Load balancing support
  - Session management
  - Cache distribution

- **Performance Optimization**
  - Caching strategies
  - Database indexing
  - Query optimization
  - Connection pooling

### Development Workflow

- **Code Organization**

  - Modular architecture
  - Feature-based structure
  - Clear separation of concerns
  - Reusable components

- **Testing Strategy**
  - Unit testing
  - Integration testing
  - E2E testing
  - Test coverage requirements

## Project Structure

```
src/
├── common/           # Common utilities and helpers
├── config/           # Configuration files
├── contracts/        # API contracts
├── db/              # Database migrations and seeds
├── interfaces/      # TypeScript interfaces
├── modules/         # Feature modules
│   ├── auth/        # Authentication module
│   ├── users/       # Users module
│   ├── roles/       # Roles module
│   └── permissions/ # Permissions module
└── main.ts          # Application entry point
```

## Environment Variables

### Database Configuration

- `DB_TYPE`: Database type (postgres, mysql, mongodb)
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password
- `DB_NAME`: Database name
- `DB_URL`: MongoDB URL (if using MongoDB)
- `DB_SYNCHRONIZE`: Auto-synchronize database schema

### JWT Configuration

- `JWT_SECRET`: JWT secret key
- `JWT_TOKEN_EXPIRY`: JWT token expiry time
- `JWT_REFRESH_SECRET`: JWT refresh token secret
- `JWT_REFRESH_EXPIRY`: JWT refresh token expiry time

### Rate Limiting

- `RATE_LIMIT_TTL`: Rate limit time window in seconds
- `RATE_LIMIT_LIMIT`: Maximum number of requests per time window

### Redis Configuration

- `REDIS_USERNAME`: Redis username (optional)
- `REDIS_PASSWORD`: Redis password (optional)
- `REDIS_HOST`: Redis host
- `REDIS_PORT`: Redis port
- `REDIS_USER_TTL`: Redis user cache TTL in milliseconds

### Environment

- `ENV`: Application environment (development, production, test)

## Testing

Run the test suite:

```bash
# Unit tests
yarn test

# e2e tests
yarn test:e2e

# Test coverage
yarn test:cov
```

## Code Examples

### Zod Schema Definition

```typescript
// src/contracts/users/schema.ts
import { z } from 'zod';

// Base user schema
export const UserZod = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(50),
  email: z.string().email(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Create user schema
export const CreateUser = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8),
});

// Pagination schemas
export const PaginationOptions = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
});

export const PaginatedResponseSchema = z.object({
  data: z.array(UserZod),
  meta: z.object({
    total: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
  }),
});

// Error schemas
export const BadRequestError = z.object({
  message: z.string(),
  errors: z.array(
    z.object({
      field: z.string(),
      message: z.string(),
    }),
  ),
});

// Type inference
export type User = z.infer<typeof UserZod>;
export type CreateUserInput = z.infer<typeof CreateUser>;
export type PaginatedResponse = z.infer<typeof PaginatedResponseSchema>;
```

### ts-rest Contract Definition

```typescript
// src/contracts/users/index.ts
import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  CreateUser,
  UserZod,
  PaginationOptions,
  PaginatedResponseSchema,
  BadRequestError,
} from './schema';

const c = initContract();

export const userContract = c.router(
  {
    getUser: {
      path: '',
      summary: 'Get users',
      method: 'GET',
      query: PaginationOptions,
      responses: {
        200: PaginatedResponseSchema,
      },
    },
    createUser: {
      path: '',
      summary: 'Create User',
      method: 'POST',
      body: CreateUser,
      responses: {
        200: UserZod,
        400: BadRequestError,
      },
    },
  },
  { pathPrefix: '/user' },
);
```

### Controller Implementation

```typescript
// src/modules/users/users.controller.ts
import { Controller } from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { userContract } from '../../contracts/users';
import { UsersService } from './users.service';
import { ServerInferRequest } from '@ts-rest/core';
import { CreateUserInput, User } from '../../contracts/users/schema';

type GetUser = ServerInferRequest<typeof userContract.getUser>;
type CreateUser = ServerInferRequest<typeof userContract.createUser>;

@Controller()
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @TsRestHandler(userContract.getUser)
  async getUser() {
    return tsRestHandler(userContract.getUser, async ({ query }: GetUser) => {
      const data = await this.userService.findManyWithPagination(
        {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        { limit: query.limit, page: query.page },
      );
      return {
        status: 200,
        body: data,
      };
    });
  }

  @TsRestHandler(userContract.createUser)
  async create() {
    return tsRestHandler(
      userContract.createUser,
      async ({ body }: CreateUser) => {
        const user = await this.userService.create(body);
        return {
          status: 200,
          body: user,
        };
      },
    );
  }
}
```

These examples demonstrate:

1. **Zod Schema Definition**

   - Pure Zod validation without class-validator
   - Type inference using z.infer
   - Clean schema organization
   - Pagination handling
   - Error response schemas

2. **ts-rest Contract**

   - Path prefix configuration
   - Query parameter handling
   - Response type definitions
   - Error response types

3. **Controller Implementation**
   - Type-safe request handling with ServerInferRequest
   - Proper service integration
   - Pagination support
   - Clean code organization

Key features:

- Type-safe request/response handling using Zod
- No class-validator dependencies
- Pagination support
- Error handling
- Clean code organization

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Authors

- [@habibqureshi](https://github.com/habibqureshi)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
