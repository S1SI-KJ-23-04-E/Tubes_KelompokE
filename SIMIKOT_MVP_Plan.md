# 🏗️ SIMIKOT — MVP Implementation Plan
**Sistem Monitoring Infrastruktur Kota**
*Tech Stack: Next.js + Supabase*

---

## 📋 Daftar Isi
1. [Pre-Requirements](#pre-requirements)
2. [Setup Project](#setup-project)
3. [Schema Database Supabase](#schema-database-supabase)
4. [Sprint 1 — Scope MVP](#sprint-1--scope-mvp)
5. [Prompt KF-01](#-prompt-kf-01)
6. [Catatan Teknis](#catatan-teknis)

---

## Pre-Requirements

> ⚠️ Selesaikan semua langkah ini **sebelum** mulai pengerjaan feature apapun.

### 1. Akun & Tools
- [ ] Buat akun [Supabase](https://supabase.com) (free tier cukup untuk MVP)
- [ ] Install [Node.js](https://nodejs.org) v18+
- [ ] Install [Git](https://git-scm.com)
- [ ] Install code editor (VS Code direkomendasikan)
- [ ] Install Supabase CLI: `npm install -g supabase`

### 2. Buat Project Supabase
- [ ] Buat project baru di dashboard Supabase
- [ ] Catat `Project URL` dan `anon public key` dari **Settings → API**
- [ ] Catat `service_role key` (untuk server-side operations)
- [ ] Aktifkan **Email Auth** di **Authentication → Providers**

### 3. Inisialisasi Project Next.js
```bash
npx create-next-app@latest simikot --typescript --tailwind --eslint --app
cd simikot
npm install @supabase/supabase-js @supabase/ssr
```

### 4. Konfigurasi Environment Variables
Buat file `.env.local` di root project:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 5. Setup Supabase Client
Buat file `lib/supabase/client.ts`:
```ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

Buat file `lib/supabase/server.ts`:
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

---

## Schema Database Supabase

> Jalankan SQL berikut di **Supabase → SQL Editor** sebelum mulai coding.

### DDL — Tabel Utama

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ENUM types
CREATE TYPE user_role AS ENUM ('warga', 'kecamatan', 'petugas', 'super_admin');
CREATE TYPE laporan_status AS ENUM ('pending', 'verified', 'in_progress', 'done', 'rejected');
CREATE TYPE laporan_prioritas AS ENUM ('low', 'medium', 'high', 'urgent');

-- Tabel Kecamatan
CREATE TABLE kecamatan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama_kecamatan TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Kelurahan
CREATE TABLE kelurahan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nama_kelurahan TEXT NOT NULL,
  kecamatan_id UUID REFERENCES kecamatan(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Users (extend auth.users dari Supabase)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nama TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'warga',
  kecamatan_id UUID REFERENCES kecamatan(id),
  avatar_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Laporan
CREATE TABLE laporan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pelapor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  kecamatan_id UUID REFERENCES kecamatan(id),
  kelurahan_id UUID REFERENCES kelurahan(id),
  deskripsi TEXT NOT NULL,
  alamat TEXT NOT NULL,
  foto_url TEXT,
  prioritas laporan_prioritas DEFAULT 'medium',
  status laporan_status DEFAULT 'pending',
  catatan TEXT,
  upvote_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  selesai_at TIMESTAMPTZ
);

-- Tabel Upvote
CREATE TABLE upvote (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  laporan_id UUID REFERENCES laporan(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(laporan_id, user_id)
);

-- Tabel Bukti Selesai
CREATE TABLE bukti_selesai (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  laporan_id UUID UNIQUE REFERENCES laporan(id) ON DELETE CASCADE,
  url_foto TEXT NOT NULL,
  keterangan TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Feedback
CREATE TABLE feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  laporan_id UUID UNIQUE REFERENCES laporan(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id),
  ulasan TEXT,
  rating INT CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Kendala
CREATE TABLE kendala (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  laporan_id UUID REFERENCES laporan(id) ON DELETE CASCADE,
  petugas_id UUID REFERENCES profiles(id),
  alasan TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel History Status Laporan
CREATE TABLE history_laporan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  laporan_id UUID REFERENCES laporan(id) ON DELETE CASCADE,
  status laporan_status NOT NULL,
  changed_by UUID REFERENCES profiles(id),
  catatan TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Notifikasi
CREATE TABLE notifikasi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  laporan_id UUID REFERENCES laporan(id) ON DELETE CASCADE,
  isi_pesan TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Berita
CREATE TABLE berita (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID REFERENCES profiles(id),
  kecamatan_id UUID REFERENCES kecamatan(id),
  judul TEXT NOT NULL,
  deskripsi TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Penugasan
CREATE TABLE penugasan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  laporan_id UUID REFERENCES laporan(id) ON DELETE CASCADE,
  petugas_id UUID REFERENCES profiles(id),
  kecamatan_id UUID REFERENCES kecamatan(id),
  waktu_ditugaskan TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS)

```sql
-- Enable RLS di semua tabel
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE laporan ENABLE ROW LEVEL SECURITY;
ALTER TABLE upvote ENABLE ROW LEVEL SECURITY;
ALTER TABLE bukti_selesai ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE kendala ENABLE ROW LEVEL SECURITY;
ALTER TABLE history_laporan ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifikasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE penugasan ENABLE ROW LEVEL SECURITY;

-- Profiles: user bisa baca & update profil sendiri
CREATE POLICY "profiles_select_own" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Laporan: semua authenticated user bisa baca
CREATE POLICY "laporan_select_all" ON laporan FOR SELECT USING (auth.role() = 'authenticated');
-- Warga bisa insert laporan sendiri
CREATE POLICY "laporan_insert_warga" ON laporan FOR INSERT WITH CHECK (auth.uid() = pelapor_id);
-- Warga bisa delete laporan sendiri yang masih pending
CREATE POLICY "laporan_delete_own_pending" ON laporan FOR DELETE
  USING (auth.uid() = pelapor_id AND status = 'pending');
-- Kecamatan/admin bisa update laporan
CREATE POLICY "laporan_update_admin" ON laporan FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('kecamatan', 'super_admin', 'petugas')
    )
  );

-- Notifikasi: user hanya bisa baca notifikasi sendiri
CREATE POLICY "notifikasi_select_own" ON notifikasi FOR SELECT USING (auth.uid() = user_id);
```

### Storage Bucket untuk Foto

```sql
-- Di Supabase Dashboard: Storage → New Bucket
-- Nama bucket: "laporan-photos" (public)
-- Nama bucket: "bukti-selesai" (public)
```

### Seed Data Kecamatan Jakarta Selatan

```sql
INSERT INTO kecamatan (nama_kecamatan) VALUES
  ('Tebet'), ('Setiabudi'), ('Mampang Prapatan'),
  ('Pasar Minggu'), ('Cilandak'), ('Pesanggrahan'),
  ('Kebayoran Lama'), ('Kebayoran Baru'), ('Pancoran'),
  ('Jagakarsa');
```

---

## Sprint 1 — Scope MVP

Berdasarkan jadwal di proposal, Sprint 1 mencakup KF berikut:

| KF | Deskripsi Singkat | Prioritas |
|----|-------------------|-----------|
| **KF-01** | Buat laporan, hapus, pantau status | 🔴 Tinggi |
| KF-02 | Validasi laporan oleh kecamatan | 🔴 Tinggi |
| KF-04 | Upload foto bukti penyelesaian | 🔴 Tinggi |
| KF-05 | Form bukti penyelesaian | 🟡 Sedang |
| KF-08 | Prioritas tugas | 🟡 Sedang |
| KF-11 | Selesaikan / tolak laporan | 🔴 Tinggi |
| KF-12 | Lihat detail laporan | 🟡 Sedang |
| KF-13 | Tambah catatan pada laporan | 🟡 Sedang |
| KF-16 | Upvote laporan | 🟢 Rendah |
| KF-18 | Edit profil warga | 🟢 Rendah |

### Struktur Folder Next.js yang Disarankan

```
simikot/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── warga/
│   │   │   ├── laporan/
│   │   │   │   ├── page.tsx          ← list + buat laporan (KF-01)
│   │   │   │   ├── [id]/page.tsx     ← detail laporan (KF-12)
│   │   │   │   └── baru/page.tsx     ← form buat laporan (KF-01)
│   │   │   └── profil/page.tsx       ← edit profil (KF-18)
│   │   ├── kecamatan/
│   │   │   ├── laporan/
│   │   │   │   ├── page.tsx          ← list laporan masuk
│   │   │   │   └── [id]/page.tsx     ← validasi, prioritas, catatan (KF-02, 08, 13)
│   │   │   └── dashboard/page.tsx
│   │   └── petugas/
│   │       └── tugas/
│   │           ├── page.tsx          ← list penugasan
│   │           └── [id]/page.tsx     ← detail + bukti selesai (KF-04, 05)
│   └── layout.tsx
├── components/
│   ├── laporan/
│   │   ├── LaporanForm.tsx
│   │   ├── LaporanCard.tsx
│   │   └── LaporanDetail.tsx
│   └── ui/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── actions/
│       ├── laporan.ts   ← server actions untuk CRUD laporan
│       └── auth.ts
└── types/
    └── database.ts      ← generated types dari Supabase
```

### Generate TypeScript Types dari Supabase

```bash
# Login ke Supabase CLI dulu
supabase login

# Generate types (ganti <project-id> dengan ID project kamu)
supabase gen types typescript --project-id <project-id> > types/database.ts
```

---

## 🤖 Prompt KF-01

> Gunakan prompt berikut untuk mengimplementasikan **KF-01**: Sistem harus bisa membuat laporan kerusakan, hapus, dan memantau hasil laporannya.

---

### Prompt 1 — Server Actions untuk CRUD Laporan

```
Kamu adalah senior fullstack developer yang mengerjakan project Next.js 14 (App Router) + Supabase bernama SIMIKOT (Sistem Monitoring Infrastruktur Kota).

Buat file `lib/actions/laporan.ts` berisi Next.js Server Actions untuk operasi berikut:

**Context:**
- Tabel `laporan` memiliki kolom: id (uuid), pelapor_id (uuid), kecamatan_id (uuid), kelurahan_id (uuid), deskripsi (text), alamat (text), foto_url (text nullable), prioritas (enum: low/medium/high/urgent), status (enum: pending/verified/in_progress/done/rejected), catatan (text nullable), upvote_count (int), created_at, updated_at, selesai_at
- Auth menggunakan Supabase Auth. User yang login bisa diakses via `createClient()` dari `lib/supabase/server.ts`
- Foto disimpan di Supabase Storage bucket bernama `laporan-photos`

**Yang perlu dibuat:**

1. `createLaporan(formData: FormData)` — Server action untuk membuat laporan baru:
   - Ambil user yang sedang login, pastikan role-nya 'warga'
   - Validasi field wajib: deskripsi, alamat, kecamatan_id, kelurahan_id
   - Jika ada file foto, upload ke Supabase Storage bucket `laporan-photos` dan simpan URL-nya
   - Insert ke tabel laporan dengan status default 'pending'
   - Insert ke tabel history_laporan dengan status 'pending'
   - Return { success: true, data } atau { success: false, error: string }
   - Setelah sukses, lakukan revalidatePath('/warga/laporan')

2. `deleteLaporan(laporanId: string)` — Server action untuk menghapus laporan:
   - Validasi user yang login adalah pelapor laporan tersebut
   - Hanya boleh hapus jika status masih 'pending'
   - Jika ada foto, hapus juga dari Storage
   - Return { success: true } atau { success: false, error: string }
   - Setelah sukses, lakukan revalidatePath('/warga/laporan')

3. `getLaporanByUser()` — Server action/query untuk mengambil semua laporan milik user yang login:
   - Join dengan tabel kecamatan dan kelurahan untuk mendapat nama-namanya
   - Urutkan by created_at DESC
   - Return array laporan beserta nama kecamatan & kelurahan

4. `getLaporanById(id: string)` — Ambil detail satu laporan:
   - Join dengan kecamatan, kelurahan, profiles (nama pelapor)
   - Juga ambil data dari tabel history_laporan, bukti_selesai, feedback untuk laporan ini
   - Return object laporan lengkap atau null jika tidak ditemukan

Gunakan TypeScript. Tangani error dengan try-catch. Tambahkan JSDoc singkat di tiap function.
```

---

### Prompt 2 — Halaman List Laporan Warga (page.tsx)

```
Kamu sedang mengerjakan project Next.js 14 + Supabase (SIMIKOT). Server actions sudah tersedia di `lib/actions/laporan.ts` dengan fungsi `getLaporanByUser()`.

Buat file `app/(dashboard)/warga/laporan/page.tsx` sebagai halaman list laporan warga.

**Requirements:**
- Ini adalah Server Component (async)
- Panggil `getLaporanByUser()` untuk mengambil data
- Tampilkan setiap laporan sebagai card yang berisi:
  - Deskripsi (truncated 100 karakter)
  - Alamat
  - Nama kecamatan & kelurahan
  - Status laporan dengan badge berwarna:
    - pending → kuning
    - verified → biru
    - in_progress → oranye
    - done → hijau
    - rejected → merah
  - Tanggal dibuat (format: DD MMM YYYY)
  - Upvote count
- Tombol "Buat Laporan Baru" di bagian atas yang link ke `/warga/laporan/baru`
- Jika list kosong, tampilkan empty state yang ramah pengguna
- Setiap card bisa diklik untuk navigasi ke `/warga/laporan/[id]`
- Tombol hapus di setiap card yang status-nya masih 'pending', gunakan Server Action `deleteLaporan`

Gunakan Tailwind CSS untuk styling. Tidak perlu library UI eksternal. Buat komponen terpisah `LaporanCard` di `components/laporan/LaporanCard.tsx` yang menerima props dari page ini.
```

---

### Prompt 3 — Form Buat Laporan Baru

```
Kamu sedang mengerjakan project Next.js 14 + Supabase (SIMIKOT). Server action `createLaporan(formData)` sudah ada di `lib/actions/laporan.ts`.

Buat dua file:
1. `app/(dashboard)/warga/laporan/baru/page.tsx` — wrapper Server Component
2. `components/laporan/LaporanForm.tsx` — Client Component untuk form

**Requirements untuk LaporanForm.tsx (Client Component):**
- Field form:
  - `kecamatan_id` — dropdown/select, data diambil dari props (list kecamatan dari DB)
  - `kelurahan_id` — dropdown/select, opsi berubah dinamis berdasarkan kecamatan dipilih
  - `deskripsi` — textarea, min 20 karakter, max 500 karakter, tampilkan counter karakter
  - `alamat` — input text, alamat lengkap lokasi kerusakan
  - `foto` — input file (optional), hanya terima image/*, preview foto sebelum submit
- Validasi client-side sebelum submit menggunakan state
- Saat form disubmit, panggil server action `createLaporan` menggunakan `useFormState` dan `useFormStatus`
- Tampilkan loading state saat submit (disable tombol + spinner)
- Tampilkan error message dari server jika ada
- Setelah sukses, redirect ke `/warga/laporan`

**Requirements untuk page.tsx:**
- Fetch list kecamatan dan semua kelurahan dari Supabase (server-side)
- Pass data tersebut sebagai props ke LaporanForm

Gunakan Tailwind CSS. Tambahkan `'use client'` di LaporanForm. Gunakan `useRouter` dari `next/navigation` untuk redirect setelah sukses.
```

---

### Prompt 4 — Halaman Detail & Pantau Status Laporan

```
Kamu sedang mengerjakan project Next.js 14 + Supabase (SIMIKOT). Fungsi `getLaporanById(id)` sudah ada di `lib/actions/laporan.ts`.

Buat file `app/(dashboard)/warga/laporan/[id]/page.tsx` untuk halaman detail laporan.

**Requirements:**
- Server Component (async), ambil `id` dari params
- Panggil `getLaporanById(id)` untuk data laporan lengkap
- Redirect ke `/warga/laporan` jika laporan tidak ditemukan atau bukan milik user yang login
- Tampilkan informasi lengkap:
  - **Header**: Judul/deskripsi singkat + badge status berwarna
  - **Detail Info**: Alamat, Kecamatan, Kelurahan, Tanggal dibuat, Prioritas
  - **Foto Laporan**: Tampilkan jika ada, pakai next/image
  - **Timeline/Riwayat Status**: Tampilkan history_laporan secara kronologis seperti timeline vertikal. Setiap item tampilkan: status, tanggal, catatan (jika ada)
  - **Bukti Selesai**: Section khusus (hanya tampil jika status = 'done') dengan foto bukti
  - **Feedback**: Tampilkan feedback jika sudah ada. Jika status 'done' dan belum ada feedback, tampilkan form feedback sederhana (rating 1-5 bintang + textarea ulasan) — buat sebagai Client Component terpisah `components/laporan/FeedbackForm.tsx`
- Tombol "Kembali" ke list laporan
- Upvote button dengan jumlah upvote (Client Component)

Gunakan Tailwind CSS. Buat komponen terpisah untuk Timeline dan Feedback Form.
```

---

## Catatan Teknis

### Perubahan Tech Stack dari Proposal

> Proposal asli menggunakan PHP + MySQL. Untuk MVP ini kita switch ke **Next.js + Supabase** agar lebih cepat development dan sudah built-in auth, storage, dan realtime.

| Komponen | Proposal Asli | MVP Stack |
|----------|---------------|-----------|
| Frontend | HTML/CSS/JS | Next.js 14 + Tailwind CSS |
| Backend | PHP | Next.js Server Actions + API Routes |
| Database | MySQL | Supabase (PostgreSQL) |
| Auth | Manual | Supabase Auth |
| Storage (foto) | Manual upload | Supabase Storage |

### Tips Supabase untuk Tim

1. **RLS wajib aktif** — jangan disable RLS di production, perkuat policy per role
2. **Gunakan Supabase Realtime** untuk update status laporan live (bisa ditambahkan di Sprint 2)
3. **Foto laporan** — compress di client sebelum upload (gunakan `browser-image-compression`)
4. **Type safety** — selalu regenerate `types/database.ts` setiap ada perubahan schema
5. **Environment** — jangan commit `.env.local`, tambahkan ke `.gitignore`

### KF yang Akan Dikerjakan di Sprint 2

| KF | Deskripsi |
|----|-----------|
| KF-03 | Dashboard ranking kecamatan (response time) |
| KF-06 | Feedback warga |
| KF-07 | Dashboard admin kecamatan |
| KF-09 | Fitur pencarian laporan |
| KF-10 | Riwayat laporan |
| KF-14 | Notifikasi petugas lapangan |
| KF-15 | Laporan kendala petugas |
| KF-17 | Berita informasi kecamatan |

---

*Dokumen ini dibuat berdasarkan Proposal Pengembangan Produk SIMIKOT v01 — 26 Maret 2026*
