# Qubext - AI-Powered Trading Platform (Web)

This is the web version of the TradApp mobile application, providing a comprehensive trading dashboard with AI-powered insights and real-time market data.

## 🚀 Features

### Core Features
- 🔐 **Authentication System**: Email/Password and Google OAuth with session persistence
- 📊 **Enhanced Dashboard**: Portfolio overview, holdings, and performance metrics
- 🎨 **Modern UI**: Glassmorphism design with adaptive theme system
- 🌓 **Dark/Light Mode**: Complete theme system with system preference detection
- 📱 **Responsive**: Works seamlessly on desktop and mobile

### AI-Powered Analysis (NEW 🚀)
- 🤖 **AI Chat Assistant**: Quick stock and forex analysis with symbol detection
- 📊 **Comprehensive Forex Analysis**: Multi-step workflow with real-time tracking
- ⚡ **Real-time Job Updates**: Supabase Realtime + polling fallback
- 📈 **Signal Interpretation**: Human-readable market insights
- 🎯 **6-Step Analysis Process**: From security checks to final signal generation
- 💬 **Interactive Chat**: Ask about stocks, strategies, and get detailed analysis
- 📚 **Analysis History**: Complete history of all forex analyses (NEW ✨)

### Market Intelligence
- 🤖 **AI Market Insights**: Dynamic analysis for 8 major pairs including Gold
- 📰 **Real-Time Market News**: Live news feed with sentiment analysis (10 items)
- 💡 **Comprehensive Analysis**: Economic events, news analysis, and trading recommendations
- 📈 **Portfolio Tracking**: Monitor your investments with detailed analytics


## What technologies are used for this project?

This project is built with:

### Frontend
- **Vite** - Fast build tool and dev server
- **TypeScript** - Type-safe JavaScript
- **React** - UI library with hooks
- **shadcn-ui** - Beautiful UI components
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **TanStack Query** - Data fetching and caching

### Backend & Services
- **Supabase** - Authentication, database, and real-time subscriptions
- **n8n Webhooks** - LLM analysis and workflow orchestration
  - Maestro webhook for forex analysis
  - LLM Chat webhook for quick stock analysis
  - Job Result webhook for signal interpretation
- **Lucide React** - Modern icon library

## 📚 Documentation

- [LLM Integration](./LLM_INTEGRATION.md) - Complete guide for LLM analysis and Maestro workflow (NEW 🚀)
- [History Integration](./HISTORY_INTEGRATION.md) - Analysis history feature guide (NEW ✨)
- [Theme System](./THEME_SYSTEM.md) - Dark/Light mode system guide (NEW 🌓)
- [Mobile Navigation](./MOBILE_NAVIGATION.md) - Enhanced mobile menu with animations (NEW 📱)
- [Authentication Setup](./AUTHENTICATION_SETUP.md) - Complete guide for authentication and news service
- [Troubleshooting](./TROUBLESHOOTING.md) - Common issues and solutions
- [SQL Setup](./SQL_SETUP.md) - Database setup for AI insights
- [Changelog](./CHANGELOG.md) - Version history and updates
- [Design System](./src/index.css) - Color palette and design tokens
- [Components](./src/components/) - Reusable UI components

## 🎨 Design System

The application uses a consistent design system with:
- **Primary Color**: Violet (#7b3ff2)
- **Success Color**: Green (for gains)
- **Destructive Color**: Red (for losses)
- **Glass Card Effect**: Backdrop blur with transparency
- **Animations**: Smooth transitions and fade-in effects


