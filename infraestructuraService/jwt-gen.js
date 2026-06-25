const crypto = require('crypto');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const dir = 'C:\\Users\\MARCELA\\AppData\\Local\\Temp\\opencode\\jwt-keys';
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

fs.writeFileSync(dir + '\\private.pem', privateKey);
fs.writeFileSync(dir + '\\public.pem', publicKey);

const token = jwt.sign({ rol: 'admin', id: 1, email: 'test@ucb.edu.bo' }, privateKey, { algorithm: 'RS256', expiresIn: '1h' });
fs.writeFileSync(dir + '\\token.txt', token);

console.log('PUBLIC_KEY_START');
console.log(publicKey);
console.log('PUBLIC_KEY_END');
console.log('TOKEN_START');
console.log(token);
console.log('TOKEN_END');
