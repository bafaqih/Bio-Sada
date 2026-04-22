# Bio-Sada Coding Rules

## Bahasa
- Selalu gunakan Bahasa Inggris untuk semua code, comments, dan route.
- Variabel, fungsi, dan komponen harus menggunakan Bahasa Inggris.
- Tampilan UI menggunakan Full Bahasa Indonesia.

## Styling: Tailwind CSS v4
- WAJIB menggunakan `@import "tailwindcss"` di `index.css`.
- DILARANG menggunakan direktif `@tailwind base/components/utilities`.
- Gunakan utility classes langsung pada JSX.

## Architecture & Logic
- Gunakan import alias `@/` untuk folder `src`.
- Komponen UI shadcn/ui berada di `@/components/ui`.
- Gunakan **Zustand** untuk global state (Auth, User Profile).
- Gunakan **TanStack Query** untuk semua operasi data fetching/mutasi.

## Database & Security
- Manfaatkan **Row Level Security (RLS)** yang sudah ada.
- Jangan simpan data sensitif di frontend.
- Selalu ambil data `role` dari tabel `public.profiles` setelah auth, bukan dari metadata saja.

## Image Handling
- DILARANG melakukan upload gambar langsung ke Supabase tanpa kompresi.
- WAJIB gunakan utility `compressImage` dari `@/lib/imageCompression` sebelum proses `supabase.storage.upload`.
- Target ukuran file harus di bawah 1MB.
- Gunakan format .webp atau .jpg untuk hasil kompresi terbaik.

## Strict Verification Policy
- Kolom `is_verified` untuk Mitra HANYA boleh diubah oleh Admin.
- Frontend TIDAK BOLEH mengubah status `is_verified` miliknya sendiri.
- Email verification (Supabase Auth) dan Account Approval (is_verified) adalah dua hal berbeda. 
- Jika Mitra sudah verifikasi email tapi `is_verified` masih false, tetap Muncul Modal 'Menunggu Persetujuan Admin'

## Tabel yang Digunakan
Role,Tabel yang Digunakan,Tujuan,Hasil Query
Admin,profiles,Manajemen User,Semua user + Email muncul
User (Self),profiles,"Halaman ""Profil Saya""",Data diri sendiri + Email muncul
User (Other),public_profiles,Lihat Profil Mitra/Nasabah,Profil orang lain + Email tersembunyi