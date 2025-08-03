<?php
/**
 * API Endpoint pour la vérification des codes
 * Route: /api/verify-code.php
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
    // Récupérer les données JSON
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // Valider les données
    if (!$data || !isset($data['email']) || !isset($data['code'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Email et code requis'
        ]);
        exit();
    }
    
    $email = trim($data['email']);
    $code = trim($data['code']);
    
    // Valider le format de l'email
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Format d\'email invalide'
        ]);
        exit();
    }
    
    // Valider le format du code (6 chiffres)
    if (!preg_match('/^\d{6}$/', $code)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Code invalide (doit contenir 6 chiffres)'
        ]);
        exit();
    }
    
    // Log pour debug
    error_log("🔐 Tentative de vérification pour: $email avec le code: $code");
    
    // Récupérer les codes stockés
    session_start();
    $storedCodes = $_SESSION['verification_codes'] ?? [];
    
    // Vérifier si le code existe pour cet email
    if (!isset($storedCodes[$email])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Aucun code trouvé pour cet email. Veuillez demander un nouveau code.'
        ]);
        exit();
    }
    
    $storedData = $storedCodes[$email];
    
    // Vérifier l'expiration
    if (time() > $storedData['expires']) {
        // Supprimer le code expiré
        unset($_SESSION['verification_codes'][$email]);
        
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Code expiré. Veuillez demander un nouveau code.'
        ]);
        exit();
    }
    
    // Vérifier le nombre de tentatives
    if ($storedData['attempts'] >= 3) {
        // Supprimer le code après trop de tentatives
        unset($_SESSION['verification_codes'][$email]);
        
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Trop de tentatives. Veuillez demander un nouveau code.'
        ]);
        exit();
    }
    
    // Incrémenter le nombre de tentatives
    $_SESSION['verification_codes'][$email]['attempts']++;
    
    // Vérifier le code
    if ($storedData['code'] === $code) {
        // Code correct - supprimer le code utilisé
        unset($_SESSION['verification_codes'][$email]);
        
        // Log de succès
        error_log("✅ Code vérifié avec succès pour: $email");
        
        // Ici, vous pourriez mettre à jour la base de données pour marquer l'email comme vérifié
        // Pour l'instant, on retourne juste un succès
        
        echo json_encode([
            'success' => true,
            'message' => 'Code vérifié avec succès',
            'data' => [
                'email' => $email,
                'verified' => true
            ]
        ]);
        
    } else {
        // Code incorrect
        error_log("❌ Code incorrect pour: $email (tentative " . $_SESSION['verification_codes'][$email]['attempts'] . "/3)");
        
        $remainingAttempts = 3 - $_SESSION['verification_codes'][$email]['attempts'];
        
        echo json_encode([
            'success' => false,
            'error' => 'Code incorrect. Il vous reste ' . $remainingAttempts . ' tentative(s).'
        ]);
    }
    
} catch (Exception $e) {
    error_log("❌ Exception dans verify-code.php: " . $e->getMessage());
    
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