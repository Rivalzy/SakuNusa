import tensorflow as tf

# Path ke model SavedModel
saved_model_dir = "anomaly/model_converted"

# Konversi model ke TFLite
converter = tf.lite.TFLiteConverter.from_saved_model(saved_model_dir)
tflite_model = converter.convert()

# Simpan model TFLite
with open("anomaly/model/model_v1.h5", "wb") as f:
    f.write(tflite_model)
