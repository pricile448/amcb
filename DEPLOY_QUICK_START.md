# ⚡ Déploiement Vercel - Guide Rapide

## 🎯 Objectif
Redéployer votre application AMCB sur Vercel avec les nouvelles variables d'environnement Firebase.

## 🚀 Étapes rapides

### 1. Installer Vercel CLI (si pas déjà fait)
```bash
npm install -g vercel
```

### 2. Se connecter à Vercel
```bash
vercel login
```

### 3. Configurer les variables d'environnement

#### Option A : Via l'interface web (recommandé)
1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet AMCB
3. **Settings** > **Environment Variables**
4. Ajoutez ces variables :

```
VITE_FIREBASE_API_KEY=AIzaSyC_votre_vraie_cle_ici
VITE_FIREBASE_AUTH_DOMAIN=amcbunq.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=amcbunq
VITE_FIREBASE_STORAGE_BUCKET=amcbunq.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=117639555901342878348
VITE_FIREBASE_APP_ID=1:117639555901342878348:web:votre_vrai_app_id
```

#### Option B : Via CLI
```bash
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID
```

### 4. Déployer

#### Option A : Script automatisé
```bash
node deploy-vercel.cjs
```

#### Option B : Commande directe
```bash
vercel --prod
```

#### Option C : Via Git (si configuré)
```bash
git add .
git commit -m "Fix: Variables d'environnement Firebase"
git push origin main
```

## 🧪 Vérification

### 1. Vérifier le déploiement
```bash
vercel ls
```

### 2. Voir les logs
```bash
vercel logs
```

### 3. Tester l'application
1. Ouvrez votre URL Vercel
2. F12 > Console
3. Vérifiez que Firebase fonctionne :
```javascript
console.log('Firebase Config:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
});
```

## 🔧 Dépannage rapide

### Problème : Variables undefined
```bash
# Vérifier les variables
vercel env ls

# Redéployer
vercel --prod --force
```

### Problème : Build échoue
```bash
# Voir les logs
vercel logs --follow

# Build local pour tester
npm run build
```

### Problème : Ancienne version
```bash
# Forcer le redéploiement
vercel --prod --force
```

## 📋 Checklist de déploiement

- [ ] Vercel CLI installé
- [ ] Connecté à Vercel (`vercel login`)
- [ ] Variables d'environnement configurées
- [ ] Build local réussi (`npm run build`)
- [ ] Déploiement terminé
- [ ] Application testée
- [ ] Firebase fonctionne

## 🎉 Résultat attendu

Après le déploiement :
- ✅ Application accessible sur votre URL Vercel
- ✅ Variables d'environnement Firebase chargées
- ✅ Authentification Firebase fonctionnelle
- ✅ Base de données Firestore accessible

## 🔗 Liens utiles

- **Dashboard Vercel** : https://vercel.com/dashboard
- **Console Firebase** : https://console.firebase.google.com/project/amcbunq/settings/general/
- **Guide détaillé** : `VERCEL_DEPLOYMENT_GUIDE.md`
- **Script de déploiement** : `deploy-vercel.cjs` 