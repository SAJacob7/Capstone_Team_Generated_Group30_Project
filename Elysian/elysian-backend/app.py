from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
import tensorflow as tf
import joblib
from numpy.linalg import norm
import firebase_admin
from firebase_admin import credentials, firestore


app = Flask(__name__)

# ---------------------------------------------------------
# Firebase init
# ---------------------------------------------------------
cred = credentials.Certificate("../elysianproject-2b9ce-firebase-adminsdk-fbsvc-542db33246.json")
firebase_admin.initialize_app(cred)
db = firestore.client()


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

# Map city_id -> index in cities_df / city_vectors
city_id_to_idx = {
    row["city_id"]: idx
    for idx, row in cities_df.iterrows()
}


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
# Firebase helpers: likes/dislikes
# ---------------------------------------------------------
def get_user_feedback(user_id):
    fav_doc = db.collection("userFavorites").document(user_id).get()
    dislike_doc = db.collection("userDislikes").document(user_id).get()

    liked = list(fav_doc.to_dict().keys()) if fav_doc.exists else []
    disliked = list(dislike_doc.to_dict().keys()) if dislike_doc.exists else []

    return liked, disliked


def swipe(user_id, city_id, liked: bool):
    collection = "userFavorites" if liked else "userDislikes"
    doc_ref = db.collection(collection).document(user_id)
    # merge city_id as a field; value doesn't matter for ranking
    doc_ref.set({city_id: True}, merge=True)



def to_indices(city_ids):
    return [city_id_to_idx[cid] for cid in city_ids if cid in city_id_to_idx]

# ---------------------------------------------------------
# Similarity + ranking
# ---------------------------------------------------------
def cosine(a, b):
    return np.dot(a, b) / (norm(a) * norm(b) + 1e-8)


def similarity_to_group(city_vec, group_idx):
    if not group_idx:
        return 0.0
    sims = [cosine(city_vec, city_vectors[i]) for i in group_idx]
    return float(np.mean(sims))


ALPHA = 1.0
BETA = 0.7
GAMMA = 0.7


def get_dynamic_scores(user_vec, user_id):
    liked_ids, disliked_ids = get_user_feedback(user_id)
    liked_idx = to_indices(liked_ids)
    disliked_idx = to_indices(disliked_ids)

    base_scores = city_vectors @ user_vec  # same as before

    final_scores = []
    for i, city_vec in enumerate(city_vectors):
        sim_liked = similarity_to_group(city_vec, liked_idx)
        sim_disliked = similarity_to_group(city_vec, disliked_idx)

        score = (
            ALPHA * base_scores[i] +
            BETA * sim_liked -
            GAMMA * sim_disliked
        )
        final_scores.append(score)

    return np.array(final_scores), liked_idx, disliked_idx
def next_city(user_vec, user_id):
    scores, liked_idx, disliked_idx = get_dynamic_scores(user_vec, user_id)

    # Exclude already swiped cities
    seen = set(liked_idx + disliked_idx)
    for idx in seen:
        scores[idx] = -1e9  # effectively remove

    next_idx = int(np.argmax(scores))
    row = cities_df.iloc[next_idx]

    return {
        "city_id": row["city_id"],
        "city_name": row["city_name"],
        "country": row["country"],
        "score": float(scores[next_idx])
    }


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

@app.route("/next_city", methods=["POST"])
def api_next_city():
    try:
        data = request.get_json()
        user_id = data["user_id"]  # you must send this from frontend

        # Same encoding as /recommend
        origin_enc, fav_enc, multi_hot = encode_user_inputs(data)
        user_vec = get_user_embedding(origin_enc, fav_enc, multi_hot)

        city = next_city(user_vec, user_id)
        return jsonify({"city": city})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/swipe", methods=["POST"])
def api_swipe():
    try:
        data = request.get_json()
        user_id = data["user_id"]
        city_id = data["city_id"]
        liked = bool(data["liked"])  # true = like, false = dislike

        swipe(user_id, city_id, liked)
        return jsonify({"status": "ok"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/")
def home():
    return jsonify({"status": "Travel recommender backend running"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5003)
