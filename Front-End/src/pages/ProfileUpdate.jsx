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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await updateProfile(user.id, form);

      if (res.error) {
        setError(res.error);
      } else {
        setMessage("Profile berhasil diperbarui ✅");
      }
    } catch (err) {
      setError("Terjadi kesalahan saat menyimpan");
    }

    setLoading(false);
  };

  return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100 px-4">
    
    <div className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200 p-8">

      {/* AVATAR */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-indigo-200">
          {form.nama?.charAt(0)?.toUpperCase() || "U"}
        </div>

        <h2 className="mt-4 text-2xl font-extrabold text-slate-800">
          Edit Profil
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          Perbarui informasi akun kamu
        </p>
      </div>

      {/* ALERT */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-xl text-sm">
          {message}
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Nama */}
        <div>
          <label className="text-sm font-semibold text-slate-600">
            Nama
          </label>
          <input
            type="text"
            name="nama"
            value={form.nama}
            onChange={handleChange}
            className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>

        {/* Alamat */}
        <div>
          <label className="text-sm font-semibold text-slate-600">
            Alamat
          </label>
          <input
            type="text"
            name="alamat"
            value={form.alamat}
            onChange={handleChange}
            className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>

        {/* No HP */}
        <div>
          <label className="text-sm font-semibold text-slate-600">
            No HP
          </label>
          <input
            type="text"
            name="no_hp"
            value={form.no_hp}
            onChange={handleChange}
            className="mt-1 w-full border border-slate-300 rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
          />
        </div>

        {/* BUTTON */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3 rounded-xl font-bold shadow-md shadow-indigo-200 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </button>

      </form>
    </div>
  </div>
);
};

export default ProfileUpdate;