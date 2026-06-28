# IT Helpdesk Ticketing System - Implementation Plan V4 (Dynamic Theme Settings)

## Goal Description

Menambahkan fitur **Pengaturan Tema** pada Panel Admin yang mengizinkan Admin untuk memilih tema aplikasi global. Pilihan tema meliputi:
- `light-purple` (Light Mode - Ungu / Default saat ini)
- `light-red` (Light Mode - Merah)
- `light-blue` (Light Mode - Biru)
- `light-green` (Light Mode - Hijau)
- `light-orange` (Light Mode - Oranye)
- `dark` (Dark Mode - Gelap dengan aksen elegan)

Ketika tema dipilih, nuansa warna aplikasi (accent color, background, card, border, text) akan berubah secara instan secara dinamis.

## Proposed Changes

### 1. Global CSS & Theme System

#### [MODIFY] [globals.css](file:///c:/laragon/www/it-helpdesk/src/app/globals.css)
- Menghapus warna hardcoded body.
- Mendefinisikan CSS Variables untuk token desain aplikasi di `:root` (default `light-purple`) dan override-nya di selector `[data-theme='...']`.
- CSS Variables yang didefinisikan:
  - `--theme-primary` & `--theme-primary-hover` (warna aksen utama aplikasi)
  - `--theme-primary-light` (warna latar belakang aksen halus, misal hover menu)
  - `--theme-primary-text` (warna teks aksen)
  - `--bg-app` & `--bg-card` (warna latar halaman & kartu)
  - `--border-card` (warna garis tepi kartu/tabel)
  - `--text-main` & `--text-muted` (warna teks utama & redup)
- Mendaftarkan variabel tersebut ke `@theme` Tailwind v4 agar kelas utility seperti `bg-brand-primary`, `bg-bg-app`, `text-text-main`, dll. dapat digunakan secara global.

### 2. Layout & Pencegahan Flash Render (FOUC)

#### [MODIFY] [layout.tsx](file:///c:/laragon/www/it-helpdesk/src/app/layout.tsx)
- Menambahkan skrip inline kecil di bagian `<head>` untuk membaca tema dari `localStorage` dan menerapkannya sebagai atribut `data-theme` pada elemen `<html>` saat halaman pertama kali dimuat. Hal ini mencegah terjadinya *flash* warna putih ketika mengakses aplikasi dalam tema gelap.

#### [MODIFY] [DashboardLayoutClient.tsx](file:///c:/laragon/www/it-helpdesk/src/components/layout/DashboardLayoutClient.tsx)
- Mengubah kelas-kelas CSS layout utama agar menggunakan variabel dinamis (misal: `bg-bg-app` menggantikan `bg-slate-50`, `text-text-main` menggantikan `text-slate-900`).

### 3. Modifikasi Komponen & Halaman Pendukung (Penerapan CSS Variables)
Untuk memastikan tema bekerja penuh, kita akan mengganti kelas Tailwind ungu statis dengan kelas token dinamis pada komponen-komponen berikut:
- [SidebarLink & Sidebar](file:///c:/laragon/www/it-helpdesk/src/components/layout/Sidebar.tsx) (Ganti warna aktif menu dengan `bg-brand-light` dan `text-brand-text`).
- [Navbar](file:///c:/laragon/www/it-helpdesk/src/components/layout/Navbar.tsx) (Sesuaikan warna background navbar dengan `bg-bg-card` dan border `border-border-card`).
- Tombol Utama di Form Tiket dan Tabel (Ganti `bg-purple-600 hover:bg-purple-500` dengan `bg-brand-primary hover:bg-brand-hover`).

### 4. Admin Settings Page (UI Pilihan Tema)

#### [NEW] [admin/settings/page.tsx](file:///c:/laragon/www/it-helpdesk/src/app/(dashboard)/admin/settings/page.tsx)
- Membuat halaman baru yang menampilkan daftar tema berupa card visual.
- Setiap tema card menampilkan lingkaran palet warna representatif (Aksen utama, warna background, warna card).
- Ketika Admin memilih salah satu tema, aplikasi akan:
  1. Menulis ke `localStorage.setItem('it-helpdesk-theme', theme)`.
  2. Mengeksekusi `document.documentElement.setAttribute('data-theme', theme)` sehingga UI berubah seketika tanpa perlu reload.

#### [MODIFY] [Sidebar.tsx](file:///c:/laragon/www/it-helpdesk/src/components/layout/Sidebar.tsx)
- Menambahkan tautan **"Pengaturan Aplikasi"** dengan ikon `Settings` pada panel admin di sidebar.

---

## Verification Plan

### Manual Verification
1. Buka halaman **Admin Panel** -> **Pengaturan Aplikasi**.
2. Pilih tema **Light Merah** -> Nuansa ungu di sidebar, tombol, dan link harus berubah menjadi merah secara instan.
3. Pilih tema **Dark Mode** -> Seluruh background aplikasi berubah menjadi gelap (`#0b0f19`), teks menjadi putih, dan card menjadi gelap.
4. Refresh halaman -> Pastikan tema yang dipilih tetap aktif dan tidak terjadi *flash* (kedipan putih) sebelum halaman dimuat sempurna.
