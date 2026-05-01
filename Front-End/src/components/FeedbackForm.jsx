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
    <div className="bg-gradient-to-br from-slate-50 to-indigo-50 p-6 rounded-2xl border border-slate-200 mt-8 animate-fade-in-up shadow-sm hover:shadow-md transition-shadow duration-300 card-hover">
      <h4 className="font-bold text-gray-800 mb-2 transition-colors">Beri Penilaian</h4>
      <p className="text-sm text-gray-500 mb-4 transition-colors">Seberapa puas Anda dengan penyelesaian laporan ini?</p>
      
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-2 mb-4">
          {[1,2,3,4,5].map((star, idx) => (
            <button
              type="button"
              key={star}
              onClick={() => setRating(star)}
              className={`text-3xl transition-all duration-300 hover:scale-125 animate-fade-in ${rating >= star ? 'text-yellow-400 drop-shadow-sm animate-bounce-in' : 'text-gray-300 hover:text-yellow-200'}`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              ★
            </button>
          ))}
        </div>
        <textarea 
          required
          placeholder="Tulis ulasan pengalaman Anda..."
          className="w-full border-0 ring-1 ring-slate-200 rounded-xl p-4 text-sm mb-4 bg-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm input-focus-animate hover:ring-slate-300"
          rows="3"
          value={ulasan}
          onChange={e => setUlasan(e.target.value)}
        />
        <button 
          disabled={loading}
          type="submit"
          className="bg-indigo-600 text-white font-semibold px-6 py-3 rounded-xl text-sm disabled:opacity-50 hover:bg-indigo-700 transition-all duration-300 w-full sm:w-auto shadow-md shadow-indigo-200 btn-hover-lift active:scale-95 flex items-center justify-center"
        >
          {loading ? (
            <>
              <svg className="h-4 w-4 mr-2 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Mengirim...
            </>
          ) : 'Kirim Feedback'}
        </button>
      </form>
    </div>
  );
}

//ayam