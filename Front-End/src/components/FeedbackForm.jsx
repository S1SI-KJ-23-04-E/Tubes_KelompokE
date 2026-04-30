import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Star, Send } from 'lucide-react';

export default function FeedbackForm({ laporanId, onSubmitted }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [ulasan, setUlasan] = useState('');
  const [loading, setLoading] = useState(false);
  const [hover, setHover] = useState(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert('Silakan pilih rating bintang.');
    if (!user) return alert('Anda harus login untuk mengirim feedback.');

    setLoading(true);
    try {
      const { error } = await supabase.from('feedback').insert([{
        laporan_id: laporanId,
        rating,
        ulasan,
        user_id: user.id
      }]);

      if (error) throw error;
      setRating(0);
      setUlasan('');
      onSubmitted();
    } catch (err) {
      console.error('Feedback insert failed', err);
      alert('Gagal mengirim feedback: ' + (err?.message || 'Terjadi kesalahan.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="font-black text-slate-900 text-lg mb-1">Beri Penilaian</h4>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bagaimana kualitas perbaikan kami?</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex items-center gap-3">
          {[1,2,3,4,5].map(star => (
            <button
              type="button"
              key={star}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
              className="transition-all duration-200 transform hover:scale-125 focus:outline-none"
            >
              <Star 
                size={32} 
                className={`transition-colors duration-200 ${
                  (hover || rating) >= star 
                    ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]' 
                    : 'text-slate-200 fill-slate-100'
                }`} 
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-xs font-black text-amber-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 animate-pulse">
              {rating}/5 BINTANG
            </span>
          )}
        </div>

        <div className="relative group">
          <textarea 
            required
            placeholder="Bagikan pengalaman Anda tentang proses perbaikan ini..."
            className="w-full bg-white border-2 border-slate-100 rounded-3xl p-6 text-sm font-medium focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 outline-none transition-all shadow-sm group-hover:border-slate-200"
            rows="4"
            value={ulasan}
            onChange={e => setUlasan(e.target.value)}
          />
          <div className="absolute top-4 right-4 text-slate-200 group-focus-within:text-indigo-200 transition-colors">
            <Send size={20} />
          </div>
        </div>

        <button 
          disabled={loading || rating === 0}
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-10 py-4 rounded-2xl text-xs uppercase tracking-widest disabled:opacity-30 disabled:grayscale transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-3 w-full sm:w-auto"
        >
          {loading ? 'MENGIRIM...' : 'KIRIM FEEDBACK'}
          {!loading && <Send size={16} />}
        </button>
      </form>
    </div>
  );
}

