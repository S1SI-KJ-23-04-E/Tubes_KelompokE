# SIMIKOT TEST EXECUTION CHECKLIST

## 1. AUTHENTICATION & ACCOUNT MANAGEMENT

### 1.1 User Registration
- [ ] Register with valid Gmail email (@gmail.com) - SUCCESS
- [ ] Register with non-Gmail email (e.g., @yahoo.com) - FAIL: "Hanya email dengan domain @gmail.com..."
- [ ] Register with password < 6 chars - FAIL: "Password minimal 6 karakter"
- [ ] Register with valid data - Account created, role='warga'
- [ ] Register without kecamatan selection - SUCCESS (optional field)
- [ ] Verify user can login after registration
- [ ] Verify default navigation to /login after registration

### 1.2 User Login
- [ ] Login with correct credentials - SUCCESS
- [ ] Login with wrong password - FAIL: "Email atau password yang kamu masukkan salah."
- [ ] Login with non-existent email - FAIL: "Email atau password yang kamu masukkan salah."
- [ ] Verify role-based redirect:
  - [ ] warga → /laporan
  - [ ] kecamatan → /laporan?tab=__dashboard_kecamatan__
  - [ ] super_admin → /dashboard
  - [ ] petugas → /laporan
- [ ] Verify session token stored for subsequent requests

### 1.3 User Logout
- [ ] Logout clears session
- [ ] Logout redirects to /login
- [ ] Protected routes become inaccessible after logout

---

## 2. WARGA (CITIZEN) FEATURES

### 2.1 Create Laporan
- [ ] Display map with geolocation auto-detection
- [ ] Drag map marker to new location
- [ ] Select kecamatan from dropdown
- [ ] Select kelurahan from dropdown (populates after kecamatan)
- [ ] Upload photo file (JPG/PNG)
- [ ] Fill title, description, address fields
- [ ] Submit without kecamatan - ERROR: "Harap pilih Kecamatan dan Kelurahan"
- [ ] Submit without photo - ERROR: "Silakan upload foto laporan"
- [ ] Location validation: marker in different kelurahan → Warning displayed
- [ ] Submit valid form - Laporan created, status='pending'
- [ ] Verify photo uploaded to Supabase Storage
- [ ] Verify history_laporan entry created

### 2.2 View Public Laporan Feed
- [ ] Load public feed (excludes own reports)
- [ ] See report cards with status badge
- [ ] Click report card → View detail page
- [ ] Search by title/address
- [ ] Filter by status
- [ ] Real-time updates via subscription
- [ ] Fallback polling every 30s if subscription fails
- [ ] Empty state: "Belum ada laporan"

### 2.3 View My Laporan
- [ ] Load personal report history
- [ ] Delete pending report - SUCCESS
- [ ] Try to delete in_progress report - BLOCKED
- [ ] Click report → View detail page
- [ ] See status progression for each report

### 2.4 Upvote Laporan
- [ ] Initial state: Button not filled, shows count
- [ ] Click upvote (first time) - Button turns indigo, count increments
- [ ] Click upvote again - Button returns to gray, count decrements
- [ ] Upvote not logged in user - BLOCKED
- [ ] Petugas/admin tries upvote - ERROR: "Hanya warga yang dapat memberikan dukungan"
- [ ] Verify upvote record in database

### 2.5 View Laporan Detail
- [ ] Load report with all details
- [ ] Display photo
- [ ] Show status stepper progression
- [ ] Display upvote count
- [ ] Show feedback/ratings section
- [ ] Display history timeline
- [ ] Show bukti_selesai if available
- [ ] Show kendala_laporan if exists
- [ ] Report not found (invalid ID) - ERROR: "Laporan tidak ditemukan" → redirect after 2s

### 2.6 Submit Feedback/Rating
- [ ] Only pelapor can submit feedback
- [ ] Report must be status='done'
- [ ] Select 1-5 stars
- [ ] Write review text
- [ ] Submit - Feedback recorded
- [ ] Try to submit duplicate feedback - ERROR: "Feedback untuk laporan ini sudah..."
- [ ] Non-pelapor tries - INFO: "Feedback hanya dapat dikirim oleh pelapor..."
- [ ] Empty review - Validation prevents submit
- [ ] No rating selected - ERROR: "Pilih rating 1-5"

### 2.7 Update Profile
- [ ] Load profile with existing data
- [ ] Edit nama field
- [ ] Edit alamat field
- [ ] Edit no_hp field with non-digits - ERROR: "Hanya boleh angka"
- [ ] Edit no_hp field with < 10 digits - ERROR: "Minimal 10 digit"
- [ ] Submit valid form - "Profil berhasil diperbarui."
- [ ] Verify navbar updates without page refresh (local state sync)
- [ ] Completion percentage tracks at bottom

---

## 3. ADMIN KECAMATAN FEATURES

### 3.1 Admin Kecamatan Dashboard
- [ ] Load dashboard for kecamatan admin
- [ ] Display stat cards: Total, Pending, Diproses, Selesai, Ditolak
- [ ] Calculate completion rate correctly
- [ ] Show status distribution bar (stacked visualization)
- [ ] Identify overdue reports (>3 days)
- [ ] Tab switch to Kendala list
- [ ] Manual refresh fetches latest data
- [ ] No kecamatan_id - Falls back to super_admin view

### 3.2 View Incoming Laporan
- [ ] Load "Masuk" tab shows all kecamatan's laporan
- [ ] Sort by priority: high > low > newest
- [ ] Search filters by title/address
- [ ] Status filter works
- [ ] Can access detail page from card
- [ ] API fallback if backend fails

### 3.3 Update Laporan Status
- [ ] Initial status: pending
- [ ] Update to 'verified' - Status changes
- [ ] Update to 'in_progress' - Status changes
- [ ] Update to 'done' - Status changes + selesai_at timestamp
- [ ] Update to 'rejected' - Status changes
- [ ] Add optional keterangan (notes)
- [ ] History record created for each status change
- [ ] Try to update other kecamatan's report - ERROR: "Anda hanya dapat mengubah status laporan di kecamatan Anda"
- [ ] Try with invalid status - ERROR: "Status tidak valid."
- [ ] StatusUpdateModal displays with textarea
- [ ] Modal title shows: "Update Status: {statusLabel}"

### 3.4 Set Prioritas
- [ ] Set report priority to 'high'
- [ ] Set report priority to 'low'
- [ ] Verify sorting by priority in lists
- [ ] Try to set invalid priority - ERROR: "Prioritas harus high atau low."
- [ ] Try to set priority on other kecamatan - ERROR: "Anda hanya dapat mengubah prioritas laporan di kecamatan Anda"

### 3.5 Add Catatan (Notes)
- [ ] Admin clicks MessageSquare icon
- [ ] CatatanModal opens (edit mode)
- [ ] Type note text
- [ ] Click "Simpan Catatan" - Note saved
- [ ] Petugas views same report - Icon shows filled (catatan exists)
- [ ] Petugas clicks icon - Modal opens (view-only mode)
- [ ] Petugas cannot edit catatan
- [ ] Petugas no catatan - INFO: "Belum ada catatan dari admin."

### 3.6 Upload Bukti Selesai (Completion Proof)
- [ ] Click "Upload Bukti" button on in_progress report
- [ ] UploadBuktiModal opens
- [ ] Click upload area, select image
- [ ] Image preview displays
- [ ] Type keterangan (optional)
- [ ] Click "Kirim Bukti" - Photo uploaded to Storage
- [ ] Laporan status auto-changes to 'done'
- [ ] Bukti_selesai record created with URL
- [ ] selesai_at timestamp set
- [ ] History record created
- [ ] No photo selected - ERROR: "Foto bukti wajib diupload"
- [ ] Upload failure - ERROR: "Gagal upload bukti: {error}"

---

## 4. PETUGAS (FIELD WORKER) FEATURES

### 4.1 View Notifikasi
- [ ] Load notification list filtered by penerima_role='petugas'
- [ ] Display unread notifications
- [ ] Click "Tandai Dibaca" - Mark as read, button disappears
- [ ] Auto-mark all as read when page loads
- [ ] Empty state: "Belum ada notifikasi."

### 4.2 Report Kendala (Obstacle)
- [ ] Open KendalaForm modal from report detail
- [ ] Type description of obstacle/issue
- [ ] Click "Kirim Laporan Kendala"
- [ ] Kendala_laporan record created
- [ ] Admin sees kendala in "Kendala" tab
- [ ] Empty description - Form validation prevents submit
- [ ] Success: Modal closes, laporan refreshes

---

## 5. SUPER ADMIN FEATURES

### 5.1 Super Admin Dashboard
- [ ] Access /dashboard - Verify role='super_admin' required
- [ ] Non-super_admin access - ERROR: "Akses ditolak..."
- [ ] Load performance data for all kecamatan
- [ ] Display 4 stat cards: Total, Kecamatan, Avg Duration, Activity
- [ ] Sort by average duration (asc/desc)
- [ ] Sort by total reports (asc/desc)
- [ ] Table shows all kecamatan with metrics
- [ ] Performance color-coding: Green (fast) > Blue (normal) > Amber (slow) > Red (critical)
- [ ] Identify fastest kecamatan (first row)
- [ ] Identify slowest kecamatan
- [ ] Manual refresh loads latest data
- [ ] Trend indicators show % change

### 5.2 View All Laporan
- [ ] Super admin sees all laporan across kecamatan
- [ ] Sort and filter options available
- [ ] Can update status/priority on any laporan
- [ ] Can access duplicate detection

---

## 6. DUPLICATE DETECTION & MANAGEMENT

### 6.1 Find Duplicate Laporan
- [ ] Admin navigates to "Duplikat" tab
- [ ] Set radius slider: 1-50 meters
- [ ] Click "Cari Duplikat"
- [ ] API calls RPC find_nearby_reports()
- [ ] Groups display with all paired reports
- [ ] Each pair shows distance in meters
- [ ] Oldest report listed first
- [ ] Can access merge function from group
- [ ] Kecamatan admin sees only own kecamatan duplicates
- [ ] Try wrong kecamatan - ERROR: "Anda hanya dapat melihat duplikat..."
- [ ] Non-admin tries - ERROR: "Hanya admin kecamatan..."
- [ ] No duplicates found - Empty state displayed

### 6.2 Merge Duplicate Laporan
- [ ] Select primary report (to keep)
- [ ] Select multiple secondary reports (to merge)
- [ ] Confirm merge action
- [ ] Primary report retains all data
- [ ] Secondary reports linked/marked as merged
- [ ] Upvotes aggregated
- [ ] Kendala/feedback reassigned to primary
- [ ] History record created
- [ ] No primary/secondary - ERROR: "primary_id dan secondary_ids wajib diisi"
- [ ] Wrong kecamatan - ERROR: "Anda hanya dapat menggabungkan laporan di kecamatan Anda"

---

## 7. DATA VALIDATION & CONSTRAINTS

### 7.1 Email Validation
- [ ] @gmail.com only - STRICT
- [ ] @yahoo.com rejected
- [ ] @outlook.com rejected
- [ ] Custom domain rejected

### 7.2 Phone Validation
- [ ] Only digits: 08123456789 - PASS
- [ ] With spaces: 0812 3456 789 - FAIL
- [ ] With dashes: 0812-3456-789 - FAIL
- [ ] Minimum 10 digits: 0812345678 - PASS
- [ ] 9 digits: 081234567 - FAIL

### 7.3 Status Workflow
- [ ] pending → verified (allowed)
- [ ] pending → rejected (allowed)
- [ ] verified → in_progress (allowed)
- [ ] verified → rejected (check business logic)
- [ ] in_progress → done (allowed)
- [ ] Any → rejected (anytime allowed)
- [ ] done → any (NOT allowed - end state)
- [ ] Invalid status submission - ERROR: "Status tidak valid."

### 7.4 Priority Sorting
- [ ] High priority (weight=3) shows first in lists
- [ ] Low priority (weight=1) shows second
- [ ] Within same priority, newest first
- [ ] Sorting verified in admin lists

### 7.5 Location Validation
- [ ] Marker within selected kelurahan - No warning
- [ ] Marker in different kelurahan - Warning: "Titik peta berada di sekitar..."
- [ ] Nominatim API timeout - Graceful fallback (no block)
- [ ] Marker drag updates validation

---

## 8. ROLE-BASED ACCESS CONTROL

### 8.1 Route Protection
- [ ] /dashboard - Only super_admin
- [ ] /laporan?tab=masuk - Only internal roles
- [ ] /laporan?tab=duplikat - Only kecamatan/super_admin
- [ ] Unauthorized access - Redirect or error

### 8.2 Feature Access
- [ ] Upload bukti - Only when status='in_progress'
- [ ] Edit catatan - Only kecamatan/super_admin
- [ ] View catatan - Petugas (read-only)
- [ ] Submit feedback - Only pelapor
- [ ] Upvote - Only warga
- [ ] Create laporan - Only warga
- [ ] Report kendala - Only petugas/admin

### 8.3 Data Visibility
- [ ] Warga sees all public laporan (not own in public feed)
- [ ] Kecamatan admin sees only own kecamatan laporan
- [ ] Super admin sees all laporan
- [ ] Petugas sees laporan for own kecamatan

---

## 9. REAL-TIME & NOTIFICATION FEATURES

### 9.1 Real-Time Updates
- [ ] Subscription to laporan_changes channel
- [ ] New laporan appears in feed immediately
- [ ] Status change updates detail page
- [ ] Fallback polling every 30s if subscription fails
- [ ] Cleanup on unmount (unsubscribe)

### 9.2 Notifications
- [ ] Notification created when status changes
- [ ] Petugas receives notifications (penerima_role='petugas')
- [ ] Notification marked as read on view
- [ ] Auto-mark all on NotifikasiPetugas page load

---

## 10. FILE UPLOAD & STORAGE

### 10.1 Photo Upload (Laporan)
- [ ] File upload in LaporanForm
- [ ] Preview displays
- [ ] Upload to Supabase Storage bucket: laporan-photos
- [ ] Public URL generated
- [ ] URL stored in laporan.foto_url

### 10.2 Bukti Upload (Completion Proof)
- [ ] File upload in UploadBuktiModal
- [ ] Preview displays
- [ ] Upload to Supabase Storage path: laporan-photos/bukti/
- [ ] Public URL generated
- [ ] URL stored in bukti_selesai.url_foto
- [ ] Status automatically set to 'done'

### 10.3 File Validation
- [ ] Image format only (JPG/PNG)
- [ ] File size reasonable (~10MB limit assumed)
- [ ] Upload failure handled gracefully

---

## 11. ERROR HANDLING & USER FEEDBACK

### 11.1 Alert/Modal Errors
- [ ] AlertModal component displays errors
- [ ] Error type='error' shows in red
- [ ] Error type='success' shows in green
- [ ] Error type='info' shows in blue
- [ ] Modal closable with close button
- [ ] Auto-redirect on timeout (if implemented)

### 11.2 Form Validation
- [ ] Per-field validation messages
- [ ] Errors show only after field touched
- [ ] Disabled submit until valid
- [ ] Clear error on correction

### 11.3 Loading States
- [ ] Loading spinner shown during async operations
- [ ] Button disabled during loading
- [ ] Buttons show "Memproses...", "Mengirim...", etc.
- [ ] Timeout handling (if applicable)

---

## 12. UI/UX CONSISTENCY

### 12.1 Component Reusability
- [ ] LaporanCard used in list views
- [ ] UploadBuktiModal used in multiple places
- [ ] FeedbackForm component reusable
- [ ] KendalaForm component reusable
- [ ] Modal components consistent (Modals.jsx)

### 12.2 Visual Consistency
- [ ] Color scheme: Indigo primary (indigo-600), with secondary accent colors
- [ ] Status badges: Consistent colors across app
- [ ] Icons: Lucide icons used throughout
- [ ] Spacing: Tailwind consistent padding/margins
- [ ] Border radius: Consistent (rounded-xl, rounded-2xl, rounded-3xl)

### 12.3 Navigation
- [ ] Navbar visible on all authenticated pages
- [ ] Back buttons present on secondary pages
- [ ] Tab navigation clear and accessible
- [ ] Breadcrumbs (if applicable)

---

## 13. PERFORMANCE & OPTIMIZATION

### 13.1 Data Fetching
- [ ] Lazy loading of images
- [ ] Pagination (if applicable)
- [ ] Search debouncing (if implemented)
- [ ] Query optimization (select only needed fields)

### 13.2 Caching
- [ ] Session caching in AuthContext
- [ ] Local state management (React hooks)
- [ ] Avoid unnecessary re-renders

### 13.3 Bundle Size
- [ ] No unused imports
- [ ] Minimal dependencies

---

## 14. SECURITY CONSIDERATIONS

### 14.1 Authentication
- [ ] JWT tokens used (Supabase Auth)
- [ ] Tokens sent in Authorization header
- [ ] Token refresh handled (if implemented)
- [ ] Logout clears tokens

### 14.2 Row-Level Security (RLS)
- [ ] Database policies enforce access
- [ ] Backend bypass for specific operations (admin/super_admin)
- [ ] Frontend enforces role checks

### 14.3 Data Protection
- [ ] Sensitive data not logged
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (React escaping)
- [ ] CSRF tokens (if form submissions)

---

## 15. API INTEGRATION CHECKLIST

### 15.1 Endpoint Testing
- [ ] GET /api/kecamatan - Returns list
- [ ] GET /api/kelurahan/:id - Returns list for kecamatan
- [ ] POST /api/laporan - Create report
- [ ] GET /api/laporan - Get all (public)
- [ ] GET /api/laporan/:id - Get detail
- [ ] GET /api/laporan/user - Get user's reports
- [ ] POST /api/laporan/:id/upvote - Toggle upvote
- [ ] POST /api/laporan/:id/selesai - Upload bukti & complete
- [ ] PUT /api/admin/laporan/:id/status - Update status
- [ ] PUT /api/admin/laporan/:id/prioritas - Set priority
- [ ] PUT /api/admin/laporan/:id/catatan - Add note
- [ ] POST /api/admin/laporan/:id/kendala - Add kendala
- [ ] GET /api/admin/duplicate/:kecamatanId - Find duplicates
- [ ] POST /api/admin/duplicate/merge - Merge reports
- [ ] GET /api/dashboard/performance - Super admin dashboard
- [ ] GET /api/profile/:id - Get profile
- [ ] PUT /api/profile/:id - Update profile
- [ ] GET /api/notifikasi/petugas - Get notifications

### 15.2 Error Response Handling
- [ ] 401 Unauthorized - Show login redirect
- [ ] 403 Forbidden - Show access denied error
- [ ] 404 Not Found - Show item not found
- [ ] 500 Server Error - Show generic error with retry

### 15.3 Request Headers
- [ ] Authorization Bearer token included
- [ ] Content-Type application/json for JSON requests
- [ ] Multipart/form-data for file uploads

---

## TEST EXECUTION NOTES

**Total Features to Test:** 15 major features  
**Total Roles to Test:** 5 (warga, petugas, kecamatan, super_admin, public)  
**Priority Validation Checks:** 15 critical constraints  
**API Endpoints:** 18 endpoints to verify  

**Suggested Test Order:**
1. Authentication & Profile (foundation)
2. Warga Features (primary use case)
3. Admin Features (secondary workflows)
4. Petugas Features (support workflows)
5. Super Admin Dashboard (analytics)
6. Duplicate Detection (admin tools)
7. Real-time & Notifications (integration)
8. Error Handling & Edge Cases (robustness)
9. Security & Access Control (protection)
10. UI/UX Consistency (user experience)

---

*Last Updated: June 2, 2026*  
*Audit Completed: Comprehensive Source Review*  
*Ready for Test Case Generation*
