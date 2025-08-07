# 🔧 Solution complète pour l'erreur 404 Firebase

## 🚨 Problème identifié
L'erreur 404 persiste car Firebase utilise toujours l'URL `cloudworkstations.dev` au lieu de votre application locale.

## ✅ Solution universelle

### 1. **Configuration Firebase Console (OBLIGATOIRE)**

#### Étape 1: Accéder aux templates
1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionner votre projet
3. **Authentication** → **Settings** → **Templates**

#### Étape 2: Configurer Email verification
1. **Sélectionner** : "Email verification"
2. **Cliquer** : "Edit template"
3. **Modifier** :
   - **Subject** : `Vérifiez votre compte AmCbunq`
   - **Action URL** : `http://localhost:5174/auth/action` ⚠️ **IMPORTANT**
   - **Template HTML** : (voir ci-dessous)

#### Étape 3: Template HTML moderne
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vérifiez votre compte AmCbunq</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
      <div style="background-color: white; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
        <span style="font-size: 24px; font-weight: bold; color: #667eea;">A</span>
      </div>
      <h1 style="color: white; margin: 0; font-size: 28px;">AmCbunq</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;">Votre banque moderne</p>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 30px;">
      <h2 style="color: #333; margin: 0 0 20px; font-size: 24px;">Bonjour !</h2>
      
      <p style="color: #666; line-height: 1.6; margin-bottom: 25px;">
        Merci de vous être inscrit sur AmCbunq ! Pour activer votre compte et commencer à utiliser nos services, 
        veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous.
      </p>
      
      <div style="text-align: center; margin: 35px 0;">
        <a href="{{LINK}}" 
           style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                  color: white; 
                  padding: 15px 30px; 
                  text-decoration: none; 
                  border-radius: 8px; 
                  font-weight: bold; 
                  display: inline-block; 
                  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
          ✅ Vérifier mon compte
        </a>
      </div>
      
      <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
        Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien dans votre navigateur :
      </p>
      
      <p style="background-color: #f8f9fa; padding: 15px; border-radius: 6px; word-break: break-all;">
        <a href="{{LINK}}" style="color: #667eea; text-decoration: none;">{{LINK}}</a>
      </p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 14px; margin: 0;">
          Ce lien expirera dans 24 heures. Si vous n'avez pas créé de compte sur AmCbunq, 
          vous pouvez ignorer cet email en toute sécurité.
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
      <p style="color: #999; margin: 0; font-size: 12px;">
        © 2024 AmCbunq. Tous droits réservés.
      </p>
    </div>
  </div>
</body>
</html>
```

#### Étape 4: Sauvegarder
- **Cliquer** sur "Save"
- **Attendre** 2-3 minutes pour la propagation

### 2. **Autoriser les domaines**

Dans **Authentication** → **Settings** → **Authorized domains** :
- ✅ `localhost`
- ✅ `127.0.0.1`
- ✅ `amcbunq.firebaseapp.com`
- ✅ `amcbunq.web.app`

### 3. **Vérifier la configuration**

#### Test rapide
```bash
# Lancer le script de configuration
node setup-firebase-action-url.cjs
```

#### Vérifier l'URL
Après configuration, les liens dans les emails doivent pointer vers :
```
http://localhost:5174/auth/action?mode=verifyEmail&oobCode=...
```

## 🔄 Flux de vérification universel

### Avant (Problématique)
```
Email → cloudworkstations.dev → 404 ❌
```

### Après (Solution)
```
Email → localhost:5174/auth/action → Traitement → Dashboard ✅
```

## 🧪 Test complet

### 1. **Créer un nouveau compte**
```bash
npm run dev
```
- Aller sur `/ouvrir-compte`
- Créer un compte avec un nouvel email

### 2. **Vérifier l'email**
- Vérifier que l'email reçu contient le bon lien
- Le lien doit pointer vers : `http://localhost:5174/auth/action?...`

### 3. **Tester dans différents contextes**
- ✅ Clic dans le même navigateur
- ✅ Clic dans un autre onglet
- ✅ Clic dans un autre navigateur
- ✅ Copier-coller du lien

### 4. **Vérifier la redirection**
- Page `/auth/action` s'affiche
- Traitement automatique
- Redirection vers `/dashboard`
- Statut `emailVerified: true`

## 🆘 Dépannage

### Erreur "Domain not authorized"
- Vérifier que `localhost` est dans les domaines autorisés
- Attendre 2-3 minutes après ajout

### Lien toujours incorrect
- Vider le cache du navigateur
- Vérifier la configuration Firebase Console
- Attendre la propagation (2-3 minutes)

### Erreur "Invalid action code"
- Vérifier que le template utilise `{{LINK}}`
- Vérifier que l'Action URL est correcte
- Créer un nouveau compte pour tester

## 🎯 Résultat attendu

Après cette configuration :
- ✅ Plus d'erreur 404
- ✅ Vérification fonctionne dans tous les navigateurs
- ✅ Redirection automatique vers le dashboard
- ✅ Template email moderne et professionnel
- ✅ Gestion d'erreurs robuste

## 💡 Avantages de cette solution

1. **Universelle** : Fonctionne dans tous les navigateurs
2. **Sécurisée** : Firebase gère l'authentification
3. **Moderne** : Template email professionnel
4. **Robuste** : Gestion d'erreurs complète
5. **Automatique** : Redirection immédiate

---

**⚠️ IMPORTANT** : Cette configuration doit être faite dans Firebase Console. Le code seul ne suffit pas !
