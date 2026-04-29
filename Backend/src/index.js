import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import wilayahRoutes from './routes/wilayah.js';
import laporanRoutes from './routes/laporan.js';
import adminRoutes from './routes/admin.js';
import profileRoutes from './routes/profile.js';

const app = express();
const PORT = process.env.PORT || 8001;

// ✅ CORS
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// ✅ Middleware
app.use(express.json());

// ✅ Debug log 
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

// ✅ Routes
app.use('/api/wilayah', wilayahRoutes);
app.use('/api/laporan', laporanRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/profile', profileRoutes);

// ✅ Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString()
  });
});

// ✅ 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route tidak ditemukan' });
});

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// ✅ Start server
const server = app.listen(PORT, () => {
  console.log(`✅ Server running di http://localhost:${PORT}`);
});

// ✅ Handle port conflict
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} sedang dipakai.`);
    process.exit(1);
  }
});