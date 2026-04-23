import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import wilayahRoutes from './routes/wilayah.js';
import laporanRoutes from './routes/laporan.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json());

// Routes
app.use('/api', wilayahRoutes);
app.use('/api/laporan', laporanRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

const server = app.listen(PORT, () => {
  console.log(`✅ Express server running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} sudah dipakai proses lain.`);
    console.error(`   Jalankan perintah ini untuk membebaskan port:`);
    console.error(`   Get-NetTCPConnection -LocalPort ${PORT} -State Listen | Select-Object -ExpandProperty OwningProcess | ForEach-Object { taskkill /PID $_ /F }`);
    process.exit(1);
  }
});