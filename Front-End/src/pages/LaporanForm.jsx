import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getKecamatan, getKelurahan, createLaporan, uploadFoto } from '../services/laporanService';
import { ArrowLeft, Upload } from 'lucide-react';

export default function LaporanForm() {
  const navigate = useNavigate();
  const [kecamatans, setKecamatans] = useState([]);
  const [kelurahans, setKelurahans] = useState([]);
  
  const [formData, setFormData] = useState({
    kecamatan_id: '',
    kelurahan_id: '',
    deskripsi: '',
    alamat: ''
  });
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getKecamatan().then(setKecamatans);
  }, []);

  const handleKecamatanChange = async (e) => {
    const id = e.target.value;
    setFormData(prev => ({ ...prev, kecamatan_id: id, kelurahan_id: '' }));
    if (id) {
      const data = await getKelurahan(id);
      setKelurahans(data);
    } else {
      setKelurahans([]);
    }
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.deskripsi.length < 20) {
      return alert('Deskripsi minimal 20 karakter');
    }
    
    setLoading(true);
    let foto_url = null;
    if (foto) {
      foto_url = await uploadFoto(foto);
    }

    const { success, error } = await createLaporan({ ...formData, foto_url });
    setLoading(false);
    
    if (success) {
      navigate('/laporan');
    } else {
      alert('Gagal membuat laporan: ' + error);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-indigo-600 font-medium mb-6 transition-colors">
        <ArrowLeft size={18} className="mr-2" />
        Kembali
      </button>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-8 md:p-10 text-white">
          <h1 className="text-3xl font-extrabold mb-3">Buat Laporan Baru</h1>
          <p className="text-indigo-100 text-lg">Bantu kota kita menjadi lebih baik dengan melaporkan infrastruktur yang rusak.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Kecamatan</label>
              <select 
                required
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent block p-3.5 transition-all outline-none"
                value={formData.kecamatan_id}
                onChange={handleKecamatanChange}
              >
                <option value="">Pilih Kecamatan</option>
                {kecamatans.map(k => (
                  <option key={k.id} value={k.id}>{k.nama_kecamatan}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Kelurahan</label>
              <select 
                required
                disabled={!formData.kecamatan_id}
                className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent block p-3.5 transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                value={formData.kelurahan_id}
                onChange={e => setFormData(prev => ({ ...prev, kelurahan_id: e.target.value }))}
              >
                <option value="">Pilih Kelurahan</option>
                {kelurahans.map(k => (
                  <option key={k.id} value={k.id}>{k.nama_kelurahan}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Alamat Lengkap Kejadian</label>
            <input 
              type="text" 
              required
              placeholder="Contoh: Jl. Sudirman No. 12, depan Indomaret"
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent block p-3.5 transition-all outline-none"
              value={formData.alamat}
              onChange={e => setFormData(prev => ({ ...prev, alamat: e.target.value }))}
            />
          </div>

          <div>
            <label className="flex justify-between items-end mb-2">
              <span className="block text-sm font-bold text-slate-700">Deskripsi Detail</span>
              <span className={`text-xs font-semibold ${formData.deskripsi.length < 20 ? 'text-red-500' : 'text-slate-400'}`}>
                {formData.deskripsi.length}/500
              </span>
            </label>
            <textarea 
              required
              maxLength={500}
              rows={5}
              placeholder="Deskripsikan kerusakan secara detail (min 20 karakter)..."
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent block p-3.5 transition-all outline-none resize-none"
              value={formData.deskripsi}
              onChange={e => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Bukti Foto (Opsional)</label>
            <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-56 border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-indigo-400 transition-all overflow-hidden relative group">
                    {preview ? (
                      <>
                        <img src={preview} alt="Preview" className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-slate-900/70 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2">
                            <Upload size={16} /> Ganti Foto
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 text-indigo-500">
                            <Upload size={24} />
                          </div>
                          <p className="mb-1 text-sm text-slate-600 font-bold">Klik untuk upload foto</p>
                          <p className="text-xs text-slate-400 font-medium">PNG, JPG (MAX. 5MB)</p>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={handleFotoChange} />
                </label>
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full text-white bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl text-lg px-5 py-4 text-center disabled:opacity-50 transition-all shadow-xl shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5"
            >
              {loading ? 'Mengirim Laporan...' : 'Kirim Laporan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
