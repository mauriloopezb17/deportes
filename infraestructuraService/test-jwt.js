require('dotenv/config');
const jwt = require('jsonwebtoken');
const fs = require('fs');

const publicKey = process.env.JWT_PUBLIC_KEY?.replace(/\\n/g, "\n");
console.log('Public key presente:', !!publicKey);
console.log('Primeros 50 chars:', publicKey?.substring(0, 50));
console.log('Ultimos 50 chars:', publicKey?.substring(publicKey.length - 50));

const token = fs.readFileSync('C:\\Users\\MARCELA\\AppData\\Local\\Temp\\opencode\\jwt-keys\\token.txt', 'utf8').trim();

try {
  const payload = jwt.verify(token, publicKey, { algorithms: ['RS256'] });
  console.log('Token valido:', payload);
} catch (e) {
  console.error('Token invalido:', e.message);
}
