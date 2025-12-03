**AI Learning Insight** adalah platform analisis pembelajaran berbasis AI yang membantu mendeteksi gaya belajar siswa berdasarkan data perilaku mereka selama belajar. Proyek ini terdiri dari tiga komponen utama: - **Machine Learning Service (FastAPI + Python)** - **Backend API (Express + PostgreSQL/Supabase)** - **Frontend Dashboard (React + Vite)** ---------------------------------------------------------------------------------------------------------------------------------------------------------------- ## Struktur Proyek
AI-Learning-Insight/
|
├── ml-service/               # FastAPI model inference service (KMeans)
|
├── backend/                  # Node.js RESTful API (Express + Supabase)
|
└── frontend/                 # React dashboard app
---------------------------------------------------------------------------------------------------------------------------------------------------------------- ## Run Program 1. Jalankan Machine Learning Service (FastAPI)
cd ml-service
python main.py
2. Jalankan Backend API (Node.js + Express)
cd backend
npm install
node scripts/run-sql.js      # menjalankan semua migration
node scripts/seed.js
npm run dev
3. Jalankan Frontend (React + Vite)
cd frontend
npm install
npm run dev
---------------------------------------------------------------------------------------------------------------------------------------------------------------- ## Dokumentasi API 1. openapi.yaml Endpoint Utama 🔐 Authentication - POST /auth/login - GET /auth/me 📊 Learning Metrics - GET /api/developers/{developerId}/metrics - PUT /api/developers/{developerId}/metrics - GET /api/developers/{developerId}/metrics/overview - GET /api/developers/{developerId}/metrics/weekly - GET /api/developers/{developerId}/metrics/history 🧠 Insights (ML) - POST /api/developers/{developerId}/insights - GET /api/developers/{developerId}/insights Isi openapi.yaml: - Struktur lengkap request & response - Path parameter seperti developerId - Semua kemungkinan status code - Format Authorization Bearer Token - Contoh response: - metrics overview - weekly progress - historical performance - insight dari ML - Dokumentasi OpenAPI untuk Swagger UI Kegunaan openapi.yaml - Acuan FE dalam integrasi API - Menjaga konsistensi API sepanjang pengembangan - Dipakai Swagger UI di route /docs - Mempermudah debugging & review API 2. AI Learning Insight API (with ML).postman_collection.json Koleksi Utama 🔑 Login (JWT) 👤 /auth/me 📊 Metrics: - Get Metrics - Update Metrics (PUT) - Overview Metrics - Weekly Progress - Historical Performance 🧠 Insights: - Predict Insight (via ML) - Get Latest Insight Fungsi utama koleksi: - Test seluruh endpoint dengan mudah - Debug komunikasi FE → BE → ML - Menyimpan JWT otomatis - Menjalankan percobaan prediksi ML tanpa FE ---------------------------------------------------------------------------------------------------------------------------------------------------------------- ## Koleksi Postman sudah berisi script otomatis untuk menyimpan token JWT *Scripts untuk postman bagian POST Login:*
const json = pm.response.json();
const token = json.data && json.data.access_token;

if (token) {
    pm.environment.set('bearerToken', token);
    console.log('Token JWT disimpan:', token);
} else {
    console.warn('Gagal mengambil access_token dari respons login:', json);
}
---------------------------------------------------------------------------------------------------------------------------------------------------------------- ## Catatan Penting (Wajib Dibaca) - Jika API backend berubah, **openAPI.yaml** dan **Postman Collection** harus ikut diperbarui agar Swagger & Postman tetap sinkron. - Dokumentasi ini penting untuk integrasi: - Machine Learning → Backend - Backend → Frontend - Wajib menjalankan node scripts/run-sql.js dan node scripts/seed.js sebelum start backend agar database terbuat dan memiliki isi. - Pastikan ML service berjalan sebelum testing endpoint insights. - Gunakan Session Pooler Supabase untuk koneksi.
