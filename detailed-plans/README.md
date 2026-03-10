# 📚 Detailed Implementation Plans
## Week-by-Week Development Guide for Plots Dekho

---

## 🎯 Overview

This directory contains **extremely detailed**, step-by-step implementation plans for building the Plots Dekho real estate platform. Each document breaks down development into daily tasks with specific code examples, component structures, API endpoints, and design specifications.

---

## 📖 Available Documents

### 1. **MASTER-SUMMARY.md** ⭐ START HERE
**Complete overview of the entire system**

- How all components interact
- Authentication flow diagrams
- Property creation flow
- Database relationships
- Component hierarchy
- API client architecture
- Testing strategy
- Deployment flow
- Project structure reference

**Read this first** to understand the big picture!

---

### 2. **WEEK-01-DETAILED.md**
**Foundation & Infrastructure Setup**

**Duration**: 5 days

**What you'll build**:
- Complete development environment (Docker, Postgres, Redis, Meilisearch)
- NestJS backend with Prisma ORM
- Next.js frontend with Tailwind CSS & shadcn/ui
- API client with interceptors
- Layout components (Header, Footer)
- CI/CD pipeline with GitHub Actions

**Key Files Created**:
- `docker-compose.yml` - All services
- `backend/prisma/schema.prisma` - Complete database schema
- `backend/src/main.ts` - NestJS entry point
- `frontend/lib/api/client.ts` - API client
- `frontend/components/layout/Header.tsx` - Header component
- `frontend/app/page.tsx` - Homepage

**Day-by-Day Breakdown**:
- **Day 1**: Repository setup, Docker Compose, code quality tools
- **Day 2**: Backend foundation (Prisma, health check, error handling)
- **Day 3**: Frontend structure, routing, layout components
- **Day 4-5**: CI/CD setup, testing configuration, documentation

**Deliverables**:
✅ All Docker services running
✅ Backend API responding at `localhost:3001/api/v1`
✅ Frontend loading at `localhost:3000`
✅ Swagger docs at `localhost:3001/api/docs`
✅ CI/CD pipeline configured

---

### 3. **WEEK-02-DETAILED.md**
**Authentication & User Management**

**Duration**: 5 days

**What you'll build**:
- Complete authentication system with JWT
- User registration with email/password
- Login with refresh tokens
- Email verification flow (structure ready)
- User profile management
- Protected routes

**Backend Modules**:
- `AuthModule` - Registration, login, token management
- `UsersModule` - Profile CRUD, password change
- `JwtStrategy` - Token validation
- `JwtAuthGuard` - Route protection
- `RolesGuard` - Role-based access control

**Frontend Components**:
- Auth store (Zustand with persistence)
- Login page with validation
- Register page with role selection
- Profile page with edit capability
- Dashboard page (skeleton)
- Protected route HOC
- User menu dropdown in header

**API Endpoints Created**:
```
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
GET    /auth/verify-email?token=
POST   /auth/logout
GET    /users/me
PUT    /users/me
POST   /users/me/change-password
DELETE /users/me
```

**Database Tables**:
- `users` - User accounts
- `verification_tokens` - Email/phone verification
- `refresh_tokens` - JWT refresh tokens

**Day-by-Day Breakdown**:
- **Day 1 Morning**: Auth module setup, DTOs, JWT strategy
- **Day 1 Afternoon**: Local strategy, auth guards, decorators
- **Day 2 Morning**: Users module, profile management
- **Day 2 Afternoon**: Tests, integration testing
- **Day 3-4**: Frontend auth implementation
- **Day 5**: Profile page, end-to-end testing

**Deliverables**:
✅ User can register and login
✅ JWT tokens working
✅ Protected routes block unauthorized access
✅ Profile update functional
✅ Password change working

---

### 4. **WEEK-03-DETAILED.md**
**Property Listing - Part 1 (Create & View)**

**Duration**: 5 days

**What you'll build**:
- Multi-step property creation form (7 steps)
- Image upload to Cloudinary
- Google Places address autocomplete
- Interactive map for location selection
- Amenities selection system
- Property detail page
- Property card component

**Backend**:
- `PropertiesModule` - Complete CRUD operations
- `CloudinaryModule` - Image upload service
- Image management endpoints
- Amenities seed data (30+ amenities)
- Property ownership validation

**Frontend - 7-Step Form**:
1. **Property Type & Listing Type** - Visual selection cards
2. **Basic Details** - Title, price, BHK, area
3. **Location** - Address autocomplete + map picker
4. **Amenities** - Multi-select checkboxes (grouped by category)
5. **Photos** - Drag & drop upload, reorder, set primary
6. **Additional Details** - Furnishing, availability date, description
7. **Review & Submit** - Summary with edit buttons

**State Management**:
- `PropertyFormStore` (Zustand) - Multi-step form state
- Persists across step navigation
- Validation at each step

**API Endpoints**:
```
POST   /properties                          # Create property
GET    /properties                          # List all
GET    /properties/:id                      # Get single
PUT    /properties/:id                      # Update
DELETE /properties/:id                      # Delete
POST   /properties/:id/images               # Upload images
DELETE /properties/images/:imageId          # Delete image
POST   /properties/images/:imageId/set-primary # Set primary image
```

**Components Created**:
- `PropertyFormWizard.tsx` - Main wizard container
- `Step1PropertyType.tsx` - Type selection
- `Step2BasicDetails.tsx` - Form with validation
- `Step3Location.tsx` - Map + autocomplete
- `Step4Amenities.tsx` - Grouped checkboxes
- `Step5Photos.tsx` - Image upload with preview
- `Step6AdditionalDetails.tsx` - Extra info
- `Step7Review.tsx` - Summary and submit

**Day-by-Day Breakdown**:
- **Day 1 Morning**: Cloudinary setup, Properties module structure
- **Day 1 Afternoon**: CRUD endpoints, image upload
- **Day 2-3**: Multi-step form implementation (all 7 steps)
- **Day 4**: Property card, property detail page
- **Day 5**: Integration testing, polish

**Deliverables**:
✅ Complete property creation flow working
✅ Images upload to Cloudinary
✅ Properties stored in database with relations
✅ Property detail page displays all information

---

### 5. **WEEK-04-05-SUMMARY.md** (Coming Soon)
**Property Management & Search**

Will include:
- Owner dashboard with property management
- Edit property (reuse creation form)
- Delete property
- Basic search with filters
- Meilisearch integration
- Property card component (reusable)
- Search results with pagination

---

## 🗺️ How to Use These Plans

### For Solo Developers:
1. **Read MASTER-SUMMARY.md** to understand the architecture
2. **Follow week-by-week** starting with Week 1
3. **Complete each day's tasks** in order
4. **Test as you go** - don't skip testing steps
5. **Commit frequently** - at minimum, end of each day

### For Teams:
1. **Team lead** reviews all documents
2. **Assign weeks** to different developers
3. **Daily standups** to sync progress
4. **Code reviews** at end of each week
5. **Integration testing** when modules connect

### Suggested Timeline:

**Solo Developer** (working full-time):
- Week 1-2: ~10 days
- Week 3-4: ~10 days
- **Total Phase 1**: ~3-4 weeks

**Team of 3** (parallel work):
- Developer 1: Backend (Weeks 1-4)
- Developer 2: Frontend (Weeks 1-4)
- Developer 3: Testing, DevOps, Integration
- **Total Phase 1**: ~2-3 weeks

---

## 📁 Companion Files

In the main project directory, you'll also find:

- **`/real-estate-platform-analysis.md`**
  - Analysis of NoBroker and 99acres
  - Feature breakdown
  - Inspiration for design and functionality

- **`/IMPLEMENTATION-PLAN.md`**
  - High-level 26-week roadmap
  - All 8 phases summarized
  - Tech stack recommendations
  - Cost estimates
  - Team structure

---

## 🎨 Code Style Guide

### Backend (NestJS + TypeScript)

**File naming**:
- Modules: `auth.module.ts`
- Controllers: `auth.controller.ts`
- Services: `auth.service.ts`
- DTOs: `create-user.dto.ts`
- Guards: `jwt-auth.guard.ts`

**Code structure**:
```typescript
// Always use dependency injection
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(dto: LoginDto) {
    // Implementation
  }
}
```

### Frontend (Next.js + TypeScript)

**File naming**:
- Pages: `page.tsx` (App Router)
- Components: `PropertyCard.tsx` (PascalCase)
- Utilities: `utils.ts`
- Stores: `auth-store.ts`
- API: `auth.api.ts`

**Component structure**:
```typescript
'use client'; // Only if using hooks/state

import { Component } from '@/components/ui/component';

interface Props {
  // Props definition
}

export function MyComponent({ ...props }: Props) {
  // Hooks at top
  const [state, setState] = useState();

  // Functions
  const handleClick = () => {};

  // Render
  return <div>...</div>;
}
```

---

## ✅ Verification Checklist

After completing each week, verify:

### Week 1:
```bash
# Backend
curl http://localhost:3001/api/v1/health/status

# Frontend
open http://localhost:3000

# Docker
docker-compose ps  # All services should be "Up"

# Database
docker exec -it plots-dekho-postgres psql -U plotsdekho -d plotsdekho_dev -c "\dt"
```

### Week 2:
```bash
# Register user
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'

# Login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'

# Frontend
# - Visit http://localhost:3000/register
# - Complete registration
# - Login successfully
# - Access dashboard
```

### Week 3:
```bash
# Check amenities seeded
curl http://localhost:3001/api/v1/amenities

# Frontend
# - Login
# - Click "Post Property"
# - Complete all 7 steps
# - Verify property created
# - View property detail page
```

---

## 🆘 Troubleshooting

### Common Issues:

**Docker containers won't start**:
```bash
# Check ports
lsof -i :5432  # Postgres
lsof -i :6379  # Redis
lsof -i :7700  # Meilisearch

# Reset
docker-compose down -v
docker-compose up -d
```

**Backend not connecting to database**:
```bash
# Check DATABASE_URL in .env
# Should match docker-compose.yml credentials

# Test connection
npx prisma db push
```

**Frontend API calls failing**:
```bash
# Check NEXT_PUBLIC_API_URL in .env.local
# Should be: http://localhost:3001/api/v1

# Check CORS in backend
# corsOrigin should include http://localhost:3000
```

**Prisma schema out of sync**:
```bash
npx prisma migrate reset  # CAUTION: Deletes all data
npx prisma migrate dev
npx prisma generate
```

---

## 🚀 Quick Start

```bash
# 1. Clone/Create project directory
mkdir plots-dekho
cd plots-dekho

# 2. Follow WEEK-01-DETAILED.md
# Start from "Day 1: Repository & Environment Setup"

# 3. At the end of each day, commit
git add .
git commit -m "Complete Week 1 Day 1"

# 4. At the end of each week, create PR
git checkout -b week-1-foundation
git push -u origin week-1-foundation
# Create PR on GitHub

# 5. After review, merge and start next week
git checkout main
git pull
git checkout -b week-2-auth
```

---

## 📞 Support

If you get stuck:
1. **Check MASTER-SUMMARY.md** - Understand the flow
2. **Review the specific week's document** - Follow step-by-step
3. **Check Troubleshooting section** above
4. **Refer to official docs** - NestJS, Next.js, Prisma
5. **Create GitHub issue** - For bugs or unclear instructions

---

## 🎯 Goals

By following these detailed plans, you will:

✅ Build a production-ready real estate platform
✅ Learn modern full-stack development
✅ Understand authentication & authorization
✅ Master form handling & file uploads
✅ Implement search & filtering
✅ Deploy a scalable application

**Total estimated time**: 6-8 weeks for Phase 1 (Weeks 1-4) + MVP features

---

## 📝 Notes

- **These are guides, not scripture** - Adapt as needed for your use case
- **Security first** - Never skip auth validation
- **Test as you build** - Don't accumulate technical debt
- **Document as you go** - Future you will thank present you
- **Ask questions** - Better to clarify than guess

---

**Happy Coding! 🚀**

Built with ❤️ for developers who want step-by-step guidance.

