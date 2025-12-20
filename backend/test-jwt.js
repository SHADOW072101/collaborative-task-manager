const jwt = require('jsonwebtoken');

const secret = 'test-secret-key';
const payload = { userId: 'test-user-id' };

try {
  const token = jwt.sign(payload, secret, { expiresIn: '7d' });
  console.log('Token generated successfully:', token);
  
  const decoded = jwt.verify(token, secret);
  console.log('Token verified successfully:', decoded);
} catch (error) {
  console.error('JWT Error:', error.message);
}