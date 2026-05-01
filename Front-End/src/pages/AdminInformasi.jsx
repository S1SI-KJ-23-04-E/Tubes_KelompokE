import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { tambahInformasi } from "../services/laporanService";

export default function AdminInformasi() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [catatan, setCatatan] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!catatan) {
      alert("Informasi wajib diisi");
      return;
    }

    const res = await tambahInformasi(id, catatan);

    if (res.success) {
      alert("Berhasil ditambahkan");
      navigate("/admin");
    } else {
      alert("Gagal");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <h1 className="text-lg font-bold mb-4">Tambah Informasi</h1>

      <form onSubmit={handleSubmit}>
        <textarea
          value={catatan}
          onChange={(e) => setCatatan(e.target.value)}
          placeholder="Masukkan instruksi untuk petugas..."
          className="w-full border p-3 mb-4 rounded"
        />

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Simpan Informasi
        </button>
      </form>
    </div>
  );
}