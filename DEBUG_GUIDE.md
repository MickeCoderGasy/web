# Debug Guide - LLM Integration

## 🔍 Logs de Debug Ajoutés

### 1. Service Maestro (`maestroService.ts`)

**Logs ajoutés :**
- `🔍 [MAESTRO DEBUG]` - Début de l'analyse
- `✅ [MAESTRO DEBUG]` - Authentification réussie
- `⏰ [MAESTRO DEBUG]` - Formatage du temps
- `📤 [MAESTRO DEBUG]` - Payload envoyé
- `🌐 [MAESTRO DEBUG]` - URL du webhook
- `📡 [MAESTRO DEBUG]` - Statut et headers de réponse
- `📥 [MAESTRO DEBUG]` - Réponse brute
- `✅ [MAESTRO DEBUG]` - Réponse parsée
- `🎉 [MAESTRO DEBUG]` - Succès
- `❌ [MAESTRO DEBUG]` - Erreurs
- `💥 [MAESTRO DEBUG]` - Erreurs complètes

### 2. Service LLM (`llmService.ts`)

**Logs ajoutés :**
- `🔍 [LLM DEBUG]` - Analyse de stock
- `💬 [LLM CHAT DEBUG]` - Message de chat
- `📤 [LLM DEBUG]` - Payload envoyé
- `🌐 [LLM DEBUG]` - URL du webhook
- `📡 [LLM DEBUG]` - Statut et headers
- `📥 [LLM DEBUG]` - Réponse brute
- `✅ [LLM DEBUG]` - Réponse parsée
- `🎉 [LLM DEBUG]` - Résultat final
- `❌ [LLM DEBUG]` - Erreurs
- `💥 [LLM DEBUG]` - Erreurs complètes

### 3. Page Chat (`Chat.tsx`)

**Logs ajoutés :**
- `🚀 [CHAT DEBUG]` - Démarrage de l'analyse
- `🧹 [CHAT DEBUG]` - Nettoyage des intervalles
- `📊 [CHAT DEBUG]` - Mise à jour de l'état
- `⏰ [CHAT DEBUG]` - Démarrage du polling
- `🔄 [CHAT DEBUG]` - Polling en cours
- `📊 [CHAT DEBUG]` - Statut du job
- `🔄 [CHAT DEBUG]` - Mise à jour des étapes
- `🎉 [CHAT DEBUG]` - Analyse terminée
- `📝 [CHAT DEBUG]` - Récupération de l'interprétation
- `❌ [CHAT DEBUG]` - Erreurs

## 🧪 Comment Tester

### 1. Ouvrir la Console du Navigateur
- Appuyez sur `F12` ou `Ctrl+Shift+I`
- Allez dans l'onglet "Console"

### 2. Tester le Chat AI
1. Allez sur `/chat`
2. Cliquez sur l'onglet "Chat AI"
3. Tapez un symbole comme "AAPL" ou une question
4. Regardez les logs dans la console

**Logs attendus :**
```
🔍 [LLM DEBUG] Analyzing stock: AAPL
📤 [LLM DEBUG] Sending payload to webhook: {...}
🌐 [LLM DEBUG] Webhook URL: https://n8n.qubextai.tech/webhook/llm-chat
📡 [LLM DEBUG] Response status: 200
📥 [LLM DEBUG] Raw response: {...}
✅ [LLM DEBUG] Parsed response: {...}
🎉 [LLM DEBUG] Analysis result: {...}
```

### 3. Tester l'Analyse Forex
1. Allez sur `/chat`
2. Cliquez sur l'onglet "Analyse"
3. Sélectionnez une paire (ex: EUR/USD)
4. Cliquez sur "Lancer l'Analyse"
5. Regardez les logs dans la console

**Logs attendus :**
```
🔍 [MAESTRO DEBUG] Starting analysis with config: {...}
✅ [MAESTRO DEBUG] User authenticated, token length: 1234
⏰ [MAESTRO DEBUG] Formatted time: 2025-10-14 15:30
📤 [MAESTRO DEBUG] Sending payload to webhook: {...}
🌐 [MAESTRO DEBUG] Webhook URL: https://n8n.qubextai.tech/webhook/maestro
📡 [MAESTRO DEBUG] Response status: 200
📥 [MAESTRO DEBUG] Raw response: {...}
✅ [MAESTRO DEBUG] Parsed response: {...}
🎉 [MAESTRO DEBUG] Analysis started successfully with jobId: abc123
```

## 🚨 Problèmes Courants

### 1. Webhook ne répond pas
**Symptômes :**
- `📡 [DEBUG] Response status: 404` ou `500`
- `❌ [DEBUG] HTTP error response: ...`

**Solutions :**
- Vérifier que l'URL du webhook est correcte
- Vérifier que le webhook existe dans n8n
- Vérifier que le webhook est actif

### 2. Erreur d'authentification
**Symptômes :**
- `❌ [MAESTRO DEBUG] Authentication error: ...`
- `You must be logged in to start an analysis`

**Solutions :**
- Vérifier que l'utilisateur est connecté
- Vérifier les variables d'environnement Supabase
- Se reconnecter si nécessaire

### 3. Format de réponse incorrect
**Symptômes :**
- `❌ [DEBUG] JSON parse error: ...`
- `Invalid JSON response: ...`

**Solutions :**
- Vérifier le format de réponse du webhook
- Adapter le parsing selon la réponse réelle

### 4. Job non trouvé
**Symptômes :**
- `⚠️ [CHAT DEBUG] No job found for: abc123`
- Polling qui ne trouve pas le job

**Solutions :**
- Vérifier que le job a été créé dans Supabase
- Vérifier la table `workflow_jobs`
- Vérifier les permissions RLS

## 📊 URLs des Webhooks

### Production
- **Maestro** : `https://n8n.qubextai.tech/webhook/maestro`
- **LLM Chat** : `https://n8n.qubextai.tech/webhook/llm-chat`
- **Job Result** : `https://n8n.qubextai.tech/webhook/result`

### Test (si nécessaire)
- **Maestro Test** : `https://n8n.qubextai.tech/webhook-test/maestro`

## 🔧 Variables d'Environnement

Vérifiez que ces variables sont définies dans `.env` :

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📝 Format des Requêtes

### Maestro Webhook
```json
{
  "pair": "EUR/USD",
  "style": "intraday",
  "risk": "moyenne",
  "gain": "moyen",
  "time": "2025-10-14 15:30",
  "accessToken": "jwt_token_here"
}
```

### LLM Chat Webhook
```json
{
  "symbol": "AAPL",
  "message": "Analyze stock AAPL"
}
```

ou

```json
{
  "message": "Hello, how are you?"
}
```

## 🎯 Prochaines Étapes

1. **Tester les webhooks** avec les logs
2. **Identifier le problème** spécifique
3. **Ajuster le format** si nécessaire
4. **Vérifier la configuration** n8n
5. **Tester l'intégration** complète

---

**Note :** Tous les logs sont préfixés avec des emojis pour faciliter le filtrage dans la console. Vous pouvez filtrer par `[MAESTRO DEBUG]`, `[LLM DEBUG]`, ou `[CHAT DEBUG]` pour voir seulement les logs pertinents.
