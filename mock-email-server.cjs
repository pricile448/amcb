const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Mock email server is running',
    port: PORT,
    mode: 'mock'
  });
});

// Mock email sending endpoint
app.post('/api/send-email', async (req, res) => {
  console.log('📧 Mock email request received:', req.body);
  
  try {
    const { email, code, userName } = req.body;

    // Validate required fields
    if (!email || !code) {
      return res.status(400).json({ 
        success: false,
        error: 'Email and code are required' 
      });
    }

    console.log('📧 Mock email would be sent to:', email);
    console.log('📧 Verification code:', code);
    console.log('📧 User name:', userName || email);

    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Return success response
    console.log('✅ Mock email sent successfully');
    return res.status(200).json({ 
      success: true, 
      message: 'Mock email sent successfully (for testing purposes)',
      id: `mock_${Date.now()}`,
      email: email,
      code: code
    });

  } catch (error) {
    console.error('❌ Mock email error:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Internal server error' 
    });
  }
});

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
  console.log(`🚀 Mock email server started on http://localhost:${PORT}`);
  console.log(`📧 Mock email endpoint: http://localhost:${PORT}/api/send-email`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Mode: MOCK (no real emails sent)`);
  console.log(`💡 This server simulates email sending for testing purposes`);
});
