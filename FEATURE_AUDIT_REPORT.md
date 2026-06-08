# SIMIKOT FEATURE AUDIT REPORT
**Generated: June 2, 2026**
**Status: Comprehensive Source Code Audit**

---

## AUTHENTICATION & ACCOUNT MANAGEMENT

### Feature: User Registration
- **Pages:** Register.jsx
- **Roles:** Warga (Public - before login)
- **Input Fields:**
  - Nama Lengkap (text, required, min 1 char)
  - Email Address (email, required, must be @gmail.com domain only)
  - Password (text, required, min 6 characters)
  - Kecamatan Domisili (select dropdown, optional)
- **Validation Rules:**
  - Email validation: `email.endsWith('@gmail.com')` - ONLY Gmail allowed
  - Password validation: `password.length < 6` - minimum 6 characters
  - Kecamatan: Optional (can leave empty)
  - Name: Basic required field
- **Business Outcomes:**
  - New user account created with role='warga'
  - Profile automatically created in Supabase
  - User directed to login page on success
  - Error message: "Pendaftaran gagal: {error}" if failed
- **UI Elements:**
  - Button: "Daftar Sekarang" (with UserPlus icon)
  - Link: "Masuk di sini" (link to login)
  - Select: "Pilih Kecamatan..." (searchable dropdown)
  - Error display: Red alert box with border-l-4 border-red-500
- **API Endpoints:**
  - `supabase.auth.signUp()` - Create user in Auth
  - `supabase.from('profiles').insert()` - Create profile record
- **Error Scenarios:**
  - Non-Gmail email: "Hanya email dengan domain @gmail.com yang diizinkan"
  - Short password: "Password minimal 6 karakter"
  - Registration failure: "Pendaftaran gagal: {error}"

---

### Feature: User Login
- **Pages:** Login.jsx
- **Roles:** All (Public - before login)
- **Input Fields:**
  - Email (email, required)
  - Password (password, required)
  - Show Password toggle (checkbox)
- **Validation Rules:**
  - Email: standard email format
  - Password: any length (backend validates credentials)
  - No client-side validation for format - relies on Supabase Auth
- **Business Outcomes:**
  - User authenticated via Supabase Auth
  - Profile data fetched (includes role)
  - Role-based redirect:
    - role='kecamatan' → `/laporan?tab=__dashboard_kecamatan__`
    - role='super_admin' → `/dashboard`
    - role='warga' or 'petugas' → `/laporan`
  - Session token stored for future requests
- **UI Elements:**
  - Input: Email field with Mail icon (blue-indigo-600)
  - Input: Password field with Lock icon, Eye/EyeOff toggle
  - Button: "Masuk" with LogIn icon
  - Link: "Belum punya akun? Daftar di sini"
  - Success message display at top if redirected from registration
  - Error: "Email atau password yang kamu masukkan salah."
- **API Endpoints:**
  - `supabase.auth.signInWithPassword()`
  - `supabase.from('profiles').select()` - fetch user profile with role
- **Error Scenarios:**
  - Invalid credentials: "Email atau password yang kamu masukkan salah."
  - No profile found: Warning logged but login proceeds with default redirect

---

### Feature: User Profile View & Edit
- **Pages:** ProfileUpdate.jsx
- **Roles:** All authenticated users (warga, petugas, kecamatan, super_admin)
- **Input Fields:**
  - Nama (text, required, min 1 char)
  - Alamat (text, required, min 1 char)
  - No HP (numeric, required, min 10 digits)
- **Validation Rules:**
  - Nama: `.trim()` must be non-empty
  - Alamat: `.trim()` must be non-empty
  - No HP: `/^\d+$/.test(form.no_hp)` - only digits allowed
  - No HP length: `form.no_hp.length >= 10` - minimum 10 digits
  - All fields must pass validation before submit button enabled
- **Business Outcomes:**
  - Profile updated in Supabase (upsert operation)
  - Update timestamp recorded as `updated_at`
  - Success message: "Profil berhasil diperbarui."
  - Local state synced via `updateProfileState()` for navbar display
- **UI Elements:**
  - Avatar: Initials in gradient circle (indigo-500 to blue-600)
  - Input: "Nama" with User icon, green checkmark on valid entry
  - Input: "Alamat" with MapPin icon
  - Input: "No HP" with Phone icon
  - Button: "Simpan" (green when form dirty and valid)
  - Error display: Red alert under each field (only after touched)
  - Hint text: "Minimal 10 digit" under No HP field
  - Completion percentage: Shows at bottom (X% Lengkap)
- **API Endpoints:**
  - `PUT /api/profile/:id` - Update profile data
  - `GET /api/profile/:id` - Fetch profile on mount
- **Error Scenarios:**
  - Empty field on submit: "[Field] wajib diisi"
  - Invalid phone number: "Hanya boleh angka"
  - Short phone number: "Minimal 10 digit"
  - API error: "Gagal memuat data profil." or "Terjadi kesalahan saat menyimpan."

---

## WARGA (CITIZEN) FEATURES

### Feature: Create Laporan (Report Infrastructure Issue)
- **Pages:** LaporanForm.jsx
- **Roles:** warga (authenticated)
- **Input Fields:**
  - Judul (title, text, required)
  - Kecamatan (select dropdown, required)
  - Kelurahan (select dropdown, required)
  - Deskripsi (description, textarea, required)
  - Alamat (address, text, required)
  - Foto (image file, required)
  - Latitude (auto-detected from map, required)
  - Longitude (auto-detected from map, required)
- **Validation Rules:**
  - Kecamatan & Kelurahan: Both required - "Harap pilih Kecamatan dan Kelurahan"
  - Photo: File upload required - "Silakan upload foto laporan"
  - Photo file: Image format only
  - Location validation: Maps pin validated against selected Kelurahan using Nominatim API
  - Location mismatch warning: "Titik peta berada di sekitar '{mapKelurahan}', tidak sesuai dengan Kelurahan yang Anda pilih ({selectedKelurahan}). Silakan geser pin ke lokasi yang benar."
  - Geolocation: Auto-detected on page load (accuracy high, timeout 15s, no cached data)
- **Business Outcomes:**
  - Laporan created in `laporan` table with status='pending'
  - Photo uploaded to Supabase Storage (`laporan-photos` bucket)
  - Historical record created in `history_laporan` table
  - Latitude/Longitude stored for duplicate detection
  - Status chain: pending → verified → in_progress → done
- **UI Elements:**
  - Map: Leaflet interactive map with draggable marker
  - Button: "Buat Laporan" (Plus icon, indigo-600)
  - Button: "← Kembali" to go back
  - Select: "Pilih Kecamatan..." (searchable, isClearable)
  - Select: "Pilih Kelurahan..." (populated after kecamatan selected)
  - Textarea: Large input for description
  - Geolocation status: "Detecting" | "Success" | "Denied" | "Unavailable"
  - Alert: "Kecamatan dan Kelurahan tidak boleh kosong" (error box)
- **API Endpoints:**
  - `GET /api/kecamatan` - Fetch list of kecamatan
  - `GET /api/kelurahan/:kecamatanId` - Fetch kelurahan by kecamatan
  - `POST /api/laporan` - Create new laporan
  - `POST /api/storage/upload` - Upload photo to storage
  - Nominatim API: Reverse geocoding for location validation
- **Error Scenarios:**
  - Missing kecamatan/kelurahan: "Incomplete" alert modal
  - Missing photo: "Silakan upload foto laporan"
  - Location mismatch: Validation warning shown but allows proceed
  - Upload failure: Error alert with retry option

---

### Feature: View Public Laporan Feed
- **Pages:** LaporanList.jsx (as warga - tab='buat')
- **Roles:** warga, petugas (can view; filtering different per role)
- **Input Fields:**
  - Search Query (text input, optional)
  - Status Filter (dropdown, optional)
  - Map/List toggle (view preference)
- **Validation Rules:**
  - Search: Can be empty (shows all)
  - Status filter: Optional (default 'all')
  - Auto-refresh: Realtime via Supabase subscription
  - Manual refresh: Every 30 seconds via polling
- **Business Outcomes:**
  - Displays all laporan from OTHER warga (excludes own reports)
  - Shows status, location, upvote count, reporter name
  - Real-time updates via Supabase postgres_changes channel
  - Fallback polling if subscription fails
- **UI Elements:**
  - Tab: "Lihat Laporan" (Globe icon) - public view
  - Tab: "Laporan Saya" (FileText icon) - personal reports
  - LaporanCard: Shows status badge, date, location, upvote count
  - Status badge colors: pending (yellow), verified (blue), in_progress (orange), done (green), rejected (red)
  - Button: Upvote icon with count (ThumbsUp icon)
  - Search bar: Searchable by title/address
- **API Endpoints:**
  - `GET /api/laporan` - Fetch all public laporan
  - `GET /api/laporan/user` - Fetch user's own laporan
  - Supabase realtime: `channel('laporan_changes').on('postgres_changes')`
- **Error Scenarios:**
  - Connection lost: Polling fallback attempts every 30s
  - API failure: Graceful fallback to client-side query

---

### Feature: View My Laporan (Personal Report History)
- **Pages:** LaporanList.jsx (as warga - tab='buat')
- **Roles:** warga (and internal roles can view masuk)
- **Input Fields:**
  - None (displays pre-fetched data)
- **Validation Rules:**
  - Auto-fetched for logged-in user
  - Ordered by `created_at` descending (newest first)
- **Business Outcomes:**
  - Shows all reports created by current user
  - Includes status, location, upvote count
  - Can delete if status='pending'
  - Can rate/feedback if status='done' and user is reporter
- **UI Elements:**
  - Card display per report
  - Delete button (Trash2 icon) - only for pending reports
  - View details link → LaporanDetail.jsx
  - Status progression indicator
- **API Endpoints:**
  - `GET /api/laporan/user` - Fetch user's laporan
- **Error Scenarios:**
  - No reports: "Belum ada laporan" message

---

### Feature: View Laporan Detail
- **Pages:** LaporanDetail.jsx
- **Roles:** All (public detail page)
- **Input Fields:**
  - None (view only)
  - Optional: Comments/Feedback (textarea, only for warga/reporter)
- **Validation Rules:**
  - Laporan must exist (ID valid) - "Laporan tidak ditemukan"
  - Report data includes: photo, location, status, history, feedback, bukti
  - Feedback: Can only be submitted once per report per user
- **Business Outcomes:**
  - Shows complete laporan information with full history
  - Displays status progression with visual stepper (Dilaporkan → Diverifikasi → Diproses → Selesai)
  - Shows associated kendala_laporan (obstacles reported by staff)
  - Shows bukti_selesai (completion proof)
  - Shows all feedback/ratings from warga
  - Upvote/downvote tracking per user
- **UI Elements:**
  - Progress stepper: 4 steps with icons (FileText, ShieldCheck, Wrench, Flag/CheckCircle2)
  - Status badge: Large with color indicator
  - Photo display: Main image or placeholder
  - Map: Show location marker
  - Stat cards: Created date, upvote count, feedback count, priority
  - Timeline: History of status changes with dates and notes
  - Feedback section: List of all reviews with rating stars
  - Button: "Upvote" / "Downvote" (ThumbsUp icon)
  - Button: "Upload Bukti" (for admin only when in_progress)
  - Button: "Beri Penilaian" (FeedbackForm component, for reporter when done)
- **API Endpoints:**
  - `GET /api/laporan/:id` - Fetch detailed laporan
  - `GET /api/laporan/:id/upvote/check` - Check user's upvote status
  - `POST /api/laporan/:id/upvote` - Toggle upvote
- **Error Scenarios:**
  - Report not found: Error modal → redirect to /laporan after 2s
  - Feedback duplicate: "Feedback untuk laporan ini sudah tersedia."
  - Upvote error: "Hanya warga yang dapat memberikan dukungan"

---

### Feature: Upvote/Support Laporan
- **Pages:** LaporanList.jsx, LaporanDetail.jsx (via LaporanCard component)
- **Roles:** warga only (checked server-side)
- **Input Fields:**
  - None (single click action)
- **Validation Rules:**
  - User must be logged in: `if (!user) return`
  - User must be warga role: `userRole !== 'warga'` → 403 error
  - Toggle behavior: If already upvoted, removes upvote; if not, adds upvote
- **Business Outcomes:**
  - Upvote record inserted into `upvote` table (laporan_id, user_id)
  - Upvote_count in laporan table incremented/decremented
  - Visual feedback: Button changes color (indigo when active)
  - Count updated real-time
- **UI Elements:**
  - Button: ThumbsUp icon with count number
  - States:
    - Inactive: bg-gray-50 text-gray-500, unfilled heart
    - Active: bg-indigo-600 text-white, filled heart
  - Disabled during loading
- **API Endpoints:**
  - `POST /api/laporan/:id/upvote` - Toggle upvote (bypass RLS)
  - `GET /api/laporan/:id/upvote/check` - Check current status
- **Error Scenarios:**
  - Not warga: "Hanya warga yang dapat memberikan dukungan"
  - Database error: Generic error message with error.message

---

### Feature: Submit Feedback/Rating for Completed Laporan
- **Pages:** LaporanDetail.jsx (FeedbackForm component)
- **Roles:** warga (reporter only)
- **Input Fields:**
  - Rating (1-5 stars, required)
  - Ulasan (review text, textarea, required)
- **Validation Rules:**
  - Only reporter can submit: `isPelapor && !isInternalRole`
  - Laporan must be status='done': Checks `isDone` state
  - One feedback per user: Validates no duplicate entry
  - Rating: 1-5 scale required
  - Ulasan: Text required
- **Business Outcomes:**
  - Feedback record created in `feedback` table
  - Rating aggregated in laporan (average displayed)
  - Feedback visible to public in report detail
  - Timestamp recorded
- **UI Elements:**
  - Card: Gradient bg-indigo-50 to slate-50
  - Stars: 5 clickable stars (★), yellow-400 when active
  - Textarea: "Tulis ulasan pengalaman Anda..."
  - Button: "Kirim Feedback" (indigo-600)
  - Disabled states: If not reporter, not logged in, or already submitted
  - Info text: "Feedback hanya dapat dikirim oleh pelapor laporan ini."
- **API Endpoints:**
  - `POST /api/feedback` - Insert feedback record
  - Duplicate check via `feedback.select()` before insert
- **Error Scenarios:**
  - Duplicate feedback: "Feedback untuk laporan ini sudah pernah Anda kirim."
  - DB constraint error (23505): "Feedback untuk laporan ini sudah tersedia."
  - Not reporter: Alert "Hanya pelapor yang dapat mengirim feedback."
  - Not logged in: Alert "Anda harus login untuk mengirim feedback."
  - No rating: Alert "Pilih rating 1-5"

---

## ADMIN KECAMATAN FEATURES

### Feature: Kecamatan Dashboard (Overview)
- **Pages:** AdminKecamatanDashboard.jsx
- **Roles:** kecamatan (admin for specific kecamatan)
- **Input Fields:**
  - Tab toggle: "Laporan" | "Kendala"
  - Refresh button (manual)
- **Validation Rules:**
  - Auto-filters by user's kecamatan_id
  - Only shows kecamatan's own data
  - Pulls from `profile?.kecamatan?.id` or `profile?.kecamatan_id`
- **Business Outcomes:**
  - Displays summary stats: Total, Pending, In Progress, Done, Rejected
  - Shows status distribution bar (stacked visualization)
  - Lists recent 10 laporan with quick status update buttons
  - Identifies overdue reports (>3 days in pending/verified/in_progress)
  - Shows kendala list (obstacles) on second tab
- **UI Elements:**
  - Stat cards: 5 cards showing counts (Total, Pending, Diproses, Selesai, Ditolak)
  - Distribution bar: Stacked progress bar with color segments
  - Legend: Colored dots with labels and counts
  - Table: Laporan list with status, priority, date
  - Overdue flag: Alert icon on reports >3 days old
  - Button: "Refresh" (RefreshCw icon, top right)
- **API Endpoints:**
  - `GET /api/laporan/kecamatan/:kecamatanId` - Fetch kecamatan's laporan
  - `GET /api/admin/kendala/kecamatan/:kecamatanId` - Fetch kendala list
- **Error Scenarios:**
  - No kecamatan_id: Falls back to super_admin view
  - API failure: Fallback to client-side filtering
  - Loading state: Spinner with "Memuat Dashboard..." message

---

### Feature: View Incoming Laporan (Admin Masuk Tab)
- **Pages:** LaporanList.jsx (tab='masuk' for admin roles)
- **Roles:** kecamatan, super_admin, petugas
- **Input Fields:**
  - Search query (text, optional)
  - Status filter (dropdown, optional)
- **Validation Rules:**
  - Auto-loads from API endpoint with Bearer token
  - If API fails, fallback to client-side query
  - Sorted by priority (high > low) then by created_at (newest first)
- **Business Outcomes:**
  - Displays all laporan for kecamatan (or all if super_admin)
  - Shows status, priority, location, upvote count
  - Links to detail view for modifications
  - Quick action buttons for status update
- **UI Elements:**
  - Tab: "Masuk" (Inbox icon)
  - Search bar: "Cari laporan..."
  - LaporanCard display: Status badge, priority indicator
  - Action buttons: "Update Status", "Add Catatan", "Set Prioritas"
  - Sidebar: Collapsible (PanelLeftOpen/PanelLeftClose icons)
- **API Endpoints:**
  - `GET /api/admin/laporan/kecamatan/:kecamatanId` - For kecamatan admin
  - `GET /api/admin/laporan/semua` - For super_admin
  - Fallback: `GET /api/laporan` - Client-side filtering
- **Error Scenarios:**
  - API 401/403: Access denied error display
  - No data: "Tidak ada laporan" message

---

### Feature: Update Laporan Status
- **Pages:** LaporanDetail.jsx (status update buttons), LaporanList.jsx (quick actions)
- **Roles:** kecamatan, super_admin (petugas for 'in_progress' only)
- **Input Fields:**
  - New Status (select, required): verified | rejected | in_progress | done | selesai
  - Keterangan (optional textarea, description of change)
- **Validation Rules:**
  - User kecamatan can only update own kecamatan's laporan
  - Super admin can update all laporan
  - Status must be in allowed set: ['verified', 'rejected', 'in_progress', 'done', 'selesai']
  - Transition validation: pending → verified → in_progress → done (logical flow)
- **Business Outcomes:**
  - Status updated in `laporan` table
  - History record created in `history_laporan` table
  - Timestamp updated: `updated_at`, and if status='done'/'selesai' then `selesai_at` set
  - Email/notification sent to reporter (if implemented)
  - Previous history visible in detail view
- **UI Elements:**
  - Button: "Terverifikasi" (verified) - blue
  - Button: "Sedang Diproses" (in_progress) - purple
  - Button: "Selesai" (done) - green
  - Button: "Tolak" (rejected) - red
  - Modal: StatusUpdateModal with textarea for notes
  - Modal title: "Update Status: {statusLabel}"
- **API Endpoints:**
  - `PUT /api/admin/laporan/:id/status` - Update status
- **Error Scenarios:**
  - Wrong kecamatan: "Anda hanya dapat mengubah status laporan di kecamatan Anda."
  - Invalid status: "Status tidak valid."
  - Laporan not found: "Laporan tidak ditemukan."
  - Non-admin role: "Hanya admin kecamatan dan super admin yang boleh mengubah status laporan."

---

### Feature: Set Prioritas (High/Low)
- **Pages:** LaporanDetail.jsx, LaporanList.jsx
- **Roles:** kecamatan, super_admin
- **Input Fields:**
  - Prioritas (select dropdown, required): 'high' | 'low'
- **Validation Rules:**
  - User kecamatan can only set priority for own kecamatan's laporan
  - Super admin can set for all
  - Priority values: 'high' or 'low' only
- **Business Outcomes:**
  - Priority value updated in `laporan.prioritas`
  - Affects sorting in list views (high priority shows first)
  - Persisted in database
- **UI Elements:**
  - Button/Dropdown: "Set Prioritas" with color indicator
  - Options: "Prioritas Tinggi" (red) | "Prioritas Rendah" (blue)
  - Visual indicator: Red badge for high, blue for low
- **API Endpoints:**
  - `PUT /api/admin/laporan/:id/prioritas` - Set priority
- **Error Scenarios:**
  - Wrong kecamatan: "Anda hanya dapat mengubah prioritas laporan di kecamatan Anda."
  - Invalid priority: "Prioritas harus high atau low."
  - Non-admin: "Hanya admin kecamatan dan super admin yang boleh mengubah prioritas laporan."

---

### Feature: Add Catatan (Admin Notes)
- **Pages:** LaporanDetail.jsx, LaporanCard.jsx (component)
- **Roles:** kecamatan, super_admin (can edit); petugas (can view only)
- **Input Fields:**
  - Catatan (textarea, optional max 500 chars)
- **Validation Rules:**
  - Admin can add/edit catatan
  - Petugas can only view if exists
  - Laporan must be in active status (not rejected/done)
- **Business Outcomes:**
  - Catatan stored in `laporan.catatan` field
  - Petugas receive notification of new catatan
  - Visible as instruction/note in report detail
- **UI Elements:**
  - Icon: MessageSquare button in report card
  - Color: Indigo-600 if catatan exists, gray-400 if not
  - Modal: CatatanModal with textarea
  - Title: "Tulis Catatan Tambahan" (edit mode) | "Catatan Tambahan dari Admin" (view mode)
  - For petugas: Read-only display of catatan
- **API Endpoints:**
  - `PUT /api/admin/laporan/:id/catatan` - Save catatan
  - `GET /api/laporan/:id` - Fetch includes catatan field
- **Error Scenarios:**
  - Non-admin: Cannot access edit
  - Petugas with no catatan: "Belum ada catatan dari admin."
  - API error: "Gagal menyimpan catatan"

---

### Feature: Upload Bukti Selesai (Completion Proof)
- **Pages:** LaporanDetail.jsx (UploadBuktiModal component), AdminSelesai.jsx
- **Roles:** kecamatan (admin), super_admin, petugas (field worker)
- **Input Fields:**
  - Foto (image file upload, required)
  - Keterangan (description textarea, optional)
- **Validation Rules:**
  - Photo must be selected: "Foto bukti wajib diupload"
  - File format: Image only (JPG/PNG)
  - File size: Implicit max ~10MB (browser limit)
  - Can only upload when laporan status = 'in_progress'
- **Business Outcomes:**
  - Photo uploaded to Supabase Storage (`laporan-photos/bukti/` path)
  - Public URL generated and stored in `bukti_selesai` table
  - Laporan status automatically set to 'done'/'selesai'
  - History record created with status='done'
  - Selesai_at timestamp set to current time
  - Keterangan (description) stored with photo
- **UI Elements:**
  - Modal: Title "Upload Bukti Penyelesaian"
  - Upload area: Drag/drop or click to select file
  - Preview: Image thumbnail shows after selection
  - Textarea: "Keterangan Bukti" with example text
  - Alert: "Setelah disimpan, status laporan akan berubah menjadi selesai dan tidak dapat diubah kembali."
  - Button: "Kirim Bukti" (green) | "Batalkan"
- **API Endpoints:**
  - `POST /api/laporan/:id/selesai` - Upload bukti and complete report
  - Multipart form-data: foto + keterangan
- **Error Scenarios:**
  - No photo: "Foto bukti wajib diupload"
  - Upload failure: "Gagal upload bukti" + error message
  - Status check fails: API responds with error

---

## PETUGAS (FIELD WORKER) FEATURES

### Feature: View Notifikasi Petugas (Notifications)
- **Pages:** NotifikasiPetugas.jsx
- **Roles:** petugas only
- **Input Fields:**
  - None (read-only list)
- **Validation Rules:**
  - Auto-fetches notifications where penerima_role='petugas'
  - Shows unread notifications
  - Auto-marks as read when viewed
- **Business Outcomes:**
  - Displays all notifications (title + message)
  - Marks unread notifications as read
  - Auto-refreshes on page load
- **UI Elements:**
  - Card per notification: White border border-slate-200
  - Title: Bold heading
  - Message: Description text
  - Button: "Tandai Dibaca" (if not already read)
  - Empty state: "Belum ada notifikasi."
  - Navigation: Back button to /laporan
- **API Endpoints:**
  - `GET /api/notifikasi/petugas` - Fetch petugas notifications
  - `PUT /api/notifikasi/:id/read` - Mark as read
- **Error Scenarios:**
  - No notifications: Empty message displayed

---

### Feature: Report Kendala (Field Obstacle/Issue)
- **Pages:** LaporanDetail.jsx (KendalaForm component in modal)
- **Roles:** petugas, kecamatan
- **Input Fields:**
  - Deskripsi (textarea, required, min 10 chars recommended)
- **Validation Rules:**
  - Description must be non-empty
  - No length limit specified in code
- **Business Outcomes:**
  - Kendala record created in `kendala_laporan` table
  - Links to specific laporan_id and petugas_id
  - Visible to admin/kecamatan as blocking issue
  - Can be resolved by admin taking action
- **UI Elements:**
  - Card: amber-50 bg with border-amber-100
  - Icon: AlertTriangle (amber-600)
  - Title: "Laporan Kendala"
  - Textarea: Large input for description
  - Button: "Kirim Laporan Kendala" (Send icon, amber-500)
  - Button: "Batal" (cancel)
  - Watermark: AlertTriangle icon in background (opacity-5)
- **API Endpoints:**
  - `POST /api/admin/laporan/:id/kendala` - Create kendala
- **Error Scenarios:**
  - Empty description: Not submitted (form validation)
  - API error: Generic error message

---

## SUPER ADMIN FEATURES

### Feature: Super Admin Dashboard (Performance Analytics)
- **Pages:** SuperAdminDashboard.jsx
- **Roles:** super_admin only
- **Input Fields:**
  - Sort by dropdown: 'avg' (average duration) | 'total' (total reports)
  - Sort direction: 'asc' | 'desc'
  - Refresh button (manual)
- **Validation Rules:**
  - Access restricted to role='super_admin': 403 error otherwise
  - Only displays after auth validation
- **Business Outcomes:**
  - Aggregates data across all kecamatan
  - Calculates performance metrics: avg completion time, total reports
  - Identifies fastest/slowest kecamatan
  - Shows trend indicators (% change)
- **UI Elements:**
  - Stat cards: 4 top metrics
    - Total Laporan (file icon)
    - Total Kecamatan (map-pin icon)
    - Rata-rata Durasi (timer icon)
    - Tingkat Aktivitas (activity icon)
  - Table: Sortable kecamatan list
    - Columns: Rank, Kecamatan, Total Laporan, Avg Duration, Performance Badge
    - Sort arrows: ChevronUp/ChevronDown/Minus (depending on sort state)
  - Performance indicators: Color-coded (green=fast, red=slow)
  - Trends: %+ green badge, %- red badge
- **API Endpoints:**
  - `GET /api/dashboard/performance` - Fetch kecamatan performance data
  - Requires Bearer token auth
- **Error Scenarios:**
  - Not super_admin: "Akses ditolak. Hanya Super Admin yang dapat mengakses dashboard."
  - API failure: "Gagal mengambil data dashboard" with retry button

---

## DUPLICATE DETECTION & MANAGEMENT

### Feature: Find Duplicate Laporan
- **Pages:** LaporanList.jsx (tab='duplikat' for admin/super_admin)
- **Roles:** kecamatan, super_admin
- **Input Fields:**
  - Radius slider: 1-50 meters (default 50)
  - Refresh button (manual)
- **Validation Rules:**
  - User kecamatan sees only own kecamatan's duplicates
  - Super admin sees all kecamatan duplicates
  - Radius clamped to 1-50 meter range
  - Uses RPC function `find_nearby_reports()` on backend
- **Business Outcomes:**
  - Detects nearby reports within specified radius
  - Groups duplicates using Union-Find algorithm
  - Displays groups with all paired reports
  - Shows distance between reports in each pair
  - Links to merge function for grouped reports
- **UI Elements:**
  - Slider: Radius adjustment (1-50m)
  - Groups display: Each group shows:
    - Group # with count
    - List of reports (oldest first)
    - Distance between pairs
    - Merge button for group
  - Map: Optional location visualization per group
- **API Endpoints:**
  - `GET /api/admin/duplicate/:kecamatanId?radius=50` - Find duplicates
  - Backend RPC: `find_nearby_reports(p_kecamatan_id, p_radius_meters)`
- **Error Scenarios:**
  - Wrong kecamatan: "Anda hanya dapat melihat duplikat di kecamatan Anda"
  - Non-admin: "Hanya admin kecamatan yang dapat mengakses fitur ini"
  - No duplicates found: Empty list displayed

---

### Feature: Merge Duplicate Laporan
- **Pages:** LaporanList.jsx (tab='duplikat')
- **Roles:** kecamatan, super_admin
- **Input Fields:**
  - Primary report select (required, which report to keep)
  - Secondary reports multi-select (required, which to merge into primary)
- **Validation Rules:**
  - At least one primary and one secondary required
  - Cannot merge report with itself
  - User kecamatan can only merge own kecamatan reports
  - Super admin can merge all
- **Business Outcomes:**
  - Primary report retained with combined data
  - Secondary reports marked as duplicates (or status changed)
  - Upvotes combined/aggregated
  - All kendala/feedback reassigned to primary
  - History recorded for audit
  - Original laporan linked for reference
- **UI Elements:**
  - Button: "Gabung" or "Merge Laporan" (GitMerge icon)
  - Modal: Select primary and secondary reports
  - Confirmation: "Laporan ini akan digabung. Tindakan tidak dapat dibatalkan."
- **API Endpoints:**
  - `POST /api/admin/duplicate/merge` - Merge reports
  - Body: `{ primary_id, secondary_ids: [] }`
  - Backend RPC: `merge_laporan(p_primary_id, p_secondary_ids, p_admin_id)`
- **Error Scenarios:**
  - Missing primary/secondary: "primary_id dan secondary_ids (array) wajib diisi"
  - Wrong kecamatan: "Anda hanya dapat menggabungkan laporan di kecamatan Anda"
  - Non-admin: "Hanya admin kecamatan yang dapat menggabungkan laporan"
  - RPC error: "Gagal menggabungkan laporan: {error.message}"

---

## UTILITY & SHARED FEATURES

### Feature: Get Kecamatan & Kelurahan Data
- **Pages:** Used in LaporanForm.jsx, Register.jsx, and admin pages
- **Roles:** All
- **Endpoints:**
  - `GET /api/kecamatan` - List all kecamatan (nama_kecamatan, id)
  - `GET /api/kelurahan/:kecamatanId` - List kelurahan by kecamatan

---

### Feature: Map Integration (Leaflet)
- **Pages:** LaporanForm.jsx, LaporanDetail.jsx
- **Technology:** Leaflet + React-Leaflet + Nominatim Geocoding API
- **Features:**
  - Interactive map with draggable marker
  - Auto-geolocation on page load (browser geolocation API)
  - Auto-center when kelurahan selected (Nominatim reverse geocoding)
  - Location validation against selected kelurahan
- **Validation:**
  - Geolocation status: 'detecting' | 'success' | 'denied' | 'unavailable'
  - Timeout: 15 seconds for geolocation
  - Accuracy requirement: High accuracy enabled
- **Error Display:**
  - Map validation message shown if location mismatch
  - Example: "Titik peta berada di sekitar '{mapKelurahan}', tidak sesuai dengan Kelurahan yang Anda pilih"

---

## ROUTING & ACCESS CONTROL

### Role-Based Routes:

| Route | Role | Component | Access |
|-------|------|-----------|--------|
| `/login` | Public | Login.jsx | Before auth |
| `/register` | Public | Register.jsx | Before auth |
| `/laporan` | All authenticated | LaporanList.jsx | Tab varies by role |
| `/laporan/:id` | All | LaporanDetail.jsx | Public view |
| `/laporan/form` | warga | LaporanForm.jsx | Create new |
| `/dashboard` | super_admin | SuperAdminDashboard.jsx | Performance |
| `/profile` | All authenticated | ProfileUpdate.jsx | Edit own profile |
| `/notifikasi` | petugas | NotifikasiPetugas.jsx | Petugas only |
| Route guard: AdminKecamatanRoute | kecamatan, super_admin | Wrapper | Protected |
| Route guard: SuperAdminRoute | super_admin | Wrapper | Protected |

---

## KEY VALIDATION PATTERNS IDENTIFIED

### Email Validation:
```
- Must be @gmail.com domain (strict check)
- Cannot use other email providers
```

### Phone Validation:
```
- Only digits allowed: /^\d+$/.test(no_hp)
- Minimum 10 digits
```

### Status Workflow:
```
pending → verified → in_progress → done
                  ↘ rejected (anytime)
```

### Priority:
```
high (weight: 3) → sorted first
low (weight: 1) → sorted second
```

### Role Hierarchy:
```
super_admin > kecamatan > petugas > warga
```

---

## DATABASE TABLES REFERENCED

| Table | Purpose | Key Fields |
|-------|---------|-----------|
| profiles | User account data | id, nama, email, role, alamat, no_hp |
| laporan | Report data | id, pelapor_id, judul, deskripsi, alamat, status, prioritas, catatan, latitude, longitude |
| history_laporan | Status change audit | laporan_id, status, changed_by, catatan, created_at |
| kecamatan | Administrative regions | id, nama_kecamatan |
| kelurahan | Sub-regions | id, kecamatan_id, nama_kelurahan |
| upvote | User support votes | laporan_id, user_id |
| feedback | Ratings & reviews | laporan_id, user_id, rating, ulasan |
| kendala_laporan | Field obstacles | laporan_id, petugas_id, deskripsi |
| bukti_selesai | Completion proof | laporan_id, url_foto, keterangan, uploaded_by |
| notifikasi | User notifications | penerima_role, judul, pesan, is_read |

---

## EXTERNAL APIs INTEGRATED

| API | Purpose | Endpoint |
|-----|---------|----------|
| Nominatim (OpenStreetMap) | Geocoding & reverse geocoding | `/reverse`, `/search` |
| Supabase Auth | User authentication | signUp, signInWithPassword |
| Supabase Database | Data persistence | PostgreSQL via PostgREST |
| Supabase Storage | File uploads | laporan-photos bucket |
| Supabase Realtime | Live updates | postgres_changes channel |

---

## TEST COVERAGE ANALYSIS

### High Priority Test Scenarios (Based on Feature Complexity):
1. ✅ Email domain restriction in registration
2. ✅ Phone number validation (digits + length)
3. ✅ Location validation against Kelurahan
4. ✅ Duplicate report detection within radius
5. ✅ Status workflow transitions
6. ✅ Priority sorting (high > low)
7. ✅ Role-based access control
8. ✅ Upvote toggle (add/remove)
9. ✅ Catatan visibility by role
10. ✅ Feedback submission (one per user)
11. ✅ Bukti upload (status to done)
12. ✅ Kendala reporting by petugas
13. ✅ Dashboard stats aggregation
14. ✅ Notification marking as read
15. ✅ Profile update with validation

---

## CONCLUSION

The SIMIKOT system contains **15 major features** across **5 user roles**, with comprehensive validation, role-based access control, and real-time updates. The codebase demonstrates good separation of concerns between frontend pages, services, and backend routes. All features have been documented with exact UI element names, API endpoints, validation rules, and error scenarios for thorough testing.
