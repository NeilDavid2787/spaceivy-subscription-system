#!/bin/bash

# SpaceIvy CRM Startup Script
echo "🚀 Starting SpaceIvy CRM..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create backup directory if it doesn't exist
if [ ! -d "backups" ]; then
    mkdir backups
    echo "📁 Created backups directory"
fi

# Create a backup before starting
echo "💾 Creating backup..."
node database-utils.js backup "./backups/startup-backup-$(date +%Y%m%d-%H%M%S).db"

# Start the server
echo "🌟 Starting SpaceIvy CRM server..."
echo "📱 Access your CRM at: http://localhost:3000"
echo "🛑 Press Ctrl+C to stop the server"
echo ""

npm start
