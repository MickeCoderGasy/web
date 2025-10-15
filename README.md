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

## Project info

**URL**: https://lovable.dev/projects/c205e2d1-db14-4bbe-9c13-efb2e73b7ae2

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/c205e2d1-db14-4bbe-9c13-efb2e73b7ae2) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Create a .env file with your Supabase credentials
# VITE_SUPABASE_URL=your_supabase_url
# VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key

# Step 4: Install the necessary dependencies.
npm i

# Step 5: Start the development server with auto-reloading and an instant preview.
npm run dev
```

> ⚠️ **Important**: Make sure to configure your Supabase credentials before running the app. See [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md) for detailed instructions.

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

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

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/c205e2d1-db14-4bbe-9c13-efb2e73b7ae2) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
