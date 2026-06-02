import { useState } from "react";
import { updateProfile } from "../services/pProfileService";
import { AlertModal } from '../components/Modals';

export default function ProfilePage() {
  const [nama, setNama] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertModal, setAlertModal] = useState({ open: false, title: '', message: '', type: 'error' });

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    const res = await updateProfile(nama);

    if (res.success) {
      setAlertModal({ open: true, title: 'Sukses', message: 'Profil berhasil diperbarui', type: 'success' });
    } else {
      setAlertModal({ open: true, title: 'Gagal', message: res.error, type: 'error' });
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-6 rounded-xl shadow">
      <h1 className="text-xl font-bold mb-4">Edit Profil</h1>

      <form onSubmit={handleSubmit}>
        <label className="block text-sm mb-1">Nama</label>
        <input
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          className="w-full border p-2 rounded mb-4"
          placeholder="Masukkan nama"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          {loading ? "Menyimpan..." : "Simpan"}
        </button>
      </form>

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