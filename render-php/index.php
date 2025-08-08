<?php
// Configuration CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json');

// Gérer les requêtes OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Configuration
$adminEmail = "amcbunq@amccredit.com"; // Email pour recevoir les documents KYC
$maxFileSize = 10 * 1024 * 1024; // 10MB
$allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

// Fonction pour nettoyer les données
function cleanInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Traitement du formulaire
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $response = array();
    
    try {
        // Récupération des données du formulaire
        $userEmail = cleanInput($_POST['userEmail'] ?? '');
        $userName = cleanInput($_POST['userName'] ?? '');
        $documentType = cleanInput($_POST['documentType'] ?? '');
        
        // Validation des données
        if (empty($userEmail) || empty($userName) || empty($documentType)) {
            throw new Exception("Tous les champs sont obligatoires");
        }
        
        if (!filter_var($userEmail, FILTER_VALIDATE_EMAIL)) {
            throw new Exception("Email invalide");
        }
        
        // Vérification du fichier
        if (!isset($_FILES['document']) || $_FILES['document']['error'] !== UPLOAD_ERR_OK) {
            throw new Exception("Erreur lors de l'upload du fichier");
        }
        
        $file = $_FILES['document'];
        
        // Validation du fichier
        if ($file['size'] > $maxFileSize) {
            throw new Exception("Le fichier est trop volumineux (max 10MB)");
        }
        
        if (!in_array($file['type'], $allowedTypes)) {
            throw new Exception("Type de fichier non autorisé. Utilisez JPG, PNG ou PDF");
        }
        
        // Création du dossier uploads s'il n'existe pas
        $uploadDir = '/tmp/kyc-uploads/';
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        // Génération du nom de fichier unique
        $fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = $documentType . '_' . date('Y-m-d_H-i-s') . '_' . uniqid() . '.' . $fileExtension;
        $filePath = $uploadDir . $fileName;
        
        // Déplacement du fichier
        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            throw new Exception("Erreur lors de la sauvegarde du fichier");
        }
        
        // Préparation de l'email
        $subject = "Nouveau document KYC - " . $documentType . " - " . $userName;
        
        $message = "
        Nouveau document KYC reçu:
        
        Utilisateur: $userName
        Email: $userEmail
        Type de document: $documentType
        Nom du fichier: {$file['name']}
        Taille: " . round($file['size'] / 1024, 2) . " KB
        Date de soumission: " . date('Y-m-d H:i:s') . "
        
        Le fichier a été sauvegardé sur le serveur.
        
        ---
        Système de vérification KYC AmCbunq
        ";
        
        $headers = "From: kyc@amccredit.com\r\n";
        $headers .= "Reply-To: $userEmail\r\n";
        $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
        
        // Envoi de l'email
        if (!mail($adminEmail, $subject, $message, $headers)) {
            error_log("Erreur envoi email KYC pour: $userEmail");
        }
        
        $response['success'] = true;
        $response['message'] = "Document soumis avec succès";
        $response['fileName'] = $fileName;
        $response['documentType'] = $documentType;
        
    } catch (Exception $e) {
        $response['success'] = false;
        $response['message'] = $e->getMessage();
        error_log("Erreur KYC: " . $e->getMessage());
    }
    
    echo json_encode($response);
    exit();
}

// Si ce n'est pas une requête POST, retourner une erreur
http_response_code(405);
echo json_encode(['success' => false, 'message' => 'Méthode non autorisée']);
?>
