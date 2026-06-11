# SIMIKOT DETAILED TEST SCENARIOS

## SCENARIO 1: User Registration & Email Domain Validation

### Test Case 1.1: Register with Valid Gmail Address
**Objective:** Verify that new user can register successfully with @gmail.com email  
**Precondition:** User is on Register.jsx page, not authenticated  
**Steps:**
1. Enter Nama Lengkap: "Budi Santoso"
2. Enter Email: "budi.santoso@gmail.com"
3. Enter Password: "password123" (6+ chars)
4. Leave Kecamatan Domisili blank (optional)
5. Click "Daftar Sekarang" button

**Expected Result:**
- Success message displayed
- Redirect to Login.jsx with message: "Pendaftaran berhasil! Silakan login dengan akun yang baru dibuat."
- New profile created in `profiles` table with role='warga'
- Email verified in Supabase Auth

**Pass Criteria:** ✅ Registration succeeds, user can login

---

### Test Case 1.2: Register with Non-Gmail Email (Invalid Domain)
**Objective:** Verify system rejects non-Gmail email addresses  
**Precondition:** User is on Register.jsx page  
**Steps:**
1. Enter Nama Lengkap: "Ani Wijaya"
2. Enter Email: "ani.wijaya@yahoo.com"
3. Enter Password: "password123"
4. Click "Daftar Sekarang"

**Expected Result:**
- Error message displayed: "Hanya email dengan domain @gmail.com yang diizinkan"
- Red alert box appears
- No profile created
- User stays on form

**Pass Criteria:** ✅ System validates domain strictly

---

### Test Case 1.3: Register with Weak Password (< 6 chars)
**Objective:** Verify password minimum length validation  
**Precondition:** User is on Register.jsx page  
**Steps:**
1. Enter Nama Lengkap: "Citra Dewi"
2. Enter Email: "citra@gmail.com"
3. Enter Password: "pass" (4 chars)
4. Click "Daftar Sekarang"

**Expected Result:**
- Error message: "Password minimal 6 karakter"
- Red alert displayed
- User remains on form

**Pass Criteria:** ✅ Password validation enforced

---

## SCENARIO 2: User Login & Role-Based Redirect

### Test Case 2.1: Login as Warga
**Objective:** Verify warga redirects to /laporan on login  
**Precondition:** Warga account exists (email: budi@gmail.com, pass: password123)  
**Steps:**
1. Go to Login.jsx
2. Enter Email: "budi@gmail.com"
3. Enter Password: "password123"
4. Click "Masuk"

**Expected Result:**
- Session token obtained
- Redirect to: `/laporan` (default tab)
- User profile fetched, role=warga displayed in navbar
- Laporan feed displayed

**Pass Criteria:** ✅ Correct redirect, session active

---

### Test Case 2.2: Login as Kecamatan Admin
**Objective:** Verify kecamatan admin redirects to dashboard tab  
**Precondition:** Kecamatan account exists with role='kecamatan'  
**Steps:**
1. Enter Email for kecamatan account
2. Enter Password
3. Click "Masuk"

**Expected Result:**
- Redirect to: `/laporan?tab=__dashboard_kecamatan__`
- Admin dashboard displayed with stats cards
- Laporan masuk list visible

**Pass Criteria:** ✅ Correct redirect to dashboard

---

### Test Case 2.3: Login with Wrong Password
**Objective:** Verify system rejects incorrect credentials  
**Precondition:** Valid account exists  
**Steps:**
1. Enter Email: "budi@gmail.com"
2. Enter Password: "wrongpassword"
3. Click "Masuk"

**Expected Result:**
- Error message: "Email atau password yang kamu masukkan salah."
- Red alert displayed
- User remains on login page
- Session NOT created

**Pass Criteria:** ✅ Invalid credentials rejected

---

## SCENARIO 3: Create & Validate Laporan Location

### Test Case 3.1: Create Laporan with Valid Location & Photo
**Objective:** Verify complete laporan creation workflow  
**Precondition:** Warga logged in, browser supports geolocation  
**Steps:**
1. Click button: "Buat Laporan Baru"
2. Wait for geolocation (shows "Detecting...")
3. Select Kecamatan: "Bandung Wetan"
4. Select Kelurahan: "Cibeunying" (from dropdown)
5. Enter Judul: "Jalan Berlubang Parit Menara"
6. Enter Deskripsi: "Jalanan sudah berlubang besar, berbahaya untuk kendaraan"
7. Enter Alamat: "Jl. Parit Menara No. 45"
8. Upload photo from file browser
9. Verify map shows marker in correct location
10. Click "Buat Laporan" button

**Expected Result:**
- Photo uploaded to Supabase Storage
- Laporan created in database with status='pending'
- History entry created
- Redirect to LaporanList.jsx
- New report visible in "Laporan Saya" tab
- Button shows success: "Laporan berhasil dibuat"

**Pass Criteria:** ✅ Complete workflow succeeds, photo stored, location validated

---

### Test Case 3.2: Location Mismatch Warning
**Objective:** Verify location validation against selected kelurahan  
**Precondition:** Laporan form open with geolocation enabled  
**Steps:**
1. Select Kecamatan: "Bandung Wetan"
2. Select Kelurahan: "Cibeunying"
3. Drag map marker to location outside "Cibeunying" (e.g., to "Sukajadi")
4. Wait for Nominatim validation

**Expected Result:**
- Warning message displayed: "Titik peta berada di sekitar 'Sukajadi', tidak sesuai dengan Kelurahan yang Anda pilih (Cibeunying). Silakan geser pin ke lokasi yang benar."
- User can still submit (warning, not blocker)

**Pass Criteria:** ✅ Location validation works, graceful handling

---

### Test Case 3.3: Create Laporan Without Selecting Kelurahan
**Objective:** Verify required field validation  
**Precondition:** Laporan form open  
**Steps:**
1. Select only Kecamatan
2. Skip Kelurahan selection
3. Fill other fields
4. Click "Buat Laporan"

**Expected Result:**
- Alert modal displayed: "Harap pilih Kecamatan dan Kelurahan"
- Form not submitted
- User can correct and retry

**Pass Criteria:** ✅ Required field validation works

---

## SCENARIO 4: Upvote Functionality & Access Control

### Test Case 4.1: Warga Upvotes Report (First Time)
**Objective:** Verify upvote toggle for warga  
**Precondition:** Warga logged in, viewing public laporan  
**Steps:**
1. Locate report card for another warga's report
2. Verify ThumbsUp button shows gray (inactive)
3. Click ThumbsUp button
4. Wait for API response

**Expected Result:**
- Button turns indigo-600 (active state)
- Count increments by 1
- Backend creates upvote record
- Button fills in (visual indication)

**Pass Criteria:** ✅ First upvote successful

---

### Test Case 4.2: Warga Removes Upvote (Toggle Off)
**Objective:** Verify upvote can be removed  
**Precondition:** Warga has upvoted a report  
**Steps:**
1. Click active ThumbsUp button (indigo colored)
2. Wait for API response

**Expected Result:**
- Button returns to gray (inactive)
- Count decrements by 1
- Backend deletes upvote record
- Button unfilled

**Pass Criteria:** ✅ Upvote removed successfully

---

### Test Case 4.3: Non-Warga Cannot Upvote (Admin/Petugas)
**Objective:** Verify upvote restricted to warga role  
**Precondition:** Kecamatan admin logged in, viewing report detail  
**Steps:**
1. Try to click ThumbsUp button
2. Backend receives upvote request

**Expected Result:**
- Button disabled or hidden
- OR API returns: 403 Error "Hanya warga yang dapat memberikan dukungan"
- Upvote not recorded

**Pass Criteria:** ✅ Role-based access enforced

---

## SCENARIO 5: Admin Status Update Workflow

### Test Case 5.1: Verify Report (Pending → Verified)
**Objective:** Verify basic status transition  
**Precondition:** Kecamatan admin logged in, viewing incoming laporan (tab='masuk')  
**Steps:**
1. Click on a pending report (status badge = yellow)
2. Navigate to LaporanDetail.jsx
3. Click button: "Terverifikasi" (green button)
4. StatusUpdateModal opens with textarea
5. Enter keterangan: "Data sudah diperiksa dan valid"
6. Click "Update Status" button

**Expected Result:**
- Status changes to 'verified' (blue badge)
- Progress stepper updates to show verified step
- History entry created with changed_by=admin_id, catatan=keterangan
- Modal closes
- Notification sent to pelapor (if implemented)

**Pass Criteria:** ✅ Status transition successful, history recorded

---

### Test Case 5.2: Reject Report
**Objective:** Verify rejection workflow  
**Precondition:** Report in pending/verified status  
**Steps:**
1. Click button: "Tolak" (red button)
2. Enter rejection reason: "Data tidak jelas, foto tidak valid"
3. Click "Update Status"

**Expected Result:**
- Status changes to 'rejected'
- Progress stepper shows rejected state (red)
- History recorded
- Report no longer shows in processing pipeline
- Notification sent to pelapor

**Pass Criteria:** ✅ Rejection successful, terminal state

---

### Test Case 5.3: Try to Update Other Kecamatan's Report
**Objective:** Verify kecamatan isolation  
**Precondition:** Kecamatan A admin logged in, viewing report from Kecamatan B  
**Steps:**
1. Navigate to Kecamatan B report detail
2. Try to click status update button
3. Click update

**Expected Result:**
- Error response: 403 "Anda hanya dapat mengubah status laporan di kecamatan Anda"
- Status not changed
- User prevented from modifying

**Pass Criteria:** ✅ Kecamatan isolation enforced

---

## SCENARIO 6: Profile Update & Validation

### Test Case 6.1: Update Profile with Valid Data
**Objective:** Verify profile update with all fields  
**Precondition:** User logged in, on ProfileUpdate.jsx  
**Steps:**
1. Clear Nama field, type: "Muhammad Rizqi"
2. Clear Alamat field, type: "Jl. Ahmad Yani No. 123, Bandung"
3. Clear No HP field, type: "08123456789"
4. Wait for validation (green checkmarks appear)
5. Click "Simpan" button

**Expected Result:**
- Success message: "Profil berhasil diperbarui."
- Database updated with new values
- Navbar displays updated nama immediately
- Completion percentage shows 100%

**Pass Criteria:** ✅ Update successful, validation passed

---

### Test Case 6.2: Invalid Phone Number (Non-Digits)
**Objective:** Verify phone validation regex  
**Precondition:** ProfileUpdate.jsx open  
**Steps:**
1. Enter No HP: "0812-3456-789" (with dashes)
2. Tab to next field or click away

**Expected Result:**
- Error message: "Hanya boleh angka"
- Field highlighted in red
- Save button disabled

**Pass Criteria:** ✅ Validation error shown

---

### Test Case 6.3: Phone Number Too Short (< 10 digits)
**Objective:** Verify minimum phone length  
**Precondition:** ProfileUpdate.jsx open  
**Steps:**
1. Enter No HP: "081234567" (9 digits)
2. Tab away

**Expected Result:**
- Error message: "Minimal 10 digit"
- Save button disabled

**Pass Criteria:** ✅ Length validation enforced

---

## SCENARIO 7: Feedback & Rating Submission

### Test Case 7.1: Submit Feedback as Pelapor
**Objective:** Verify feedback submission for completed report  
**Precondition:** Pelapor logged in, viewing own report with status='done'  
**Steps:**
1. Scroll to FeedbackForm section
2. Click star #5 (5-star rating)
3. Stars animate and turn yellow
4. Type ulasan: "Perbaikan dilakukan dengan cepat dan memuaskan"
5. Click "Kirim Feedback" button

**Expected Result:**
- Feedback inserted into database
- Rating displayed on page
- Form resets
- Success indication shown
- Feedback visible in report detail for others

**Pass Criteria:** ✅ Feedback created, visible to public

---

### Test Case 7.2: Prevent Duplicate Feedback
**Objective:** Verify one feedback per user per report  
**Precondition:** Pelapor already submitted feedback  
**Steps:**
1. Navigate to same report again
2. Try to submit another rating/review

**Expected Result:**
- Alert: "Feedback untuk laporan ini sudah pernah Anda kirim."
- No duplicate created
- Form disabled or hidden

**Pass Criteria:** ✅ Duplicate prevention works

---

### Test Case 7.3: Non-Pelapor Cannot Submit Feedback
**Objective:** Verify feedback restricted to pelapor  
**Precondition:** Different warga viewing completed report (not the pelapor)  
**Steps:**
1. View report detail
2. Locate FeedbackForm
3. Try to interact with form

**Expected Result:**
- Form disabled or read-only
- Info message: "Feedback hanya dapat dikirim oleh pelapor laporan ini."
- Cannot submit

**Pass Criteria:** ✅ Feedback access control enforced

---

## SCENARIO 8: Upload Bukti Selesai (Completion Proof)

### Test Case 8.1: Upload Completion Photo
**Objective:** Verify bukti upload and status change to done  
**Precondition:** Admin viewing in_progress report  
**Steps:**
1. Click "Upload Bukti" button
2. UploadBuktiModal opens
3. Select photo from file browser (completed work photo)
4. Verify preview displays
5. Type keterangan: "Jalan telah diperbaiki, kualitas baik"
6. Click "Kirim Bukti" button

**Expected Result:**
- Photo uploaded to Storage (`laporan-photos/bukti/`)
- Public URL generated
- Bukti_selesai record created with URL and keterangan
- Laporan status auto-changes to 'done'/'selesai'
- selesai_at timestamp set
- Progress stepper shows final step completed
- History record created

**Pass Criteria:** ✅ Bukti uploaded, status auto-completed

---

### Test Case 8.2: Try Upload Without Photo
**Objective:** Verify photo is required  
**Precondition:** UploadBuktiModal open  
**Steps:**
1. Click "Kirim Bukti" without selecting photo

**Expected Result:**
- Error: "Foto bukti wajib diupload"
- Modal stays open
- Cannot submit without photo

**Pass Criteria:** ✅ Photo requirement enforced

---

## SCENARIO 9: Kendala Reporting by Petugas

### Test Case 9.1: Report Obstacle/Issue
**Objective:** Verify petugas can report field obstacles  
**Precondition:** Petugas logged in, viewing in_progress report detail  
**Steps:**
1. Click button: "Lapor Kendala" or access KendalaForm
2. Type deskripsi: "Lokasi sulit diakses, ada genangan air yang menghalangi"
3. Click "Kirim Laporan Kendala"

**Expected Result:**
- Kendala_laporan record created with petugas_id
- Admin sees kendala in "Kendala" tab
- Detail shows kendala list below main info
- Form success indication

**Pass Criteria:** ✅ Kendala recorded, visible to admin

---

## SCENARIO 10: Duplicate Detection & Merge

### Test Case 10.1: Find Nearby Reports
**Objective:** Verify duplicate detection within radius  
**Precondition:** Kecamatan admin on LaporanList (tab='duplikat')  
**Steps:**
1. Set radius slider to 30 meters
2. Click "Cari Duplikat" button
3. Wait for API call to RPC function

**Expected Result:**
- Groups displayed with nearby reports
- Distance shown between paired reports
- Can see multiple pairs in same group
- Group count displayed
- Oldest report listed first in each group

**Pass Criteria:** ✅ Duplicate detection works, groups formed

---

### Test Case 10.2: Merge Duplicate Reports
**Objective:** Verify merge functionality  
**Precondition:** Duplicate group displayed, 2+ reports in group  
**Steps:**
1. Select primary report (one to keep)
2. Select secondary reports (to merge into primary)
3. Click "Gabung" button
4. Confirm merge action

**Expected Result:**
- Primary report retains all data
- Secondary reports linked/marked as merged
- Upvotes aggregated into primary count
- All kendala reassigned to primary
- History record created
- Confirmation message displayed

**Pass Criteria:** ✅ Merge successful, data consolidated

---

## SCENARIO 11: Admin Dashboard & Analytics

### Test Case 11.1: Kecamatan Dashboard Stats
**Objective:** Verify dashboard calculations  
**Precondition:** Kecamatan admin logged in, on AdminKecamatanDashboard  
**Steps:**
1. View 5 stat cards
2. Manually count laporan by status in data
3. Compare with dashboard totals

**Expected Result:**
- Total card = sum of all statuses
- Pending card = count of status='pending'
- Diproses card = count of status='verified'|'in_progress'|'proses'
- Selesai card = count of status='done'|'selesai'
- Ditolak card = count of status='rejected'
- Completion rate % calculated correctly
- Distribution bar percentages accurate

**Pass Criteria:** ✅ Stats calculated correctly

---

### Test Case 11.2: Super Admin Dashboard
**Objective:** Verify super admin performance analytics  
**Precondition:** Super admin logged in, on SuperAdminDashboard  
**Steps:**
1. View performance table
2. Verify sorting by average duration (ascending)
3. Click column header to reverse sort
4. Verify sorting by total reports

**Expected Result:**
- Table displays all kecamatan
- Performance badges: Green (fast) → Blue (normal) → Amber (slow) → Red (critical)
- Fastest kecamatan identified in 1st row
- Sort toggles work correctly
- Trends show % change

**Pass Criteria:** ✅ Dashboard analytics accurate

---

## SCENARIO 12: Real-Time Updates & Polling

### Test Case 12.1: Real-Time Laporan Feed Update
**Objective:** Verify Supabase realtime subscription  
**Precondition:** Warga viewing public feed on LaporanList  
**Steps:**
1. Open another browser/device with same kecamatan
2. Create new laporan on other device
3. Wait on first device

**Expected Result:**
- New laporan appears in feed within 1-2 seconds
- No page refresh needed
- Notification/visual indication of new item

**Pass Criteria:** ✅ Realtime updates working

---

### Test Case 12.2: Fallback Polling if Subscription Fails
**Objective:** Verify polling fallback  
**Precondition:** Supabase realtime channel fails  
**Steps:**
1. Create new laporan
2. Wait 30+ seconds

**Expected Result:**
- Feed updates after polling interval (30s)
- No subscription error shown to user
- Graceful fallback

**Pass Criteria:** ✅ Polling fallback works

---

## SCENARIO 13: Security & Role Isolation

### Test Case 13.1: Warga Cannot Access Admin Dashboard
**Objective:** Verify admin routes protected  
**Precondition:** Warga logged in  
**Steps:**
1. Try to navigate to /dashboard
2. Try to navigate to /laporan?tab=masuk

**Expected Result:**
- Redirect to /laporan (default warga view)
- OR error: "Akses ditolak"
- Dashboard not accessible

**Pass Criteria:** ✅ Route protection enforced

---

### Test Case 13.2: Data Isolation by Kecamatan
**Objective:** Verify kecamatan admin sees only own data  
**Precondition:** Kecamatan A admin viewing other kecamatan's laporan ID  
**Steps:**
1. Try to access report detail from Kecamatan B
2. Try to view laporan in tab filter

**Expected Result:**
- Report not visible in list
- Direct URL access shows error or readonly view
- Cannot modify other kecamatan's data

**Pass Criteria:** ✅ Data isolation enforced

---

## SCENARIO 14: Notification System

### Test Case 14.1: Petugas Receives Notification
**Objective:** Verify notification creation and display  
**Precondition:** Petugas account exists, notification created (e.g., on status change)  
**Steps:**
1. Petugas navigates to NotifikasiPetugas page
2. View notification list

**Expected Result:**
- Notifications displayed (judul + pesan)
- Unread notifications have "Tandai Dibaca" button
- Notification list sorted by newest first

**Pass Criteria:** ✅ Notifications display correctly

---

### Test Case 14.2: Mark Notification as Read
**Objective:** Verify notification read status  
**Precondition:** Unread notification exists on page  
**Steps:**
1. Click "Tandai Dibaca" button
2. Wait for API response

**Expected Result:**
- Button disappears
- is_read flag set to true
- Auto-mark all on page load

**Pass Criteria:** ✅ Notification status updated

---

## SCENARIO 15: Error Handling & Edge Cases

### Test Case 15.1: Handle Network Timeout
**Objective:** Verify timeout graceful handling  
**Precondition:** Slow/unstable network  
**Steps:**
1. Perform any API-heavy operation
2. Network becomes unavailable
3. Wait for timeout

**Expected Result:**
- Spinner eventually stops
- Error message displayed (not generic error)
- Retry button available
- Form preserved (data not lost)

**Pass Criteria:** ✅ Timeout handled gracefully

---

### Test Case 15.2: Nonexistent Report ID
**Objective:** Verify 404 handling  
**Precondition:** Navigate to LaporanDetail with invalid ID  
**Steps:**
1. Go to /laporan/invalid-uuid
2. Wait for API response

**Expected Result:**
- Alert: "Laporan tidak ditemukan"
- Redirect to /laporan after 2 seconds
- No error console logs

**Pass Criteria:** ✅ 404 handled gracefully

---

## SUMMARY OF TEST SCENARIOS

| Scenario # | Description | Priority | Est. Time |
|-----------|-------------|----------|-----------|
| 1 | Registration & Email Validation | Critical | 10 min |
| 2 | Login & Role-Based Redirect | Critical | 10 min |
| 3 | Create Laporan & Location Validation | Critical | 15 min |
| 4 | Upvote & Access Control | High | 10 min |
| 5 | Admin Status Update | High | 15 min |
| 6 | Profile Update & Validation | High | 10 min |
| 7 | Feedback Submission | Medium | 10 min |
| 8 | Upload Bukti Selesai | High | 10 min |
| 9 | Kendala Reporting | Medium | 10 min |
| 10 | Duplicate Detection & Merge | Medium | 15 min |
| 11 | Dashboard & Analytics | Medium | 10 min |
| 12 | Real-Time Updates | High | 10 min |
| 13 | Security & Role Isolation | Critical | 15 min |
| 14 | Notifications | Medium | 10 min |
| 15 | Error Handling | High | 10 min |

**Total Estimated Test Time:** ~2.5-3 hours  
**Total Test Cases:** 45+

---

*End of Detailed Test Scenarios*  
*Ready for QA Execution*
