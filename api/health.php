<?php
/**
 * Endpoint de santé pour vérifier l'état de l'API PHP
 * Route: /api/health.php
 */

// Headers CORS et JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Gérer les requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Vérifier que c'est une requête GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'error' => 'Méthode non autorisée. Utilisez GET.'
    ]);
    exit();
}

try {
    // Vérifications de base
    $checks = [
        'php_version' => PHP_VERSION,
        'extensions' => [
            'json' => extension_loaded('json'),
            'openssl' => extension_loaded('openssl'),
            'mbstring' => extension_loaded('mbstring'),
            'curl' => extension_loaded('curl')
        ],
        'environment' => [
            'smtp_host' => isset($_ENV['SMTP_HOST']),
            'smtp_user' => isset($_ENV['SMTP_USER']),
            'smtp_pass' => isset($_ENV['SMTP_PASS'])
        ]
    ];
    
    // Vérifier si PHPMailer est disponible
    $phpmailerAvailable = false;
    try {
        if (file_exists(__DIR__ . '/vendor/autoload.php')) {
            require_once __DIR__ . '/vendor/autoload.php';
            $phpmailerAvailable = class_exists('PHPMailer\PHPMailer\PHPMailer');
        }
    } catch (Exception $e) {
        $phpmailerAvailable = false;
    }
    
    $checks['dependencies'] = [
        'phpmailer' => $phpmailerAvailable,
        'composer_autoload' => file_exists(__DIR__ . '/vendor/autoload.php')
    ];
    
    // Statut global
    $allChecksPassed = $checks['extensions']['json'] && 
                      $checks['extensions']['openssl'] && 
                      $checks['extensions']['mbstring'] &&
                      $checks['dependencies']['composer_autoload'];
    
    echo json_encode([
        'success' => true,
        'status' => $allChecksPassed ? 'healthy' : 'degraded',
        'message' => 'API PHP AMCB opérationnelle',
        'timestamp' => date('Y-m-d H:i:s'),
        'version' => '1.0.0',
        'checks' => $checks,
        'endpoints' => [
            'send_email' => '/api/send-email.php',
            'verify_code' => '/api/verify-code.php',
            'test_email' => '/api/test-email.php'
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'status' => 'unhealthy',
        'error' => 'Erreur lors de la vérification de santé',
        'debug' => [
            'message' => $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ]
    ]);
}
?> 