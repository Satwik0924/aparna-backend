const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const certDir = path.join(__dirname, 'certificates');

// Create certificates directory if it doesn't exist
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir);
}

console.log('🔐 Generating self-signed SSL certificates for development...');

try {
  // Generate private key
  execSync(`openssl genrsa -out ${path.join(certDir, 'key.pem')} 2048`);
  
  // Generate certificate
  execSync(`openssl req -new -x509 -key ${path.join(certDir, 'key.pem')} -out ${path.join(certDir, 'cert.pem')} -days 365 -subj "/C=IN/ST=Telangana/L=Hyderabad/O=Aparna Constructions/OU=IT/CN=localhost"`);
  
  console.log('✅ SSL certificates generated successfully!');
  console.log(`📁 Location: ${certDir}`);
  console.log('\n⚠️  Note: These are self-signed certificates for development only.');
  console.log('For production, use certificates from a trusted CA like Let\'s Encrypt.');
} catch (error) {
  console.error('❌ Failed to generate certificates:', error.message);
  console.log('\n💡 Make sure OpenSSL is installed on your system:');
  console.log('   - Windows: Install Git Bash or use WSL');
  console.log('   - Mac: Should be pre-installed');
  console.log('   - Linux: sudo apt-get install openssl');
}