**AI Learning Insight**
adalah platform analisis pembelajaran berbasis AI yang membantu mendeteksi gaya belajar siswa berdasarkan data perilaku mereka selama belajar.

Proyek ini terdiri dari tiga komponen utama:
- **Machine Learning Service (FastAPI + Python)**
- **Backend API (Express + PostgreSQL/Supabase)**
- **Frontend Dashboard (React + Vite)**
----------------------------------------------------------------------------------------------------------------------------------------------------------------
## Struktur Proyek

```
AI-Learning-Insight/
|
├── ml-service/               # FastAPI model inference service (KMeans)
|
├── backend/                  # Node.js RESTful API (Express + Supabase)
|
└── frontend/                 # React dashboard app
```
----------------------------------------------------------------------------------------------------------------------------------------------------------------
## Run Program

1. Jalankan Machine Learning Service (FastAPI)
```
cd ml-service
python main.py
```
2. Jalankan Backend API (Node.js + Express)
```
cd backend
npm install
node scripts/run-sql.js      # menjalankan semua migration
npm run dev
```
3. Jalankan Frontend (React + Vite)
```
cd frontend
npm install
npm run dev
```
----------------------------------------------------------------------------------------------------------------------------------------------------------------
## Dokumentasi API

1. openAPI.yaml
   
File ini adalah **API Contract** lengkap untuk backend, berisi:
Endpoint utama:
- `/auth/login`
- `/auth/me`
- `/users/{userId}/metrics`  → GET/PUT  
- `/users/{userId}/insights` → GET/POST  

Isi `openapi.yaml` mencakup:
- Struktur request/response
- Path params
- Semua status code
- Format Authorization Bearer Token
- Contoh data
- Schema seluruh endpoint

Kegunaan:
- Menjadi acuan Frontend
- Menjaga konsistensi API selama pengembangan
- Menyediakan Swagger UI (via `/docs`)

2. AI Learning Insight API (with ML).postman_collection.json

Koleksi Postman siap pakai untuk:
- Test login (JWT)
- Test metrics
- Test insights (prediksi ML)
- Menjalankan debugging backend
- Mengetes komunikasi FE ↔ BE ↔ ML
----------------------------------------------------------------------------------------------------------------------------------------------------------------
## Koleksi Postman sudah berisi script otomatis untuk menyimpan token JWT
*Scripts untuk postman bagian POST Login:*
```
const json = pm.response.json();
const token = json.data && json.data.access_token;

if (token) {
    pm.environment.set('bearerToken', token);
    console.log('Token JWT disimpan:', token);
} else {
    console.warn('Gagal mengambil access_token dari respons login:', json);
}
```
----------------------------------------------------------------------------------------------------------------------------------------------------------------
## Catatan Penting (Wajib Dibaca)

- Jika API backend berubah, **openAPI.yaml** dan **Postman Collection** harus ikut diperbarui.
- Dokumentasi ini penting untuk integrasi:
  - Machine Learning → Backend
  - Backend → Frontend
- Wajib menjalankan node scripts/run-sql.js sebelum start backend agar database terbuat.
- Pastikan ML service berjalan sebelum testing endpoint insights.
