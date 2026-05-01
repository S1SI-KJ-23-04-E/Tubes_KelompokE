import React, { useState } from "react";

const Feedback = () => {
  const [form, setForm] = useState({
    nama: "",
    email: "",
    pesan: "",
  });

  const [status, setStatus] = useState({
    loading: false,
    success: false,
    error: null,
  });

  // Handle input
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Validasi sederhana
  const validateForm = () => {
    if (!form.nama || !form.email || !form.pesan) {
      return "Semua field wajib diisi!";
    }
    return null;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errorMsg = validateForm();
    if (errorMsg) {
      setStatus({ ...status, error: errorMsg });
      return;
    }

    try {
      setStatus({ loading: true, success: false, error: null });

      // Simulasi API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Kalau pakai API asli:
      // await fetch("/api/feedback", { method: "POST", body: JSON.stringify(form) })

      setStatus({ loading: false, success: true, error: null });

      // Reset form
      setForm({
        nama: "",
        email: "",
        pesan: "",
      });
    } catch (err) {
      setStatus({
        loading: false,
        success: false,
        error: "Gagal mengirim feedback!",
      });
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto" }}>
      <h2>Form Feedback</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="nama"
          placeholder="Nama"
          value={form.nama}
          onChange={handleChange}
        />
        <br />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />
        <br />

        <textarea
          name="pesan"
          placeholder="Tulis feedback..."
          value={form.pesan}
          onChange={handleChange}
        />
        <br />

        <button type="submit" disabled={status.loading}>
          {status.loading ? "Mengirim..." : "Kirim Feedback"}
        </button>
      </form>

      {/* Status */}
      {status.success && <p style={{ color: "green" }}>Feedback berhasil dikirim!</p>}
      {status.error && <p style={{ color: "red" }}>{status.error}</p>}
    </div>
  );
};

export default Feedback;