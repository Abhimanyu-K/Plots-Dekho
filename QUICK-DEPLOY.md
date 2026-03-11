# 🚀 Quick Deployment Guide

## ⚡ TL;DR - Deploy in 15 Minutes

### Step 1: Push to GitHub (if not already)
```bash
git add .
git commit -m "chore: prepare for deployment"
git push origin main
```

### Step 2: Deploy Backend on Railway

1. Go to https://railway.app → Sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository
4. Click "+ New" → "Database" → "PostgreSQL"
5. Click on backend service → "Settings":
   - **Root Directory**: `/backend`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npx prisma migrate deploy && npm run start:prod`
6. Add environment variables in "Variables" tab:
   ```
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=your-random-32-char-secret-key
   JWT_ACCESS_EXPIRATION=15m
   JWT_REFRESH_EXPIRATION=7d
   NODE_ENV=production
   PORT=3001
   CORS_ORIGIN=https://your-app.vercel.app
   ```
7. Generate domain: Settings → Networking → "Generate Domain"
8. Copy the URL (e.g., `https://plots-dekho-backend.railway.app`)

### Step 3: Deploy Frontend on Vercel

1. Go to https://vercel.com → Sign up with GitHub
2. Click "Add New" → "Project"
3. Import your repository
4. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Next.js
5. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api/v1
   NEXT_PUBLIC_APP_NAME=Plots Dekho
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```
6. Click "Deploy"
7. Copy your Vercel URL

### Step 4: Update CORS

1. Go back to Railway backend
2. Update `CORS_ORIGIN` variable with your Vercel URL
3. Redeploy

### Step 5: Test! 🎉

Visit your Vercel URL and test the application!

---

## 📝 Pre-Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Database on Railway/Neon created
- [ ] Backend deployed on Railway
- [ ] Environment variables set correctly
- [ ] Frontend deployed on Vercel
- [ ] CORS updated with frontend URL
- [ ] Test login/register
- [ ] Test property creation
- [ ] Test all features

---

## 🔑 Generate Strong JWT Secret

```bash
# Option 1: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Option 2: Using OpenSSL
openssl rand -hex 32

# Option 3: Online
# Visit: https://generate-secret.vercel.app/32
```

---

## 🐛 Troubleshooting

### Backend won't start
- Check Railway logs for errors
- Verify DATABASE_URL is set
- Ensure Prisma migrations ran

### Frontend can't connect to API
- Verify NEXT_PUBLIC_API_URL is correct
- Check CORS_ORIGIN includes frontend URL
- Test API directly: `curl https://your-backend.railway.app/api/v1`

### Database connection failed
- Ensure DATABASE_URL includes `?sslmode=require`
- Check database is running on Railway
- Verify Prisma schema matches database

---

## 📚 Full Documentation

See `DEPLOYMENT-GUIDE.md` for detailed instructions, alternatives, and troubleshooting.

---

**Status**: Ready to Deploy! 🚀
**Estimated Time**: 15-20 minutes
**Cost**: $0 (Free tier)
