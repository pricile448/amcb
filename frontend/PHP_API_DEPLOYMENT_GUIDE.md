# Guide de déploiement de l'API PHP AMCB sur Vercel

## 🚀 Vue d'ensemble

Ce guide vous explique comment déployer l'API PHP pour l'envoi d'emails de vérification sur Vercel.

## 📋 Prérequis

1. **Compte Vercel** : [vercel.com](https://vercel.com)
2. **CLI Vercel** : `npm i -g vercel`
3. **PHP 8.0+** installé localement
4. **Composer** installé localement

## 🔧 Configuration locale

### 1. Installation des dépendances

```bash
# Dans le dossier frontend
node setup-php-api.cjs
```

### 2. Configuration SMTP

Éditez le fichier `api/.env` :

```env
# Configuration SMTP
SMTP_HOST=mail.votre-domaine.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@votre-domaine.com
SMTP_PASS=votre-mot-de-passe-email
```

### 3. Test local

```bash
# Tester la configuration
npm run test:php-api

# Démarrer le serveur PHP local
npm run dev:php
```

## 🌐 Déploiement sur Vercel

### 1. Configuration Vercel

Le fichier `vercel.json` est déjà configuré pour :
- Router les requêtes `/api/*` vers les fonctions PHP
- Utiliser le runtime `vercel-php@0.6.0`

### 2. Variables d'environnement Vercel

Dans le dashboard Vercel, ajoutez ces variables :

```env
SMTP_HOST=mail.votre-domaine.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@votre-domaine.com
SMTP_PASS=votre-mot-de-passe-email
```

### 3. Déploiement

```bash
# Déploiement en production
vercel --prod

# Ou via le dashboard Vercel
# Connectez votre repo GitHub et déployez automatiquement
```

## 📧 Configuration SMTP par hébergeur

### cPanel (hébergement web classique)
```env
SMTP_HOST=mail.votre-domaine.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=noreply@votre-domaine.com
SMTP_PASS=mot-de-passe-cpanel
```

### OVH
```env
SMTP_HOST=ssl0.ovh.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@domaine.com
SMTP_PASS=mot-de-passe-email
```

### Gmail (pour les tests)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=votre-email@gmail.com
SMTP_PASS=mot-de-passe-app-gmail
```

## 🧪 Tests

### 1. Test de santé
```bash
curl https://votre-app.vercel.app/api/health.php
```

### 2. Test d'envoi d'email
```bash
curl -X POST https://votre-app.vercel.app/api/send-email.php \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 3. Test de vérification
```bash
curl -X POST https://votre-app.vercel.app/api/verify-code.php \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}'
```

## 🔍 Endpoints disponibles

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/health.php` | GET | Vérification de santé de l'API |
| `/api/send-email.php` | POST | Envoi d'email de vérification |
| `/api/verify-code.php` | POST | Vérification du code |
| `/api/test-email.php` | GET | Test de configuration email |

## 🛠️ Dépannage

### Erreur "Composer dependencies not found"
```bash
# Dans le dossier api
composer install --no-dev --optimize-autoloader
```

### Erreur SMTP
1. Vérifiez les credentials dans Vercel
2. Testez avec un email de test
3. Vérifiez les logs Vercel

### Erreur CORS
Les headers CORS sont déjà configurés dans chaque endpoint PHP.

## 📚 Ressources

- [Vercel PHP Runtime](https://github.com/vercel/vercel-php)
- [PHPMailer Documentation](https://github.com/PHPMailer/PHPMailer)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

## 🎯 Prochaines étapes

1. Configurez vos paramètres SMTP réels
2. Testez l'envoi d'emails
3. Déployez en production
4. Surveillez les logs Vercel

## 📞 Support

En cas de problème :
1. Vérifiez les logs Vercel
2. Testez localement avec `npm run dev:php`
3. Vérifiez la configuration SMTP 