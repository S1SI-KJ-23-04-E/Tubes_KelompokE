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
    <div className="min-h-screen flex items-center justify-center px-4 bg-slate-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        {/* AVATAR */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
            {form.nama?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-800">
            Edit Profil
          </h2>
        </div>

        {/* ALERT */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-600 rounded-lg text-sm">
            {message}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="text"
            name="nama"
            value={form.nama}
            onChange={handleChange}
            placeholder="Nama"
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="text"
            name="alamat"
            value={form.alamat}
            onChange={handleChange}
            placeholder="Alamat"
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
          />

          <input
            type="text"
            name="no_hp"
            value={form.no_hp}
            onChange={handleChange}
            placeholder="No HP"
            className="w-full border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-700 transition"
          >
            {loading ? "Menyimpan..." : "Simpan Profil"}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ProfileUpdate;