# 🔑 Guide pour récupérer les vraies clés Firebase

## 📋 Informations de votre projet
- **Project ID**: `amcbunq`
- **Client ID**: `117639555901342878348`
- **Console Firebase**: https://console.firebase.google.com/project/amcbunq/settings/general/

## 🚀 Étapes pour récupérer les clés

### 1. Accéder à la console Firebase
1. Ouvrez votre navigateur
2. Allez sur : https://console.firebase.google.com/project/amcbunq/settings/general/
3. Connectez-vous avec votre compte Google

### 2. Trouver votre application web
1. Dans la section "Vos applications", cherchez votre app web
2. Si vous n'en avez pas, cliquez sur "Ajouter une application" > "Web"
3. Donnez un nom à votre app (ex: "AMCB Web App")

### 3. Récupérer la clé API
1. Cliquez sur l'icône ⚙️ (roue dentée) à côté de votre app
2. Sélectionnez "Paramètres du projet"
3. Dans l'onglet "Général", trouvez la section "Vos applications"
4. Cliquez sur votre app web
5. Copiez la **clé API** (commence par `AIzaSyC...`)

### 4. Récupérer l'App ID
1. Dans la même page, copiez l'**App ID** (format: `1:117639555901342878348:web:...`)

### 5. Mettre à jour le fichier .env
Remplacez dans le fichier `frontend/.env` :

```env
# Remplacer cette ligne :
VITE_FIREBASE_API_KEY=AIzaSyC_placeholder_key_here
# Par votre vraie clé API :
VITE_FIREBASE_API_KEY=AIzaSyC_votre_vraie_cle_ici

# Remplacer cette ligne :
VITE_FIREBASE_APP_ID=1:117639555901342878348:web:amcbunq-web-app
# Par votre vrai App ID :
VITE_FIREBASE_APP_ID=1:117639555901342878348:web:votre_vrai_app_id
```

## 🧪 Tester la configuration

Après avoir mis à jour le fichier `.env`, testez avec :

```bash
npm run dev
```

Vous devriez voir dans la console du navigateur :
```
🔍 Variables d'environnement Firebase:
API Key: AIzaSyC_votre_vraie_cle
Auth Domain: amcbunq.firebaseapp.com
Project ID: amcbunq
...
```

## 🔒 Sécurité
- ✅ Le fichier `.env` est déjà dans `.gitignore`
- ✅ Ne partagez jamais vos clés Firebase
- ✅ Utilisez des règles Firestore appropriées

## 🆘 En cas de problème
Si vous ne trouvez pas votre application web :
1. Créez une nouvelle app web dans Firebase
2. Suivez les étapes de configuration
3. Copiez les nouvelles clés générées 