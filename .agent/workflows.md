# Implementation Workflows

## Phase 1: The Brain (Auth & Layout)
1. Buat `useAuth` hook yang menggabungkan `supabase.auth.getSession()` dengan data dari tabel `profiles`.
2. Buat `ProtectedRoute` component untuk memfilter akses halaman berdasarkan role.
3. Buat `DashboardLayout` dengan Sidebar (shadcn) yang menyesuaikan menu berdasarkan role.

## Phase 2: Customer Experience
1. Halaman Dashboard Nasabah: Tampilan statistik (Total Sampah, Saldo).
2. Halaman Request: Form multi-step untuk memilih kategori sampah dan alamat.
3. Halaman History: List transaksi dengan badge status yang berwarna (emerald untuk completed, amber untuk pending).

## Phase 3: Partner Operations (The Engine)
1. Halaman "Order Masuk": Gunakan **Supabase Real-time** untuk update list otomatis.
2. Fitur "Terima Tugas": Update `partners_id` dan status menjadi 'accepted'.
3. Fitur "Selesaikan": Input berat asli, hitung harga, snapshot data, ubah status ke 'completed'.
4. WhatsApp Button: Redirect ke chat nasabah dengan detail pesanan.

## Phase 4: Admin Control
1. Verifikasi Mitra: Daftar mitra yang `is_verified = false` dengan tombol Approve.
2. Harga Sampah: CRUD `waste_categories`.