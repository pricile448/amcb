# 🔧 Guide de Configuration Vercel

## 📋 Variables d'environnement requises

### Variables Firebase
```
VITE_FIREBASE_API_KEY=AIzaSyA5wfRvUsB_Z7Xv4t-F0IoCa0LMEqB12LI
VITE_FIREBASE_AUTH_DOMAIN=amcbunq.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=amcbunq
VITE_FIREBASE_STORAGE_BUCKET=amcbunq.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=466533825569
VITE_FIREBASE_APP_ID=1:466533825569:web:873294f84a51aee5f63760
```

### Variables SMTP
```
SMTP_HOST=mail.amccredit.com
SMTP_PORT=465
SMTP_SECURE=ssl
SMTP_USER=amcbunq@amccredit.com
SMTP_PASS=VOTRE_MOT_DE_PASSE_EMAIL
```

## 🚀 Configuration manuelle sur Vercel

### Méthode 1 : Interface Web (Recommandée)

1. **Allez sur le dashboard Vercel** : https://vercel.com/dashboard
2. **Sélectionnez votre projet** "studio"
3. **Cliquez sur "Settings"** dans le menu
4. **Allez dans "Environment Variables"**
5. **Ajoutez chaque variable une par une** :

#### Variables Firebase :
- **Name** : `VITE_FIREBASE_API_KEY`
- **Value** : `AIzaSyA5wfRvUsB_Z7Xv4t-F0IoCa0LMEqB12LI`
- **Environment** : ✅ Production, ✅ Preview, ✅ Development

- **Name** : `VITE_FIREBASE_AUTH_DOMAIN`
- **Value** : `amcbunq.firebaseapp.com`
- **Environment** : ✅ Production, ✅ Preview, ✅ Development

- **Name** : `VITE_FIREBASE_PROJECT_ID`
- **Value** : `amcbunq`
- **Environment** : ✅ Production, ✅ Preview, ✅ Development

- **Name** : `VITE_FIREBASE_STORAGE_BUCKET`
- **Value** : `amcbunq.firebasestorage.app`
- **Environment** : ✅ Production, ✅ Preview, ✅ Development

- **Name** : `VITE_FIREBASE_MESSAGING_SENDER_ID`
- **Value** : `466533825569`
- **Environment** : ✅ Production, ✅ Preview, ✅ Development

- **Name** : `VITE_FIREBASE_APP_ID`
- **Value** : `1:466533825569:web:873294f84a51aee5f63760`
- **Environment** : ✅ Production, ✅ Preview, ✅ Development

#### Variables SMTP :
- **Name** : `SMTP_HOST`
- **Value** : `mail.amccredit.com`
- **Environment** : ✅ Production, ✅ Preview, ✅ Development

- **Name** : `SMTP_PORT`
- **Value** : `465`
- **Environment** : ✅ Production, ✅ Preview, ✅ Development

- **Name** : `SMTP_SECURE`
- **Value** : `ssl`
- **Environment** : ✅ Production, ✅ Preview, ✅ Development

- **Name** : `SMTP_USER`
- **Value** : `amcbunq@amccredit.com`
- **Environment** : ✅ Production, ✅ Preview, ✅ Development

- **Name** : `SMTP_PASS`
- **Value** : `VOTRE_MOT_DE_PASSE_EMAIL` (remplacez par le vrai mot de passe)
- **Environment** : ✅ Production, ✅ Preview, ✅ Development

### Méthode 2 : CLI Vercel

Si vous avez la CLI Vercel installée :

```bash
# Variables Firebase
vercel env add VITE_FIREBASE_API_KEY production
vercel env add VITE_FIREBASE_AUTH_DOMAIN production
vercel env add VITE_FIREBASE_PROJECT_ID production
vercel env add VITE_FIREBASE_STORAGE_BUCKET production
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID production
vercel env add VITE_FIREBASE_APP_ID production

# Variables SMTP
vercel env add SMTP_HOST production
vercel env add SMTP_PORT production
vercel env add SMTP_SECURE production
vercel env add SMTP_USER production
vercel env add SMTP_PASS production
```

## 🔄 Redéploiement

Après avoir configuré toutes les variables :

1. **Allez dans "Deployments"** sur Vercel
2. **Cliquez sur "Redeploy"** sur le dernier déploiement
3. **Ou faites un nouveau commit** et poussez sur GitHub

## ✅ Vérification

1. **Testez l'application** : https://studio-pricile448.vercel.app
2. **Ouvrez la console** du navigateur (F12)
3. **Vérifiez qu'il n'y a plus d'erreurs** `auth/invalid-api-key`
4. **Testez la connexion** avec un compte existant

## 🚨 Problèmes courants

### Page blanche
- Vérifiez que toutes les variables Firebase sont configurées
- Vérifiez que les variables commencent par `VITE_`

### Erreur auth/invalid-api-key
- Vérifiez que `VITE_FIREBASE_API_KEY` est correct
- Vérifiez que toutes les variables Firebase sont présentes

### Variables non chargées
- Redéployez l'application après avoir ajouté les variables
- Vérifiez que les variables sont configurées pour "Production" 