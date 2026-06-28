# IT Helpdesk Ticketing System - Implementation Plan V3 (User CRUD & Asset Specifications)

## Goal Description

Menambahkan fitur administrasi tambahan untuk tim IT Admin:
1. **User CRUD Lengkap (Create & Delete)**: Mengizinkan Admin untuk membuat user baru langsung dari panel admin dan menghapus user (termasuk dari data auth Supabase).
2. **Spesifikasi Aset**: Menambahkan kolom spesifikasi (detail teknis) pada aset perangkat sehingga tim IT dapat melihat spesifikasi teknis komputer/laptop yang bermasalah.

## User Review Required

> [!IMPORTANT]
> **Kredensial Baru di `.env.local`**:
> Untuk mengizinkan Admin membuat dan menghapus user dari sistem autentikasi Supabase, Next.js backend memerlukan kunci admin `service_role` (karena kunci biasa/anon tidak memiliki akses mengubah data user lain).
> Anda perlu menambahkan baris berikut di `.env.local` Anda:
> ```env
> SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY
> ```
> *Catatan: Jangan pernah mempublikasikan kunci `service_role` ini ke repositori publik (seperti GitHub) karena kunci ini memotong semua aturan keamanan RLS.*

## Proposed Changes

### Database Schema (Supabase)

#### [MODIFY] `assets` table
Menambahkan kolom baru untuk menyimpan spesifikasi teknis perangkat.
- Tambah kolom: `specifications` TEXT (opsional)

### Frontend (Next.js App Router) & Server Actions

#### [MODIFY] [admin.ts](file:///c:/laragon/www/it-helpdesk/src/app/actions/admin.ts)
1. **Buat Klien Admin Supabase**: Membuat fungsi pembantu `createAdminClient()` yang menggunakan `SUPABASE_SERVICE_ROLE_KEY` untuk mengakses API administrasi auth Supabase.
2. **Tambah `createUser` Action**:
   - Menerima `email`, `password`, `fullName`, `role`, dan `department_id`.
   - Menggunakan `adminClient.auth.admin.createUser` untuk membuat akun dengan status email terverifikasi (`email_confirm: true`).
   - Melakukan update pada profil baru untuk mengatur `department_id` dan `account_status: 'active'`.
3. **Tambah `deleteUser` Action**:
   - Menerima `userId`.
   - Menggunakan `adminClient.auth.admin.deleteUser` untuk menghapus akun. Ini akan menghapus data di auth.users, dan akan otomatis menghapus profil di tabel `profiles` secara *cascade*.

#### [MODIFY] [admin/users/page.tsx](file:///c:/laragon/www/it-helpdesk/src/app/(dashboard)/admin/users/page.tsx)
- Tambah tombol **"Tambah User Baru"** yang akan membuka modal form pembuatan user.
- Form berisi input: Nama Lengkap, Email, Password, Peran (Role), dan Departemen.
- Tambah tombol **"Hapus"** (ikon Trash) di samping tombol Edit pada tabel pengguna untuk menghapus akun.

#### [MODIFY] [admin/assets/page.tsx](file:///c:/laragon/www/it-helpdesk/src/app/(dashboard)/admin/assets/page.tsx)
- Modifikasi modal form aset dengan menambahkan textarea **"Spesifikasi Perangkat"**.
- Menampilkan spesifikasi perangkat di dalam detail/tabel aset.

#### [MODIFY] [TicketDetail.tsx](file:///c:/laragon/www/it-helpdesk/src/components/tickets/TicketDetail.tsx)
- Menampilkan spesifikasi aset perangkat pada detail tiket jika user menyertakan aset saat membuat tiket aduan.

## Verification Plan

### Manual Verification
1. Tambahkan `SUPABASE_SERVICE_ROLE_KEY` ke `.env.local`.
2. Login sebagai Admin -> Buka **Kelola User** -> Klik **Tambah User Baru** -> Isi form.
3. Login menggunakan akun baru yang dibuat Admin untuk memastikan akun aktif dan bisa langsung login tanpa approve manual.
4. Login sebagai Admin -> Buka **Kelola Aset** -> Buat/Edit aset -> Isi kolom **Spesifikasi** (misal: `Intel i5, RAM 16GB, SSD 512GB`).
5. Buat tiket aduan menggunakan aset tersebut -> Cek detail tiket, pastikan tim IT dapat membaca spesifikasinya langsung di detail tiket.
