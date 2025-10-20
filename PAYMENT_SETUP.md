# Configuration des URLs de redirection pour Vanilla Pay

## URLs de redirection à configurer dans votre API backend

Pour que l'intégration fonctionne correctement, vous devez configurer les URLs de redirection dans votre API backend sur `api.qubextai.tech`.

### 1. URLs de retour de paiement

Dans votre code backend, modifiez les URLs de redirection pour pointer vers votre frontend :

```javascript
// Dans votre route /api/vanilla-pay/initiate-payment
res.status(200).json({
    success: true,
    paymentId: decryptedPaymentId,
    redirectUrl: `https://moncompte.ariarynet.com/payer/${decryptedPaymentId}`,
    // URLs de retour pour votre frontend
    returnUrl: 'https://votre-domaine.com/payment-callback?result=success',
    cancelUrl: 'https://votre-domaine.com/payment-callback?result=failed',
    errorUrl: 'https://votre-domaine.com/payment-callback?result=error'
});
```

### 2. Configuration des URLs de retour dans Vanilla Pay

Vous devez également configurer les URLs de retour dans votre compte Vanilla Pay :

- **URL de succès** : `https://votre-domaine.com/payment-callback?result=success`
- **URL d'échec** : `https://votre-domaine.com/payment-callback?result=failed`
- **URL d'annulation** : `https://votre-domaine.com/payment-callback?result=cancelled`

### 3. Gestion des paramètres de retour

Votre page de callback (`/payment-callback`) gère automatiquement les paramètres suivants :

- `result=success` : Paiement réussi
- `result=failed` : Paiement échoué
- `result=pending` : Paiement en attente
- `result=cancelled` : Paiement annulé
- `error=message` : Message d'erreur spécifique

### 4. Exemple de configuration complète

```javascript
// Dans votre API backend
app.post('/api/vanilla-pay/initiate-payment', async (req, res) => {
    try {
        const paymentDetails = req.body;
        
        // ... votre logique existante ...
        
        const decryptedPaymentId = await initiatePayment(paymentDetails);
        
        // URLs de redirection configurées pour votre domaine
        const frontendUrl = process.env.FRONTEND_URL || 'https://votre-domaine.com';
        
        res.status(200).json({
            success: true,
            paymentId: decryptedPaymentId,
            redirectUrl: `https://moncompte.ariarynet.com/payer/${decryptedPaymentId}`,
            returnUrl: `${frontendUrl}/payment-callback?result=success`,
            cancelUrl: `${frontendUrl}/payment-callback?result=cancelled`,
            errorUrl: `${frontendUrl}/payment-callback?result=failed`
        });
    } catch (error) {
        // ... gestion d'erreur ...
    }
});
```

### 5. Variables d'environnement recommandées

Ajoutez ces variables à votre fichier `.env` sur votre serveur :

```env
# URL de votre frontend
FRONTEND_URL=https://votre-domaine.com

# Configuration Vanilla Pay (déjà configurée)
CLIENT_ID=your_client_id
CLIENT_SECRET=your_client_secret
PUBLIC_KEY=your_public_key
PRIVATE_KEY=your_private_key
SITE_URL=your_site_url
```

### 6. Test de l'intégration

1. **Test local** : Utilisez `http://localhost:5173` comme URL de frontend
2. **Test de production** : Utilisez votre domaine de production
3. **Vérification** : Testez les différents scénarios (succès, échec, annulation)

### 7. Sécurité

- Assurez-vous que les URLs de redirection sont bien configurées
- Validez les paramètres de retour dans votre frontend
- Utilisez HTTPS en production
- Configurez CORS correctement pour votre domaine

## Support

Si vous rencontrez des problèmes avec la configuration :

1. Vérifiez que les URLs de redirection sont correctes
2. Testez avec la page `/test-checkout` pour déboguer
3. Vérifiez les logs de votre API backend
4. Consultez la documentation Vanilla Pay pour les URLs de redirection
