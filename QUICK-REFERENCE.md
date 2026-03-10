# 🚀 QUICK REFERENCE GUIDE
## Plots Dekho - Developer Cheat Sheet

---

## 📂 Essential Commands

### Project Setup
```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Backend
cd backend
pnpm install
pnpm start:dev          # Development
pnpm build             # Production build
pnpm test              # Run tests
pnpm prisma studio     # Open Prisma Studio

# Frontend
cd frontend
pnpm install
pnpm dev               # Development
pnpm build             # Production build
pnpm lint              # Lint code
```

### Database Commands
```bash
# Prisma
npx prisma migrate dev              # Create & apply migration
npx prisma migrate deploy           # Apply migrations (production)
npx prisma generate                 # Generate Prisma Client
npx prisma studio                   # Open database GUI
npx prisma db seed                  # Seed database
npx prisma migrate reset            # Reset database (DESTRUCTIVE)

# Direct PostgreSQL access
docker exec -it plots-dekho-postgres psql -U plotsdekho -d plotsdekho_dev
```

### Git Workflow
```bash
# Feature branch
git checkout -b feature/property-search
git add .
git commit -m "feat: add property search functionality"
git push -u origin feature/property-search

# Create PR on GitHub, then merge

# Conventional commits
feat: new feature
fix: bug fix
docs: documentation
refactor: code refactoring
test: adding tests
chore: maintenance
```

---

## 🔗 Important URLs

### Development
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001/api/v1
- **API Docs (Swagger)**: http://localhost:3001/api/docs
- **Prisma Studio**: http://localhost:5555
- **pgAdmin**: http://localhost:5050
- **Meilisearch**: http://localhost:7700

### Production (Example)
- **Frontend**: https://plots-dekho.vercel.app
- **Backend API**: https://api.plots-dekho.com/api/v1

---

## 📝 Common Code Snippets

### Backend

#### Create a New Module
```bash
cd backend/src/modules
nest g module favorites
nest g controller favorites
nest g service favorites
```

#### Create a DTO
```typescript
// create-favorite.dto.ts
import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFavoriteDto {
  @ApiProperty()
  @IsUUID()
  propertyId: string;
}
```

#### Create a Controller Endpoint
```typescript
@Post()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiOperation({ summary: 'Add to favorites' })
async create(
  @CurrentUser() user: any,
  @Body() dto: CreateFavoriteDto,
) {
  return this.favoritesService.create(user.id, dto.propertyId);
}
```

#### Create a Service Method
```typescript
async create(userId: string, propertyId: string) {
  return this.prisma.favorite.create({
    data: {
      userId,
      propertyId,
    },
    include: {
      property: {
        include: {
          images: {
            where: { isPrimary: true },
            take: 1,
          },
        },
      },
    },
  });
}
```

#### Add Guard to Route
```typescript
@UseGuards(JwtAuthGuard)           // Require authentication
@UseGuards(JwtAuthGuard, RolesGuard)  // Require authentication + role
@Roles(UserRole.ADMIN)             // Require admin role
```

### Frontend

#### Create a Component
```typescript
// components/PropertyCard.tsx
'use client';

import { Property } from '@/types';
import { Card } from '@/components/ui/card';

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  return (
    <Card>
      <h3>{property.title}</h3>
      <p>₹{property.price.toLocaleString()}</p>
    </Card>
  );
}
```

#### Fetch Data (Client Component)
```typescript
'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';

export function PropertiesList() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const data = await apiClient.get('/properties');
      setProperties(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {properties.map(property => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
```

#### Use Zustand Store
```typescript
'use client';

import { useAuthStore } from '@/lib/store/auth-store';

export function UserMenu() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();

  if (!isAuthenticated) return null;

  return (
    <div>
      <p>Welcome, {user.name}</p>
      <button onClick={clearAuth}>Logout</button>
    </div>
  );
}
```

#### Form with Validation
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  title: z.string().min(10),
  price: z.number().min(0),
});

type FormData = z.infer<typeof schema>;

export function PropertyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    // Handle submit
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} />
      {errors.title && <p>{errors.title.message}</p>}

      <input type="number" {...register('price', { valueAsNumber: true })} />
      {errors.price && <p>{errors.price.message}</p>}

      <button type="submit">Submit</button>
    </form>
  );
}
```

---

## 🎨 shadcn/ui Components

### Install Component
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add radio-group
npx shadcn-ui@latest add slider
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add badge
```

### Usage Examples
```typescript
// Button
import { Button } from '@/components/ui/button';
<Button variant="default">Click me</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>

// Card
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

// Input
import { Input } from '@/components/ui/input';
<Input type="email" placeholder="Email" />

// Toast
import { useToast } from '@/components/ui/use-toast';
const { toast } = useToast();
toast({ title: 'Success', description: 'Property created' });
toast({ title: 'Error', description: 'Failed', variant: 'destructive' });

// Dialog
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    <div>Content</div>
  </DialogContent>
</Dialog>
```

---

## 🗄️ Database Queries (Prisma)

### Common Queries
```typescript
// Create
await prisma.property.create({
  data: {
    title: 'Property',
    userId: 'user-id',
  },
});

// Find unique
await prisma.property.findUnique({
  where: { id: 'property-id' },
});

// Find many with filters
await prisma.property.findMany({
  where: {
    city: 'Bangalore',
    price: { gte: 10000, lte: 30000 },
    bedrooms: { in: [2, 3] },
  },
  include: {
    images: true,
    user: true,
  },
  orderBy: { createdAt: 'desc' },
  take: 20,
  skip: 0,
});

// Update
await prisma.property.update({
  where: { id: 'property-id' },
  data: { title: 'New Title' },
});

// Delete
await prisma.property.delete({
  where: { id: 'property-id' },
});

// Count
await prisma.property.count({
  where: { city: 'Bangalore' },
});

// Aggregate
await prisma.property.aggregate({
  _avg: { price: true },
  _max: { price: true },
  _min: { price: true },
});

// Transaction
await prisma.$transaction([
  prisma.property.create({ data: {...} }),
  prisma.propertyImage.createMany({ data: [...] }),
]);
```

### Relations
```typescript
// Create with relations
await prisma.property.create({
  data: {
    title: 'Property',
    user: { connect: { id: 'user-id' } },
    amenities: {
      create: [
        { amenity: { connect: { id: 'amenity-1' } } },
        { amenity: { connect: { id: 'amenity-2' } } },
      ],
    },
  },
});

// Include relations
await prisma.property.findUnique({
  where: { id },
  include: {
    images: true,
    amenities: {
      include: {
        amenity: true,
      },
    },
    user: {
      select: {
        id: true,
        name: true,
        email: true,
      },
    },
  },
});
```

---

## 🔐 Authentication Patterns

### Backend - Protect Route
```typescript
@Get()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
async getData(@CurrentUser() user: any) {
  // user = { id, email, role }
  return this.service.getData(user.id);
}
```

### Backend - Role-Based Access
```typescript
@Get('admin-only')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@ApiBearerAuth()
async adminData() {
  return { message: 'Admin only' };
}
```

### Frontend - Protected Page
```typescript
// app/dashboard/page.tsx
'use client';

import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function DashboardContent() {
  return <div>Dashboard</div>;
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
```

### Frontend - Conditional Rendering
```typescript
const { isAuthenticated, user } = useAuthStore();

{isAuthenticated ? (
  <UserMenu user={user} />
) : (
  <LoginButton />
)}
```

---

## 📤 File Upload

### Backend - Upload Endpoint
```typescript
@Post('upload')
@UseGuards(JwtAuthGuard)
@UseInterceptors(FilesInterceptor('images', 10))
async upload(
  @CurrentUser() user: any,
  @UploadedFiles() files: Express.Multer.File[],
) {
  const uploads = await this.cloudinary.uploadMultipleImages(files);
  return uploads.map(u => u.secure_url);
}
```

### Frontend - Upload with Preview
```typescript
'use client';

import { useState } from 'react';

export function ImageUpload() {
  const [files, setFiles] = useState<File[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    const response = await apiClient.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  };

  return (
    <div>
      <input type="file" multiple onChange={handleChange} accept="image/*" />

      {files.map((file, i) => (
        <img
          key={i}
          src={URL.createObjectURL(file)}
          alt={`Preview ${i}`}
          width={100}
        />
      ))}

      <button onClick={handleUpload}>Upload</button>
    </div>
  );
}
```

---

## 🎯 Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
API_PREFIX=api/v1

DATABASE_URL="postgresql://plotsdekho:password@localhost:5432/plotsdekho_dev"

JWT_SECRET=your_super_secret_key
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRATION=30d

REDIS_HOST=localhost
REDIS_PORT=6379

MEILI_HOST=http://localhost:7700
MEILI_MASTER_KEY=master_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
NEXT_PUBLIC_APP_NAME=Plots Dekho
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_api_key
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
```

---

## 🧪 Testing

### Backend Unit Test
```typescript
// auth.service.spec.ts
import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    prisma = module.get(PrismaService);
  });

  it('should register a user', async () => {
    const dto = { email: 'test@test.com', password: 'pass123' };
    jest.spyOn(prisma.user, 'create').mockResolvedValue({
      id: '1',
      ...dto,
    } as any);

    const result = await service.register(dto);
    expect(result).toHaveProperty('user');
    expect(result).toHaveProperty('tokens');
  });
});
```

### Frontend Component Test
```typescript
// PropertyCard.test.tsx
import { render, screen } from '@testing-library/react';
import { PropertyCard } from './PropertyCard';

describe('PropertyCard', () => {
  const mockProperty = {
    id: '1',
    title: 'Test Property',
    price: 10000,
    city: 'Bangalore',
  };

  it('renders property details', () => {
    render(<PropertyCard property={mockProperty} />);

    expect(screen.getByText('Test Property')).toBeInTheDocument();
    expect(screen.getByText('₹10,000')).toBeInTheDocument();
    expect(screen.getByText('Bangalore')).toBeInTheDocument();
  });
});
```

---

## 🐛 Debugging

### Backend Logs
```typescript
// Use NestJS Logger
import { Logger } from '@nestjs/common';

export class MyService {
  private readonly logger = new Logger(MyService.name);

  async doSomething() {
    this.logger.log('Doing something');
    this.logger.error('Error occurred', stackTrace);
    this.logger.warn('Warning message');
    this.logger.debug('Debug info');
  }
}
```

### Frontend Logs
```typescript
// Development only
if (process.env.NODE_ENV === 'development') {
  console.log('State:', state);
  console.table(properties);
}
```

### Network Debugging
```typescript
// API Client - Log all requests
this.client.interceptors.request.use(config => {
  console.log('→', config.method?.toUpperCase(), config.url);
  return config;
});

this.client.interceptors.response.use(
  response => {
    console.log('←', response.status, response.config.url);
    return response;
  },
  error => {
    console.error('✗', error.response?.status, error.config?.url);
    return Promise.reject(error);
  }
);
```

---

## 📊 Performance Optimization

### Backend
```typescript
// Pagination
const take = 20;
const skip = (page - 1) * take;
const properties = await prisma.property.findMany({ take, skip });

// Select specific fields
const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true },
});

// Indexing (in Prisma schema)
@@index([city, propertyType, listingType])
@@index([status])

// Caching (Redis)
const cached = await redis.get(`property:${id}`);
if (cached) return JSON.parse(cached);

const property = await prisma.property.findUnique({ where: { id } });
await redis.set(`property:${id}`, JSON.stringify(property), 'EX', 3600);
```

### Frontend
```typescript
// Next.js Image
import Image from 'next/image';
<Image
  src={property.imageUrl}
  alt={property.title}
  width={400}
  height={300}
  loading="lazy"
/>

// Dynamic imports
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
});

// Debounce search
import { debounce } from 'lodash';
const debouncedSearch = debounce(searchFunction, 300);
```

---

## 🚢 Deployment

### Build Commands
```bash
# Backend
cd backend
pnpm build
pnpm prisma generate
pnpm prisma migrate deploy

# Frontend
cd frontend
pnpm build
```

### Environment Check
```bash
# Check all required env vars are set
echo $DATABASE_URL
echo $JWT_SECRET
echo $NEXT_PUBLIC_API_URL
```

### Health Check
```bash
# Backend
curl https://api.yourapp.com/api/v1/health/status

# Frontend
curl https://yourapp.com
```

---

## 📞 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Port already in use | `lsof -i :3001` then `kill -9 PID` |
| Docker container won't start | `docker-compose down -v && docker-compose up -d` |
| Database connection error | Check `DATABASE_URL` in `.env` |
| Frontend can't reach backend | Check `NEXT_PUBLIC_API_URL` and CORS settings |
| Prisma Client out of sync | `npx prisma generate` |
| JWT token invalid | Check `JWT_SECRET` matches between environments |
| Images not uploading | Check Cloudinary credentials |
| TypeScript errors | `rm -rf node_modules && pnpm install` |

---

## 🔧 Useful VS Code Extensions

- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- GitLens
- Thunder Client (API testing)
- Docker
- Error Lens

---

## 📚 Documentation Links

- **NestJS**: https://docs.nestjs.com
- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Hook Form**: https://react-hook-form.com
- **Zod**: https://zod.dev
- **Zustand**: https://github.com/pmndrs/zustand

---

**Keep this reference handy while coding! 🚀**

