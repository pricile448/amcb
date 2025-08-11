# 🚀 Guide de Déploiement vers Render

## 📋 Prérequis

- ✅ Compte Render (gratuit)
- ✅ Projet GitHub configuré
- ✅ Variables d'environnement prêtes

## 🔧 Configuration du Projet

### 1. Structure du Projet
Votre projet est maintenant configuré avec :
- `render.yaml` - Configuration de déploiement automatique
- `README.md` - Documentation complète
- `.gitignore` - Fichiers exclus du déploiement

### 2. Scripts de Build
Le projet utilise les scripts suivants :
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "start": "vite preview --port 3000 --host 0.0.0.0"
  }
}
```

## 🌐 Déploiement sur Render

### Étape 1 : Créer un Compte Render
1. Allez sur [render.com](https://render.com)
2. Créez un compte gratuit
3. Connectez-vous avec GitHub

### Étape 2 : Connecter le Dépôt
1. Cliquez sur **"New +"**
2. Sélectionnez **"Web Service"**
3. Connectez votre dépôt GitHub
4. Sélectionnez le dépôt `amcb`

### Étape 3 : Configuration du Service
```yaml
# render.yaml (déjà configuré)
services:
  - type: web
    name: amcb-frontend
    env: node
    buildCommand: cd frontend && npm install && npm run build
    startCommand: cd frontend && npm run start
    envVars:
      - key: NODE_ENV
        value: production
    healthCheckPath: /
    autoDeploy: true
    branch: master
```

**Paramètres à configurer :**
- **Name** : `amcb-frontend`
- **Environment** : `Node`
- **Build Command** : `cd frontend && npm install && npm run build`
- **Start Command** : `cd frontend && npm run start`
- **Auto-Deploy** : ✅ Activé

### Étape 4 : Variables d'Environnement
Configurez ces variables dans Render :

#### 🔥 Firebase
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### ☁️ Cloudinary
```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
```

#### 🌐 API
```env
VITE_API_BASE_URL=your_api_url
```

## 🚀 Déploiement Automatique

### Configuration Git
```bash
# Ajouter l'origine distante (remplacez par votre URL)
git remote add origin https://github.com/votre-username/amcb.git

# Pousser vers GitHub
git push -u origin master

# Pour les futurs déploiements
git push origin master
```

### Déploiement Automatique
- ✅ Chaque `git push` déclenche un déploiement
- ✅ Build automatique avec `npm install` et `npm run build`
- ✅ Démarrage automatique avec `npm run start`
- ✅ Health check sur `/`

## 🔍 Monitoring et Debug

### Logs de Build
- Accédez aux logs dans Render Dashboard
- Surveillez les erreurs de build
- Vérifiez les variables d'environnement

### Health Check
- L'application répond sur `/`
- Vérifiez que les routes fonctionnent
- Testez l'authentification Firebase

### Métriques
- Temps de build
- Temps de démarrage
- Utilisation des ressources

## 🛠️ Dépannage

### Erreurs Communes

#### 1. Build Failed
```bash
# Vérifiez les dépendances
cd frontend
npm install
npm run build
```

#### 2. Variables d'Environnement Manquantes
- Vérifiez toutes les variables dans Render
- Assurez-vous qu'elles commencent par `VITE_`

#### 3. Port de Démarrage
- L'application démarre sur le port 3000
- Render gère automatiquement le port externe

### Solutions Rapides

#### Redémarrage du Service
1. Allez dans Render Dashboard
2. Cliquez sur votre service
3. Cliquez sur **"Manual Deploy"**

#### Vérification des Logs
1. Cliquez sur **"Logs"**
2. Vérifiez les erreurs de build
3. Vérifiez les erreurs de démarrage

## 🌍 Domaine Personnalisé

### Configuration DNS
1. Dans Render, allez dans **"Settings"**
2. Cliquez sur **"Custom Domains"**
3. Ajoutez votre domaine
4. Configurez les enregistrements DNS

### SSL Automatique
- ✅ Render fournit SSL automatiquement
- ✅ Certificats Let's Encrypt
- ✅ Renouvellement automatique

## 📱 Test Post-Déploiement

### Checklist de Vérification
- [ ] Page d'accueil se charge
- [ ] Authentification Firebase fonctionne
- [ ] Routes avec préfixe de langue fonctionnent
- [ ] Système KYC est accessible
- [ ] Interface responsive sur mobile
- [ ] Thèmes clair/sombre fonctionnent
- [ ] Notifications s'affichent

### Tests de Performance
- [ ] Temps de chargement < 3s
- [ ] Build réussit en < 10min
- [ ] Démarrage en < 2min

## 🔄 Mises à Jour

### Processus de Mise à Jour
1. **Développez** localement
2. **Testez** avec `npm run dev`
3. **Commitez** vos changements
4. **Poussez** vers GitHub
5. **Render déploie** automatiquement

### Rollback
- Render garde les 5 derniers déploiements
- Cliquez sur **"Rollback"** si nécessaire
- Vérifiez les logs pour identifier le problème

## 💰 Coûts et Limites

### Plan Gratuit
- ✅ 750 heures/mois
- ✅ 512 MB RAM
- ✅ Déploiement automatique
- ✅ SSL gratuit
- ✅ Domaine personnalisé

### Plan Payant (si nécessaire)
- $7/mois pour plus de ressources
- Support prioritaire
- Métriques avancées

## 📞 Support

### Ressources Render
- [Documentation Render](https://render.com/docs)
- [Support Communautaire](https://community.render.com)
- [Status Page](https://status.render.com)

### Problèmes Spécifiques
- Vérifiez les logs dans Render
- Consultez la documentation du projet
- Créez une issue sur GitHub

---

## 🎯 Prochaines Étapes

1. **Configurez** votre compte Render
2. **Connectez** votre dépôt GitHub
3. **Déployez** automatiquement
4. **Testez** toutes les fonctionnalités
5. **Configurez** votre domaine personnalisé

**Votre application AmCbunq sera bientôt en ligne ! 🚀**
