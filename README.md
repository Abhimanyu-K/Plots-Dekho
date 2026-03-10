# Plots Dekho - Real Estate Platform

Zero brokerage real estate platform for finding and listing properties.

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- pnpm (recommended) or npm

### Installation

```bash
# Install dependencies
pnpm install

# Start development environment
docker-compose up -d

# Run database migrations
cd backend && pnpm prisma migrate dev

# Start backend (in one terminal)
cd backend && pnpm start:dev

# Start frontend (in another terminal)
cd frontend && pnpm dev
```

### Access Points
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/v1
- **API Docs**: http://localhost:3001/api/docs
- **Prisma Studio**: http://localhost:5555
- **pgAdmin**: http://localhost:5050

## 📚 Documentation

See the `/detailed-plans` directory for complete implementation guides.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: NestJS, TypeScript, Prisma ORM
- **Database**: PostgreSQL
- **Cache**: Redis
- **Search**: Meilisearch
- **Storage**: Cloudinary
- **Auth**: JWT

## 📦 Project Structure

```
plots-dekho/
├── backend/           # NestJS API
├── frontend/          # Next.js app
├── detailed-plans/    # Implementation guides
└── docker-compose.yml # Development environment
```

## 🧪 Testing

```bash
# Backend tests
cd backend && pnpm test

# Frontend tests
cd frontend && pnpm test
```

## 🚢 Deployment

See `IMPLEMENTATION-PLAN.md` for deployment instructions.

## 📝 License

MIT
