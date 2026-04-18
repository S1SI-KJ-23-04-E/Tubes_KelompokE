import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getKecamatan, getKelurahan, createLaporan, uploadFoto } from '../services/laporanService';
import { ArrowLeft, Upload } from 'lucide-react';
import Select from 'react-select';

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
    getKecamatan().then(data => {
      const options = data.map(k => ({ value: k.id, label: k.nama_kecamatan }));
      setKecamatans(options);
    });
  }, []);

  const handleKecamatanChange = async (selectedOption) => {
    const id = selectedOption ? selectedOption.value : '';
    setFormData(prev => ({ ...prev, kecamatan_id: id, kelurahan_id: '' }));
    if (id) {
      const data = await getKelurahan(id);
      const options = data.map(k => ({ value: k.id, label: k.nama_kelurahan }));
      setKelurahans(options);
    } else {
      setKelurahans([]);
    }
  };

  const handleKelurahanChange = (selectedOption) => {
    const id = selectedOption ? selectedOption.value : '';
    setFormData(prev => ({ ...prev, kelurahan_id: id }));
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
    if (!formData.kecamatan_id || !formData.kelurahan_id) {
      return alert('Harap pilih Kecamatan dan Kelurahan');
    }
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

  // Custom filter to only match from the start of the string
  const customFilter = (option, inputValue) => {
    return option.label.toLowerCase().startsWith(inputValue.toLowerCase());
  };

  // Custom styles for react-select to match tailwind theme
  const customStyles = {
    control: (base, state) => ({
      ...base,
      border: state.isFocused ? '2px solid #6366f1' : '1px solid #e2e8f0', // indigo-500 or slate-200
      borderRadius: '0.75rem', // xl
      padding: '4px',
      backgroundColor: '#f8fafc', // slate-50
      boxShadow: 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#6366f1' : '#cbd5e1'
      }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? '#4f46e5' : state.isFocused ? '#e0e7ff' : null,
      color: state.isSelected ? 'white' : '#0f172a',
      '&:active': {
        backgroundColor: '#4f46e5'
      }
    })
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
              <Select 
                options={kecamatans}
                placeholder="Cari Kecamatan..."
                isClearable
                isSearchable
                filterOption={customFilter}
                styles={customStyles}
                onChange={handleKecamatanChange}
                value={kecamatans.find(k => k.value === formData.kecamatan_id) || null}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Kelurahan</label>
              <Select 
                options={kelurahans}
                placeholder="Cari Kelurahan..."
                isDisabled={!formData.kecamatan_id}
                isClearable
                isSearchable
                filterOption={customFilter}
                styles={customStyles}
                onChange={handleKelurahanChange}
                value={kelurahans.find(k => k.value === formData.kelurahan_id) || null}
              />
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
