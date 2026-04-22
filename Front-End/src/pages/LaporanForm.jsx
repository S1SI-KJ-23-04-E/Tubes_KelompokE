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
      navigate('/laporan?tab=history');
    } else {
      alert('Gagal membuat laporan: ' + error);
    }
  };

  const customFilter = (option, inputValue) => {
    return option.label.toLowerCase().startsWith(inputValue.toLowerCase());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 p-4 md:p-8 pt-8">
      <div className="max-w-4xl mx-auto">
        {/* Back button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center text-[#1e3a8a] hover:text-blue-700 font-semibold mb-8 transition-all duration-300 text-sm group"
        >
          <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Kembali ke Dashboard
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden backdrop-blur-sm bg-opacity-95">
          <form onSubmit={handleSubmit} className="p-6 md:p-12">
            
            {/* Header Section */}
            <div className="mb-10 pb-8 border-b-2 border-blue-200">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#1e3a8a] to-blue-600 bg-clip-text text-transparent mb-3">
                    Formulir Laporan Kerusakan
                  </h1>
                  <p className="text-slate-600 text-base">Lengkapi informasi berikut untuk membuat laporan kerusakan infrastruktur dengan detail yang akurat</p>
                </div>
              </div>
            </div>

          <div className="space-y-8">
            {/* Alamat */}
            <div className="form-group">
              <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center">
                <span className="w-1 h-1 bg-[#1e3a8a] rounded-full mr-2"></span>
                Alamat Lokasi
              </label>
              <input 
                type="text" 
                required
                placeholder="Contoh: Jl. Sudirman No. 123"
                className="w-full bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-slate-200 text-slate-800 rounded-lg block px-4 py-3.5 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20 focus:bg-white transition-all duration-300 placeholder-slate-500"
                value={formData.alamat}
                onChange={e => setFormData(prev => ({ ...prev, alamat: e.target.value }))}
              />
            </div>

            {/* Kecamatan & Kelurahan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              <div className="form-group">
                <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center">
                  <span className="w-1 h-1 bg-[#1e3a8a] rounded-full mr-2"></span>
                  Kecamatan
                </label>
                <Select 
                  options={kecamatans}
                  placeholder="Pilih Kecamatan"
                  isClearable
                  isSearchable
                  filterOption={customFilter}
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      border: '2px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      padding: '6px',
                      backgroundColor: state.isFocused ? '#ffffff' : '#f8fafc',
                      boxShadow: state.isFocused ? '0 0 0 2px rgba(30, 58, 138, 0.1)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#cbd5e1',
                        backgroundColor: '#ffffff'
                      }
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: '#94a3b8',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }),
                    singleValue: (base) => ({
                      ...base,
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#334155'
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected ? '#1e3a8a' : state.isFocused ? '#dbeafe' : '#ffffff',
                      color: state.isSelected ? '#ffffff' : '#334155',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      padding: '10px 12px',
                      '&:active': {
                        backgroundColor: '#1e3a8a'
                      }
                    }),
                    menuList: (base) => ({
                      ...base,
                      borderRadius: '0.5rem'
                    })
                  }}
                  onChange={handleKecamatanChange}
                  value={kecamatans.find(k => k.value === formData.kecamatan_id) || null}
                />
              </div>

              <div className="form-group">
                <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center">
                  <span className="w-1 h-1 bg-[#1e3a8a] rounded-full mr-2"></span>
                  Kelurahan
                </label>
                <Select 
                  options={kelurahans}
                  placeholder="Pilih Kelurahan Dulu"
                  isDisabled={!formData.kecamatan_id}
                  isClearable
                  isSearchable
                  filterOption={customFilter}
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      border: '2px solid #e2e8f0',
                      borderRadius: '0.5rem',
                      padding: '6px',
                      backgroundColor: state.isFocused ? '#ffffff' : '#f8fafc',
                      boxShadow: state.isFocused ? '0 0 0 2px rgba(30, 58, 138, 0.1)' : 'none',
                      cursor: !formData.kecamatan_id ? 'not-allowed' : 'pointer',
                      opacity: !formData.kecamatan_id ? 0.6 : 1,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: !formData.kecamatan_id ? '#e2e8f0' : '#cbd5e1',
                        backgroundColor: !formData.kecamatan_id ? '#f8fafc' : '#ffffff'
                      }
                    }),
                    placeholder: (base) => ({
                      ...base,
                      color: '#94a3b8',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }),
                    singleValue: (base) => ({
                      ...base,
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#334155'
                    }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected ? '#1e3a8a' : state.isFocused ? '#dbeafe' : '#ffffff',
                      color: state.isSelected ? '#ffffff' : '#334155',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      padding: '10px 12px',
                      '&:active': {
                        backgroundColor: '#1e3a8a'
                      }
                    }),
                    menuList: (base) => ({
                      ...base,
                      borderRadius: '0.5rem'
                    })
                  }}
                  onChange={handleKelurahanChange}
                  value={kelurahans.find(k => k.value === formData.kelurahan_id) || null}
                />
              </div>
            </div>

            {/* Deskripsi */}
            <div className="form-group">
              <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center">
                <span className="w-1 h-1 bg-[#1e3a8a] rounded-full mr-2"></span>
                Deskripsi Kerusakan
              </label>
              <div className="relative">
                <textarea 
                  required
                  maxLength={500}
                  rows={5}
                  placeholder="Jelaskan detail kerusakan yang Anda temukan..."
                  className="w-full bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-slate-200 text-slate-800 rounded-lg block px-4 py-3.5 text-sm font-medium focus:outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/20 focus:bg-white transition-all duration-300 resize-none placeholder-slate-500"
                  value={formData.deskripsi}
                  onChange={e => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
                />
                <div className="absolute bottom-3 right-4 text-xs text-slate-500 font-medium">
                  {formData.deskripsi.length}/500
                </div>
              </div>
            </div>

            {/* Foto */}
            <div className="form-group">
              <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center">
                <span className="w-1 h-1 bg-[#1e3a8a] rounded-full mr-2"></span>
                Bukti Foto
              </label>
              <div className="flex items-start justify-start w-full">
                  <label className="flex flex-col items-center justify-center w-full sm:w-full h-56 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50 hover:from-blue-100 hover:to-slate-100 transition-all duration-300 overflow-hidden relative group shadow-sm hover:shadow-md">
                      {preview ? (
                        <>
                          <img src={preview} alt="Preview" className="w-full h-full object-cover group-hover:opacity-60 transition-opacity duration-300" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-slate-900/40">
                            <div className="bg-white/95 text-slate-800 px-5 py-3 rounded-lg text-sm flex items-center gap-2 font-semibold shadow-lg">
                              <Upload size={16} /> Ganti Foto
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-6 pb-8 text-center px-4">
                            <div className="mb-3 p-3 bg-blue-100 rounded-full">
                              <ImageIcon size={32} className="text-[#1e3a8a]" />
                            </div>
                            <p className="mb-1 text-base text-slate-700 font-semibold">Klik untuk upload foto</p>
                            <p className="text-sm text-slate-500">Format: JPG, PNG (Max 5MB)</p>
                        </div>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleFotoChange} />
                  </label>
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="mt-12 flex items-center justify-end space-x-4 border-t border-slate-200 pt-8">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="px-7 py-3 border-2 border-slate-300 text-slate-700 font-bold rounded-lg text-sm hover:bg-slate-50 hover:border-slate-400 transition-all duration-300 hover:shadow-md active:scale-95"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-[#1e3a8a] to-blue-600 hover:from-[#172554] hover:to-blue-700 text-white font-bold rounded-lg text-sm transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center active:scale-95"
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
    </div>
  );
}
