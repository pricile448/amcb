# 🔧 Configuration avec Variables d'Environnement

## ✅ **Avantages de cette approche :**
- 🔒 **Sécurité** : Les clés ne sont pas dans le code source
- 🚀 **Flexibilité** : Configuration différente par environnement
- 📦 **Déploiement** : Facile à configurer sur différents serveurs

## 🚀 **Configuration automatique :**

### **1. Fichier .env créé automatiquement**
Le script `setup-env.cjs` a créé votre fichier `.env` avec la structure correcte.

### **2. Récupérer vos clés Firebase**
1. Allez sur : https://console.firebase.google.com/project/amcbunq/settings/general/
2. Dans "Vos applications", trouvez votre app web
3. Si pas d'app web, cliquez "Ajouter une application" > Web
4. Copiez la **clé API** et l'**App ID**

### **3. Modifier le fichier .env**
Ouvrez `frontend/.env` et remplacez :

```bash
# ❌ AVANT (valeurs par défaut)
VITE_FIREBASE_API_KEY=your-api-key-here
VITE_FIREBASE_APP_ID=1:117639555901342878348:web:your-app-id-here

# ✅ APRÈS (vos vraies valeurs)
VITE_FIREBASE_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz
VITE_FIREBASE_APP_ID=1:117639555901342878348:web:abc123def456ghi789
```

## 🧪 **Vérification :**

### **Tester la configuration :**
```bash
node test-firebase-config.cjs
```

### **Résultat attendu :**
```
✅ API Key: Configuré
✅ App ID: Configuré
✅ Project ID: Configuré
✅ Auth Domain: Configuré

🎉 Configuration Firebase OK !
```

## 🔄 **Redémarrage nécessaire :**

Après modification du fichier `.env`, **redémarrez votre serveur** :
```bash
npm run dev
```

## 📁 **Structure des fichiers :**

```
frontend/
├── .env                    # ← Vos vraies clés (créé automatiquement)
├── env.example            # ← Exemple pour référence
├── setup-env.cjs          # ← Script de configuration
├── test-firebase-config.cjs # ← Script de test
└── src/
    └── config/
        └── firebase.ts    # ← Utilise les variables d'environnement
```

## 🔒 **Sécurité :**

### **Fichiers à ignorer (déjà dans .gitignore) :**
- `.env` - Contient vos vraies clés
- `node_modules/` - Dépendances

### **Fichiers à commiter :**
- `env.example` - Exemple pour l'équipe
- `src/config/firebase.ts` - Code qui utilise les variables

## 🚨 **En cas de problème :**

### **Erreur "API key not valid" :**
1. Vérifiez que le fichier `.env` existe
2. Vérifiez que les clés sont correctes
3. Redémarrez le serveur : `npm run dev`

### **Variables non trouvées :**
1. Vérifiez que les noms commencent par `VITE_`
2. Vérifiez qu'il n'y a pas d'espaces autour du `=`

---

**✅ Configuration sécurisée et prête !** 