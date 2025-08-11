# 🚀 **Configuration Firebase pour la Production - Render**

## **📧 Configuration Email Templates**

### **1. URL d'action pour la production**

Dans Firebase Console > Authentication > Settings > Email Templates :

**Actuel (développement) :**
```
http://localhost:5174/auth/action
```

**Pour la production (Render) :**
```
https://mybunq.amccredit.com/auth/action
```

### **2. Template email personnalisé (avec restrictions Firebase)**

**⚠️ Note :** Firebase limite la modification des templates pour éviter le spam. Voici ce que vous pouvez personnaliser :

**Nom de l'expéditeur :**
```
AmCbunq
```

**Objet :**
```
Vérifiez votre compte AmCbunq
```

**Message HTML (avec variables Firebase) :**
```html
<p>Bonjour %DISPLAY_NAME%,</p>

<p>Merci de vous être inscrit sur AmCbunq ! Pour accéder à toutes les fonctionnalités de votre compte bancaire en ligne, veuillez confirmer votre adresse email en cliquant sur le lien ci-dessous.</p>

<p><a href='%LINK%'>%LINK%</a></p>

<p>🔒 <strong>Sécurité :</strong> Ce lien de vérification est valable pendant 24 heures.</p>

<p>Si vous n'avez pas créé de compte AmCbunq, vous pouvez ignorer cet email en toute sécurité.</p>

<p>Merci,<br>
L'équipe %APP_NAME%</p>

<p>---<br>
🏦 Comptes bancaires | 💳 Cartes sécurisées | 📱 Application mobile | 🛡️ Protection avancée</p>
```

**Variables Firebase disponibles :**
- `%DISPLAY_NAME%` - Nom d'affichage de l'utilisateur
- `%LINK%` - Lien de vérification
- `%APP_NAME%` - Nom de votre application
- `%EMAIL%` - Adresse email de l'utilisateur

### **3. Template email complet (si autorisé par Firebase)**

Si Firebase autorise plus de personnalisation, utilisez le template complet dans `email-template-production.html`.

## **🌐 Configuration Domaines autorisés**

Dans Firebase Console > Authentication > Settings > Authorized domains :

**Ajouter vos domaines de production :**
- `mybunq.amccredit.com` ✅ **Votre domaine Render**
- `amccredit.com` (domaine parent)

## **📧 Configuration Email avancée**

### **Personnaliser le domaine d'envoi**

1. Cliquer sur "Personnaliser le domaine" dans les paramètres email
2. Ajouter votre domaine personnalisé : `amccredit.com`
3. Configurer les enregistrements DNS

### **Adresse de réponse**

Ajouter une adresse de support :
```
support@amcbunq.com
```

## **🔧 Variables d'environnement pour Render**

Dans votre fichier `.env.production` ou variables d'environnement Render :

```env
VITE_FIREBASE_API_KEY=votre_api_key_production
VITE_FIREBASE_AUTH_DOMAIN=amcbunq.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=amcbunq
VITE_FIREBASE_STORAGE_BUCKET=amcbunq.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
VITE_FIREBASE_APP_ID=votre_app_id
```

## **🚀 Déploiement Render**

### **Configuration Render**
1. **Build Command :** `npm run build`
2. **Publish Directory :** `dist`
3. **Environment Variables :** Configurer toutes les variables Firebase

### **Variables d'environnement Render**
Dans votre dashboard Render > Environment Variables :
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

## **✅ Checklist de vérification**

- [ ] URL d'action mise à jour : `https://mybunq.amccredit.com/auth/action`
- [ ] Template email personnalisé configuré (selon les restrictions Firebase)
- [ ] Domaines autorisés ajoutés : `mybunq.amccredit.com`
- [ ] Variables d'environnement Render configurées
- [ ] Test de création de compte avec le nouveau template
- [ ] Test de vérification email en production
- [ ] Test de connexion après vérification

## **🔍 Test de la configuration**

### **1. Test de création de compte**
```bash
# Aller sur https://mybunq.amccredit.com/ouvrir-compte
# Créer un nouveau compte
# Vérifier que l'email reçu utilise le nouveau template
```

### **2. Test de vérification email**
```bash
# Cliquer sur le lien de vérification dans l'email
# Vérifier la redirection vers https://mybunq.amccredit.com/connexion
# Vérifier l'accès au dashboard
```

### **3. Test de connexion**
```bash
# Se connecter sur https://mybunq.amccredit.com/connexion
# Vérifier l'accès au dashboard
# Vérifier la synchronisation emailVerified
```

## **🌐 Votre domaine de production**

**URL principale :** https://mybunq.amccredit.com/

**URLs importantes :**
- Connexion : https://mybunq.amccredit.com/connexion
- Inscription : https://mybunq.amccredit.com/ouvrir-compte
- Dashboard : https://mybunq.amccredit.com/dashboard
- Action Firebase : https://mybunq.amccredit.com/auth/action

## **📝 Notes importantes**

### **Restrictions Firebase Email Templates**
- Firebase limite la modification des templates pour éviter le spam
- Vous pouvez personnaliser : nom d'expéditeur, objet, et contenu avec variables
- Les variables `%DISPLAY_NAME%`, `%LINK%`, `%APP_NAME%` sont disponibles
- Le template complet dans `email-template-production.html` peut ne pas être autorisé

### **Alternatives pour personnalisation avancée**
1. **Utiliser les variables Firebase** disponibles
2. **Personnaliser le domaine d'envoi** pour plus de professionnalisme
3. **Configurer l'adresse de réponse** pour le support client

---

**Configuration production Render terminée !** 🎉

*Dernière mise à jour : $(Get-Date)*
