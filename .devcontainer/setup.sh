#!/bin/bash
echo "🚀 Setting up ndeip-app development environment..."

# Install dependencies
echo "📦 Installing npm dependencies..."
npm install

# Show helpful info
echo ""
echo "════════════════════════════════════════════════════════"
echo "  ✅  ndeip-app is ready!"
echo "════════════════════════════════════════════════════════"
echo ""
echo "  Quick start commands:"
echo "    npx expo start --web     → Run in browser"
echo "    npx expo start           → Run with Expo Go"
echo "    npm test                 → Run tests"
echo ""
echo "  Project structure:"
echo "    app/          → Screens & navigation"
echo "    components/   → Reusable UI components"
echo "    constants/    → Colors & brand system"
echo "    contexts/     → Auth & state management"
echo "    backend/      → Server-side code"
echo "    database/     → DB schemas & migrations"
echo ""
echo "════════════════════════════════════════════════════════"
