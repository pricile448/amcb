<?php
/**
 * Point d'entrée principal de l'API PHP AMCB
 * Redirige les requêtes vers les bons endpoints
 */

// Headers CORS et JSON
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Gérer les requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Récupérer le chemin de la requête
$requestUri = $_SERVER['REQUEST_URI'];
$path = parse_url($requestUri, PHP_URL_PATH);

// Router les requêtes
switch ($path) {
    case '/api/send-email.php':
    case '/send-email.php':
        require_once __DIR__ . '/send-email.php';
        break;
        
    case '/api/verify-code.php':
    case '/verify-code.php':
        require_once __DIR__ . '/verify-code.php';
        break;
        
    case '/api/test-email.php':
    case '/test-email.php':
        require_once __DIR__ . '/test-email.php';
        break;
        
    case '/api/health.php':
    case '/health.php':
        echo json_encode([
            'status' => 'ok',
            'message' => 'API PHP AMCB opérationnelle',
            'timestamp' => date('Y-m-d H:i:s'),
            'version' => '1.0.0'
        ]);
        break;
        
    default:
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Endpoint non trouvé',
            'available_endpoints' => [
                '/api/send-email.php',
                '/api/verify-code.php',
                '/api/test-email.php',
                '/api/health.php'
            ]
        ]);
        break;
}
?> 