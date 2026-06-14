import { supabase, getValidToken } from "../lib/supabase";

const API_URL =
  "http://localhost:8001/api/dashboard";

export const getPerformanceDashboard =
  async () => {

    const token = await getValidToken();
    if (!token) {
      throw new Error(
        "User belum login"
      );
    }

    const response =
      await fetch(
        `${API_URL}/performance`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    if (!response.ok) {

      const error =
        await response.json();

      throw new Error(
        error.message ||
        "Gagal mengambil data dashboard"
      );
    }

    return await response.json();
  };