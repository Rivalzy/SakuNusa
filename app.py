import os
from fastapi import FastAPI
from pydantic import BaseModel
import numpy as np
from sklearn.preprocessing import MinMaxScaler
from datetime import datetime
import tensorflow as tf
from tensorflow.keras.models import load_model

# Initialize FastAPI
app = FastAPI()

# Define input model using Pydantic
class TestData(BaseModel):
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

@app.get("/")
def read_root():
    return {"Status": "Sukses"}

@app.post("/anom/")
def predict(test_data: TestData):
    try:
        # Menggunakan input dari permintaan
        input_date = datetime.today().strftime('%Y-%m-%d') # mengambil tanggal hari ini
        input_amount = test_data.input_amount
        
        # Setel panjang sequence dan threshold untuk deteksi anomali
        sequence_length = 29 
        threshold = 0.05     

        # Menjalankan pengujian model
        result = test_manual_data(input_date, input_amount, scaler, model, sequence_length, threshold)

        response = {
            "Date": input_date,
            "Amount": input_amount,
            "Loss": result["loss"],
            "Anomaly Detected": result["is_anomaly"],
        }

        # Mengembalikan hasil sebagai response JSON
        return response
    
    except Exception as e:
        return {"Error": str(e)}

    
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080)) 
    app.run(app, host="0.0.0.0", port=port)