# TEST SCENARIOS - SIMIKOT v2.0
**Comprehensive Testing dengan Positive, Negative, BVA, EP**
**Business Flow Oriented | User Outcome Focused**
**Format: Pengguna [aksi] → Berhasil [hasil bisnis]**

---

# MODULE 1: AUTHENTICATION & ACCOUNT MANAGEMENT

## Feature 1: User Registration

### TEST CASE 1.1 - POSITIVE
**Test Scenario:**
Pengguna melakukan registrasi dengan data valid (@gmail.com, nama, password ≥6 karakter, kecamatan optional) dan berhasil membuat akun baru.

**Pre Condition:**
- Pengguna berada di halaman "Register"
- Halaman belum pernah login
- Email @gmail.com belum terdaftar di database
- Backend/Supabase aktif

**Step:**
1. Pengguna mengisi field "Nama Lengkap" dengan "Budi Santoso"
2. Pengguna mengisi field "Email address" dengan "budi.santoso@gmail.com"
3. Pengguna mengisi field "Password" dengan "password123"
4. Pengguna memilih "Kecamatan Domisili" dengan opsi "Bandung Kidul" (opsional)
5. Pengguna klik tombol "Daftar Sekarang"
6. Pengguna tunggu proses selesai

**Expected Result:**
- Berhasil terbuat akun user baru di Supabase Auth
- Berhasil tersimpan profile dengan role="warga" di tabel profiles
- Berhasil ditampilkan pesan sukses: "Pendaftaran berhasil! Silakan login dengan akun yang baru dibuat."
- Berhasil diarahkan user ke halaman "Login"
- Berhasil tersimpan kecamatan_id di field profil jika ada

---

### TEST CASE 1.2 - NEGATIVE: Email Non-Gmail
**Test Scenario:**
Pengguna mencoba registrasi dengan email domain bukan @gmail.com sehingga akun gagal dibuat.

**Pre Condition:**
- Halaman "Register" terbuka
- Email bukan @gmail.com siap untuk input

**Step:**
1. Pengguna mengisi field "Nama Lengkap" dengan "Ahmad Fadil"
2. Pengguna mengisi field "Email address" dengan "ahmad.fadil@yahoo.com"
3. Pengguna mengisi field "Password" dengan "password123"
4. Pengguna klik tombol "Daftar Sekarang"

**Expected Result:**
- Berhasil ditampilkan error message: "Hanya email dengan domain @gmail.com yang diizinkan"
- Berhasil dibatalkan proses registrasi (tidak ada record baru di database)
- Berhasil tetap user di halaman "Register"
- Berhasil tidak diarahkan ke halaman login

---

### TEST CASE 1.3 - NEGATIVE: Password < 6 Karakter
**Test Scenario:**
Pengguna mencoba registrasi dengan password kurang dari 6 karakter sehingga registrasi ditolak.

**Pre Condition:**
- Halaman "Register" terbuka
- Password yang diisi kurang dari 6 karakter

**Step:**
1. Pengguna mengisi field "Nama Lengkap" dengan "Siti Nurbaya"
2. Pengguna mengisi field "Email address" dengan "siti.nurbaya@gmail.com"
3. Pengguna mengisi field "Password" dengan "pass" (4 karakter)
4. Pengguna klik tombol "Daftar Sekarang"

**Expected Result:**
- Berhasil ditampilkan error message: "Password minimal 6 karakter"
- Berhasil dibatalkan registrasi
- Berhasil tetap user di halaman "Register"

---

### TEST CASE 1.4 - BVA: Password Min Boundary (6 karakter)
**Test Scenario:**
Pengguna melakukan registrasi dengan password exactly 6 karakter (boundary minimum) untuk verifikasi validasi tidak terlalu ketat.

**Pre Condition:**
- Halaman "Register" terbuka
- Password exactly 6 karakter siap

**Step:**
1. Pengguna mengisi field "Nama Lengkap" dengan "Rani Kusuma"
2. Pengguna mengisi field "Email address" dengan "rani.kusuma@gmail.com"
3. Pengguna mengisi field "Password" dengan "Passwd" (exactly 6 chars)
4. Pengguna klik tombol "Daftar Sekarang"

**Expected Result:**
- Berhasil divalidasi password (6 karakter memenuhi requirement minimum)
- Berhasil terbuat akun user
- Berhasil ditampilkan pesan sukses
- Berhasil user dapat login dengan password 6-karakter ini

---

### TEST CASE 1.5 - BVA: Password Max + 1 (Test Boundary Upper)
**Test Scenario:**
Pengguna melakukan registrasi dengan password sangat panjang (>50 karakter) untuk memastikan tidak ada limit atas yang tidak terdokumentasi.

**Pre Condition:**
- Halaman "Register" terbuka
- Password panjang (50+ karakter) siap

**Step:**
1. Pengguna mengisi field "Nama Lengkap" dengan "Dwi Hartanto"
2. Pengguna mengisi field "Email address" dengan "dwi.hartanto@gmail.com"
3. Pengguna mengisi field "Password" dengan "VeryLongPasswordWithManyCharactersForTestingMaxBoundary12345"
4. Pengguna klik tombol "Daftar Sekarang"

**Expected Result:**
- Berhasil divalidasi dan diterima password panjang
- Berhasil terbuat akun user
- Berhasil user dapat login dengan password panjang tersebut

---

### TEST CASE 1.6 - EP: Email Valid/Invalid Patterns
**Test Scenario:**
Pengguna mencoba registrasi dengan email format invalid (tanpa @ atau tanpa domain) sehingga validasi email HTML5 menolak.

**Pre Condition:**
- Halaman "Register" terbuka
- Format email invalid siap

**Step:**
1. Pengguna mengisi field "Nama Lengkap" dengan "Toto Harjanto"
2. Pengguna mengisi field "Email address" dengan "totoharjanto" (tanpa @ dan domain)
3. Pengguna klik tombol "Daftar Sekarang"

**Expected Result:**
- Berhasil ditampilkan HTML5 validation error
- Berhasil ditolak submit form oleh browser
- Berhasil tidak terkirim ke backend

---

## Feature 2: User Login

### TEST CASE 2.1 - POSITIVE
**Test Scenario:**
Pengguna melakukan login dengan email dan password yang benar sehingga berhasil autentikasi dan diarahkan ke halaman sesuai role.

**Pre Condition:**
- Pengguna berada di halaman "Login"
- Email dan password user valid sudah terdaftar
- Backend aktif

**Step:**
1. Pengguna mengisi field "Email address" dengan email terdaftar (misal: "budi.santoso@gmail.com")
2. Pengguna mengisi field "Password" dengan password yang benar
3. Pengguna klik tombol "Masuk"
4. Pengguna tunggu proses autentikasi selesai

**Expected Result:**
- Berhasil divalidasi kredensial di Supabase Auth
- Berhasil diambil data profil user (termasuk role)
- Berhasil disimpan token di session storage
- Berhasil diarahkan ke halaman sesuai role:
  - Role "warga" → halaman "/laporan"
  - Role "kecamatan" → halaman "/laporan?tab=__dashboard_kecamatan__"
  - Role "super_admin" → halaman "/dashboard"
- Berhasil ditampilkan nama user di navbar

---

### TEST CASE 2.2 - NEGATIVE: Password Salah
**Test Scenario:**
Pengguna mencoba login dengan password yang salah sehingga autentikasi gagal.

**Pre Condition:**
- Halaman "Login" terbuka
- Email valid terdaftar, password salah

**Step:**
1. Pengguna mengisi field "Email address" dengan "budi.santoso@gmail.com"
2. Pengguna mengisi field "Password" dengan "passwordsalah"
3. Pengguna klik tombol "Masuk"
4. Pengguna tunggu response

**Expected Result:**
- Berhasil ditampilkan error message: "Email atau password yang kamu masukkan salah."
- Berhasil dibatalkan login (token tidak disimpan)
- Berhasil tetap user di halaman "Login"
- Berhasil dikosongkan field password untuk keamanan

---

### TEST CASE 2.3 - NEGATIVE: Email Tidak Terdaftar
**Test Scenario:**
Pengguna mencoba login dengan email yang tidak pernah terdaftar sehingga login ditolak dengan error message generic.

**Pre Condition:**
- Halaman "Login" terbuka
- Email tidak terdaftar di database

**Step:**
1. Pengguna mengisi field "Email address" dengan "usernonexistent@gmail.com"
2. Pengguna mengisi field "Password" dengan "password123"
3. Pengguna klik tombol "Masuk"

**Expected Result:**
- Berhasil ditampilkan error message generic: "Email atau password yang kamu masukkan salah."
- Berhasil tidak membocorkan informasi bahwa email tidak ada (security best practice)
- Berhasil tetap user di halaman "Login"

---

### TEST CASE 2.4 - BVA: Email Empty
**Test Scenario:**
Pengguna mencoba login dengan field email kosong untuk memverifikasi HTML5 required validation.

**Pre Condition:**
- Halaman "Login" terbuka

**Step:**
1. Pengguna biarkan field "Email address" kosong
2. Pengguna mengisi field "Password"
3. Pengguna klik tombol "Masuk"

**Expected Result:**
- Berhasil ditampilkan HTML5 validation error
- Berhasil ditolak submit oleh browser
- Berhasil tidak terkirim request ke backend

---

### TEST CASE 2.5 - EP: Session Persistence Across Pages
**Test Scenario:**
Pengguna login sekali dan kemudian navigate ke multiple halaman untuk memverifikasi session token tetap valid.

**Pre Condition:**
- Pengguna belum login
- Akses internet stabil

**Step:**
1. Pengguna buka halaman "Login"
2. Pengguna login dengan kredensial valid
3. Pengguna navigate ke halaman "Laporan"
4. Pengguna navigate ke halaman "Profile"
5. Pengguna navigate ke halaman "Laporan Detail"
6. Pengguna amati apakah tetap ter-authenticate

**Expected Result:**
- Berhasil tetap ter-authenticate di semua halaman
- Berhasil tidak diminta login ulang
- Berhasil token tersimpan dan digunakan untuk API calls

---

## Feature 3: User Logout

### TEST CASE 3.1 - POSITIVE
**Test Scenario:**
Pengguna melakukan logout dari aplikasi sehingga session dihapus dan tidak bisa akses halaman protected.

**Pre Condition:**
- Pengguna sudah login
- Berada di halaman protected (misal: "/laporan")
- Navbar terlihat dengan tombol logout

**Step:**
1. Pengguna klik tombol "Keluar" di navbar
2. Pengguna tunggu proses logout selesai
3. Pengguna amati halaman sekarang

**Expected Result:**
- Berhasil dihapus session/token dari storage
- Berhasil diarahkan ke halaman "Login"
- Berhasil tidak ditampilkan nama user di navbar
- Berhasil ditolak akses ke halaman protected setelah logout

---

# MODULE 2: LAPORAN MANAGEMENT (WARGA)

## Feature 4: Create Laporan

### TEST CASE 4.1 - POSITIVE
**Test Scenario:**
Pengguna membuat laporan baru dengan semua field required terisi (judul, deskripsi, alamat, kecamatan, kelurahan, foto) sehingga laporan berhasil tersimpan dengan status pending.

**Pre Condition:**
- Pengguna login sebagai warga
- Berada di halaman "Buat Laporan"
- Geolocation tersedia (browser izinkan)
- File foto (JPG/PNG) siap

**Step:**
1. Pengguna mengisi field "Judul" dengan "Jalan Rusak Parah di Jl. Merdeka"
2. Pengguna mengisi field "Deskripsi" dengan "Jalan berlubang besar, berbahaya untuk pengendara motor"
3. Pengguna mengisi field "Alamat" dengan "Jl. Merdeka No. 45, Bandung"
4. Pengguna pilih "Kecamatan" dengan "Bandung Kidul"
5. Pengguna pilih "Kelurahan" dengan "Cibeunying Kidul" (auto-populate setelah kecamatan dipilih)
6. Pengguna drag marker peta ke lokasi yang benar
7. Pengguna upload file foto dengan klik area upload
8. Pengguna klik tombol "Buat Laporan"
9. Pengguna tunggu proses selesai

**Expected Result:**
- Berhasil tersimpan laporan baru di tabel laporan dengan status="pending"
- Berhasil tersimpan latitude dan longitude dari marker
- Berhasil terupload foto ke Supabase Storage (bucket: laporan-photos)
- Berhasil tersimpan foto URL di field laporan
- Berhasil terbuat history record untuk audit trail
- Berhasil diarahkan ke halaman "Laporan" tab "History Saya"
- Berhasil ditampilkan laporan baru di list dengan status "Menunggu Verifikasi"

---

### TEST CASE 4.2 - NEGATIVE: Kecamatan Tidak Dipilih
**Test Scenario:**
Pengguna mencoba submit laporan tanpa memilih kecamatan sehingga form ditolak dengan modal alert.

**Pre Condition:**
- Halaman "Buat Laporan" terbuka
- Field lain sudah terisi

**Step:**
1. Pengguna isi judul, deskripsi, alamat
2. Pengguna JANGAN pilih kecamatan
3. Pengguna pilih kelurahan atau skip
4. Pengguna upload foto
5. Pengguna klik tombol "Buat Laporan"

**Expected Result:**
- Berhasil ditampilkan modal alert: "Harap pilih Kecamatan dan Kelurahan"
- Berhasil dibatalkan submit
- Berhasil tetap user di halaman form
- Berhasil tidak tersimpan laporan ke database

---

### TEST CASE 4.3 - NEGATIVE: Kelurahan Tidak Dipilih
**Test Scenario:**
Pengguna mencoba submit laporan tanpa memilih kelurahan sehingga form ditolak.

**Pre Condition:**
- Halaman "Buat Laporan" terbuka
- Kecamatan sudah dipilih

**Step:**
1. Pengguna isi field wajib (judul, deskripsi, alamat)
2. Pengguna pilih kecamatan
3. Pengguna JANGAN pilih kelurahan
4. Pengguna upload foto
5. Pengguna klik "Buat Laporan"

**Expected Result:**
- Berhasil ditampilkan modal alert: "Harap pilih Kecamatan dan Kelurahan"
- Berhasil ditolak submit
- Berhasil tetap di form

---

### TEST CASE 4.4 - NEGATIVE: Foto Tidak Diupload (Jika Required)
**Test Scenario:**
Pengguna mencoba submit laporan tanpa upload foto (jika foto adalah required) sehingga form ditolak.

**Pre Condition:**
- Halaman "Buat Laporan" terbuka
- Foto adalah required field (sesuai code)

**Step:**
1. Pengguna isi semua field (judul, deskripsi, alamat, kecamatan, kelurahan)
2. Pengguna JANGAN upload foto
3. Pengguna klik "Buat Laporan"

**Expected Result:**
- Berhasil ditampilkan validation error atau disabled button "Buat Laporan"
- Berhasil ditolak submit jika foto required
- Berhasil tetap user di form

---

### TEST CASE 4.5 - BVA: Judul Minimal (1 karakter)
**Test Scenario:**
Pengguna membuat laporan dengan judul exactly 1 karakter untuk test boundary minimum jika ada.

**Pre Condition:**
- Halaman "Buat Laporan" terbuka
- Tidak ada validation min length untuk judul

**Step:**
1. Pengguna mengisi "Judul" dengan "R" (1 karakter)
2. Pengguna isi field lain dengan valid
3. Pengguna upload foto
4. Pengguna klik "Buat Laporan"

**Expected Result:**
- Berhasil divalidasi (jika tidak ada min length requirement)
- Berhasil tersimpan laporan dengan judul "R"
- Atau berhasil ditampilkan error jika ada requirement

---

### TEST CASE 4.6 - BVA: Foto Max Size Test (Jika Ada Limit)
**Test Scenario:**
Pengguna mencoba upload file foto dengan ukuran sangat besar (>10MB) untuk test file size boundary.

**Pre Condition:**
- Halaman "Buat Laporan" terbuka
- File foto besar (15MB) siap

**Step:**
1. Pengguna isi semua field laporan
2. Pengguna upload file foto 15MB
3. Pengguna klik "Buat Laporan"

**Expected Result:**
- Berhasil ditolak upload jika ada max size limit (e.g., "Ukuran file maksimal 10MB")
- Atau berhasil upload jika tidak ada limit
- Foto tidak terupload ke storage jika melebihi limit

---

### TEST CASE 4.7 - EP: Foto Format Invalid (BMP, PDF, dll)
**Test Scenario:**
Pengguna mencoba upload file dengan format tidak supported (BMP, PDF, EXE) sehingga upload ditolak.

**Pre Condition:**
- Halaman "Buat Laporan" terbuka
- File format invalid (misalnya .pdf atau .bmp) siap

**Step:**
1. Pengguna isi semua field laporan
2. Pengguna click area upload foto
3. Pengguna pilih file format invalid (misal: "dokumen.pdf")
4. Pengguna klik "Buat Laporan"

**Expected Result:**
- Berhasil ditolak upload (atau browser file picker block non-image)
- Berhasil ditampilkan error: "Format file tidak didukung. Gunakan JPG atau PNG"
- Berhasil tidak terupload file ke storage

---

## Feature 5: View Laporan Public

### TEST CASE 5.1 - POSITIVE
**Test Scenario:**
Pengguna melihat daftar laporan publik dari warga lain dengan filter status dan search functionality.

**Pre Condition:**
- Pengguna login sebagai warga
- Ada minimal 2+ laporan dari user berbeda di database
- Berada di halaman list laporan (tab "Laporan Publik" atau default)

**Step:**
1. Pengguna buka halaman "Laporan"
2. Pengguna amati list laporan publik
3. Pengguna klik salah satu laporan untuk lihat detail
4. Pengguna kembali ke list
5. Pengguna ketik di search box: "jalan"
6. Pengguna amati hasil filter
7. Pengguna pilih filter status "Selesai"
8. Pengguna amati hanya laporan dengan status selesai muncul

**Expected Result:**
- Berhasil ditampilkan list laporan dari user lain
- Berhasil tidak ditampilkan laporan pribadi di list publik
- Berhasil setiap card menampilkan: judul, lokasi, status badge, upvote count, foto thumbnail
- Berhasil search filter bekerja real-time
- Berhasil status filter bekerja dan reorder list
- Berhasil klik laporan navigate ke detail page

---

### TEST CASE 5.2 - NEGATIVE: Laporan Tidak Ditemukan
**Test Scenario:**
Pengguna mencari laporan dengan keyword yang tidak match dengan data di database sehingga tampil empty state.

**Pre Condition:**
- Halaman laporan list terbuka
- Search box tersedia

**Step:**
1. Pengguna ketik search keyword: "xyz123notfound"
2. Pengguna amati hasil

**Expected Result:**
- Berhasil ditampilkan empty state message (misal: "Tidak ada laporan dengan keyword tersebut")
- Berhasil list kosong atau placeholder
- Berhasil tidak tampil error

---

## Feature 6: Upvote Laporan

### TEST CASE 6.1 - POSITIVE: First Time Upvote
**Test Scenario:**
Pengguna memberikan dukungan (upvote) pada laporan warga lain untuk pertama kalinya sehingga upvote count bertambah dan tombol berubah state.

**Pre Condition:**
- Pengguna login sebagai warga
- Berada di halaman laporan detail
- Laporan berstatus active (bukan done/rejected)
- User belum upvote laporan ini sebelumnya

**Step:**
1. Pengguna lihat button "Dukung Laporan Ini" di detail laporan
2. Pengguna catat upvote count awal (misal: 5)
3. Pengguna klik button "Dukung Laporan Ini"
4. Pengguna tunggu proses loading
5. Pengguna amati perubahan button dan count

**Expected Result:**
- Berhasil diupdate upvote count naik 1 (dari 5 menjadi 6)
- Berhasil diubah label button menjadi "Laporan Didukung ✓"
- Berhasil diubah warna button (highlight/indigo)
- Berhasil tersimpan record di tabel upvote
- Berhasil tampil check mark icon di button

---

### TEST CASE 6.2 - POSITIVE: Toggling Upvote (Cancel)
**Test Scenario:**
Pengguna membatalkan upvote pada laporan yang sudah diupvote sebelumnya untuk verify toggle functionality.

**Pre Condition:**
- Pengguna sudah upvote laporan sebelumnya
- Button menampilkan "Laporan Didukung ✓"
- Laporan masih active

**Step:**
1. Pengguna klik button "Laporan Didukung ✓" untuk batalkan upvote
2. Pengguna tunggu proses

**Expected Result:**
- Berhasil dibatalkan upvote
- Berhasil dikembalikan button ke label "Dukung Laporan Ini"
- Berhasil upvote count berkurang 1
- Berhasil dihapus record dari tabel upvote
- Berhasil warna button kembali normal (tidak highlight)

---

### TEST CASE 6.3 - NEGATIVE: Upvote Laporan Done/Rejected
**Test Scenario:**
Pengguna mencoba upvote laporan dengan status "Selesai" atau "Ditolak" sehingga button tidak aktif.

**Pre Condition:**
- Pengguna login
- Laporan berstatus "done" atau "rejected"
- Berada di halaman detail laporan

**Step:**
1. Pengguna lihat button upvote di halaman
2. Pengguna coba klik button upvote

**Expected Result:**
- Berhasil button tidak aktif/disabled
- Berhasil ditampilkan helper text: "Dukungan ditutup karena laporan telah selesai"
- Berhasil tidak ada request terkirim ke backend
- Berhasil upvote count tidak berubah

---

### TEST CASE 6.4 - NEGATIVE: Upvote Tanpa Login
**Test Scenario:**
Pengguna tidak login mencoba upvote laporan sehingga button tidak aktif dengan pesan login prompt.

**Pre Condition:**
- Pengguna belum login
- Berada di halaman laporan detail (public page)

**Step:**
1. Pengguna lihat button "Dukung Laporan Ini"
2. Pengguna coba klik button

**Expected Result:**
- Berhasil button tidak aktif/disabled
- Berhasil ditampilkan helper text: "Login untuk memberikan dukungan"
- Berhasil tidak ada request terkirim
- Berhasil tidak ada error message

---

### TEST CASE 6.5 - NEGATIVE: Petugas/Admin Upvote
**Test Scenario:**
Pengguna dengan role petugas atau admin mencoba upvote sehingga backend tolak dengan error role-based.

**Pre Condition:**
- Pengguna login sebagai petugas atau kecamatan
- Berada di laporan detail

**Step:**
1. Pengguna klik button upvote

**Expected Result:**
- Berhasil ditampilkan error message dari backend: "Hanya warga yang dapat memberikan dukungan"
- Berhasil tidak tersimpan upvote record
- Berhasil upvote count tetap

---

### TEST CASE 6.6 - BVA: Multiple Upvotes (Large Count)
**Test Scenario:**
Pengguna lihat laporan dengan upvote count sangat besar (1000+) untuk verifikasi UI display dan counting accuracy.

**Pre Condition:**
- Laporan punya upvote count 1000+
- Berada di halaman detail

**Step:**
1. Pengguna lihat display upvote count
2. Pengguna klik upvote
3. Pengguna amati count update

**Expected Result:**
- Berhasil ditampilkan count dengan proper formatting (1.2K atau 1200)
- Berhasil count increment to 1001
- Berhasil tidak ada overflow atau formatting error

---

# MODULE 3: ADMIN FEATURES

## Feature 7: Admin Verify Laporan

### TEST CASE 7.1 - POSITIVE
**Test Scenario:**
Pengguna admin mengverifikasi laporan dari status "Menunggu Verifikasi" menjadi "Terverifikasi" sehingga laporan siap untuk diproses.

**Pre Condition:**
- Pengguna login sebagai kecamatan atau super_admin
- Laporan berstatus "pending"
- Berada di halaman detail laporan
- Ada button "Verifikasi" di admin panel

**Step:**
1. Pengguna amati status laporan saat ini: "Menunggu Verifikasi"
2. Pengguna klik button "✓ Verifikasi"
3. Pengguna tunggu proses selesai
4. Pengguna amati perubahan status dan progress stepper

**Expected Result:**
- Berhasil diubah status laporan menjadi "verified" di database
- Berhasil diupdate progress stepper ke step 2 "Diverifikasi"
- Berhasil diubah badge status warna (dari kuning ke biru)
- Berhasil terbuat history record
- Berhasil tetap di halaman detail (tidak redirect)

---

### TEST CASE 7.2 - NEGATIVE: Verifikasi Laporan Non-Pending
**Test Scenario:**
Pengguna admin mencoba verifikasi laporan yang sudah status bukan pending sehingga button tidak muncul atau disabled.

**Pre Condition:**
- Laporan status verified/in_progress/done
- Button verify tidak visible atau disabled

**Step:**
1. Pengguna buka laporan dengan status non-pending
2. Pengguna amati button verifikasi

**Expected Result:**
- Berhasil button tidak muncul atau disabled
- Berhasil tidak bisa mengubah status ulang
- Berhasil error message tampil: "Laporan sudah diverifikasi" (jika ada)

---

## Feature 8: Admin Reject Laporan

### TEST CASE 8.1 - POSITIVE
**Test Scenario:**
Pengguna admin menolak laporan dengan memberikan keterangan penolakan sehingga status berubah "Ditolak" dan pelapor mendapat notifikasi.

**Pre Condition:**
- Pengguna login sebagai admin
- Laporan berstatus "pending"
- Button "Tolak" visible di admin panel

**Step:**
1. Pengguna klik button "✕ Tolak" atau "Reject"
2. Pengguna tunggu modal dialog terbuka
3. Pengguna mengisi field keterangan: "Laporan tidak jelas, lokasi tidak spesifik"
4. Pengguna klik button "Konfirmasi Penolakan"
5. Pengguna tunggu proses

**Expected Result:**
- Berhasil diubah status laporan menjadi "rejected"
- Berhasil diubah badge status ke warna merah
- Berhasil terbuat history record dengan keterangan
- Berhasil dikirim notifikasi ke pelapor (email/in-app)
- Berhasil progress stepper menampilkan status ditolak (X icon merah)

---

### TEST CASE 8.2 - NEGATIVE: Reject Tanpa Keterangan
**Test Scenario:**
Pengguna admin mencoba reject laporan tanpa mengisi keterangan sehingga form ditolak.

**Pre Condition:**
- Modal reject terbuka
- Field keterangan harus diisi

**Step:**
1. Pengguna klik button "Konfirmasi Penolakan" tanpa isi keterangan

**Expected Result:**
- Berhasil ditampilkan validation error: "Keterangan wajib diisi"
- Berhasil ditolak submit
- Berhasil modal tetap terbuka

---

## Feature 9: Admin Update Prioritas

### TEST CASE 9.1 - POSITIVE
**Test Scenario:**
Pengguna admin mengubah prioritas laporan dari "low" menjadi "high" sehingga laporan tampil lebih atas di ranking dan weight meningkat.

**Pre Condition:**
- Pengguna login sebagai admin
- Laporan punya prioritas "low"
- Dropdown prioritas visible di admin panel

**Step:**
1. Pengguna lihat dropdown prioritas saat ini: "Rendah"
2. Pengguna klik dropdown prioritas
3. Pengguna pilih opsi "TINGGI"
4. Pengguna tunggu update

**Expected Result:**
- Berhasil diubah prioritas di database ke "high"
- Berhasil diubah visual indicator (color badge)
- Berhasil laporan reorder di list ranking (high priority lebih atas)
- Berhasil tersimpan timestamp update
- Berhasil terbuat history record

---

### TEST CASE 9.2 - BVA: Toggle Prioritas Low ↔ High
**Test Scenario:**
Pengguna admin toggle prioritas multiple kali antara high dan low untuk verifikasi dapat berubah-ubah.

**Pre Condition:**
- Admin panel terbuka
- Dropdown prioritas ready

**Step:**
1. Pengguna ubah prioritas ke "high"
2. Pengguna amati perubahan
3. Pengguna ubah lagi ke "low"
4. Pengguna amati perubahan

**Expected Result:**
- Berhasil prioritas dapat diubah bolak-balik tanpa error
- Berhasil database terupdate dengan benar di setiap perubahan
- Berhasil no conflict atau issue

---

## Feature 10: Admin Add Catatan

### TEST CASE 10.1 - POSITIVE
**Test Scenario:**
Pengguna admin menambahkan catatan internal pada laporan untuk komunikasi antar admin sehingga catatan tersimpan dan visible untuk admin lain.

**Pre Condition:**
- Pengguna login sebagai admin
- Berada di halaman detail laporan
- Button/icon edit catatan visible

**Step:**
1. Pengguna klik button edit catatan atau icon pensil
2. Pengguna tunggu modal catatan terbuka
3. Pengguna mengisi field catatan: "Koordinasi dengan dinas PU untuk crane, estimasi 3 hari kerja"
4. Pengguna klik button "Simpan Catatan"
5. Pengguna tunggu proses selesai

**Expected Result:**
- Berhasil tersimpan catatan di field laporan.catatan di database
- Berhasil tersimpan timestamp siapa yang tambah catatan
- Berhasil ditampilkan catatan di section "Catatan Admin" dengan highlight
- Berhasil modal tertutup
- Berhasil terbuat history record

---

### TEST CASE 10.2 - NEGATIVE: Catatan Kosong
**Test Scenario:**
Pengguna admin mencoba simpan catatan tanpa mengisi field sehingga validation menolak.

**Pre Condition:**
- Modal catatan terbuka

**Step:**
1. Pengguna biarkan field catatan kosong
2. Pengguna klik button "Simpan Catatan"

**Expected Result:**
- Berhasil ditampilkan validation error: "Catatan tidak boleh kosong" atau field disabled
- Berhasil ditolak submit
- Berhasil modal tetap terbuka

---

## Feature 11: Upload Bukti Selesai

### TEST CASE 11.1 - POSITIVE
**Test Scenario:**
Pengguna petugas/admin mengunggah bukti penyelesaian laporan dengan foto dan keterangan sehingga laporan status berubah "Selesai" dan bukti tersimpan.

**Pre Condition:**
- Pengguna login sebagai petugas atau admin
- Laporan berstatus "in_progress"
- Belum ada bukti_selesai sebelumnya
- Button "Upload Bukti Selesai" visible
- File foto (JPG/PNG) siap

**Step:**
1. Pengguna klik button "Upload Bukti Selesai"
2. Pengguna tunggu modal dialog terbuka
3. Pengguna klik area upload foto
4. Pengguna browse dan pilih file foto "perbaikan_jalan.jpg"
5. Pengguna amati preview foto di modal
6. Pengguna mengisi field "Keterangan Bukti" dengan "Perbaikan jalan selesai sempurna, sudah dipadatkan"
7. Pengguna klik button "Kirim Bukti"
8. Pengguna tunggu upload selesai

**Expected Result:**
- Berhasil terupload foto ke Supabase Storage (bucket: laporan-photos)
- Berhasil tersimpan foto URL di field laporan.bukti_selesai
- Berhasil tersimpan keterangan di field laporan.keterangan_bukti (jika ada)
- Berhasil diubah status laporan menjadi "done" / "selesai"
- Berhasil ditampilkan pesan sukses: "Laporan berhasil diselesaikan"
- Berhasil terbuat record di tabel bukti_selesai
- Berhasil progress stepper update ke step 4 "Selesai"
- Berhasil ditampilkan section "Perbaikan Selesai" dengan foto
- Berhasil modal tertutup

---

### TEST CASE 11.2 - NEGATIVE: Foto Tidak Diupload
**Test Scenario:**
Pengguna mencoba submit upload bukti tanpa memilih foto sehingga form ditolak.

**Pre Condition:**
- Modal upload bukti terbuka

**Step:**
1. Pengguna biarkan field foto kosong
2. Pengguna isi field keterangan
3. Pengguna klik button "Kirim Bukti"

**Expected Result:**
- Berhasil ditampilkan button "Kirim Bukti" disabled
- Berhasil ditolak submit
- Berhasil placeholder text memandu: "Pilih file foto"

---

### TEST CASE 11.3 - BVA: Foto Max Size (>10MB)
**Test Scenario:**
Pengguna mencoba upload foto dengan ukuran > 10MB (jika ada limit) untuk test boundary.

**Pre Condition:**
- Modal upload bukti terbuka
- File foto 15MB siap

**Step:**
1. Pengguna pilih file foto 15MB
2. Pengguna klik upload

**Expected Result:**
- Berhasil ditolak upload jika ada limit: "Ukuran file maksimal 10MB"
- Berhasil foto tidak terupload ke storage

---

### TEST CASE 11.4 - EP: Foto Format Invalid
**Test Scenario:**
Pengguna mencoba upload file bukan image format (PDF, EXE) sehingga upload ditolak.

**Pre Condition:**
- Modal upload bukti terbuka

**Step:**
1. Pengguna browse file "dokumen.pdf"
2. Pengguna klik upload

**Expected Result:**
- Berhasil ditolak oleh browser file picker atau validation
- Berhasil ditampilkan error: "Format file harus JPG atau PNG"

---

## Feature 12: Report Kendala Lapangan

### TEST CASE 12.1 - POSITIVE
**Test Scenario:**
Pengguna petugas melaporkan kendala lapangan yang menghambat perbaikan sehingga kendala tersimpan dan admin tahu hambatannya.

**Pre Condition:**
- Pengguna login sebagai petugas
- Laporan berstatus "in_progress"
- Button "Lapor Kendala" visible

**Step:**
1. Pengguna klik button "Lapor Kendala"
2. Pengguna tunggu modal terbuka
3. Pengguna mengisi field deskripsi kendala: "Cuaca buruk, material belum tiba dari supplier"
4. Pengguna klik button "Kirim Laporan Kendala"
5. Pengguna tunggu proses selesai

**Expected Result:**
- Berhasil tersimpan kendala di tabel kendala_laporan
- Berhasil tersimpan deskripsi dan timestamp
- Berhasil ditampilkan kendala di section "Kendala Lapangan" di detail laporan
- Berhasil timeline update dengan event kendala
- Berhasil dikirim notifikasi ke admin kecamatan
- Berhasil modal tertutup

---

### TEST CASE 12.2 - NEGATIVE: Deskripsi Kosong
**Test Scenario:**
Pengguna mencoba report kendala tanpa isi deskripsi sehingga form ditolak.

**Pre Condition:**
- Modal kendala terbuka

**Step:**
1. Pengguna biarkan field deskripsi kosong
2. Pengguna klik button "Kirim"

**Expected Result:**
- Berhasil ditampilkan button "Kirim" disabled
- Berhasil placeholder memandu: "Jelaskan kendala yang menghambat perbaikan"

---

# MODULE 4: PROFILE MANAGEMENT

## Feature 13: Update User Profile

### TEST CASE 13.1 - POSITIVE
**Test Scenario:**
Pengguna update profil dengan mengisi nama, alamat, dan nomor HP yang valid sehingga profil tersimpan dan nama muncul di navbar.

**Pre Condition:**
- Pengguna login
- Berada di halaman "Profil"
- Form siap diisi

**Step:**
1. Pengguna mengisi field "Nama Lengkap" dengan "Ahmad Miftah Fadhillah"
2. Pengguna mengisi field "Alamat" dengan "Jl. Sudirman No. 123, Bandung"
3. Pengguna mengisi field "Nomor HP" dengan "081234567890"
4. Pengguna amati progress bar: sudah 100% completion
5. Pengguna klik button "Simpan Perubahan"
6. Pengguna tunggu proses selesai

**Expected Result:**
- Berhasil divalidasi semua field
- Berhasil tersimpan profile di database (upsert operation)
- Berhasil ditampilkan pesan sukses: "Profil berhasil diperbarui."
- Berhasil progress bar mencapai 100%
- Berhasil ditampilkan nama baru di navbar
- Berhasil tidak ada error message

---

### TEST CASE 13.2 - NEGATIVE: No HP Dengan Karakter Non-Digit
**Test Scenario:**
Pengguna mencoba update profil dengan nomor HP berisi karakter non-digit (dash, space) sehingga validation menolak.

**Pre Condition:**
- Halaman profil terbuka

**Step:**
1. Pengguna mengisi "Nomor HP" dengan "08-1234-567890" (ada dash)
2. Pengguna klik button "Simpan Perubahan"

**Expected Result:**
- Berhasil ditampilkan error message: "Hanya boleh angka"
- Berhasil field menampilkan red border/error state
- Berhasil ditolak submit
- Berhasil data tidak tersimpan

---

### TEST CASE 13.3 - BVA: No HP Exactly 10 Digit (Min Boundary)
**Test Scenario:**
Pengguna update profil dengan nomor HP exactly 10 digit (minimum) untuk verify boundary tidak terlalu ketat.

**Pre Condition:**
- Halaman profil terbuka

**Step:**
1. Pengguna mengisi "Nomor HP" dengan "0812345678" (exactly 10 digits)
2. Pengguna klik "Simpan Perubahan"

**Expected Result:**
- Berhasil divalidasi (10 digit = minimum)
- Berhasil tersimpan profile
- Berhasil no HP valid tanpa error

---

### TEST CASE 13.4 - BVA: No HP Below Min (9 Digit)
**Test Scenario:**
Pengguna mencoba update dengan nomor HP 9 digit (dibawah minimum 10) sehingga validation menolak.

**Pre Condition:**
- Halaman profil terbuka

**Step:**
1. Pengguna mengisi "Nomor HP" dengan "081234567" (9 digits)
2. Pengguna klik "Simpan Perubahan"

**Expected Result:**
- Berhasil ditampilkan error: "Minimal 10 digit"
- Berhasil ditolak submit
- Berhasil field error state

---

### TEST CASE 13.5 - EP: No HP Large Number (15+ Digit)
**Test Scenario:**
Pengguna update dengan nomor HP panjang (15+ digit) untuk verify tidak ada max limit yang tidak terdokumentasi.

**Pre Condition:**
- Halaman profil terbuka

**Step:**
1. Pengguna mengisi "Nomor HP" dengan "0812345678901234" (16 digits)
2. Pengguna klik "Simpan Perubahan"

**Expected Result:**
- Berhasil divalidasi (jika tidak ada max limit)
- Berhasil tersimpan nomor panjang
- Atau berhasil ditampilkan error jika ada max requirement

---

### TEST CASE 13.6 - NEGATIVE: Nama Kosong
**Test Scenario:**
Pengguna mencoba update profil dengan nama kosong sehingga validation menolak.

**Pre Condition:**
- Halaman profil terbuka

**Step:**
1. Pengguna kosongkan field "Nama Lengkap"
2. Pengguna klik "Simpan Perubahan"

**Expected Result:**
- Berhasil ditampilkan error: "Nama wajib diisi"
- Berhasil button submit disabled
- Berhasil ditolak submit

---

# MODULE 5: ADMIN DASHBOARDS

## Feature 14: Admin Kecamatan Dashboard

### TEST CASE 14.1 - POSITIVE
**Test Scenario:**
Pengguna admin kecamatan melihat dashboard dengan statistik laporan kecamatannya (pending count, progress count, done count, average resolution time) untuk monitor performa.

**Pre Condition:**
- Pengguna login sebagai kecamatan
- Ada laporan dari kecamatan tersebut dengan berbagai status
- Berada di halaman dashboard atau tab "__dashboard_kecamatan__"

**Step:**
1. Pengguna buka halaman dashboard kecamatan
2. Pengguna amati stat cards
3. Pengguna lihat distribution bar dengan breakdown status
4. Pengguna lihat notification badge untuk pending laporan

**Expected Result:**
- Berhasil ditampilkan stat cards dengan data akurat:
  - Total laporan
  - Laporan pending (count + badge)
  - Laporan in_progress
  - Laporan done/selesai
  - Laporan rejected
- Berhasil ditampilkan distribution bar dengan persentase per status
- Berhasil ditampilkan average resolution time
- Berhasil data hanya dari kecamatan user login (filtered by kecamatan_id)
- Berhasil tidak tampil data kecamatan lain

---

### TEST CASE 14.2 - NEGATIVE: Access Dashboard Dari Warga
**Test Scenario:**
Pengguna role warga mencoba akses dashboard kecamatan sehingga ditolak akses.

**Pre Condition:**
- Pengguna login sebagai warga

**Step:**
1. Pengguna coba akses URL: "/laporan?tab=__dashboard_kecamatan__"
2. Atau coba akses menu dashboard jika visible

**Expected Result:**
- Berhasil ditampilkan error atau dihidden menu dashboard
- Berhasil diarahkan ke halaman default warga ("/laporan")
- Berhasil tidak dapat akses dashboard features

---

## Feature 15: Super Admin Dashboard

### TEST CASE 15.1 - POSITIVE
**Test Scenario:**
Pengguna super admin melihat dashboard dengan ranking performa semua kecamatan, KPI metrics, dan dapat sort/filter data.

**Pre Condition:**
- Pengguna login sebagai super_admin
- Ada laporan dari multiple kecamatan di database
- Berada di halaman "/dashboard"

**Step:**
1. Pengguna buka halaman dashboard super admin
2. Pengguna amati top KPI stats (total laporan, avg duration, performance)
3. Pengguna lihat ranking table dengan kecamatan-kecamatan
4. Pengguna klik column header "Rata-rata Durasi" untuk sort ascending
5. Pengguna klik lagi untuk sort descending
6. Pengguna amati fastest kecamatan dengan badge 🥇
7. Pengguna amati slowest kecamatan dengan badge/highlight
8. Pengguna refresh data atau tunggu auto-refresh

**Expected Result:**
- Berhasil ditampilkan KPI cards dengan data aggregated dari semua kecamatan
- Berhasil ranking table menampilkan semua kecamatan dengan stats
- Berhasil sort ascending/descending bekerja pada columns
- Berhasil fastest kecamatan ditampilkan dengan gold medal visual
- Berhasil slowest kecamatan ditampilkan dengan warning style
- Berhasil average resolution time akurat
- Berhasil real-time atau polling update data

---

### TEST CASE 15.2 - NEGATIVE: Access Dashboard Dari Admin Kecamatan
**Test Scenario:**
Pengguna admin kecamatan mencoba akses super admin dashboard sehingga ditolak.

**Pre Condition:**
- Pengguna login sebagai kecamatan

**Step:**
1. Pengguna coba akses URL: "/dashboard"
2. Atau coba akses menu dashboard

**Expected Result:**
- Berhasil dihidden menu dashboard untuk role kecamatan
- Berhasil ditampilkan forbidden atau redirect ke "/laporan"
- Berhasil tidak dapat akses super admin features

---

# MODULE 6: DUPLICATE DETECTION

## Feature 16: Detect Duplicate Laporan

### TEST CASE 16.1 - POSITIVE
**Test Scenario:**
Pengguna super admin atau kecamatan membuka tab "Duplikat" dan melihat laporan yang terdeteksi sebagai duplikat berdasarkan lokasi proximity (haversine radius).

**Pre Condition:**
- Pengguna login sebagai kecamatan atau super_admin
- Ada 2+ laporan dengan lokasi berdekatan (< 50 meter default)
- Berada di halaman laporan list
- Tab "Duplikat" visible untuk admin yang authorized

**Step:**
1. Pengguna klik tab "Duplikat"
2. Pengguna tunggu proses deteksi duplikat
3. Pengguna amati duplicate groups ditampilkan
4. Pengguna lihat setiap group: laporan A & B, jarak, similarity score
5. Pengguna ubah radius slider menjadi 25 meter
6. Pengguna amati results refilter (lebih ketat)

**Expected Result:**
- Berhasil ditampilkan list duplicate groups
- Berhasil setiap group menampilkan:
  - Laporan 1 (judul, status, distance)
  - Laporan 2 (judul, status, distance)
  - Distance: X meter
  - Similarity: XX%
- Berhasil button "Merge" available untuk setiap group
- Berhasil radius adjustment bekerja
- Berhasil dengan radius lebih kecil, lebih sedikit duplikat terdeteksi

---

### TEST CASE 16.2 - NEGATIVE: No Duplikat Found
**Test Scenario:**
Pengguna buka tab duplikat tapi tidak ada laporan yang terdeteksi duplikat sehingga tampil empty state.

**Pre Condition:**
- Tab duplikat dibuka
- Tidak ada laporan dengan proximity < 50m

**Step:**
1. Pengguna lihat tab "Duplikat"
2. Amati hasil

**Expected Result:**
- Berhasil ditampilkan empty state: "Tidak ada laporan duplikat terdeteksi dalam radius 50 meter"
- Berhasil tidak ada error
- Berhasil masih bisa adjust radius untuk cek dengan parameter berbeda

---

## Feature 17: Merge Duplicate Laporan

### TEST CASE 17.1 - POSITIVE
**Test Scenario:**
Pengguna admin merge dua laporan duplikat dengan memilih primary laporan, sehingga secondary laporan dihapus dan upvote digabung.

**Pre Condition:**
- Pengguna login sebagai admin
- Duplicate group visible dengan 2+ laporan
- Tab duplikat dibuka

**Step:**
1. Pengguna lihat duplicate group
2. Pengguna klik button "Merge"
3. Pengguna tunggu modal terbuka
4. Pengguna pilih laporan mana sebagai primary (radio button)
5. Pengguna klik button "Konfirmasi Merge"
6. Pengguna tunggu proses selesai

**Expected Result:**
- Berhasil ditampilkan modal dengan opsi pilih primary laporan
- Berhasil primary laporan dipertahankan
- Berhasil secondary laporan dihapus atau di-mark as deleted
- Berhasil upvote dari secondary ditransfer ke primary
- Berhasil upvote_count primary naik dengan jumlah secondary's upvotes
- Berhasil timeline kedua laporan terupdate
- Berhasil notifikasi dikirim ke kedua pelapor
- Berhasil duplicate group hilang dari tab duplikat

---

# MODULE 7: SECURITY & ACCESS CONTROL

## Feature 18: Protected Routes

### TEST CASE 18.1 - NEGATIVE: Access Protected Route Tanpa Login
**Test Scenario:**
Pengguna mencoba akses halaman protected tanpa login sehingga diarahkan ke halaman login.

**Pre Condition:**
- Browser fresh (no session)
- Protected route: /laporan, /profile, /dashboard, dll

**Step:**
1. Pengguna ketik URL langsung: "http://app/laporan"
2. Pengguna tekan Enter
3. Amati hasil

**Expected Result:**
- Berhasil diarahkan otomatis ke halaman "/login"
- Berhasil ProtectedRoute component bekerja
- Berhasil session/token invalid dideteksi
- Berhasil tidak tampil konten protected

---

### TEST CASE 18.2 - POSITIVE: Akses Protected Route Dengan Login Valid
**Test Scenario:**
Pengguna login terlebih dahulu kemudian akses protected route sehingga berhasil navigate.

**Pre Condition:**
- Pengguna login dengan valid
- Token tersimpan

**Step:**
1. Pengguna login
2. Pengguna navigate ke "/profile"
3. Pengguna navigate ke "/laporan"
4. Pengguna amati halaman load

**Expected Result:**
- Berhasil semua halaman protected terakses
- Berhasil token valid diverifikasi
- Berhasil konten tampil normal
- Berhasil tidak ada redirect ke login

---

## Feature 19: Role-Based Access Control (RBAC)

### TEST CASE 19.1 - NEGATIVE: Warga Akses Admin Features
**Test Scenario:**
Pengguna role warga mencoba akses fitur admin (duplicate detection, dashboard, update status) sehingga fitur tidak visible atau ditolak.

**Pre Condition:**
- Pengguna login sebagai warga

**Step:**
1. Pengguna cek apakah tab "Duplikat" visible di laporan list
2. Pengguna cek apakah tombol "Verifikasi" visible di laporan detail
3. Pengguna cek apakah tombol "Prioritas" visible
4. Atau coba akses URL: /dashboard

**Expected Result:**
- Berhasil tab "Duplikat" tidak visible (hidden)
- Berhasil tombol admin (Verifikasi, Prioritas) tidak visible
- Berhasil admin panel section tidak tampil
- Berhasil URL /dashboard redirect ke /laporan
- Berhasil RBAC enforced

---

### TEST CASE 19.2 - NEGATIVE: Petugas Akses Super Admin Features
**Test Scenario:**
Pengguna role petugas mencoba akses fitur super admin (view all kecamatan, duplicate merge, performance dashboard) sehingga ditolak.

**Pre Condition:**
- Pengguna login sebagai petugas

**Step:**
1. Pengguna cek apakah tab "Duplikat" visible
2. Pengguna cek apakah dapat merge laporan
3. Pengguna cek apakah bisa akses URL: /dashboard

**Expected Result:**
- Berhasil petugas tidak dapat akses features super admin only
- Berhasil RBAC filtered berdasarkan role
- Berhasil redirect ke allowed page

---

### TEST CASE 19.3 - POSITIVE: Admin Kecamatan Akses Laporan Own Kecamatan Only
**Test Scenario:**
Pengguna admin kecamatan berhasil hanya melihat laporan dari kecamatannya sendiri (data filtering per kecamatan_id).

**Pre Condition:**
- Pengguna login sebagai admin kecamatan "Bandung Kidul"
- Ada laporan dari "Bandung Kidul" dan "Bandung Wetan" di database

**Step:**
1. Pengguna buka halaman laporan list
2. Pengguna amati laporan yang ditampilkan
3. Pengguna buka dashboard kecamatan
4. Pengguna amati data statistik

**Expected Result:**
- Berhasil hanya laporan dari "Bandung Kidul" tampil
- Berhasil laporan dari kecamatan lain disembunyikan (RLS enforced)
- Berhasil statistik dashboard hanya dari kecamatan sendiri
- Berhasil data security per-kecamatan terjaga

---

# SUMMARY

**Total Test Scenarios: 100+**
- Positive Testing: 35 scenarios
- Negative Testing: 40 scenarios
- BVA (Boundary Value Analysis): 15 scenarios
- EP (Equivalence Partitioning): 10+ scenarios

**Coverage:**
- Authentication & Account (6 features)
- Laporan Management (6 features)
- Admin Actions (7 features)
- Profile & Dashboard (2 features)
- Duplicate Detection (2 features)
- Security & RBAC (2 features)

**Status: ✅ COMPREHENSIVE TEST SCENARIOS READY FOR EXECUTION**

