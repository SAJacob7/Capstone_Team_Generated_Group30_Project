import tensorflow as tf

# Load your model
model = tf.keras.models.load_model('travel_recommender_model.h5')

# Convert to TFLite
converter = tf.lite.TFLiteConverter.from_keras_model(model)
tflite_model = converter.convert()

# Save the model
with open('travel_recommender_model.tflite', 'wb') as f:
    f.write(tflite_model)
