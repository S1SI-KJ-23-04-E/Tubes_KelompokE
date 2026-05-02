import { useState } from 'react';
import { AlertTriangle, FileText, Send, X } from 'lucide-react';

export default function KendalaForm({ onSubmit, onCancel, loading }) {
  const [deskripsi, setDeskripsi] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!deskripsi.trim()) return;
    onSubmit(deskripsi);
  };

  return (
    <div className="bg-amber-50 rounded-[2rem] shadow-xl shadow-amber-900/10 border border-amber-100 p-10 overflow-hidden relative animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Background Watermark Icon */}
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <AlertTriangle size={120} />
      </div>

      <div className="relative z-10">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-200">
              <FileText size={22} />
            </div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Laporan Kendala</h2>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-[1.5rem] p-8 border border-amber-200/50 relative group focus-within:border-amber-400 focus-within:bg-white transition-all shadow-inner">
            <div className="absolute -top-3 left-8 bg-amber-500 text-white text-[8px] font-black px-2 py-1 rounded uppercase tracking-tighter shadow-sm">
              Laporan Petugas
            </div>
            
            <textarea
              required
              autoFocus
              placeholder="Jelaskan kendala teknis atau lapangan yang menghambat proses perbaikan..."
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full bg-transparent border-none focus:ring-0 text-slate-700 leading-loose text-[16px] font-medium italic placeholder:text-slate-300 resize-none min-h-[120px]"
            />
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={loading || !deskripsi.trim()}
              className="flex-1 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white py-4 rounded-2xl text-[11px] font-black shadow-lg shadow-amber-200 transition-all active:scale-95 uppercase tracking-widest flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <Send size={14} />
                  Kirim Laporan Kendala
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={onCancel}
              className="px-8 py-4 rounded-2xl text-[11px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
