# 🚀 Plots Dekho - Deployment Guide

Complete step-by-step guide to deploy the full-stack application on free hosting services.

---

## 📋 Deployment Architecture

```
┌─────────────────┐
│   Vercel        │  Frontend (Next.js)
│   Port: 443     │  https://plots-dekho.vercel.app
└────────┬────────┘
         │
         │ API Calls
         ▼
┌─────────────────┐
│   Railway       │  Backend (NestJS)
│   Port: 3001    │  https://your-app.railway.app
└────────┬────────┘
         │
         │ Database Queries
         ▼
┌─────────────────┐
│   PostgreSQL    │  Database
│   Railway/Neon  │  postgres://...
└─────────────────┘
```

---

## 🎯 Option 1: Railway (Recommended - All-in-One)

Railway provides free PostgreSQL + Node.js hosting in one place.

### Step 1: Prepare the Backend

1. **Add production scripts to backend/package.json**:

```bash
cd /Users/abhimanyu.kumbhar/plots-dekho/backend
```

Add these scripts if not present:
```json
"scripts": {
  "build": "nest build",
  "start:prod": "node dist/main",
  "prisma:generate": "prisma generate",
  "prisma:deploy": "prisma migrate deploy"
}
```

2. **Create Procfile for Railway** (optional):

Create `backend/Procfile`:
```
web: npm run start:prod
```

3. **Update main.ts for production**:

Ensure CORS is configured for production in `backend/src/main.ts`:
```typescript
app.enableCors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
});
```

### Step 2: Deploy Database & Backend on Railway

1. **Create Railway Account**:
   - Go to https://railway.app
   - Sign up with GitHub (free)

2. **Create New Project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select your repository

3. **Add PostgreSQL Database**:
   - In your project, click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway will create a database automatically
   - Copy the `DATABASE_URL` from "Connect" tab

4. **Configure Backend Service**:
   - Click "+ New" → "GitHub Repo"
   - Select your repository
   - Railway will detect it's a Node.js app
   - Click on the service → "Settings"

5. **Set Environment Variables**:
   - Go to "Variables" tab
   - Add these variables:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app
```

6. **Configure Build Settings**:
   - Go to "Settings" tab
   - **Root Directory**: `/backend`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm run start:prod`
   - **Watch Paths**: `/backend/**`

7. **Generate Domain**:
   - Go to "Settings" → "Networking"
   - Click "Generate Domain"
   - Copy the URL (e.g., `https://plots-dekho-backend.railway.app`)

8. **Deploy**:
   - Railway will automatically deploy
   - Check "Deployments" tab for build logs
   - Wait for "Success" status

### Step 3: Deploy Frontend on Vercel

1. **Update Frontend Environment**:

Create `frontend/.env.production`:
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
NEXT_PUBLIC_APP_NAME=Plots Dekho
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

2. **Create Vercel Account**:
   - Go to https://vercel.com
   - Sign up with GitHub (free)

3. **Import Project**:
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Vercel will detect it's a Next.js app

4. **Configure Project**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)

5. **Add Environment Variables**:
   - In "Environment Variables" section, add:

```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
NEXT_PUBLIC_APP_NAME=Plots Dekho
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

6. **Deploy**:
   - Click "Deploy"
   - Wait for build to complete
   - Get your URL (e.g., `https://plots-dekho.vercel.app`)

7. **Update Backend CORS**:
   - Go back to Railway
   - Update `FRONTEND_URL` environment variable with your Vercel URL
   - Redeploy backend

---

## 🎯 Option 2: Render + Neon (Alternative)

Free PostgreSQL on Neon + Backend/Frontend on Render.

### Step 1: Deploy Database on Neon

1. **Create Neon Account**:
   - Go to https://neon.tech
   - Sign up (free tier available)

2. **Create Database**:
   - Click "Create Project"
   - Name: `plots-dekho-db`
   - Region: Choose closest to you
   - Click "Create Project"

3. **Get Connection String**:
   - Copy the connection string
   - Format: `postgresql://user:pass@host/dbname?sslmode=require`

### Step 2: Deploy Backend on Render

1. **Create Render Account**:
   - Go to https://render.com
   - Sign up with GitHub

2. **Create Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Name: `plots-dekho-backend`

3. **Configure Service**:
   - **Environment**: Node
   - **Region**: Oregon (free)
   - **Branch**: main
   - **Root Directory**: `backend`
   - **Build Command**:
   ```bash
   npm install && npx prisma generate && npm run build
   ```
   - **Start Command**:
   ```bash
   npx prisma migrate deploy && npm run start:prod
   ```

4. **Add Environment Variables**:
```env
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require
JWT_SECRET=your-super-secret-jwt-key
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-app.onrender.com
```

5. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment
   - Get your URL: `https://plots-dekho-backend.onrender.com`

### Step 3: Deploy Frontend on Render

1. **Create Static Site**:
   - Click "New +" → "Static Site"
   - Connect repository
   - Name: `plots-dekho-frontend`

2. **Configure**:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `frontend/.next`

3. **Add Environment Variables**:
```env
NEXT_PUBLIC_API_URL=https://plots-dekho-backend.onrender.com/api/v1
NEXT_PUBLIC_APP_NAME=Plots Dekho
```

4. **Deploy**:
   - Click "Create Static Site"
   - Get URL: `https://plots-dekho.onrender.com`

---

## 🎯 Option 3: Vercel for Everything (Serverless)

Deploy both frontend and backend on Vercel (requires Vercel Serverless functions).

⚠️ **Note**: This requires converting NestJS to serverless functions, which is more complex.

### Recommended: Use Railway/Render for Backend + Vercel for Frontend

---

## 📝 Pre-Deployment Checklist

### Backend Preparation

- [ ] Add production scripts to `package.json`
- [ ] Configure CORS for production domain
- [ ] Set strong JWT secret
- [ ] Test Prisma migrations locally
- [ ] Verify all environment variables
- [ ] Update `.gitignore` (don't commit `.env`)

### Frontend Preparation

- [ ] Update API URL to production backend
- [ ] Test build locally: `npm run build`
- [ ] Verify environment variables
- [ ] Update any hardcoded localhost URLs
- [ ] Test production build: `npm start`

### Database Preparation

- [ ] Backup local database (optional)
- [ ] Run migrations on production DB
- [ ] Seed initial data if needed
- [ ] Verify database connection

---

## 🔧 Essential Files to Create/Update

### 1. Backend: Add to package.json

```json
{
  "scripts": {
    "build": "nest build",
    "start:prod": "node dist/main",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate deploy"
  },
  "engines": {
    "node": ">=18.0.0",
    "npm": ">=9.0.0"
  }
}
```

### 2. Backend: Create .env.production

```env
DATABASE_URL=postgresql://...
JWT_SECRET=super-secret-key-min-32-chars
JWT_ACCESS_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
```

### 3. Frontend: Create .env.production

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app/api/v1
NEXT_PUBLIC_APP_NAME=Plots Dekho
NEXT_PUBLIC_APP_URL=https://your-frontend-url.vercel.app
```

### 4. Backend: Update main.ts

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS - Update for production
  app.enableCors({
    origin: process.env.FRONTEND_URL || '*',
    credentials: true,
  });

  // Validation
  app.useGlobalPipes(new ValidationPipe());

  // Port from environment or default
  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Application running on: http://localhost:${port}/api/v1`);
}
bootstrap();
```

### 5. Root: Create .gitignore updates

```
# Environment
.env
.env.local
.env.production
.env.*.local

# Dependencies
node_modules/

# Build outputs
dist/
.next/
out/

# Database
*.db
*.db-journal

# Logs
*.log
```

---

## 🚀 Step-by-Step Deployment (Railway + Vercel)

### Phase 1: Prepare Code

```bash
# 1. Navigate to project
cd /Users/abhimanyu.kumbhar/plots-dekho

# 2. Update backend package.json with production scripts
# (add engines and scripts as shown above)

# 3. Create production env files
touch backend/.env.production
touch frontend/.env.production

# 4. Test backend build
cd backend
npm run build

# 5. Test frontend build
cd ../frontend
npm run build

# 6. Commit changes
cd ..
git add .
git commit -m "chore: prepare for production deployment"
git push origin main
```

### Phase 2: Deploy Database & Backend (Railway)

```bash
# 1. Go to https://railway.app
# 2. Sign up with GitHub
# 3. Create new project from GitHub repo
# 4. Add PostgreSQL database
# 5. Configure backend service:
#    - Root: /backend
#    - Build: npm install && npx prisma generate && npm run build
#    - Start: npx prisma migrate deploy && npm run start:prod
# 6. Add environment variables (see above)
# 7. Deploy and get URL
```

### Phase 3: Deploy Frontend (Vercel)

```bash
# 1. Go to https://vercel.com
# 2. Sign up with GitHub
# 3. Import project
# 4. Configure:
#    - Root: frontend
#    - Framework: Next.js
# 5. Add environment variables with Railway backend URL
# 6. Deploy
# 7. Get Vercel URL
```

### Phase 4: Update CORS

```bash
# 1. Go back to Railway
# 2. Update FRONTEND_URL env var with Vercel URL
# 3. Redeploy backend
# 4. Test the application
```

---

## ✅ Post-Deployment Testing

1. **Test Backend API**:
```bash
curl https://your-backend.railway.app/api/v1/auth/me
```

2. **Test Frontend**:
   - Visit: https://your-app.vercel.app
   - Test login/register
   - Test property browsing
   - Test creating a property

3. **Check Logs**:
   - Railway: Check deployment logs
   - Vercel: Check function logs
   - Look for errors

---

## 🐛 Common Issues & Solutions

### Issue 1: Database Connection Failed
**Solution**:
- Verify DATABASE_URL is correct
- Ensure it includes `?sslmode=require` for cloud databases
- Check Prisma schema matches database

### Issue 2: CORS Errors
**Solution**:
- Update FRONTEND_URL in backend env vars
- Ensure origin in main.ts includes your Vercel domain
- Redeploy backend after changes

### Issue 3: Build Failed on Railway
**Solution**:
- Check build logs for errors
- Verify `prisma generate` runs before build
- Ensure all dependencies are in package.json
- Check Node version compatibility

### Issue 4: Vercel Build Failed
**Solution**:
- Verify root directory is set to `frontend`
- Check all environment variables are set
- Ensure no localhost URLs in code
- Verify Next.js build succeeds locally

### Issue 5: API Calls Return 404
**Solution**:
- Verify NEXT_PUBLIC_API_URL includes `/api/v1`
- Check backend is running on Railway
- Test API directly with curl

---

## 💰 Free Tier Limits

### Railway
- **Free Tier**: $5/month usage credit
- **Database**: 100MB storage
- **Usage**: ~500 hours/month
- **Note**: May sleep after inactivity

### Vercel
- **Free Tier**: Unlimited deployments
- **Bandwidth**: 100GB/month
- **Build Time**: 6000 minutes/month
- **No sleep**: Always active

### Neon
- **Free Tier**: 1 project
- **Storage**: 512MB
- **Compute**: Scales to zero when inactive
- **No sleep delay**: Instant wake-up

### Render
- **Free Tier**: 750 hours/month
- **Sleep**: After 15 min inactivity
- **Wake-up**: 30-60 seconds
- **Database**: 90 days retention

---

## 🔐 Security Checklist

- [ ] Change default JWT_SECRET to strong random string
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS only (automatic on Railway/Vercel)
- [ ] Set secure CORS origins (no wildcards in production)
- [ ] Verify database uses SSL (sslmode=require)
- [ ] Don't commit .env files
- [ ] Rotate secrets regularly
- [ ] Monitor for unusual activity

---

## 📊 Monitoring & Maintenance

### Railway Dashboard
- Monitor CPU/Memory usage
- Check deployment logs
- View database metrics
- Set up alerts

### Vercel Dashboard
- Monitor function invocations
- Check bandwidth usage
- View deployment logs
- Analytics (optional upgrade)

### Database Health
- Monitor connection pool usage
- Check query performance
- Set up automated backups
- Monitor storage usage

---

## 🎉 Success Checklist

After deployment, verify:

- [ ] Frontend loads at Vercel URL
- [ ] Backend API responds at Railway URL
- [ ] Database connection works
- [ ] User can register/login
- [ ] Properties can be created
- [ ] Properties can be viewed
- [ ] Images load correctly
- [ ] Favorites work
- [ ] Leads/inquiries work
- [ ] No CORS errors in console
- [ ] No 404 errors
- [ ] SSL certificate active (https)
- [ ] Mobile responsive design works

---

## 🔄 CI/CD (Automatic Deployments)

Both Railway and Vercel support automatic deployments:

1. **Push to GitHub** → Auto-deploy to Railway/Vercel
2. **Pull Request** → Preview deployment
3. **Merge to Main** → Production deployment

No additional setup needed!

---

## 📚 Useful Commands

### Railway CLI (optional)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# View logs
railway logs

# Run migrations
railway run npx prisma migrate deploy
```

### Vercel CLI (optional)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# View logs
vercel logs
```

---

## 🎯 Next Steps After Deployment

1. **Custom Domain** (optional):
   - Railway: Add custom domain in settings
   - Vercel: Add custom domain in settings
   - Update DNS records

2. **Database Backups**:
   - Enable automated backups on Railway
   - Or use `pg_dump` for manual backups

3. **Monitoring**:
   - Set up error tracking (Sentry)
   - Add analytics (Vercel Analytics)
   - Monitor uptime (UptimeRobot)

4. **Performance**:
   - Add caching headers
   - Optimize images
   - Enable Vercel Image Optimization

---

## 💡 Pro Tips

1. **Environment Variables**: Keep them in a password manager
2. **Staging Environment**: Create separate Railway project for testing
3. **Database Migrations**: Always test migrations locally first
4. **Git Workflow**: Use feature branches → PR → deploy
5. **Logs**: Regularly check logs for errors
6. **Secrets Rotation**: Change JWT_SECRET periodically
7. **Backup**: Keep database backups before major updates

---

## 📞 Support Resources

- Railway Docs: https://docs.railway.app
- Vercel Docs: https://vercel.com/docs
- Neon Docs: https://neon.tech/docs
- Render Docs: https://render.com/docs
- Prisma Docs: https://www.prisma.io/docs

---

**Deployment Status**: Ready to Deploy! 🚀

Choose your preferred option and follow the steps. Railway + Vercel is recommended for simplicity.
