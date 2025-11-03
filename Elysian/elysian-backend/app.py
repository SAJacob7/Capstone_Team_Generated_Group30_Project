from flask import Flask, request, jsonify
import tensorflow as tf
import numpy as np
import pandas as pd
from utils import encode_vacation_types, all_vacation_types

app = Flask(__name__)

# Load model
model = tf.keras.models.load_model('travel_recommender_model.h5')

# Load encoded city data
cities_df = pd.read_csv('cities_encoded.csv')
for i, layer in enumerate(model.input):
    print(f"Input {i}: name={layer.name}, shape={layer.shape}")

# Extract encoded city features
city_cat_all = cities_df[['country_encoded', 'continent_encoded', 'seasons_encoded', 'budget_encoded', 'vibe_encoded']].values
city_vac_all = encode_vacation_types(cities_df['vacation_types'], all_vacation_types)

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json()

    # Extract query features and reshape to match model input
    query_cat = np.array(data['query_categorical']).reshape(1, 4)
    query_vac = np.array(data['query_vacation_types']).reshape(1, 6)

    # Repeat query features for all cities
    query_cat_repeated = np.tile(query_cat, (len(cities_df), 1))  # shape: (N, 4)
    query_vac_repeated = np.tile(query_vac, (len(cities_df), 1))  # shape: (N, 6)

    # Extract city features
    city_cat_all = cities_df[['continent_encoded', 'budget_encoded', 'vibe_encoded']].values  # shape: (N, 3)
    city_vac_all = encode_vacation_types(cities_df['vacation_types'], all_vacation_types)     # shape: (N, 6)

    # Debug: print shapes
    print("query_cat_repeated shape:", query_cat_repeated.shape)
    print("query_vac_repeated shape:", query_vac_repeated.shape)
    print("city_cat_all shape:", city_cat_all.shape)
    print("city_vac_all shape:", city_vac_all.shape)

    # Predict scores
    predictions = model.predict({
        'query_categorical': query_cat_repeated,
        'query_vacation_types': query_vac_repeated,
        'city_categorical': city_cat_all,
        'city_vacation_types': city_vac_all
    }, verbose=0).flatten()

    # Get top 3 cities
    top_indices = np.argsort(predictions)[::-1][:3]
    recommendations = []
    for idx in top_indices:
        city = cities_df.iloc[idx]
        recommendations.append({
            'city_id': city['city_id'],
            'city_name': city['city_name'],
            'country': city['country'],
            'score': float(predictions[idx])
        })

    return jsonify({'recommendations': recommendations})


# Start the Flask server
if __name__ == '__main__':
    app.run(debug=True)
