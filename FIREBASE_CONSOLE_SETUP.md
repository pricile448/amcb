# Configuration Firebase Console pour corriger l'erreur 404

## 🚨 Problème identifié
L'erreur 404 indique que Firebase essaie d'accéder à une URL incorrecte :
```
https://6000-firebase-studio-1750672045634.cluster-2xfkbshw5rfguuk5qupw267afs.cloudworkstations.dev/fr/auth/action
```

## ✅ Solution : Configuration Firebase Console

### 1. Accéder à Firebase Console
1. Aller sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionner votre projet
3. Aller dans **Authentication** → **Settings** → **Templates**

### 2. Configurer le template Email verification
1. **Sélectionner** : "Email verification"
2. **Cliquer** sur "Edit template"
3. **Modifier** les paramètres :

#### Configuration requise :
- **Subject** : `Vérifiez votre compte AmCbunq`
- **Action URL** : `http://localhost:5174/auth/action` (pour le développement)
- **Action URL** : `https://votre-domaine.com/auth/action` (pour la production)

### 3. Template HTML personnalisé
Remplacer le contenu HTML par :

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

### 4. Sauvegarder et tester
1. **Cliquer** sur "Save"
2. **Tester** en créant un nouveau compte
3. **Vérifier** que le lien pointe vers : `http://localhost:5174/auth/action?...`

## 🔧 Configuration alternative : Autoriser les domaines

### 1. Autoriser localhost
Dans Firebase Console → Authentication → Settings → Authorized domains :
- Ajouter : `localhost`
- Ajouter : `127.0.0.1`

### 2. Pour la production
Ajouter votre domaine de production :
- `votre-domaine.com`
- `www.votre-domaine.com`

## 🧪 Test de la solution

### 1. Créer un nouveau compte
```bash
npm run dev
```
- Aller sur `/ouvrir-compte`
- Créer un compte avec un nouvel email

### 2. Vérifier l'email
- Vérifier que l'email reçu contient le bon lien
- Le lien doit pointer vers : `http://localhost:5174/auth/action?...`

### 3. Tester le clic
- Cliquer sur le lien dans l'email
- Vérifier que la page `/auth/action` s'affiche
- Vérifier que la vérification fonctionne
- Vérifier la redirection vers `/dashboard`

## 🎯 Résultat attendu

Après la configuration :
- ✅ Plus d'erreur 404
- ✅ Lien pointe vers votre application
- ✅ Page de traitement Firebase créée
- ✅ Vérification email fonctionnelle
- ✅ Redirection automatique vers le dashboard

## 🆘 En cas de problème

### Erreur "Domain not authorized"
- Vérifier que `localhost` est dans les domaines autorisés
- Vérifier que l'URL d'action est correcte

### Erreur "Invalid action code"
- Vérifier que le template utilise `{{LINK}}` et non une URL fixe
- Vérifier que l'Action URL est configurée correctement

### Lien toujours incorrect
- Vider le cache du navigateur
- Attendre quelques minutes pour la propagation
- Vérifier la configuration dans Firebase Console
