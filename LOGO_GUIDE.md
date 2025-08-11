# Guide des Logos AmCBunq

## Vue d'ensemble
AmCBunq dispose maintenant de trois variantes de logos modernes et cohérents, tous basés sur le design principal avec les couleurs "vert et bleu roi".

## Recommandations d'utilisation par type de page

### 🏠 Pages publiques (PublicLayout)
- **Logo recommandé** : `variant="full"` (logo complet)
- **Usage** : Pages d'accueil, fonctionnalités, tarifs, aide
- **Raison** : Présentation complète de la marque avec tagline

### 🔐 Pages d'authentification
- **Logo recommandé** : `variant="simple"` (logo simple)
- **Usage** : Connexion, inscription
- **Raison** : Interface épurée, focus sur l'action

### 📊 Dashboard et pages authentifiées
- **Logo recommandé** : `variant="simple"` (logo simple)
- **Usage** : Sidebar, navigation interne
- **Raison** : Espace limité, reconnaissance rapide

## Fichiers de logos

### 1. Logo Principal (`/public/logo.svg`)
- **Dimensions** : 280x90 pixels
- **Usage** : Pages principales, headers, sections hero
- **Caractéristiques** :
  - Icône portefeuille avec carré bleu roi (#1d4ed8)
  - Texte "AmC bunq" avec "AmC" en bleu roi
  - Tagline "The bank of the future, today"
  - Gradients modernes et effets d'ombre

### 2. Logo Simple (`/public/logo-simple.svg`)
- **Dimensions** : 120x40 pixels
- **Usage** : Navigation, sidebars, contextes compacts
- **Caractéristiques** :
  - Icône portefeuille + texte "AmC"
  - Version allégée pour les espaces restreints

### 3. Favicon (`/public/favicon.svg`)
- **Dimensions** : 32x32 pixels
- **Usage** : Onglets de navigateur, bookmarks, PWA
- **Caractéristiques** :
  - Icône portefeuille centrée
  - Couleur bleu roi (#1d4ed8)

## Composants React

### Logo.tsx
Composant principal pour afficher les logos avec différentes variantes :

```tsx
import Logo from './components/Logo';

// Logo complet avec tagline
<Logo variant="full" size="lg" showTagline={true} />

// Logo simple (icône + AmC)
<Logo variant="simple" size="md" />

// Icône seule
<Logo variant="icon" size="sm" />

// Tailles disponibles
<Logo size="sm" />    // h-8 md:h-10
<Logo size="md" />    // h-10 md:h-12
<Logo size="lg" />    // h-14 md:h-18
<Logo size="xl" />    // h-18 md:h-22
<Logo size="hero" />  // h-24 md:h-36
```

### HeroLogo.tsx
Composant spécialisé pour les sections hero avec animations :

```tsx
import HeroLogo from './components/HeroLogo';

<HeroLogo 
  animated={true}
  showTagline={true}
  floating={true}
/>
```

## Propriétés des composants

### Logo.tsx
- `variant` : 'full' | 'simple' | 'icon'
- `size` : 'sm' | 'md' | 'lg' | 'xl' | 'hero'
- `showTagline` : boolean (pour variant 'full')
- `responsive` : boolean (adaptation mobile)
- `animated` : boolean (effets de survol)

### HeroLogo.tsx
- `animated` : boolean (animations CSS)
- `showTagline` : boolean (affichage tagline)
- `floating` : boolean (animation flottante)

## Animations CSS

### Classes disponibles
- `animate-float` : Mouvement vertical flottant
- `animate-pulse-glow` : Pulsation de l'ombre
- `animate-shine` : Effet de brillance
- `logo-hover` : Effets au survol
- `logo-responsive` : Adaptation responsive

### Keyframes définis
```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}

@keyframes pulse-glow {
  0%, 100% { filter: drop-shadow(0 0 20px rgba(29, 78, 216, 0.3)); }
  50% { filter: drop-shadow(0 0 30px rgba(29, 78, 216, 0.5)); }
}

@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```