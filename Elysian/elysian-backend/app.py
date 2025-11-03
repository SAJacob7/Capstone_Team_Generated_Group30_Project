from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
import tensorflow as tf

app = Flask(__name__)

# Load city data
cities_df = pd.read_csv('cities_encoded.csv')

# Load TFLite model
interpreter = tf.lite.Interpreter(model_path="model.tflite")
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# Determine expected input length
expected_input_len = input_details[0]['shape'][1]

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json()
        query_vector = data['query_vector']

        # Validate query_vector length
        query_len = len(query_vector)
        if query_len >= expected_input_len:
            return jsonify({'error': f'Query vector too long. Got {query_len}, expected less than {expected_input_len}'}), 400

        city_feature_len = expected_input_len - query_len
        scores = []

        for _, city in cities_df.iterrows():
            # Extract city features (must match city_feature_len)
            city_vector = []

            # Example: 5 categorical + 4 vacation flags = 9
            city_vector.extend([
                city['country_encoded'],
                city['continent_encoded'],
                city['seasons_encoded'],
                city['budget_encoded'],
                city['vibe_encoded']
            ])

            # Add vacation type flags (adjust based on your training setup)
            for vt in ['Beach', 'Adventure', 'Culture', 'Nature']:
                city_vector.append(1 if vt in str(city.get('vacation_types', '')) else 0)

            # Trim or pad city_vector to match expected length
            if len(city_vector) > city_feature_len:
                city_vector = city_vector[:city_feature_len]
            elif len(city_vector) < city_feature_len:
                city_vector += [0] * (city_feature_len - len(city_vector))

            # Combine query + city
            full_vector = np.array(query_vector + city_vector, dtype=np.float32).reshape(1, -1)

            # Run inference
            interpreter.set_tensor(input_details[0]['index'], full_vector)
            interpreter.invoke()
            score = interpreter.get_tensor(output_details[0]['index'])[0][0]
            scores.append(score)

        cities_df['score'] = scores
        top_cities = cities_df.sort_values(by='score', ascending=False).head(3)

        recommendations = []
        for _, row in top_cities.iterrows():
            recommendations.append({
                'city_id': row['city_id'],
                'city_name': row['city_name'],
                'country': row['country'],
                'score': float(row['score'])
            })

        return jsonify({'recommendations': recommendations})

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
