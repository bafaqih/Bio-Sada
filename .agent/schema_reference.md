# Database Schema Reference

## Enums
- `user_role`: admin, partners, customers
- `request_status`: pending, accepted, completed, cancelled

## Tables
1. **profiles**: id (PK), full_name, username, phone_number, avatar_url, role, is_verified, email.
2. **addresses**: id (PK), profile_id (FK), label, address_detail, city, province, postal_code, latitude, longitude, is_primary.
3. **waste_categories**: id (PK), name, price_per_kg, unit, description, image_url, status (active/inactive).
4. **pickup_requests**: id (PK), customers_id (FK), partners_id (FK, nullable), address_id (FK), total_weight, total_price, pickup_date, pickup_time, waste_photo_url, status, notes, accepted_at, completed_at.
5. **pickup_request_items**: id (PK), request_id (FK), category_id (FK  ), estimated_weight, real_weight, price_at_time, subtotal.
6. **notifications**: id (PK), user_id (FK), title, message, is_read.
7. **public_profiles**: id, full_name, username, phone_number, avatar_url, role, is_verified.
8. **monthly_partner_report** (VIEW): partner_id, request_id, completed_at, report_month, report_year, customer_name, customer_phone, address_detail, city, waste_category, real_weight, price_at_time, subtotal, total_request_amount, final_status.

## Logic Snapshot
Saat status `pickup_requests` menjadi 'completed', Agent wajib menyimpan `real_weight` dan menghitung `total_price` final berdasarkan harga saat itu.

## Akurasi Timbangan:
Mitra bisa menginput berat asli untuk setiap jenis sampah secara terpisah.

## Transparansi Harga:
Nasabah bisa melihat rincian harga per jenis sampah dalam satu struk transaksi.

## Histori Harga:
Kita bisa menyimpan harga per kg pada saat transaksi terjadi (snapshot), jadi kalau bulan depan harga plastik naik, histori transaksi lama tidak akan berubah nilainya.