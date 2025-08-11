# 📋 Logique Métier IBAN - Guide Complet

## 🎯 **PRINCIPE FONDAMENTAL**

**L'IBAN n'est PAS automatique, même pour un compte vérifié !**

## 🔄 **PROCESSUS COMPLET**

### **1. ÉTAPES PRÉALABLES**
- ✅ **Création de compte** → Compte créé
- ✅ **Vérification d'identité (KYC)** → `kycStatus: "verified"`
- ❌ **IBAN** → **NON automatique**

### **2. DEMANDE D'IBAN**
- 🔄 **Utilisateur va sur la page IBAN**
- 🔄 **Clique sur "Demander mon RIB"**
- 🔄 **Demande enregistrée** → `status: "processing"`
- ⏳ **Délai de traitement** → **24-48h**

### **3. DISPONIBILITÉ**
- ✅ **Après 24-48h** → `status: "available"`
- ✅ **IBAN affiché** → Numéro complet visible
- ✅ **Actions disponibles** → Copier, télécharger, partager

## 📱 **AFFICHAGE PAR PAGE**

### **🏠 Dashboard Principal**
- ❌ **Aucun IBAN affiché**
- ✅ **Solde des comptes uniquement**
- ✅ **Liens vers les pages spécialisées**

### **💳 Page Comptes**
- ❌ **Aucun IBAN affiché**
- ✅ **Numéro de compte masqué** (FR76 **** **** ****)
- ✅ **Solde et transactions**
- ✅ **Actions sur les comptes**

### **🏦 Page IBAN**
- ✅ **Statut de la demande**
- ✅ **IBAN complet** (si disponible)
- ✅ **Actions IBAN** (copier, télécharger)
- ✅ **Bouton de demande** (si pas encore demandé)

## 🎨 **STATUTS IBAN**

### **`unavailable`**
- **Quand** : Compte non vérifié
- **Affichage** : Message d'erreur rouge
- **Action** : Aucune

### **`request_required`**
- **Quand** : Compte vérifié, pas de demande
- **Affichage** : Bouton "Demander mon RIB"
- **Action** : Permettre la demande

### **`processing`**
- **Quand** : Demande en cours
- **Affichage** : Message "En cours de génération"
- **Action** : Aucune (attendre)

### **`available`**
- **Quand** : IBAN généré et disponible
- **Affichage** : IBAN complet + actions
- **Action** : Copier, télécharger, partager

## 🔧 **IMPLÉMENTATION TECHNIQUE**

### **Service FirebaseDataService**
```typescript
// Demande d'IBAN
static async requestIban(userId: string): Promise<boolean>

// Récupération IBAN
static async getUserIban(userId: string): Promise<FirebaseIban | null>
```

### **Interface FirebaseIban**
```typescript
interface FirebaseIban {
  id: string;
  userId: string;
  iban: string;
  bic: string;
  accountHolder: string;
  bankName: string;
  accountType: string;
  status: 'unavailable' | 'request_required' | 'processing' | 'available';
  balance: number;
  currency: string;
}
```

## 🚫 **CE QUI N'EST PAS AFFICHÉ**

### **Dashboard**
- ❌ Numéro IBAN
- ❌ Code BIC/SWIFT
- ❌ Informations bancaires détaillées

### **Page Comptes**
- ❌ Numéro IBAN
- ❌ Code BIC/SWIFT
- ❌ Bouton de demande IBAN

### **Autres Pages**
- ❌ IBAN dans les notifications
- ❌ IBAN dans les messages
- ❌ IBAN dans les documents

## ✅ **VALIDATION**

### **Scénarios de Test**
1. **Compte non vérifié** → IBAN non disponible
2. **Compte vérifié, pas de demande** → Bouton de demande
3. **Demande en cours** → Message d'attente
4. **IBAN disponible** → Affichage complet

### **Points de Contrôle**
- ✅ Dashboard sans IBAN
- ✅ Page comptes sans IBAN
- ✅ Page IBAN avec logique correcte
- ✅ Délai 24-48h respecté
- ✅ Actions appropriées selon le statut

## 📞 **Support**

En cas de question sur la logique métier IBAN, consulter ce guide ou contacter l'équipe technique. 