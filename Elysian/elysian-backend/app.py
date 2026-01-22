from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
import tensorflow as tf
import joblib

app = Flask(__name__)

# ---------------------------------------------------------
# Load encoders
# ---------------------------------------------------------
le_origin = joblib.load("le_origin.pkl")
le_fav = joblib.load("le_fav.pkl")
mlbs = joblib.load("mlbs.pkl")   # dict of MultiLabelBinarizers

# ---------------------------------------------------------
# Load city data + precomputed embeddings
# ---------------------------------------------------------
cities_df = pd.read_csv("../../Datasets/cities.csv")
city_vectors = np.load("city_vectors.npy")   # shape: (num_cities, embedding_dim)

# ---------------------------------------------------------
# Load user-only TFLite model
# ---------------------------------------------------------
interpreter = tf.lite.Interpreter(model_path="user_encoder.tflite")
interpreter.allocate_tensors()

input_details = interpreter.get_input_details()
# for i, d in enumerate(input_details):
#     print(i, d["name"], d["shape"], d["dtype"])

output_details = interpreter.get_output_details()

# Expecting:
# input 0 → origin_enc (float32, shape [1,1])
# input 1 → fav_enc (float32, shape [1,1])
# input 2 → multi_hot (float32, shape [1, multi_dim])
U_MULTI_IDX = 0
U_ORIGIN_IDX = 1
U_FAV_IDX = 2


# ---------------------------------------------------------
# Helper: Encode user profile into model-ready inputs
# ---------------------------------------------------------
def encode_user_inputs(data):
    # Encode origin country
    origin_enc = float(le_origin.transform([data["origin_country"]])[0])

    # Encode favorite country visited
    fav_enc = float(le_fav.transform([data["favorite_country_visited"]])[0])

    # Encode multi-hot vector
    multi_hot_parts = []

    for feature in ["vacation_types", "seasons", "budget", "place_type"]:
        values = data.get(feature, [])
        mlb = mlbs[feature]
        encoded = mlb.transform([values])[0]
        multi_hot_parts.append(encoded)

    multi_hot = np.concatenate(multi_hot_parts).astype(np.float32)
    # print("User multi-hot length:", len(multi_hot))


    return origin_enc, fav_enc, multi_hot


# ---------------------------------------------------------
# Helper: Run user encoder TFLite model
# ---------------------------------------------------------
def get_user_embedding(origin_enc, fav_enc, multi_hot):
    # Prepare tensors
    origin_tensor = np.array([[origin_enc]], dtype=np.float32)
    fav_tensor = np.array([[fav_enc]], dtype=np.float32)
    multi_tensor = np.array([multi_hot], dtype=np.float32)

    # Correct order for user-only TFLite model
    interpreter.set_tensor(input_details[U_MULTI_IDX]["index"], np.array([multi_hot], dtype=np.float32))
    interpreter.set_tensor(input_details[U_ORIGIN_IDX]["index"], np.array([[origin_enc]], dtype=np.float32))
    interpreter.set_tensor(input_details[U_FAV_IDX]["index"], np.array([[fav_enc]], dtype=np.float32))


    interpreter.invoke()

    # Output is the user embedding vector
    user_vec = interpreter.get_tensor(output_details[0]["index"])[0]
    return user_vec


# ---------------------------------------------------------
# Recommendation endpoint
# ---------------------------------------------------------
@app.route("/recommend", methods=["POST"])
def recommend():
    try:
        data = request.get_json()

        # Encode user answers
        origin_enc, fav_enc, multi_hot = encode_user_inputs(data)

        # Get user embedding
        user_vec = get_user_embedding(origin_enc, fav_enc, multi_hot)

        # Compute similarity scores
        scores = city_vectors @ user_vec

        # Top K
        k = data.get("k", 5)
        top_idx = scores.argsort()[::-1][:k]

        results = []
        for idx in top_idx:
            row = cities_df.iloc[idx]
            results.append({
                "city_id": row["city_id"],
                "city_name": row["city_name"],
                "country": row["country"],
                "score": float(scores[idx])
            })

        return jsonify({"recommendations": results})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/")
def home():
    return jsonify({"status": "Travel recommender backend running"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5003)
