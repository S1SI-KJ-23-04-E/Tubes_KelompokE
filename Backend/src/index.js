import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import wilayahRoutes from './routes/wilayah.js';
import laporanRoutes from './routes/laporan.js';
import adminRoutes from './routes/admin.js';
import beritaRoutes from './routes/berita.js';
import profileRoutes from './routes/profile.js';
import dashboardRoutes from './routes/dashboard.js';
import duplicateRoutes from './routes/duplicate.js';

const app = express();
const PORT = process.env.PORT || 8001;

// ✅ CORS
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
];

const isLocalhostOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || isLocalhostOrigin(origin)) return callback(null, true);
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// ✅ Middleware
app.use(express.json());
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ✅ Debug log
app.use((req, res, next) => {
  console.log(`➡️ ${req.method} ${req.url}`);
  next();
});

// ✅ Routes
app.use('/api/wilayah', wilayahRoutes);
app.use('/api/laporan', laporanRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/berita', beritaRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/duplicate', duplicateRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    time: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route tidak ditemukan' });
});

app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

const server = app.listen(PORT, () => {
  console.log(`✅ Server running di http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} sedang dipakai.`);
    process.exit(1);
  }
});
