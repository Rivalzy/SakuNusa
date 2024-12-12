from fastapi import FastAPI
import numpy as np
from tensorflow.lite.python.interpreter import Interpreter

app = FastAPI()

# Path ke model TFLite
MODEL_PATH = "anomaly/model/model_v1.h5"
interpreter = Interpreter(model_path=MODEL_PATH)
interpreter.allocate_tensors()

@app.post("/predict")
def predict(input_data: dict):
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    # Format data sesuai kebutuhan model
    input_array = np.array(input_data['features'], dtype=np.float32)
    interpreter.set_tensor(input_details[0]['index'], input_array)
    interpreter.invoke()

    output_data = interpreter.get_tensor(output_details[0]['index'])
    return {"prediction": output_data.tolist()}
