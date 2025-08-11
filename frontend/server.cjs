const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory storage for notifications
let notifications = [];

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

// API Routes for notifications
app.get('/api/notifications/:userId', (req, res) => {
  const { userId } = req.params;
  const userNotifications = notifications.filter(n => n.userId === userId);
  console.log(`📋 Récupération des notifications pour ${userId}: ${userNotifications.length} trouvées`);
  res.json(userNotifications);
});

app.post('/api/notifications', (req, res) => {
  const notificationData = req.body;
  const newNotification = {
    id: generateId(),
    ...notificationData,
    createdAt: new Date().toISOString()
  };
  notifications.push(newNotification);
  console.log(`✅ Notification créée: ${newNotification.id}`);
  res.status(201).json(newNotification);
});

app.put('/api/notifications/:id', (req, res) => {
  const { id } = req.params;
  const updateData = req.body;
  const index = notifications.findIndex(n => n.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Notification non trouvée' });
  }
  
  notifications[index] = { ...notifications[index], ...updateData };
  console.log(`✅ Notification mise à jour: ${id}`);
  res.json(notifications[index]);
});

app.delete('/api/notifications/:id', (req, res) => {
  const { id } = req.params;
  const index = notifications.findIndex(n => n.id === id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Notification non trouvée' });
  }
  
  notifications.splice(index, 1);
  console.log(`✅ Notification supprimée: ${id}`);
  res.status(204).send();
});

// Serve static files from dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all route to serve React app (only for non-API routes)
app.get('*', (req, res, next) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return next();
  }
  
  // Serve React app for all other routes
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur unique démarré sur http://localhost:${PORT}`);
  console.log(`📱 Application React servie depuis /dist`);
  console.log(`🔌 API notifications disponible sur /api/notifications`);
}); 