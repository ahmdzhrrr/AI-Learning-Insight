# AI Learning Insight

## Deskripsi Singkat Proyek
AI Learning Insight adalah platform analisis pembelajaran berbasis Artificial Intelligence (AI) yang membantu mendeteksi gaya belajar siswa berdasarkan data perilaku mereka selama proses belajar. Sistem ini menggunakan Machine Learning untuk menganalisis aktivitas belajar dan menghasilkan insight berupa tipe gaya belajar, tingkat performa, serta rekomendasi peningkatan belajar.

Proyek ini terdiri dari tiga komponen utama:
- Machine Learning Service (FastAPI + Python)
- Backend API (Express + PostgreSQL/Supabase)
- Frontend Dashboard (React + Vite)

---

## Struktur Proyek

AI-Learning-Insight/
|
├── ml-service/               # FastAPI model inference service (KMeans)
|
├── backend/                  # Node.js RESTful API (Express + Supabase)
|
└── frontend/                 # React dashboard app

---

## Petunjuk Setup Environment

1. Machine Learning Service (FastAPI)

cd ml-service  
pip install -r requirements.txt  
python main.py  

---

2. Backend API (Node.js + Express)

cd backend  
npm install  
node scripts/run-sql.js  
node scripts/seed.js  
npm run dev  

---

3. Frontend (React + Vite)

cd frontend  
npm install  
npm run dev  

---

## Tautan Model Machine Learning
Model Machine Learning telah tersedia di dalam repository pada folder berikut:

ml-service/models/ 

dan dapat diunduh melalui Google Drive berikut:

https://drive.google.com/your-model-link-here 

File model berupa format .pkl dan telah terintegrasi langsung dengan ML Service.

## Cara Menjalankan Aplikasi

1. Jalankan Machine Learning Service:
cd ml-service  
python main.py  

2. Jalankan Backend API:
cd backend  
npm run dev  

3. Jalankan Frontend Dashboard:
cd frontend  
npm run dev  

4. Buka aplikasi melalui browser:
http://localhost:5173  

---

## Dokumentasi API

1. OpenAPI (Swagger)
File: openapi.yaml  
Berisi:
- Struktur lengkap request & response
- Path parameter seperti developerId
- Semua status code
- Format Authorization Bearer Token
- Dokumentasi Swagger UI di endpoint /docs

2. Postman Collection  
File: AI Learning Insight API (with ML).postman_collection.json  

Fungsi utama:
- Testing seluruh endpoint API
- Debug komunikasi Frontend → Backend → ML
- Menyimpan token JWT otomatis
- Menjalankan prediksi ML tanpa frontend

---

## Catatan Penting
- Jika API backend berubah, openapi.yaml dan Postman Collection wajib diperbarui.
- Wajib menjalankan:
  node scripts/run-sql.js  
  node scripts/seed.js  
  sebelum start backend.
- ML Service harus berjalan sebelum testing endpoint /insights.
- Gunakan Session Pooler Supabase untuk koneksi database.
