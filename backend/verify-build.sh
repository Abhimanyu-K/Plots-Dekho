#!/bin/bash

echo "🔍 Verifying Backend Build for Production..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "💡 Copy .env.example to .env and update values"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate

# Build
echo "🏗️  Building..."
npm run build

# Check if build was successful
if [ -d "dist" ]; then
    echo "✅ Build successful!"
    echo ""
    echo "📊 Build output:"
    ls -lh dist/
    echo ""
    echo "✨ Ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Push code to GitHub"
    echo "2. Deploy on Railway/Render"
    echo "3. Set environment variables"
    echo "4. Deploy frontend on Vercel"
else
    echo "❌ Build failed!"
    exit 1
fi
