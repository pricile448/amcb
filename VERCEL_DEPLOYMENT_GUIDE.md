# 🚀 Guide de redéploiement Vercel

## 📋 Prérequis
- Vercel CLI installé
- Projet connecté à Vercel
- Variables d'environnement configurées

## 🔧 Installation de Vercel CLI (si pas déjà fait)

```bash
npm install -g vercel
```

## 🔑 Configuration des variables d'environnement sur Vercel

### Option 1 : Via l'interface web Vercel
1. Allez sur https://vercel.com/dashboard
2. Sélectionnez votre projet
3. Allez dans **Settings** > **Environment Variables**
4. Ajoutez les variables suivantes :

```
VITE_FIREBASE_API_KEY=AIzaSyC_votre_vraie_cle_ici
VITE_FIREBASE_AUTH_DOMAIN=amcbunq.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=amcbunq
VITE_FIREBASE_STORAGE_BUCKET=amcbunq.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=117639555901342878348
VITE_FIREBASE_APP_ID=1:117639555901342878348:web:votre_vrai_app_id
```

### Option 2 : Via Vercel CLI
```bash
# Se connecter à Vercel
vercel login

# Ajouter les variables d'environnement
vercel env add VITE_FIREBASE_API_KEY
vercel env add VITE_FIREBASE_AUTH_DOMAIN
vercel env add VITE_FIREBASE_PROJECT_ID
vercel env add VITE_FIREBASE_STORAGE_BUCKET
vercel env add VITE_FIREBASE_MESSAGING_SENDER_ID
vercel env add VITE_FIREBASE_APP_ID
```

## 🚀 Redéploiement

### Option 1 : Redéploiement automatique (recommandé)
1. Commitez vos changements :
```bash
git add .
git commit -m "Fix: Variables d'environnement Firebase"
git push origin main
```

2. Vercel redéploiera automatiquement si vous avez configuré l'intégration Git.

### Option 2 : Redéploiement manuel
```bash
# Dans le dossier frontend
vercel --prod
```

### Option 3 : Redéploiement forcé
```bash
# Forcer un nouveau déploiement
vercel --prod --force
```

## 🧪 Vérification du déploiement

### 1. Vérifier les logs de build
```bash
vercel logs
```

### 2. Vérifier les variables d'environnement
```bash
vercel env ls
```

### 3. Tester l'application
1. Ouvrez votre URL Vercel
2. Ouvrez la console du navigateur (F12)
3. Vérifiez que les variables Firebase sont définies :
```javascript
console.log('Firebase Config:', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID
});
```

## 🔧 Scripts utiles

### Script de déploiement rapide
```bash
# Créer un script de déploiement
echo '#!/bin/bash
echo "🚀 Déploiement Vercel..."
vercel --prod --yes
echo "✅ Déploiement terminé !"
' > deploy-vercel.sh

chmod +x deploy-vercel.sh
./deploy-vercel.sh
```

### Script de vérification
```bash
# Vérifier la configuration
vercel env ls
vercel ls
```

## 🆘 Dépannage

### Problème : Variables d'environnement undefined
1. Vérifiez que les variables commencent par `VITE_`
2. Redéployez après avoir ajouté les variables
3. Vérifiez les logs de build

### Problème : Build échoue
```bash
# Voir les logs détaillés
vercel logs --follow
```

### Problème : Ancienne version déployée
```bash
# Forcer un nouveau déploiement
vercel --prod --force
```

## 📊 Monitoring

### Vérifier les performances
1. Allez sur votre dashboard Vercel
2. Vérifiez les métriques de performance
3. Surveillez les erreurs dans les logs

### Alertes
Configurez des alertes pour :
- Échecs de déploiement
- Erreurs 500
- Temps de réponse élevés

## 🔒 Sécurité

### Variables sensibles
- ✅ Les variables `VITE_` sont exposées côté client
- ✅ Utilisez des variables sans `VITE_` pour les secrets serveur
- ✅ Ne commitez jamais le fichier `.env`

### Règles de sécurité
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

## 🎉 Résultat attendu

Après le redéploiement, votre application devrait :
- ✅ Charger les variables d'environnement Firebase
- ✅ Se connecter à Firebase correctement
- ✅ Fonctionner en production
- ✅ Avoir des performances optimales 