import { useEffect, useState } from "react";
import { getProfile, updateProfile } from "../services/ProfileService";
import { useAuth } from "../contexts/AuthContext";

const ProfileUpdate = () => {
  const { user } = useAuth();

  const [form, setForm] = useState({
    nama: "",
    alamat: "",
    no_hp: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const data = await getProfile(user.id);

        setForm({
          nama: data?.nama || "",
          alamat: data?.alamat || "",
          no_hp: data?.no_hp || "",
        });
      } catch (err) {
        setError("Gagal mengambil data profile");
      }
    };

    fetchData();
  }, [user]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // VALIDASI
  const isValid =
    form.nama.trim() !== "" &&
    form.alamat.trim() !== "" &&
    form.no_hp.trim() !== "" &&
    form.no_hp.length >= 10;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (!form.nama || !form.alamat || !form.no_hp) {
      setError("Semua field wajib diisi");
      setLoading(false);
      return;
    }

    if (form.no_hp.length < 10) {
      setError("Nomor HP minimal 10 karakter");
      setLoading(false);
      return;
    }

    if (!/^\d+$/.test(form.no_hp)) {
      setError("Nomor HP hanya boleh angka");
      setLoading(false);
      return;
    }

    try {
      await updateProfile(user.id, form);
      setMessage("Profile berhasil diperbarui ✅");
    } catch (err) {
      setError(err.message || "Terjadi kesalahan saat menyimpan");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-blue-100 px-4">
      
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-8 relative overflow-hidden">

        {/* BACKGROUND DECOR */}
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-200 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-40"></div>

        {/* HEADER */}
        <div className="flex flex-col items-center mb-6 relative z-10">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg ring-4 ring-white">
            {form.nama?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <h2 className="mt-4 text-2xl font-extrabold text-slate-800">
            Edit Profil
          </h2>

          <p className="text-sm text-slate-500 mt-1 text-center">
            Pastikan data kamu lengkap dan valid
          </p>
        </div>

        {/* ALERT */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm animate-pulse">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-xl text-sm">
            {message}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5 relative z-10">

          {/* Nama */}
          <div>
            <label className="text-sm font-semibold text-slate-600">
              Nama <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nama"
              value={form.nama}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap"
              className={`mt-1 w-full border rounded-xl px-4 py-2 outline-none transition
                ${
                  !form.nama
                    ? "border-red-300 focus:ring-red-400"
                    : "border-slate-300 focus:ring-indigo-500"
                }
              `}
            />
            {!form.nama && (
              <p className="text-xs text-red-500 mt-1">Nama wajib diisi</p>
            )}
          </div>

          {/* Alamat */}
          <div>
            <label className="text-sm font-semibold text-slate-600">
              Alamat <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="alamat"
              value={form.alamat}
              onChange={handleChange}
              placeholder="Masukkan alamat lengkap"
              className={`mt-1 w-full border rounded-xl px-4 py-2 outline-none transition
                ${
                  !form.alamat
                    ? "border-red-300 focus:ring-red-400"
                    : "border-slate-300 focus:ring-indigo-500"
                }
              `}
            />
            {!form.alamat && (
              <p className="text-xs text-red-500 mt-1">Alamat wajib diisi</p>
            )}
          </div>

          {/* No HP */}
          <div>
            <label className="text-sm font-semibold text-slate-600">
              No HP <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="no_hp"
              value={form.no_hp}
              onChange={handleChange}
              placeholder="Contoh: 081234567890"
              className={`mt-1 w-full border rounded-xl px-4 py-2 outline-none transition
                ${
                  form.no_hp && form.no_hp.length < 10
                    ? "border-red-400 focus:ring-red-400"
                    : "border-slate-300 focus:ring-indigo-500"
                }
              `}
            />

            {!form.no_hp && (
              <p className="text-xs text-red-500 mt-1">
                Nomor HP wajib diisi
              </p>
            )}

            {form.no_hp && form.no_hp.length < 10 && (
              <p className="text-xs text-red-500 mt-1">
                Minimal 10 karakter
              </p>
            )}
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading || !isValid}
            className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-300 shadow-lg
              ${
                isValid
                  ? "bg-gradient-to-r from-indigo-600 to-blue-600 hover:scale-[1.03] active:scale-[0.97]"
                  : "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none"
              }
            `}
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ProfileUpdate;