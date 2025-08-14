# 🚀 Création Automatique des Sous-Documents Utilisateur

## 📋 Vue d'ensemble

Ce système permet de créer automatiquement **tous les sous-documents** lors de la création d'un compte utilisateur, en s'inspirant de la structure complète de l'utilisateur Erich Schubert. Certains éléments sont visibles immédiatement, tandis que d'autres ne deviennent visibles qu'après vérification KYC.

## 🎯 Objectifs

- ✅ **Création automatique** de tous les sous-documents lors de l'inscription
- 🔒 **Visibilité conditionnelle** selon le statut KYC
- 🏗️ **Structure cohérente** pour tous les utilisateurs
- 🚀 **Expérience utilisateur fluide** dès la création du compte

## 🏗️ Architecture

### Services Principaux

#### 1. `UserSetupService` (`frontend/src/services/userSetupService.ts`)
Service principal qui gère la création de tous les sous-documents :

```typescript
static async createCompleteUserSetup(userId: string, userData: UserSetupData): Promise<void>
```

**Fonctionnalités :**
- Création du document utilisateur principal
- Création des comptes bancaires par défaut
- Création de la facturation (masquée jusqu'à KYC verified)
- Création des budgets par défaut
- Création des préférences de notifications
- Création des limites de carte
- Création des documents par défaut
- Création des transactions initiales
- Création des bénéficiaires par défaut
- Création des virements par défaut

#### 2. `KycVisibilityService` (`frontend/src/services/kycVisibilityService.ts`)
Service qui gère la visibilité des éléments selon le statut KYC :

```typescript
static async updateVisibilityAfterKyc(userId: string): Promise<void>
static async canViewSensitiveElements(userId: string): Promise<boolean>
static async getVisibleElements(userId: string): Promise<{...}>
```

**Fonctionnalités :**
- Mise à jour de la visibilité après vérification KYC
- Vérification des permissions d'accès
- Gestion des éléments visibles selon le statut

### Composants React

#### 1. `KycStatusBanner` (`frontend/src/components/KycStatusBanner.tsx`)
Bannière qui affiche le statut KYC et guide l'utilisateur :

- **Statut unverified** : Bouton "Commencer la vérification"
- **Statut pending** : Message "Vérification en cours"
- **Statut rejected** : Bouton "Réessayer la vérification"
- **Statut verified** : Bannière masquée

#### 2. `ConditionalVisibility` (`frontend/src/components/ConditionalVisibility.tsx`)
Composant qui gère la visibilité conditionnelle des éléments :

```typescript
<ConditionalVisibility requireKyc={true} requireEmailVerified={true}>
  <SensitiveContent />
</ConditionalVisibility>
```

### Hook Personnalisé

#### `useAuth` (`frontend/src/hooks/useAuth.ts`)
Hook qui gère l'état de l'authentification Firebase :

```typescript
const { user, loading, isAuthenticated, userId } = useAuth();
```

## 🔄 Flux de Création

### 1. Inscription Utilisateur
```typescript
// Dans RegisterPage.tsx
const userCredential = await createUserWithEmailAndPassword(auth, email, password);
const userId = userCredential.user.uid;

// Création automatique de tous les sous-documents
await UserSetupService.createCompleteUserSetup(userId, userData);
```

### 2. Structure Créée Automatiquement
```
users/{userId}/
├── firstName, lastName, email, phone, etc.
├── accounts: [checking-1, savings-1, credit-1]
├── billing: { billingVisible: false, ... }
├── budgets: [alimentation, transport, loisirs]
├── notificationPrefs: { email: true, security: true, ... }
├── cardLimits: { monthly: 2000, withdrawal: 500 }
├── documents: [identity, proof_of_address]
├── transactions: [initialization]
├── beneficiaries: [self]
├── transfers: []
└── kycStatus: 'unverified'
```

### 3. Visibilité Conditionnelle
- **Immédiatement visible** : Comptes, budgets, limites de carte, documents
- **Après KYC verified** : Facturation, virements, bénéficiaires

## 🎨 Utilisation dans l'Interface

### Bannière de Statut KYC
```typescript
import KycStatusBanner from '../components/KycStatusBanner';

// Dans le layout principal
<KycStatusBanner className="mb-4" />
```

### Visibilité Conditionnelle
```typescript
import ConditionalVisibility from '../components/ConditionalVisibility';

// Contenu visible seulement après KYC verified
<ConditionalVisibility requireKyc={true}>
  <BillingSection />
  <TransfersSection />
</ConditionalVisibility>

// Contenu visible seulement après email verified
<ConditionalVisibility requireEmailVerified={true}>
  <EmailVerifiedContent />
</ConditionalVisibility>
```

## 🧪 Tests

### Script de Test
Le fichier `test-user-setup.cjs` permet de tester la création automatique :

```bash
# Configurer les variables d'environnement Firebase
export FIREBASE_API_KEY="your-api-key"
export FIREBASE_AUTH_DOMAIN="your-domain"
export FIREBASE_PROJECT_ID="your-project-id"
# ... autres variables

# Exécuter le test
node test-user-setup.cjs
```

### Vérifications Automatiques
Le script vérifie que tous les sous-documents sont créés :
- ✅ Comptes bancaires
- ✅ Facturation
- ✅ Budgets
- ✅ Préférences de notifications
- ✅ Limites de carte
- ✅ Documents
- ✅ Transactions
- ✅ Bénéficiaires
- ✅ Virements

## 🔧 Configuration

### Variables d'Environnement
```bash
# Firebase
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-domain
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-bucket
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

### Règles Firestore
Les règles Firestore doivent permettre la création et la mise à jour des documents utilisateur :

```javascript
match /users/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
  allow create: if request.auth != null && request.auth.uid == userId;
}
```

## 📱 Traductions

### Clés de Traduction Ajoutées
```json
{
  "kyc": {
    "loading": "Chargement du statut KYC...",
    "verifiedMessage": "Compte vérifié",
    "pendingMessage": "Vérification en cours",
    "rejectedMessage": "Vérification rejetée",
    "unverifiedMessage": "Vérification requise",
    "unverifiedDescription": "Complétez votre vérification d'identité pour accéder à toutes les fonctionnalités",
    "pendingDescription": "Votre demande de vérification est en cours de traitement",
    "rejectedDescription": "Votre demande de vérification a été rejetée. Veuillez la soumettre à nouveau",
    "startVerification": "Commencer la vérification",
    "retryVerification": "Réessayer la vérification",
    "verificationInProgress": "Vérification en cours..."
  }
}
```

## 🚀 Déploiement

### 1. Mise à Jour du Code
```bash
# Copier les nouveaux fichiers
cp frontend/src/services/userSetupService.ts /path/to/project/
cp frontend/src/services/kycVisibilityService.ts /path/to/project/
cp frontend/src/components/KycStatusBanner.tsx /path/to/project/
cp frontend/src/components/ConditionalVisibility.tsx /path/to/project/
cp frontend/src/hooks/useAuth.ts /path/to/project/

# Mettre à jour RegisterPage.tsx
# Mettre à jour les traductions
```

### 2. Vérification
```bash
# Tester la création d'un utilisateur
# Vérifier que tous les sous-documents sont créés
# Tester la visibilité conditionnelle
```

## 🔍 Dépannage

### Problèmes Courants

#### 1. Sous-documents non créés
- Vérifier les règles Firestore
- Vérifier les permissions Firebase
- Vérifier les logs d'erreur

#### 2. Visibilité non mise à jour
- Vérifier le statut KYC dans Firestore
- Vérifier la fonction `updateVisibilityAfterKyc`
- Vérifier les composants `ConditionalVisibility`

#### 3. Erreurs de traduction
- Vérifier que toutes les clés sont présentes
- Vérifier la configuration i18n
- Vérifier les fichiers de traduction

### Logs de Débogage
Le système utilise le logger configuré avec des emojis pour faciliter le débogage :
- 🔄 Création en cours
- ✅ Succès
- ❌ Erreur
- 🔍 Vérification

## 📈 Évolutions Futures

### Fonctionnalités Prévues
- [ ] Création automatique de cartes virtuelles
- [ ] Configuration personnalisée des budgets par défaut
- [ ] Templates de facturation personnalisables
- [ ] Intégration avec des services tiers
- [ ] Analytics sur la création des comptes

### Améliorations Techniques
- [ ] Cache des vérifications de visibilité
- [ ] Synchronisation en temps réel
- [ ] Gestion des erreurs avancée
- [ ] Tests unitaires complets
- [ ] Documentation API

## 🤝 Contribution

### Ajout de Nouveaux Sous-Documents
1. Ajouter la logique dans `UserSetupService`
2. Mettre à jour les règles de visibilité
3. Ajouter les traductions nécessaires
4. Créer les tests correspondants
5. Mettre à jour cette documentation

### Modification des Règles de Visibilité
1. Mettre à jour `KycVisibilityService`
2. Adapter les composants `ConditionalVisibility`
3. Mettre à jour les tests
4. Documenter les changements

---

## 📞 Support

Pour toute question ou problème :
1. Consulter les logs de débogage
2. Vérifier la configuration Firebase
3. Tester avec le script de test
4. Consulter cette documentation
5. Contacter l'équipe de développement

---

**Version :** 1.0.0  
**Dernière mise à jour :** Août 2025  
**Auteur :** Équipe AMCB
