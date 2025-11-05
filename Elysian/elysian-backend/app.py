from flask import Flask, request, jsonify
import numpy as np
import pandas as pd
import tensorflow as tf

app = Flask(__name__)

# Load city data
cities_df = pd.read_csv('cities_encoded.csv')

interpreter = tf.lite.Interpreter(model_path="model.tflite") # Load the TFLite model here.
interpreter.allocate_tensors() # Allocate tensors to run model.
# Need to get the input and output details for the model to run.
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

expected_input_len = input_details[0]['shape'][1] # We need to know what the expected input length is so that there is no bad user input.

# Create a route that home.tsx can post the user input to.
@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json()
        query_vector = data['query_vector'] # This is the user input given, which is labeled as query_vector.

        # Validate query_vector length
        query_len = len(query_vector)
        if query_len >= expected_input_len: # Ensure that the length of user input is less than the expected input length.
            return jsonify({'error': f'Query vector too long. Got {query_len}, expected less than {expected_input_len}'}), 400

        city_feature_len = expected_input_len - query_len # This is the features that we give to cities_encoded.csv to train the model on the most similar cities.
        scores = []

        for _, city in cities_df.iterrows():
            # Extract city features (must match city_feature_len)
            city_vector = []

            city_vector.extend([
                city['country_encoded'],
                city['continent_encoded'],
                city['seasons_encoded'],
                city['budget_encoded'],
                city['vibe_encoded']
            ])

            # Add vacation type flags
            for vt in ['Beach', 'Adventure', 'Culture', 'Nature']:
                city_vector.append(1 if vt in str(city.get('vacation_types', '')) else 0)

            # Trim or pad city_vector to match expected length
            if len(city_vector) > city_feature_len:
                city_vector = city_vector[:city_feature_len]
            elif len(city_vector) < city_feature_len:
                city_vector += [0] * (city_feature_len - len(city_vector))

            # Combine query + city
            full_vector = np.array(query_vector + city_vector, dtype=np.float32).reshape(1, -1)

            # Run the model for the processed input.
            interpreter.set_tensor(input_details[0]['index'], full_vector)
            interpreter.invoke()
            score = interpreter.get_tensor(output_details[0]['index'])[0][0]
            scores.append(score) # Get the scores from the model.

        cities_df['score'] = scores
        top_cities = cities_df.sort_values(by='score', ascending=False).head(3) # Get the top 3 of the recommendations.

        recommendations = []
        for _, row in top_cities.iterrows(): # For each top 3 city, we will store the relevant information in a list.
            recommendations.append({
                'city_id': row['city_id'],
                'city_name': row['city_name'],
                'country': row['country'],
                'score': float(row['score'])
            })

        return jsonify({'recommendations': recommendations}) # Make the list into a JSON to give back as output from the POST method.

    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
