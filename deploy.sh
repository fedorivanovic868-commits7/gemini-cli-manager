#!/bin/bash

# GitHub deployment script for Gemini CLI Manager

echo "🚀 Preparing for GitHub deployment..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing Git repository..."
    git init
fi

# Add all files
echo "📁 Adding files to Git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Initial commit: Gemini CLI Manager - Complete application with sessions and translations management"

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "🔗 Please add your GitHub repository URL:"
    echo "git remote add origin https://github.com/yourusername/gemini-cli-manager.git"
    echo ""
    echo "Then run:"
    echo "git branch -M main"
    echo "git push -u origin main"
else
    echo "📤 Pushing to GitHub..."
    git branch -M main
    git push -u origin main
fi

echo "✅ Deployment preparation complete!"
echo ""
echo "📋 Next steps for Vercel deployment:"
echo "1. Go to vercel.com and import your GitHub repository"
echo "2. Add the following environment variables in Vercel:"
echo "   - POSTGRES_URL (from Vercel Postgres)"
echo "   - POSTGRES_PRISMA_URL (from Vercel Postgres)"
echo "   - POSTGRES_URL_NO_SSL (from Vercel Postgres)"
echo "   - POSTGRES_URL_NON_POOLING (from Vercel Postgres)"
echo "   - POSTGRES_USER (from Vercel Postgres)"
echo "   - POSTGRES_HOST (from Vercel Postgres)"
echo "   - POSTGRES_PASSWORD (from Vercel Postgres)"
echo "   - POSTGRES_DATABASE (from Vercel Postgres)"
echo "   - APP_PASSWORD (your login password)"
echo "   - NEXTAUTH_SECRET (generate a random secret)"
echo "   - NEXTAUTH_URL (your Vercel domain)"
echo "   - CRON_SECRET (generate a random secret for cron jobs)"
echo "3. Deploy and enjoy your Gemini CLI Manager!"