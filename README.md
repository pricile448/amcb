# AMCB - Application de Gestion Bancaire

## 🚀 Serveur Unique

L'application utilise maintenant **un seul serveur** qui gère à la fois :
- L'application React (frontend)
- L'API notifications (backend)

## 📦 Installation

```bash
cd frontend
npm install
```

## 🏃‍♂️ Démarrage

### Option 1 : Démarrage complet (recommandé)
```bash
cd frontend
npm run start:full
```
Cette commande :
1. Construit l'application React
2. Démarre le serveur unique sur le port 3000

### Option 2 : Démarrage rapide (si déjà construit)
```bash
cd frontend
npm run start
```

## 🌐 Accès

- **Application** : http://localhost:3000
- **API Notifications** : http://localhost:3000/api/notifications

## 📁 Structure du Projet

```
frontend/
├── server.cjs          # Serveur unique (React + API)
├── start.cjs           # Script de démarrage complet
├── src/                # Code source React
├── dist/               # Application construite
└── package.json        # Dépendances et scripts
```

## 🔧 Fonctionnalités

- ✅ Application React complète
- ✅ API notifications fonctionnelle
- ✅ Synchronisation KYC avec Firestore
- ✅ Interface multilingue
- ✅ Gestion des comptes et transactions
- ✅ Système de notifications

## 🛠️ Développement

Pour le développement avec hot reload :
```bash
cd frontend
npm run dev
```

## 📝 Notes

- Le serveur unique évite les conflits de ports
- Toutes les API sont centralisées
- L'application est prête pour la production 