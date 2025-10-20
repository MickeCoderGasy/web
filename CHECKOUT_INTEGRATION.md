# Intégration de la page Checkout avec Vanilla Pay

## Vue d'ensemble

Cette fonctionnalité permet aux utilisateurs de souscrire à des plans payants via une page de checkout intégrée avec Vanilla Pay, utilisant votre API backend existante sur `api.qubextai.tech`.

## Fonctionnalités implémentées

### 1. Page de Checkout (`/checkout`)
- Interface utilisateur moderne et responsive
- Affichage des détails du plan sélectionné
- Récapitulatif des fonctionnalités incluses
- Formulaire de paiement sécurisé
- Intégration avec Vanilla Pay

### 2. Navigation depuis les paramètres
- Boutons "Payer maintenant" pour les plans payants
- Redirection automatique vers la page de checkout
- Gestion des plans gratuits (activation directe)

### 3. Services de paiement
- `paymentService.ts` : Service principal de gestion des paiements
- `payment.ts` : API endpoints pour les paiements
- Intégration avec votre API backend existante sur `api.qubextai.tech`

### 4. API Backend existant
- Utilise votre API backend sur `api.qubextai.tech`
- Endpoints : `/api/vanilla-pay/initiate-payment` et `/api/vanilla-pay/notification`
- Gestion automatique des webhooks de paiement

## Structure des fichiers

```
web/src/
├── pages/
│   ├── Checkout.tsx          # Page principale de checkout
│   ├── TestCheckout.tsx      # Page de test
│   └── PaymentCallback.tsx   # Page de retour de paiement
├── services/
│   └── paymentService.ts     # Service de paiement
├── api/
│   └── payment.ts           # API endpoints
├── components/
│   ├── CheckoutTest.tsx     # Composant de test
│   └── PaymentCallback.tsx  # Composant de callback
└── config/
    └── api.ts               # Configuration de l'API
```

## Configuration requise

### Variables d'environnement
```env
# API Backend existant
VITE_API_BASE_URL=https://api.qubextai.tech

# Vanilla Pay
VITE_VANILLA_PAY_URL=https://moncompte.ariarynet.com

# Supabase (déjà configuré)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Configuration de votre API backend
Votre API backend sur `api.qubextai.tech` doit être configurée avec :
- Endpoint d'initialisation : `/api/vanilla-pay/initiate-payment`
- Endpoint de notification : `/api/vanilla-pay/notification`
- CORS configuré pour autoriser votre domaine frontend

## Utilisation

### 1. Accès à la page de checkout
- Via les paramètres : Cliquer sur "Payer maintenant" pour un plan payant
- URL directe : `/checkout?plan=starter` ou `/checkout?plan=pro`

### 2. Processus de paiement
1. L'utilisateur sélectionne un plan dans les paramètres
2. Redirection vers `/checkout?plan={code}`
3. Affichage des détails du plan et des fonctionnalités
4. Clic sur "Payer maintenant"
5. Appel à votre API backend (`/api/vanilla-pay/initiate-payment`)
6. Redirection vers Vanilla Pay
7. Retour vers `/payment-callback` après paiement
8. Votre API backend reçoit la notification via webhook

### 3. Plans disponibles
- **Free** : 850,000 tokens/mois - Gratuit
- **Starter** : 2,000,000 tokens/mois - $14.99/mois
- **Pro** : 5,000,000 tokens/mois - $49.00/mois

## Test de la fonctionnalité

### Page de test
Accédez à `/test-checkout` pour tester :
- Navigation vers checkout
- Simulation de paiements
- Différents plans

### Tests manuels
1. Aller dans les paramètres
2. Cliquer sur "Payer maintenant" pour un plan payant
3. Vérifier l'affichage de la page checkout
4. Tester la redirection vers Vanilla Pay

## Intégration Vanilla Pay

### 1. Initialisation du paiement
```javascript
const paymentData = {
  plan_code: 'starter',
  user_email: 'user@example.com',
  amount: 14.99,
  currency: 'USD',
  description: 'Abonnement Starter'
};

// Conversion au format de votre API backend
const vanillaPayData = {
  montant: paymentData.amount,
  idpanier: `plan_${paymentData.plan_code}_${Date.now()}`,
  email: paymentData.user_email,
  description: paymentData.description,
  plan_code: paymentData.plan_code
};

const response = await paymentService.initiatePayment(paymentData);
```

### 2. Redirection vers Vanilla Pay
```javascript
if (response.success && response.redirect_url) {
  window.location.href = response.redirect_url;
}
```

### 3. Gestion des webhooks
Votre API backend reçoit automatiquement les notifications de Vanilla Pay via `/api/vanilla-pay/notification` et met à jour l'abonnement de l'utilisateur.

## Sécurité

- Chiffrement 3DES pour les communications avec Vanilla Pay
- Validation des signatures de webhook (recommandé)
- Authentification utilisateur requise
- HTTPS obligatoire en production

## Déploiement

### 1. Frontend
```bash
npm run build
# Déployer le build sur votre CDN/serveur
```

### 2. Backend
```bash
# Installer les dépendances
npm install express cors

# Démarrer le serveur
node payment-api.js
```

### 3. Configuration des webhooks
Configurer l'URL du webhook dans Vanilla Pay :
```
https://yourdomain.com/api/payment/webhook
```

## Dépannage

### Problèmes courants
1. **Erreur de redirection** : Vérifier les URLs de redirection dans Vanilla Pay
2. **Webhook non reçu** : Vérifier l'URL du webhook et la configuration
3. **Paiement non confirmé** : Vérifier la logique de confirmation dans le backend

### Logs
- Frontend : Console du navigateur
- Backend : Logs du serveur Node.js
- Vanilla Pay : Dashboard de paiement

## Support

Pour toute question ou problème :
1. Vérifier les logs d'erreur
2. Tester avec la page `/test-checkout`
3. Vérifier la configuration des variables d'environnement
4. Consulter la documentation Vanilla Pay
