import { supabase, getValidToken } from '../lib/supabase';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api';

export async function createBerita(payload, imageFile) {
  try {
    let token = await getValidToken();
    if (!token) return { success: false, error: 'Token tidak ditemukan' };

    const makeRequest = async () => {
      const body = new FormData();
      body.append('judul', payload.judul);
      body.append('deskripsi', payload.deskripsi);
      if (payload.kecamatan_id) body.append('kecamatan_id', payload.kecamatan_id);
      if (imageFile) body.append('image', imageFile);

      const res = await fetch(`${API_BASE}/admin/berita`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body
      });
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    };

    let response = await makeRequest();
    if (response.status === 401 && typeof supabase.auth.refreshSession === 'function') {
      token = await getValidToken();
      if (!token) return { success: false, error: 'Token tidak ditemukan' };
      response = await makeRequest();
    }

    if (!response.ok) {
      return { success: false, error: response.data?.error || response.data?.details || 'Gagal membuat berita' };
    }

    return { success: true, data: response.data };
  } catch (err) {
    return { success: false, error: err.message || 'Gagal membuat berita' };
  }
}

export async function getBeritaByKecamatan(kecamatanId) {
  try {
    const res = await axios.get(`${API_BASE}/berita/kecamatan/${kecamatanId}`);
    if (res.data?.success) {
      // Resolve relative image URLs to full backend URLs
      const data = (res.data.data || []).map(item => ({
        ...item,
        image_url: item.image_url && !item.image_url.startsWith('http') 
          ? `${API_BASE.replace('/api', '')}${item.image_url}` 
          : item.image_url
      }));
      return { success: true, data, error: null };
    }
    return {
      success: Boolean(res.data?.success),
      data: res.data?.data || [],
      error: res.data?.error || null
    };
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

export async function getAllBerita() {
  try {
    const res = await axios.get(`${API_BASE}/berita/all`);
    if (res.data?.success) {
      // Resolve relative image URLs to full backend URLs
      const data = (res.data.data || []).map(item => ({
        ...item,
        image_url: item.image_url && !item.image_url.startsWith('http') 
          ? `${API_BASE.replace('/api', '')}${item.image_url}` 
          : item.image_url
      }));
      return { success: true, data, error: null };
    }
    return {
      success: Boolean(res.data?.success),
      data: res.data?.data || [],
      error: res.data?.error || null
    };
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message };
  }
}

export async function updateBerita(id, payload, imageFile) {
  try {
    let token = await getValidToken();
    if (!token) return { success: false, error: 'Token tidak ditemukan' };

    const makeRequest = async () => {
      const body = new FormData();
      body.append('judul', payload.judul);
      body.append('deskripsi', payload.deskripsi);
      if (payload.remove_image) body.append('remove_image', 'true');
      if (imageFile) body.append('image', imageFile);

      const res = await fetch(`${API_BASE}/admin/berita/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body
      });
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    };

    let response = await makeRequest();
    if (response.status === 401 && typeof supabase.auth.refreshSession === 'function') {
      token = await getValidToken();
      if (!token) return { success: false, error: 'Token tidak ditemukan' };
      response = await makeRequest();
    }

    if (!response.ok) {
      return { success: false, error: response.data?.error || response.data?.details || 'Gagal mengubah berita' };
    }

    return { success: true, data: response.data };
  } catch (err) {
    return { success: false, error: err.message || 'Gagal mengubah berita' };
  }
}

export async function deleteBerita(id) {
  try {
    let token = await getValidToken();
    if (!token) return { success: false, error: 'Token tidak ditemukan' };

    const makeRequest = async () => {
      const res = await fetch(`${API_BASE}/admin/berita/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      return { ok: res.ok, status: res.status, data };
    };

    let response = await makeRequest();
    if (response.status === 401 && typeof supabase.auth.refreshSession === 'function') {
      token = await getValidToken();
      if (!token) return { success: false, error: 'Token tidak ditemukan' };
      response = await makeRequest();
    }

    if (!response.ok) {
      return { success: false, error: response.data?.error || response.data?.details || 'Gagal menghapus berita' };
    }

    return { success: true, data: response.data };
  } catch (err) {
    return { success: false, error: err.message || 'Gagal menghapus berita' };
  }
}
