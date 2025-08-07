# 🧪 Guide de test : Vérification email universelle

## ✅ Test complet de la solution

### 1. **Prérequis**
- ✅ Firebase Console configuré (Action URL: `http://localhost:5174/auth/action`)
- ✅ Application lancée (`npm run dev`)
- ✅ Domaines autorisés dans Firebase Console

### 2. **Test de vérification email**

#### Étape 1: Créer un compte
1. Aller sur `http://localhost:5174/ouvrir-compte`
2. Créer un compte avec un nouvel email
3. Vérifier la redirection vers `/verification-pending`

#### Étape 2: Vérifier l'email
1. Vérifier que l'email reçu contient le bon lien
2. Le lien doit pointer vers : `http://localhost:5174/auth/action?...`

#### Étape 3: Tester dans différents contextes

**Test A: Même navigateur**
- ✅ Clic dans le même onglet
- ✅ Redirection vers `/auth/action`
- ✅ Traitement automatique
- ✅ Redirection vers `/connexion` avec message de succès

**Test B: Autre onglet**
- ✅ Ouvrir le lien dans un nouvel onglet
- ✅ Même comportement que Test A

**Test C: Autre navigateur**
- ✅ Ouvrir le lien dans un autre navigateur
- ✅ Même comportement que Test A

**Test D: Copier-coller**
- ✅ Copier le lien et le coller dans la barre d'adresse
- ✅ Même comportement que Test A

### 3. **Test de connexion après vérification**

#### Étape 1: Se connecter
1. Aller sur `http://localhost:5174/connexion`
2. Vérifier l'affichage du message de succès (bannière verte)
3. Se connecter avec les identifiants

#### Étape 2: Vérifier le statut
1. Vérifier que l'utilisateur est connecté
2. Vérifier que le statut KYC est `unverified`
3. Vérifier que l'accès au dashboard fonctionne

### 4. **Vérifications attendues**

#### ✅ Comportement correct
- **Page `/auth/action`** : Traitement automatique, déconnexion, redirection
- **Page `/connexion`** : Message de succès affiché
- **Connexion** : Toast de bienvenue, statut KYC `unverified`
- **Dashboard** : Accès autorisé, données chargées correctement

#### ❌ Comportements à éviter
- Erreur 404 sur les liens de vérification
- Erreurs de permissions Firestore
- Boucle infinie de chargement
- Statut KYC incorrect

### 5. **Messages de succès attendus**

#### Dans la console
```
✅ Email vérifié avec succès
✅ Utilisateur stocké dans localStorage
```

#### Dans l'interface
- Toast : "Bienvenue ! Votre compte a été vérifié avec succès..."
- Bannière verte : "Email vérifié avec succès ! Veuillez vous connecter..."

### 6. **Statuts attendus**

#### Après vérification email
- `emailVerified: true`
- `kycStatus: 'unverified'`
- `verificationStatus: 'unverified'`

#### Après première connexion
- Utilisateur connecté
- Accès au dashboard
- Données Firestore chargées

### 7. **Dépannage**

#### Erreur "auth/invalid-action-code"
- Vérifier que le lien n'a pas expiré (24h)
- Créer un nouveau compte pour tester

#### Erreur "Missing or insufficient permissions"
- Vérifier que l'utilisateur est bien connecté
- Vérifier les règles Firestore

#### Lien toujours incorrect
- Vérifier la configuration Firebase Console
- Attendre 2-3 minutes après sauvegarde

### 8. **Test de robustesse**

#### Test de charge
- Créer plusieurs comptes rapidement
- Vérifier que chaque vérification fonctionne

#### Test de sécurité
- Tenter d'accéder au dashboard sans connexion
- Vérifier que la protection fonctionne

#### Test de persistance
- Fermer et rouvrir le navigateur
- Vérifier que la session persiste

---

## 🎯 Résultat attendu

Après tous ces tests :
- ✅ Vérification email fonctionne dans tous les contextes
- ✅ Déconnexion automatique après vérification
- ✅ Message de succès affiché
- ✅ Connexion fonctionne correctement
- ✅ Statut KYC correct (`unverified`)
- ✅ Accès au dashboard autorisé
- ✅ Aucune erreur de permissions

**La solution est universelle et robuste !** 🚀

