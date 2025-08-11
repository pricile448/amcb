# 🌍 Configuration des domaines par langue avec Render

## 📋 Vue d'ensemble

Cette configuration utilise votre domaine existant [mybunq.amccredit.com](https://mybunq.amccredit.com/) comme base et crée des sous-domaines pour chaque langue :

### 🎯 Domaines configurés

| Langue | Domaine principal | Domaine alternatif | Service Render |
|--------|------------------|-------------------|----------------|
| 🇫🇷 Français | `mybunq.amccredit.com` | `www.mybunq.amccredit.com` | `mybunq-frontend-fr` |
| 🇬🇧 Anglais | `en.mybunq.amccredit.com` | `mybunq-en.amccredit.com` | `mybunq-frontend-en` |
| 🇪🇸 Espagnol | `es.mybunq.amccredit.com` | `mybunq-es.amccredit.com` | `mybunq-frontend-es` |
| 🇵🇹 Portugais | `pt.mybunq.amccredit.com` | `mybunq-pt.amccredit.com` | `mybunq-frontend-pt` |
| 🇮🇹 Italien | `it.mybunq.amccredit.com` | `mybunq-it.amccredit.com` | `mybunq-frontend-it` |
| 🇳🇱 Néerlandais | `nl.mybunq.amccredit.com` | `mybunq-nl.amccredit.com` | `mybunq-frontend-nl` |
| 🇩🇪 Allemand | `de.mybunq.amccredit.com` | `mybunq-de.amccredit.com` | `mybunq-frontend-de` |

## 🚀 Étapes de déploiement

### 1. Préparer les sous-domaines

Avec votre domaine existant [mybunq.amccredit.com](https://mybunq.amccredit.com/), vous devez :
- ✅ Configurer les sous-domaines DNS (en.*, es.*, etc.)
- ✅ Créer 6 nouveaux services Render (votre service FR existe déjà)
- ✅ Les certificats SSL sont automatiquement générés par Render

### 2. Déployer sur Render

```bash
# 1. Pousser vos changements
git add .
git commit -m "feat: Configuration domaines multiples pour Render"
git push origin main

# 2. Créer le déploiement sur Render
# Utilisez le fichier render.yaml qui a été mis à jour
```

### 3. Configuration DNS requise

Pour chaque domaine, configurez les enregistrements DNS :

#### Sous-domaines sur votre domaine existant
```dns
# Sous-domaines sur amccredit.com (via votre registraire de domaines)
CNAME en.mybunq          mybunq-frontend-en.onrender.com
CNAME es.mybunq          mybunq-frontend-es.onrender.com
CNAME pt.mybunq          mybunq-frontend-pt.onrender.com
CNAME it.mybunq          mybunq-frontend-it.onrender.com
CNAME nl.mybunq          mybunq-frontend-nl.onrender.com
CNAME de.mybunq          mybunq-frontend-de.onrender.com

# Domaines alternatifs avec tiret
CNAME mybunq-en          mybunq-frontend-en.onrender.com
CNAME mybunq-es          mybunq-frontend-es.onrender.com
CNAME mybunq-pt          mybunq-frontend-pt.onrender.com
CNAME mybunq-it          mybunq-frontend-it.onrender.com
CNAME mybunq-nl          mybunq-frontend-nl.onrender.com
CNAME mybunq-de          mybunq-frontend-de.onrender.com
```

### 4. Configuration des services Render

Dans votre dashboard Render :

1. **Créer 7 services web séparés** (un par langue)
2. **Connecter chaque service** à votre repo GitHub
3. **Ajouter les domaines personnalisés** pour chaque service
4. **Vérifier les variables d'environnement** (définies dans render.yaml)

## 🔧 Variables d'environnement par service

Chaque service a ses propres variables :

```yaml
# Service FR
VITE_DEFAULT_LANGUAGE: fr
VITE_DOMAIN_LANGUAGE: fr

# Service EN  
VITE_DEFAULT_LANGUAGE: en
VITE_DOMAIN_LANGUAGE: en

# etc.
```

## 🧪 Tests

### Test en local
```bash
# Simuler différents domaines en local
echo "127.0.0.1 amcbunq.fr" >> /etc/hosts
echo "127.0.0.1 amcbunq.com" >> /etc/hosts
# etc.

npm run dev
```

### Test en production
1. Visitez chaque domaine
2. Vérifiez que la langue s'affiche correctement
3. Testez le changement de langue (doit rediriger vers le bon domaine)

## 📊 Monitoring et SEO

### URLs canoniques
Chaque page aura des URLs canoniques appropriées :
```html
<!-- Sur amcbunq.fr -->
<link rel="canonical" href="https://amcbunq.fr/dashboard" />

<!-- Sur amcbunq.com -->
<link rel="canonical" href="https://amcbunq.com/dashboard" />
```

### Liens hreflang
```html
<link rel="alternate" hreflang="fr" href="https://amcbunq.fr/dashboard" />
<link rel="alternate" hreflang="en" href="https://amcbunq.com/dashboard" />
<link rel="alternate" hreflang="es" href="https://amcbunq.es/dashboard" />
<!-- etc. -->
```

## 🔍 Dépannage

### Problème : Service ne démarre pas
```bash
# Vérifier les logs Render
# Dashboard > Service > Logs
```

### Problème : Domaine ne se connecte pas
1. Vérifiez la configuration DNS
2. Attendez la propagation DNS (jusqu'à 48h)
3. Vérifiez le certificat SSL dans Render

### Problème : Mauvaise langue affichée
1. Vérifiez `VITE_DOMAIN_LANGUAGE` dans les variables d'env
2. Videz le cache du navigateur
3. Vérifiez la détection de domaine dans les DevTools

## 📈 Avantages de cette configuration

### ✅ SEO optimisé
- URLs spécifiques par langue
- Meilleur référencement local
- Liens hreflang automatiques

### ✅ UX améliorée  
- Langue automatique selon le domaine
- Redirection intelligente
- Cohérence linguistique

### ✅ Marketing ciblé
- Campagnes par pays/langue
- Analytics séparées
- Contenu localisé

## 🛠️ Maintenance

### Ajouter une nouvelle langue
1. Ajouter le service dans `render.yaml`
2. Mettre à jour `domainLanguageDetector.ts`
3. Ajouter les traductions dans `/locales/`
4. Configurer le domaine et DNS

### Mettre à jour les traductions
Les traductions se mettent automatiquement sur tous les domaines lors du déploiement.

### Monitoring
- Surveillez les métriques par domaine dans Render
- Configurez des alertes pour chaque service
- Suivez les performances SEO par domaine

## 🎉 Résultat final

Après cette configuration, vous aurez :
- ✅ 7 domaines fonctionnels, un par langue
- ✅ Détection automatique de langue par domaine  
- ✅ Redirection automatique lors du changement de langue
- ✅ SEO optimisé pour chaque marché
- ✅ Infrastructure scalable et maintenable
