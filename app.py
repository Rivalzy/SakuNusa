# from fastapi import FastAPI
# from pydantic import BaseModel
# import numpy as np
# from sklearn.preprocessing import MinMaxScaler
# import tensorflow as tf
# from tensorflow.keras.models import load_model
# from keras.src.legacy.saving import legacy_h5_format



# # Load scaler dan model yang sudah dilatih

# model = legacy_h5_format.load_model_from_hdf5("anomaly.h5", custom_objects={'mse': 'mse'})  # Pastikan model sudah disimpan sebelumnya
# scaler = MinMaxScaler()
# # Fit scaler with sample data range (adjust these values based on your actual data range)
# scaler.fit([[0], [1000000]])  # Example: fitting with minimum and maximum transaction amounts


# # Inisialisasi FastAPI
# app = FastAPI()

# # Definisikan input model menggunakan Pydantic
# class TestData(BaseModel):
#     input_date: str
#     input_amount: float

# # Fungsi untuk menguji data manual
# def test_manual_data(input_date, input_amount, scaler, model, sequence_length, threshold):
#     try:
#         # Normalisasi jumlah
#         normalized_amount = scaler.transform([[input_amount]])  # Normalisasi input_amount
        
#         # Simulasi sequence dengan data input
#         sequence = np.zeros((sequence_length, 1))  # Membuat sequence dengan panjang sesuai (sequence_length)
#         sequence[-1] = normalized_amount  # Menempatkan normalized_amount pada posisi terakhir sequence
        
#         # Reshape untuk sesuai dengan input model (1, sequence_length, 1)
#         sequence = sequence.reshape((1, sequence_length, 1))
        
#         # Prediksi dengan model
#         predicted_sequence = model.predict(sequence, verbose=0)
        
#         # Hitung loss
#         loss = np.mean(np.abs(predicted_sequence - sequence))
        
#         # Deteksi anomali
#         is_anomaly = loss > threshold
        
#         # Mengembalikan hasil
#         return {
#             "Input Date": input_date,
#             "Input Amount": input_amount,
#             "Normalized Amount": normalized_amount[0][0],
#             "Reconstruction Loss": loss,
#             "Threshold": threshold,
#             "Anomaly": is_anomaly
#         }
    
#     except Exception as e:
#         return {"Error": str(e)}

# # Endpoint untuk menerima permintaan data manual
# @app.post("/predict/")
# def predict(test_data: TestData):
#     try:
#         # Menggunakan input dari permintaan
#         input_date = test_data.input_date
#         input_amount = test_data.input_amount
        
#         # Setel panjang sequence dan threshold untuk deteksi anomali
#         sequence_length = 29  # Sesuaikan dengan panjang input sequence model Anda
#         threshold = 0.05      # Sesuaikan ambang batas deteksi anomali

#         # Menjalankan pengujian model
#         result = test_manual_data(input_date, input_amount, scaler, model, sequence_length, threshold)

#         # Mengembalikan hasil sebagai response JSON
#         return result
    
#     except Exception as e:
#         return {"Error": str(e)}

# # Menjalankan server menggunakan Uvicorn
# # Jika Anda ingin menjalankan server, jalankan perintah berikut di terminal:
# # uvicorn app:app --reload

from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import tensorflow as tf
from tensorflow.keras.models import load_model

# Initialize FastAPI
app = FastAPI()

# Define input model using Pydantic
class TestData(BaseModel):
    input_date: str
    input_amount: float

try:
    # Load the model directly using load_model
    model = load_model("model_v3.h5", compile=False)
    # Compile the model after loading
    model.compile(optimizer='adam', loss='mse')
    
    # Initialize and fit scaler
    scaler = MinMaxScaler()
    scaler.fit([[0], [1000000]])  # Adjust range based on your data

except Exception as e:
    print(f"Error loading model: {e}")

# Function to test manual data
def test_manual_data(input_date, input_amount, scaler, model, sequence_length=10, threshold=0.5):
    try:
        # Normalize amount
        normalized_amount = scaler.transform([[float(input_amount)]])
        
        # Create sequence
        sequence = np.zeros((sequence_length, 1))
        sequence[-1] = normalized_amount
        
        # Reshape for model input
        sequence = sequence.reshape((1, sequence_length, 1))
        
        # Make prediction
        predicted_sequence = model.predict(sequence, verbose=0)
        
        # Calculate loss
        loss = np.mean(np.abs(predicted_sequence - sequence))

        is_anomaly = loss > threshold
        
        return {"loss": float(loss), "is_anomaly": bool(is_anomaly)}
        
    except Exception as e:
        raise ValueError(f"Error processing data: {e}")

@app.post("/predict/")
def predict(test_data: TestData):
    try:
        # Menggunakan input dari permintaan
        input_date = test_data.input_date
        input_amount = test_data.input_amount
        
        # Setel panjang sequence dan threshold untuk deteksi anomali
        sequence_length = 29  # Sesuaikan dengan panjang input sequence model Anda
        threshold = 0.05      # Sesuaikan ambang batas deteksi anomali

        # Menjalankan pengujian model
        result = test_manual_data(input_date, input_amount, scaler, model, sequence_length, threshold)

        # Mengembalikan hasil sebagai response JSON
        return result
    
    except Exception as e:
        return {"Error": str(e)}