// Test des variables d'environnement
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger le fichier .env
config({ path: join(__dirname, '.env') });

console.log('🔍 Test des variables d\'environnement Firebase:');
console.log('API Key:', process.env.VITE_FIREBASE_API_KEY);
console.log('Auth Domain:', process.env.VITE_FIREBASE_AUTH_DOMAIN);
console.log('Project ID:', process.env.VITE_FIREBASE_PROJECT_ID);
console.log('Storage Bucket:', process.env.VITE_FIREBASE_STORAGE_BUCKET);
console.log('Messaging Sender ID:', process.env.VITE_FIREBASE_MESSAGING_SENDER_ID);
console.log('App ID:', process.env.VITE_FIREBASE_APP_ID);

console.log('\n✅ Test terminé !'); 