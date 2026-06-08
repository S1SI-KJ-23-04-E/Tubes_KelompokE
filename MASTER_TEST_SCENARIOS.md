# MASTER TEST SCENARIO - SIMIKOT v2.0

**This document is the SINGLE SOURCE OF TRUTH for all automated testing scenarios.**

---

## MODULE 1: AUTHENTICATION

---

### TEST CASE 1

**Category:** Functional

**Type:** Positive

**Test Scenario:**
Pengguna berhasil login dengan kredensial email dan password yang valid

**Pre Condition:**
- Pengguna telah membuka aplikasi web
- Pengguna belum terautentikasi
- Koneksi ke backend server aktif
- Database Supabase dapat diakses

**Steps:**
1. Buka halaman `Login`
2. Isi field `Email` dengan email terdaftar valid (contoh: user@gmail.com)
3. Isi field `Password` dengan password yang benar
4. Klik tombol `Login`
5. Tunggu response dari server

**Expected Result:**
- Autentikasi berhasil
- Token disimpan di session lokal
- Pengguna diarahkan ke halaman `Laporan`
- Navbar menampilkan nama pengguna
- Tidak ada pesan error

---

### TEST CASE 2

**Category:** Functional

**Type:** Negative

**Test Scenario:**
Pengguna gagal login dengan password yang salah

**Pre Condition:**
- Pengguna telah membuka aplikasi web
- Email akun sudah terdaftar di sistem
- Koneksi ke backend server aktif

**Steps:**
1. Buka halaman `Login`
2. Isi field `Email` dengan email yang terdaftar
3. Isi field `Password` dengan password yang salah
4. Klik tombol `Login`

**Expected Result:**
- Sistem menampilkan pesan error: "Email atau password yang kamu masukkan salah."
- Pengguna tetap berada di halaman `Login`
- Tidak ada redirect ke halaman lain
- Field password dikosongkan untuk keamanan

---

### TEST CASE 3

**Category:** Functional

**Type:** Negative

**Test Scenario:**
Pengguna gagal login tanpa mengisi field email

**Pre Condition:**
- Pengguna telah membuka aplikasi web
- Halaman `Login` sudah siap

**Steps:**
1. Buka halaman `Login`
2. Kosongkan field `Email`
3. Isi field `Password` dengan password apapun
4. Klik tombol `Login`

**Expected Result:**
- Browser validation menolak submit
- Pesan error HTML5: "Email wajib diisi"
- Tombol `Login` tidak aktif/disabled
- Form tidak terkirim ke server

---

### TEST CASE 4

**Category:** Functional

**Type:** Boundary Value Analysis

**Test Scenario:**
Pengguna gagal login dengan email yang tidak terdaftar

**Pre Condition:**
- Pengguna telah membuka aplikasi web
- Email tidak pernah terdaftar di sistem

**Steps:**
1. Buka halaman `Login`
2. Isi field `Email` dengan email yang tidak terdaftar (contoh: tidak_ada@gmail.com)
3. Isi field `Password` dengan password apapun
4. Klik tombol `Login`

**Expected Result:**
- Sistem menampilkan pesan error: "Email atau password yang kamu masukkan salah."
- Error message generic (tidak memberitahu bahwa email tidak ada)
- Pengguna tetap di halaman `Login`

---

### TEST CASE 5

**Category:** Functional

**Type:** Equivalence Partitioning

**Test Scenario:**
Pengguna berhasil logout dari aplikasi

**Pre Condition:**
- Pengguna sudah terautentikasi dan login
- Berada di halaman `Laporan` atau halaman yang dilindungi

**Steps:**
1. Lihat tombol `Keluar` di navbar
2. Klik tombol `Keluar`
3. Tunggu session dihapus

**Expected Result:**
- Session user dihapus
- User diarahkan ke halaman `Login`
- Token tidak lagi tersimpan di browser
- Akses ke halaman protected tertolak

---

## MODULE 2: REGISTRATION

---

### TEST CASE 6

**Category:** Functional

**Type:** Positive

**Test Scenario:**
Pengguna berhasil mendaftar dengan email @gmail.com dan password valid

**Pre Condition:**
- Pengguna belum memiliki akun
- Halaman `Register` dapat diakses
- Email @gmail.com belum terdaftar

**Steps:**
1. Buka halaman `Register`
2. Isi field `Nama Lengkap` dengan nama valid (contoh: Budi Santoso)
3. Pilih `Kecamatan Domisili` (opsional)
4. Isi field `Email` dengan email @gmail.com valid
5. Isi field `Password` minimal 6 karakter
6. Klik tombol `Daftar Sekarang`
7. Tunggu konfirmasi dari server

**Expected Result:**
- Akun user berhasil dibuat di Supabase
- Role otomatis set ke `warga`
- Sistem menampilkan pesan: "Pendaftaran berhasil! Silakan login dengan akun yang baru dibuat."
- User diarahkan ke halaman `Login`
- Profile record dibuat di tabel `profiles`

---

### TEST CASE 7

**Category:** Functional

**Type:** Negative

**Test Scenario:**
Pengguna gagal mendaftar dengan email yang bukan domain @gmail.com

**Pre Condition:**
- Pengguna belum memiliki akun
- Halaman `Register` dapat diakses

**Steps:**
1. Buka halaman `Register`
2. Isi field `Nama Lengkap`
3. Isi field `Email` dengan email non-@gmail.com (contoh: user@yahoo.com atau user@custom.com)
4. Isi field `Password` valid
5. Klik tombol `Daftar Sekarang`

**Expected Result:**
- Sistem menampilkan error: "Hanya email dengan domain @gmail.com yang diizinkan"
- Akun tidak dibuat
- User tetap di halaman `Register`

---

### TEST CASE 8

**Category:** Functional

**Type:** Negative

**Test Scenario:**
Pengguna gagal mendaftar dengan password kurang dari 6 karakter

**Pre Condition:**
- Pengguna belum memiliki akun
- Halaman `Register` dapat diakses

**Steps:**
1. Buka halaman `Register`
2. Isi field `Nama Lengkap`
3. Isi field `Email` dengan email @gmail.com
4. Isi field `Password` dengan kurang dari 6 karakter (contoh: 12345)
5. Klik tombol `Daftar Sekarang`

**Expected Result:**
- Sistem menampilkan error: "Password minimal 6 karakter"
- Akun tidak dibuat
- User tetap di halaman `Register`

---

### TEST CASE 9

**Category:** Functional

**Type:** Boundary Value Analysis

**Test Scenario:**
Pengguna gagal mendaftar dengan nama kosong

**Pre Condition:**
- Halaman `Register` dapat diakses

**Steps:**
1. Buka halaman `Register`
2. Kosongkan field `Nama Lengkap`
3. Isi field lain dengan benar
4. Klik tombol `Daftar Sekarang`

**Expected Result:**
- Browser validation menolak submit
- Pesan: "Nama Lengkap wajib diisi"
- Form tidak terkirim

---

### TEST CASE 10

**Category:** Functional

**Type:** Equivalence Partitioning

**Test Scenario:**
Pengguna berhasil mendaftar dengan memilih kecamatan domisili

**Pre Condition:**
- Pengguna belum memiliki akun
- Daftar kecamatan tersedia di dropdown

**Steps:**
1. Buka halaman `Register`
2. Isi `Nama Lengkap`
3. Klik dropdown `Kecamatan Domisili` dan pilih satu kecamatan
4. Isi `Email` dan `Password` dengan benar
5. Klik tombol `Daftar Sekarang`

**Expected Result:**
- Akun berhasil dibuat
- Field `kecamatan_id` tersimpan di profile
- User dapat login dan profile menampilkan kecamatan pilihan

---

## MODULE 3: LAPORAN (CREATE & VIEW)

---

### TEST CASE 11

**Category:** Functional

**Type:** Positive

**Test Scenario:**
Pengguna berhasil membuat laporan baru dengan semua data wajib terisi

**Pre Condition:**
- Pengguna sudah login sebagai warga
- Berada di halaman `Laporan Form`
- Koneksi internet stabil
- Geolocation tersedia

**Steps:**
1. Buka halaman `Laporan Form` (klik tombol `Buat Laporan`)
2. Isi field `Judul` (contoh: Jalan Rusak Parah)
3. Pilih `Kecamatan` dari dropdown
4. Pilih `Kelurahan` dari dropdown (sesuai kecamatan)
5. Isi field `Deskripsi` dengan detail masalah
6. Isi field `Alamat` dengan lokasi spesifik
7. Upload foto bukti (opsional)
8. Klik tombol `Buat Laporan`

**Expected Result:**
- Laporan tersimpan di database dengan status `pending`
- Geolocation otomatis diisi atau bisa di-drag marker
- User diarahkan ke halaman `Laporan` tab `History Saya`
- Laporan baru tampil di list dengan status `Menunggu Verifikasi`
- Tidak ada error message

---

### TEST CASE 12

**Category:** Functional

**Type:** Negative

**Test Scenario:**
Pengguna gagal membuat laporan jika kecamatan atau kelurahan kosong

**Pre Condition:**
- Pengguna sudah login
- Berada di halaman `Laporan Form`

**Steps:**
1. Buka halaman `Laporan Form`
2. Isi field `Judul`, `Deskripsi`, `Alamat`
3. JANGAN pilih `Kecamatan` atau `Kelurahan`
4. Klik tombol `Buat Laporan`

**Expected Result:**
- Sistem menampilkan modal dialog error: "Harap pilih Kecamatan dan Kelurahan"
- Laporan tidak tersimpan
- User tetap di halaman form

---

### TEST CASE 13

**Category:** Functional

**Type:** Positive

**Test Scenario:**
Pengguna berhasil melihat daftar laporan publik dari warga lain

**Pre Condition:**
- Pengguna sudah login sebagai warga
- Minimal ada 1 laporan dari user lain di database

**Steps:**
1. Login sebagai warga
2. Buka menu `Laporan Publik` atau tab `Laporan Publik`
3. Amati daftar laporan
4. Klik salah satu laporan untuk melihat detail

**Expected Result:**
- Sistem menampilkan daftar laporan dari warga lain
- Laporan pribadi tidak tampil (filtered out)
- Setiap laporan menampilkan: judul, lokasi, status, upvote count
- Detail laporan dapat dibuka

---

### TEST CASE 14

**Category:** Functional

**Type:** Negative

**Test Scenario:**
Pengguna gagal menghapus laporan yang sudah terverifikasi

**Pre Condition:**
- Pengguna login sebagai warga
- Memiliki laporan dengan status != `pending`

**Steps:**
1. Buka halaman `History Saya`
2. Cari laporan dengan status bukan `Menunggu Verifikasi`
3. Klik tombol delete/hapus pada laporan

**Expected Result:**
- Tombol hapus tidak aktif atau tidak tampil
- System tidak mengizinkan penghapusan laporan non-pending
- Pesan informasi tampil

---

### TEST CASE 15

**Category:** Functional

**Type:** Boundary Value Analysis

**Test Scenario:**
Pengguna berhasil membuat laporan tanpa upload foto

**Pre Condition:**
- Pengguna login sebagai warga
- Berada di form laporan

**Steps:**
1. Isi semua field (judul, deskripsi, alamat, kecamatan, kelurahan)
2. JANGAN upload foto
3. Klik tombol `Buat Laporan`

**Expected Result:**
- Laporan tetap tersimpan dengan `foto_url` = null
- Tidak ada error
- Laporan dapat dilihat dengan field foto kosong/blank

---

## MODULE 4: LAPORAN DETAIL & INTERACTION

---

### TEST CASE 16

**Category:** Functional

**Type:** Positive

**Test Scenario:**
Pengguna berhasil memberikan dukungan (upvote) pada laporan aktif

**Pre Condition:**
- Pengguna login sebagai warga
- Laporan target berstatus `pending`, `verified`, atau `in_progress`
- User belum pernah upvote laporan ini

**Steps:**
1. Buka halaman `Laporan Detail` dari halaman `Laporan Publik`
2. Lihat tombol `Dukung Laporan Ini`
3. Klik tombol dukungan

**Expected Result:**
- Tombol berubah label menjadi `Laporan Didukung ✓`
- Warna tombol berubah (highlight)
- Jumlah dukungan (`Dukungan: X Suara`) bertambah 1
- Tidak ada error
- Data tersimpan di database tabel `upvote`

---

### TEST CASE 17

**Category:** Functional

**Type:** Negative

**Test Scenario:**
Pengguna gagal memberikan dukungan pada laporan yang sudah selesai/ditolak

**Pre Condition:**
- Pengguna login sebagai warga
- Laporan target berstatus `done` atau `rejected`

**Steps:**
1. Buka halaman `Laporan Detail` dari laporan dengan status selesai
2. Amati tombol dukungan

**Expected Result:**
- Tombol dukungan tidak aktif/disabled
- Teks helper tampil: "Dukungan ditutup karena laporan telah selesai"
- User tidak dapat klik tombol
- Upvote tidak berubah

---

### TEST CASE 18

**Category:** Functional

**Type:** Negative

**Test Scenario:**
Pengguna gagal memberikan dukungan tanpa login

**Pre Condition:**
- Pengguna belum login
- Halaman `Laporan Detail` dapat diakses public

**Steps:**
1. Logout atau buka URL laporan detail tanpa login
2. Amati tombol dukungan

**Expected Result:**
- Tombol dukungan tidak aktif
- Teks helper: "Login untuk memberikan dukungan"
- Upvote tidak berubah
- Klik tombol tidak menghasilkan aksi

---

### TEST CASE 19

**Category:** Functional

**Type:** Positive

**Test Scenario:**
Pengguna berhasil membatalkan dukungan (unupvote) pada laporan

**Pre Condition:**
- Pengguna login sebagai warga
- Pengguna sudah upvote laporan ini sebelumnya
- Laporan masih dalam status aktif (bukan done/rejected)

**Steps:**
1. Buka halaman `Laporan Detail` dari laporan yang sudah di-upvote
2. Lihat tombol dengan label `Laporan Didukung ✓`
3. Klik tombol untuk membatalkan dukungan

**Expected Result:**
- Toggle upvote berhasil
- Tombol kembali ke label `Dukung Laporan Ini`
- Jumlah dukungan berkurang 1
- Database diupdate: upvote record dihapus

---

### TEST CASE 20

**Category:** Functional

**Type:** Positive

**Test Scenario:**
Admin petugas berhasil mengunggah bukti penyelesaian laporan

**Pre Condition:**
- Pengguna login sebagai petugas/kecamatan
- Laporan dalam status `in_progress`
- Belum ada bukti selesai
- Foto bukti sudah disiapkan (format JPG/PNG)

**Steps:**
1. Buka halaman `Laporan Detail` dari laporan in_progress
2. Klik tombol `Upload Bukti Selesai`
3. Modal dialog terbuka
4. Klik area foto untuk browse file
5. Pilih file foto (JPG/PNG, max 10MB)
6. Isi field `Keterangan Bukti` dengan deskripsi
7. Klik tombol `Kirim Bukti`

**Expected Result:**
- Foto berhasil di-upload ke Supabase storage
- Laporan status berubah ke `done` / `selesai`
- Record `bukti_selesai` dibuat di database
- Modal tertutup
- Halaman refresh menampilkan section `Perbaikan Selesai` dengan foto
- Timeline menampilkan event status change

---

### TEST CASE 21

**Category:** Functional

**Type:** Negative

**Test Scenario:**
Petugas gagal mengunggah bukti tanpa memilih foto

**Pre Condition:**
- Petugas membuka modal `Upload Bukti Selesai`
- Laporan status `in_progress`

**Steps:**
1. Buka modal `Upload Bukti Selesai`
2. Biarkan field foto kosong (tidak pilih file)
3. Isi field `Keterangan Bukti`
4. Amati tombol `Kirim Bukti`

**Expected Result:**
- Tombol `Kirim Bukti` disabled/tidak aktif
- Tidak bisa submit
- Pesan error tidak ada (button disabled saja cukup)

---

### TEST CASE 22

**Category:** Functional

**Type:** Positive

**Test Scenario:**
Petugas berhasil melaporkan kendala lapangan saat laporan in_progress

**Pre Condition:**
- Pengguna login sebagai petugas
- Laporan dalam status `in_progress`
- Halaman `Laporan Detail` terbuka

**Steps:**
1. Lihat tombol `Lapor Kendala`
2. Klik tombol
3. Modal dialog `Laporan Kendala` terbuka
4. Isi field deskripsi kendala: "Cuaca buruk, pekerjaan tertunda"
5. Klik tombol `Kirim Laporan Kendala`

**Expected Result:**
- Kendala berhasil disimpan di tabel `kendala_laporan`
- Modal tertutup
- Halaman refresh
- Section `Kendala Lapangan` tampil dengan kendala baru
- Timeline terupdate

---

### TEST CASE 23

**Category:** Functional

**Type:** Negative

**Test Scenario:**
Petugas gagal melaporkan kendala dengan deskripsi kosong

**Pre Condition:**
- Modal `Laporan Kendala` terbuka
- Pengguna login sebagai petugas

**Steps:**
1. Buka modal `Laporan Kendala`
2. Biarkan field deskripsi kosong
3. Amati tombol `Kirim Laporan Kendala`

**Expected Result:**
- Tombol disabled/tidak aktif
- Tidak bisa submit
- Pesan placeholder: "Jelaskan kendala teknis atau lapangan..."

---

## MODULE 5: ADMIN ACTIONS

---

### TEST CASE 24

**Category:** Functional

**Type:** Positive

**Test Scenario:**
Admin berhasil memverifikasi laporan dari status pending ke verified

**Pre Condition:**
- Pengguna login sebagai admin kecamatan atau super_admin
- Laporan dalam status `pending`
- Halaman `Laporan Detail` terbuka

**Steps:**
1. Buka halaman `Laporan Detail` dari laporan dengan status `Menunggu Verifikasi`
2. Lihat tombol `✓ Verifikasi` di section panel admin
3. Klik tombol verifikasi

**Expected Result:**
- Laporan status berubah ke `verified` / `Terverifikasi`
- Progress bar stepper bergerak ke step 2
- Timeline terupdate dengan event verifikasi
- Badge status berubah dari kuning (pending) ke biru (verified)
- Petugas/tim lapangan bisa mulai perbaikan

---

### TEST CASE 25

**Category:** Functional

**Type:** Negative

**Test Scenario:**
Admin gagal menyelesaikan laporan tanpa bukti foto

**Pre Condition:**
- Admin login sebagai moderator
- Laporan dalam status `in_progress`
- BELUM ada bukti_selesai yang terupload
- Halaman `Laporan Detail` terbuka

**Steps:**
1. Scroll ke panel admin section
2. Amati area tombol untuk mengubah status menjadi `Selesai`

**Expected Result:**
- Tombol `✓ Selesai` tidak tampil / hidden
- Pesan penjelas tampil: "Menunggu petugas mengunggah bukti selesai."
- Admin tidak bisa force-complete tanpa bukti
- Status tetap `in_progress`

---

### TEST CASE 26

**Category:** Functional

**Type:** Positive

**Test Scenario:**
Admin berhasil menolak laporan dengan keterangan penolakan

**Pre Condition:**
- Admin login sebagai kecamatan/super_admin
- Laporan dalam status `pending`

**Steps:**
1. Buka `Laporan Detail` dari laporan pending
2. Lihat tombol `✕ Tolak` di panel admin
3. Klik tombol tolak
4. Modal dialog terbuka untuk input keterangan
5. Isi keterangan penolakan: "Laporan tidak jelas, foto tidak valid"
6. Klik tombol `Konfirmasi Penolakan`

**Expected Result:**
- Laporan status berubah ke `rejected` / `Ditolak`
- Badge status berubah merah
- Pelapor mendapat notifikasi penolakan
- Timeline mencatat event penolakan dengan keterangan
- Progress badge tampil status ditolak (X icon merah)

---

### TEST CASE 27

**Category:** Functional

**Type:** Positive

**Test Scenario:**
Admin berhasil mengubah prioritas laporan dari low ke high

**Pre Condition:**
- Admin login sebagai kecamatan/super_admin
- Laporan tersedia dengan prioritas `low`

**Steps:**
1. Buka `Laporan Detail` atau `Laporan List`
2. Lihat dropdown/button prioritas (biasanya di admin panel)
3. Klik `HIGH` untuk mengubah prioritas

**Expected Result:**
- Prioritas laporan berubah ke `high`
- Visual indicator berubah (color/badge)
- Database terupdate
- Laporan akan muncul lebih atas di list sorting by priority
- Timestamp `updated_at` terupdate

---

### TEST CASE 28

**Category:** Functional

**Type:** Positive

**Test Scenario:**
Admin berhasil menambahkan catatan internal pada laporan

**Pre Condition:**
- Admin login sebagai kecamatan/super_admin
- Halaman `Laporan Detail` terbuka

**Steps:**
1. Klik tombol/icon untuk mengedit catatan (edit icon / button)
2. Modal catatan terbuka
3. Isi field dengan catatan internal: "Perlu koordinasi dengan dinas PU"
4. Klik tombol `Simpan Catatan`

**Expected Result:**
- Catatan tersimpan di field `catatan` laporan
- Modal tertutup
- Halaman refresh
- Catatan tampil di section catatan admin (highlight)
- Timeline mencatat perubahan

---

## MODULE 6: PROFILE

---

### TEST CASE 29

**Category:** Functional

**Type:** Positive

**Test Scenario:**
Pengguna berhasil memperbarui profil dengan semua field valid

**Pre Condition:**
- Pengguna login
- Berada di halaman `Profil` atau menu profile
- Internet aktif

**Steps:**
1. Buka halaman `Profil`
2. Isi field `Nama Lengkap`: "Budi Santoso"
3. Isi field `Alamat`: "Jl. Contoh No 10"
4. Isi field `Nomor HP`: "081234567890"
5. Klik tombol `Simpan Perubahan`

**Expected Result:**
- Profil berhasil disimpan
- Sistem menampilkan pesan: "Profil berhasil diperbarui."
- Progress bar completion mencapai 100%
- Nama di navbar terupdate real-time
- Tidak ada error

---

### TEST CASE 30

**Category:** Functional

**Type:** Negative

**Test Scenario:**
Pengguna gagal memperbarui profil dengan nomor HP tidak valid (non-digit)

**Pre Condition:**
- Pengguna berada di halaman profile update
- Field nama dan alamat sudah terisi

**Steps:**
1. Buka halaman `Profil`
2. Isi field `Nomor HP` dengan karakter non-digit: "08-1234-567890"
3. Klik tombol `Simpan Perubahan`

**Expected Result:**
- Sistem menampilkan error: "Hanya boleh angka"
- Perubahan tidak tersimpan
- Field phone menampilkan red border/error state

---

### TEST CASE 31

**Category:** Functional

**Type:** Boundary Value Analysis

**Test Scenario:**
Pengguna gagal memperbarui profil dengan nomor HP kurang dari 10 digit

**Pre Condition:**
- Pengguna berada di halaman profile
- Field lain valid

**Steps:**
1. Isi field `Nomor HP` dengan 9 digit: "081234567"
2. Klik tombol `Simpan Perubahan`

**Expected Result:**
- Sistem menampilkan error: "Minimal 10 digit"
- Perubahan tidak tersimpan
- Phone field error state

---

### TEST CASE 32

**Category:** Functional

**Type:** Equivalence Partitioning

**Test Scenario:**
Pengguna berhasil memperbarui profil dengan nomor HP exactly 10 digit (boundary)

**Pre Condition:**
- Pengguna di halaman profile
- Nama dan alamat terisi

**Steps:**
1. Isi field `Nomor HP` dengan exactly 10 digit: "0812345678"
2. Klik tombol `Simpan Perubahan`

**Expected Result:**
- Profil berhasil tersimpan
- No HP valid (tidak error)
- Check mark tampil di field

---

## MODULE 7: ADMIN DASHBOARD

---

### TEST CASE 33

**Category:** Functional

**Type:** Positive

**Test Scenario:**
Super admin berhasil melihat dashboard dengan performa semua kecamatan

**Pre Condition:**
- User login sebagai `super_admin`
- Minimal ada data laporan dari 2+ kecamatan

**Steps:**
1. Login sebagai super admin
2. Navigasi ke menu `Dashboard` atau halaman super admin
3. Halaman `SuperAdminDashboard` load

**Expected Result:**
- Dashboard menampilkan:
  - Total laporan keseluruhan
  - Ranking kecamatan by laporan selesai
  - KPI metrics (avg resolution time, response rate)
  - Table kecamatan dengan statistik
- Data akurat sesuai database
- Tidak ada error

---

### TEST CASE 34

**Category:** Functional

**Type:** Positive

**Test Scenario:**
Admin kecamatan berhasil melihat dashboard kecamatannya

**Pre Condition:**
- User login sebagai `kecamatan` (admin kecamatan)
- Ada laporan di kecamatan tersebut

**Steps:**
1. Login sebagai admin kecamatan
2. Buka halaman dashboard
3. `AdminKecamatanDashboard` load

**Expected Result:**
- Dashboard menampilkan data kecamatan spesifik saja
- Menampilkan: pending count, in_progress count, done count
- Distribution bar dengan persentase
- Notification badge untuk pending reports
- Tidak menampilkan data kecamatan lain

---

### TEST CASE 35

**Category:** Functional

**Type:** Positive

**Test Scenario:**
Warga gagal mengakses dashboard admin

**Pre Condition:**
- User login sebagai `warga`
- Mencoba akses URL `/dashboard` atau admin menu

**Steps:**
1. Login sebagai warga
2. Navigasi ke URL `/dashboard` atau klik menu dashboard
3. Sistem cek role & permission

**Expected Result:**
- User diarahkan redirect ke halaman `/laporan` (default warga)
- Dashboard admin tidak ditampilkan
- Tidak ada akses error, hanya redirect silent

---

## MODULE 8: DUPLICATE DETECTION & MERGE

---

### TEST CASE 36

**Category:** Functional

**Type:** Positive

**Test Scenario:**
Admin berhasil mendeteksi laporan duplikat berdasarkan lokasi

**Pre Condition:**
- Admin login sebagai kecamatan/super_admin
- Ada 2+ laporan dengan lokasi berdekatan (< 50 meter)
- Berada di tab `Duplikat` di `LaporanList`

**Steps:**
1. Buka tab `Duplikat` di menu admin
2. Sistem auto-load duplicate groups
3. Amati hasil deteksi
4. Default radius: 50 meter

**Expected Result:**
- Sistem menampilkan daftar grup laporan duplikat
- Setiap grup menampilkan: laporan 1, laporan 2, jarak, similarity score
- User bisa see laporan mana yang duplikat
- Tombol `Merge` tersedia untuk setiap grup

---

### TEST CASE 37

**Category:** Functional

**Type:** Positive

**Test Scenario:**
Admin berhasil merge laporan duplikat ke laporan primary

**Pre Condition:**
- Admin berada di tab `Duplikat`
- Ada minimal 1 duplikat group dengan 2+ laporan
- Laporan primary dan secondary sudah diidentifikasi

**Steps:**
1. Klik tombol `Merge` pada salah satu duplikat group
2. Modal merge terbuka
3. Pilih laporan primary (dari radio/select)
4. Secondary laporan akan di-merge ke primary
5. Klik tombol `Konfirmasi Merge`

**Expected Result:**
- Secondary laporan ditandai sebagai duplikat
- Upvote dari secondary digabung ke primary
- Primary laporan upvote_count meningkat
- Secondary laporan dihapus atau di-mark as deleted
- Timeline kedua laporan terupdate
- Notifikasi dikirim ke kedua pelapor

---

### TEST CASE 38

**Category:** Functional

**Type:** Positive

**Test Scenario:**
Admin berhasil mengubah radius deteksi duplikat

**Pre Condition:**
- Admin di tab `Duplikat`
- Interface menampilkan radius slider/input

**Steps:**
1. Amati radius slider (default 50 meter)
2. Ubah radius ke 25 meter
3. Sistem auto-reload dengan radius baru

**Expected Result:**
- Hasil deteksi duplikat berubah (lebih ketat)
- Lebih sedikit laporan yang terdeteksi duplikat
- Display updated dengan grup baru

---

## MODULE 9: PROTECTION & SECURITY

---

### TEST CASE 39

**Category:** Functional

**Type:** Negative

**Test Scenario:**
Pengguna tidak terautentikasi gagal mengakses halaman yang dilindungi

**Pre Condition:**
- User belum login atau session sudah expired
- Mencoba akses `/laporan` atau halaman protected lain

**Steps:**
1. Buka URL `/laporan` tanpa login
2. Atau logout dulu, lalu akses protected route

**Expected Result:**
- Browser redirect ke `/login`
- ProtectedRoute component menangkap dan redirect
- User tidak bisa lihat halaman protected
- Pesan implicit: "Silakan login terlebih dahulu"

---

### TEST CASE 40

**Category:** Functional

**Type:** Negative

**Test Scenario:**
Petugas gagal mengakses fitur admin super admin

**Pre Condition:**
- User login sebagai `petugas`
- Mencoba akses fitur super_admin only

**Steps:**
1. Login sebagai petugas
2. Coba akses tab `Duplicate Detection` (super_admin only)
3. Atau coba akses `/dashboard` (super admin)

**Expected Result:**
- Tab/menu tidak tampil (hidden)
- Atau jika URL diakses langsung, redirect ke halaman yang diizinkan
- Tidak ada akses, permission denied implicit

---

## SUMMARY METRICS

**Total Test Cases:** 40

**By Type:**
- Positive: 22 (55%)
- Negative: 12 (30%)
- Boundary Value Analysis: 4 (10%)
- Equivalence Partitioning: 2 (5%)

**By Module:**
- Authentication: 5
- Registration: 5
- Reports: 5
- Report Details: 9
- Admin Actions: 4
- Profile: 4
- Dashboard: 3
- Duplicate: 3
- Security: 2

**Coverage:**
- Functional: 40 ✓
- Non-Functional: 0 (pending)

---

**Document Version:** 1.0  
**Last Updated:** June 2, 2026  
**Status:** APPROVED FOR TEST EXECUTION
