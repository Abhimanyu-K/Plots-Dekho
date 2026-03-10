# WEEK 1: PROJECT SETUP & INFRASTRUCTURE
## Detailed Implementation Guide

---

## 📋 OVERVIEW

**Goal**: Set up complete development environment, project structure, and foundational infrastructure.

**Deliverables**:
- Monorepo structure with frontend and backend
- Docker development environment
- Database connection working
- Base API with health check
- Basic frontend with routing
- CI/CD pipeline

---

## 🏗️ ARCHITECTURE SETUP

```
plots-dekho/
├── .github/
│   └── workflows/
│       ├── backend-ci.yml
│       ├── frontend-ci.yml
│       └── deploy-staging.yml
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── properties/
│   │   │   └── common/
│   │   ├── config/
│   │   ├── guards/
│   │   ├── decorators/
│   │   ├── interceptors/
│   │   ├── filters/
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   ├── test/
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   ├── (dashboard)/
│   │   │   ├── properties/
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── ui/           # shadcn components
│   │   │   ├── layout/
│   │   │   ├── common/
│   │   │   └── features/
│   │   ├── lib/
│   │   │   ├── api/
│   │   │   ├── utils/
│   │   │   └── store/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── styles/
│   ├── public/
│   ├── .env.local.example
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.ts
│   └── next.config.js
├── shared/
│   └── types/
│       └── index.ts
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## DAY 1: REPOSITORY & ENVIRONMENT SETUP

### Morning (4 hours)

#### Task 1.1: Initialize Git Repository (30 mins)

```bash
# Create project directory
mkdir plots-dekho
cd plots-dekho

# Initialize git
git init
git branch -M main

# Create .gitignore
cat > .gitignore << EOF
# Dependencies
node_modules/
.pnp
.pnp.js

# Environment variables
.env
.env.local
.env.*.local

# Build outputs
dist/
build/
.next/
out/

# Logs
logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# IDE
.vscode/
.idea/
*.swp
*.swo

# Testing
coverage/

# Misc
.cache/
*.tsbuildinfo
EOF

# Create README
cat > README.md << EOF
# Plots Dekho - Real Estate Platform

## Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- pnpm (recommended) or npm

### Installation
\`\`\`bash
# Install dependencies
pnpm install

# Start development environment
docker-compose up -d

# Run migrations
cd backend && pnpm prisma migrate dev

# Start backend
cd backend && pnpm start:dev

# Start frontend (new terminal)
cd frontend && pnpm dev
\`\`\`
EOF

# Initial commit
git add .
git commit -m "Initial commit: Project structure"
```

#### Task 1.2: Create Docker Compose (1 hour)

**File**: `docker-compose.yml`

```yaml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: plots-dekho-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: plotsdekho
      POSTGRES_PASSWORD: dev_password_123
      POSTGRES_DB: plotsdekho_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backend/prisma/init.sql:/docker-entrypoint-initdb.d/init.sql
    networks:
      - plots-dekho-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U plotsdekho"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: plots-dekho-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - plots-dekho-network
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Meilisearch (for later, but setup now)
  meilisearch:
    image: getmeili/meilisearch:v1.5
    container_name: plots-dekho-meilisearch
    restart: unless-stopped
    environment:
      MEILI_ENV: development
      MEILI_MASTER_KEY: dev_master_key_change_in_production
    ports:
      - "7700:7700"
    volumes:
      - meilisearch_data:/meili_data
    networks:
      - plots-dekho-network

  # pgAdmin (Optional - for database management)
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: plots-dekho-pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@plotsdekho.local
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "5050:80"
    networks:
      - plots-dekho-network
    depends_on:
      - postgres

volumes:
  postgres_data:
  redis_data:
  meilisearch_data:

networks:
  plots-dekho-network:
    driver: bridge
```

**Start Services**:
```bash
docker-compose up -d
docker-compose ps  # Verify all services are running
```

#### Task 1.3: Setup Code Quality Tools (30 mins)

**File**: `.prettierrc`
```json
{
  "semi": true,
  "trailingComma": "all",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always"
}
```

**File**: `.eslintrc.js` (will be in both frontend/backend)
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
```

**File**: `.husky/pre-commit` (setup later with husky)

### Afternoon (4 hours)

#### Task 1.4: Initialize Backend (NestJS) (2 hours)

```bash
# Install NestJS CLI globally
npm install -g @nestjs/cli

# Create backend directory
nest new backend --package-manager pnpm --skip-git

cd backend

# Install essential dependencies
pnpm add @prisma/client
pnpm add -D prisma

# Install additional packages
pnpm add @nestjs/config @nestjs/swagger class-validator class-transformer
pnpm add @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
pnpm add -D @types/passport-jwt @types/bcrypt

# Install Redis
pnpm add @nestjs/cache-manager cache-manager redis

# Initialize Prisma
npx prisma init
```

**Configure Environment Variables**

**File**: `backend/.env.example`
```env
# App
NODE_ENV=development
PORT=3001
API_PREFIX=api/v1

# Database
DATABASE_URL="postgresql://plotsdekho:dev_password_123@localhost:5432/plotsdekho_dev?schema=public"

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRATION=30d

# Meilisearch
MEILI_HOST=http://localhost:7700
MEILI_MASTER_KEY=dev_master_key_change_in_production

# CORS
CORS_ORIGIN=http://localhost:3000

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# External Services (Add later)
# AWS_ACCESS_KEY_ID=
# AWS_SECRET_ACCESS_KEY=
# AWS_REGION=
# S3_BUCKET=
```

Copy to actual .env:
```bash
cp .env.example .env
```

#### Task 1.5: Setup Prisma Schema (1 hour)

**File**: `backend/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Enums
enum UserRole {
  OWNER
  SEEKER
  AGENT
  ADMIN
}

enum PropertyType {
  APARTMENT
  HOUSE
  VILLA
  PLOT
  COMMERCIAL
}

enum ListingType {
  RENT
  SALE
}

enum FurnishingType {
  UNFURNISHED
  SEMI_FURNISHED
  FULLY_FURNISHED
}

enum PropertyStatus {
  ACTIVE
  INACTIVE
  RENTED
  SOLD
  DELETED
}

// Models
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  phone         String?   @unique
  password      String
  name          String?
  role          UserRole  @default(SEEKER)
  avatarUrl     String?   @map("avatar_url")
  isVerified    Boolean   @default(false) @map("is_verified")
  emailVerified Boolean   @default(false) @map("email_verified")
  phoneVerified Boolean   @default(false) @map("phone_verified")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  // Relations
  properties    Property[]
  favorites     Favorite[]
  savedSearches SavedSearch[]
  leadsAsSender Lead[]        @relation("LeadSeeker")
  leadsAsOwner  Lead[]        @relation("LeadOwner")
  reviews       Review[]

  @@map("users")
}

model Property {
  id              String          @id @default(uuid())
  userId          String          @map("user_id")
  title           String
  description     String?         @db.Text
  propertyType    PropertyType    @map("property_type")
  listingType     ListingType     @map("listing_type")
  price           Decimal         @db.Decimal(12, 2)
  deposit         Decimal?        @db.Decimal(12, 2)
  bedrooms        Int?
  bathrooms       Int?
  areaSqft        Decimal?        @map("area_sqft") @db.Decimal(10, 2)
  furnishing      FurnishingType?
  address         String?         @db.Text
  city            String?
  state           String?
  pincode         String?
  latitude        Decimal?        @db.Decimal(10, 8)
  longitude       Decimal?        @db.Decimal(11, 8)
  availableFrom   DateTime?       @map("available_from")
  status          PropertyStatus  @default(ACTIVE)
  isVerified      Boolean         @default(false) @map("is_verified")
  viewsCount      Int             @default(0) @map("views_count")
  createdAt       DateTime        @default(now()) @map("created_at")
  updatedAt       DateTime        @updatedAt @map("updated_at")

  // Relations
  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)
  images          PropertyImage[]
  amenities       PropertyAmenity[]
  favorites       Favorite[]
  leads           Lead[]
  reviews         Review[]

  @@index([userId])
  @@index([city, propertyType, listingType])
  @@index([status])
  @@map("properties")
}

model PropertyImage {
  id           String   @id @default(uuid())
  propertyId   String   @map("property_id")
  imageUrl     String   @map("image_url")
  thumbnailUrl String?  @map("thumbnail_url")
  isPrimary    Boolean  @default(false) @map("is_primary")
  order        Int      @default(0)
  createdAt    DateTime @default(now()) @map("created_at")

  // Relations
  property     Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@index([propertyId])
  @@map("property_images")
}

model Amenity {
  id         String            @id @default(uuid())
  name       String            @unique
  category   String?
  icon       String?
  createdAt  DateTime          @default(now()) @map("created_at")

  // Relations
  properties PropertyAmenity[]

  @@map("amenities")
}

model PropertyAmenity {
  propertyId String   @map("property_id")
  amenityId  String   @map("amenity_id")

  property   Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  amenity    Amenity  @relation(fields: [amenityId], references: [id], onDelete: Cascade)

  @@id([propertyId, amenityId])
  @@map("property_amenities")
}

model Favorite {
  id         String   @id @default(uuid())
  userId     String   @map("user_id")
  propertyId String   @map("property_id")
  createdAt  DateTime @default(now()) @map("created_at")

  // Relations
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  property   Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)

  @@unique([userId, propertyId])
  @@index([userId])
  @@map("favorites")
}

model SavedSearch {
  id             String   @id @default(uuid())
  userId         String   @map("user_id")
  name           String
  searchCriteria Json     @map("search_criteria")
  alertEnabled   Boolean  @default(true) @map("alert_enabled")
  createdAt      DateTime @default(now()) @map("created_at")
  updatedAt      DateTime @updatedAt @map("updated_at")

  // Relations
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@map("saved_searches")
}

model Lead {
  id         String   @id @default(uuid())
  propertyId String   @map("property_id")
  seekerId   String   @map("seeker_id")
  ownerId    String   @map("owner_id")
  message    String?  @db.Text
  status     String   @default("NEW")
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  // Relations
  property   Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  seeker     User     @relation("LeadSeeker", fields: [seekerId], references: [id], onDelete: Cascade)
  owner      User     @relation("LeadOwner", fields: [ownerId], references: [id], onDelete: Cascade)

  @@index([propertyId])
  @@index([seekerId])
  @@index([ownerId])
  @@map("leads")
}

model Review {
  id         String   @id @default(uuid())
  propertyId String   @map("property_id")
  userId     String   @map("user_id")
  rating     Int
  comment    String?  @db.Text
  createdAt  DateTime @default(now()) @map("created_at")
  updatedAt  DateTime @updatedAt @map("updated_at")

  // Relations
  property   Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([propertyId])
  @@index([userId])
  @@map("reviews")
}
```

**Run Migration**:
```bash
npx prisma migrate dev --name init
npx prisma generate
```

#### Task 1.6: Backend Configuration Files (1 hour)

**File**: `backend/src/config/database.config.ts`

```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  url: process.env.DATABASE_URL,
}));
```

**File**: `backend/src/config/redis.config.ts`

```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
}));
```

**File**: `backend/src/config/app.config.ts`

```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3001,
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
}));
```

**File**: `backend/src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('app.port');
  const apiPrefix = configService.get<string>('app.apiPrefix');
  const corsOrigin = configService.get<string>('app.corsOrigin');

  // Global prefix
  app.setGlobalPrefix(apiPrefix);

  // CORS
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Plots Dekho API')
    .setDescription('Real Estate Platform API Documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(port);
  console.log(`🚀 Application running on: http://localhost:${port}/${apiPrefix}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
```

**File**: `backend/src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import redisConfig from './config/redis.config';
import { PrismaModule } from './modules/common/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, redisConfig],
    }),
    PrismaModule,
  ],
})
export class AppModule {}
```

---

## DAY 2: BACKEND FOUNDATION

### Morning (4 hours)

#### Task 2.1: Create Prisma Service (1 hour)

**File**: `backend/src/modules/common/prisma/prisma.module.ts`

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

**File**: `backend/src/modules/common/prisma/prisma.service.ts`

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') return;

    const models = Reflect.ownKeys(this).filter((key) => key[0] !== '_');

    return Promise.all(
      models.map((modelKey) => this[modelKey as string].deleteMany()),
    );
  }
}
```

#### Task 2.2: Create Common DTOs and Entities (1 hour)

**File**: `backend/src/modules/common/dto/pagination.dto.ts`

```typescript
import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class PaginationDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class PaginatedResponseDto<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

**File**: `backend/src/modules/common/dto/response.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class SuccessResponseDto<T = any> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;

  @ApiProperty()
  data?: T;

  constructor(message: string, data?: T) {
    this.success = true;
    this.message = message;
    this.data = data;
  }
}

export class ErrorResponseDto {
  @ApiProperty()
  success: boolean = false;

  @ApiProperty()
  message: string;

  @ApiProperty()
  error?: string;

  @ApiProperty()
  statusCode: number;
}
```

#### Task 2.3: Create Global Exception Filter (1 hour)

**File**: `backend/src/filters/http-exception.filter.ts`

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        error = (exceptionResponse as any).error || error;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    console.error('❌ Exception:', {
      path: request.url,
      method: request.method,
      error: exception,
    });

    response.status(status).json({
      success: false,
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}
```

#### Task 2.4: Create Health Check Module (1 hour)

**File**: `backend/src/modules/health/health.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule, HttpModule],
  controllers: [HealthController],
})
export class HealthModule {}
```

**File**: `backend/src/modules/health/health.controller.ts`

```typescript
import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../common/prisma/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ]);
  }

  @Get('status')
  @ApiOperation({ summary: 'Simple status check' })
  status() {
    return {
      success: true,
      message: 'API is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
    };
  }
}
```

**Install Terminus**:
```bash
pnpm add @nestjs/terminus @nestjs/axios axios
```

**Update app.module.ts**:
```typescript
// Add HealthModule to imports
imports: [
  // ... existing imports
  HealthModule,
],
```

**Test Backend**:
```bash
cd backend
pnpm start:dev

# In another terminal
curl http://localhost:3001/api/v1/health/status
```

### Afternoon (4 hours)

#### Task 2.5: Initialize Frontend (Next.js) (2 hours)

```bash
# Create frontend with Next.js
npx create-next-app@latest frontend --typescript --tailwind --app --use-pnpm --no-src

cd frontend

# Install shadcn/ui
npx shadcn-ui@latest init

# Select:
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes

# Install essential dependencies
pnpm add axios zustand react-hook-form zod @hookform/resolvers
pnpm add lucide-react date-fns clsx tailwind-merge
pnpm add -D @types/node
```

**Configure shadcn components**:
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add avatar
```

#### Task 2.6: Frontend Configuration (1 hour)

**File**: `frontend/.env.local.example`

```env
# API
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_API_TIMEOUT=30000

# App
NEXT_PUBLIC_APP_NAME=Plots Dekho
NEXT_PUBLIC_APP_URL=http://localhost:3000

# External Services (add later)
# NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
# NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=
```

Copy to .env.local:
```bash
cp .env.local.example .env.local
```

**File**: `frontend/lib/utils.ts` (should exist, update if needed)

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}
```

#### Task 2.7: Setup API Client (1 hour)

**File**: `frontend/lib/api/client.ts`

```typescript
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
const API_TIMEOUT = Number(process.env.NEXT_PUBLIC_API_TIMEOUT) || 30000;

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add auth token if exists
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => response.data,
      (error: AxiosError) => {
        const message = this.handleError(error);
        return Promise.reject({ message, error });
      },
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  public setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  public removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }

  private handleError(error: AxiosError): string {
    if (error.response) {
      const data = error.response.data as any;
      return data?.message || 'An error occurred';
    } else if (error.request) {
      return 'No response from server';
    } else {
      return error.message || 'An error occurred';
    }
  }

  // HTTP Methods
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.get(url, config);
  }

  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.client.post(url, data, config);
  }

  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.client.put(url, data, config);
  }

  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.client.patch(url, data, config);
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.client.delete(url, config);
  }
}

export const apiClient = new ApiClient();
```

**File**: `frontend/lib/api/endpoints.ts`

```typescript
export const API_ENDPOINTS = {
  // Health
  HEALTH: '/health/status',

  // Auth (will add in Week 2)
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
  },

  // Properties (will add in Week 3)
  PROPERTIES: {
    LIST: '/properties',
    CREATE: '/properties',
    GET: (id: string) => `/properties/${id}`,
    UPDATE: (id: string) => `/properties/${id}`,
    DELETE: (id: string) => `/properties/${id}`,
  },
} as const;
```

---

## DAY 3: FRONTEND STRUCTURE & ROUTING

### Morning (4 hours)

#### Task 3.1: Create Type Definitions (1 hour)

**File**: `frontend/types/index.ts`

```typescript
// User Types
export enum UserRole {
  OWNER = 'OWNER',
  SEEKER = 'SEEKER',
  AGENT = 'AGENT',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  email: string;
  phone?: string;
  name?: string;
  role: UserRole;
  avatarUrl?: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Property Types
export enum PropertyType {
  APARTMENT = 'APARTMENT',
  HOUSE = 'HOUSE',
  VILLA = 'VILLA',
  PLOT = 'PLOT',
  COMMERCIAL = 'COMMERCIAL',
}

export enum ListingType {
  RENT = 'RENT',
  SALE = 'SALE',
}

export enum FurnishingType {
  UNFURNISHED = 'UNFURNISHED',
  SEMI_FURNISHED = 'SEMI_FURNISHED',
  FULLY_FURNISHED = 'FULLY_FURNISHED',
}

export enum PropertyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  RENTED = 'RENTED',
  SOLD = 'SOLD',
}

export interface Property {
  id: string;
  userId: string;
  title: string;
  description?: string;
  propertyType: PropertyType;
  listingType: ListingType;
  price: number;
  deposit?: number;
  bedrooms?: number;
  bathrooms?: number;
  areaSqft?: number;
  furnishing?: FurnishingType;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  latitude?: number;
  longitude?: number;
  availableFrom?: string;
  status: PropertyStatus;
  isVerified: boolean;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  images?: PropertyImage[];
  amenities?: Amenity[];
  user?: User;
}

export interface PropertyImage {
  id: string;
  propertyId: string;
  imageUrl: string;
  thumbnailUrl?: string;
  isPrimary: boolean;
  order: number;
}

export interface Amenity {
  id: string;
  name: string;
  category?: string;
  icon?: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
```

#### Task 3.2: Create Layout Components (2 hours)

**File**: `frontend/components/layout/Header.tsx`

```typescript
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Menu, User } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Logo */}
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Home className="h-6 w-6" />
          <span className="hidden font-bold sm:inline-block">Plots Dekho</span>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-1 items-center space-x-6 text-sm font-medium">
          <Link
            href="/properties?type=RENT"
            className="transition-colors hover:text-foreground/80"
          >
            Rent
          </Link>
          <Link
            href="/properties?type=SALE"
            className="transition-colors hover:text-foreground/80"
          >
            Buy
          </Link>
          <Link
            href="/properties/new"
            className="transition-colors hover:text-foreground/80"
          >
            Post Property
          </Link>
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Login</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/register">Sign Up</Link>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
```

**File**: `frontend/components/layout/Footer.tsx`

```typescript
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container py-8 md:py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Company */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Company</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-muted-foreground hover:text-foreground">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Services</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/services/packers" className="text-muted-foreground hover:text-foreground">
                  Packers & Movers
                </Link>
              </li>
              <li>
                <Link href="/services/painting" className="text-muted-foreground hover:text-foreground">
                  Painting
                </Link>
              </li>
              <li>
                <Link href="/services/cleaning" className="text-muted-foreground hover:text-foreground">
                  Cleaning
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Legal</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-4 text-sm font-semibold">Follow Us</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-foreground">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Plots Dekho. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
```

**File**: `frontend/app/layout.tsx`

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Plots Dekho - Find Your Dream Property',
  description: 'India\'s leading real estate platform. Find properties for rent and sale.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
```

#### Task 3.3: Create Homepage (1 hour)

**File**: `frontend/app/page.tsx`

```typescript
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Home, TrendingUp, Shield } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
        <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
            Find Your Dream Property
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Discover the perfect home for rent or sale. Zero brokerage, verified listings,
            and trusted by thousands.
          </p>
          <div className="flex gap-4">
            <Button size="lg" asChild>
              <Link href="/properties?type=RENT">Explore Rentals</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/properties?type=SALE">Buy Property</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Why Choose Plots Dekho?
          </h2>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          <Card>
            <CardContent className="flex flex-col items-center space-y-2 p-6">
              <div className="rounded-full bg-primary/10 p-3">
                <Home className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold">Zero Brokerage</h3>
              <p className="text-sm text-muted-foreground text-center">
                Connect directly with property owners. No broker fees.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center space-y-2 p-6">
              <div className="rounded-full bg-primary/10 p-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold">Verified Listings</h3>
              <p className="text-sm text-muted-foreground text-center">
                All properties are verified for authenticity and accuracy.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex flex-col items-center space-y-2 p-6">
              <div className="rounded-full bg-primary/10 p-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-bold">Best Prices</h3>
              <p className="text-sm text-muted-foreground text-center">
                Get the best deals without middlemen markups.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
          <h2 className="font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl">
            Ready to get started?
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            List your property for free or start searching for your dream home today.
          </p>
          <Button size="lg" asChild>
            <Link href="/properties/new">Post Your Property</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
```

### Afternoon (4 hours)

#### Task 3.4: Create Routing Structure (2 hours)

Create placeholder pages for all routes:

**File**: `frontend/app/properties/page.tsx`

```typescript
export default function PropertiesPage() {
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Properties</h1>
      <p className="text-muted-foreground mt-2">
        Search and filter properties (Coming in Week 4)
      </p>
    </div>
  );
}
```

Create similar placeholder pages:
- `app/login/page.tsx`
- `app/register/page.tsx`
- `app/dashboard/page.tsx`
- `app/properties/[id]/page.tsx`
- `app/properties/new/page.tsx`

#### Task 3.5: Create Common UI Components (2 hours)

**File**: `frontend/components/common/LoadingSpinner.tsx`

```typescript
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex items-center justify-center">
      <Loader2 className={`animate-spin ${sizeClasses[size]} ${className}`} />
    </div>
  );
}
```

**File**: `frontend/components/common/EmptyState.tsx`

```typescript
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-6 mb-4">
        <Icon className="h-10 w-10 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  );
}
```

---

## DAY 4-5: CI/CD & TESTING SETUP

### Task 4.1: GitHub Actions CI/CD (3 hours)

**File**: `.github/workflows/backend-ci.yml`

```yaml
name: Backend CI

on:
  push:
    branches: [main, develop]
    paths:
      - 'backend/**'
  pull_request:
    branches: [main, develop]
    paths:
      - 'backend/**'

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15-alpine
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        working-directory: ./backend
        run: pnpm install

      - name: Run linter
        working-directory: ./backend
        run: pnpm lint

      - name: Run tests
        working-directory: ./backend
        run: pnpm test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db

      - name: Build
        working-directory: ./backend
        run: pnpm build
```

**File**: `.github/workflows/frontend-ci.yml`

```yaml
name: Frontend CI

on:
  push:
    branches: [main, develop]
    paths:
      - 'frontend/**'
  pull_request:
    branches: [main, develop]
    paths:
      - 'frontend/**'

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        working-directory: ./frontend
        run: pnpm install

      - name: Run linter
        working-directory: ./frontend
        run: pnpm lint

      - name: Build
        working-directory: ./frontend
        run: pnpm build
        env:
          NEXT_PUBLIC_API_URL: http://localhost:3001/api/v1
```

### Task 4.2: Setup Testing (3 hours)

**Backend Test Setup**:

**File**: `backend/test/app.e2e-spec.ts`

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/v1/health/status (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health/status')
      .expect(200)
      .expect((res) => {
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('API is running');
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
```

### Task 4.3: Documentation (2 hours)

**Update README.md** with:
- Project overview
- Tech stack
- Getting started
- Development workflow
- Deployment
- Contributing guidelines

---

## 🎨 DESIGN SPECIFICATIONS

### Color Palette

```css
/* Light Mode */
--background: 0 0% 100%;
--foreground: 222.2 84% 4.9%;
--primary: 222.2 47.4% 11.2%;
--primary-foreground: 210 40% 98%;
--muted: 210 40% 96.1%;
--muted-foreground: 215.4 16.3% 46.9%;

/* Dark Mode */
--background: 222.2 84% 4.9%;
--foreground: 210 40% 98%;
--primary: 210 40% 98%;
--primary-foreground: 222.2 47.4% 11.2%;
```

### Typography

- **Font Family**: Inter (sans-serif)
- **Headings**:
  - H1: 3rem (48px), font-weight: 700
  - H2: 2.5rem (40px), font-weight: 600
  - H3: 2rem (32px), font-weight: 600
- **Body**: 1rem (16px), font-weight: 400
- **Small**: 0.875rem (14px)

### Spacing System

- 0.5rem (8px)
- 1rem (16px)
- 1.5rem (24px)
- 2rem (32px)
- 3rem (48px)
- 4rem (64px)

### Component Styling

**Buttons**:
- Primary: Filled with primary color
- Secondary: Outlined
- Ghost: Text only
- Heights: sm (32px), md (40px), lg (48px)

**Cards**:
- Border radius: 8px
- Border: 1px solid muted
- Padding: 24px
- Shadow: subtle on hover

---

## 📊 WEEK 1 COMPLETION CHECKLIST

- [ ] Git repository initialized
- [ ] Docker Compose running (Postgres, Redis, Meilisearch)
- [ ] Backend NestJS project setup
- [ ] Prisma schema created and migrated
- [ ] Health check endpoint working
- [ ] Frontend Next.js project setup
- [ ] Tailwind CSS and shadcn/ui configured
- [ ] API client setup
- [ ] Layout components (Header, Footer) created
- [ ] Homepage designed
- [ ] Routing structure created
- [ ] CI/CD pipeline setup
- [ ] Basic tests passing
- [ ] Documentation updated

---

## 🚀 TESTING & VERIFICATION

### Test Backend
```bash
cd backend
pnpm start:dev

# Test health endpoint
curl http://localhost:3001/api/v1/health/status

# Check Swagger docs
open http://localhost:3001/api/docs
```

### Test Frontend
```bash
cd frontend
pnpm dev

# Open browser
open http://localhost:3000
```

### Test Docker Services
```bash
docker-compose ps
docker exec -it plots-dekho-postgres psql -U plotsdekho -d plotsdekho_dev
```

---

## 📈 SUCCESS METRICS

- ✅ All Docker services healthy
- ✅ Backend API responding
- ✅ Frontend loading
- ✅ Database connected
- ✅ CI/CD pipeline green
- ✅ Code linting passing
- ✅ Basic structure complete

---

## NEXT WEEK PREVIEW

**Week 2**: Authentication & User Management
- User registration with email/phone
- Login with JWT
- Password hashing
- Email verification
- User profile management
- Protected routes

