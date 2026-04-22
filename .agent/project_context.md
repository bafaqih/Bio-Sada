# Project Context: Bio-Sada (Digital Waste Bank)

## 1. Overview
Bio-Sada adalah platform Bank Sampah Digital yang menghubungkan tiga entitas utama: Nasabah (Customers), Mitra/Pengepul (Partners), dan Admin. Fokus utamanya adalah mendigitalisasi proses setoran sampah, memberikan transparansi harga, dan mempermudah logistik penjemputan sampah di area Malang dan sekitarnya.

## 2. Core Business Logic
- **Nasabah** melakukan request penjemputan sampah dengan estimasi berat.
- **Mitra** melihat daftar request secara real-time dan mengambil tugas penjemputan.
- **Transaksi Selesai** ketika Mitra menimbang sampah di lokasi, menginput berat asli ke aplikasi, dan status berubah menjadi 'completed'.
- **Sistem Pembayaran:** Untuk fase awal, pembayaran dilakukan secara manual di tempat (cash) berdasarkan kalkulasi otomatis aplikasi.

## 3. Tech Stack Specification
- **Frontend:** React.js (Vite) dengan TypeScript.
- **Styling:** Tailwind CSS v4 (Standard terbaru, CSS-first approach).
- **UI Library:** shadcn/ui (Radix UI + Lucide Icons).
- **State Management:** Zustand (untuk Auth & Global UI state).
- **Data Fetching:** TanStack Query v5 (untuk caching dan sinkronisasi server state).
- **Backend/Database:** Supabase (PostgreSQL, Auth, Real-time, Storage).
- **Notifications:** OneSignal Integration & Sonner (Toast).

## 4. Key Goals for the Agent
- Membangun antarmuka yang bersih, modern, dan mobile-friendly (Mobile-first).
- Memastikan keamanan data menggunakan Row Level Security (RLS) Supabase.
- Mengimplementasikan alur kerja multi-role yang ketat (Role-Based Access Control).
- Menjamin sinkronisasi data real-time, terutama pada dashboard Mitra saat ada pesanan masuk.

## 5. Tone & Branding
- **Warna Utama:** Emerald/Green (Melambangkan kebersihan dan lingkungan).
- **Vibe:** Profesional, terpercaya, tapi mudah digunakan oleh orang awam (User-friendly).