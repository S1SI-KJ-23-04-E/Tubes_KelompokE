import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function FeedbackForm({ laporanId, onSubmitted }) {
  const { user, profile } = useAuth();
  const [rating, setRating] = useState(0);
  const [ulasan, setUlasan] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState(null);

  useEffect(() => {
    const loadFeedback = async () => {
      if (!laporanId) return;

      const { data, error } = await supabase
        .from('feedback')
        .select('*')
        .eq('laporan_id', laporanId)
        .maybeSingle();

      if (!error && data) {
        setExistingFeedback(data);
        setRating(data.rating || 0);
        setUlasan(data.ulasan || '');
      }
    };

    loadFeedback();
  }, [laporanId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return alert('Pilih rating 1-5');
    if (!user) return alert('Anda harus login untuk mengirim feedback.');
    if (profile?.role !== 'warga') return alert('Hanya warga yang dapat memberikan feedback.');

    setLoading(true);
    try {
      const payload = {
        laporan_id: laporanId,
        rating,
        ulasan,
        user_id: user.id
      };

      const { data: insertData, error } = await supabase
        .from('feedback')
        .upsert([payload], { onConflict: 'laporan_id' })
        .select('*');

      console.log('Feedback upsert result', { insertData, error, laporanId, rating, ulasan, userId: user.id });

      if (error) throw error;
      if (insertData?.length) {
        setExistingFeedback(insertData[0]);
      }
      onSubmitted();
    } catch (err) {
      console.error('Feedback submit failed', err);
      alert('Gagal mengirim feedback: ' + (err?.message || 'Terjadi kesalahan.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mt-8">
      <h4 className="font-bold text-gray-800 mb-2">Beri Penilaian</h4>
      <p className="text-sm text-gray-500 mb-4">Seberapa puas Anda dengan penyelesaian laporan ini?</p>
      {existingFeedback && (
        <div className="mb-4 rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3 text-sm text-indigo-700">
          Feedback sudah ada. Anda bisa mengubah rating atau ulasan, lalu klik "Perbarui Feedback".
        </div>
      )}
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
          {loading ? 'Mengirim...' : existingFeedback ? 'Perbarui Feedback' : 'Kirim Feedback'}
        </button>
      </form>
    </div>
  );
}