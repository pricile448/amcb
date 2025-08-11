# 📧 Configuration de la validation par email

## 🚀 **Fonctionnalité implémentée :**

✅ **Composant de validation** : `VerificationCodeModal.tsx`  
✅ **Fonctions Firebase** : Envoi et vérification des codes  
✅ **Intégration** : Page d'inscription modifiée  
✅ **Configuration Firebase** : Frontend et backend  

## ⚙️ **Configuration requise :**

### **1. Configuration Firebase (frontend/src/config/firebase.ts)**
```typescript
const firebaseConfig = {
  apiKey: "VOTRE_API_KEY",
  authDomain: "amcbunq.firebaseapp.com",
  projectId: "amcbunq",
  storageBucket: "amcbunq.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### **2. Configuration email (frontend/functions/index.js)**
```javascript
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'votre-email@gmail.com',
    pass: 'votre-mot-de-passe-app'
  }
});
```

### **3. Variables d'environnement Firebase**
```bash
# Dans Firebase Console > Functions > Configuration
GMAIL_USER=votre-email@gmail.com
GMAIL_PASS=votre-mot-de-passe-app
```

## 🔧 **Étapes de déploiement :**

### **1. Installer Firebase CLI**
```bash
npm install -g firebase-tools
```

### **2. Se connecter à Firebase**
```bash
firebase login
```

### **3. Initialiser le projet**
```bash
firebase init functions
```

### **4. Déployer les fonctions**
```bash
node deploy-functions.cjs
```

## 📋 **Workflow complet :**

1. **Utilisateur remplit le formulaire** → Clic "Créer un compte"
2. **Création du compte Firebase Auth** → Données sauvegardées dans Firestore
3. **Envoi du code par email** → Code à 6 chiffres généré et envoyé
4. **Modal de validation** → Interface pour saisir le code
5. **Vérification du code** → Validation et activation du compte
6. **Redirection** → Vers le dashboard

## 🛡️ **Sécurité :**

- **Expiration** : 15 minutes
- **Tentatives** : Maximum 3
- **Nettoyage automatique** : Codes expirés supprimés toutes les heures
- **Validation côté serveur** : Toutes les vérifications dans Firebase Functions

## 📱 **Interface utilisateur :**

- **Modal responsive** : Adapté mobile et desktop
- **Auto-focus** : Navigation automatique entre les champs
- **Timer** : Compte à rebours de 15 minutes
- **Renvoi** : Possibilité de renvoyer le code après 60 secondes
- **Gestion d'erreurs** : Messages d'erreur clairs

## 🎯 **Prochaines étapes :**

1. **Configurer les vraies données Firebase**
2. **Déployer les fonctions**
3. **Tester l'envoi d'emails**
4. **Personnaliser le template email**

## 🔍 **Test :**

1. Remplir le formulaire d'inscription
2. Vérifier la réception de l'email
3. Saisir le code dans la modal
4. Confirmer la redirection vers le dashboard

---

**✅ Prêt à utiliser !** 