# Configuration Cloudinary pour KYC

## 🎯 Vue d'ensemble

Ce guide explique comment configurer Cloudinary pour l'upload des documents KYC dans l'application AmCbunq.

## 📋 Prérequis

1. Compte Cloudinary (gratuit disponible)
2. Accès à la console Cloudinary
3. Variables d'environnement configurées

## 🔧 Configuration Cloudinary

### 1. Créer un compte Cloudinary

1. Allez sur [cloudinary.com](https://cloudinary.com)
2. Créez un compte gratuit
3. Notez votre **Cloud Name** depuis le dashboard

### 2. Configurer l'Upload Preset

1. Dans votre console Cloudinary, allez dans **Settings > Upload**
2. Créez un nouvel **Upload Preset** nommé `kyc-documents`
3. Configurez les paramètres suivants :

```json
{
  "name": "kyc-documents",
  "folder": "kyc-documents",
  "allowed_formats": ["jpg", "jpeg", "png", "pdf", "heic", "heif"],
  "max_file_size": "10485760", // 10MB
  "resource_type": "auto",
  "access_mode": "public",
  "invalidate": true
}
```

### 3. Variables d'environnement

Ajoutez ces variables à votre fichier `.env` :

```env
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=kyc-documents
```

## 🚀 Utilisation

### Upload de documents

```typescript
import { cloudinaryService } from '../services/cloudinaryService';

// Upload d'un fichier
const result = await cloudinaryService.uploadFile(file, 'kyc-documents/user123');
console.log('URL:', result.secure_url);
console.log('Public ID:', result.public_id);
```

### Validation de fichiers

```typescript
const validation = cloudinaryService.validateFile(file);
if (!validation.isValid) {
  console.error(validation.error);
}
```

## 📁 Structure des dossiers

Les documents sont organisés comme suit dans Cloudinary :

```
kyc-documents/
├── user123/
│   ├── identity_document.jpg
│   ├── address_proof.pdf
│   └── income_statement.png
└── user456/
    └── ...
```

## 🔒 Sécurité

### Upload Preset sécurisé

Pour la production, configurez votre Upload Preset avec :

- **Signing Mode**: `Signed`
- **Access Mode**: `Authenticated`
- **Allowed Transformations**: Limitez les transformations autorisées

### Suppression sécurisée

```typescript
// Supprimer un fichier avec token de suppression
const success = await cloudinaryService.deleteFile(publicId);
```

## 📊 Monitoring

### Dashboard Cloudinary

- Surveillez l'utilisation dans le dashboard Cloudinary
- Vérifiez les logs d'upload
- Surveillez les erreurs

### Logs applicatifs

Les services Cloudinary et KYC génèrent des logs détaillés :

```typescript
logger.debug('Upload début:', { fileName, size });
logger.success('Upload réussi:', { publicId, url });
logger.error('Erreur upload:', error);
```

## 🧪 Tests

### Test d'upload

```typescript
// Test avec un fichier de test
const testFile = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
const result = await cloudinaryService.uploadFile(testFile);
console.log('Test upload réussi:', result.secure_url);
```

### Test de validation

```typescript
const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg');
const validation = cloudinaryService.validateFile(largeFile);
console.log('Validation:', validation); // { isValid: false, error: 'Fichier trop volumineux' }
```

## 🔄 Workflow KYC

1. **Soumission** : Utilisateur upload un document
2. **Validation** : Vérification du type et de la taille
3. **Upload** : Envoi vers Cloudinary
4. **Sauvegarde** : Enregistrement dans Firestore
5. **Statut** : Mise à jour du statut KYC
6. **Notification** : Informer l'utilisateur

## 🚨 Dépannage

### Erreurs courantes

1. **"Upload preset not found"**
   - Vérifiez le nom du preset dans les variables d'environnement
   - Assurez-vous que le preset existe dans Cloudinary

2. **"File too large"**
   - Vérifiez la limite de taille dans le preset
   - Ajustez `max_file_size` si nécessaire

3. **"Invalid file type"**
   - Vérifiez `allowed_formats` dans le preset
   - Ajoutez les formats manquants

### Logs de débogage

Activez les logs détaillés :

```typescript
logger.debug('Cloudinary config:', {
  cloudName: this.cloudName,
  uploadPreset: this.uploadPreset
});
```

## 📈 Optimisation

### Transformations automatiques

Configurez des transformations automatiques dans le preset :

```json
{
  "transformation": [
    { "quality": "auto" },
    { "fetch_format": "auto" }
  ]
}
```

### CDN

Cloudinary fournit automatiquement un CDN global pour des performances optimales.

## 🔐 Production

### Variables d'environnement de production

```env
VITE_CLOUDINARY_CLOUD_NAME=your-production-cloud-name
VITE_CLOUDINARY_UPLOAD_PRESET=kyc-documents-prod
```

### Monitoring de production

- Surveillez les métriques d'upload
- Configurez des alertes pour les erreurs
- Vérifiez régulièrement l'utilisation du stockage

---

## 📞 Support

Pour toute question sur la configuration Cloudinary :

1. Consultez la [documentation Cloudinary](https://cloudinary.com/documentation)
2. Vérifiez les logs de l'application
3. Contactez l'équipe de développement
