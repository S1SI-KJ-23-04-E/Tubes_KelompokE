# COMPREHENSIVE TEST SCENARIOS - SIMIKOT v2.0
## All Pages - Maximal Coverage (EP, BVA, E2E, Functional, Explore)

**Format Standard:**
- (Type) Functional/E2E/BVA/EP/Explore
- Test Case [N]
- (Positive/Negative)
- Test Scenario, Pre Condition, Step, Expected Result

---

# MODULE 1: AUTHENTICATION & AUTHORIZATION

## PAGE: Login.jsx

---

### (Type) Functional

**Test Case 1**

(Positive)

**Test Scenario:**
Pengguna berhasil login dengan email dan password yang valid

**Pre Condition:**
* Pengguna telah membuka halaman Login
* Email sudah terdaftar di database
* Password benar
* Koneksi server aktif

**Step:**
1. Masukkan email yang terdaftar di field "Email address"
2. Masukkan password yang benar di field "Password"
3. Klik tombol "Login"
4. Tunggu loading selesai

**Expected Result:**
* Login berhasil
* User diarahkan ke halaman sesuai role (warga: /laporan, kecamatan: /laporan?tab=__dashboard_kecamatan__, super_admin: /dashboard)
* Token tersimpan di session storage
* Nama user tampil di navbar
* Tidak ada error message

---

### (Type) Functional

**Test Case 2**

(Negative)

**Test Scenario:**
Pengguna gagal login karena password salah

**Pre Condition:**
* Email terdaftar valid
* Password yang diinput salah
* Halaman login terbuka

**Step:**
1. Masukkan email yang terdaftar
2. Masukkan password yang salah
3. Klik tombol "Login"
4. Tunggu response dari server

**Expected Result:**
* Login gagal
* Error message tampil: "Email atau password yang kamu masukkan salah."
* User tetap di halaman Login
* Field password dikosongkan
* Tidak ada redirect

---

### (Type) BVA

**Test Case 3**

(Negative)

**Test Scenario:**
Pengguna gagal login dengan email kosong (boundary case)

**Pre Condition:**
* Halaman login terbuka
* Field email bisa dikosongkan

**Step:**
1. Biarkan field "Email address" kosong
2. Isi field "Password" dengan password apapun
3. Klik tombol "Login"

**Expected Result:**
* HTML5 validation menolak submit
* Error message: "Email wajib diisi" atau equivalent
* Form tidak terkirim ke server
* Tombol login tidak merespons

---

### (Type) BVA

**Test Case 4**

(Negative)

**Test Scenario:**
Pengguna gagal login dengan format email invalid

**Pre Condition:**
* Halaman login terbuka
* Server aktif

**Step:**
1. Masukkan format email yang salah: "notanemail"
2. Isi password dengan apapun
3. Klik tombol "Login"

**Expected Result:**
* HTML5 validation menolak submit
* Error message: "Format email tidak valid"
* Form tidak terkirim
* Fokus tetap di field email

---

### (Type) EP

**Test Case 5**

(Negative)

**Test Scenario:**
Pengguna gagal login dengan email tidak terdaftar

**Pre Condition:**
* Email belum pernah terdaftar di database
* Password format valid
* Server aktif

**Step:**
1. Masukkan email tidak terdaftar: "usernonexistent@gmail.com"
2. Masukkan password apapun
3. Klik tombol "Login"
4. Tunggu response

**Expected Result:**
* Error message: "Email atau password yang kamu masukkan salah." (generic, tidak membedakan)
* User tetap di login page
* Security: error message tidak membocorkan apakah email exist atau tidak

---

### (Type) Functional

**Test Case 6**

(Positive)

**Test Scenario:**
Pengguna berhasil logout dari aplikasi

**Pre Condition:**
* Pengguna sudah login (token ada)
* Berada di halaman yang dilindungi (e.g., /laporan, /profile)
* Navbar terlihat dengan opsi logout

**Step:**
1. Klik tombol "Keluar" di navbar
2. Tunggu proses logout
3. Cek halaman sekarang

**Expected Result:**
* Session/token dihapus
* User diarahkan ke halaman Login
* Navbar tidak lagi menampilkan nama user
* Akses ke protected routes tertolak

---

### (Type) E2E

**Test Case 7**

(Positive)

**Test Scenario:**
User dapat login, navigasi, dan logout dalam satu session lengkap

**Pre Condition:**
* Browser bersih (session baru)
* Email valid terdaftar
* Database aktif

**Step:**
1. Buka halaman login
2. Masukkan credential yang valid
3. Klik tombol Login
4. Tunggu redirect
5. Klik menu "Laporan Publik" atau navigasi ke halaman lain
6. Klik tombol "Keluar"
7. Verify halaman sekarang

**Expected Result:**
* Login success → user di halaman yang benar
* Navigasi berhasil antara halaman protected
* Logout success → redirect ke Login
* Tidak ada error di seluruh flow

---

### (Type) Explore

**Test Case 8**

(Negative)

**Test Scenario:**
Explore akses ke protected routes tanpa login (Security check)

**Pre Condition:**
* Browser fresh (no session)
* Network aktif

**Step:**
1. Langsung akses URL: /laporan (protected route)
2. Atau akses URL: /profile
3. Atau akses URL: /dashboard
4. Observe response

**Expected Result:**
* Browser redirect otomatis ke /login
* ProtectedRoute component bekerja
* Tidak bisa akses protected content tanpa token
* Security working correctly

---

### (Type) Functional

**Test Case 9**

(Negative)

**Test Scenario:**
Pengguna mencoba login dengan password field kosong

**Pre Condition:**
* Halaman login terbuka
* Email sudah diisi

**Step:**
1. Isi field email dengan email valid
2. Biarkan field password kosong
3. Klik tombol "Login"

**Expected Result:**
* HTML5 validation menolak
* Error message: "Password wajib diisi"
* Form tidak terkirim

---

### (Type) Functional

**Test Case 10**

(Positive)

**Test Scenario:**
User login dengan show/hide password toggle

**Pre Condition:**
* Halaman login terbuka
* Email dan password siap diiisi

**Step:**
1. Isi field email
2. Isi field password
3. Klik icon "mata" (eye icon) untuk show password
4. Verify password terlihat
5. Klik icon mata lagi untuk hide password
6. Verify password tersembunyi
7. Klik tombol Login

**Expected Result:**
* Toggle show/hide password berfungsi
* Password visibility berubah sesuai toggle
* Login tetap berhasil setelah toggle

---

## PAGE: Register.jsx

---

### (Type) Functional

**Test Case 11**

(Positive)

**Test Scenario:**
Pengguna berhasil mendaftar dengan semua field valid termasuk kecamatan optional

**Pre Condition:**
* Halaman Register terbuka
* Email @gmail.com belum terdaftar
* Password >= 6 karakter
* List kecamatan sudah load

**Step:**
1. Isi field "Nama Lengkap": "Budi Santoso"
2. Isi field "Email address": "budi.santoso@gmail.com"
3. Pilih "Kecamatan Domisili": misalnya "Bandung Kidul"
4. Isi field "Password": "password123"
5. Klik tombol "Daftar Sekarang"
6. Tunggu proses daftar

**Expected Result:**
* Registrasi berhasil
* Profil dibuat dengan role "warga"
* Kecamatan tersimpan di profil
* User diarahkan ke halaman Login
* Success message: "Pendaftaran berhasil! Silakan login..."
* Email verifikasi mungkin dikirim (jika ada)

---

### (Type) Functional

**Test Case 12**

(Negative)

**Test Scenario:**
Pengguna gagal daftar dengan email non-@gmail.com domain

**Pre Condition:**
* Halaman Register terbuka
* Password dan nama valid
* Email domain bukan @gmail.com

**Step:**
1. Isi nama lengkap
2. Isi email dengan domain non-gmail: "user@yahoo.com"
3. Isi password
4. Klik tombol "Daftar Sekarang"

**Expected Result:**
* Registrasi ditolak
* Error message: "Hanya email dengan domain @gmail.com yang diizinkan"
* Data tidak tersimpan ke database
* User tetap di halaman Register

---

### (Type) Functional

**Test Case 13**

(Negative)

**Test Scenario:**
Pengguna gagal daftar dengan password kurang dari 6 karakter

**Pre Condition:**
* Halaman Register terbuka
* Nama dan email valid

**Step:**
1. Isi nama lengkap
2. Isi email @gmail.com
3. Isi password dengan 5 karakter: "12345"
4. Klik tombol "Daftar Sekarang"

**Expected Result:**
* Registrasi ditolak
* Error message: "Password minimal 6 karakter"
* Account tidak dibuat
* User tetap di Register page

---

### (Type) BVA

**Test Case 14**

(Negative)

**Test Scenario:**
Pengguna gagal daftar dengan nama kosong (required field boundary)

**Pre Condition:**
* Halaman Register terbuka

**Step:**
1. Biarkan field "Nama Lengkap" kosong
2. Isi field email dan password
3. Klik tombol "Daftar Sekarang"

**Expected Result:**
* HTML5 validation menolak
* Error message: "Nama wajib diisi" atau required indicator
* Form tidak terkirim

---

### (Type) BVA

**Test Case 15**

(Positive)

**Test Scenario:**
Pengguna berhasil daftar dengan password exactly 6 karakter (boundary min)

**Pre Condition:**
* Halaman Register terbuka
* Email belum terdaftar
* Password exactly 6 chars

**Step:**
1. Isi nama lengkap
2. Isi email @gmail.com baru
3. Isi password dengan exactly 6 karakter: "Passwd"
4. Klik tombol "Daftar Sekarang"

**Expected Result:**
* Validasi pass (6 = minimum)
* Registrasi berhasil
* User bisa login dengan password 6-char ini

---

### (Type) EP

**Test Case 16**

(Negative)

**Test Scenario:**
Pengguna gagal daftar dengan email yang sudah terdaftar (duplicate)

**Pre Condition:**
* Email sudah terdaftar di database
* Halaman Register terbuka
* Backend validasi duplicate

**Step:**
1. Isi nama lengkap dengan nama berbeda
2. Isi email yang sudah terdaftar
3. Isi password
4. Klik tombol "Daftar Sekarang"

**Expected Result:**
* Backend reject karena email duplicate
* Error message: "Email sudah terdaftar" atau "Pendaftaran gagal: email sudah digunakan"
* Account tidak dibuat
* User tetap di halaman Register

---

### (Type) Functional

**Test Case 17**

(Positive)

**Test Scenario:**
Pengguna dapat mengetik nama dengan berbagai karakter (accents, spaces)

**Pre Condition:**
* Halaman Register terbuka
* Form siap diisi

**Step:**
1. Isi field "Nama Lengkap" dengan karakter special: "Ahmad Miftah Fadhillah"
2. Atau dengan accent: "José García"
3. Isi field lain dengan valid
4. Klik tombol "Daftar Sekarang"

**Expected Result:**
* Nama diterima
* Registrasi berhasil
* Nama tersimpan di database dengan karakter asli

---

### (Type) Functional

**Test Case 18**

(Positive)

**Test Scenario:**
Pengguna dapat mendaftar tanpa memilih kecamatan (optional field)

**Pre Condition:**
* Halaman Register terbuka
* Field Kecamatan optional (tidak wajib)

**Step:**
1. Isi nama lengkap
2. Isi email @gmail.com
3. Isi password valid
4. JANGAN pilih kecamatan (biarkan kosong)
5. Klik tombol "Daftar Sekarang"

**Expected Result:**
* Registrasi berhasil
* Kecamatan field bisa null
* Profile dibuat tanpa kecamatan_id

---

### (Type) Explore

**Test Case 19**

(Negative)

**Test Scenario:**
Explore validation dari dropdown Kecamatan (autocomplete/search)

**Pre Condition:**
* Halaman Register terbuka
* Dropdown Kecamatan terbuka
* Ada daftar kecamatan di database

**Step:**
1. Klik field "Kecamatan Domisili"
2. Ketik: "band" untuk search
3. Observe dropdown filter hasil
4. Pilih salah satu hasil
5. Verify pilihan tersimpan

**Expected Result:**
* Dropdown autocomplete bekerja
* Filter mencari kecamatan by nama
* Pilihan tersimpan dan tampil di field
* Search case-insensitive

---

### (Type) Functional

**Test Case 20**

(Positive)

**Test Scenario:**
User dapat klik link "Masuk di sini" untuk kembali ke halaman Login

**Pre Condition:**
* User di halaman Register
* Link "Masuk di sini" visible

**Step:**
1. Klik link "Masuk di sini"
2. Observe route change

**Expected Result:**
* Navigate ke halaman Login
* URL berubah ke /login
* Form Register tidak lagi terlihat

---

# MODULE 2: LAPORAN - CREATE & VIEW

## PAGE: LaporanForm.jsx

---

### (Type) Functional

**Test Case 21**

(Positive)

**Test Scenario:**
Pengguna berhasil membuat laporan dengan data lengkap (judul, deskripsi, lokasi, foto)

**Pre Condition:**
* User login sebagai warga
* Berada di halaman "Laporan Form"
* Geolocation tersedia
* Browser izinkan geolocation

**Step:**
1. Isi field "Judul": "Jalan Rusak Parah di Jl. Merdeka"
2. Pilih "Kecamatan": "Bandung Kidul"
3. Pilih "Kelurahan": "Cibeunying Kidul"
4. Isi field "Deskripsi": "Jalan berlubang besar, berbahaya untuk pengendara"
5. Isi field "Alamat": "Jl. Merdeka No. 45"
6. Drag marker peta ke lokasi yang benar
7. Upload foto dari file (JPG/PNG)
8. Klik tombol "Buat Laporan"

**Expected Result:**
* Laporan berhasil dibuat
* Status: "pending" / "Menunggu Verifikasi"
* Latitude/Longitude tersimpan
* Foto terupload ke Supabase Storage
* User redirect ke halaman Laporan, tab "History Saya"
* Laporan baru tampil di list

---

### (Type) Functional

**Test Case 22**

(Negative)

**Test Scenario:**
Pengguna gagal membuat laporan jika Kecamatan tidak dipilih

**Pre Condition:**
* User login sebagai warga
* Halaman Laporan Form terbuka
* Kecamatan wajib dipilih (per requirement)

**Step:**
1. Isi judul laporan
2. JANGAN pilih Kecamatan
3. Isi field lainnya
4. Klik tombol "Buat Laporan"

**Expected Result:**
* Form submit ditolak
* Modal alert tampil: "Harap pilih Kecamatan dan Kelurahan"
* Laporan tidak tersimpan
* User tetap di form page

---

### (Type) Functional

**Test Case 23**

(Negative)

**Test Scenario:**
Pengguna gagal membuat laporan jika Kelurahan tidak dipilih

**Pre Condition:**
* User login sebagai warga
* Kecamatan sudah dipilih
* Kelurahan wajib dipilih

**Step:**
1. Isi judul laporan
2. Pilih Kecamatan
3. JANGAN pilih Kelurahan
4. Isi field lainnya
5. Klik tombol "Buat Laporan"

**Expected Result:**
* Form ditolak
* Error: "Harap pilih Kecamatan dan Kelurahan"
* Laporan tidak dibuat
* Tetap di form

---

### (Type) Functional

**Test Case 24**

(Negative)

**Test Scenario:**
Pengguna tidak bisa submit form jika judul laporan kosong

**Pre Condition:**
* Halaman Laporan Form terbuka
* Judul adalah required field

**Step:**
1. Kosongkan field "Judul"
2. Isi field lainnya
3. Klik tombol "Buat Laporan"

**Expected Result:**
* Form validation error
* HTML5 required indicator
* Form tidak terkirim

---

### (Type) BVA

**Test Case 25**

(Positive)

**Test Scenario:**
Pengguna berhasil membuat laporan tanpa upload foto (optional)

**Pre Condition:**
* Halaman Laporan Form terbuka
* Foto adalah optional field (per requirement)
* Field lain lengkap

**Step:**
1. Isi semua required field (judul, deskripsi, alamat, kecamatan, kelurahan)
2. JANGAN upload foto
3. Klik tombol "Buat Laporan"

**Expected Result:**
* Laporan berhasil dibuat
* foto_url = null di database
* Laporan tampil di list tanpa foto (placeholder/empty image)
* Tidak ada error

---

### (Type) BVA

**Test Case 26**

(Positive)

**Test Scenario:**
User dapat membuat laporan dengan judul exactly 1 karakter (boundary min jika ada validasi min length)

**Pre Condition:**
* Halaman Laporan Form
* Judul tidak ada validasi min length atau min 1 char

**Step:**
1. Isi judul dengan 1 karakter: "J"
2. Isi field lain lengkap
3. Klik submit

**Expected Result:**
* Form accept (jika tidak ada min length validasi)
* Laporan dibuat dengan judul "J"
* Atau error jika ada min length requirement

---

### (Type) EP

**Test Case 27**

(Negative)

**Test Scenario:**
User mencoba upload foto dengan format tidak supported (e.g., .pdf, .txt)

**Pre Condition:**
* Halaman Laporan Form terbuka
* File upload terbuka
* Format file .pdf atau .txt (bukan image)

**Step:**
1. Isi field laporan (judul, kecamatan, dll)
2. Klik area upload foto
3. Pilih file .pdf atau .txt
4. Observe response

**Expected Result:**
* Upload ditolak
* Error message: "Format file tidak didukung. Gunakan JPG atau PNG"
* File tidak terupload
* Form tetap bisa diisi

---

### (Type) Functional

**Test Case 28**

(Positive)

**Test Scenario:**
Pengguna bisa drag marker di peta ke lokasi yang berbeda

**Pre Condition:**
* Halaman Laporan Form terbuka
* Peta Leaflet sudah load dengan marker
* Geolocation sudah tersedia

**Step:**
1. Lihat marker di peta (default lokasi)
2. Drag marker ke lokasi berbeda (sambil drag amati koordinat berubah)
3. Lepas marker
4. Observe latitude/longitude field terupdate
5. Submit form

**Expected Result:**
* Marker bisa didrag
* Koordinat latitude/longitude real-time update
* Nilai tersimpan di form
* Lokasi akurat sesuai drag position

---

### (Type) Explore

**Test Case 29**

(Positive)

**Test Scenario:**
Explore Kelurahan dropdown otomatis populate berdasarkan Kecamatan dipilih

**Pre Condition:**
* Halaman Laporan Form
* API /wilayah/kelurahan/:id tersedia
* Kecamatan dropdown ready

**Step:**
1. Klik dropdown Kecamatan
2. Pilih "Bandung Kidul"
3. Observe dropdown Kelurahan
4. Verify list kelurahan sesuai kecamatan

**Expected Result:**
* Kelurahan dropdown auto-populate
* Hanya menampilkan kelurahan dari kecamatan terpilih
* API call berhasil
* Dropdown siap untuk dipilih

---

### (Type) Functional

**Test Case 30**

(Negative)

**Test Scenario:**
Form reject jika deskripsi kosong (if required)

**Pre Condition:**
* Halaman Laporan Form
* Deskripsi adalah required field

**Step:**
1. Isi semua field KECUALI deskripsi
2. Kosongkan field deskripsi
3. Klik tombol "Buat Laporan"

**Expected Result:**
* Form validation error
* Deskripsi harus diisi
* Error message atau required indicator tampil

---

### (Type) E2E

**Test Case 31**

(Positive)

**Test Scenario:**
Full E2E: User login → Buat laporan → Verifikasi di list → Lihat detail laporan

**Pre Condition:**
* User login sebagai warga
* Sudah di halaman Laporan Form

**Step:**
1. Login dengan credential valid
2. Navigasi ke "Buat Laporan"
3. Isi form dengan data valid dan upload foto
4. Klik tombol "Buat Laporan"
5. Tunggu redirect
6. Verify laporan baru ada di "History Saya" tab
7. Klik laporan untuk lihat detail
8. Verify detail laporan sesuai form yang diisi

**Expected Result:**
* Laporan sukses dibuat
* Tampil di list dengan status pending
* Detail page menampilkan semua data yang diinput
* Foto terupload dan terlihat
* Status workflow dimulai dari "Dilaporkan"

---

## PAGE: LaporanList.jsx

---

### (Type) Functional

**Test Case 32**

(Positive)

**Test Scenario:**
Warga dapat melihat daftar laporan publik dari warga lain (tab "Laporan Publik")

**Pre Condition:**
* User login sebagai warga
* Ada minimal 2+ laporan dari user berbeda di database
* Halaman LaporanList terbuka

**Step:**
1. Klik tab "Laporan Publik" (jika belum ada)
2. Observe daftar laporan ditampilkan
3. Verify laporan dari user lain muncul
4. Verify laporan milik sendiri TIDAK muncul
5. Klik salah satu laporan untuk lihat detail

**Expected Result:**
* List laporan publik tampil
* Tidak ada laporan pribadi di publik list (filtered out)
* Setiap card menampilkan: judul, lokasi, status, upvote count, foto
* Klik laporan buka detail page

---

### (Type) Functional

**Test Case 33**

(Positive)

**Test Scenario:**
Warga dapat melihat list laporan pribadi di tab "History Saya"

**Pre Condition:**
* User login sebagai warga
* Pernah membuat laporan minimal 1
* Halaman LaporanList terbuka

**Step:**
1. Klik tab "History Saya" atau "Laporan Saya"
2. Observe list laporan pribadi
3. Verify semua laporan yang pernah dibuat muncul
4. Verify detail setiap laporan (status, judul, dll)

**Expected Result:**
* List laporan pribadi tampil
* Hanya laporan milik user sendiri
* Status laporan muncul (pending, verified, in_progress, done, rejected)
* Bisa klik untuk detail atau delete (jika pending)

---

### (Type) Functional

**Test Case 34**

(Negative)

**Test Scenario:**
Admin kecamatan tidak bisa melihat laporan dari kecamatan lain

**Pre Condition:**
* User login sebagai kecamatan (admin kecamatan)
* Ada laporan dari kecamatan A dan kecamatan B
* User login dari kecamatan A

**Step:**
1. Lihat tab "Laporan Masuk" atau admin dashboard
2. Observe laporan yang ditampilkan
3. Verify hanya laporan dari kecamatan A muncul

**Expected Result:**
* Filter berdasarkan kecamatan user
* Laporan dari kecamatan lain tidak tampil
* Security: data kecamatan lain terlindungi

---

### (Type) Functional

**Test Case 35**

(Positive)

**Test Scenario:**
Admin dapat filter laporan berdasarkan status (Masuk, Progress, Selesai, dll)

**Pre Condition:**
* User login sebagai admin
* Ada laporan dengan berbagai status
* Tab admin "Laporan Masuk", "Laporan Progress", "Laporan Selesai" tersedia

**Step:**
1. Klik tab "Laporan Masuk" (status=pending)
2. Verify list hanya menampilkan laporan pending
3. Klik tab "Laporan Progress" (status=in_progress)
4. Verify hanya in_progress muncul
5. Klik tab "Laporan Selesai" (status=done/selesai)
6. Verify hanya selesai/done

**Expected Result:**
* Tab filter bekerja dengan baik
* Setiap tab menampilkan laporan sesuai status
* Data akurat dari database
* Real-time filter tanpa refresh page

---

### (Type) Functional

**Test Case 36**

(Positive)

**Test Scenario:**
User dapat search laporan berdasarkan keyword judul atau alamat

**Pre Condition:**
* Halaman LaporanList terbuka
* Ada search box/field
* Ada laporan dengan berbagai judul

**Step:**
1. Klik field search (jika ada search box)
2. Ketik keyword: "jalan"
3. Observe hasil filter
4. Verify laporan dengan judul/alamat mengandung "jalan" muncul
5. Kosongkan search, ketik keyword lain

**Expected Result:**
* Search real-time bekerja
* Hasil filter sesuai keyword
* Case-insensitive search
* Laporan tidak match disembunyikan

---

### (Type) EP

**Test Case 37**

(Positive)

**Test Scenario:**
Pengguna bisa delete laporan yang masih pending (belum terverifikasi)

**Pre Condition:**
* User login sebagai warga
* Punya laporan dengan status pending
* Laporan ini hanya bisa delete jika pending

**Step:**
1. Buka tab "History Saya"
2. Cari laporan dengan status "Menunggu Verifikasi"
3. Klik icon delete atau tombol hapus pada laporan
4. Confirm dialog muncul
5. Klik tombol "Yakin Hapus"

**Expected Result:**
* Laporan dihapus dari database
* Laporan hilang dari list
* No error message
* Foto juga dihapus dari storage (cleanup)

---

### (Type) Functional

**Test Case 38**

(Negative)

**Test Scenario:**
Pengguna TIDAK bisa delete laporan yang sudah verified atau in_progress

**Pre Condition:**
* User punya laporan dengan status verified atau in_progress
* Halaman LaporanList terbuka

**Step:**
1. Buka tab "History Saya"
2. Cari laporan dengan status bukan pending
3. Klik/hover tombol delete

**Expected Result:**
* Tombol delete tidak aktif atau tidak tampil
* Atau jika diklik: error message "Hanya laporan pending yang bisa dihapus"
* Laporan tetap di list

---

### (Type) Explore

**Test Case 39**

(Positive)

**Test Scenario:**
Explore admin dapat melihat tab "Duplikat Detection" dan "Kendala" (if super_admin/kecamatan)

**Pre Condition:**
* User login sebagai super_admin atau kecamatan
* Berada di halaman LaporanList
* Tab "Duplikat" dan "Kendala" tersedia

**Step:**
1. Lihat navigation tab di halaman
2. Verify ada tab "Duplikat Detection"
3. Verify ada tab "Kendala Lapangan"
4. Klik tab "Duplikat"
5. Observe duplicate groups (jika ada)
6. Klik tab "Kendala"
7. Observe list kendala

**Expected Result:**
* Tab muncul untuk admin yang berhak
* Duplicate detection interface visible
* Kendala list tampil dengan data

---

### (Type) Functional

**Test Case 40**

(Positive)

**Test Scenario:**
Admin dapat update catatan (notes) pada laporan di list view

**Pre Condition:**
* User login sebagai admin (kecamatan/super_admin)
* Ada laporan di list
* Ada icon/button untuk edit catatan

**Step:**
1. Hover atau klik laporan card
2. Klik icon/button edit catatan (pencil icon)
3. Modal catatan terbuka
4. Isi catatan: "Laporan valid, tunggu respons petugas"
5. Klik tombol "Simpan Catatan"

**Expected Result:**
* Catatan tersimpan
* Modal tertutup
* Laporan card update menampilkan catatan (jika ada indicator)
* Catatan visible untuk admin lain

---

### (Type) E2E

**Test Case 41**

(Positive)

**Test Scenario:**
Full E2E admin workflow: Lihat laporan masuk → Verifikasi → Ubah prioritas → Tambah catatan

**Pre Condition:**
* User login sebagai admin
* Ada laporan pending di list

**Step:**
1. Buka tab "Laporan Masuk"
2. Lihat laporan dengan status pending
3. Klik laporan untuk detail
4. Klik tombol "Verifikasi"
5. Kembali ke list
6. Buka laporan lagi
7. Ubah prioritas menjadi "HIGH"
8. Tambah catatan: "Urgent, perlu penanganan cepat"
9. Save semua perubahan

**Expected Result:**
* Laporan status berubah: pending → verified
* Prioritas terupdate
* Catatan tersimpan
* Timeline mencatat semua perubahan
* Status bar update

---

## PAGE: LaporanDetail.jsx

---

### (Type) Functional

**Test Case 42**

(Positive)

**Test Scenario:**
Pengguna dapat melihat detail lengkap laporan dengan progress stepper, stats, timeline

**Pre Condition:**
* Halaman LaporanDetail terbuka
* Laporan ada di database
* Status: pending / verified / in_progress / done

**Step:**
1. Buka halaman detail laporan
2. Observe progress stepper (4 tahap: Dilaporkan, Diverifikasi, Diproses, Selesai)
3. Observe stats cards: upvote count, priority, durasi, etc
4. Scroll ke timeline history
5. Verify semua section visible

**Expected Result:**
* Detail laporan tampil lengkap
* Progress stepper menunjukkan status sekarang
* Stats akurat sesuai laporan
* Timeline menampilkan history (jika ada)
* Foto laporan terupload dengan baik

---

### (Type) Functional

**Test Case 43**

(Positive)

**Test Scenario:**
Warga dapat memberikan upvote pada laporan orang lain (tombol "Dukung Laporan Ini")

**Pre Condition:**
* User login sebagai warga
* Laporan berstatus active (bukan done/rejected)
* User belum upvote laporan ini
* Halaman LaporanDetail terbuka

**Step:**
1. Lihat tombol "Dukung Laporan Ini"
2. Klik tombol
3. Tunggu loading
4. Observe tombol berubah label/warna

**Expected Result:**
* Upvote berhasil
* Tombol label berubah menjadi "Laporan Didukung ✓"
* Warna tombol berubah (highlight/checked)
* Upvote count bertambah 1
* Record insert di tabel upvote
* Tidak ada error

---

### (Type) Functional

**Test Case 44**

(Negative)

**Test Scenario:**
Pengguna TIDAK bisa upvote laporan dengan status "done" atau "rejected"

**Pre Condition:**
* Laporan sudah status done/selesai atau rejected/ditolak
* Halaman detail terbuka
* User login

**Step:**
1. Buka laporan dengan status done/rejected
2. Cari tombol upvote
3. Observe status tombol

**Expected Result:**
* Tombol upvote disabled/tidak aktif
* Helper text tampil: "Dukungan ditutup karena laporan telah selesai"
* Klik tombol tidak ada efek
* Upvote count tidak berubah

---

### (Type) Functional

**Test Case 45**

(Negative)

**Test Scenario:**
User tidak bisa upvote tanpa login

**Pre Condition:**
* Belum login (no token)
* Halaman LaporanDetail terbuka (public page)

**Step:**
1. Buka laporan tanpa login (public URL)
2. Lihat tombol upvote
3. Klik tombol upvote

**Expected Result:**
* Tombol tidak aktif atau disabled
* Helper text: "Login untuk memberikan dukungan"
* Upvote count tidak berubah
* Tidak ada error

---

### (Type) Functional

**Test Case 46**

(Positive)

**Test Scenario:**
Pengguna dapat toggle upvote (cancel dukungan dengan klik ulang)

**Pre Condition:**
* User sudah upvote laporan ini
* Laporan masih aktif (bukan done)
* Halaman detail terbuka

**Step:**
1. Buka laporan yang sudah diupvote (tombol berbunyi "Laporan Didukung ✓")
2. Klik tombol untuk cancel upvote
3. Observe tombol berubah label

**Expected Result:**
* Upvote dibatalkan
* Tombol kembali ke "Dukung Laporan Ini"
* Warna tombol normal (tidak highlight)
* Upvote count berkurang 1
* Record dihapus dari upvote tabel

---

### (Type) Functional

**Test Case 47**

(Positive)

**Test Scenario:**
Admin dapat upload bukti selesai (foto + keterangan) untuk menyelesaikan laporan

**Pre Condition:**
* User login sebagai petugas/admin
* Laporan status in_progress
* Belum ada bukti selesai
* Ada file foto (JPG/PNG)

**Step:**
1. Lihat tombol/section "Upload Bukti Selesai"
2. Klik tombol untuk buka modal
3. Modal dialog upload bukti terbuka
4. Klik area upload untuk browse file
5. Pilih file foto (JPG/PNG, max 10MB)
6. Isi field "Keterangan Bukti": "Perbaikan jalan selesai dengan baik"
7. Klik tombol "Kirim Bukti"

**Expected Result:**
* Foto terupload ke Supabase Storage
* Laporan status berubah ke "done" / "selesai"
* Record bukti_selesai dibuat di database
* Modal tertutup
* Halaman refresh
* Section "Perbaikan Selesai" tampil dengan foto dan keterangan
* Timeline update dengan event "selesai"

---

### (Type) Functional

**Test Case 48**

(Negative)

**Test Scenario:**
Petugas gagal upload bukti tanpa memilih foto

**Pre Condition:**
* Modal upload bukti terbuka
* Laporan in_progress
* Foto belum dipilih

**Step:**
1. Buka modal upload bukti
2. Biarkan field foto kosong
3. Isi field keterangan
4. Observe tombol "Kirim Bukti"

**Expected Result:**
* Tombol "Kirim Bukti" disabled/tidak aktif
* Tidak bisa submit
* Pesan/placeholder memandu untuk upload foto

---

### (Type) Functional

**Test Case 49**

(Positive)

**Test Scenario:**
Petugas dapat lapor kendala lapangan saat laporan in_progress

**Pre Condition:**
* User login sebagai petugas
* Laporan status in_progress
* Halaman LaporanDetail terbuka

**Step:**
1. Lihat section "Kendala" atau tombol "Lapor Kendala"
2. Klik tombol untuk buka modal kendala
3. Modal "Laporan Kendala" terbuka
4. Isi field deskripsi: "Cuaca buruk, material belum tiba"
5. Klik tombol "Kirim Laporan Kendala"

**Expected Result:**
* Kendala berhasil disimpan
* Record insert di tabel kendala_laporan
* Modal tertutup
* Halaman refresh
* Section kendala tampil dengan kendala baru
* Timeline update
* Notifikasi kemungkinan dikirim ke admin

---

### (Type) Functional

**Test Case 50**

(Negative)

**Test Scenario:**
Petugas gagal lapor kendala dengan deskripsi kosong

**Pre Condition:**
* Modal kendala terbuka
* User adalah petugas

**Step:**
1. Buka modal kendala
2. Biarkan field deskripsi kosong
3. Observe tombol submit

**Expected Result:**
* Tombol "Kirim" disabled
* Tidak bisa submit
* Placeholder atau hint text memandu

---

### (Type) Functional

**Test Case 51**

(Positive)

**Test Scenario:**
Admin dapat verifikasi laporan (ubah status pending → verified)

**Pre Condition:**
* User login sebagai admin
* Laporan status pending
* Halaman detail terbuka
* Ada tombol/button "Verifikasi" di admin panel

**Step:**
1. Scroll ke admin panel section
2. Klik tombol "✓ Verifikasi"
3. Tunggu loading
4. Observe status berubah

**Expected Result:**
* Status laporan berubah: pending → verified
* Progress stepper update (step 1 complete)
* Badge status berubah dari kuning ke biru
* Timeline update dengan event verifikasi
* Tidak ada modal confirmation (atau confirm sudah ada)

---

### (Type) Functional

**Test Case 52**

(Positive)

**Test Scenario:**
Admin dapat reject/tolak laporan dengan keterangan penolakan

**Pre Condition:**
* User login sebagai admin
* Laporan status pending
* Ada tombol "✕ Tolak" atau reject

**Step:**
1. Klik tombol "✕ Tolak"
2. Modal confirmation dengan field keterangan terbuka
3. Isi keterangan penolakan: "Laporan tidak jelas, lokasi tidak spesifik"
4. Klik tombol "Konfirmasi Penolakan"

**Expected Result:**
* Status laporan berubah ke "rejected" / "ditolak"
* Badge status berubah merah
* Pelapor mendapat notifikasi penolakan
* Timeline mencatat event penolakan dengan keterangan
* Progress stepper tampil status ditolak (X icon merah)

---

### (Type) Functional

**Test Case 53**

(Positive)

**Test Scenario:**
Admin dapat tambah/edit catatan internal pada laporan

**Pre Condition:**
* User login sebagai admin
* Halaman detail terbuka
* Ada icon/button edit catatan

**Step:**
1. Lihat field catatan (atau klik edit icon)
2. Modal catatan terbuka
3. Isi catatan: "Koordinasi dengan dinas PU untuk alat berat"
4. Klik tombol "Simpan Catatan"

**Expected Result:**
* Catatan tersimpan
* Modal tertutup
* Catatan visible di section "Catatan Admin"
* Highlight jika catatan baru
* Timestamp catatan tercatat

---

### (Type) Functional

**Test Case 54**

(Positive)

**Test Scenario:**
Admin dapat ubah prioritas laporan (low ↔ high)

**Pre Condition:**
* User login sebagai admin
* Laporan punya prioritas (low/high)
* Ada dropdown/button prioritas di admin panel

**Step:**
1. Klik dropdown prioritas
2. Pilih "HIGH"
3. Observe perubahan
4. Atau klik lagi untuk ubah ke "LOW"

**Expected Result:**
* Prioritas terupdate
* Visual indicator berubah (color/badge)
* Database terupdate
* Laporan reorder di list (high priority lebih atas)
* Timeline mencatat perubahan

---

### (Type) E2E

**Test Case 55**

(Positive)

**Test Scenario:**
Full E2E workflow admin: Verify → Add notes → Change priority → Upload bukti → Complete

**Pre Condition:**
* Admin login
* Laporan in status pending di database

**Step:**
1. Buka laporan detail
2. Klik verifikasi
3. Tambah catatan: "Urgent case"
4. Ubah prioritas ke HIGH
5. Ubah status ke in_progress (jika ada button)
6. Kembali ke laporan
7. Upload bukti selesai dengan foto dan keterangan
8. Verify semua perubahan tersimpan

**Expected Result:**
* Setiap step execute successfully
* Status progress: pending → verified → in_progress → done
* All notes, priority, bukti tersimpan
* Timeline complete dengan semua events
* Laporan sekarang status "done" dengan bukti

---

## PAGE: ProfileUpdate.jsx

---

### (Type) Functional

**Test Case 56**

(Positive)

**Test Scenario:**
Pengguna berhasil update profil dengan semua field valid (nama, alamat, nomor HP)

**Pre Condition:**
* User login
* Berada di halaman "Profil" atau "Update Profil"
* Form siap diisi
* Internet aktif

**Step:**
1. Isi field "Nama Lengkap": "Ahmad Miftah Fadhillah"
2. Isi field "Alamat": "Jl. Merdeka No. 45, Bandung"
3. Isi field "Nomor HP": "081234567890" (10+ digit, hanya angka)
4. Klik tombol "Simpan Perubahan"
5. Tunggu loading dan response

**Expected Result:**
* Profil berhasil diupdate
* Success message: "Profil berhasil diperbarui"
* Data tersimpan di database
* Nama user update di navbar real-time
* Progress bar completion mencapai 100% (jika semua field fill)
* Tidak ada error

---

### (Type) Functional

**Test Case 57**

(Negative)

**Test Scenario:**
Pengguna gagal update nomor HP dengan karakter non-digit

**Pre Condition:**
* Halaman profil update terbuka
* Nomor HP hanya boleh digit (validasi)

**Step:**
1. Isi field "Nomor HP" dengan karakter non-digit: "08-1234-567890" (ada dash)
2. Atau: "0812 345 67890" (ada space)
3. Klik tombol "Simpan Perubahan"

**Expected Result:**
* Validasi error
* Error message: "Hanya boleh angka"
* Field phone menampilkan red border/error state
* Data tidak tersimpan
* Input value tetap dengan karakter invalid (atau cleared)

---

### (Type) BVA

**Test Case 58**

(Negative)

**Test Scenario:**
Pengguna gagal update nomor HP dengan jumlah digit kurang dari 10 (boundary)

**Pre Condition:**
* Halaman profil terbuka
* Min nomor HP adalah 10 digit (validasi)

**Step:**
1. Isi field "Nomor HP" dengan 9 digit: "081234567"
2. Klik tombol "Simpan Perubahan"

**Expected Result:**
* Validasi error
* Error message: "Minimal 10 digit"
* Field menampilkan error state
* Data tidak tersimpan

---

### (Type) BVA

**Test Case 59**

(Positive)

**Test Scenario:**
Pengguna berhasil update nomor HP dengan exactly 10 digit (boundary min)

**Pre Condition:**
* Halaman profil terbuka
* Min 10 digit requirement

**Step:**
1. Isi field "Nomor HP" dengan exactly 10 digit: "0812345678"
2. Isi field lain dengan valid
3. Klik tombol "Simpan Perubahan"

**Expected Result:**
* Validasi pass (10 = minimum)
* Profil terupdate
* Nomor HP valid di database

---

### (Type) Functional

**Test Case 60**

(Negative)

**Test Scenario:**
Pengguna gagal update profil dengan nama kosong (required field)

**Pre Condition:**
* Halaman profil terbuka
* Nama adalah required field

**Step:**
1. Kosongkan field "Nama Lengkap"
2. Isi field lain
3. Klik tombol "Simpan Perubahan"

**Expected Result:**
* Validasi error
* Error message: "Nama wajib diisi"
* Form tidak submit

---

### (Type) Functional

**Test Case 61**

(Positive)

**Test Scenario:**
Pengguna dapat clear/reset profil field yang tidak diisi sebelumnya dan resubmit

**Pre Condition:**
* Profile punya field kosong (misalnya alamat belum diisi)
* Halaman update terbuka

**Step:**
1. Lihat field yang kosong
2. Isi semua field kosong dengan data valid
3. Klik "Simpan Perubahan"

**Expected Result:**
* Semua field yang kosong sekarang terisi
* Profil complete terupdate
* Progress bar naik (completion %)

---

### (Type) Functional

**Test Case 62**

(Positive)

**Test Scenario:**
User dapat amati progress bar completion percentage di profile update page

**Pre Condition:**
* Halaman ProfileUpdate terbuka
* Ada progress bar completion
* User punya data sebagian/lengkap

**Step:**
1. Observe progress bar di halaman
2. Check percentage (e.g., 33% jika 1 dari 3 field)
3. Isi field yang kosong
4. Observe progress bar increase

**Expected Result:**
* Progress bar visible
* Percentage akurat sesuai field completion
* Update real-time saat fill field
* 100% ketika semua field filled

---

### (Type) Functional

**Test Case 63**

(Positive)

**Test Scenario:**
User dapat track "dirty state" (form berubah tapi belum save)

**Pre Condition:**
* Halaman profil terbuka
* User sudah punya data di form

**Step:**
1. Edit salah satu field (misal ubah nama)
2. Amati tombol "Simpan Perubahan"
3. Jangan klik save
4. Buka halaman lain

**Expected Result:**
* Tombol "Simpan Perubahan" mungkin active (jika ada dirty state tracking)
* Atau ada warning jika user navigasi tanpa save
* Data yang diubah tetap di form sampai save/refresh

---

### (Type) E2E

**Test Case 64**

(Positive)

**Test Scenario:**
Full E2E: User login → Update profil → Verify update di navbar → Logout

**Pre Condition:**
* User fresh login
* Berada di halaman profil

**Step:**
1. Login dengan credential
2. Navigasi ke profil update
3. Ubah nama menjadi "Budi Santoso Baru"
4. Ubah nomor HP menjadi "081234567890"
5. Klik "Simpan Perubahan"
6. Tunggu success message
7. Klik link untuk kembali ke laporan/dashboard
8. Check navbar - verify nama sudah berubah
9. Logout
10. Login lagi
11. Cek profil - data tetap tersimpan

**Expected Result:**
* Profil update berhasil
* Nama di navbar update real-time
* Data persistent di database
* After logout dan login ulang, data tetap ada

---

### (Type) Explore

**Test Case 65**

(Positive)

**Test Scenario:**
Explore avatar display di profil page (initials dari nama)

**Pre Condition:**
* ProfileUpdate page terbuka
* Ada avatar/foto profil di halaman

**Step:**
1. Observe avatar di halaman
2. Verify initials tampil (e.g., "AS" untuk "Ahmad Santoso")
3. Update nama menjadi "Budi Miftah"
4. Observe avatar update initials

**Expected Result:**
* Avatar display initials dari nama
* Update real-time saat nama diubah
* Avatar visual bagus dan konsisten

---

# MODULE 3: ADMIN DASHBOARDS

## PAGE: AdminKecamatanDashboard.jsx

---

### (Type) Functional

**Test Case 66**

(Positive)

**Test Scenario:**
Admin kecamatan dapat melihat dashboard dengan statistik kecamatan spesifik

**Pre Condition:**
* User login sebagai kecamatan (admin kecamatan)
* Ada laporan di kecamatan tersebut dengan berbagai status
* Berada di halaman AdminKecamatanDashboard

**Step:**
1. Buka halaman dashboard kecamatan
2. Observe stat cards: total laporan, pending, in_progress, done, rejected
3. Lihat distribution bar (status breakdown)
4. Observe notification badge untuk pending

**Expected Result:**
* Dashboard load dengan data akurat
* Stat cards menampilkan count sesuai database
* Distribution bar tampil dengan persentase status
* Badge count akurat
* Data hanya dari kecamatan user login

---

### (Type) Functional

**Test Case 67**

(Negative)

**Test Scenario:**
Admin kecamatan TIDAK bisa melihat data dari kecamatan lain

**Pre Condition:**
* User login sebagai kecamatan A
* Ada laporan dari kecamatan B di database
* Dashboard terbuka

**Step:**
1. Amati data di dashboard
2. Verify hanya kecamatan A data

**Expected Result:**
* Data kecamatan B tidak muncul
* Security: data per-kecamatan terlindungi
* Filter otomatis berdasarkan login user

---

### (Type) Functional

**Test Case 68**

(Positive)

**Test Scenario:**
Admin kecamatan dapat lihat list laporan dengan status filter aktif

**Pre Condition:**
* Dashboard terbuka
* Ada daftar laporan di dashboard atau link ke laporan per status

**Step:**
1. Lihat section laporan di dashboard
2. Atau klik link untuk lihat laporan pending
3. Observe daftar laporan sesuai status

**Expected Result:**
* List laporan tampil dengan status filter
* Link/button untuk setiap status (pending, proses, selesai)
* Klik navigate ke laporan dengan status terfilter

---

### (Type) Functional

**Test Case 69**

(Positive)

**Test Scenario:**
Admin kecamatan dapat melihat average resolution time (durasi rata-rata selesai)

**Pre Condition:**
* Dashboard terbuka
* Ada laporan yang sudah selesai (status = done)

**Step:**
1. Lihat stat card untuk "Waktu Rata-rata Penyelesaian" atau similar
2. Observe value menampilkan jam/hari

**Expected Result:**
* Stat card visible dengan average duration
* Perhitungan akurat dari database
* Format: "X jam" atau "X hari"

---

### (Type) Functional

**Test Case 70**

(Positive)

**Test Scenario:**
Dashboard auto-refresh atau ada button refresh untuk update data terbaru

**Pre Condition:**
* Dashboard terbuka dengan data lama
* Ada laporan baru masuk

**Step:**
1. Klik button "Refresh" atau "Update Data"
2. Atau tunggu auto-refresh (jika ada interval)
3. Observe data terupdate

**Expected Result:**
* Data fresh dari database
* Stat cards update dengan nomor terbaru
* Tidak perlu reload page

---

### (Type) E2E

**Test Case 71**

(Positive)

**Test Scenario:**
Full E2E: Admin kecamatan lihat dashboard → Klik laporan pending → Update status → Dashboard refresh

**Pre Condition:**
* Admin login sebagai kecamatan
* Ada laporan pending di dashboard

**Step:**
1. Lihat dashboard - catat pending count
2. Klik link/button untuk laporan pending
3. Navigate ke laporan list
4. Klik laporan untuk detail
5. Verifikasi laporan
6. Kembali ke dashboard
7. Observe pending count berkurang

**Expected Result:**
* Dashboard stat update reflect perubahan
* Pending count berkurang 1 setelah verify
* Real-time sync atau refresh menampilkan perubahan

---

## PAGE: SuperAdminDashboard.jsx

---

### (Type) Functional

**Test Case 72**

(Positive)

**Test Scenario:**
Super admin dapat melihat performa semua kecamatan di dashboard

**Pre Condition:**
* User login sebagai super_admin
* Ada laporan dari 2+ kecamatan di database
* Berada di SuperAdminDashboard

**Step:**
1. Buka halaman SuperAdminDashboard
2. Observe top stats: total laporan, avg durasi, best performer
3. Lihat ranking table kecamatan
4. Observe setiap row: kecamatan name, total laporan, avg duration, performance badge

**Expected Result:**
* Dashboard load dengan data akurat dari semua kecamatan
* Stats menampilkan aggregated data
* Ranking table terurut (by avg duration atau total laporan)
* Performance color indicator (green=fast, red=slow)

---

### (Type) Functional

**Test Case 73**

(Positive)

**Test Scenario:**
Super admin dapat sort ranking table by average duration atau by total laporan

**Pre Condition:**
* Dashboard terbuka
* Ranking table visible
* Ada sortable column header

**Step:**
1. Observe table header: "Rata-rata Durasi" atau "Total Laporan"
2. Klik header untuk sort
3. First click: ascending order
4. Second click: descending order
5. Observe table reorder

**Expected Result:**
* Sort bekerja dengan baik
* Ascending/descending toggle working
* Table data reorder sesuai pilihan
* Sort indicator (up/down arrow) visible

---

### (Type) Functional

**Test Case 74**

(Positive)

**Test Scenario:**
Dashboard menampilkan KPI metrics: total laporan, average resolution time, response rate

**Pre Condition:**
* Dashboard terbuka
* Data dari database ready

**Step:**
1. Lihat stat cards untuk KPI
2. Verify: Total Laporan (aggregated)
3. Verify: Avg Resolution Time (in hours/days)
4. Verify: Response Rate (percentage dari laporan yang processed)

**Expected Result:**
* KPI metrics tampil dengan accurate data
* Format number readable (e.g., "2.5 hari" bukan "2.5")
* Percentage dengan % symbol

---

### (Type) Functional

**Test Case 75**

(Positive)

**Test Scenario:**
Super admin dapat lihat performance comparison: fastest vs slowest kecamatan

**Pre Condition:**
* Dashboard terbuka
* Ada highlight untuk top performer dan slowest

**Step:**
1. Lihat section "Kecamatan Tercepat" atau "Top Performer"
2. Observe badge 🥇 (gold medal)
3. Lihat section "Kecamatan Terlambat" atau "Slowest"
4. Observe badge 🐢 atau red highlight

**Expected Result:**
* Fastest kecamatan highlighted dengan gold medal
* Slowest highlighted dengan alert/warning style
* Data akurat dari calculation

---

### (Type) Functional

**Test Case 76**

(Positive)

**Test Scenario:**
Dashboard dapat download/export laporan summary (jika fitur ada)

**Pre Condition:**
* Dashboard terbuka
* Ada button export atau download

**Step:**
1. Klik button "Export" atau "Download Report"
2. Pilih format (PDF, Excel, CSV)
3. Tunggu download selesai

**Expected Result:**
* File berhasil download
* Format sesuai pilihan
* Data lengkap sesuai dashboard display
* Atau: jika feature belum ada, dokumentasikan

---

### (Type) E2E

**Test Case 77**

(Positive)

**Test Scenario:**
Full E2E: Super admin view dashboard → Identify slowest kecamatan → Drill down to laporan

**Pre Condition:**
* Super admin login
* Dashboard terbuka

**Step:**
1. Buka SuperAdminDashboard
2. Identify slowest kecamatan from ranking
3. Klik kecamatan untuk drill down
4. View laporan dari kecamatan tersebut
5. Analyze laporan untuk identify bottleneck

**Expected Result:**
* Dashboard navigation smooth
* Drill down to kecamatan detail
* Laporan list filtered by kecamatan
* Can analyze performance metrics per kecamatan

---

### (Type) Explore

**Test Case 78**

(Positive)

**Test Scenario:**
Explore real-time update pada dashboard (websocket atau polling)

**Pre Condition:**
* Dashboard terbuka dan visible
* Laporan baru sedang dibuat di sistem (by other user)
* Real-time mechanism enabled

**Step:**
1. Buka dashboard di browser
2. Trigger new laporan creation (by test user atau manual)
3. Observe dashboard tanpa refresh
4. Wait 1-2 menit

**Expected Result:**
* Dashboard stat update tanpa manual refresh (jika real-time enabled)
* Atau: Polling interval fetch data (e.g., every 30 sec)
* Atau: Manual refresh button untuk user trigger update

---

# MODULE 4: NOTIFICATIONS & FEEDBACK

## PAGE: NotifikasiPetugas.jsx

---

### (Type) Functional

**Test Case 79**

(Positive)

**Test Scenario:**
Petugas dapat melihat daftar notifikasi (title, message, status baca/unread)

**Pre Condition:**
* User login sebagai petugas atau admin
* Ada notifikasi di database untuk user
* Berada di halaman NotifikasiPetugas

**Step:**
1. Buka halaman Notifikasi
2. Observe daftar notifikasi card
3. Verify setiap card menampilkan: title, pesan, timestamp, status baca

**Expected Result:**
* Notifikasi list tampil dengan format rapi
* Unread notifikasi mungkin highlight berbeda dari read
* Data akurat sesuai database

---

### (Type) Functional

**Test Case 80**

(Positive)

**Test Scenario:**
Petugas dapat mark notifikasi sebagai read (baca)

**Pre Condition:**
* Ada unread notifikasi
* Halaman notifikasi terbuka

**Step:**
1. Lihat notifikasi dengan status unread
2. Klik button "Tandai Dibaca" pada notifikasi
3. Atau klik notifikasi untuk auto-mark as read

**Expected Result:**
* Notifikasi status berubah ke read
* Visual/highlight berubah (jika ada)
* Database updated (is_read = true)
* Auto-remove dari unread count

---

### (Type) Functional

**Test Case 81**

(Negative)

**Test Scenario:**
Halaman notifikasi menampilkan "Belum ada notifikasi" jika kosong

**Pre Condition:**
* User tidak ada notifikasi
* Database query return empty
* Halaman terbuka

**Step:**
1. Buka halaman notifikasi
2. Observe empty state

**Expected Result:**
* Empty state message tampil: "Belum ada notifikasi"
* No error message
* Layout still readable

---

### (Type) Functional

**Test Case 82**

(Positive)

**Test Scenario:**
Petugas dapat navigate kembali ke dashboard dari notifikasi page

**Pre Condition:**
* Halaman notifikasi terbuka

**Step:**
1. Klik button "Kembali ke Dashboard" atau back button
2. Observe route change

**Expected Result:**
* Navigate ke halaman Laporan
* URL berubah ke /laporan
* Notifikasi page tidak lagi terlihat

---

### (Type) Functional

**Test Case 83**

(Positive)

**Test Scenario:**
Notifikasi auto-mark as read saat page load (jika ada unread)

**Pre Condition:**
* Ada unread notifikasi
* Halaman NotifikasiPetugas akan load
* Auto-mark feature ada di code

**Step:**
1. Buka halaman Notifikasi
2. Observe notifikasi list load
3. Check notification status

**Expected Result:**
* Unread notifikasi auto-marked as read saat page load
* Database update untuk semua unread
* Notifikasi list mungkin refresh to show updated status

---

## PAGE: AdminSelesai.jsx

---

### (Type) Functional

**Test Case 84**

(Positive)

**Test Scenario:**
Admin dapat upload bukti penyelesaian dengan foto URL dan keterangan

**Pre Condition:**
* User login sebagai admin/petugas
* Berada di halaman AdminSelesai dengan laporan ID di URL
* Ada form dengan field foto URL dan keterangan

**Step:**
1. Lihat form upload bukti
2. Isi field "Bukti Foto" dengan URL image: "https://example.com/foto.jpg"
3. Isi field "Keterangan": "Perbaikan jalan selesai sempurna"
4. Klik tombol "Simpan" atau "Selesaikan"

**Expected Result:**
* Form submit
* Bukti URL tersimpan di database
* Laporan status berubah ke "selesai"
* Page show success message: "Laporan berhasil diselesaikan"
* Navigate ke /admin atau laporan detail

---

### (Type) Functional

**Test Case 85**

(Negative)

**Test Scenario:**
Form upload bukti gagal submit jika URL foto kosong

**Pre Condition:**
* Form terbuka
* Foto URL required

**Step:**
1. Kosongkan field "Bukti Foto"
2. Isi keterangan
3. Klik tombol submit

**Expected Result:**
* Form validation error
* Error message: "Bukti foto wajib diisi"
* Field show required indicator
* Form tidak submit

---

### (Type) Functional

**Test Case 86**

(Positive)

**Test Scenario:**
Admin dapat preview foto sebelum submit dengan image loaded dari URL

**Pre Condition:**
* Form terbuka
* Valid image URL ready

**Step:**
1. Isi field foto URL dengan valid image URL
2. Observe image preview area
3. Verify foto tampil sebagai preview

**Expected Result:**
* Foto preview tampil
* Image load dari URL
* User bisa verify foto sebelum submit

---

### (Type) Functional

**Test Case 87**

(Negative)

**Test Scenario:**
Form show error jika image URL invalid atau image tidak bisa load

**Pre Condition:**
* Form terbuka
* Invalid atau broken image URL

**Step:**
1. Isi foto URL dengan broken link: "https://invalid.url/notfound.jpg"
2. Observe preview area

**Expected Result:**
* Image tidak tampil di preview
* Error indicator atau message tampil
* Atau: Form bisa submit tapi backend validate
* Clear feedback untuk user

---

### (Type) Functional

**Test Case 88**

(Positive)

**Test Scenario:**
Info banner tampil menjelaskan bahwa setelah submit, status akan selesai dan irreversible

**Pre Condition:**
* Form terbuka
* Ada info/warning banner

**Step:**
1. Observe banner/alert di form
2. Baca info message

**Expected Result:**
* Info banner visible dengan text: "Setelah disimpan, status laporan akan berubah menjadi selesai dan tidak dapat diubah kembali"
* Styling warning/amber color
* Clear UX feedback

---

### (Type) E2E

**Test Case 89**

(Positive)

**Test Scenario:**
Full E2E: Admin open laporan → Upload bukti selesai → Verify status change → Check detail page

**Pre Condition:**
* Admin login
* Laporan in_progress dengan ID di URL

**Step:**
1. Buka AdminSelesai dengan laporan ID
2. Fill form dengan foto URL dan keterangan
3. Klik submit
4. Tunggu success message
5. Navigate ke laporan detail
6. Verify status sudah "selesai"
7. Verify bukti tampil di detail page

**Expected Result:**
* Bukti upload berhasil
* Status update to selesai
* Detail page reflect changes
* Bukti visible di laporan detail

---

# MODULE 5: SECURITY & AUTHORIZATION

---

### (Type) Functional

**Test Case 90**

(Negative)

**Test Scenario:**
Warga tidak bisa akses halaman admin (dashboard, laporan masuk, kendala tab)

**Pre Condition:**
* User login sebagai warga
* Mencoba akses admin-only pages

**Step:**
1. Login sebagai warga
2. Coba akses URL: /dashboard
3. Atau coba akses URL: /admin
4. Observe response

**Expected Result:**
* Redirect ke /laporan (default warga page)
* Admin dashboard tidak accessible
* No 404 error, just silent redirect
* Security working

---

### (Type) Functional

**Test Case 91**

(Negative)

**Test Scenario:**
Petugas tidak bisa akses super admin only features (e.g., duplicate detection, super dashboard)

**Pre Condition:**
* User login sebagai petugas
* Super admin features exist

**Step:**
1. Login sebagai petugas
2. Cek apakah tab "Duplikat" visible
3. Coba akses /dashboard

**Expected Result:**
* Tab "Duplikat" tidak visible/hidden
* /dashboard redirect ke /laporan atau show permission denied
* Feature tersembunyi/disabled untuk petugas role

---

### (Type) Functional

**Test Case 92**

(Negative)

**Test Scenario:**
Admin kecamatan hanya bisa lihat laporan dari kecamatan sendiri (RLS/data filtering)

**Pre Condition:**
* User login sebagai admin kecamatan A
* Ada laporan dari kecamatan B di database
* Berada di laporan list

**Step:**
1. Buka laporan list atau dashboard
2. Verify data yang tampil hanya dari kecamatan A
3. Atau: coba akses laporan dari kecamatan B langsung by URL/parameter

**Expected Result:**
* Laporan kecamatan B tidak tampil
* Data filtering berdasarkan user's kecamatan_id
* RLS (Row Level Security) enforced
* Security protected

---

### (Type) E2E

**Test Case 93**

(Negative)

**Test Scenario:**
User logout → Akses protected route → Redirect to login

**Pre Condition:**
* User login
* Logout
* Try akses protected route

**Step:**
1. Login dengan account valid
2. Klik tombol Logout
3. Logout successful
4. Langsung akses URL protected: /profile
5. Observe redirect

**Expected Result:**
* Redirect to /login
* ProtectedRoute guard working
* No direct access ke profile tanpa login
* Session/token cleared

---

### (Type) Explore

**Test Case 94**

(Negative)

**Test Scenario:**
Explore invalid token handling: Old/expired token tidak bisa akses API

**Pre Condition:**
* User punya old/expired token
* Try make API call dengan token ini

**Step:**
1. Manually inject expired token
2. Try fetch API endpoint (e.g., /laporan)
3. Observe response

**Expected Result:**
* API return 401 Unauthorized
* Frontend handle error gracefully
* Redirect to login atau show token expired message
* Security working

---

# MODULE 6: FORM VALIDATION & INPUT

---

### (Type) BVA

**Test Case 95**

(Negative)

**Test Scenario:**
Form input field dengan max length validation (boundary test)

**Pre Condition:**
* Any form dengan field yang punya max length (e.g., judul max 200 char)
* Test input dengan exactly max + 1 characters

**Step:**
1. Isi field dengan max+1 character (e.g., 201 chars)
2. Try submit

**Expected Result:**
* Browser/HTML5 atau backend reject jika ada validation
* Field mungkin auto-truncate (jika implemented)
* Error message tampil
* Clear feedback

---

### (Type) EP

**Test Case 96**

(Negative)

**Test Scenario:**
Special characters input testing (SQL injection prevention)

**Pre Condition:**
* Any input field (judul, alamat, catatan, dll)
* SQL injection payload: "'; DROP TABLE--"

**Step:**
1. Isi field dengan SQL payload
2. Submit form
3. Verify database still intact

**Expected Result:**
* Input treated as plain text (sanitized)
* No SQL injection exploit working
* Data tersimpan sebagai string literal
* Database protection working

---

### (Type) Functional

**Test Case 97**

(Positive)

**Test Scenario:**
Form field dapat handle international characters dan emoji

**Pre Condition:**
* Any form dengan text input
* International chars ready

**Step:**
1. Isi field dengan karakter: "جميع الأحرف العربية" (Arabic)
2. Atau: "你好世界" (Chinese)
3. Atau: "😀😁😂" (emoji)
4. Submit form

**Expected Result:**
* Input accepted
* Tersimpan di database dengan karakter asli
* Display correct saat retrieve

---

### (Type) BVA

**Test Case 98**

(Negative)

**Test Scenario:**
Email field boundary test: very long email address (255+ chars)

**Pre Condition:**
* Email field terbuka
* Standard email max length adalah 254 chars (RFC)

**Step:**
1. Isi email dengan 255+ chars: "verylongemail" x 30 + "@example.com"
2. Try submit

**Expected Result:**
* Email validation reject (too long)
* Error message atau HTML5 validation
* Standard email length enforced

---

### (Type) Functional

**Test Case 99**

(Positive)

**Test Scenario:**
Form field show helpful error message saat validation fail

**Pre Condition:**
* Any form dengan validation
* Intentionally trigger error

**Step:**
1. Isi field dengan invalid data
2. Try submit
3. Observe error message

**Expected Result:**
* Error message specific dan helpful
* Not generic "Error" message
* Guide user untuk fix (e.g., "Min 10 digit")
* Good UX

---

### (Type) E2E

**Test Case 100**

(Positive)

**Test Scenario:**
Full form workflow: Fill → Validate → Submit → Success → Navigate

**Pre Condition:**
* Any complex form (LaporanForm)

**Step:**
1. Fill all required fields dengan valid data
2. Submit form
3. Wait for success
4. Observe navigation
5. Verify data saved

**Expected Result:**
* Seluruh flow seamless
* No error saat submit
* Success feedback
* Navigate to appropriate page
* Data persistent di database

---

