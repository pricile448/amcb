<?php
/**
 * Script de test pour vérifier la configuration email
 * Usage: php test-email.php
 */

// Charger la configuration
require_once __DIR__ . '/config/mail.php';

echo "🧪 Test de configuration email AMCB\n";
echo "=====================================\n\n";

// Vérifier les variables d'environnement
echo "📋 Variables d'environnement:\n";
echo "SMTP_HOST: " . ($_ENV['SMTP_HOST'] ?? 'NON DÉFINI') . "\n";
echo "SMTP_PORT: " . ($_ENV['SMTP_PORT'] ?? 'NON DÉFINI') . "\n";
echo "SMTP_SECURE: " . ($_ENV['SMTP_SECURE'] ?? 'NON DÉFINI') . "\n";
echo "SMTP_USER: " . ($_ENV['SMTP_USER'] ?? 'NON DÉFINI') . "\n";
echo "SMTP_PASS: " . (isset($_ENV['SMTP_PASS']) ? '***DÉFINI***' : 'NON DÉFINI') . "\n\n";

// Tester la création du service email
try {
    echo "🔧 Test de création du service email...\n";
    $mailService = new MailService();
    echo "✅ Service email créé avec succès\n\n";
    
    // Tester l'envoi d'un email de test
    $testEmail = 'test@example.com';
    $testCode = '123456';
    
    echo "📧 Test d'envoi d'email à: $testEmail\n";
    echo "🔐 Code de test: $testCode\n\n";
    
    $result = $mailService->sendVerificationEmail($testEmail, $testCode);
    
    if ($result['success']) {
        echo "✅ Email envoyé avec succès!\n";
        echo "📝 Message: " . $result['message'] . "\n";
    } else {
        echo "❌ Erreur lors de l'envoi:\n";
        echo "📝 Erreur: " . $result['error'] . "\n";
    }
    
} catch (Exception $e) {
    echo "❌ Erreur lors de la création du service:\n";
    echo "📝 Message: " . $e->getMessage() . "\n";
    echo "📁 Fichier: " . $e->getFile() . "\n";
    echo "📍 Ligne: " . $e->getLine() . "\n";
}

echo "\n🏁 Test terminé\n";
?> 