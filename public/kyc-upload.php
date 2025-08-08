<?php
// Configuration
$adminEmail = "votre-email@gmail.com"; // Remplacez par votre email
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
        
        // Création du dossier temporaire
        $uploadDir = "uploads/kyc/";
        if (!file_exists($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        
        // Génération d'un nom de fichier unique
        $fileExtension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $fileName = uniqid() . '_' . $documentType . '.' . $fileExtension;
        $filePath = $uploadDir . $fileName;
        
        // Upload du fichier
        if (!move_uploaded_file($file['tmp_name'], $filePath)) {
            throw new Exception("Erreur lors de la sauvegarde du fichier");
        }
        
        // Préparation de l'email
        $subject = "Nouvelle soumission KYC - " . $userName;
        $message = "
        <html>
        <head>
            <title>Nouvelle soumission KYC</title>
        </head>
        <body>
            <h2>Nouvelle soumission KYC reçue</h2>
            <p><strong>Nom :</strong> {$userName}</p>
            <p><strong>Email :</strong> {$userEmail}</p>
            <p><strong>Type de document :</strong> {$documentType}</p>
            <p><strong>Date de soumission :</strong> " . date('d/m/Y H:i:s') . "</p>
            <p><strong>Fichier :</strong> {$fileName}</p>
            <hr>
            <p>Le document a été sauvegardé sur le serveur.</p>
        </body>
        </html>
        ";
        
        // Headers pour l'email HTML
        $headers = array(
            'MIME-Version: 1.0',
            'Content-type: text/html; charset=utf-8',
            'From: KYC System <noreply@amcbunq.com>',
            'Reply-To: ' . $userEmail,
            'X-Mailer: PHP/' . phpversion()
        );
        
        // Envoi de l'email
        if (mail($adminEmail, $subject, $message, implode("\r\n", $headers))) {
            $response = array(
                'success' => true,
                'message' => 'Document soumis avec succès',
                'fileName' => $fileName
            );
        } else {
            throw new Exception("Erreur lors de l'envoi de l'email");
        }
        
    } catch (Exception $e) {
        $response = array(
            'success' => false,
            'message' => $e->getMessage()
        );
    }
    
    // Retour JSON
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Soumission KYC - AmCbunq</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #2c3e50;
            text-align: center;
            margin-bottom: 30px;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #34495e;
        }
        input, select {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            box-sizing: border-box;
        }
        .file-input {
            border: 2px dashed #3498db;
            padding: 20px;
            text-align: center;
            background-color: #f8f9fa;
            cursor: pointer;
        }
        .file-input:hover {
            background-color: #e9ecef;
        }
        button {
            width: 100%;
            padding: 15px;
            background-color: #3498db;
            color: white;
            border: none;
            border-radius: 5px;
            font-size: 16px;
            cursor: pointer;
            margin-top: 20px;
        }
        button:hover {
            background-color: #2980b9;
        }
        .success {
            background-color: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
        }
        .error {
            background-color: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 5px;
            margin-top: 20px;
        }
        .loading {
            display: none;
            text-align: center;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>📄 Soumission KYC</h1>
        
        <form id="kycForm" enctype="multipart/form-data">
            <div class="form-group">
                <label for="userName">Nom complet *</label>
                <input type="text" id="userName" name="userName" required>
            </div>
            
            <div class="form-group">
                <label for="userEmail">Email *</label>
                <input type="email" id="userEmail" name="userEmail" required>
            </div>
            
            <div class="form-group">
                <label for="documentType">Type de document *</label>
                <select id="documentType" name="documentType" required>
                    <option value="">Sélectionnez un type</option>
                    <option value="identity">Pièce d'identité</option>
                    <option value="address">Justificatif de domicile</option>
                    <option value="income">Justificatif de revenus</option>
                    <option value="bankStatement">Relevé bancaire</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="document">Document *</label>
                <input type="file" id="document" name="document" class="file-input" 
                       accept=".jpg,.jpeg,.png,.pdf" required>
                <small>Formats acceptés : JPG, PNG, PDF (max 10MB)</small>
            </div>
            
            <button type="submit">📤 Soumettre le document</button>
        </form>
        
        <div id="loading" class="loading">
            <p>⏳ Envoi en cours...</p>
        </div>
        
        <div id="result"></div>
    </div>

    <script>
        document.getElementById('kycForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const form = e.target;
            const loading = document.getElementById('loading');
            const result = document.getElementById('result');
            
            // Afficher le loading
            loading.style.display = 'block';
            result.innerHTML = '';
            
            try {
                const formData = new FormData(form);
                
                const response = await fetch('kyc-upload.php', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    result.innerHTML = `<div class="success">✅ ${data.message}</div>`;
                    form.reset();
                } else {
                    result.innerHTML = `<div class="error">❌ ${data.message}</div>`;
                }
                
            } catch (error) {
                result.innerHTML = `<div class="error">❌ Erreur de connexion</div>`;
            } finally {
                loading.style.display = 'none';
            }
        });
    </script>
</body>
</html>
