import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { uploadBuktiURL } from "../services/laporanService";

export default function AdminSelesaikan() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fotoUrl, setFotoUrl] = useState("");
  const [keterangan, setKeterangan] = useState("");
  const [loading, setLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [urlTouched, setUrlTouched] = useState(false);

  const handleUrlChange = (e) => {
    setFotoUrl(e.target.value);
    setImgError(false);
    if (!urlTouched) setUrlTouched(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fotoUrl) {
      setUrlTouched(true);
      return;
    }

    setLoading(true);

    const res = await uploadBuktiURL(id, fotoUrl, keterangan);

    if (res.success) {
      alert("Laporan berhasil diselesaikan");
      navigate("/admin");
    } else {
      alert("Gagal menyimpan");
    }

    setLoading(false);
  };

  const showUrlError = urlTouched && !fotoUrl;
  const showPreview = fotoUrl && !imgError;

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">

      {/* CARD */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">

        {/* HEADER */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-green-700" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12l2 2 4-4" />
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800 leading-tight">Upload bukti penyelesaian</p>
            <p className="text-xs text-gray-400 mt-0.5">Lampirkan foto dan keterangan pekerjaan</p>
          </div>
          <span className="text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-md">
            #{id || "LAP-042"}
          </span>
        </div>

        {/* BODY */}
        <div className="px-6 py-5 flex flex-col gap-5">

          {/* INFO STRIP */}
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
            <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-xs text-amber-700 leading-relaxed">
              Setelah disimpan, status laporan akan berubah menjadi{" "}
              <span className="font-semibold">selesai</span> dan tidak dapat diubah kembali.
            </p>
          </div>

          {/* FOTO URL */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Bukti foto
              <span className="text-xs font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded normal-case tracking-normal">
                wajib
              </span>
            </label>

            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
              </svg>
              <input
                type="text"
                placeholder="Paste URL foto di sini..."
                value={fotoUrl}
                onChange={handleUrlChange}
                className={`w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border bg-gray-50 text-gray-800 placeholder-gray-400 outline-none transition-all
                  ${showUrlError
                    ? "border-red-400 focus:ring-2 focus:ring-red-100"
                    : "border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-100"
                  }`}
              />
            </div>

            {showUrlError && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                URL foto wajib diisi
              </p>
            )}
          </div>

          {/* PREVIEW */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Preview foto
            </label>
            <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50 h-52 flex items-center justify-center">
              {showPreview ? (
                <>
                  <img
                    src={fotoUrl}
                    alt="preview"
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                  <span className="absolute top-2.5 right-2.5 text-xs font-medium text-white bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-md">
                    pratinjau
                  </span>
                </>
              ) : imgError ? (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <svg className="w-8 h-8 opacity-40" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  </svg>
                  <span className="text-xs">URL tidak valid atau gambar tidak dapat dimuat</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <svg className="w-8 h-8 opacity-40" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                  <span className="text-xs">Foto akan tampil di sini</span>
                </div>
              )}
            </div>
          </div>

          {/* KETERANGAN */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Keterangan hasil pekerjaan
            </label>
            <textarea
              placeholder="Deskripsikan pekerjaan yang telah diselesaikan, termasuk kendala jika ada..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 text-gray-800 placeholder-gray-400 outline-none resize-y focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all leading-relaxed"
            />
          </div>

        </div>

        {/* DIVIDER */}
        <div className="h-px bg-gray-100 mx-6" />

        {/* FOOTER */}
        <div className="flex items-center justify-between gap-3 px-6 py-4">
          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="text-sm font-medium text-gray-500 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Batal
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className={`flex items-center gap-2 text-sm font-semibold text-white px-5 py-2 rounded-xl transition-all
              ${loading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-700 hover:bg-green-800 active:scale-95"
              }`}
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round" />
                </svg>
                Menyimpan...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Selesaikan laporan
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}