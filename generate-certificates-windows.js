const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const forge = require('node-forge');

const certDir = path.join(__dirname, 'certificates');

// Create certificates directory if it doesn't exist
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir);
}

console.log('🔐 Generating self-signed SSL certificates for development...');

try {
  // Generate a keypair
  const keys = forge.pki.rsa.generateKeyPair(2048);
  
  // Create a certificate
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = '01';
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
  
  const attrs = [{
    name: 'commonName',
    value: 'localhost'
  }, {
    name: 'countryName',
    value: 'IN'
  }, {
    shortName: 'ST',
    value: 'Telangana'
  }, {
    name: 'localityName',
    value: 'Hyderabad'
  }, {
    name: 'organizationName',
    value: 'Aparna Constructions'
  }, {
    shortName: 'OU',
    value: 'IT'
  }];
  
  cert.setSubject(attrs);
  cert.setIssuer(attrs);
  cert.setExtensions([{
    name: 'basicConstraints',
    cA: true
  }, {
    name: 'keyUsage',
    keyCertSign: true,
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true,
    dataEncipherment: true
  }, {
    name: 'extKeyUsage',
    serverAuth: true,
    clientAuth: true,
    codeSigning: true,
    emailProtection: true,
    timeStamping: true
  }, {
    name: 'nsCertType',
    client: true,
    server: true,
    email: true,
    objsign: true,
    sslCA: true,
    emailCA: true,
    objCA: true
  }, {
    name: 'subjectAltName',
    altNames: [{
      type: 2, // DNS
      value: 'localhost'
    }, {
      type: 7, // IP
      ip: '127.0.0.1'
    }]
  }]);
  
  // Self-sign certificate
  cert.sign(keys.privateKey);
  
  // Convert to PEM format
  const pemCert = forge.pki.certificateToPem(cert);
  const pemKey = forge.pki.privateKeyToPem(keys.privateKey);
  
  // Write files
  fs.writeFileSync(path.join(certDir, 'cert.pem'), pemCert);
  fs.writeFileSync(path.join(certDir, 'key.pem'), pemKey);
  
  console.log('✅ SSL certificates generated successfully!');
  console.log(`📁 Location: ${certDir}`);
  console.log('\n⚠️  Note: These are self-signed certificates for development only.');
  console.log('For production, use certificates from a trusted CA like Let\'s Encrypt.');
} catch (error) {
  console.error('❌ Failed to generate certificates:', error.message);
  console.log('\n💡 Try running: npm install node-forge');
}