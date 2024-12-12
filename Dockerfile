# Menggunakan base image Python resmi dengan versi 3.9
FROM python:3.9

# Menetapkan direktori kerja dalam container
WORKDIR /app

# Menetapkan variabel lingkungan untuk port
ENV PORT 8080

# Menyalin file aplikasi ke dalam container
COPY . /app

RUN python -m venv /venv
ENV PATH="/venv/bin:$PATH"

# Menambahkan dependensi yang diperlukan untuk menggunakan wget
RUN apt-get update && apt-get install -y wget

# Mengunduh file
RUN wget -O model_v3.h5 https://storage.googleapis.com/sakunusa-app/model/model_v3.h5

# Menginstal dependencies
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Membuka port yang akan digunakan oleh aplikasi
EXPOSE 8080

# Menjalankan aplikasi FastAPI menggunakan Uvicorn
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
