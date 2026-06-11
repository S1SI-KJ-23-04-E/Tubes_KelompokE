# SIMIKOT - Module & Feature Audit Documentation

**Source of Truth** untuk semua modul, fitur, dan test scenario aplikasi SIMIKOT v2.0

---

## Executive Summary

Aplikasi SIMIKOT adalah platform pelaporan kerusakan infrastruktur dengan role-based access control. Sistem mendukung tiga user role utama: **Warga**, **Petugas Kecamatan**, dan **Super Admin**.

---

## Module Inventory

### 1. Authentication Module

**Pages:**
- `Login.jsx` — login dengan email & password
- `Register.jsx` — daftar akun baru sebagai warga

**Features:**
- Sign In dengan email/password
- Sign Up dengan validasi domain @gmail.com
- Password validation (min 6 karakter)
- Protected routes untuk halaman terautentikasi
- Session persistence via Supabase Auth

**Backend Routes:**
- `POST /auth/signup` — via Supabase Auth
- `POST /auth/signin` — via Supabase Auth
- `POST /auth/logout` — via Supabase Auth

**Roles:**
- `warga` — pengguna publik
- `petugas` — tim lapangan
- `kecamatan` — admin kecamatan
- `super_admin` — admin pusat

---

### 2. Reports Module

**Pages:**
- `LaporanForm.jsx` — membuat laporan baru
- `LaporanList.jsx` — dashboard laporan multi-tab
- `LaporanDetail.jsx` — detail laporan dengan aksi admin

**Features:**
- Create laporan dengan judul, deskripsi, alamat, foto
- Geolocation: drag marker di peta untuk presisi lokasi
- Kelurahan/Kecamatan selection dengan validation
- Status tracking: pending → verified → in_progress → done / rejected
- Priority management: high / low
- Upvote/support dari warga untuk laporan lain
- Timeline history dengan catatan perubahan status
- Bukti selesai: upload foto + keterangan

**Admin Features:**
- Verifikasi laporan pending
- Tolak laporan yang tidak valid
- Ubah prioritas laporan
- Tambah catatan internal
- Lihat kendala lapangan
- Monitor progress laporan

**Backend Routes:**
- `POST /laporan` — create laporan (auth)
- `GET /laporan` — get all laporan (public)
- `GET /laporan/:id` — get detail laporan
- `GET /laporan/user` — get user laporan (auth)
- `DELETE /laporan/:id` — delete pending laporan (auth)
- `POST /laporan/:id/upvote` — toggle upvote (auth)
- `GET /laporan/:id/upvote/check` — check status upvote (auth)
- `POST /laporan/:id/selesai` — upload bukti selesai (auth)

---

### 3. Profile Module

**Pages:**
- `ProfileUpdate.jsx` — edit profil user

**Features:**
- Update nama, alamat, nomor HP
- Validasi nomor HP: hanya digit, min 10 karakter
- Show completion percentage
- Real-time update navbar

**Backend Routes:**
- `GET /profile/:id` — fetch profile
- `PUT /profile/:id` — update profile

---

### 4. Dashboard Module

**Pages:**
- `SuperAdminDashboard.jsx` — dashboard pusat (super admin)
- `AdminKecamatanDashboard.jsx` — dashboard kecamatan (admin kecamatan)

**Features (Super Admin):**
- View performa semua kecamatan
- Ranking kecamatan berdasarkan laporan selesai
- KPI: total laporan, rata-rata waktu selesai, response rate
- Download/export data

**Features (Admin Kecamatan):**
- View laporan kecamatan: pending, in_progress, selesai
- Distribusi status laporan
- Average resolution time
- Top issues by area
- Notification badge untuk laporan pending

**Backend Routes:**
- `GET /dashboard` — fetch dashboard metrics (auth)

---

### 5. Admin Management Module

**Pages:**
- `LaporanList.jsx` (admin tabs) — multi-tab interface untuk admin

**Admin Tabs:**

1. **Laporan Masuk** — all pending & new reports
   - Filter by status, kecamatan, priority
   - Inline actions: verify, reject, prioritize
   - Add notes / catatan internal

2. **Laporan Progress** — in_progress reports
   - Monitor perbaikan
   - Upload completion proof
   - Add kendala lapangan
   - Set reminder ke petugas

3. **Laporan Selesai** — completed & rejected reports
   - View final outcome
   - Download bukti selesai
   - View feedback/rating dari pelapor

4. **Kendala Lapangan** (Moderator only)
   - List kendala dari petugas
   - Filter by kecamatan, status
   - Assign resolution actions

5. **Duplikat Detection** (Moderator only)
   - AI duplicate detection based on location + description
   - Adjust radius (1-50 meter)
   - Merge similar reports
   - Consolidate upvotes

**Features:**
- Status update with justification/keterangan
- Priority update (high/low)
- Add internal notes
- Bulk actions (upcoming)
- Real-time sync with websocket (pending)

**Backend Routes:**
- `GET /admin/laporan/all` — all reports (auth, super_admin)
- `GET /admin/laporan/kecamatan/:id` — kecamatan reports (auth)
- `PUT /admin/laporan/:id/status` — update status (auth)
- `PUT /admin/laporan/:id/prioritas` — update priority (auth)
- `PUT /admin/laporan/:id/catatan` — add notes (auth)
- `GET /admin/duplicate/:id` — detect duplicates (auth)
- `POST /admin/duplicate/merge` — merge reports (auth)

---

### 6. Notification Module

**Pages:**
- `NotifikasiPetugas.jsx` — notifications untuk petugas/admin

**Features:**
- Unread notification badge
- Mark as read
- Notification types: new report, status update, kendala, reminder

**Backend Routes:**
- `GET /notifikasi` — fetch notifications (auth)
- `POST /notifikasi/:id/read` — mark read (auth)

---

### 7. Feedback Module

**Pages:**
- `FeedbackForm.jsx` — rating & ulasan dari pelapor

**Features:**
- Star rating (1-5) for completed reports
- Text review/feedback
- Only available for pelapor after report selesai
- View feedback history & average rating

**Backend Routes:**
- `POST /feedback` — create feedback (auth)
- `GET /laporan/:id/feedback` — get feedback (public)

---

### 8. Wilayah (Regional) Module

**Features:**
- Daftar kecamatan
- Daftar kelurahan per kecamatan

**Backend Routes:**
- `GET /wilayah/kecamatan` — fetch all kecamatan (public)
- `GET /wilayah/kelurahan/:kecamatanId` — fetch kelurahan (public)

---

## Data Model Summary

### Laporan (Reports)

| Field | Type | Description |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `pelapor_id` | UUID | FK to profiles (reporter) |
| `judul` | string | Report title |
| `deskripsi` | string | Description |
| `alamat` | string | Location address |
| `latitude` | float | GPS latitude |
| `longitude` | float | GPS longitude |
| `foto_url` | string | Report photo URL |
| `kecamatan_id` | UUID | FK to kecamatan |
| `kelurahan_id` | UUID | FK to kelurahan |
| `status` | enum | pending \| verified \| in_progress \| done \| rejected |
| `prioritas` | enum | high \| low |
| `upvote_count` | int | Support count |
| `catatan` | string | Admin notes |
| `created_at` | timestamp | Report created |
| `updated_at` | timestamp | Last updated |

### Profiles (User Profiles)

| Field | Type | Description |
| --- | --- | --- |
| `id` | UUID | Primary key (FK to auth.users) |
| `nama` | string | Full name |
| `email` | string | Email address |
| `no_hp` | string | Phone number |
| `alamat` | string | Address |
| `role` | enum | warga \| petugas \| kecamatan \| super_admin |
| `kecamatan_id` | UUID | FK to kecamatan (for admin) |
| `created_at` | timestamp | Account created |

### History Laporan (Audit Trail)

| Field | Type | Description |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `laporan_id` | UUID | FK to laporan |
| `status` | enum | Status after change |
| `catatan` | string | Change notes |
| `changed_by` | UUID | User who made change |
| `created_at` | timestamp | Change timestamp |

### Kendala Laporan (Field Issues)

| Field | Type | Description |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `laporan_id` | UUID | FK to laporan |
| `deskripsi` | string | Issue description |
| `petugas_id` | UUID | Petugas who reported |
| `created_at` | timestamp | Reported at |

### Bukti Selesai (Completion Proof)

| Field | Type | Description |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `laporan_id` | UUID | FK to laporan |
| `url_foto` | string | Photo URL |
| `keterangan` | string | Description |
| `uploaded_by` | UUID | Petugas who uploaded |
| `created_at` | timestamp | Uploaded at |

### Upvote

| Field | Type | Description |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `laporan_id` | UUID | FK to laporan |
| `user_id` | UUID | FK to profiles |
| `created_at` | timestamp | Upvoted at |

### Feedback

| Field | Type | Description |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `laporan_id` | UUID | FK to laporan |
| `rating` | int | 1-5 stars |
| `ulasan` | string | Review text |
| `created_by` | UUID | FK to profiles |
| `created_at` | timestamp | Feedback date |

---

## Access Control (Role-Based)

| Feature | Warga | Petugas | Kecamatan | Super Admin |
| --- | --- | --- | --- | --- |
| Create laporan | ✓ | — | — | — |
| View own laporan | ✓ | — | — | — |
| View all laporan publik | ✓ | — | — | — |
| Upvote laporan | ✓ | — | — | — |
| Leave feedback | ✓ | — | — | — |
| View dashboard | — | — | ✓ | ✓ |
| Verify laporan | — | — | ✓ | ✓ |
| Update status | — | ✓ | ✓ | ✓ |
| Upload bukti selesai | — | ✓ | ✓ | ✓ |
| Report kendala | — | ✓ | — | — |
| Manage priority | — | — | ✓ | ✓ |
| Manage notes | — | — | ✓ | ✓ |
| View duplicate detection | — | — | ✓ | ✓ |
| Merge duplicate | — | — | ✓ | ✓ |
| View all kecamatan | — | — | — | ✓ |
| Manage super admin data | — | — | — | ✓ |

---

## Test Coverage Checkpoint

### Test Scenarios by Module

| Module | Feature | Positive | Negative | BVA | EP | Total |
| --- | --- | --- | --- | --- | --- | --- |
| Authentication | Login | 1 | 2 | 1 | 1 | 5 |
| Authentication | Register | 1 | 2 | 1 | 1 | 5 |
| Reports | Create Laporan | 1 | 2 | 1 | 1 | 5 |
| Reports | View Laporan List | 1 | 1 | 0 | 1 | 3 |
| Reports | View Laporan Detail | 1 | 1 | 0 | 1 | 3 |
| Reports | Upvote | 1 | 2 | 0 | 1 | 4 |
| Reports | Upload Bukti | 1 | 1 | 0 | 1 | 3 |
| Reports | Kendala | 1 | 1 | 0 | 1 | 3 |
| Profile | Update Profile | 1 | 2 | 1 | 1 | 5 |
| Admin | Status Update | 1 | 2 | 0 | 1 | 4 |
| Admin | Duplicate Merge | 1 | 1 | 0 | 1 | 3 |
| Admin | Dashboard | 1 | 1 | 0 | 1 | 3 |
| **TOTAL** | | **12** | **18** | **4** | **11** | **45** |

---

## Dokumentasi Status

- ✅ Feature Inventory — SELESAI
- ✅ Data Model — SELESAI
- ✅ Access Control — SELESAI
- ⏳ Test Scenario Development — IN PROGRESS
- ⏳ Automation Scripts — PENDING

---

**Document Version:** 1.0  
**Last Updated:** June 2, 2026  
**Author:** QA Automation  
**Status:** DRAFT → REVIEW → APPROVED

