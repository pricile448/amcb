# 🔥 Guide de configuration Firebase

## 🚨 **ERREUR ACTUELLE :**
```
FirebaseError: Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)
```

## ✅ **SOLUTION :**

### **Étape 1 : Aller sur Firebase Console**
1. Ouvrez : https://console.firebase.google.com/
2. Sélectionnez votre projet : **amcbunq**

### **Étape 2 : Récupérer la configuration**
1. Cliquez sur ⚙️ (Paramètres) en haut à gauche
2. Sélectionnez "Paramètres du projet"
3. Dans l'onglet "Général", faites défiler jusqu'à "Vos applications"

### **Étape 3 : Créer une application web (si nécessaire)**
Si vous n'avez pas d'application web :
1. Cliquez sur "Ajouter une application" 
2. Sélectionnez l'icône Web (</>)
3. Donnez un nom : "AmCbunq Web"
4. Cliquez sur "Enregistrer l'app"

### **Étape 4 : Copier la configuration**
Vous verrez un code comme ceci :
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...", // ← COPIEZ CETTE CLÉ
  authDomain: "amcbunq.firebaseapp.com",
  projectId: "amcbunq",
  storageBucket: "amcbunq.appspot.com",
  messagingSenderId: "117639555901342878348",
  appId: "1:117639555901342878348:web:abc123def456" // ← COPIEZ CET ID
};
```

### **Étape 5 : Mettre à jour le fichier**
Modifiez `frontend/src/config/firebase.ts` :

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyC...", // ← Remplacez par votre vraie clé
  authDomain: "amcbunq.firebaseapp.com",
  projectId: "amcbunq",
  storageBucket: "amcbunq.appspot.com",
  messagingSenderId: "117639555901342878348",
  appId: "1:117639555901342878348:web:abc123def456" // ← Remplacez par votre vraie app ID
};
```

## 🔗 **Liens directs :**
- **Firebase Console** : https://console.firebase.google.com/
- **Paramètres du projet** : https://console.firebase.google.com/project/amcbunq/settings/general/

## 🧪 **Test après configuration :**
1. Redémarrez le serveur de développement : `npm run dev`
2. Testez l'inscription d'un compte
3. Vérifiez que l'erreur API key a disparu

## 📋 **Vérifications supplémentaires :**

### **Authentication activée :**
1. Dans Firebase Console → Authentication
2. Vérifiez que "Email/Password" est activé
3. Si non, cliquez sur "Get started" et activez "Email/Password"

### **Firestore activé :**
1. Dans Firebase Console → Firestore Database
2. Si pas de base de données, cliquez sur "Create database"
3. Choisissez "Start in test mode"

### **Functions activées :**
1. Dans Firebase Console → Functions
2. Si pas activées, cliquez sur "Get started"
3. Suivez les instructions d'activation

---

**⚠️ IMPORTANT :** Une fois configuré, redémarrez votre serveur de développement ! 