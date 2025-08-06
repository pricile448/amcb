const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Test Resend API key
console.log('🔍 Checking Resend API key...');
console.log('VITE_RESEND_API_KEY exists:', !!process.env.VITE_RESEND_API_KEY);
console.log('VITE_RESEND_API_KEY starts with re_:', process.env.VITE_RESEND_API_KEY?.startsWith('re_'));

const resend = new Resend(process.env.VITE_RESEND_API_KEY);

// Simple test endpoint
app.post('/api/send-email', async (req, res) => {
  console.log('📧 Test email request received:', req.body);
  
  try {
    const { email, code, userName } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email et code requis' });
    }

    console.log('📧 Attempting to send email to:', email);

    const result = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: [email],
      subject: 'Test AMCB Email',
      html: `<h1>Test Email</h1><p>Code: ${code}</p>`
    });

    if (result.error) {
      console.error('❌ Resend error:', result.error);
      return res.status(500).json({ error: result.error.message });
    }

    console.log('✅ Email sent successfully:', result.data?.id);
    return res.status(200).json({ success: true, message: 'Test email sent' });

  } catch (error) {
    console.error('❌ Server error:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`🧪 Test server running on port ${PORT}`);
  console.log(`📧 Test endpoint: http://localhost:${PORT}/api/send-email`);
  console.log(`❤️ Health check: http://localhost:${PORT}/health`);
}); 