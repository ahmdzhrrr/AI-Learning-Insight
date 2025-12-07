import warnings
import pandas as pd
import pickle
from pathlib import Path
from typing import Optional, Dict, Any, List, Tuple
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from contextlib import asynccontextmanager

warnings.filterwarnings("ignore")

# Folder tempat main.py berada
BASE_DIR = Path(__file__).resolve().parent

# =========================================================
# 1. KONFIGURASI PROFIL & TEMPLATE
# =========================================================

# 5 Fitur asli dari model Anda (sesuai CSV)
FEATURE_COLUMNS_TOTAL = [
    "total_active_days",
    "avg_completion_time_hours",
    "total_journeys_completed",
    "rejection_ratio",
    "avg_exam_score",
]

CLUSTER_PROFILES: Dict[int, Dict[str, Any]] = {
    0: {
        "label_id": "Fast Learner",
        "short_description": (
            "Aktivitas belajar masih jarang, tetapi ketika mulai belajar mampu menyelesaikan modul dengan sangat cepat "
            "dan mempertahankan nilai ujian yang cukup baik. Volume journey relatif rendah dan hampir tidak ada revisi submission."
        ),
        "concept_tag": "fast_learner",
    },
    1: {
        "label_id": "Consistent Learner",
        "short_description": (
            "Belajar secara konsisten, menyelesaikan banyak journey, dan memiliki nilai ujian yang tinggi. "
            "Tingkat refleksi berada pada kisaran sedang."
        ),
        "concept_tag": "consistent_learner",
    },
    2: {
        "label_id": "Reflective Learner",
        "short_description": (
            "Sangat sering aktif dan menyelesaikan banyak journey, namun membutuhkan waktu yang panjang per modul. "
            "Cenderung mengulas materi secara mendalam."
        ),
        "concept_tag": "reflective_learner",
    },
    3: {
        "label_id": "Struggling Learner",
        "short_description": (
            "Cukup aktif dan banyak bereksperimen dengan submission (revisi tinggi), "
            "namun nilai ujian relatif rendah sehingga masih perlu penguatan konsep."
        ),
        "concept_tag": "struggling_learner",
    },
}

# TEMPLATE KALIMAT INSIGHT UNTUK SETIAP CLUSTER
CLUSTER_TEMPLATES: Dict[int, str] = {
    0: (
        "Aktivitas belajarmu masih jarang (sekitar {active_days:.0f} hari aktif), "
        "tetapi ketika mulai belajar kamu bergerak sangat cepat dengan rata-rata waktu selesai "
        "sekitar {avg_time_hours:.1f} jam per modul. Kamu telah menyelesaikan sekitar {journeys:.0f} journey "
        "dengan nilai ujian rata-rata {score:.0f}. Cobalah meningkatkan frekuensi belajar agar dampak "
        "pembelajaranmu lebih konsisten."
    ),
    1: (
        "Kamu belajar secara cukup konsisten (sekitar {active_days:.0f} hari aktif) dan telah menyelesaikan "
        "sekitar {journeys:.0f} journey. Nilai ujian rata-ratamu tinggi, yaitu sekitar {score:.0f}. "
        "Tingkat refleksi melalui submission yang ditolak berada di kisaran {rejection_ratio:.2f}. "
        "Pertahankan pola belajar ini dan gunakan umpan balik untuk terus menyempurnakan pemahamanmu."
    ),
    2: (
        "Kamu sangat tekun dengan sekitar {active_days:.0f} hari aktif dan telah menyelesaikan "
        "sekitar {journeys:.0f} journey. Rata-rata waktu yang kamu habiskan per modul cukup panjang, "
        "sekitar {avg_time_hours:.1f} jam. Nilai ujian rata-ratamu sekitar {score:.0f}. "
        "Pertahankan kedalaman belajarmu, namun pertimbangkan pengelolaan waktu belajar yang lebih efisien."
    ),
    3: (
        "Kamu cukup aktif belajar (sekitar {active_days:.0f} hari aktif) dan telah menyelesaikan "
        "sekitar {journeys:.0f} journey. Rata-rata nilai ujianmu saat ini sekitar {score:.0f}, "
        "dengan rasio submission ditolak sekitar {rejection_ratio:.2f}. Ini menunjukkan kamu banyak "
        "bereksperimen, tetapi masih perlu memperkuat pemahaman konsep dasar. Manfaatkan kembali materi, "
        "contoh solusi, dan umpan balik dari submission untuk meningkatkan hasil ujian."
    ),
}

# Variable Global untuk Artifacts
data_storage: Dict[str, Any] = {}

# =========================================================
# 2. LIFESPAN
# =========================================================


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Startup: Memuat model dan data...")
    try:
        # Load Model & Scaler
        with open(BASE_DIR / "model" / "scaler.pkl", "rb") as f:
            data_storage["scaler"] = pickle.load(f)

        with open(BASE_DIR / "model" / "kmeans_model.pkl", "rb") as f:
            data_storage["model"] = pickle.load(f)

        # Load Data CSV
        features_df = pd.read_csv(BASE_DIR / "data" / "clustered_students.csv")

        # Validasi Kolom
        if "developer_id" not in features_df.columns:
            raise ValueError("CSV harus memiliki kolom 'developer_id'.")

        missing_cols = [
            col for col in FEATURE_COLUMNS_TOTAL if col not in features_df.columns
        ]
        if missing_cols:
            raise ValueError(f"Kolom fitur berikut hilang: {missing_cols}")

        # Indexing untuk pencarian cepat
        features_df = features_df.drop_duplicates(subset=["developer_id"])
        features_df = features_df.set_index("developer_id")

        data_storage["features"] = features_df

        print(f"Startup: Berhasil memuat data {len(features_df)} siswa dan model.")

    except FileNotFoundError as e:
        print(f"Error Startup: File tidak ditemukan. {e}")
        raise SystemExit("Gagal memuat file artifacts.")
    except Exception as e:
        print(f"Error Startup: {e}")
        raise SystemExit(f"Gagal inisialisasi: {e}")

    yield

    print("Shutdown: Membersihkan memory...")
    data_storage.clear()


app = FastAPI(title="AI Learning Insight API", version="1.0.0", lifespan=lifespan)

# =========================================================
# 3. PYDANTIC MODELS
# =========================================================


class PredictIn(BaseModel):
    developer_id: int
    features: Optional[Dict[str, Any]] = None


class PredictOutData(BaseModel):
    label: str
    confidence: float
    reasons: List[Dict[str, Any]]
    developer_id: int
    developer_name: str
    cluster_id: int
    insight_text: str
    features: Dict[str, Any]


class PredictOutStatus(BaseModel):
    status: str
    data: Optional[PredictOutData] = None
    message: Optional[str] = None


class SimplePredictionOut(BaseModel):
    developer_id: int
    name: str
    learning_style: str
    cluster_id: int
    status: str


# =========================================================
# 4. CORE LOGIC
# =========================================================


def _build_confidence_note(confidence: float, features: Dict[str, float]) -> str:
    """
    Membuat kalimat singkat yang menjelaskan mengapa confidence segitu,
    dengan kategori: 100, >=75, >=60, <60.
    """
    level = confidence * 100  # 0.85 -> 85

    active_days = float(features.get("total_active_days", 0))
    journeys = float(features.get("total_journeys_completed", 0))
    score = float(features.get("avg_exam_score", 0))
    rej_ratio = float(features.get("rejection_ratio", 0))

    reasons: List[str] = []

    # Tambah alasan berdasarkan fitur
    if journeys >= 30:
        reasons.append("jumlah journey yang kamu selesaikan sudah cukup banyak")
    if score >= 75:
        reasons.append("nilai ujianmu cenderung tinggi")
    if rej_ratio < 0.4:
        reasons.append("rasio submission yang ditolak tergolong rendah")
    elif rej_ratio >= 0.5:
        reasons.append(
            "rasio submission yang ditolak cukup tinggi sehingga model melihat banyak percobaan dan revisi"
        )
    if active_days >= 200:
        reasons.append("aktivitas belajarmu cukup sering dan konsisten")

    # Kalau tidak ada alasan spesifik yang terpenuhi
    if not reasons:
        reasons.append("pola belajarmu cukup konsisten dengan profil gaya belajar ini")

    # Kalimat pembuka berdasarkan level confidence (4 kategori)
    if level == 100:
        prefix = f"Prediksi gaya belajar ini sangat kuat, "
    elif level >= 70:
        prefix = f"Prediksi gaya belajar ini cukup meyakinkan, "
    else:
        prefix = f"Prediksi gaya belajar ini rendah, "

    return prefix + "karena " + ", ".join(reasons) + "."


def _build_reason_items(
    cluster_id: int, confidence: float, features: Dict[str, Any]
) -> List[Dict[str, Any]]:
    """
    Membuat list alasan (strength/weakness/neutral) untuk disimpan di JSON 'reasons'.
    Bisa dipakai jika suatu saat ingin ditampilkan sebagai box terpisah di UI.
    """
    items: List[Dict[str, Any]] = []

    active_days = float(features.get("total_active_days", 0))
    journeys = float(features.get("total_journeys_completed", 0))
    score = float(features.get("avg_exam_score", 0))
    rej_ratio = float(features.get("rejection_ratio", 0))
    avg_time = float(features.get("avg_completion_time_hours", 0))
    level = confidence * 100

    def add(reason_type: str, metric: str, value: Any, note: str):
        items.append(
            {
                "type": reason_type,  # "strength" | "weakness" | "neutral"
                "metric": metric,
                "value": value,
                "note": note,
            }
        )

    # Strengths
    if journeys >= 30:
        add(
            "strength",
            "total_journeys_completed",
            journeys,
            "Kamu telah menyelesaikan cukup banyak journey sehingga pola belajarmu mulai terlihat jelas.",
        )

    if score >= 75:
        add(
            "strength",
            "avg_exam_score",
            score,
            "Nilai ujianmu tergolong baik, menunjukkan pemahaman materi yang cukup kuat.",
        )

    if active_days >= 200:
        add(
            "strength",
            "total_active_days",
            active_days,
            "Aktivitas belajarmu cukup sering dan konsisten.",
        )

    if rej_ratio < 0.4:
        add(
            "strength",
            "rejection_ratio",
            rej_ratio,
            "Rasio submission yang ditolak cukup rendah, menandakan ketelitian yang baik.",
        )

    # Weaknesses
    if journeys < 15:
        add(
            "weakness",
            "total_journeys_completed",
            journeys,
            "Jumlah journey yang kamu selesaikan masih relatif sedikit.",
        )

    if score < 70:
        add(
            "weakness",
            "avg_exam_score",
            score,
            "Nilai ujianmu masih perlu ditingkatkan agar pemahaman konsep lebih kuat.",
        )

    if rej_ratio >= 0.5:
        add(
            "weakness",
            "rejection_ratio",
            rej_ratio,
            "Rasio submission yang ditolak cukup tinggi, menunjukkan masih banyak proses revisi.",
        )

    if avg_time > 2000:
        add(
            "weakness",
            "avg_completion_time_hours",
            avg_time,
            "Waktu rata-rata menyelesaikan modul cukup panjang, kamu bisa mempertimbangkan pengelolaan waktu yang lebih efektif.",
        )

    # Neutral / ringkasan confidence
    if level == 100:
        note = "Model sangat yakin dengan prediksi ini."
    elif level >= 75:
        note = "Model cukup yakin dengan prediksi ini."
    elif level >= 60:
        note = "Model cukup meyakinkan, meskipun masih ada beberapa indikator yang tumpang tindih dengan cluster lain."
    else:
        note = "Model kurang yakin karena pola belajarmu mendekati beberapa cluster berbeda."

    add("neutral", "confidence", round(level, 2), note)

    return items


def _reasons_to_paragraph(reasons: List[Dict[str, Any]]) -> str:
    """
    Mengubah list reasons menjadi paragraf penjelasan singkat (tanpa emoji),
    yang akan digabungkan ke dalam insight_text.
    """
    if not reasons:
        return ""

    text_parts: List[str] = []

    for r in reasons:
        note = r.get("note", "")
        if note:
            text_parts.append(note)

    # Gabungkan semua note menjadi satu paragraf
    return " ".join(text_parts)


def _generate_insight_text(
    cluster_id: int, row: Dict[str, float], confidence: float
) -> str:
    """Buat insight utama berdasarkan template + kalimat confidence."""
    template = CLUSTER_TEMPLATES.get(cluster_id, "")

    base = template.format(
        active_days=row.get("total_active_days", 0),
        avg_time_hours=row.get("avg_completion_time_hours", 0),
        journeys=row.get("total_journeys_completed", 0),
        rejection_ratio=row.get("rejection_ratio", 0),
        score=row.get("avg_exam_score", 0),
    )

    confidence_note = _build_confidence_note(confidence, row)

    return f"{base} {confidence_note}"


def _predict_core(
    dev_id: int,
    features_override: Optional[Dict[str, Any]] = None,
) -> Tuple[str, int, str, str, float, Dict[str, Any], List[Dict[str, Any]]]:
    """
    Core prediction:
    - Kalau features_override disediakan -> pakai itu (biasanya dari DB).
    - Kalau tidak ada -> pakai fitur dari CSV (data_storage["features"]).
    """

    # 1. Coba ambil data dari CSV (untuk nama, dll)
    base_series = None
    try:
        base_series = data_storage["features"].loc[dev_id]
    except KeyError:
        base_series = None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Lookup error: {e}")

    dev_name = (
        str(base_series.get("developer_name", "Unknown"))
        if base_series is not None
        else "Unknown"
    )

    # 2. Tentukan raw_features
    if features_override:
        # Pakai fitur dari request (misalnya dari database)
        raw_features: Dict[str, float] = {}
        for col in FEATURE_COLUMNS_TOTAL:
            v = features_override.get(col, 0)
            try:
                raw_features[col] = float(v)
            except (TypeError, ValueError):
                raw_features[col] = 0.0
    else:
        # Fallback: pakai data dari CSV
        if base_series is None:
            empty = {col: 0.0 for col in FEATURE_COLUMNS_TOTAL}
            return (
                "Not Active",
                -1,
                dev_name,
                "User tidak ditemukan.",
                0.0,
                empty,
                [],
            )

        fitur_df_csv = base_series[FEATURE_COLUMNS_TOTAL].to_frame().T
        raw_features = fitur_df_csv.iloc[0].to_dict()

    # 3. Cek apakah aktif (journey > 0)
    if float(raw_features.get("total_journeys_completed", 0)) == 0:
        return (
            "Not Active",
            -1,
            dev_name,
            "User belum menyelesaikan journey.",
            0.0,
            raw_features,
            [],
        )

    # 4. Prediksi Model
    try:
        scaler = data_storage["scaler"]
        model = data_storage["model"]

        # Buat DataFrame dari raw_features (urutan kolom tetap)
        fitur_df = pd.DataFrame([raw_features])[FEATURE_COLUMNS_TOTAL]

        fitur_scaled = scaler.transform(fitur_df.values)
        cluster_id = int(model.predict(fitur_scaled)[0])
        distances = model.transform(fitur_scaled)[0]
        dist_to_own = float(distances[cluster_id])
        max_dist = float(distances.max())

        if max_dist == 0:
            confidence = 1.0
        else:
            confidence = max(0.0, 1.0 - dist_to_own / max_dist)

        profile = CLUSTER_PROFILES.get(cluster_id, {})
        label = profile.get("label_id", f"Cluster {cluster_id}")

        # Insight utama + penjelasan confidence
        insight_main = _generate_insight_text(cluster_id, raw_features, confidence)

        # Alasan detail (strength/weakness/neutral)
        reasons = _build_reason_items(cluster_id, confidence, raw_features)
        reason_paragraph = _reasons_to_paragraph(reasons)

        if reason_paragraph:
            full_insight_text = insight_main + " " + reason_paragraph
        else:
            full_insight_text = insight_main

    except Exception as e:
        print(f"Prediction Error: {e}")
        raise HTTPException(status_code=500, detail="Gagal melakukan prediksi model.")

    return (label,cluster_id, dev_name, full_insight_text, confidence, raw_features, reasons)



# =========================================================
# 5. ENDPOINTS
# =========================================================


@app.get("/")
def read_root():
    return {"message": "Selamat datang di API AI Learning Insight!"}


@app.post("/predict", response_model=PredictOutStatus)
async def predict_post(payload: PredictIn):
    (
        label,
        cluster_id,
        dev_name,
        insight_text,
        confidence,
        raw_features,
        reasons,
    ) = _predict_core(payload.developer_id, payload.features)

    if label == "Not Active":
        # Response untuk user tidak aktif / tidak ketemu
        return PredictOutStatus(status="error", message=insight_text, data=None)

    # Response Sukses
    data_obj = PredictOutData(
        label=label,
        confidence=confidence,
        reasons=reasons,
        developer_id=payload.developer_id,
        developer_name=dev_name,
        cluster_id=cluster_id,
        insight_text=insight_text,  # insight utama + confidence + alasan
        features=raw_features,
    )

    return PredictOutStatus(status="success", data=data_obj)


@app.get("/predict/{developer_id}", response_model=SimplePredictionOut)
async def predict_style_get(developer_id: int):
    (
        label,
        cluster_id,
        dev_name,
        insight,
        _confidence,
        _features,
        _reasons,
    ) = _predict_core(developer_id)

    status_msg = "Prediksi berhasil."
    if label == "Not Active":
        status_msg = insight

    return SimplePredictionOut(
        developer_id=developer_id,
        name=dev_name,
        learning_style=label,
        cluster_id=cluster_id,
        status=status_msg,
    )


if __name__ == "__main__":
    import uvicorn

    # Port 8001
    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)