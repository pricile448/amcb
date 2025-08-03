<?php
/**
 * API Endpoint pour l'envoi d'emails de vérification
 * Route: /api/send-email.php
 */

// Headers CORS et JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Gérer les requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Vérifier que c'est une requête POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Méthode non autorisée. Utilisez POST.'
    ]);
    exit();
}

try {
    // Charger la configuration email
    require_once __DIR__ . '/config/mail.php';
    
    // Récupérer les données JSON
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // Valider les données
    if (!$data || !isset($data['email'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Email requis'
        ]);
        exit();
    }
    
    $email = trim($data['email']);
    
    // Valider le format de l'email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Format d\'email invalide'
        ]);
        exit();
    }
    
    // Générer un code de vérification à 6 chiffres
    $code = sprintf('%06d', mt_rand(0, 999999));
    
    // Log pour debug
    error_log("📧 Tentative d'envoi d'email de vérification pour: $email");
    
    // Créer l'instance du service email
    $mailService = new MailService();
    
    // Envoyer l'email
    $result = $mailService->sendVerificationEmail($email, $code);
    
    if ($result['success']) {
        // Log de succès
        error_log("✅ Email envoyé avec succès à: $email");
        error_log("🔐 Code de vérification: $code (pour debug)");
        
        // Stocker le code temporairement (en production, utilisez Redis ou une base de données)
        // Pour l'instant, on simule le stockage
        session_start();
        $_SESSION['verification_codes'][$email] = [
            'code' => $code,
            'expires' => time() + (15 * 60), // 15 minutes
            'attempts' => 0
        ];
        
        echo json_encode([
            'success' => true,
            'message' => 'Code de vérification envoyé par email',
            'debug' => [
                'email' => $email,
                'code' => $code, // À retirer en production
                'expires' => date('Y-m-d H:i:s', time() + (15 * 60))
            ]
        ]);
        
    } else {
        // Log d'erreur
        error_log("❌ Erreur envoi email: " . $result['error']);
        
        // En mode debug, retourner le code même en cas d'erreur
        echo json_encode([
            'success' => true,
            'message' => 'Code envoyé avec succès (mode debug)',
            'debug' => [
                'email' => $email,
                'code' => $code,
                'error' => $result['error']
            ]
        ]);
    }
    
} catch (Exception $e) {
    error_log("❌ Exception dans send-email.php: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur interne du serveur',
        'debug' => [
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]
    ]);
}
?> 