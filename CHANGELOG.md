# Changelog

## [3.1.0] - 2025-10-14

### 🌓 Theme System (NEW)

#### Dark/Light Mode Support
- 🌓 Complete theme system with light, dark, and system modes
- 🎨 Adaptive UI that responds to user preferences
- 💾 Persistent theme selection via localStorage
- 🔄 Automatic system preference detection
- 🎯 Smooth transitions between themes

#### Theme Components
- 🎛️ ThemeToggle component with dropdown selection
- 🌞 Light mode with clean white backgrounds
- 🌙 Dark mode with dark backgrounds and high contrast
- 🖥️ System mode that follows OS preferences
- 🎨 CSS variables for consistent theming

#### Integration
- 📱 Theme toggle in navigation bar
- 🎨 All components support both themes
- 🔧 Tailwind CSS dark mode configuration
- 📚 Complete documentation in THEME_SYSTEM.md

#### Mobile Navigation Enhancements (NEW 📱)
- 🎨 **Optimized Layout**: Reduced padding and improved spacing
- ✨ **Smooth Animations**: Hover effects and scale transitions
- 🎯 **Visual Indicators**: Pulsing dot for active item
- 🌓 **Mobile Theme Toggle**: Dedicated mobile variant
- 📱 **Responsive Design**: Perfect adaptation for small screens
- 🎭 **Custom CSS Classes**: Enhanced animations and interactions

## [3.0.0] - 2025-10-14

### 🎉 Major Updates - LLM Integration

#### LLM Analysis System (NEW 🚀)
- 🤖 Complete LLM integration for trading analysis
- 💬 AI Chat with stock symbol detection and analysis
- 📊 Comprehensive forex analysis workflow
- ⚡ Real-time job tracking via Supabase
- 🔄 Polling fallback mechanism
- 📈 Signal interpretation generation
- 🎯 Step-by-step progress tracking

#### AI Chat Component
- 💬 Interactive chat interface for quick analysis
- 🔍 Automatic stock symbol detection (AAPL, TSLA, EUR/USD, etc.)
- 📋 Expandable analysis cards with detailed metrics
- 🎨 Recommendation badges (BUY/SELL/HOLD)
- 📊 Key factors and risk assessment
- ⚠️ Risk level indicators
- 🎯 Target price and stop loss display

#### Analysis Workflow
- 🔧 Configuration panel for forex analysis
  - 8 major currency pairs (EUR/USD, USD/JPY, GBP/USD, USD/CHF, AUD/USD, USD/CAD, NZD/USD, XAU/USD)
  - Trading styles: Intraday, Swing
  - Risk levels: Basse, Moyenne, Haute
  - Gain objectives: Min, Moyen, Max
- 🔄 6-step analysis process:
  1. Security verification
  2. OHLC data retrieval
  3. Price action analysis
  4. Technical indicators calculation
  5. Signal generation
  6. Final processing
- 📊 Real-time progress updates
- 📝 Human-readable signal interpretation
- 📈 Full analysis results with market context

#### Analysis History (NEW ✨)
- 📚 **Complete History View**: All past forex analyses in chronological order
- 🎯 **Status Tracking**: Visual badges for completed, failed, in-progress, and pending analyses
- 📊 **Signal Display**: BUY/SELL signals with color-coded indicators
- 📅 **Date Formatting**: French locale with calendar and clock icons
- 🔍 **Detail View**: Click any analysis to see full results using AnalysisResults component
- 🔄 **Real-time Updates**: Automatic refresh and error recovery
- 📱 **Mobile Parity**: Identical to mobile version with same webhook and data structure

#### New Services
- **LLM Service** (`services/llmService.ts`)
  - Stock analysis endpoint
  - General trading chat
  - Structured response format
- **Maestro Service** (`services/maestroService.ts`)
  - Analysis job initiation
  - Supabase Realtime integration
  - Job status polling
  - Signal interpretation fetching
  - Markdown-to-HTML conversion
- **History Service** (`services/historyService.ts`) (NEW ✨)
  - Analysis history fetching
  - JWT authentication
  - Data mapping and formatting
  - Error handling and logging

#### Webhooks Integration
- 🌐 n8n Maestro webhook: `https://n8n.qubextai.tech/webhook/maestro`
- 💬 LLM Chat webhook: `https://n8n.qubextai.tech/webhook/llm-chat`
- 📊 Job Result webhook: `https://n8n.qubextai.tech/webhook/result`
- 📚 History Logs webhook: `https://n8n.qubextai.tech/webhook/logs` (NEW ✨)

### 📁 New Files Created

#### Services
- `src/services/llmService.ts` - LLM chat and stock analysis
- `src/services/maestroService.ts` - Maestro workflow orchestration
- `src/services/historyService.ts` - Analysis history management (NEW ✨)

#### Documentation
- `LLM_INTEGRATION.md` - Complete LLM integration guide
- `HISTORY_INTEGRATION.md` - Analysis history feature guide (NEW ✨)

### 🔧 Updated Components

#### Chat Page (`pages/Chat.tsx`)
- Three-tab interface (Chat AI + Analyse + Historique) (NEW ✨)
- Real-time job status updates
- Supabase Realtime subscription
- Polling fallback mechanism
- Signal interpretation display
- Error handling and toast notifications

#### New Components
- `components/History.tsx` - Analysis history display (NEW ✨)
- `pages/History.tsx` - Dedicated history page (NEW ✨)

### 🎨 UI/UX Improvements
- Step-by-step loading indicators
- Color-coded status badges
- Expandable analysis cards
- Markdown rendering in chat
- Responsive design for all components
- Smooth animations and transitions

## [2.0.0] - 2025-10-14

### 🎉 Major Updates

#### Authentication System
- ✨ Added complete authentication system with Supabase
- 🔐 Email/Password authentication
- 🔑 Google OAuth integration
- 🛡️ Protected routes with automatic redirect
- 👤 User session management with localStorage persistence
- 🚪 Sign out functionality with user menu

#### Dashboard Enhancements
- 📊 Added Quick Stats section with 4 key metrics:
  - Monthly Return
  - Total Return  
  - Risk Score
  - Holdings Count
- 💼 Portfolio Holdings with detailed breakdown
- 📈 Top Gainers section showing best performing stocks
- 📉 Top Losers section showing worst performing stocks
- 🤖 **AI Market Insights** with dynamic pair selection (NEW ✨)
- 📰 **Real-Time Market News** with sentiment analysis (10 items, scrollable)
- ⏰ Recent Activity showing transaction history
- 📑 Expanded Watchlist from 4 to 6 stocks

#### AI Market Insights Service (NEW ✨)
- 🗄️ Fetches data from Supabase database (`news_and_events` table)
- ⏰ Auto-refreshed database every hour
- 🔄 Dynamic currency pair selection (8 major pairs including XAU/USD Gold)
- 📊 Comprehensive market analysis including:
  - Key synthesis and sentiment
  - Economic events calendar (48h)
  - Recent news analysis (24h)
  - Actionable trading insights
- 📝 Markdown formatting support
- 📜 Scrollable content (600px max height)
- 🎯 Always fetches latest insight per pair
- 💾 Graceful error handling

#### Market News Service
- 🌐 Integration with n8n webhook for real-time news
- 📰 Displays all 10 news items
- 📜 Scrollable section (500px max height)
- 🎯 Sentiment analysis (Positive/Negative/Neutral)
- 🏷️ Automatic source extraction
- ⏱️ Relative time formatting (e.g., "2h ago")
- 🔄 Auto-refresh every 5 minutes
- 🔐 JWT token authentication sent in request body
- 💾 Graceful fallback to default news on error

#### Navigation Updates
- 👤 User avatar with dropdown menu
- 📧 Display user email
- 🚪 Logout button in desktop navigation
- 📱 Logout button in mobile bottom navigation
- ✨ Smooth transitions and hover effects

#### New Pages
- 🔐 `/auth` - Beautiful authentication page with tabs for sign in/sign up
- 🏠 Protected dashboard at `/`
- 💬 Protected chat at `/chat`

### 📁 New Files Created

#### Contexts
- `src/contexts/AuthContext.tsx` - Authentication state management

#### Services  
- `src/services/aiInsightService.ts` - AI market insights integration (NEW ✨)
- `src/services/newsService.ts` - Market news API integration

#### Pages
- `src/pages/Auth.tsx` - Login/Signup page

#### Documentation
- `AUTHENTICATION_SETUP.md` - Complete setup guide
- `CHANGELOG.md` - This file

### 🎨 Design Consistency

All new features maintain the existing design system:
- **Primary Color**: Violet (#7b3ff2)
- **Glass Card Effect**: Backdrop blur with transparency
- **Smooth Animations**: Fade-in and transitions
- **Responsive Design**: Mobile-first approach
- **Dark Theme**: Consistent with brand identity

### 🔧 Technical Improvements

- TypeScript interfaces for type safety
- Error handling for API calls
- Loading states for better UX
- Automatic token management
- Session persistence
- Route protection
- Responsive layouts

### 📱 Mobile Support

- Bottom navigation with logout button
- Responsive grid layouts
- Touch-friendly interactions
- Mobile-optimized forms

### 🚀 Performance

- News caching to reduce API calls
- Auto-refresh with configurable interval
- Lazy loading of components
- Optimized re-renders with React hooks

### 🛠️ Developer Experience

- Clear folder structure
- Type-safe code
- Comprehensive documentation
- No linter errors
- Consistent code style

## Configuration Required

To use these new features, you need to:

1. Create a `.env` file with Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

2. Configure Google OAuth in Supabase (optional)

3. Ensure the news webhook is accessible: `https://n8n.qubextai.tech/webhook/Rss`

See [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md) for detailed instructions.

## Breaking Changes

⚠️ **Authentication Required**: The dashboard and chat pages now require authentication. Users will be redirected to `/auth` if not logged in.

## Migration Guide

If you're upgrading from a previous version:

1. Install any new dependencies: `npm install`
2. Add environment variables to `.env`
3. Users will need to create accounts or sign in
4. Previous session data is not migrated

## What's Next?

Potential future improvements:
- Real-time updates with WebSocket
- More chart visualizations
- Trading execution integration
- Portfolio analytics
- User preferences and settings
- Dark/Light theme toggle
- Multi-language support

