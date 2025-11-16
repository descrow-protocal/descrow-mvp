#!/bin/bash
echo "🚀 Starting Descrow MVP..."

# Kill any process on port 3000
fuser -k 3000/tcp 2>/dev/null || lsof -ti:3000 | xargs kill -9 2>/dev/null

# Start PostgreSQL with Docker
echo "📦 Starting PostgreSQL..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for database..."
sleep 3

# Start backend and frontend
echo "✅ Starting services..."
npm run dev
