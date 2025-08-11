# Configuration des Variables d'Environnement Cloudinary

## Variables d'Environnement Requises

Pour que le système KYC fonctionne correctement, vous devez configurer les variables d'environnement suivantes dans votre fichier `.env` :

```bash
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=dxvbuhadg
VITE_CLOUDINARY_API_KEY=221933451899525
VITE_CLOUDINARY_API_SECRET=_-G22OeY5A7QsLbKqr1ll93Cyso
VITE_CLOUDINARY_UPLOAD_PRESET=amcb_kyc_documents
```

## Instructions de Configuration

### 1. Créer le fichier .env

Dans le dossier `frontend/`, créez un fichier `.env` avec le contenu suivant :

```bash
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=dxvbuhadg
VITE_CLOUDINARY_API_KEY=221933451899525
VITE_CLOUDINARY_API_SECRET=_-G22OeY5A7QsLbKqr1ll93Cyso
VITE_CLOUDINARY_UPLOAD_PRESET=amcb_kyc_documents

# Firebase Configuration (si nécessaire)
VITE_FIREBASE_API_KEY=AIzaSyBqXqXqXqXqXqXqXqXqXqXqXqXqXqXqXqX
VITE_FIREBASE_AUTH_DOMAIN=amcbunq.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=amcbunq
VITE_FIREBASE_STORAGE_BUCKET=amcbunq.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456789

# Application Configuration
VITE_APP_NAME=AmCbunq
VITE_APP_VERSION=1.0.0
VITE_APP_ENV=development
```

### 2. Configuration Cloudinary

#### Créer un Upload Preset

1. Connectez-vous à votre [dashboard Cloudinary](https://cloudinary.com/console)
2. Allez dans **Settings** > **Upload**
3. Dans la section **Upload presets**, cliquez sur **Add upload preset**
4. Configurez le preset :
   - **Name**: `amcb_kyc_documents`
   - **Signing Mode**: `Unsigned` (pour l'upload côté client)
   - **Folder**: `kyc_documents/` (optionnel)
   - **Allowed formats**: `jpg, jpeg, png, pdf, heic, heif`
   - **Max file size**: `10MB`
   - **Transformation**: Aucune (ou selon vos besoins)

#### Vérifier les Permissions

Assurez-vous que votre compte Cloudinary a les permissions nécessaires :
- Upload de fichiers
- Accès aux API
- Limites de stockage suffisantes

### 3. Variables d'Environnement pour la Production

Pour le déploiement en production (Render, Vercel, etc.), configurez ces variables dans votre plateforme de déploiement :

#### Render
- Allez dans votre projet Render
- **Environment** > **Environment Variables**
- Ajoutez chaque variable avec sa valeur

#### Vercel
- Allez dans votre projet Vercel
- **Settings** > **Environment Variables**
- Ajoutez chaque variable avec sa valeur

### 4. Test de Configuration

Après avoir configuré les variables d'environnement, redémarrez votre serveur de développement :

```bash
npm run dev
```

Puis testez l'upload de documents dans la page de vérification KYC.

### 5. Sécurité

⚠️ **Important** : 
- Ne commitez jamais le fichier `.env` dans Git
- Les variables d'environnement sont déjà dans `.gitignore`
- Utilisez des variables d'environnement différentes pour chaque environnement (dev, staging, prod)

### 6. Dépannage

Si vous rencontrez des erreurs :

1. **Vérifiez que le fichier `.env` existe** dans le dossier `frontend/`
2. **Redémarrez le serveur de développement** après avoir modifié `.env`
3. **Vérifiez les valeurs** des variables d'environnement
4. **Consultez la console du navigateur** pour les erreurs détaillées

### 7. Structure des Dossiers Cloudinary

Les documents KYC seront organisés comme suit dans Cloudinary :
```
kyc_documents/
├── user_id_1/
│   ├── identity/
│   ├── address/
│   ├── income/
│   └── bankStatement/
└── user_id_2/
    └── ...
```

Cette structure facilite la gestion et la sécurité des documents par utilisateur.
