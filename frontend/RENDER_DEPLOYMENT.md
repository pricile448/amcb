# Guide de Déploiement Render

## Configuration pour Résoudre l'Erreur de Module JavaScript

### Problème Identifié
L'erreur `Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "text/html"` indique que Render ne gère pas correctement le routage SPA (Single Page Application) de React Router.

### Solution Implémentée

#### 1. Serveur Express pour le Routage SPA
- ✅ **Fichier `server.js`** créé pour gérer le routage côté serveur
- ✅ **Configuration `render.yaml`** mise à jour pour utiliser le serveur Express
- ✅ **Fichier `_redirects`** pour le fallback des routes

#### 2. Configuration Render

##### Variables d'Environnement à Configurer
Dans votre dashboard Render, configurez ces variables d'environnement :

```bash
NODE_ENV=production
VITE_CLOUDINARY_CLOUD_NAME=dxvbuhadg
VITE_CLOUDINARY_API_KEY=221933451899525
VITE_CLOUDINARY_API_SECRET=_-G22OeY5A7QsLbKqr1ll93Cyso
VITE_CLOUDINARY_UPLOAD_PRESET=amcb_kyc_documents
```

##### Configuration du Service
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node server.js`
- **Environment**: `Node`

#### 3. Étapes de Déploiement

1. **Connectez votre repository GitHub** à Render
2. **Créez un nouveau Web Service**
3. **Configurez les variables d'environnement** listées ci-dessus
4. **Déployez automatiquement** depuis la branche `master`

#### 4. Vérification du Déploiement

Après le déploiement, vérifiez que :
- ✅ L'application se charge correctement sur la page d'accueil
- ✅ La navigation entre les pages fonctionne
- ✅ Le système KYC fonctionne avec Cloudinary
- ✅ Aucune erreur de module JavaScript dans la console

### Structure des Fichiers de Configuration

```
frontend/
├── server.js              # Serveur Express pour le routage SPA
├── render.yaml            # Configuration Render
├── public/_redirects      # Règles de redirection
├── vite.config.ts         # Configuration Vite mise à jour
└── .env                   # Variables d'environnement locales
```

### Dépannage

#### Si l'erreur persiste :
1. **Vérifiez les logs Render** dans le dashboard
2. **Assurez-vous que `server.js` est bien déployé**
3. **Vérifiez que les variables d'environnement sont configurées**
4. **Redéployez manuellement** si nécessaire

#### Logs utiles à vérifier :
```bash
# Dans les logs Render, cherchez :
🚀 Server running on port 3000
📁 Serving static files from: /opt/render/project/src/dist
🌐 Environment: production
```

### Avantages de cette Solution

- ✅ **Routage SPA correct** : Toutes les routes React Router fonctionnent
- ✅ **Performance optimisée** : Fichiers statiques servis efficacement
- ✅ **Variables d'environnement** : Configuration Cloudinary intégrée
- ✅ **Déploiement automatique** : Mise à jour depuis GitHub
- ✅ **Logs détaillés** : Facilite le débogage

### Commandes Utiles

```bash
# Test local du serveur de production
npm run build
npm start

# Vérification de la configuration
node -e "console.log('Node.js version:', process.version)"
npm list express
```

Cette configuration résout définitivement le problème de chargement de modules JavaScript sur Render.
