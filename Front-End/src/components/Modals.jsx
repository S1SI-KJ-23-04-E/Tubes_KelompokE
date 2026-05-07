import React, { useState } from 'react';
import { MessageSquare, Clock, Trash2, XCircle, Info, CheckCircle2 } from 'lucide-react';

export function CatatanModal({ isOpen, isViewOnly, initialCatatan, onClose, onSubmit }) {
  const [value, setValue] = useState(initialCatatan || '');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(value);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-slide-in-up">
        <div className="bg-indigo-50 border-b border-indigo-100 px-8 py-5 flex items-center gap-3">
          <MessageSquare size={20} className="text-indigo-600" />
          <h3 className="font-black text-slate-800">{isViewOnly ? 'Catatan Tambahan dari Admin' : 'Tulis Catatan Tambahan'}</h3>
        </div>
        
        <div className="p-8">
          {isViewOnly ? (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-5">
              <p className="text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{value}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Pesan / Instruksi untuk Petugas</label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm py-3 px-4 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all min-h-[120px]"
                  placeholder="Contoh: Tolong segera ditangani ya, prioritaskan bagian jalannya."
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={onClose} disabled={loading} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all">
                  Batal
                </button>
                <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-200 flex justify-center items-center gap-2">
                  {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Simpan Catatan'}
                </button>
              </div>
            </form>
          )}
          {isViewOnly && (
            <div className="mt-6 flex justify-end">
              <button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-200">
                Tutup
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function StatusUpdateModal({ isOpen, statusLabel, onClose, onSubmit }) {
  const [ket, setKet] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(ket);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden animate-slide-in-up">
        <div className="bg-blue-50 border-b border-blue-100 px-8 py-5 flex items-center gap-3">
          <Clock size={20} className="text-blue-600" />
          <h3 className="font-black text-slate-800">Update Status: {statusLabel}</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Catatan Perubahan (Opsional)</label>
            <textarea
              className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm py-3 px-4 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all min-h-[100px]"
              placeholder="Berikan alasan atau detail tambahan..."
              value={ket}
              onChange={(e) => setKet(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all">Batal</button>
            <button type="submit" disabled={loading} className="flex-1 bg-blue-600 text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-blue-200">
              {loading ? 'Memproses...' : 'Update Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteConfirmModal({ isOpen, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden animate-slide-in-up">
        <div className="p-8 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 size={32} />
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">Hapus Laporan?</h3>
          <p className="text-slate-500 text-sm mb-8">Tindakan ini tidak dapat dibatalkan. Laporan akan dihapus permanen.</p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all">Batal</button>
            <button onClick={handleConfirm} disabled={loading} className="flex-1 bg-red-600 text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-red-200">
              {loading ? 'Menghapus...' : 'Ya, Hapus'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AlertModal({ isOpen, title, message, type, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden animate-slide-in-up">
        <div className={`p-8 text-center ${type === 'error' ? 'bg-red-50/50' : 'bg-blue-50/50'}`}>
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${type === 'error' ? 'bg-red-100 text-red-500' : 'bg-blue-100 text-blue-500'}`}>
            {type === 'error' ? <XCircle size={32} /> : <Info size={32} />}
          </div>
          <h3 className="text-xl font-black text-slate-800 mb-2">{title}</h3>
          <p className="text-slate-500 text-sm mb-8">{message}</p>
          <button onClick={onClose} className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all text-white shadow-lg ${type === 'error' ? 'bg-red-600 shadow-red-200' : 'bg-blue-600 shadow-blue-200'}`}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
