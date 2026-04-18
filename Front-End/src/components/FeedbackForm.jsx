import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function FeedbackForm({ laporanId, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [ulasan, setUlasan] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert('Pilih rating 1-5');

    setLoading(true);
    try {
      const { error } = await supabase.from('feedback').insert([{
        laporan_id: laporanId,
        rating,
        ulasan,
        user_id: '00000000-0000-0000-0000-000000000000' // Mock user
      }]);
      if (error) throw error;
      onSubmitted();
    } catch (err) {
      alert('Gagal mengirim feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-8">
      <h4 className="font-bold text-gray-800 mb-2">Beri Penilaian</h4>
      <p className="text-sm text-gray-500 mb-4">Seberapa puas Anda dengan penyelesaian laporan ini?</p>
      
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-2 mb-4">
          {[1,2,3,4,5].map(star => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              className={`text-3xl transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-300 hover:text-yellow-200'}`}
            >
              ★
            </button>
          ))}
        </div>
        <textarea 
          required
          placeholder="Tulis ulasan pengalaman Anda..."
          className="w-full border-0 ring-1 ring-slate-200 rounded-xl p-4 text-sm mb-4 bg-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm"
          rows="3"
          value={ulasan}
          onChange={e => setUlasan(e.target.value)}
        />
        <button 
          disabled={loading}
          type="submit"
          className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl text-sm disabled:opacity-50 hover:bg-indigo-700 transition-colors w-full sm:w-auto shadow-md shadow-indigo-200"
        >
          {loading ? 'Mengirim...' : 'Kirim Feedback'}
        </button>
      </form>
    </div>
  );
}
