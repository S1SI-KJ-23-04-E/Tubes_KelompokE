import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getKecamatan, getKelurahan, createLaporan, uploadFoto } from '../services/laporanService';
import { ArrowLeft, Upload, Image as ImageIcon, MapPin, AlertCircle } from 'lucide-react';
import Select from 'react-select';
import { AlertModal } from '../components/Modals';

import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default icon in Vite
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

export default function LaporanForm() {
  const navigate = useNavigate();
  const [kecamatans, setKecamatans] = useState([]);
  const [kelurahans, setKelurahans] = useState([]);
  const [alertModal, setAlertModal] = useState({ open: false, title: '', message: '', type: 'error' });
  
  const [formData, setFormData] = useState({
    judul: '',
    kecamatan_id: '',
    kelurahan_id: '',
    deskripsi: '',
    alamat: ''
  });
  const [foto, setFoto] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [geoLocation, setGeoLocation] = useState({ latitude: -6.914744, longitude: 107.609810 }); // Default Bandung
  const [geoStatus, setGeoStatus] = useState('detecting'); // 'detecting' | 'success' | 'denied' | 'unavailable'
  const [mapValidationMsg, setMapValidationMsg] = useState('');
  const [validatingMap, setValidatingMap] = useState(false);

  // Capture geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus('unavailable');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
        setGeoStatus('success');
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        setGeoStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  // Function to validate pin location against selected Kelurahan
  const validateLocation = async (lat, lng, kelurahanName) => {
    if (!kelurahanName) {
      setMapValidationMsg('');
      return;
    }
    
    setValidatingMap(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      
      const address = data.address || {};
      const mapKelurahan = (address.village || address.suburb || address.neighbourhood || '').toLowerCase();
      
      if (mapKelurahan && !mapKelurahan.includes(kelurahanName.toLowerCase()) && !kelurahanName.toLowerCase().includes(mapKelurahan)) {
        setMapValidationMsg(`Titik peta berada di sekitar "${mapKelurahan}", tidak sesuai dengan Kelurahan yang Anda pilih (${kelurahanName}). Silakan geser pin ke lokasi yang benar.`);
      } else {
        setMapValidationMsg('');
      }
    } catch (err) {
      console.warn('Geocoding error:', err);
      // If API fails, we don't block the user (graceful fallback)
      setMapValidationMsg('');
    }
    setValidatingMap(false);
  };

  // Re-validate if Kelurahan selection changes
  useEffect(() => {
    const selectedKel = kelurahans.find(k => k.value === formData.kelurahan_id);
    if (selectedKel && geoStatus === 'success') {
      validateLocation(geoLocation.latitude, geoLocation.longitude, selectedKel.label);
    } else {
      setMapValidationMsg('');
    }
  }, [formData.kelurahan_id, kelurahans]);

  function MapCenterUpdater({ center }) {
    const map = useMapEvents({});
    useEffect(() => {
      if (center[0] !== null && center[1] !== null) {
        map.flyTo(center, 15);
      }
    }, [center, map]);
    return null;
  }

  function DraggableMarker() {
    const map = useMapEvents({
      click(e) {
        map.locate();
      },
      locationfound(e) {
        // Optional: fly to location if needed
      },
    });

    return (
      <Marker
        draggable={true}
        eventHandlers={{
          dragend: (e) => {
            const marker = e.target;
            const position = marker.getLatLng();
            setGeoLocation({ latitude: position.lat, longitude: position.lng });
            
            const selectedKel = kelurahans.find(k => k.value === formData.kelurahan_id);
            if (selectedKel) {
              validateLocation(position.lat, position.lng, selectedKel.label);
            }
          },
        }}
        position={[geoLocation.latitude, geoLocation.longitude]}
      />
    );
  }

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

  const handleKelurahanChange = async (selectedOption) => {
    const id = selectedOption ? selectedOption.value : '';
    setFormData(prev => ({ ...prev, kelurahan_id: id }));

    if (selectedOption) {
      try {
        const selectedKecamatan = kecamatans.find(k => k.value === formData.kecamatan_id);
        const kecamatanName = selectedKecamatan ? selectedKecamatan.label : '';
        const query = `${selectedOption.label}, ${kecamatanName}, Indonesia`;
        
        const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
        const data = await res.json();
        if (data && data.length > 0) {
          const newLat = parseFloat(data[0].lat);
          const newLng = parseFloat(data[0].lon);
          setGeoLocation({ latitude: newLat, longitude: newLng });
          validateLocation(newLat, newLng, selectedOption.label);
          setGeoStatus('success'); // Assume if we got coords, we have a valid point
        }
      } catch (err) {
        console.warn('Geocoding search error:', err);
      }
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
    if (!formData.kecamatan_id || !formData.kelurahan_id) {
      setAlertModal({ open: true, title: 'Incomplete', message: 'Harap pilih Kecamatan dan Kelurahan', type: 'error' });
      return;
    }
    
    setLoading(true);
    let foto_url = null;
    if (foto) {
      foto_url = await uploadFoto(foto);
    }

    const { success, error } = await createLaporan({ 
      ...formData, 
      foto_url,
      latitude: geoLocation.latitude,
      longitude: geoLocation.longitude
    });
    setLoading(false);
    
    if (success) {
      navigate('/laporan?tab=history');
    } else {
      setAlertModal({ open: true, title: 'Gagal', message: 'Gagal membuat laporan: ' + error, type: 'error' });
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
    <div className="max-w-4xl mx-auto p-4 md:p-8 pt-8 animate-fade-in">
      {/* Back button */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-[#1e3a8a] hover:text-blue-800 font-semibold mb-6 transition-all hover:translate-x-1 text-sm animate-fade-in-up group"
      >
        <ArrowLeft size={16} className="mr-2 transition-transform group-hover:-translate-x-1" />
        Kembali ke Dashboard
      </button>

      {/* Main Card */}
      <div className="bg-white rounded-lg shadow-lg border border-slate-100 overflow-hidden animate-scale-in hover:shadow-xl transition-shadow duration-300">
        <form onSubmit={handleSubmit} className="p-8 md:p-10">
          <div className="mb-8 border-b border-slate-100 pb-6">
            <h1 className="text-2xl font-bold text-[#1e3a8a] mb-2">Formulir Laporan Kerusakan</h1>
            <p className="text-slate-500 text-sm">Lengkapi informasi berikut untuk membuat laporan kerusakan infrastruktur</p>
            <p className="text-xs text-slate-500 mt-2">Field dengan tanda <span className="text-red-500">*</span> wajib diisi.</p>
          </div>

          <div className="space-y-6">
            {/* Judul */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Judul Laporan <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                required
                minLength={5}
                maxLength={100}
                placeholder="Contoh: Jalan Berlubang di Depan Sekolah"
                className="w-full bg-[#f8fafc] border border-slate-200 text-slate-700 rounded-md block p-3 text-sm focus:outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/30 transition-all input-focus-animate focus:shadow-md hover:border-slate-300"
                value={formData.judul}
                onChange={e => setFormData(prev => ({ ...prev, judul: e.target.value }))}
              />
            </div>

            {/* Alamat */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Alamat Lokasi <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                required
                placeholder="Contoh: Jl. Sudirman No. 123"
                className="w-full bg-[#f8fafc] border border-slate-200 text-slate-700 rounded-md block p-3 text-sm focus:outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/30 transition-all input-focus-animate focus:shadow-md hover:border-slate-300"
                value={formData.alamat}
                onChange={e => setFormData(prev => ({ ...prev, alamat: e.target.value }))}
              />
            </div>

            {/* Kecamatan & Kelurahan */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Kecamatan <span className="text-red-500">*</span></label>
                <Select 
                  options={kecamatans}
                  placeholder="Pilih Kecamatan"
                  isClearable
                  isSearchable
                  filterOption={customFilter}
                  styles={customStyles}
                  onChange={handleKecamatanChange}
                  value={kecamatans.find(k => k.value === formData.kecamatan_id) || null}
                  className="transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Kelurahan <span className="text-red-500">*</span></label>
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
                  className="transition-all"
                />
              </div>
            </div>

            {/* Interactive Map Section - Dipindah ke bawah Kelurahan */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
              <div className="flex justify-between items-end mb-2">
                <label className="block text-sm font-bold text-slate-700">Tentukan Titik Lokasi Peta</label>
                {validatingMap && <span className="text-[10px] text-orange-500 font-bold flex items-center gap-1 animate-pulse"><div className="w-2 h-2 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" /> Memvalidasi lokasi...</span>}
              </div>
              
              <div className={`border-2 rounded-xl overflow-hidden shadow-sm relative z-0 h-[250px] transition-all ${mapValidationMsg ? 'border-red-400' : 'border-slate-200'}`}>
                {geoStatus === 'detecting' && (
                  <div className="absolute inset-0 bg-slate-50 z-20 flex flex-col items-center justify-center">
                    <MapPin size={30} className="text-slate-300 animate-bounce mb-2" />
                    <span className="text-sm font-medium text-slate-500">Mencari lokasi Anda...</span>
                  </div>
                )}
                
                {/* We render map once we have a valid initial coordinate */}
                {geoLocation.latitude !== null && (
                  <MapContainer 
                    center={[geoLocation.latitude, geoLocation.longitude]} 
                    zoom={15} 
                    scrollWheelZoom={true} 
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <MapCenterUpdater center={[geoLocation.latitude, geoLocation.longitude]} />
                    <DraggableMarker />
                  </MapContainer>
                )}
              </div>

              {/* Status and Error Messages */}
              <div className="mt-2 space-y-2">
                {geoStatus === 'denied' && (
                   <p className="text-[11px] text-amber-600 font-medium flex items-center gap-1.5">
                     <AlertCircle size={12} /> Akses GPS ditolak. Peta diarahkan ke titik default. Silakan geser pin secara manual.
                   </p>
                )}
                <p className="text-[11px] text-slate-500 font-medium">
                  💡 <strong>Otomatis:</strong> Peta akan terbang ke kelurahan pilihan Anda. <strong>Geser pin merah</strong> untuk penyesuaian detail lokasi.
                </p>
                
                {mapValidationMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-600 font-medium flex items-start gap-2">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <p>{mapValidationMsg}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Deskripsi Kerusakan <span className="text-red-500">*</span></label>
              <textarea 
                required
                minLength={20}
                maxLength={500}
                rows={4}
                placeholder="Jelaskan detail kerusakan yang Anda temukan..."
                className="w-full bg-[#f8fafc] border border-slate-200 text-slate-700 rounded-md block p-3 text-sm focus:outline-none focus:border-[#1e3a8a] focus:ring-2 focus:ring-[#1e3a8a]/30 transition-all input-focus-animate focus:shadow-md resize-none hover:border-slate-300"
                value={formData.deskripsi}
                onChange={e => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
              />
            </div>

            {/* Foto */}
            <div className="animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <label className="block text-sm font-bold text-slate-700 mb-2">Bukti Foto</label>
              <div className="flex items-start justify-start w-full">
                  <label className="flex flex-col items-center justify-center w-full sm:w-72 h-44 border border-slate-200 border-dashed rounded-md cursor-pointer bg-[#f8fafc] hover:bg-slate-100 transition-all overflow-hidden relative group card-hover">
                      {preview ? (
                        <>
                          <img src={preview} alt="Preview" className="w-full h-full object-cover bg-slate-900/5 group-hover:opacity-50 transition-opacity duration-300" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="bg-slate-900/80 text-white px-4 py-2 rounded text-sm flex items-center gap-2 animate-scale-in">
                              <Upload size={14} /> Ganti Foto
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4 transition-all group-hover:scale-105">
                            <ImageIcon size={28} className="text-slate-400 mb-2 transition-colors group-hover:text-slate-600 group-hover:animate-bounce" />
                            <p className="mb-1 text-sm text-slate-500 font-medium transition-colors">Klik untuk upload foto</p>
                            <p className="text-xs text-slate-400 transition-colors">Format: JPG, PNG (Max 5MB)</p>
                        </div>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleFotoChange} />
                  </label>
              </div>
            </div>
          </div>


          {/* Buttons */}
          <div className="mt-10 flex items-center justify-end space-x-4 border-t border-slate-100 pt-6 animate-fade-in-up" style={{ animationDelay: '0.35s' }}>
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 border border-[#1e3a8a] text-[#1e3a8a] font-semibold rounded-md text-sm hover:bg-blue-50 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={loading || !!mapValidationMsg}
              className="px-6 py-2.5 bg-[#1e3a8a] hover:bg-[#172554] text-white font-semibold rounded-md text-sm transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center btn-hover-lift active:scale-95"
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

      {alertModal.open && (
        <AlertModal 
          isOpen={alertModal.open}
          title={alertModal.title}
          message={alertModal.message}
          type={alertModal.type}
          onClose={() => setAlertModal({ ...alertModal, open: false })}
        />
      )}
    </div>
  );
}
