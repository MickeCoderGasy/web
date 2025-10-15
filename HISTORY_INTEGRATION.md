# History Integration - Web Version

## 🎯 Overview

L'onglet Historique reproduit à l'identique la fonctionnalité de la version mobile, permettant de consulter l'historique des analyses forex effectuées.

## 🏗️ Architecture

### Services

#### **History Service** (`services/historyService.ts`)

Gère la récupération de l'historique des analyses depuis le webhook n8n.

**Endpoint:**
- `POST https://n8n.qubextai.tech/webhook/logs`

**Request Format:**
```typescript
{
  accessToken: string; // JWT token from Supabase session
}
```

**Response Format:**
```typescript
Array<{
  job_id: string;
  generated_at: string;
  Status: string;
  // ... complete analysis data
}>
```

**Features:**
- Authentification via JWT Supabase
- Mapping des données vers le format `SignalLog`
- Gestion d'erreur complète
- Logs de debug détaillés

### Components

#### **History Component** (`components/History.tsx`)

Interface utilisateur pour afficher l'historique des analyses.

**Features:**
- Liste des analyses avec statut
- Affichage des signaux (BUY/SELL)
- Navigation vers les détails
- États de chargement et d'erreur
- Formatage des dates françaises
- Badges de statut colorés

#### **History Page** (`pages/History.tsx`)

Page dédiée pour l'historique avec navigation.

### Routes

- `/history` - Page dédiée à l'historique
- `/chat` - Onglet Historique dans Chat (3 onglets)

## 🔄 Data Flow

```
User clicks History → History Component
                           ↓
                 historyService.fetchSignalLogs()
                           ↓
        Get JWT from Supabase session
                           ↓
        POST to n8n webhook with accessToken
                           ↓
        Parse response and map to SignalLog[]
                           ↓
        Display in UI with status badges
                           ↓
        User clicks analysis → Show AnalysisResults
```

## 📊 SignalLog Interface

```typescript
interface SignalLog {
  job_id: string;
  created_at: string;
  overall_status: 'pending' | 'in_progress' | 'completed' | 'failed';
  final_result: any; // Complete analysis result
}
```

## 🎨 UI Features

### Status Badges
- **Terminée** (completed) - Green badge
- **Échouée** (failed) - Red badge  
- **En cours** (in_progress) - Blue badge
- **En attente** (pending) - Gray badge

### Signal Display
- **BUY** - Green with TrendingUp icon
- **SELL** - Red with TrendingDown icon
- **No Signal** - Gray with AlertCircle icon

### Date Formatting
- French locale: `14/10/2025 à 15:30`
- Date and time separated
- Calendar and Clock icons

## 🔧 Integration Details

### Webhook Configuration

**URL:** `https://n8n.qubextai.tech/webhook/logs`

**Method:** POST

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "accessToken": "jwt_token_from_supabase"
}
```

### Authentication

- Utilise la session Supabase active
- Récupère le JWT token automatiquement
- Gestion d'erreur si non connecté

### Error Handling

- **Authentication Error**: "You must be logged in to view analysis history"
- **Network Error**: HTTP status codes avec détails
- **Parse Error**: "Invalid JSON response"
- **Format Error**: "Unexpected response format"

## 🧪 Testing

### Prerequisites
1. User must be logged in
2. n8n webhook must be accessible
3. User must have analysis history

### Test Scenarios

#### 1. Load History
1. Navigate to `/history` or `/chat` → Historique tab
2. Should see loading spinner
3. Should fetch and display analyses

#### 2. View Analysis Details
1. Click on any analysis in the list
2. Should show `AnalysisResults` component
3. Should have "Retour à l'historique" button

#### 3. Empty State
1. If no analyses exist
2. Should show "Aucune analyse trouvée" message
3. Should have "Actualiser" button

#### 4. Error Handling
1. If webhook fails
2. Should show error message
3. Should have "Réessayer" button

## 📝 Logs de Debug

### History Service
- `🔍 [HISTORY DEBUG]` - Starting fetch
- `✅ [HISTORY DEBUG]` - Authentication success
- `📤 [HISTORY DEBUG]` - Payload sent
- `🌐 [HISTORY DEBUG]` - Webhook URL
- `📡 [HISTORY DEBUG]` - Response status
- `📥 [HISTORY DEBUG]` - Raw response
- `✅ [HISTORY DEBUG]` - Parsed response
- `🎉 [HISTORY DEBUG]` - Mapped logs
- `❌ [HISTORY DEBUG]` - Errors
- `💥 [HISTORY DEBUG]` - Complete errors

### History Component
- `🔍 [HISTORY COMPONENT]` - Fetching logs
- `✅ [HISTORY COMPONENT]` - Logs loaded
- `❌ [HISTORY COMPONENT]` - Error fetching
- `🔍 [HISTORY COMPONENT]` - Viewing analysis

## 🔄 Mobile Parity

### Identical Features
- ✅ Same webhook URL and format
- ✅ Same authentication method
- ✅ Same data mapping
- ✅ Same status handling
- ✅ Same signal display
- ✅ Same error handling

### Web-Specific Enhancements
- 🎨 Modern UI with shadcn-ui components
- 📱 Responsive design
- 🎯 Better loading states
- 🔄 Toast notifications
- 📊 Improved date formatting

## 🚀 Usage

### Navigation
1. **Direct route**: `/history`
2. **From Chat**: `/chat` → Historique tab
3. **From Navigation**: Click "Historique" in nav

### Features
- **View all analyses**: Chronological list
- **Filter by status**: Visual badges
- **View details**: Click any analysis
- **Refresh data**: Automatic on load
- **Error recovery**: Retry buttons

## 🔧 Configuration

### Environment Variables
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Webhook URL
Hardcoded in `historyService.ts`:
```typescript
const N8N_LOGS_WEBHOOK_URL = "https://n8n.qubextai.tech/webhook/logs";
```

## 📚 Related Files

- `services/historyService.ts` - Service layer
- `components/History.tsx` - UI component
- `pages/History.tsx` - Page wrapper
- `pages/Chat.tsx` - Tab integration
- `App.tsx` - Route configuration
- `components/Navigation.tsx` - Nav link

## 🎯 Future Enhancements

- [ ] Search and filter analyses
- [ ] Export analysis results
- [ ] Pagination for large histories
- [ ] Real-time updates
- [ ] Analysis comparison
- [ ] Performance metrics

---

**Status**: ✅ Complete
**Mobile Parity**: ✅ 100%
**Testing**: Ready for QA
