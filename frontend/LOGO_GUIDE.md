# Guide d'utilisation des logos AmCbunq

## Fichiers disponibles

### 1. Logo principal (`/public/logo.svg`)
- **Format** : SVG vectoriel
- **Dimensions** : 200x60px
- **Usage** : Header principal, pages publiques, documents officiels
- **Caractéristiques** : Logo complet avec texte "AmCbunq" et tagline

### 2. Logo simplifié (`/public/logo-simple.svg`)
- **Format** : SVG vectoriel
- **Dimensions** : 40x40px
- **Usage** : Sidebar, favicon, icônes d'application
- **Caractéristiques** : Icône seule sans texte

### 3. Favicon (`/public/favicon.svg`)
- **Format** : SVG vectoriel
- **Dimensions** : 32x32px
- **Usage** : Onglets de navigateur, bookmarks
- **Caractéristiques** : Icône circulaire avec fond coloré

### 4. Manifeste web (`/public/manifest.json`)
- **Usage** : Installation PWA, métadonnées d'application
- **Contenu** : Configuration complète pour l'installation

## Composants React

### 1. `<Logo />` - Composant principal
```tsx
import Logo from '../components/Logo';

// Logo complet
<Logo variant="full" size="md" showTagline={true} />

// Logo simplifié
<Logo variant="simple" size="lg" />

// Icône seule
<Logo variant="icon" size="sm" />
```

**Props disponibles :**
- `variant` : 'full' | 'simple' | 'icon'
- `size` : 'sm' | 'md' | 'lg' | 'xl'
- `className` : Classes CSS personnalisées
- `showTagline` : Afficher/masquer la tagline (défaut: true)

### 2. `<HeroLogo />` - Logo pour page d'accueil
```tsx
import HeroLogo from '../components/HeroLogo';

// Logo avec animations
<HeroLogo animated={true} />

// Logo statique
<HeroLogo animated={false} />
```

## Utilisation dans les layouts

### PublicLayout
```tsx
<Logo variant="full" size="md" showTagline={false} />
```

### DashboardLayout
```tsx
<Logo variant="simple" size="md" />
```

## Couleurs et style

### Palette de couleurs
- **Bleu principal** : #2563eb
- **Bleu secondaire** : #3b82f6
- **Bleu foncé** : #1d4ed8
- **Gris clair** : #64748b
- **Gris moyen** : #94a3b8

### Typographie
- **Police principale** : Inter
- **Poids** : 300 (light), 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

## Responsive Design

Les logos s'adaptent automatiquement aux différentes tailles d'écran :
- **Mobile** : Taille réduite pour optimiser l'espace
- **Tablet** : Taille intermédiaire
- **Desktop** : Taille complète avec tagline

## Animations CSS

### Effet de brillance
```css
.animate-shine {
  animation: shine 2s ease-in-out infinite;
}
```

### Apparition progressive
```css
.animate-fade-in {
  animation: fade-in 1s ease-out forwards;
}
```

## Bonnes pratiques

1. **Toujours utiliser le composant React** au lieu d'images statiques
2. **Respecter les proportions** des logos
3. **Maintenir l'espacement** autour du logo
4. **Utiliser la bonne variante** selon le contexte
5. **Tester la lisibilité** sur différents fonds

## Support des navigateurs

- **SVG** : Support complet sur tous les navigateurs modernes
- **Fallback** : Les navigateurs plus anciens afficheront le logo en PNG
- **PWA** : Support complet pour l'installation d'application
