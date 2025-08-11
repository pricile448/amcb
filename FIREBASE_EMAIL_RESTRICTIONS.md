# 📧 **Restrictions Firebase Email Templates - Guide de contournement**

## **⚠️ Problème identifié**

Firebase limite la modification des templates d'email pour éviter le spam. Le message "Pour éviter le spam, le message ne peut pas être modifié dans ce modèle d'e-mail" apparaît.

## **✅ Solutions disponibles**

### **1. Personnalisation autorisée par Firebase**

**Vous pouvez toujours modifier :**
- ✅ **Nom de l'expéditeur** : `AmCbunq`
- ✅ **Objet** : `Vérifiez votre compte AmCbunq`
- ✅ **Adresse de réponse** : `support@amcbunq.com`
- ✅ **Contenu avec variables Firebase**

### **2. Variables Firebase disponibles**

```html
%DISPLAY_NAME%    - Nom d'affichage de l'utilisateur
%LINK%           - Lien de vérification
%APP_NAME%       - Nom de votre application
%EMAIL%          - Adresse email de l'utilisateur
```

### **3. Template recommandé (compatible Firebase)**

**Nom de l'expéditeur :**
```
AmCbunq
```

**Objet :**
```
Vérifiez votre compte AmCbunq
```

**Message HTML :**
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

## **🚀 Alternatives pour personnalisation avancée**

### **1. Personnaliser le domaine d'envoi**

Dans Firebase Console > Authentication > Settings > Email Templates :

1. Cliquer sur "Personnaliser le domaine"
2. Ajouter votre domaine : `amccredit.com`
3. Configurer les enregistrements DNS

**Avantages :**
- Emails envoyés depuis `noreply@amccredit.com`
- Plus professionnel
- Meilleure délivrabilité

### **2. Configurer l'adresse de réponse**

**Adresse de réponse :**
```
support@amcbunq.com
```

**Avantages :**
- Les utilisateurs peuvent répondre pour le support
- Communication bidirectionnelle
- Service client amélioré

### **3. Utiliser un service d'email tiers (avancé)**

Si vous voulez une personnalisation complète :

**Options :**
- **SendGrid** - Templates personnalisés
- **Mailgun** - API d'envoi d'emails
- **Resend** - Service moderne d'emails

**Implémentation :**
1. Configurer le service d'email
2. Créer des templates personnalisés
3. Intégrer avec Firebase Functions

## **🔧 Configuration Firebase Console**

### **Étapes dans Firebase Console :**

1. **Aller sur** Firebase Console > Authentication > Settings
2. **Cliquer sur** "Email Templates"
3. **Modifier** :
   - Nom de l'expéditeur : `AmCbunq`
   - Objet : `Vérifiez votre compte AmCbunq`
   - Message : Utiliser le template recommandé ci-dessus
4. **Sauvegarder** les modifications

### **URL d'action à configurer :**
```
https://mybunq.amccredit.com/auth/action
```

## **📋 Checklist de configuration**

- [ ] Nom de l'expéditeur configuré : `AmCbunq`
- [ ] Objet personnalisé : `Vérifiez votre compte AmCbunq`
- [ ] Message avec variables Firebase configuré
- [ ] URL d'action mise à jour pour la production
- [ ] Adresse de réponse configurée (optionnel)
- [ ] Domaine d'envoi personnalisé (optionnel)

## **🧪 Test de la configuration**

### **1. Test de création de compte**
```bash
# Aller sur https://mybunq.amccredit.com/ouvrir-compte
# Créer un nouveau compte
# Vérifier l'email reçu
```

### **2. Vérifications dans l'email**
- ✅ Nom de l'expéditeur : `AmCbunq`
- ✅ Objet : `Vérifiez votre compte AmCbunq`
- ✅ Lien de vérification fonctionnel
- ✅ Variables remplacées correctement

## **💡 Conseils pour améliorer l'expérience**

### **1. Optimiser le contenu autorisé**
- Utiliser des emojis pour rendre le message plus attrayant
- Structurer le texte avec des paragraphes clairs
- Inclure des informations de sécurité

### **2. Personnaliser l'expérience utilisateur**
- Messages d'accueil personnalisés dans l'application
- Notifications push pour la vérification
- Page de confirmation après vérification

### **3. Monitoring et analytics**
- Suivre les taux d'ouverture d'emails
- Analyser les taux de clic sur les liens
- Optimiser en fonction des métriques

## **🔍 Dépannage**

### **Problème : Template non sauvegardé**
**Solution :**
- Vérifier que vous utilisez uniquement les variables autorisées
- Supprimer tout HTML complexe ou CSS
- Utiliser uniquement du texte simple avec variables

### **Problème : Variables non remplacées**
**Solution :**
- Vérifier l'orthographe des variables : `%DISPLAY_NAME%`, `%LINK%`, `%APP_NAME%`
- S'assurer que les variables sont entre `%`
- Tester avec un nouveau compte

### **Problème : Email non reçu**
**Solution :**
- Vérifier les spams
- Contrôler la configuration Firebase
- Tester avec une adresse email différente

---

**Configuration Firebase Email Templates terminée !** 🎉

*Dernière mise à jour : $(Get-Date)*
