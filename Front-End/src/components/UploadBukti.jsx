import { useState } from "react";
import { uploadBuktiURL } from "../services/laporanService";

export default function UploadBuktiModal({ laporanId, onClose, onSuccess }) {
  const [fotoUrl, setFotoUrl] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!fotoUrl) {
      alert("URL foto wajib diisi");
      return;
    }

    setLoading(true);

    const res = await uploadBuktiURL(laporanId, fotoUrl, keterangan);

    if (res.success) {
      alert("Berhasil upload bukti");
      onSuccess && onSuccess();
      onClose();
    } else {
      alert("Gagal upload");
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md">
        
        <h2 className="text-lg font-bold mb-4">
          Upload Bukti Penyelesaian
        </h2>

        {/* INPUT URL */}
        <input
          type="text"
          placeholder="Masukkan URL Foto"
          value={fotoUrl}
          onChange={(e) => setFotoUrl(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        {/* PREVIEW */}
        {fotoUrl && (
          <img
            src={fotoUrl}
            alt="preview"
            className="w-full h-40 object-cover rounded mb-3"
          />
        )}

        {/* KETERANGAN */}
        <textarea
          placeholder="Keterangan..."
          value={keterangan}
          onChange={(e) => setKeterangan(e.target.value)}
          className="w-full border p-2 rounded mb-4"
        />

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 bg-gray-200 rounded">
            Batal
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-3 py-2 bg-green-600 text-white rounded"
          >
            {loading ? "Mengirim..." : "Selesaikan"}
          </button>
        </div>

      </div>
    </div>
  );
}