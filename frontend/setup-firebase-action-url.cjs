#!/usr/bin/env node

/**
 * Script pour configurer l'URL d'action Firebase
 * Ce script génère les instructions pour configurer Firebase Console
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Configuration Firebase Action URL');
console.log('=====================================\n');

// Déterminer l'URL de base
const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
const baseUrl = isDev ? 'http://localhost:5174' : 'https://votre-domaine.com';

console.log(`📍 URL de base détectée: ${baseUrl}`);
console.log(`📍 URL d'action: ${baseUrl}/auth/action\n`);

console.log('📋 Instructions de configuration Firebase Console:');
console.log('==================================================\n');

console.log('1. 🌐 Aller sur Firebase Console:');
console.log('   https://console.firebase.google.com/\n');

console.log('2. 🔧 Sélectionner votre projet\n');

console.log('3. 🔐 Aller dans Authentication → Settings → Templates\n');

console.log('4. 📧 Sélectionner "Email verification" → "Edit template"\n');

console.log('5. ⚙️ Configurer les paramètres:');
console.log('   - Subject: "Vérifiez votre compte AmCbunq"');
console.log(`   - Action URL: "${baseUrl}/auth/action"`);
console.log('   - Template HTML: (voir ci-dessous)\n');

console.log('6. 💾 Cliquer sur "Save"\n');

console.log('7. 🌍 Autoriser les domaines (Authentication → Settings → Authorized domains):');
console.log('   - localhost');
console.log('   - 127.0.0.1');
if (!isDev) {
  console.log('   - votre-domaine.com');
  console.log('   - www.votre-domaine.com');
}
console.log('');

// Template HTML
const htmlTemplate = `<!DOCTYPE html>
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
</html>`;

console.log('📄 Template HTML à copier dans Firebase Console:');
console.log('================================================');
console.log(htmlTemplate);
console.log('');

console.log('🧪 Test de la configuration:');
console.log('============================');
console.log('1. Lancer l\'application: npm run dev');
console.log('2. Créer un nouveau compte');
console.log('3. Vérifier que l\'email contient le bon lien');
console.log(`4. Le lien doit pointer vers: ${baseUrl}/auth/action?...`);
console.log('5. Cliquer sur le lien → redirection vers /dashboard');
console.log('');

console.log('✅ Configuration terminée !');
console.log('');
console.log('💡 Note: La vérification fonctionnera maintenant même si l\'utilisateur');
console.log('   clique sur le lien dans un autre navigateur ou onglet.');
console.log('');
