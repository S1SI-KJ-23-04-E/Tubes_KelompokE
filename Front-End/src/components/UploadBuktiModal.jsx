import { useEffect, useState } from 'react';
import { X, Upload, ImagePlus } from 'lucide-react';

export default function UploadBuktiModal({
  open,
  onClose,
  onSubmit,
  title = 'Upload Bukti Penyelesaian',
  submitLabel = 'Kirim Bukti',
  loading = false,
  successMessage,
  errorMessage,
}) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [catatan, setCatatan] = useState('');

  useEffect(() => {
    if (!open) {
      setFile(null);
      setPreview('');
      setCatatan('');
    }
  }, [open]);

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) return;
    await onSubmit({ file, catatan });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{title}</h2>
            <p className="text-sm text-slate-500">Unggah foto bukti dan tambahkan keterangan singkat.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
          <div className="grid gap-4 md:grid-cols-[1.4fr_1fr]">
            <label className="group flex min-h-[220px] cursor-pointer flex-col rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4 text-slate-500 transition hover:border-indigo-400 hover:bg-white">
              <div className="flex items-center gap-3 text-slate-600 mb-4">
                <Upload size={20} />
                <span className="font-semibold">Pilih Foto Bukti</span>
              </div>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex-1 flex flex-col justify-center items-center text-center">
                {preview ? (
                  <img src={preview} alt="Preview bukti" className="max-h-48 w-full rounded-3xl object-cover" />
                ) : (
                  <>
                    <ImagePlus size={56} className="text-slate-400" />
                    <p className="mt-3 text-sm text-slate-500">Klik untuk memilih foto bukti</p>
                    <p className="text-[11px] text-slate-400 mt-2">Format JPG/PNG, maksimal 10MB</p>
                  </>
                )}
              </div>
            </label>

            <div className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900 mb-3">Keterangan Bukti</p>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  rows={8}
                  placeholder="Contoh: Pekerjaan selesai, jalan diperbaiki, termasuk spanduk selesai..."
                  className="w-full resize-none rounded-3xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10"
                />
              </div>

              {errorMessage && (
                <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                  {successMessage}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-3xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:w-auto"
            >
              Batalkan
            </button>
            <button
              type="submit"
              disabled={!file || loading}
              className="w-full rounded-3xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 sm:w-auto"
            >
              {loading ? 'Mengirim...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
