# IT Helpdesk Ticketing System - Implementation Plan

## Proposed Changes

Rencana arsitektur dan skema database untuk sistem ticketing IT menggunakan Supabase (PostgreSQL) dan Next.js (App Router) untuk target deployment di Vercel.

### Database Schema (Supabase / PostgreSQL)

Skema ini mendefinisikan relasi antara pengguna, tiket, dan catatan (notes). Relasi dan tipe datanya dioptimalkan untuk fitur yang Anda minta.

```sql
-- 1. ENUMS (Untuk memastikan validitas data)
CREATE TYPE user_role AS ENUM ('admin', 'technician', 'end_user');
CREATE TYPE ticket_urgency AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE ticket_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- 2. PROFILES TABLE (Berelasi dengan Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role DEFAULT 'end_user'::user_role,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TICKETS TABLE
CREATE TABLE tickets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  urgency ticket_urgency DEFAULT 'low'::ticket_urgency,
  status ticket_status DEFAULT 'open'::ticket_status,
  created_by UUID REFERENCES profiles(id) NOT NULL,
  assigned_to UUID REFERENCES profiles(id),
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TICKET NOTES TABLE (Untuk catatan internal & reply)
CREATE TABLE ticket_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- True: hanya dilihat oleh Admin/Technician
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. FUNCTION & TRIGGER: Auto-Generate Ticket Number (TCK-YYYYMM-XXXX)
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TRIGGER AS $$
DECLARE
    prefix TEXT := 'TCK-' || to_char(NOW(), 'YYYYMM') || '-';
    seq_val INT;
BEGIN
    SELECT COUNT(*) + 1 INTO seq_val FROM tickets WHERE ticket_number LIKE prefix || '%';
    NEW.ticket_number := prefix || LPAD(seq_val::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_ticket_number
BEFORE INSERT ON tickets
FOR EACH ROW
EXECUTE FUNCTION generate_ticket_number();
```

### Folder Structure Recommendation (Next.js)

Kita akan menggunakan **Next.js (App Router)** yang sangat kompatibel dengan Vercel, dipadukan dengan **Tailwind CSS** untuk desain modern dan bersih, serta **Supabase SSR** untuk keamanan maksimal.

```text
it-helpdesk/
├── src/
│   ├── app/                    # Next.js App Router (Routing & Pages)
│   │   ├── (auth)/             # Grouping untuk halaman Login & Register
│   │   ├── (dashboard)/        # Grouping halaman utama setelah login
│   │   │   ├── page.tsx        # Dashboard Ringkasan (Total Open, In Progress, dll)
│   │   │   └── tickets/        # Manajemen tiket
│   │   │       ├── [id]/       # Halaman Detail Tiket & Internal Notes
│   │   │       └── create/     # Form Pembuatan Tiket Baru
│   │   ├── api/                # API Routes (opsional jika dibutuhkan)
│   │   ├── globals.css         # Styling global & konfigurasi Tailwind
│   │   └── layout.tsx          # Root Layout aplikasi
│   ├── components/             # Reusable UI components
│   │   ├── ui/                 # Base components (Button, Input, Badge, Modal, dsb - e.g. Shadcn)
│   │   ├── layout/             # Sidebar, Navbar (Header)
│   │   └── tickets/            # Komponen spesifik tiket (TicketList, TicketStatusBadge)
│   ├── lib/                    # Utilitas
│   │   └── supabase/           # Konfigurasi Supabase Client (Server, Client, Middleware)
│   ├── types/                  # Definisi TypeScript untuk skema database Supabase
│   ├── actions/                # Server Actions untuk submit data (Create Ticket, dll)
│   └── hooks/                  # Custom React Hooks
├── public/                     # Aset statis (Logo, favicon)
├── supabase/                   # Konfigurasi lokal Supabase & Database Migrations
├── .env.local                  # Environment variables (Supabase URL, Anon Key)
├── tailwind.config.ts
├── next.config.mjs
└── package.json
```

## Security & Architecture Highlights
- **Clean Code & Modular**: Memisahkan komponen UI (`components/ui`), logika interaksi database (`actions`), dan konfigurasi (`lib`).
- **Keamanan (SQL Injection/XSS)**: Karena kita menggunakan ORM / SDK Supabase (PostgREST) dipadukan dengan Server Actions Next.js, sanitasi input dan proteksi terhadap injeksi sudah ter-handle dengan baik.
- **Role-Based Access Control (RBAC)**: Kita akan mengamankan API dan Views dengan Supabase Row Level Security (RLS) dan middleware Next.js. Misalnya, `is_internal` pada `ticket_notes` hanya bisa diakses via *RLS policy* jika user memiliki role `admin` atau `technician`.

## User Review Required

> [!IMPORTANT]
> Silakan tinjau arsitektur database dan struktur folder di atas. Apakah ada tambahan yang Anda inginkan (misalnya kolom tambahan di database)? Jika Anda setuju, tekan tombol **Proceed / Setuju**, dan kita akan langsung membuat project Next.js.
