# 🏦 AmCbunq - Plateforme Bancaire Moderne

## 📋 Description

AmCbunq est une plateforme bancaire moderne construite avec React, TypeScript et Firebase. Elle offre une expérience utilisateur complète avec authentification, KYC, gestion de comptes et interface multilingue.

## ✨ Fonctionnalités Principales

- 🔐 **Authentification Firebase** avec vérification d'email
- 🌍 **Support multilingue** (FR, EN, ES, PT, IT, DE, NL)
- 📱 **Interface responsive** avec Tailwind CSS
- 🆔 **Système KYC** intégré
- 💳 **Gestion de comptes** et transactions
- 🔔 **Système de notifications** en temps réel
- 🎨 **Thèmes clair/sombre** adaptatifs
- 🚀 **Déploiement Render** optimisé

## 🛠️ Technologies Utilisées

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + CSS Modules
- **Authentification**: Firebase Auth
- **Base de données**: Firestore
- **Stockage**: Cloudinary (logos et images)
- **Déploiement**: Render
- **Internationalisation**: react-i18next

## 🚀 Déploiement Rapide

### Prérequis
- Compte Render
- Variables d'environnement configurées

### Étapes de déploiement

1. **Fork/Clone** ce dépôt
2. **Connectez** votre dépôt GitHub à Render
3. **Configurez** les variables d'environnement
4. **Déployez** automatiquement

### Variables d'environnement requises

```env
# Firebase
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_preset

# API
VITE_API_BASE_URL=your_api_url
```

## 📁 Structure du Projet

```
frontend/
├── src/
│   ├── components/     # Composants réutilisables
│   ├── pages/         # Pages de l'application
│   ├── layouts/       # Layouts principaux
│   ├── services/      # Services API et Firebase
│   ├── locales/       # Fichiers de traduction
│   ├── hooks/         # Hooks personnalisés
│   └── utils/         # Utilitaires
├── public/            # Assets statiques
└── package.json       # Dépendances
```

## 🔧 Développement Local

```bash
# Installation des dépendances
npm install

# Démarrage du serveur de développement
cd frontend
npm run dev

# Build de production
npm run build
```

## 🌐 Routes Principales

- `/` - Page d'accueil
- `/connexion` - Connexion utilisateur
- `/ouvrir-compte` - Inscription
- `/dashboard` - Tableau de bord
- `/kyc` - Processus KYC
- `/comptes` - Gestion des comptes

## 🔒 Sécurité

- Authentification Firebase sécurisée
- Validation des données côté client et serveur
- Règles Firestore restrictives
- Variables d'environnement protégées

## 📱 Responsive Design

L'application est entièrement responsive et optimisée pour :
- 📱 Mobile (320px+)
- 📱 Tablet (768px+)
- 💻 Desktop (1024px+)

## 🌍 Internationalisation

Support complet pour 7 langues :
- 🇫🇷 Français (FR)
- 🇬🇧 Anglais (EN)
- 🇪🇸 Espagnol (ES)
- 🇵🇹 Portugais (PT)
- 🇮🇹 Italien (IT)
- 🇩🇪 Allemand (DE)
- 🇳🇱 Néerlandais (NL)

## 🤝 Contribution

1. Fork le projet
2. Créez une branche feature (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- 📧 Créez une issue sur GitHub
- 📚 Consultez la documentation
- 🔧 Vérifiez les guides de déploiement

---

**AmCbunq** - Révolutionner l'expérience bancaire moderne 🚀 