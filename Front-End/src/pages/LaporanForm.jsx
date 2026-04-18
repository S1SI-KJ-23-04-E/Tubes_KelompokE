import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getKecamatan, getKelurahan, createLaporan, uploadFoto } from '../services/laporanService';
import { ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react';
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

  const customFilter = (option, inputValue) => {
    return option.label.toLowerCase().startsWith(inputValue.toLowerCase());
  };

  // Minimalist react-select styles matching the screenshot
  const customStyles = {
    control: (base, state) => ({
      ...base,
      border: '1px solid #e2e8f0', // slate-200
      borderRadius: '0.375rem', // rounded-md
      padding: '2px',
      backgroundColor: '#f8fafc', // slate-50
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#cbd5e1'
      }
    }),
    placeholder: (base) => ({
      ...base,
      color: '#64748b', // slate-500
      fontSize: '0.875rem' // text-sm
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: '0.875rem',
      color: '#334155'
    })
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 pt-8">
      {/* Back button */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-[#1e3a8a] hover:text-blue-800 font-semibold mb-6 transition-colors text-sm"
      >
        <ArrowLeft size={16} className="mr-2" />
        Kembali ke Dashboard
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-lg shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-8 md:p-10">
          
          <div className="mb-8 border-b border-slate-100 pb-6">
            <h1 className="text-2xl font-bold text-[#1e3a8a] mb-2">Formulir Laporan Kerusakan</h1>
            <p className="text-slate-500 text-sm">Lengkapi informasi berikut untuk membuat laporan kerusakan infrastruktur</p>
          </div>

          <div className="space-y-6">
            {/* Alamat */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Alamat Lokasi</label>
              <input 
                type="text" 
                required
                placeholder="Contoh: Jl. Sudirman No. 123"
                className="w-full bg-[#f8fafc] border border-slate-200 text-slate-700 rounded-md block p-3 text-sm focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] transition-all"
                value={formData.alamat}
                onChange={e => setFormData(prev => ({ ...prev, alamat: e.target.value }))}
              />
            </div>

            {/* Kecamatan & Kelurahan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Kecamatan</label>
                <Select 
                  options={kecamatans}
                  placeholder="Pilih Kecamatan"
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
                  placeholder="Pilih Kelurahan Dulu"
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

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi Kerusakan</label>
              <textarea 
                required
                maxLength={500}
                rows={4}
                placeholder="Jelaskan detail kerusakan yang Anda temukan..."
                className="w-full bg-[#f8fafc] border border-slate-200 text-slate-700 rounded-md block p-3 text-sm focus:outline-none focus:border-[#1e3a8a] focus:ring-1 focus:ring-[#1e3a8a] transition-all resize-none"
                value={formData.deskripsi}
                onChange={e => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
              />
            </div>

            {/* Foto */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Bukti Foto</label>
              <div className="flex items-start justify-start w-full">
                  <label className="flex flex-col items-center justify-center w-full sm:w-72 h-44 border border-slate-200 border-dashed rounded-md cursor-pointer bg-[#f8fafc] hover:bg-slate-100 transition-all overflow-hidden relative group">
                      {preview ? (
                        <>
                          <img src={preview} alt="Preview" className="w-full h-full object-cover bg-slate-900/5 group-hover:opacity-50 transition-opacity" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="bg-slate-900/80 text-white px-4 py-2 rounded text-sm flex items-center gap-2">
                              <Upload size={14} /> Ganti Foto
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                            <ImageIcon size={28} className="text-slate-400 mb-2" />
                            <p className="mb-1 text-sm text-slate-500 font-medium">Klik untuk upload foto</p>
                            <p className="text-xs text-slate-400">Format: JPG, PNG (Max 5MB)</p>
                        </div>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleFotoChange} />
                  </label>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-10 flex items-center justify-end space-x-4 border-t border-slate-100 pt-6">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 border border-[#1e3a8a] text-[#1e3a8a] font-semibold rounded-md text-sm hover:bg-blue-50 transition-colors"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2.5 bg-[#1e3a8a] hover:bg-[#172554] text-white font-semibold rounded-md text-sm transition-colors shadow-sm disabled:opacity-70 flex items-center"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                  Memproses...
                </>
              ) : (
                'Kirim Laporan'
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
