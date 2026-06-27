# IT Helpdesk Ticketing System

Sistem Manajemen Tiket (Ticketing System) IT Helpdesk internal yang modern, dirancang untuk memudahkan karyawan perusahaan dalam melaporkan masalah IT (hardware, software, network) dan memudahkan tim IT Support dalam mengelola serta menyelesaikan masalah tersebut secara efisien.

Aplikasi ini dibangun menggunakan tumpukan teknologi modern dengan fokus pada antarmuka yang bersih (Light Mode + Purple Theme) dan sangat responsif di perangkat seluler (Mobile Friendly).

## ✨ Fitur Utama

- **Multi-Role Authentication (Supabase Auth)**:
  - **End-User (Karyawan)**: Membuat tiket aduan, melihat status tiket pribadi, dan menambahkan tanggapan.
  - **Technician (IT Support)**: Menerima penugasan tiket, merubah status, dan menambahkan catatan internal.
  - **Admin**: Akses penuh mengelola semua tiket dan konfigurasi sistem.
- **Manajemen Tiket**:
  - Penomoran tiket otomatis secara berurutan (contoh: `TKT-260627-001`).
  - Kategori masalah (Software, Hardware, Network, dsb) & Tingkat Urgensi (Low, Medium, High, Critical).
  - Alur status tiket: `Open` -> `In Progress` -> `Resolved` -> `Closed`.
- **Diskusi & Catatan Internal**:
  - Tim IT dapat meninggalkan "Catatan Internal" (Private Notes) pada tiket yang hanya bisa dilihat oleh sesama Technician/Admin.
- **Desain UI/UX Modern & Responsif**:
  - Tata letak yang beradaptasi penuh terhadap layar *mobile* dengan menggunakan *Drawer/Hamburger Menu*.
  - *Glassmorphism*, gradien warna modern, dan penggunaan ikon standar industri (Lucide).

## 🚀 Teknologi yang Digunakan

- **Framework**: [Next.js (App Router)](https://nextjs.org/) + React 19
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Ikon**: [Lucide React](https://lucide.dev/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL + Row Level Security)
- **Deployment**: Mendukung Vercel, Node.js VPS, atau docker.

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
   ```

4. **Jalankan Migrasi Database (Supabase)**:
   Pastikan Anda sudah mengonfigurasi skema database di Supabase sesuai dengan file migrasi yang berada di `supabase/migrations/20260627000000_init.sql`. Migrasi ini meliputi pengaturan tabel `profiles`, `tickets`, `ticket_notes`, beserta fungsi penomoran otomatis (`generate_ticket_number`) dengan `SECURITY DEFINER` untuk menghindari konflik RLS.

5. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di [http://localhost:3000](http://localhost:3000).

## 📝 Catatan Tambahan (Bugs & Fixes)

- Saat menjalankan trigger Supabase untuk auto-increment `ticket_number`, pastikan fungsi Postgres menggunakan set `SECURITY DEFINER`. Hal ini wajib agar trigger dapat melihat nilai ID maksimal pada tiket lain secara global tanpa terblokir oleh aturan Row Level Security (RLS) milik User.

---

*Dikembangkan untuk efisiensi dukungan teknis IT di perusahaan.*
