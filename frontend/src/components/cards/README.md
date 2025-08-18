# Système de Cartes AmCbunq

Ce dossier contient tous les composants nécessaires pour afficher et gérer les cartes bancaires (physiques et virtuelles) dans l'application AmCbunq.

## Composants disponibles

### 1. CardDisplay
Composant principal pour afficher une carte individuelle avec tous ses états possibles.

**Props :**
- `cardData`: Données de la carte depuis Firestore
- `cardStatus`: Statut de la carte ('none', 'pending', 'processing', 'completed', 'rejected')
- `cardType`: Type de carte ('physical' ou 'virtual')
- `onRequestCard`: Fonction pour demander une nouvelle carte
- `isRequesting`: État de chargement de la demande
- `showCardDetails`: Afficher/masquer les détails sensibles
- `onToggleCardDetails`: Fonction pour basculer l'affichage des détails

### 2. PhysicalCardMessage
Composant pour afficher les messages spécifiques aux cartes physiques.

**Props :**
- `cardData`: Données de la carte physique
- `cardStatus`: Statut de la carte

### 3. VirtualCardMessage
Composant pour afficher les messages spécifiques aux cartes virtuelles.

**Props :**
- `cardData`: Données de la carte virtuelle
- `cardStatus`: Statut de la carte

### 4. CardsSummary
Composant de résumé affichant le nombre de cartes par statut.

**Props :**
- `physicalCardData`: Données de la carte physique
- `virtualCardData`: Données de la carte virtuelle
- `physicalCardStatus`: Statut de la carte physique
- `virtualCardStatus`: Statut de la carte virtuelle

### 5. CardsSecurity
Composant affichant les informations de sécurité et les conseils.

### 6. CardsSupport
Composant affichant les options de support et d'aide.

### 7. CardsDemo
Composant de démonstration pour tester tous les états des cartes.

## Utilisation

### Affichage basique d'une carte
```tsx
import { CardDisplay } from '../components/cards';

<CardDisplay
  cardData={cardData}
  cardStatus="completed"
  cardType="physical"
  onRequestCard={handleRequestCard}
  isRequesting={false}
/>
```

### Affichage avec messages
```tsx
import { CardDisplay, PhysicalCardMessage } from '../components/cards';

<div>
  <PhysicalCardMessage 
    cardData={cardData}
    cardStatus={cardStatus}
  />
  
  <CardDisplay
    cardData={cardData}
    cardStatus={cardStatus}
    cardType="physical"
    onRequestCard={handleRequestCard}
    isRequesting={false}
  />
</div>
```

## États des cartes

### 1. none
- Aucune carte demandée
- Affiche le bouton pour demander une carte

### 2. pending/processing
- Carte en cours de génération
- Affiche un message d'attente avec délai
- Affiche les informations de suivi

### 3. completed
- Carte disponible et active
- Affiche les détails de la carte
- Permet de voir/masquer les informations sensibles

### 4. rejected
- Demande rejetée
- Affiche un message d'erreur
- Permet de faire une nouvelle demande

## Intégration avec Firestore

Les composants utilisent le service `cardService` qui :
- Récupère les données des cartes depuis Firestore
- Met à jour les statuts en temps réel
- Gère les demandes de nouvelles cartes
- Synchronise les données entre les collections

## Sécurité

- Les numéros de cartes sont partiellement masqués par défaut
- Les CVV sont toujours masqués
- Bouton pour afficher/masquer les détails sensibles
- Gestion des permissions d'accès aux données

## Personnalisation

Tous les composants utilisent les traductions i18n pour :
- Les textes d'interface
- Les messages d'état
- Les descriptions des cartes
- Les informations de sécurité

## Tests

Utilisez le composant `CardsDemo` pour tester tous les états des cartes et vérifier le bon fonctionnement de l'interface.
