# 🚀 Guide de Démarrage Rapide - Système de Paiement Mobile Money

## ⚡ Installation en 5 minutes

### 1. Exécuter le SQL (2 min)

1. Ouvrez Supabase → SQL Editor
2. Copiez le contenu de `web/supabase/complete_payment_system.sql`
3. Exécutez le script
4. ✅ Vérifiez que toutes les fonctions sont créées

### 2. Configurer les paramètres (1 min)

**Modifiez `web/src/config/ussd.ts` :**
```typescript
export const USSD_CONFIG = {
  MOBILE_MONEY_NUMBER: 'VOTRE_NUMERO',  // ← Changez ici
  EXCHANGE_RATE: 4420,                  // ← Ajustez le taux
  LOCAL_CURRENCY: 'MGA',               // ← Votre devise
};
```

**Modifiez `web/src/config/admin.ts` :**
```typescript
export const ADMIN_EMAILS = [
  'votre-email@admin.com'  // ← Ajoutez votre email
];
```

### 3. Tester le système (2 min)

1. **Démarrez l'application** : `npm run dev`
2. **Connectez-vous** avec votre email admin
3. **Allez sur** `/test-checkout` → onglet "Test Manuel"
4. **Créez un paiement de test**
5. **Vérifiez le code USSD généré**

## 🎯 Utilisation normale

### Pour les utilisateurs

1. **Aller dans les paramètres** → Choisir un plan payant
2. **Cliquer "Payer maintenant"** → Sélectionner "Mobile Money Manuel"
3. **Suivre les instructions** → Composer le code USSD
4. **Attendre la vérification** (5-15 minutes)

### Pour les administrateurs

1. **Se connecter** avec un email autorisé
2. **Cliquer sur l'avatar** → "Administration"
3. **Vérifier les paiements** en attente
4. **Cliquer "Vérifier"** pour activer le plan

## 🔧 Configuration avancée

### Changer le numéro Mobile Money

```typescript
// Dans web/src/config/ussd.ts
MOBILE_MONEY_NUMBER: '0347586098',  // Nouveau numéro
```

### Ajuster le taux de change

```typescript
// Dans web/src/config/ussd.ts
EXCHANGE_RATE: 4500,  // 1 USD = 4500 MGA
```

### Ajouter un administrateur

```typescript
// Dans web/src/config/admin.ts
export const ADMIN_EMAILS = [
  'admin1@example.com',
  'admin2@example.com',  // Nouvel admin
];
```

## 🚨 Dépannage rapide

### "Accès refusé" admin
- Vérifiez que votre email est dans `ADMIN_EMAILS`
- Redémarrez l'application

### Code USSD incorrect
- Vérifiez `MOBILE_MONEY_NUMBER` dans `ussd.ts`
- Vérifiez `EXCHANGE_RATE`

### Paiement non trouvé
- Vérifiez que le paiement n'a pas expiré (24h)
- Vérifiez l'ID de paiement

### Plan non activé
- Vérifiez les logs dans la console
- Vérifiez que `fn_change_user_plan` existe dans Supabase

## 📱 Exemple de code USSD

Avec la configuration par défaut :
- **Plan Starter** (14.99 USD) → `#111*1*2*0347586097*12345678*66258#`
- **Plan Pro** (49 USD) → `#111*1*2*0347586097*87654321*216580#`

## ✅ Checklist de déploiement

- [ ] SQL exécuté dans Supabase
- [ ] Configuration USSD mise à jour
- [ ] Email admin ajouté
- [ ] Test de création de paiement réussi
- [ ] Test de vérification admin réussi
- [ ] Code USSD généré correctement
- [ ] Interface admin accessible

## 🎉 C'est tout !

Votre système de paiement Mobile Money est maintenant opérationnel ! 

**URLs importantes :**
- **Checkout** : `/checkout?plan=starter`
- **Admin** : `/admin-payments`
- **Test** : `/test-checkout`

**Documentation complète :** `PAYMENT_SYSTEM_DOCUMENTATION.md`
