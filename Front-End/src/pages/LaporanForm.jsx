import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getKecamatan, getKelurahan, createLaporan, uploadFoto } from '../services/laporanService';
import {
  ArrowLeft, Upload, MapPin, AlertCircle, FileText,
  MapPinned, Camera, CheckCircle2, ChevronRight, Info, X,
} from 'lucide-react';
import Select from 'react-select';
import { AlertModal } from '../components/Modals';

import L from 'leaflet';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import iconUrl        from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl  from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl      from 'leaflet/dist/images/marker-shadow.png';

L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

/* ─────────────────────────────────────────
   CONSTANTS
───────────────────────────────────────── */
const STEPS = [
  { id: 1, label: 'Info Laporan',  icon: FileText  },
  { id: 2, label: 'Lokasi',        icon: MapPinned },
  { id: 3, label: 'Foto & Detail', icon: Camera    },
];

/* ─────────────────────────────────────────
   STEP INDICATOR
───────────────────────────────────────── */
function StepIndicator({ current }) {
  return (
    <div className="flex items-center w-full mb-10">
      {STEPS.map((step, i) => {
        const Icon   = step.icon;
        const done   = current > step.id;
        const active = current === step.id;

        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            {/* circle + label */}
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 ${
                done   ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200' :
                active ? 'bg-white border-indigo-600 text-indigo-600 shadow-lg ring-4 ring-indigo-50' :
                         'bg-slate-50 border-slate-200 text-slate-300'
              }`}>
                {done ? <CheckCircle2 size={18} /> : <Icon size={16} />}
              </div>
              <span className={`text-[9px] font-black uppercase tracking-wider hidden sm:block ${
                active ? 'text-indigo-600' : done ? 'text-slate-500' : 'text-slate-300'
              }`}>
                {step.label}
              </span>
            </div>

            {/* connector line */}
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 rounded-full transition-all duration-500 ${
                done ? 'bg-indigo-500' : 'bg-slate-100'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────
   FIELD WRAPPER
───────────────────────────────────────── */
function Field({ label, required, children, hint, error, icon: Icon }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
        {Icon && <Icon size={10} className="text-slate-400" />}
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>

      {children}

      {hint && !error && (
        <p className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
          <Info size={9} /> {hint}
        </p>
      )}
      {error && (
        <p className="flex items-center gap-1.5 text-[11px] text-red-500 font-semibold">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   TEXT INPUT
───────────────────────────────────────── */
function TextInput({ icon: Icon, focused, ...props }) {
  return (
    <div className={`relative flex items-center rounded-2xl border-2 transition-all duration-200 ${
      focused
        ? 'border-indigo-500 bg-indigo-50/30 shadow-[0_0_0_4px_rgba(99,102,241,0.08)]'
        : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
    }`}>
      {Icon && (
        <div className={`absolute left-4 pointer-events-none transition-colors ${
          focused ? 'text-indigo-500' : 'text-slate-400'
        }`}>
          <Icon size={15} />
        </div>
      )}
      <input
        {...props}
        className={`w-full py-3.5 bg-transparent text-sm font-semibold text-slate-800 placeholder-slate-300 outline-none rounded-2xl ${
          Icon ? 'pl-11 pr-4' : 'px-4'
        }`}
      />
    </div>
  );
}

/* ─────────────────────────────────────────
   SELECT STYLES (react-select)
───────────────────────────────────────── */
const selectStyles = {
  control: (base, state) => ({
    ...base,
    border:          state.isFocused ? '2px solid #6366f1' : '2px solid #e2e8f0',
    borderRadius:    '1rem',
    padding:         '6px 4px',
    backgroundColor: state.isFocused ? 'rgba(238,242,255,0.3)' : 'rgba(248,250,252,0.5)',
    boxShadow:       state.isFocused ? '0 0 0 4px rgba(99,102,241,0.08)' : 'none',
    transition:      'all 0.2s',
    '&:hover': { borderColor: state.isFocused ? '#6366f1' : '#cbd5e1' },
  }),
  placeholder:        (base) => ({ ...base, color: '#cbd5e1', fontWeight: 500, fontSize: '0.875rem' }),
  singleValue:        (base) => ({ ...base, color: '#1e293b', fontWeight: 600, fontSize: '0.875rem' }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? '#6366f1' : state.isFocused ? '#eef2ff' : 'white',
    color:           state.isSelected ? 'white' : '#1e293b',
    fontWeight: 500, fontSize: '0.875rem',
    borderRadius: '0.5rem', margin: '2px 4px', width: 'calc(100% - 8px)',
  }),
  menu:               (base) => ({ ...base, borderRadius: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 10px 40px rgba(0,0,0,0.08)', overflow: 'hidden', padding: '4px' }),
  indicatorSeparator: ()     => ({ display: 'none' }),
  dropdownIndicator:  (base) => ({ ...base, color: '#94a3b8', '&:hover': { color: '#6366f1' } }),
  clearIndicator:     (base) => ({ ...base, color: '#94a3b8', '&:hover': { color: '#ef4444' } }),
};

/* ─────────────────────────────────────────
   CHAR COUNTER
───────────────────────────────────────── */
function CharCounter({ value, max }) {
  const pct  = (value.length / max) * 100;
  const over = value.length > max * 0.9;

  return (
    <div className="flex items-center justify-end gap-2 mt-1">
      <div className="flex-1 h-0.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${over ? 'bg-amber-400' : 'bg-indigo-400'}`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className={`text-[10px] font-bold ${over ? 'text-amber-500' : 'text-slate-400'}`}>
        {value.length}/{max}
      </span>
    </div>
  );
}

/* ═════════════════════════════════════════
   MAIN COMPONENT
═════════════════════════════════════════ */
export default function LaporanForm() {
  const navigate = useNavigate();

  /* ── data state ── */
  const [kecamatans, setKecamatans] = useState([]);
  const [kelurahans, setKelurahans] = useState([]);
  const [formData,   setFormData]   = useState({
    judul:        '',
    kecamatan_id: '',
    kelurahan_id: '',
    deskripsi:    '',
    alamat:       '',
  });
  const [foto,    setFoto]    = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);

  /* ── geo state ── */
  const [geoLocation, setGeoLocation] = useState({ latitude: -6.914744, longitude: 107.609810 });
  const [geoStatus,   setGeoStatus]   = useState('detecting'); // 'detecting' | 'success' | 'denied' | 'unavailable'

  /* ── validation state ── */
  const [mapValidationMsg, setMapValidationMsg] = useState('');
  const [validatingMap,    setValidatingMap]    = useState(false);
  const [alertModal,       setAlertModal]       = useState({ open: false, title: '', message: '', type: 'error' });

  /* ── UI state ── */
  const [currentStep, setCurrentStep] = useState(1);
  const [focused,     setFocused]     = useState('');
  const [touched,     setTouched]     = useState({});
  const [dragOver,    setDragOver]    = useState(false);

  /* ── Geolocation on mount ── */
  useEffect(() => {
    if (!navigator.geolocation) { setGeoStatus('unavailable'); return; }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        setGeoStatus('success');
      },
      (err) => {
        console.warn('Geolocation error:', err.message);
        setGeoStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  /* ── Fetch kecamatan on mount ── */
  useEffect(() => {
    getKecamatan().then((data) =>
      setKecamatans(data.map((k) => ({ value: k.id, label: k.nama_kecamatan })))
    );
  }, []);

  /* ── Re-validate location when kelurahan changes ── */
  useEffect(() => {
    const sel = kelurahans.find((k) => k.value === formData.kelurahan_id);
    if (sel && geoStatus === 'success') {
      validateLocation(geoLocation.latitude, geoLocation.longitude, sel.label);
    } else {
      setMapValidationMsg('');
    }
  }, [formData.kelurahan_id, kelurahans]);

  /* ── Map validation via Nominatim reverse geocoding ── */
  const validateLocation = async (lat, lng, kelurahanName) => {
    if (!kelurahanName) { setMapValidationMsg(''); return; }
    setValidatingMap(true);
    try {
      const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
      const data = await res.json();
      const addr = data.address || {};
      const mapKel = (addr.village || addr.suburb || addr.neighbourhood || '').toLowerCase();

      if (mapKel && !mapKel.includes(kelurahanName.toLowerCase()) && !kelurahanName.toLowerCase().includes(mapKel)) {
        setMapValidationMsg(`Titik peta berada di "${mapKel}", tidak sesuai dengan kelurahan "${kelurahanName}". Geser pin ke lokasi yang benar.`);
      } else {
        setMapValidationMsg('');
      }
    } catch {
      setMapValidationMsg('');
    }
    setValidatingMap(false);
  };

  /* ── Map sub-components (defined inside to access state closures) ── */
  function MapCenterUpdater({ center }) {
    const map = useMapEvents({});
    useEffect(() => { if (center[0] !== null) map.flyTo(center, 15); }, [center, map]);
    return null;
  }

  function DraggableMarker() {
    useMapEvents({ click() {} });
    return (
      <Marker
        draggable
        eventHandlers={{
          dragend: (e) => {
            const { lat, lng } = e.target.getLatLng();
            setGeoLocation({ latitude: lat, longitude: lng });
            const sel = kelurahans.find((k) => k.value === formData.kelurahan_id);
            if (sel) validateLocation(lat, lng, sel.label);
          },
        }}
        position={[geoLocation.latitude, geoLocation.longitude]}
      />
    );
  }

  /* ── Kecamatan change: fetch kelurahan list ── */
  const handleKecamatanChange = async (opt) => {
    const id = opt ? opt.value : '';
    setFormData((prev) => ({ ...prev, kecamatan_id: id, kelurahan_id: '' }));
    if (id) {
      const data = await getKelurahan(id);
      setKelurahans(data.map((k) => ({ value: k.id, label: k.nama_kelurahan })));
    } else {
      setKelurahans([]);
    }
  };

  /* ── Kelurahan change: geocode to center map ── */
  const handleKelurahanChange = async (opt) => {
    const id = opt ? opt.value : '';
    setFormData((prev) => ({ ...prev, kelurahan_id: id }));
    if (!opt) return;

    try {
      const kec   = kecamatans.find((k) => k.value === formData.kecamatan_id);
      const query = `${opt.label}, ${kec?.label || ''}, Indonesia`;
      const res   = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`);
      const data  = await res.json();
      if (data?.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        setGeoLocation({ latitude: lat, longitude: lng });
        validateLocation(lat, lng, opt.label);
        setGeoStatus('success');
      }
    } catch (err) {
      console.warn('Geocoding search error:', err);
    }
  };

  /* ── Photo handlers ── */
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) { setFoto(file); setPreview(URL.createObjectURL(file)); }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setFoto(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveFoto = () => { setFoto(null); setPreview(''); };

  /* ── Form submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.kecamatan_id || !formData.kelurahan_id) {
      setAlertModal({ open: true, title: 'Data Tidak Lengkap', message: 'Harap pilih Kecamatan dan Kelurahan.', type: 'error' });
      return;
    }
    setLoading(true);
    let foto_url = null;
    if (foto) foto_url = await uploadFoto(foto);

    const { success, error } = await createLaporan({
      ...formData,
      foto_url,
      latitude:  geoLocation.latitude,
      longitude: geoLocation.longitude,
    });
    setLoading(false);

    if (success) {
      navigate('/laporan?tab=history');
    } else {
      setAlertModal({ open: true, title: 'Gagal', message: `Gagal membuat laporan: ${error}`, type: 'error' });
    }
  };

  /* ── Helpers ── */
  const customFilter = (option, inputValue) =>
    option.label.toLowerCase().startsWith(inputValue.toLowerCase());

  /* ── Step validation ── */
  const step1Valid = formData.judul.trim().length >= 5 && !!formData.alamat.trim();
  const step2Valid = !!formData.kecamatan_id && !!formData.kelurahan_id && !mapValidationMsg;
  const step3Valid = formData.deskripsi.trim().length >= 20;

  const canNext =
    currentStep === 1 ? step1Valid :
    currentStep === 2 ? step2Valid :
    step3Valid;

  const goNext = () => {
    setTouched((t) => ({ ...t, [`step${currentStep}`]: true }));
    if (currentStep < 3) setCurrentStep((c) => c + 1);
  };

  const goPrev = () => {
    if (currentStep > 1) setCurrentStep((c) => c - 1);
  };

  /* ════════════════════════════════════════
     RENDER
  ════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-[#F4F6FB]">

      {/* ── TOPBAR ── */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-xs uppercase tracking-widest transition-all group"
          >
            <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Kembali</span>
          </button>

          <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
            Buat Laporan Baru
          </span>

          {/* overall progress */}
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400">
            <span>{currentStep}/3</span>
            <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
              <div
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep - 1) / 2) * 100 + (canNext ? 16 : 0)}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-8">

        {/* ── HERO ── */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <FileText size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">Laporan Kerusakan</h1>
              <p className="text-slate-400 text-xs font-medium mt-1">Infrastruktur · Jalan · Fasilitas Umum</p>
            </div>
          </div>
          <p className="text-slate-500 text-sm font-medium mt-4 leading-relaxed">
            Lengkapi formulir ini agar laporan dapat segera diproses oleh tim kecamatan.{' '}
            Field bertanda <span className="text-red-400 font-bold">*</span> wajib diisi.
          </p>
        </div>

        {/* ── STEP INDICATOR ── */}
        <StepIndicator current={currentStep} />

        {/* ── FORM CARD ── */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-200/50 overflow-hidden">

            {/* step header */}
            <div className="px-8 py-5 border-b border-slate-50 bg-slate-50/30">
              {(() => {
                const step = STEPS[currentStep - 1];
                const Icon = step.icon;
                return (
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
                      <Icon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{step.label}</p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">
                        Langkah {currentStep} dari 3
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* ── form fields ── */}
            <div className="px-8 py-8 space-y-6">

              {/* ════════ STEP 1: Info Laporan ════════ */}
              {currentStep === 1 && (
                <>
                  <Field
                    label="Judul Laporan" required icon={FileText}
                    hint="Singkat dan jelas, min. 5 karakter"
                    error={
                      touched.step1 && formData.judul && formData.judul.trim().length < 5
                        ? 'Judul minimal 5 karakter' : ''
                    }
                  >
                    <TextInput
                      icon={FileText}
                      type="text"
                      required
                      minLength={5}
                      maxLength={100}
                      placeholder="Cth: Jalan Berlubang di Depan Sekolah"
                      value={formData.judul}
                      focused={focused === 'judul'}
                      onFocus={() => setFocused('judul')}
                      onBlur={() => setFocused('')}
                      onChange={(e) => setFormData((prev) => ({ ...prev, judul: e.target.value }))}
                    />
                    <CharCounter value={formData.judul} max={100} />
                  </Field>

                  <Field
                    label="Alamat Lokasi" required icon={MapPin}
                    hint="Nama jalan, nomor, atau patokan terdekat"
                  >
                    <TextInput
                      icon={MapPin}
                      type="text"
                      required
                      placeholder="Cth: Jl. Sudirman No. 123, dekat Alfamart"
                      value={formData.alamat}
                      focused={focused === 'alamat'}
                      onFocus={() => setFocused('alamat')}
                      onBlur={() => setFocused('')}
                      onChange={(e) => setFormData((prev) => ({ ...prev, alamat: e.target.value }))}
                    />
                  </Field>

                  <div className="flex items-start gap-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl px-4 py-3.5">
                    <Info size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-indigo-700/70 font-medium leading-relaxed">
                      Judul dan alamat yang jelas akan mempercepat verifikasi oleh tim kecamatan.
                    </p>
                  </div>
                </>
              )}

              {/* ════════ STEP 2: Lokasi ════════ */}
              {currentStep === 2 && (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Kecamatan" required icon={MapPin}>
                      <Select
                        options={kecamatans}
                        placeholder="Pilih kecamatan..."
                        isClearable
                        isSearchable
                        filterOption={customFilter}
                        styles={selectStyles}
                        onChange={handleKecamatanChange}
                        value={kecamatans.find((k) => k.value === formData.kecamatan_id) || null}
                        noOptionsMessage={() => 'Tidak ditemukan'}
                      />
                    </Field>

                    <Field
                      label="Kelurahan" required icon={MapPin}
                      hint={!formData.kecamatan_id ? 'Pilih kecamatan terlebih dahulu' : ''}
                    >
                      <Select
                        options={kelurahans}
                        placeholder={formData.kecamatan_id ? 'Pilih kelurahan...' : 'Pilih kecamatan dulu'}
                        isDisabled={!formData.kecamatan_id}
                        isClearable
                        isSearchable
                        filterOption={customFilter}
                        styles={selectStyles}
                        onChange={handleKelurahanChange}
                        value={kelurahans.find((k) => k.value === formData.kelurahan_id) || null}
                        noOptionsMessage={() => 'Tidak ditemukan'}
                      />
                    </Field>
                  </div>

                  <Field
                    label="Titik Lokasi Peta" icon={MapPinned}
                    hint="Geser pin merah untuk menyesuaikan lokasi tepat kerusakan"
                  >
                    {/* map container */}
                    <div
                      className={`rounded-2xl overflow-hidden border-2 relative z-0 transition-all duration-200 ${
                        mapValidationMsg ? 'border-red-300' : 'border-slate-200'
                      }`}
                      style={{ height: '280px' }}
                    >
                      {/* detecting overlay */}
                      {geoStatus === 'detecting' && (
                        <div className="absolute inset-0 bg-slate-50 z-20 flex flex-col items-center justify-center gap-3">
                          <div className="relative w-12 h-12">
                            <div className="absolute inset-0 border-[3px] border-slate-200 rounded-full" />
                            <div className="absolute inset-0 border-[3px] border-indigo-500 rounded-full border-t-transparent animate-spin" />
                          </div>
                          <p className="text-sm font-semibold text-slate-500">Mendeteksi lokasi…</p>
                        </div>
                      )}

                      {geoLocation.latitude !== null && (
                        <MapContainer
                          center={[geoLocation.latitude, geoLocation.longitude]}
                          zoom={15}
                          scrollWheelZoom
                          style={{ height: '100%', width: '100%' }}
                        >
                          <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          />
                          <MapCenterUpdater center={[geoLocation.latitude, geoLocation.longitude]} />
                          <DraggableMarker />
                        </MapContainer>
                      )}

                      {/* validating overlay */}
                      {validatingMap && (
                        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md border border-slate-100 flex items-center gap-2">
                          <span className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Memvalidasi lokasi…</span>
                        </div>
                      )}
                    </div>

                    {/* GPS denied warning */}
                    {geoStatus === 'denied' && (
                      <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mt-2">
                        <AlertCircle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-amber-700 font-semibold leading-snug">
                          Akses GPS ditolak. Geser pin secara manual ke lokasi kerusakan.
                        </p>
                      </div>
                    )}

                    {/* map mismatch warning */}
                    {mapValidationMsg && (
                      <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mt-2">
                        <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-red-700 font-semibold leading-snug">{mapValidationMsg}</p>
                      </div>
                    )}
                  </Field>

                  {/* coordinates display */}
                  {geoStatus !== 'detecting' && (
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Latitude',  value: geoLocation.latitude.toFixed(6)  },
                        { label: 'Longitude', value: geoLocation.longitude.toFixed(6) },
                      ].map(({ label, value }) => (
                        <div key={label} className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                          <p className="text-xs font-black text-slate-600 mt-0.5 font-mono">{value}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* ════════ STEP 3: Foto & Detail ════════ */}
              {currentStep === 3 && (
                <>
                  {/* foto upload with drag-drop */}
                  <Field
                    label="Foto Bukti" icon={Camera}
                    hint="JPG, PNG, maks. 5MB. Foto yang jelas mempercepat verifikasi"
                  >
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={handleDrop}
                      className={`relative rounded-2xl border-2 border-dashed overflow-hidden transition-all duration-200 ${
                        dragOver ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]' :
                        preview  ? 'border-emerald-300 bg-emerald-50/20' :
                                   'border-slate-200 bg-slate-50/50 hover:border-indigo-300 hover:bg-indigo-50/20'
                      }`}
                      style={{ minHeight: '200px' }}
                    >
                      {preview ? (
                        /* preview with hover overlay */
                        <div className="relative group" style={{ minHeight: '200px' }}>
                          <img
                            src={preview}
                            alt="Preview"
                            className="w-full object-cover rounded-2xl"
                            style={{ maxHeight: '280px' }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 rounded-2xl flex items-center justify-center gap-3">
                            <label className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-2 bg-white text-slate-800 px-4 py-2 rounded-xl text-xs font-bold shadow-lg">
                              <Upload size={13} /> Ganti Foto
                              <input type="file" className="hidden" accept="image/*" onChange={handleFotoChange} />
                            </label>
                            <button
                              type="button"
                              onClick={handleRemoveFoto}
                              className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg"
                            >
                              <X size={13} /> Hapus
                            </button>
                          </div>
                          <div className="absolute top-3 left-3 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-md">
                            <CheckCircle2 size={10} /> Foto Dipilih
                          </div>
                        </div>
                      ) : (
                        /* empty upload area */
                        <label className="flex flex-col items-center justify-center gap-3 cursor-pointer p-10">
                          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                            dragOver ? 'bg-indigo-100 text-indigo-600 scale-110' : 'bg-slate-100 text-slate-400'
                          }`}>
                            <Camera size={28} />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-bold text-slate-600">
                              {dragOver ? 'Lepaskan untuk upload' : 'Klik atau drag foto ke sini'}
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium mt-1">Format: JPG, PNG · Maks. 5MB</p>
                          </div>
                          <input type="file" className="hidden" accept="image/*" onChange={handleFotoChange} />
                        </label>
                      )}
                    </div>
                  </Field>

                  {/* deskripsi */}
                  <Field
                    label="Deskripsi Kerusakan" required icon={FileText}
                    hint="Jelaskan secara detail: jenis, ukuran, bahaya, min. 20 karakter"
                    error={
                      touched.step3 && formData.deskripsi && formData.deskripsi.trim().length < 20
                        ? 'Deskripsi minimal 20 karakter' : ''
                    }
                  >
                    <div className={`relative rounded-2xl border-2 transition-all duration-200 ${
                      focused === 'deskripsi'
                        ? 'border-indigo-500 bg-indigo-50/30 shadow-[0_0_0_4px_rgba(99,102,241,0.08)]'
                        : 'border-slate-200 bg-slate-50/50 hover:border-slate-300'
                    }`}>
                      <textarea
                        required
                        minLength={20}
                        maxLength={500}
                        rows={5}
                        placeholder="Jelaskan kondisi kerusakan secara detail. Contoh: Terdapat lubang berdiameter ±1 meter sedalam 30cm di lajur kiri, berbahaya untuk pengendara motor terutama malam hari..."
                        className="w-full px-4 py-3.5 bg-transparent text-sm font-medium text-slate-800 placeholder-slate-300 outline-none rounded-2xl resize-none leading-relaxed"
                        value={formData.deskripsi}
                        onFocus={() => setFocused('deskripsi')}
                        onBlur={() => setFocused('')}
                        onChange={(e) => setFormData((prev) => ({ ...prev, deskripsi: e.target.value }))}
                      />
                    </div>
                    <CharCounter value={formData.deskripsi} max={500} />
                  </Field>

                  {/* summary card */}
                  {formData.judul && formData.alamat && formData.kecamatan_id && (
                    <div className="bg-slate-50/80 border border-slate-100 rounded-2xl p-5">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                        Ringkasan Laporan
                      </p>
                      <div className="space-y-3">
                        {[
                          { label: 'Judul',     value: formData.judul },
                          { label: 'Alamat',    value: formData.alamat },
                          { label: 'Kecamatan', value: kecamatans.find((k) => k.value === formData.kecamatan_id)?.label },
                          { label: 'Kelurahan', value: kelurahans.find((k) => k.value === formData.kelurahan_id)?.label },
                        ]
                          .filter((r) => r.value)
                          .map(({ label, value }) => (
                            <div key={label} className="flex items-start gap-3">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest w-20 shrink-0 pt-0.5">
                                {label}
                              </span>
                              <span className="text-xs font-semibold text-slate-700 leading-snug">{value}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── NAVIGATION FOOTER ── */}
            <div className="px-8 py-5 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between gap-4">
              {/* back button */}
              <button
                type="button"
                onClick={goPrev}
                disabled={currentStep === 1}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-widest border-2 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={13} /> Sebelumnya
              </button>

              {/* dot progress */}
              <div className="flex items-center gap-1.5">
                {STEPS.map((s) => (
                  <div
                    key={s.id}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      s.id === currentStep ? 'w-6 bg-indigo-600' :
                      s.id < currentStep  ? 'w-3 bg-indigo-300' : 'w-3 bg-slate-200'
                    }`}
                  />
                ))}
              </div>

              {/* next / submit */}
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canNext}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-indigo-600 hover:bg-[#172554] text-white shadow-lg shadow-indigo-200/60 transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  Lanjutkan <ChevronRight size={13} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !!mapValidationMsg || !step3Valid}
                  className="flex items-center gap-2 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200/60 transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Mengirim…
                    </>
                  ) : (
                    <><CheckCircle2 size={14} /> Kirim Laporan</>
                  )}
                </button>
              )}
            </div>

          </div>
        </form>
      </main>

      {/* ── ALERT MODAL ── */}
      {alertModal.open && (
        <AlertModal
          isOpen={alertModal.open}
          title={alertModal.title}
          message={alertModal.message}
          type={alertModal.type}
          onClose={() => setAlertModal((prev) => ({ ...prev, open: false }))}
        />
      )}
    </div>
  );
}