const net = require('net');

// Function to check if a port is available
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.listen(port, () => {
      server.once('close', () => {
        resolve(true);
      });
      server.close();
    });
    
    server.on('error', () => {
      resolve(false);
    });
  });
}

// Function to find an available port starting from a given port
async function findAvailablePort(startPort) {
  let port = startPort;
  while (!(await isPortAvailable(port))) {
    port++;
    if (port > startPort + 100) {
      throw new Error(`No available ports found between ${startPort} and ${startPort + 100}`);
    }
  }
  return port;
}

// Main function
async function main() {
  const portsToCheck = [3000, 5173, 5174, 8080];
  
  console.log('🔍 Checking port availability...\n');
  
  for (const port of portsToCheck) {
    const available = await isPortAvailable(port);
    const status = available ? '✅ Available' : '❌ In Use';
    console.log(`Port ${port}: ${status}`);
  }
  
  console.log('\n🚀 Finding available port for development server...');
  
  try {
    const availablePort = await findAvailablePort(5173);
    console.log(`✅ Recommended port: ${availablePort}`);
    console.log(`💡 You can start your server with: PORT=${availablePort} npm run dev`);
  } catch (error) {
    console.error('❌ Error finding available port:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { isPortAvailable, findAvailablePort }; 