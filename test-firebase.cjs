const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5173;

// Middleware
app.use(cors());
app.use(express.json());

// Test simple
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Serveur de test fonctionnel !',
    mode: 'test',
    auth: 'test',
    data: 'test'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur de TEST démarré sur http://localhost:${PORT}`);
  console.log(`🧪 Test: http://localhost:${PORT}/api/test`);
}); 