# IT Helpdesk Ticketing System

Sistem Manajemen Tiket (Ticketing System) IT Helpdesk internal yang modern, dirancang untuk memudahkan karyawan perusahaan dalam melaporkan masalah IT (hardware, software, network) dan memudahkan tim IT Support dalam mengelola serta menyelesaikan masalah tersebut secara efisien.

Aplikasi ini dibangun menggunakan tumpukan teknologi modern dengan fokus pada antarmuka yang bersih, premium, dinamis (Multi-Theme), dan sangat responsif di perangkat seluler (Mobile Friendly).

## ✨ Fitur Utama

- **Multi-Role Authentication (Supabase Auth)**:
  - **End-User (Karyawan)**: Membuat tiket aduan, memilih aset bermasalah, melihat status tiket pribadi, dan menambahkan tanggapan.
  - **Manager Departemen**: Melakukan persetujuan (approval) atau penolakan atas aduan tiket yang dibuat oleh karyawan di departemen yang sama.
  - **Technician (IT Support)**: Menerima penugasan tiket, merubah status, dan menambahkan catatan internal (Private Notes).
  - **Admin**: Akses penuh mengelola semua tiket, konfigurasi sistem (user & departemen), serta mengatur tema aplikasi secara global.
- **Manajemen Tiket & Inventaris**:
  - Penomoran tiket otomatis secara berurutan (contoh: `TKT-260627-001`).
  - Inventarisasi Aset IT yang dipetakan per Departemen lengkap dengan data Spesifikasi Teknis perangkat.
  - Alur persetujuan: `Pending Approval` (oleh Manager) -> `Open` (IT antrean) -> `In Progress` -> `Resolved` -> `Closed`.
- **Diskusi & Catatan Internal**:
  - Tim IT dapat meninggalkan "Catatan Internal" (Private Notes) pada tiket yang hanya bisa dilihat oleh sesama Technician/Admin.
- **Desain UI/UX Modern & Responsif**:
  - Tata letak yang beradaptasi penuh terhadap layar *mobile* dengan menggunakan *Drawer/Hamburger Menu*.
  - *Glassmorphism*, gradien warna modern, dan penggunaan ikon standar industri (Lucide).
  - Sidebar yang *sticky* saat discroll.

## 🚀 Teknologi yang Digunakan

- **Framework**: [Next.js (App Router)](https://nextjs.org/) + React 19
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Ikon**: [Lucide React](https://lucide.dev/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL + Row Level Security)
- **Deployment**: Mendukung Vercel, Node.js VPS, atau Docker.

## 🛠 Panduan Instalasi & Pengembangan

1. **Clone repositori ini**:
   ```bash
   git clone https://github.com/zainaldocs/it-helpdesk.git
   cd it-helpdesk
   ```

2. **Instal dependensi**:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variable**:
   Buat file `.env.local` di *root* proyek Anda dan masukkan kredensial Supabase proyek Anda:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-ID].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
   SUPABASE_SERVICE_ROLE_KEY=[YOUR-SERVICE-ROLE-KEY] # Dibutuhkan untuk CRUD User di sisi server
   ```

4. **Jalankan Migrasi Database (Supabase)**:
   Skema database diatur menggunakan Supabase Migration. Silakan jalankan migrasi yang tersedia secara berurutan:
   - `supabase/migrations/20260627000000_init.sql` (Inisiasi tabel profil, tiket, & auto-numbering).
   - `supabase/migrations/20260628000000_v2.sql` (Skema departemen & inventaris aset).
   - `supabase/migrations/20260628000001_fix_rls.sql` (Peningkatan aturan RLS untuk alur approval).
   - `supabase/migrations/20260628000002_add_asset_specs.sql` (Penambahan spesifikasi aset).

5. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000).

## 📈 Riwayat Pembaruan (Versions History)

### 🔴 Versi 2.0 (Skema Aset, Departemen, & Alur Approval)
- **Modul Departemen & Aset**: Menambahkan tabel `departments` dan `assets` di Supabase lengkap dengan relasi kunci asing (`Foreign Key`) dan data spesifikasi perangkat.
- **Manager Approval Flow**: Mengubah alur pembuatan tiket. Karyawan wajib memilih perangkat aset mereka. Tiket masuk dengan status `pending_approval` dan hanya muncul pada panel `Request Approval` milik Manager departemen yang sama sebelum diteruskan ke tim IT Support.

### 🟡 Versi 3.0 (CRUD Admin, Spesifikasi Aset, & Pagination)
- **CRUD Pengguna**: Admin kini dapat melakukan penambahan user baru (dengan pembuatan akun autentikasi server Supabase Auth), merubah peran (*role*), status akun, serta menghapus user.
- **Detail Spesifikasi Aset**: Menambahkan kolom teks spesifikasi teknis pada formulir aset di halaman admin `/admin/assets` dan menampilkannya di detail tiket pelaporan.
- **Polesan UI/UX**:
  - Mengubah sidebar menu utama menjadi *sticky layout* (tidak ikut tergulung saat halaman discroll).
  - Penambahan fitur pagination di semua tabel data (Tiket, Aset, Departemen, User, Approval) untuk meningkatkan performa loading data.

### 🟢 Versi 4.0 (Sistem Tema Dinamis Global & Dark Mode)
- **Mesin Tema Dinamis (Theming Engine)**: Dukungan penuh skema warna global. Pilihan tema meliputi: **Light Purple (Default)**, **Light Blue**, **Light Green**, **Light Red**, **Light Orange**, dan **Dark Mode**.
- **Anti-Flicker Script**: Menyisipkan skrip inisiasi instan di head layout utama untuk mencegah kedipan warna putih (*flash of un-themed content*) saat memuat halaman dengan tema kustom.
- **Simulator Tema Real-Time**: Membuat halaman `/admin/settings` (Pengaturan Aplikasi) agar Admin dapat mengklik dan menerapkan tema secara instan ke seluruh sistem tanpa muat ulang halaman, lengkap dengan simulator mini visual skema warna.

## 📝 Catatan Tambahan (Bugs & Fixes)

- **SECURITY DEFINER**: Saat menjalankan trigger Supabase untuk auto-increment `ticket_number`, pastikan fungsi Postgres menggunakan set `SECURITY DEFINER`. Hal ini wajib agar trigger dapat melihat nilai ID maksimal pada tiket lain secara global tanpa terblokir oleh aturan Row Level Security (RLS) milik User.
- **Service Role Key**: Pastikan `SUPABASE_SERVICE_ROLE_KEY` terkonfigurasi dengan benar di `.env.local` pada environment hosting Anda. Tanpa ini, admin tidak dapat mendaftarkan/menghapus akun autentikasi Supabase milik pengguna lain.

---

*Dikembangkan untuk efisiensi dukungan teknis IT di perusahaan.*
