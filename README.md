<div align="center">
  <img src="./public/og-image.png" alt="Bio-Sada Banner" width="100%" />
  
  # 🌿 Bio-Sada
  ### Digital Waste Bank Platform for Sustainable Future
  
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.io/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
</div>

---

## 📖 Overview

**Bio-Sada** adalah platform Bank Sampah Digital yang menghubungkan tiga entitas utama: **Nasabah (Customers)**, **Mitra/Pengepul (Partners)**, dan **Admin**. Fokus utamanya adalah mendigitalisasi proses setoran sampah, memberikan transparansi harga, dan mempermudah logistik penjemputan sampah di area Malang dan sekitarnya.

Platform ini dirancang dengan pendekatan *mobile-first* untuk memastikan kemudahan akses bagi semua lapisan masyarakat dalam berkontribusi pada kebersihan lingkungan.

## 🚀 Key Features

### 👤 Nasabah (Customers)
- **Request Penjemputan:** Mengajukan penjemputan sampah dengan estimasi berat.
- **Katalog Sampah:** Informasi harga sampah terkini yang transparan.
- **Riwayat Setoran:** Pantau semua transaksi dan total tabungan sampah.
- **Profil Digital:** Kelola data diri dan lokasi penjemputan.

### 🤝 Mitra (Partners)
- **Dashboard Real-time:** Notifikasi instan saat ada permintaan penjemputan masuk.
- **Manajemen Tugas:** Ambil dan kelola tugas penjemputan secara efisien.
- **Validasi Berat:** Input berat asli di lokasi untuk kalkulasi otomatis.
- **Laporan Transaksi:** Rekapitulasi penghasilan dan performa harian/bulanan.

### 🔑 Admin
- **Verifikasi Mitra:** Validasi pendaftaran mitra baru untuk menjamin kualitas layanan.
- **Manajemen User:** Kelola database nasabah dan mitra secara terpusat.
- **Monitoring Transaksi:** Pantau seluruh alur logistik dan finansial platform.
- **Master Data:** Update harga sampah dan kategori secara dinamis.

## 🛠️ Tech Stack

- **Frontend:** React.js (Vite) + TypeScript
- **Styling:** Tailwind CSS v4 (Standard terbaru, CSS-first)
- **UI Components:** shadcn/ui (Radix UI + Lucide Icons)
- **State Management:** Zustand
- **Data Fetching:** TanStack Query v5
- **Backend:** Supabase (Auth, PostgreSQL, Real-time, Storage)
- **Notifications:** OneSignal & Sonner

## 🏗️ Project Structure

```bash
src/
├── components/     # UI Components (shadcn/ui & shared)
├── hooks/          # Custom React Hooks
├── lib/            # Utilities (Supabase client, Image Compression)
├── pages/          # Page Components (Auth, Dashboard, Landing)
├── stores/         # Zustand Stores (Auth, Global State)
├── types/          # TypeScript Definitions
└── App.tsx         # Main Routing & App Logic
```

## ⚙️ Getting Started

### Prerequisites
- Node.js (Latest LTS recommended)
- Supabase Project (Database & Auth)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/bio-sada.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Setup environment variables (`.env.local`):
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_ONESIGNAL_APP_ID=your_onesignal_id
   ```

4. Run development server:
   ```bash
   npm run dev
   ```

---

<div align="center">
  Developed with ❤️ by <b>Bafdev</b>
</div>
