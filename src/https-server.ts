import https from 'https';
import fs from 'fs';
import path from 'path';
import app from './index';

const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// For development, create self-signed certificates
// In production, use proper SSL certificates from Let's Encrypt or your provider
const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, '../certificates/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../certificates/cert.pem'))
};

https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
  console.log(`🔒 HTTPS Server is running on port ${HTTPS_PORT}`);
  console.log(`📚 Secure Health check: https://localhost:${HTTPS_PORT}/health`);
  console.log(`📚 Secure Auth API: https://localhost:${HTTPS_PORT}/api/v1/auth`);
});