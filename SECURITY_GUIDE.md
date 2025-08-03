# 🔒 Guide de Sécurité - Configuration Vercel

## ⚠️ IMPORTANT : Sécurité

**NE JAMAIS** commiter les vraies clés Firebase dans le code ! Elles doivent être configurées uniquement via les variables d'environnement.

## 📋 Configuration Vercel

### 1. Allez sur Vercel Dashboard
- https://vercel.com/dashboard
- Sélectionnez votre projet "studio"
- Settings → Environment Variables

### 2. Ajoutez les variables Firebase

**Récupérez vos vraies clés depuis Firebase Console :**
- https://console.firebase.google.com
- Sélectionnez votre projet
- Project Settings → General → Your apps

**Variables à ajouter :**
```
VITE_FIREBASE_API_KEY=VOTRE_VRAIE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=VOTRE_PROJET.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=VOTRE_PROJET_ID
VITE_FIREBASE_STORAGE_BUCKET=VOTRE_PROJET.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=VOTRE_SENDER_ID
VITE_FIREBASE_APP_ID=VOTRE_APP_ID
```

### 3. Ajoutez les variables SMTP
```
SMTP_HOST=mail.amccredit.com
SMTP_PORT=465
SMTP_SECURE=ssl
SMTP_USER=amcbunq@amccredit.com
SMTP_PASS=VOTRE_MOT_DE_PASSE_EMAIL
```

### 4. Redéployez
Après avoir ajouté toutes les variables, redéployez l'application.

## 🔐 Bonnes pratiques

1. **Utilisez toujours des variables d'environnement**
2. **Ne commitez jamais les vraies clés**
3. **Utilisez .env.local pour le développement local**
4. **Ajoutez .env* au .gitignore**

## 🚨 Si vos clés ont été exposées

1. **Révoquez immédiatement les clés** dans Firebase Console
2. **Générez de nouvelles clés**
3. **Mettez à jour les variables d'environnement**
4. **Nettoyez l'historique Git si nécessaire** 