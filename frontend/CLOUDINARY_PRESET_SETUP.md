# 📋 Configuration Upload Preset Cloudinary

## 🎯 Objectif
Créer l'upload preset `amcb_kyc_documents` en mode **Unsigned** pour permettre les uploads KYC depuis le frontend.

## ⚠️ Problème actuel
```
❌ Error: "Upload preset not found"
```

L'upload preset `amcb_kyc_documents` n'existe pas ou n'est pas en mode **Unsigned**.

## ✅ Solution : Configuration manuelle

### 1. Accéder au Dashboard Cloudinary
- 🌐 URL : https://cloudinary.com/console
- 📧 Connectez-vous avec vos identifiants

### 2. Naviguer vers les Upload Presets
```
Dashboard → Settings → Upload → Upload presets
```

### 3. Créer ou modifier le preset
- **Si le preset existe** : Cliquez sur "Edit" à côté de `amcb_kyc_documents`
- **Si le preset n'existe pas** : Cliquez sur "Add upload preset"

### 4. Configuration requise
```bash
📌 Preset name: amcb_kyc_documents
🔧 Signing Mode: ⚠️ UNSIGNED (IMPORTANT!)
📁 Folder: kyc-documents (optionnel)
🎯 Resource type: Auto
📄 Allowed formats: jpg, jpeg, png, pdf
📏 Max file size: 10 MB (10485760 bytes)
🔒 Access mode: Public
```

### 5. Sauvegarder
Cliquez sur **"Save"** en bas de la page.

## 🧪 Test de vérification

### Option 1 : Script automatique
```bash
node check-cloudinary-presets.js
```

### Option 2 : Test dans l'application
1. Ouvrez l'application
2. Allez sur la page KYC
3. Essayez d'uploader un document
4. ✅ Succès = preset configuré correctement
5. ❌ Erreur = preset mal configuré

## 🔧 Configuration technique

### Variables d'environnement (déjà configurées)
```env
VITE_CLOUDINARY_CLOUD_NAME=dxvbuhadg
VITE_CLOUDINARY_UPLOAD_PRESET=amcb_kyc_documents
VITE_CLOUDINARY_API_KEY=221933451899525
VITE_CLOUDINARY_API_SECRET=_-G22OeY5A7QsLbKqr1ll93Cyso
```

### Architecture de l'upload
```
Frontend → CloudinaryService → Cloudinary API → Cloudinary Storage
                ↓
            Upload Preset: amcb_kyc_documents (UNSIGNED)
```

## 🚨 Points importants

1. **Mode UNSIGNED obligatoire** : Le frontend ne peut pas signer les requêtes
2. **Formats autorisés** : jpg, jpeg, png, pdf uniquement
3. **Taille maximale** : 10MB pour éviter les problèmes de performance
4. **Dossier KYC** : Organisation des documents dans `kyc-documents/`

## 🛟 Dépannage

### Erreur persistante après configuration
```bash
# Vider le cache du navigateur
Ctrl + Shift + R (ou Cmd + Shift + R sur Mac)

# Redémarrer le serveur de développement
npm run dev
```

### Vérifier la configuration
```bash
# Lister les presets existants
node check-cloudinary-presets.js

# Tester la connexion Cloudinary
node test-cloudinary.js
```

## 📞 Support
- 📚 Documentation Cloudinary : https://cloudinary.com/documentation/upload_presets
- 🔧 Console Cloudinary : https://cloudinary.com/console
