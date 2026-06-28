# IT Helpdesk Ticketing System - Implementation Plan V2 (Detailed)

Dokumen ini berisi panduan teknis yang rinci (spesifik untuk dieksekusi oleh AI) mengenai arsitektur, skema database, dan komponen UI yang diperlukan untuk mengembangkan aplikasi IT Helpdesk ini sesuai dengan spesifikasi terbaru.

## 🎯 Ringkasan Kebutuhan Baru
1. **Manajemen User (Admin Panel)**: User yang baru registrasi statusnya menjadi `pending` dan masuk ke panel admin untuk di-approve. Tersedia fitur CRUD User.
2. **Manajemen Departemen (Admin Panel)**: Admin dapat membuat departemen.
3. **Manajemen Aset (Admin Panel)**: Admin dapat mendaftarkan aset PC/Perangkat dan memetakannya ke sebuah departemen.
4. **Role Manager**: Ditambahkan role `manager` (`end_user` dengan hak istimewa *approval*).
5. **Dashboard Manager**: Manager memiliki menu "Request Approval" untuk melihat tiket dari departemennya yang menunggu persetujuan.
6. **Form & Detail Tiket**: 
   - User memilih Aset yang bermasalah (terfilter dari aset di departemennya).
   - Status tiket berubah: `pending_approval` -> `open` -> `in_progress` -> `resolved` -> `closed` (serta `cancelled`).
   - Terdapat Visual Progress Bar (Timeline) di detail tiket user.

---

## 📂 1. Database Schema Migration (Supabase)

Buat file migrasi baru (contoh: `supabase/migrations/20260628000000_v2.sql`) yang berisi perintah SQL berikut:

```sql
-- 1. UPDATE ENUMS
-- Menambahkan role 'manager'
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'manager';
-- Menambahkan status tiket
ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'pending_approval' BEFORE 'open';
ALTER TYPE ticket_status ADD VALUE IF NOT EXISTS 'cancelled';

-- Enum baru untuk status akun
CREATE TYPE account_status AS ENUM ('pending', 'active', 'suspended');

-- 2. CREATE DEPARTMENTS TABLE
CREATE TABLE departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read departments" ON departments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage departments" ON departments FOR ALL TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- 3. CREATE ASSETS TABLE
CREATE TABLE assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  asset_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'Active' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view assets in their department" ON assets FOR SELECT TO authenticated USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin' OR
  department_id = (SELECT department_id FROM profiles WHERE id = auth.uid())
);
CREATE POLICY "Admins can manage assets" ON assets FOR ALL TO authenticated USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- 4. UPDATE PROFILES TABLE
ALTER TABLE profiles ADD COLUMN department_id UUID REFERENCES departments(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD COLUMN account_status account_status DEFAULT 'pending'::account_status NOT NULL;

-- 5. UPDATE TICKETS TABLE
ALTER TABLE tickets ADD COLUMN asset_id UUID REFERENCES assets(id) ON DELETE SET NULL;
ALTER TABLE tickets ADD COLUMN approved_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE tickets ADD COLUMN approved_at TIMESTAMPTZ;

-- 6. UPDATE TRIGGER FUNCTION FOR NEW USER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, account_status)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'end_user'::public.user_role),
    'pending'::public.account_status
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
```

---

## 💻 2. Frontend / Next.js Implementation Guide

### A. Auth & Middleware Protection
- **Status Validation**: Buat logika (di `middleware.ts` atau HOC / Server Layout `src/app/(dashboard)/layout.tsx`) untuk mengecek `account_status` user.
  - Jika `status === 'pending'`, arahkan ke halaman `/waiting-approval` (halaman statis menginformasikan akun sedang di-review admin).
  - Jika `status === 'suspended'`, arahkan ke `/suspended`.
  - Jika `status === 'active'`, izinkan akses ke dashboard.

### B. Admin Panel (`/admin/*`)
Buat rute dan komponen berikut:
1. **User Management (`/admin/users`)**: 
   - Tabel yang me-list semua `profiles`.
   - Filter dropdown (Semua, Pending, Active).
   - Jika *Pending*, admin bisa klik tombol "Approve" (Ubah `account_status` jadi `active`).
   - Admin bisa Edit user untuk melakukan penugasan: Set `role` (Admin/Manager/Technician/End_User) dan set `department_id`.
2. **Department Management (`/admin/departments`)**: 
   - CRUD sederhana untuk `departments` (Nama departemen).
3. **Asset Management (`/admin/assets`)**: 
   - CRUD untuk tabel `assets`. Admin menentukan `asset_code`, `name`, `type`, dan wajib memilih `department_id`.

### C. Manager Dashboard (`/manager/approvals`)
- Buat rute khusus untuk user dengan `role === 'manager'`.
- Tambahkan menu "Request Approval" di Sidebar.
- **Tampilan**: List tiket dengan query `WHERE status = 'pending_approval' AND tickets.created_by.department_id = manager.department_id`.
- **Aksi**: 
  - Tombol **"Approve"**: Mengubah `status` tiket menjadi `open`, mencatat `approved_by` = ID Manager, dan `approved_at` = NOW().
  - Tombol **"Cancel"**: Mengubah `status` tiket menjadi `cancelled`.

### D. Fitur Tiket (End-User)
1. **Create Ticket Form (`/tickets/create`)**:
   - Tambahkan *dropdown input* untuk memilih "Aset Bermasalah".
   - *Fetch* data aset: `SELECT * FROM assets WHERE department_id = user.department_id AND status = 'Active'`.
2. **Ticket Details (`/tickets/[id]`)**:
   - Tampilkan informasi aset yang dipilih (Kode & Nama Aset).
   - Buat komponen **Visual Stepper (Timeline)** dengan alur:
     `Pending Manager` ➔ `Open (IT)` ➔ `In Progress` ➔ `Resolved` ➔ `Closed`.
     - *Catatan: Jika status tiket `cancelled`, timeline berubah warna merah di tahap pertama.*

---

## 🧪 3. Verification Plan
- **Migration Test**: Jalankan migrasi Supabase lokal (`npx supabase db push` atau reset lokal).
- **Registration Flow**: Register user baru, pastikan diarahkan ke `/waiting-approval`.
- **Admin Approval**: Login sebagai admin, ke menu User, set `status` menjadi `active`, set role `manager` dan set `department`.
- **Ticket Workflow**: 
  - *End user* buat tiket (pilih aset).
  - *Manager* lihat tab Approval -> klik Approve.
  - *End user* lihat tiket berubah status di Visual Timeline.
