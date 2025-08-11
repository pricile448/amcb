# 📧 Configuration DNS Resend pour amccredit.com

## 🎯 Objectif
Configurer Resend pour envoyer des emails depuis `@amccredit.com` au lieu de `@resend.dev`

## 📋 Étapes de configuration

### 1. Configuration dans Resend Dashboard

1. **Connectez-vous à [resend.com](https://resend.com)**
2. **Allez dans "Domains"**
3. **Cliquez sur "Add Domain"**
4. **Entrez le domaine :** `amccredit.com`
5. **Cliquez sur "Add Domain"**

### 2. Enregistrements DNS à ajouter

Resend vous donnera les valeurs exactes, mais voici les types d'enregistrements :

#### **Enregistrement SPF**
```
Type: TXT
Nom: @
Valeur: v=spf1 include:_spf.resend.com ~all
TTL: 3600
```

#### **Enregistrement DKIM**
```
Type: TXT
Nom: resend._domainkey
Valeur: [valeur exacte fournie par Resend]
TTL: 3600
```

#### **Enregistrement DMARC (optionnel mais recommandé)**
```
Type: TXT
Nom: _dmarc
Valeur: v=DMARC1; p=quarantine; rua=mailto:dmarc@amccredit.com
TTL: 3600
```

### 3. Vérification de la configuration

1. **Attendez 24-48h** pour la propagation DNS
2. **Dans Resend Dashboard**, vérifiez que le statut passe à "Verified"
3. **Testez l'envoi** avec le script `test-resend.cjs`

### 4. Mise à jour du code

Une fois configuré, mettre à jour les adresses d'expédition :

#### **Dans `test-resend.cjs` :**
```javascript
from: 'noreply@amccredit.com' // Au lieu de 'onboarding@resend.dev'
```

#### **Dans `secureEmailService.ts` :**
```typescript
from: 'noreply@amccredit.com'
```

#### **Dans l'API backend (si utilisée) :**
```javascript
from: 'noreply@amccredit.com'
```

## 🔍 Test de configuration

```bash
# Tester la configuration
node test-resend.cjs
```

## ✅ Avantages de la configuration

- **Professionnalisme** : Emails envoyés depuis `@amccredit.com`
- **Confiance** : Meilleur taux de livraison
- **Authentification** : SPF, DKIM, DMARC configurés
- **Réputation** : Domaine propre pour l'envoi d'emails

## 🚨 Points importants

1. **Propagation DNS** : Peut prendre 24-48h
2. **Vérification** : Attendre que Resend marque le domaine comme "Verified"
3. **Test** : Toujours tester avant de passer en production
4. **Monitoring** : Surveiller les taux de livraison après configuration

## 📞 Support

Si vous avez des problèmes :
1. Vérifiez les enregistrements DNS avec `nslookup` ou `dig`
2. Contactez le support Resend
3. Vérifiez les logs dans le dashboard Resend 