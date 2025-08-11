# Configuration des Templates d'Email Firebase

## 1. Accéder aux Templates Firebase

1. Allez dans la [Console Firebase](https://console.firebase.google.com/)
2. Sélectionnez votre projet
3. Dans le menu de gauche, cliquez sur "Authentication"
4. Cliquez sur l'onglet "Templates"
5. Sélectionnez "Email verification"

## 2. Template HTML Moderne pour la Vérification d'Email

Remplacez le contenu par ce template moderne :

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vérifiez votre compte AmCbunq</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            padding: 40px 30px;
            text-align: center;
        }
        
        .logo {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 20px;
        }
        
        .logo-icon {
            width: 40px;
            height: 40px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 18px;
            color: white;
        }
        
        .logo-text {
            font-size: 24px;
            font-weight: bold;
            color: white;
        }
        
        .header-title {
            font-size: 28px;
            font-weight: bold;
            color: white;
            margin-bottom: 10px;
        }
        
        .header-subtitle {
            font-size: 16px;
            color: rgba(255, 255, 255, 0.9);
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .welcome-text {
            font-size: 18px;
            color: #374151;
            margin-bottom: 20px;
        }
        
        .description {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        
        .button-container {
            text-align: center;
            margin: 40px 0;
        }
        
        .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            text-decoration: none;
            padding: 16px 32px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
        }
        
        .verify-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 15px -3px rgba(59, 130, 246, 0.4);
        }
        
        .info-box {
            background-color: #f3f4f6;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 30px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .info-title {
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
        }
        
        .info-text {
            color: #6b7280;
            font-size: 14px;
        }
        
        .footer {
            background-color: #f9fafb;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        
        .footer-text {
            color: #6b7280;
            font-size: 14px;
            margin-bottom: 15px;
        }
        
        .footer-links {
            display: flex;
            justify-content: center;
            gap: 20px;
        }
        
        .footer-link {
            color: #3b82f6;
            text-decoration: none;
            font-size: 14px;
        }
        
        .footer-link:hover {
            text-decoration: underline;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            
            .header, .content, .footer {
                padding: 20px;
            }
            
            .header-title {
                font-size: 24px;
            }
            
            .verify-button {
                padding: 14px 28px;
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">
                <div class="logo-icon">A</div>
                <div class="logo-text">AmCbunq</div>
            </div>
            <h1 class="header-title">Vérifiez votre compte</h1>
            <p class="header-subtitle">Une dernière étape pour activer votre compte</p>
        </div>
        
        <div class="content">
            <p class="welcome-text">Bonjour !</p>
            
            <p class="description">
                Merci de vous être inscrit sur AmCbunq. Pour activer votre compte et accéder à tous nos services, 
                veuillez cliquer sur le bouton ci-dessous pour vérifier votre adresse email.
            </p>
            
            <div class="button-container">
                <a href="{{LINK}}" class="verify-button">
                    ✅ Vérifier mon compte
                </a>
            </div>
            
            <div class="info-box">
                <div class="info-title">💡 Besoin d'aide ?</div>
                <div class="info-text">
                    Si vous n'avez pas reçu cet email ou si le bouton ne fonctionne pas, 
                    copiez et collez ce lien dans votre navigateur : <br>
                    <strong>{{LINK}}</strong>
                </div>
            </div>
            
            <p class="description">
                Ce lien expirera dans 24 heures pour des raisons de sécurité. 
                Si vous n'avez pas créé de compte sur AmCbunq, vous pouvez ignorer cet email.
            </p>
        </div>
        
        <div class="footer">
            <p class="footer-text">
                © 2024 AmCbunq. Tous droits réservés.
            </p>
            <div class="footer-links">
                <a href="{{LINK}}" class="footer-link">Support</a>
                <a href="{{LINK}}" class="footer-link">Confidentialité</a>
                <a href="{{LINK}}" class="footer-link">Conditions</a>
            </div>
        </div>
    </div>
</body>
</html>
```

## 3. Configuration du Template

1. **Sujet de l'email** : `Vérifiez votre compte AmCbunq - {{LINK}}`
2. **Nom de l'expéditeur** : `AmCbunq`
3. **Adresse de l'expéditeur** : `noreply@amccredit.com` (ou votre domaine vérifié)
4. **URL de redirection** : `https://votre-domaine.com/dashboard`

## 4. Variables Firebase Disponibles

- `{{LINK}}` : Le lien de vérification généré automatiquement
- `{{EMAIL}}` : L'adresse email de l'utilisateur
- `{{DISPLAY_NAME}}` : Le nom d'affichage de l'utilisateur

## 5. Test du Template

1. Sauvegardez le template
2. Testez l'envoi depuis la console Firebase
3. Vérifiez l'apparence sur différents clients email

## 6. Personnalisation Avancée

Vous pouvez également personnaliser :
- **Email de réinitialisation de mot de passe**
- **Email de changement d'email**
- **Email de suppression de compte**

Utilisez le même style CSS pour maintenir la cohérence visuelle.
