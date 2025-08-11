# 🔍 GUIDE DE DÉBOGAGE - DASHBOARD

## 🎯 **PROBLÈME : Dashboard ne s'affiche pas après connexion**

### 📋 **Étapes de débogage :**

#### 1. **Vérifier le serveur**
```bash
# Le serveur doit afficher :
✅ Firebase importé avec succès
🚀 Serveur VITE + FIREBASE démarré sur http://localhost:5173
🔐 Authentification: FIREBASE RÉELLE
🔌 Notifications: FIRESTORE RÉEL
```

#### 2. **Tester l'API**
```bash
# Test API Firebase
curl http://localhost:5173/api/test
# Réponse attendue : {"message":"Serveur Firebase fonctionnel !","mode":"firebase","auth":"firebase","data":"firestore"}

# Test Status
curl http://localhost:5173/api/status
# Réponse attendue : {"server":"firebase","authentication":"firebase","notifications":"firestore","port":5173}
```

#### 3. **Vérifier la connexion**
- Ouvrir http://localhost:5173
- Se connecter avec : `iarasophiecap@gmail.com` + mot de passe
- Vérifier dans la console du navigateur (F12) :
  - Y a-t-il des erreurs JavaScript ?
  - Y a-t-il des erreurs 404 pour les API ?
  - Y a-t-il des erreurs de connexion ?

#### 4. **Vérifier les logs du serveur**
- Quand vous vous connectez, le serveur doit afficher :
```
🔐 Tentative de connexion pour: iarasophiecap@gmail.com
✅ Connexion réussie pour: iarasophiecap@gmail.com
```

#### 5. **Endpoints API disponibles**
✅ `/api/auth/login` - Connexion Firebase
✅ `/api/auth/register` - Inscription Firebase
✅ `/api/auth/refresh` - Rafraîchissement token
✅ `/api/auth/logout` - Déconnexion
✅ `/api/accounts/profile/` - Profil utilisateur
✅ `/api/accounts/profile/update/` - Mise à jour profil
✅ `/api/transactions/` - Transactions
✅ `/api/transactions/history/` - Historique
✅ `/api/documents/` - Documents
✅ `/api/support/tickets/` - Support
✅ `/api/notifications/:userId` - Notifications Firestore

### 🔧 **Solutions possibles :**

#### **Problème 1 : Erreurs 404 API**
- Vérifier que tous les endpoints sont implémentés
- Vérifier que le serveur répond sur le bon port (5173)

#### **Problème 2 : Erreurs JavaScript**
- Vérifier la console du navigateur
- Vérifier que l'application React se charge correctement

#### **Problème 3 : Problème de redirection**
- Vérifier que React Router fonctionne
- Vérifier que la route `/dashboard` est accessible

#### **Problème 4 : Problème Firebase**
- Vérifier que les credentials Firebase sont corrects
- Vérifier que l'utilisateur existe dans Firestore

### 📞 **Actions à faire :**

1. **Ouvrir la console du navigateur (F12)**
2. **Se connecter et noter toutes les erreurs**
3. **Vérifier les logs du serveur**
4. **Tester les endpoints API manuellement**

### 🎯 **Résultat attendu :**
- Connexion réussie
- Redirection vers `/dashboard`
- Dashboard s'affiche avec les données
- Pas d'erreurs dans la console 