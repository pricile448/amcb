<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require_once __DIR__ . '/../vendor/autoload.php';

/**
 * Configuration et fonctions pour l'envoi d'emails
 */
class MailService {
    private $mailer;
    
    public function __construct() {
        $this->mailer = new PHPMailer(true);
        $this->configureSMTP();
    }
    
    /**
     * Configure le transporteur SMTP
     */
    private function configureSMTP() {
        try {
            // Configuration SMTP
            $this->mailer->isSMTP();
            $this->mailer->Host = $_ENV['SMTP_HOST'] ?? 'mail.votre-domaine.com';
            $this->mailer->SMTPAuth = true;
            $this->mailer->Username = $_ENV['SMTP_USER'] ?? 'noreply@votre-domaine.com';
            $this->mailer->Password = $_ENV['SMTP_PASS'] ?? 'votre-mot-de-passe';
            $this->mailer->SMTPSecure = ($_ENV['SMTP_SECURE'] ?? 'false') === 'true' ? PHPMailer::ENCRYPTION_SMTPS : PHPMailer::ENCRYPTION_STARTTLS;
            $this->mailer->Port = (int)($_ENV['SMTP_PORT'] ?? 587);
            
            // Configuration de debug (désactivé en production)
            $this->mailer->SMTPDebug = 0;
            
            // Configuration des timeouts
            $this->mailer->Timeout = 30;
            $this->mailer->SMTPKeepAlive = true;
            
        } catch (Exception $e) {
            error_log("Erreur configuration SMTP: " . $e->getMessage());
            throw new Exception("Erreur de configuration email");
        }
    }
    
    /**
     * Envoie un email de vérification
     */
    public function sendVerificationEmail($email, $code) {
        try {
            // Réinitialiser le mailer
            $this->mailer->clearAddresses();
            $this->mailer->clearAttachments();
            
            // Expéditeur et destinataire
            $this->mailer->setFrom($_ENV['SMTP_USER'] ?? 'noreply@votre-domaine.com', 'AMCB');
            $this->mailer->addAddress($email);
            
            // Contenu
            $this->mailer->isHTML(true);
            $this->mailer->CharSet = 'UTF-8';
            $this->mailer->Subject = 'Code de vérification - AMCB';
            $this->mailer->Body = $this->generateEmailTemplate($code);
            $this->mailer->AltBody = $this->generateTextTemplate($code);
            
            // Envoyer l'email
            $this->mailer->send();
            
            return [
                'success' => true,
                'message' => 'Email envoyé avec succès'
            ];
            
        } catch (Exception $e) {
            error_log("Erreur envoi email: " . $e->getMessage());
            return [
                'success' => false,
                'error' => 'Erreur lors de l\'envoi de l\'email: ' . $e->getMessage()
            ];
        }
    }
    
    /**
     * Génère le template HTML de l'email
     */
    private function generateEmailTemplate($code) {
        return "
        <!DOCTYPE html>
        <html lang='fr'>
        <head>
            <meta charset='UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>Vérification AMCB</title>
        </head>
        <body style='font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa;'>
            <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
                <div style='background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);'>
                    
                    <!-- Header -->
                    <div style='text-align: center; margin-bottom: 30px;'>
                        <h1 style='color: #2c3e50; margin: 0; font-size: 28px;'>AMCB</h1>
                        <p style='color: #7f8c8d; margin: 10px 0 0 0;'>Vérification de votre compte</p>
                    </div>
                    
                    <!-- Contenu principal -->
                    <div style='margin-bottom: 30px;'>
                        <p style='color: #555; font-size: 16px; line-height: 1.6; margin-bottom: 20px;'>
                            Bonjour,<br><br>
                            Vous avez récemment créé un compte sur AMCB. Pour finaliser votre inscription, 
                            veuillez utiliser le code de vérification suivant :
                        </p>
                        
                        <!-- Code de vérification -->
                        <div style='background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 25px; text-align: center; border-radius: 12px; margin: 30px 0;'>
                            <h2 style='font-size: 36px; margin: 0; letter-spacing: 8px; font-weight: bold; font-family: monospace;'>$code</h2>
                        </div>
                        
                        <!-- Instructions -->
                        <div style='background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #3498db;'>
                            <h3 style='color: #2c3e50; margin: 0 0 15px 0; font-size: 18px;'>Important :</h3>
                            <ul style='color: #555; margin: 0; padding-left: 20px;'>
                                <li style='margin-bottom: 8px;'>Ce code expire dans <strong>15 minutes</strong></li>
                                <li style='margin-bottom: 8px;'>Ne partagez jamais ce code avec qui que ce soit</li>
                                <li style='margin-bottom: 8px;'>Si vous n'avez pas demandé ce code, ignorez cet email</li>
                            </ul>
                        </div>
                    </div>
                    
                    <!-- Footer -->
                    <div style='text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;'>
                        <p style='color: #999; font-size: 12px; margin: 0;'>
                            Cet email a été envoyé automatiquement, merci de ne pas y répondre.<br>
                            © 2024 AMCB. Tous droits réservés.
                        </p>
                    </div>
                    
                </div>
            </div>
        </body>
        </html>
        ";
    }
    
    /**
     * Génère le template texte de l'email (fallback)
     */
    private function generateTextTemplate($code) {
        return "
        Vérification de votre compte AMCB
        
        Bonjour,
        
        Vous avez récemment créé un compte sur AMCB. Pour finaliser votre inscription, 
        veuillez utiliser le code de vérification suivant :
        
        CODE: $code
        
        Important :
        - Ce code expire dans 15 minutes
        - Ne partagez jamais ce code avec qui que ce soit
        - Si vous n'avez pas demandé ce code, ignorez cet email
        
        Cet email a été envoyé automatiquement, merci de ne pas y répondre.
        © 2024 AMCB. Tous droits réservés.
        ";
    }
} 