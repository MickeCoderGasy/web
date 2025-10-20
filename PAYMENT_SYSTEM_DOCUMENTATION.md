# 📱 Documentation du Système de Paiement Mobile Money

## 🎯 Vue d'ensemble

Ce système permet aux utilisateurs de payer leurs abonnements via Mobile Money en utilisant des codes USSD. Il inclut une interface d'administration sécurisée pour vérifier et gérer les paiements.

## 🏗️ Architecture du système

```
Frontend (React) → Supabase (Base de données) → Interface Admin
     ↓                    ↓                        ↓
Checkout Page    →  manual_payments table  →  Admin Panel
     ↓                    ↓                        ↓
USSD Code        →  Payment Verification  →  Plan Activation
```

## 📁 Structure des fichiers

### Frontend
```
web/src/
├── pages/
│   ├── Checkout.tsx              # Page de paiement
│   ├── AdminPayments.tsx         # Interface d'administration
│   └── TestCheckout.tsx          # Page de test
├── components/
│   ├── AdminPaymentVerification.tsx  # Composant de gestion des paiements
│   ├── AdminLink.tsx             # Lien admin dans la navigation
│   └── USSDConfig.tsx            # Configuration USSD
├── services/
│   └── manualPaymentService.ts   # Service de paiement manuel
├── config/
│   ├── admin.ts                  # Configuration des administrateurs
│   └── ussd.ts                   # Configuration USSD
└── hooks/
    └── useAdminLogging.ts        # Logging des accès admin
```

### Backend (Supabase)
```
web/supabase/
├── complete_payment_system.sql   # Toutes les fonctions SQL
├── create_manual_payment.sql     # Création de paiements
├── refuse_payment.sql           # Refus de paiements
└── simple_payment_verification.sql # Vérification simple
```

## 🔧 Configuration

### 1. Configuration USSD (`web/src/config/ussd.ts`)

```typescript
export const USSD_CONFIG = {
  MOBILE_MONEY_NUMBER: '0347586097',    // Votre numéro Mobile Money
  USSD_PREFIX: '#111*1*2*',            // Préfixe USSD
  USSD_SUFFIX: '#',                     // Suffixe USSD
  LOCAL_CURRENCY: 'MGA',               // Devise locale
  EXCHANGE_RATE: 4420,                 // 1 USD = 4420 MGA
  CURRENCY_FORMAT: {
    symbol: 'Ar',
    position: 'after',
    decimals: 0
  }
};
```

### 2. Configuration Admin (`web/src/config/admin.ts`)

```typescript
export const ADMIN_EMAILS = [
  'micka.ram22@gmail.com'  // Emails autorisés pour l'administration
];
```

## 🚀 Installation

### 1. Exécuter les fonctions SQL

Copiez et exécutez dans l'éditeur SQL de Supabase :

```sql
-- Contenu de web/supabase/complete_payment_system.sql
```

### 2. Configurer les paramètres

1. **Modifiez `web/src/config/ussd.ts`** :
   - Changez `MOBILE_MONEY_NUMBER` pour votre numéro
   - Ajustez `EXCHANGE_RATE` selon le taux actuel
   - Modifiez `LOCAL_CURRENCY` si nécessaire

2. **Modifiez `web/src/config/admin.ts`** :
   - Ajoutez vos emails d'administrateur

## 💳 Flux de paiement

### 1. Création du paiement

```typescript
// L'utilisateur clique sur "Payer maintenant" dans les paramètres
const paymentData = await manualPaymentService.createManualPayment(
  userEmail,
  planCode,
  planName,
  amount,
  currency
);
```

### 2. Génération du code USSD

Le code USSD est généré automatiquement :
```
#111*1*2*0347586097*{PAYMENT_ID}*{AMOUNT_IN_MGA}#
```

**Exemple :**
- Plan Starter (14.99 USD) → `#111*1*2*0347586097*12345678*66258#`
- Plan Pro (49 USD) → `#111*1*2*0347586097*87654321*216580#`

### 3. Instructions utilisateur

L'utilisateur reçoit :
- ✅ Code USSD à composer sur son téléphone
- ✅ ID de paiement unique
- ✅ Montant en USD et en devise locale
- ✅ Date d'expiration (24h)
- ✅ Bouton pour copier le code

### 4. Vérification admin

L'administrateur peut :
- ✅ Voir tous les paiements en attente
- ✅ Vérifier un paiement (active le plan)
- ✅ Refuser un paiement (avec raison)
- ✅ Filtrer par statut
- ✅ Rechercher par email/ID

## 🔐 Sécurité

### 1. Accès admin sécurisé

- **Vérification par email** : Seuls les emails listés peuvent accéder
- **Interface masquée** : Lien admin visible uniquement pour les admins
- **Logging** : Tous les accès sont enregistrés

### 2. Protection des données

- **RLS activé** : Row Level Security sur toutes les tables
- **Validation côté serveur** : Toutes les opérations sont vérifiées
- **Expiration automatique** : Les paiements expirent après 24h

## 📊 Interface d'administration

### Accès
- **URL** : `/admin-payments`
- **Accès** : Emails autorisés uniquement
- **Navigation** : Dropdown utilisateur → "Administration"

### Fonctionnalités

#### 1. Liste des paiements
- **Filtres** : Tous, En attente, Vérifiés, Refusés, Expirés
- **Recherche** : Par email, ID de paiement, plan
- **Actions** : Vérifier, Refuser

#### 2. Vérification d'un paiement
```typescript
// Quand l'admin clique sur "Vérifier"
const result = await manualPaymentService.verifyPayment(paymentId, adminEmail);
// → Met à jour le statut
// → Active le plan de l'utilisateur
// → Réinitialise les tokens
```

#### 3. Refus d'un paiement
```typescript
// Quand l'admin clique sur "Refuser"
const success = await manualPaymentService.refusePayment(paymentId, adminEmail, reason);
// → Met à jour le statut
// → Enregistre la raison
```

## 🧪 Tests

### 1. Test de création de paiement

1. Allez sur `/test-checkout` → onglet "Test Manuel"
2. Remplissez les champs de test
3. Cliquez sur "Créer un paiement de test"
4. Vérifiez le code USSD généré

### 2. Test de vérification

1. Créez un paiement de test
2. Cliquez sur "Vérifier ce paiement"
3. Vérifiez que le plan est activé

### 3. Test d'administration

1. Connectez-vous avec un email admin
2. Allez sur `/admin-payments`
3. Testez les filtres et actions

## 📈 Monitoring

### 1. Logs d'accès admin

```javascript
// Dans la console du navigateur
🔐 Admin Access: {
  email: "admin@example.com",
  action: "admin_panel_access",
  timestamp: "2024-01-20T10:30:00.000Z",
  userAgent: "Mozilla/5.0...",
  url: "https://yourapp.com/admin-payments"
}
```

### 2. Statuts des paiements

- **pending** : En attente de vérification
- **verified** : Vérifié et plan activé
- **refused** : Refusé par l'admin
- **expired** : Expiré (après 24h)
- **cancelled** : Annulé par l'utilisateur

## 🔄 Maintenance

### 1. Ajouter un administrateur

```typescript
// Dans web/src/config/admin.ts
export const ADMIN_EMAILS = [
  'micka.ram22@gmail.com',
  'nouvel-admin@example.com'  // Ajoutez ici
];
```

### 2. Modifier le taux de change

```typescript
// Dans web/src/config/ussd.ts
export const USSD_CONFIG = {
  EXCHANGE_RATE: 4500,  // Nouveau taux
  // ...
};
```

### 3. Changer le numéro Mobile Money

```typescript
// Dans web/src/config/ussd.ts
export const USSD_CONFIG = {
  MOBILE_MONEY_NUMBER: '0347586098',  // Nouveau numéro
  // ...
};
```

## 🚨 Dépannage

### Problèmes courants

#### 1. "Paiement non trouvé"
- Vérifiez que l'ID de paiement existe
- Vérifiez que le paiement n'a pas expiré

#### 2. "Accès refusé" admin
- Vérifiez que l'email est dans `ADMIN_EMAILS`
- Vérifiez la connexion utilisateur

#### 3. Code USSD incorrect
- Vérifiez la configuration dans `ussd.ts`
- Vérifiez le taux de change
- Vérifiez le numéro Mobile Money

#### 4. Plan non activé après vérification
- Vérifiez que la fonction `fn_change_user_plan` existe
- Vérifiez les logs de la console
- Vérifiez les permissions Supabase

### Logs utiles

```javascript
// Console du navigateur
console.log('🔐 Admin Access:', logData);
console.log('Paiement créé:', paymentData);
console.log('Résultat de la vérification:', result);
```

## 📞 Support

### Fichiers importants à vérifier

1. **Configuration** : `web/src/config/ussd.ts`, `web/src/config/admin.ts`
2. **Fonctions SQL** : `web/supabase/complete_payment_system.sql`
3. **Services** : `web/src/services/manualPaymentService.ts`
4. **Interface admin** : `web/src/components/AdminPaymentVerification.tsx`

### Commandes utiles

```bash
# Vérifier les erreurs de linting
npm run lint

# Tester l'application
npm run dev

# Vérifier les types TypeScript
npm run type-check
```

## 🎉 Fonctionnalités implémentées

- ✅ **Paiement Mobile Money** avec codes USSD
- ✅ **Interface d'administration** sécurisée
- ✅ **Vérification et refus** des paiements
- ✅ **Conversion automatique** USD → Devise locale
- ✅ **Réinitialisation des tokens** après paiement
- ✅ **Logging des accès** admin
- ✅ **Interface de test** pour le développement
- ✅ **Sécurité par email** pour l'administration
- ✅ **Expiration automatique** des paiements
- ✅ **Filtres et recherche** dans l'admin panel

Le système est maintenant prêt pour la production ! 🚀
