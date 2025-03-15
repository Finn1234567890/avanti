const fs = require('fs');
const jwt = require('jsonwebtoken');

// Read the private key
const privateKey = fs.readFileSync('/Users/finnlangenkaemper/Desktop/Projects/Avanti/avanti-app/AuthKey_993VHB72GG.p8');

// Create the JWT
const token = jwt.sign({}, privateKey, {
  algorithm: 'ES256',
  expiresIn: '180d',
  issuer: 'L94BT84S6K',
  subject: 'com.avantiuhh.app.signin',
  audience: 'https://appleid.apple.com',
  header: {
    alg: 'ES256',
    kid: '993VHB72GG'
  }
});

console.log(token); 