const BASE_URL = "http://localhost:8001/api/profile";

// GET PROFILE
export const getProfile = async (id) => {
  const res = await fetch(`${BASE_URL}/${id}`);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Gagal ambil profile");
  }
  return data;
};

// UPDATE PROFILE  ✅ nama harus updateProfile
export const updateProfile = async (id, payload) => {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Gagal update profile");
  }

  return data;
};