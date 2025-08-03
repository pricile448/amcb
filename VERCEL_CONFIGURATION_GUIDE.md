# 🔧 Guide de Configuration Vercel - Résolution des Problèmes de Connexion

## 🚨 Problème Identifié

Les erreurs de connexion Firebase sont causées par des **variables d'environnement manquantes** sur Vercel.

## 📋 Variables à Configurer sur Vercel

### 1. Variables Firebase (OBLIGATOIRES)

Allez sur https://vercel.com/dashboard → Votre projet "studio" → Settings → Environment Variables

Ajoutez ces variables une par une :

```
VITE_FIREBASE_API_KEY=AIzaSyA5wfRvUsB_Z7Xv4t-F0IoCa0LMEqB12LI
VITE_FIREBASE_AUTH_DOMAIN=amcbunq.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=amcbunq
VITE_FIREBASE_STORAGE_BUCKET=amcbunq.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=466533825569
VITE_FIREBASE_APP_ID=1:466533825569:web:873294f84a51aee5f63760
```

### 2. Variables SMTP (pour l'envoi d'emails)

```
SMTP_HOST=mail.amccredit.com
SMTP_PORT=465
SMTP_SECURE=ssl
SMTP_USER=amcbunq@amccredit.com
SMTP_PASS=VOTRE_MOT_DE_PASSE_EMAIL_REEL
```

## 🔧 Étapes de Configuration

### Étape 1: Configuration via Dashboard Vercel

1. **Allez sur Vercel Dashboard**
   - https://vercel.com/dashboard
   - Sélectionnez votre projet "studio"

2. **Accédez aux Variables d'Environnement**
   - Cliquez sur "Settings"
   - Allez dans "Environment Variables"

3. **Ajoutez les Variables Firebase**
   - Cliquez sur "Add New"
   - Nom: `VITE_FIREBASE_API_KEY`
   - Valeur: `AIzaSyA5wfRvUsB_Z7Xv4t-F0IoCa0LMEqB12LI`
   - Environnements: ✅ Production, ✅ Preview, ✅ Development
   - Répétez pour toutes les variables Firebase

4. **Ajoutez les Variables SMTP**
   - Même processus pour les variables SMTP
   - **IMPORTANT**: Remplacez `VOTRE_MOT_DE_PASSE_EMAIL_REEL` par le vrai mot de passe

### Étape 2: Redéploiement

Après avoir ajouté toutes les variables :

```bash
git add .
git commit -m "Update configuration"
git push
```

### Étape 3: Vérification

1. **Testez la connexion** avec un compte existant
2. **Vérifiez la console** du navigateur (F12) pour les erreurs
3. **Vérifiez les logs Vercel** dans le dashboard

## 🔍 Diagnostic des Erreurs

### Erreur: `auth/invalid-credential`
- **Cause**: Variables Firebase manquantes ou incorrectes
- **Solution**: Vérifiez que toutes les variables Firebase sont configurées

### Erreur: `auth/user-not-found`
- **Cause**: Le compte n'existe pas dans Firebase
- **Solution**: Vérifiez dans Firebase Console → Authentication → Users

### Erreur: `auth/wrong-password`
- **Cause**: Mot de passe incorrect
- **Solution**: Vérifiez le mot de passe ou réinitialisez-le

### Erreur: `auth/too-many-requests`
- **Cause**: Trop de tentatives de connexion
- **Solution**: Attendez quelques minutes avant de réessayer

## 📱 Test de Connexion

### 1. Ouvrez la Console du Navigateur
- Appuyez sur F12
- Allez dans l'onglet "Console"

### 2. Essayez de Vous Connecter
- Utilisez un compte existant
- Observez les messages dans la console

### 3. Vérifiez les Logs
Vous devriez voir :
```
🔍 Variables d'environnement Firebase:
API Key: AIzaSyA5wfRvUsB_Z7Xv4t-F0IoCa0LMEqB12LI
Auth Domain: amcbunq.firebaseapp.com
...
```

## 🚀 Commandes Utiles

### Diagnostic Local
```bash
node diagnose-firebase.cjs
```

### Configuration Vercel
```bash
node setup-vercel-env.cjs
```

### Redéploiement
```bash
git add .
git commit -m "Fix configuration"
git push
```

## ✅ Checklist de Vérification

- [ ] Variables Firebase configurées sur Vercel
- [ ] Variables SMTP configurées sur Vercel
- [ ] Redéploiement effectué
- [ ] Test de connexion réussi
- [ ] Accès au dashboard fonctionnel
- [ ] Envoi d'emails fonctionnel

## 🆘 Support

Si les problèmes persistent :

1. **Vérifiez les logs Vercel** dans le dashboard
2. **Vérifiez la console du navigateur** pour les erreurs détaillées
3. **Vérifiez Firebase Console** pour l'état des comptes
4. **Contactez le support** avec les logs d'erreur

---

**Note**: Les variables d'environnement sont essentielles pour que Firebase fonctionne correctement sur Vercel. Sans elles, l'authentification échouera systématiquement. 