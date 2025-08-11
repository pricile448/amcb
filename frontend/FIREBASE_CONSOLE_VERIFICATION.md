# 🔧 Guide de Vérification Firebase Console

## 🎯 **Objectif**
Vérifier et corriger la configuration Firebase Console pour résoudre l'erreur `auth/invalid-action-code`.

## 📋 **Étapes de vérification**

### **1. Accéder à Firebase Console**

1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionner le projet : **`amcbunq`**
3. Cliquer sur **Authentication** dans le menu de gauche

### **2. Vérifier les paramètres généraux**

#### **A. Onglet "Settings"**
1. Cliquer sur l'onglet **"Settings"**
2. Vérifier les informations suivantes :

#### **B. Action URL (CRITIQUE)**
- **Champ** : "Action URL"
- **Valeur attendue (dev)** : `http://localhost:5174/auth/action`
- **Valeur attendue (prod)** : `https://votre-domaine.com/auth/action`

**Si incorrect :**
1. Cliquer sur "Edit" (icône crayon)
2. Entrer l'URL correcte
3. Cliquer sur "Save"

#### **C. Authorized Domains**
- **Vérifier** que les domaines suivants sont présents :
  - `localhost`
  - `127.0.0.1`
  - `amcbunq.firebaseapp.com`
  - Votre domaine de production (si applicable)

**Si manquant :**
1. Cliquer sur "Add domain"
2. Ajouter le domaine manquant
3. Cliquer sur "Add"

### **3. Vérifier les Templates d'Email**

#### **A. Onglet "Templates"**
1. Cliquer sur l'onglet **"Templates"**
2. Sélectionner **"Email verification"**

#### **B. Vérifier le template**
- **Sujet** : `Vérifiez votre compte AmCbunq - {{LINK}}`
- **Nom de l'expéditeur** : `AmCbunq`
- **Adresse de l'expéditeur** : `noreply@amccredit.com` (ou votre domaine)

#### **C. Vérifier le contenu HTML**
Utiliser le template moderne fourni dans `firebase-email-templates.md`

### **4. Vérifier les méthodes d'authentification**

#### **A. Onglet "Sign-in method"**
1. Vérifier que **"Email/Password"** est activé
2. Vérifier que **"Email link (passwordless sign-in)"** est configuré si nécessaire

#### **B. Paramètres Email/Password**
- **Email link** : Activé
- **Email verification** : Activé
- **Allow users to sign up** : Activé

### **5. Vérifier les règles de sécurité**

#### **A. Firestore Rules**
1. Aller dans **Firestore Database**
2. Cliquer sur **"Rules"**
3. Vérifier que les règles permettent l'accès aux utilisateurs authentifiés

#### **B. Storage Rules (si applicable)**
1. Aller dans **Storage**
2. Cliquer sur **"Rules"**
3. Vérifier les permissions

## 🔍 **Diagnostic des problèmes**

### **Problème 1: Action URL incorrecte**
**Symptômes :**
- Erreur `auth/invalid-action-code`
- Redirection vers une page d'erreur

**Solution :**
1. Vérifier l'Action URL dans Settings
2. S'assurer qu'elle pointe vers `/auth/action`
3. Tester avec un nouveau lien de vérification

### **Problème 2: Domaines non autorisés**
**Symptômes :**
- Erreur de redirection
- Page blanche ou erreur 404

**Solution :**
1. Ajouter `localhost` et `127.0.0.1` aux domaines autorisés
2. Ajouter votre domaine de production
3. Attendre quelques minutes pour la propagation

### **Problème 3: Template d'email incorrect**
**Symptômes :**
- Liens de vérification malformés
- Erreurs dans les emails

**Solution :**
1. Utiliser le template moderne fourni
2. Vérifier les variables `{{LINK}}`
3. Tester l'envoi d'email

## 🧪 **Test de la configuration**

### **Test 1: Créer un nouveau compte**
1. Aller sur votre application
2. Créer un nouveau compte
3. Vérifier que l'email de vérification arrive
4. Cliquer sur le lien de vérification
5. Vérifier la redirection vers `/auth/action`

### **Test 2: Vérifier un utilisateur existant**
1. Se connecter avec un compte existant
2. Vérifier l'accès au dashboard
3. Vérifier le statut de vérification email

### **Test 3: Test de réinitialisation de mot de passe**
1. Aller sur "Mot de passe oublié"
2. Entrer une adresse email
3. Vérifier que l'email arrive
4. Tester le lien de réinitialisation

## 📊 **Logs de diagnostic**

### **Dans la console du navigateur (F12)**
Rechercher les erreurs suivantes :
- `auth/invalid-action-code`
- `auth/expired-action-code`
- `auth/invalid-continue-uri`

### **Dans les logs Firebase**
1. Aller dans **Functions** (si utilisé)
2. Vérifier les logs d'exécution
3. Rechercher les erreurs d'authentification

## ✅ **Configuration recommandée**

### **Action URL**
```
Développement : http://localhost:5174/auth/action
Production : https://votre-domaine.com/auth/action
```

### **Authorized Domains**
```
localhost
127.0.0.1
amcbunq.firebaseapp.com
votre-domaine.com (production)
```

### **Template Email**
- Utiliser le template moderne de `firebase-email-templates.md`
- Inclure les variables `{{LINK}}`, `{{EMAIL}}`
- Design responsive et professionnel

## 🆘 **En cas de problème persistant**

### **Contactez le support avec :**
1. Screenshot de la configuration Firebase Console
2. URL complète du lien de vérification
3. Logs d'erreur de la console
4. Timestamp de l'erreur

### **Informations utiles :**
- **Project ID** : `amcbunq`
- **Auth Domain** : `amcbunq.firebaseapp.com`
- **Action URL** : `http://localhost:5174/auth/action`
- **Mode d'erreur** : `verifyEmail` ou `resetPassword`

---

## 🎯 **Résumé**

**Après vérification de la configuration Firebase Console :**

- ✅ **Action URL** correcte
- ✅ **Domaines autorisés** configurés
- ✅ **Templates d'email** modernes
- ✅ **Méthodes d'authentification** activées
- ✅ **Règles de sécurité** appropriées

**L'erreur `auth/invalid-action-code` devrait être résolue !** 🚀
