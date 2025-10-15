# LLM Analysis Integration - Web Version

This document describes the LLM analysis integration in the web version of TradApp, which mirrors the mobile version's functionality.

## Overview

The web version now uses the **n8n Maestro webhook** for trading analysis instead of directly calling the Gemini API. This ensures consistency with the mobile version and leverages the same backend workflow infrastructure.

## Architecture

### Services

#### 1. **LLM Service** (`services/llmService.ts`)

Handles quick stock analysis and chat functionality for the AI Chat component.

**Endpoints:**
- `POST https://n8n.qubextai.tech/webhook/llm-chat`

**Features:**
- Stock symbol analysis
- General trading chat
- Returns structured analysis data (recommendation, confidence, risk level, etc.)

**Request Format:**
```typescript
{
  symbol: "AAPL",      // Stock symbol
  message: "string"    // User message
}
```

**Response Format:**
```typescript
{
  symbol: string;
  recommendation: "BUY" | "SELL" | "HOLD";
  confidence: number;
  riskLevel: string;
  timeframe: string;
  targetPrice: number | string;
  stopLoss: number | string;
  analysis: string;
  keyFactors: string[];
}
```

#### 2. **Maestro Service** (`services/maestroService.ts`)

Handles comprehensive forex trading analysis with real-time job tracking.

**Endpoints:**
- `POST https://n8n.qubextai.tech/webhook/maestro` - Start analysis
- `POST https://n8n.qubextai.tech/webhook/result` - Get signal interpretation

**Features:**
- Forex pair analysis (EUR/USD, USD/JPY, GBP/USD, etc.)
- Real-time job status updates via Supabase
- Polling fallback mechanism
- Signal interpretation generation
- Step-by-step progress tracking

**Request Format (Start Analysis):**
```typescript
{
  pair: ForexPair;          // e.g., "EUR/USD"
  style: TradingStyle;      // "intraday" | "swing"
  risk: RiskLevel;          // "basse" | "moyenne" | "Haut"
  gain: GainLevel;          // "min" | "moyen" | "Max"
  time: string;             // ISO timestamp
  accessToken: string;      // JWT from Supabase session
}
```

**Response Format:**
```typescript
{
  jobId: string;  // UUID for tracking the analysis job
}
```

### Components

#### 1. **AIChat** (`components/AIChat.tsx`)

- Interactive chat interface for quick stock/forex analysis
- Detects stock symbols (e.g., AAPL, TSLA) vs. general questions
- Displays detailed analysis in expandable cards
- Shows recommendation badges (BUY/SELL/HOLD)
- Key factors and risk metrics

#### 2. **Chat Page** (`pages/Chat.tsx`)

Contains two tabs:

**Tab 1: Chat AI**
- Uses `AIChat` component
- Quick stock analysis
- General trading questions

**Tab 2: Analyse**
- Comprehensive forex analysis
- Configuration panel for pair, style, risk, and gain
- Real-time progress tracking with steps
- Signal interpretation display
- Full analysis results

### Data Flow

```
User selects configuration → AnalysisConfig component
                           ↓
                 Calls maestroService.startAnalysis()
                           ↓
        n8n Maestro webhook creates job → Returns jobId
                           ↓
        Job status written to Supabase (workflow_jobs table)
                           ↓
        Real-time updates via Supabase Realtime + Polling fallback
                           ↓
                 Chat component updates steps UI
                           ↓
        Job completes → Fetch signal interpretation
                           ↓
           Display results + interpretation to user
```

## Supabase Integration

### Table: `workflow_jobs`

Tracks the status of analysis jobs.

**Schema:**
- `job_id` (string): Unique job identifier
- `overall_status` (string): "pending" | "in_progress" | "completed" | "failed"
- `steps_status` (object): Status of each analysis step
- `final_result` (object): Analysis result data
- `error_message` (string): Error message if job failed

### Real-time Updates

The Chat component subscribes to Supabase Realtime channels to receive live updates on job progress:

```typescript
supabase
  .channel(`job_updates_${jobId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'workflow_jobs',
    filter: `job_id=eq.${jobId}`
  }, (payload) => {
    // Update UI with new job status
  })
  .subscribe();
```

### Polling Fallback

In case Realtime doesn't work or is slow, a polling mechanism runs every 3 seconds to fetch the job status directly from Supabase.

## Analysis Steps

The analysis workflow consists of 6 main steps:

1. **Vérification de sécurité** - Security and validation checks
2. **Récupération des données OHLC** - Fetch market data (OHLC)
3. **Analyse Price Action** - Price action analysis
4. **Calcul des Indicateurs** - Technical indicators calculation
5. **Génération du Signal** - Signal generation (BUY/SELL/NO SIGNAL)
6. **Traitement final** - Final processing and result compilation

Each step has a status:
- `idle` - Waiting to start
- `pending` - Queued
- `loading` - Currently processing
- `completed` - Successfully completed
- `failed` - Error occurred

## Signal Interpretation

After the analysis is complete, the system fetches a human-readable interpretation of the signal using the `getSignalInterpretation` method. This interpretation is generated from the raw analysis data and includes:

- Market session and data freshness
- Confluence score
- Signal details (entry, stop loss, take profit)
- Fundamental context
- Risk warnings and market alerts

The interpretation supports markdown formatting and is displayed in a dedicated card above the analysis results.

## Error Handling

### Authentication Errors
- If the user is not logged in, `maestroService.startAnalysis()` will throw an error
- The error is caught and displayed via a toast notification

### Network Errors
- Failed webhook calls are logged to the console
- User receives a user-friendly error message
- Steps are marked as "failed" in the UI

### Job Failures
- If the n8n workflow fails, the job status is updated to "failed"
- Error message from the backend is displayed to the user
- Analysis can be retried

## Testing

### Prerequisites
1. Valid Supabase credentials in `.env`
2. Active Supabase session (logged in user)
3. n8n Maestro webhook accessible at `https://n8n.qubextai.tech/webhook/maestro`

### Test Scenarios

#### Chat AI (Quick Analysis)
1. Enter a stock symbol (e.g., "AAPL")
2. Should receive a structured analysis with recommendation
3. Click "Voir l'analyse détaillée" to expand the card

#### Forex Analysis (Full Workflow)
1. Select a forex pair (e.g., EUR/USD)
2. Choose trading style (intraday or swing)
3. Set risk level and gain objective
4. Click "Lancer l'Analyse"
5. Watch real-time progress of each step
6. View signal interpretation and full results when complete

## Differences from Mobile Version

| Feature | Mobile (React Native) | Web (React) |
|---------|----------------------|-------------|
| **Auth** | Supabase (same) | Supabase (same) |
| **LLM Service** | Gemini API (direct) | n8n LLM webhook |
| **Maestro** | n8n webhook (same) | n8n webhook (same) |
| **Real-time** | Supabase Realtime + Polling | Supabase Realtime + Polling |
| **UI Library** | React Native components | shadcn-ui |
| **Styling** | BlurView, LinearGradient | Tailwind CSS, Glassmorphism |

## Environment Variables

Required in `.env`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

The webhook URLs are hardcoded in the service files:
- LLM Chat: `https://n8n.qubextai.tech/webhook/llm-chat`
- Maestro: `https://n8n.qubextai.tech/webhook/maestro`
- Job Result: `https://n8n.qubextai.tech/webhook/result`

## Future Improvements

1. **Streaming Support**: Add SSE/WebSocket for real-time streaming of interpretation text
2. **Caching**: Cache recent analyses to reduce API calls
3. **History**: Save analysis history in Supabase for later review
4. **Notifications**: Push notifications when analysis completes
5. **Multi-language**: Support for English and other languages
6. **Advanced Charts**: Integrate TradingView or similar for visual analysis

## Troubleshooting

### Issue: Analysis doesn't start
- Check browser console for errors
- Verify user is logged in (check JWT token in localStorage)
- Test webhook manually with curl/Postman

### Issue: Steps not updating
- Check Supabase connection
- Verify Realtime is enabled in Supabase project settings
- Polling should work as fallback (check console logs)

### Issue: No interpretation displayed
- Check that `final_result.signal_id` exists
- Verify `/webhook/result` endpoint is accessible
- Check console for interpretation fetch errors

## References

- [Mobile Implementation](../project/app/(tabs)/analyse.tsx)
- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [n8n Webhook Docs](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/)

