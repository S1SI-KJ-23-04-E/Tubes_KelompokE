import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import laporanRouter from './routes/laporan.js';
import wilayahRouter from './routes/wilayah.js';
import adminRouter from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 7777;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ success: true, message: 'Backend berjalan' });
});

app.use('/api/laporan', laporanRouter);
app.use('/api', wilayahRouter);
app.use('/api/admin', adminRouter);

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint tidak ditemukan' });
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});
