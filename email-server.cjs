const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Resend (will be created when needed)
let resend = null;

// Function to initialize Resend
function initializeResend() {
  if (!process.env.VITE_RESEND_API_KEY) {
    throw new Error('VITE_RESEND_API_KEY not configured. Please set your Resend API key in the .env file.');
  }
  
  if (!resend) {
    resend = new Resend(process.env.VITE_RESEND_API_KEY);
  }
  
  return resend;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Email server is running',
    port: PORT,
    resendConfigured: !!process.env.VITE_RESEND_API_KEY
  });
});

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  console.log('📧 Received email request:', req.body);
  
  try {
    const { email, code, userName } = req.body;

    // Validate required fields
    if (!email || !code) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and code are required' 
      });
    }

    console.log('📧 Attempting to send email to:', email);

    // Initialize Resend and send email
    const resendInstance = initializeResend();
    const result = await resendInstance.emails.send({
      from: 'onboarding@resend.dev', // Using default Resend email for testing
      to: [email],
      subject: 'Vérification de votre compte AMCB',
      html: generateVerificationEmailHTML(code, userName || email)
    });

    if (result.error) {
      console.error('❌ Resend error:', result.error);
      return res.status(500).json({ 
        success: false,
        error: result.error.message || 'Failed to send email' 
      });
    }

    console.log('✅ Email sent successfully:', result.data?.id);
    return res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully',
      id: result.data?.id
    });

  } catch (error) {
    console.error('❌ Email sending error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error' 
    });
  }
});

// Function to generate verification email HTML
function generateVerificationEmailHTML(code, userName) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Vérification de votre compte AMCB</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0; 
          background-color: #f4f4f4; 
        }
        .container { 
          max-width: 600px; 
          margin: 20px auto; 
          background: white; 
          border-radius: 8px; 
          overflow: hidden; 
          box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        }
        .header { 
          background: linear-gradient(135deg, #1e40af, #3b82f6); 
          color: white; 
          padding: 30px 20px; 
          text-align: center; 
        }
        .header h1 { 
          margin: 0; 
          font-size: 24px; 
        }
        .content { 
          padding: 40px 30px; 
          background: white; 
        }
        .code { 
          font-size: 36px; 
          font-weight: bold; 
          text-align: center; 
          color: #1e40af; 
          padding: 30px; 
          background: #f8fafc; 
          border: 2px dashed #1e40af; 
          border-radius: 12px; 
          margin: 30px 0; 
          letter-spacing: 4px; 
        }
        .warning { 
          background: #fef3c7; 
          border: 1px solid #f59e0b; 
          border-radius: 8px; 
          padding: 15px; 
          margin: 20px 0; 
          color: #92400e; 
        }
        .footer { 
          text-align: center; 
          padding: 20px; 
          color: #6b7280; 
          font-size: 14px; 
          background: #f9fafb; 
          border-top: 1px solid #e5e7eb; 
        }
        .button { 
          display: inline-block; 
          background: #1e40af; 
          color: white; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 6px; 
          margin: 20px 0; 
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Vérification de votre compte AMCB</h1>
        </div>
        <div class="content">
          <p>Bonjour ${userName},</p>
          <p>Merci de vous être inscrit sur AMCB. Pour finaliser votre inscription et sécuriser votre compte, veuillez utiliser le code de vérification suivant :</p>
          
          <div class="code">${code}</div>
          
          <div class="warning">
            <strong>⚠️ Important :</strong> Ce code expire dans 15 minutes pour des raisons de sécurité.
          </div>
          
          <p>Si vous n'avez pas créé de compte sur AMCB, vous pouvez ignorer cet email en toute sécurité.</p>
          
          <p>Pour toute question, n'hésitez pas à contacter notre équipe support.</p>
          
          <p>Cordialement,<br><strong>L'équipe AMCB</strong></p>
        </div>
        <div class="footer">
          <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          <p>© 2024 AMCB. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  res.status(500).json({ 
    success: false,
    error: 'Internal server error' 
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    error: 'Endpoint not found' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Email server started on http://localhost:${PORT}`);
  console.log(`📧 Email endpoint: http://localhost:${PORT}/api/send-email`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔑 Resend API key configured: ${!!process.env.VITE_RESEND_API_KEY}`);
  
  if (!process.env.VITE_RESEND_API_KEY) {
    console.warn('⚠️  WARNING: VITE_RESEND_API_KEY not found in environment variables');
    console.warn('   Please set your Resend API key to enable email sending');
  }
});
