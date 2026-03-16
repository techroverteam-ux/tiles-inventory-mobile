const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Mock login endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simple mock authentication
  if (email === 'admin@tiles.com' && password === 'admin123') {
    res.json({
      success: true,
      token: 'mock-jwt-token-12345',
      refreshToken: 'mock-refresh-token-67890',
      user: {
        id: '1',
        email: 'admin@tiles.com',
        name: 'Admin User',
        role: 'admin'
      },
      expiresIn: 86400
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Mock refresh token endpoint
app.post('/api/auth/refresh', (req, res) => {
  res.json({
    success: true,
    token: 'new-mock-jwt-token-12345',
    refreshToken: 'new-mock-refresh-token-67890',
    expiresIn: 86400
  });
});

// Mock logout endpoint
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Mock API server running on http://localhost:${PORT}`);
  console.log('Test credentials: admin@tiles.com / admin123');
});