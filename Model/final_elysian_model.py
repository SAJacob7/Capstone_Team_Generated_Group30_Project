"""
Purpose: Using this script to build a travel recommendation system using TensorFlow.
It basically processes user query data and city data, encodes categorical features,
creates training pairs, and trains a neural network to predict matching scores between users and cities.
"""

# importing all the required imports
import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
import matplotlib.pyplot as plt

# Set random seeds for reproducibility
np.random.seed(42)
tf.random.set_seed(42)

"""
LOAD AND INSPECT THE DATA:
  The script takes in 2 CSV files:
   - queries.csv: user travel preeferences/queries
   - cities.csv: list of cities with attributes
"""

queries_df = pd.read_csv('queries.csv')
cities_df = pd.read_csv('cities.csv')

# Display data info
print("Queries DataFrame shape:", queries_df.shape)
print("Cities DataFrame shape:", cities_df.shape)
print("\nQueries columns:", queries_df.columns.tolist())
print("Cities columns:", cities_df.columns.tolist())


"""
DATA PROCESSING: In this section, we encode categorical text fields (like 'country' 'budget', 'season')
into numerical form using LabelEncoder. This will help our mdoel interpret them.
"""

print("\n=== Data Preprocessing ===")

# Create label encoders for categorical features
label_encoders = {}

# Encode categorical features for queries
categorical_features_queries = [
    'origin_country', 'seasons', 'budget', 'favorite_country_visited', 'place_type'
]

print("Encoding query features...")
for feature in categorical_features_queries:
  # Check if the column exists in the Data frame
    if feature in queries_df.columns:
        le = LabelEncoder() # Intialize the label encoder
        queries_df[f'{feature}_encoded'] = le.fit_transform(queries_df[feature].astype(str))
        label_encoders[feature] = le # Save the encoder for future decoding or model inference
        print(f"{feature}: {len(le.classes_)} classes") # Print how many unique categories were found for this feature
    else:
        print(f"Warning: {feature} not found in queries dataframe") # Warn if the expected feature column is missing in the dataset

"""
Encode categorical features in the city dataset such as 'country', 'continent', 'budget', etc.
"""
categorical_features_cities = [
    'country', 'continent', 'seasons', 'budget', 'vibe'
]

print("\nEncoding city features...")
for feature in categorical_features_cities:
  # Check if the city feature column exists before encoding
    if feature in cities_df.columns:
        le = LabelEncoder() # Create a label encoder instance
        # Convert column values to string (avoiding dtype issues) and encode
        cities_df[f'{feature}_encoded'] = le.fit_transform(cities_df[feature].astype(str))
        label_encoders[feature] = le # Save encoder to dictionary for possible inverse transformation
        print(f"{feature}: {len(le.classes_)} classes") # Display how many unique categories were encoded for this feature
    else:
        print(f"Warning: {feature} not found in cities dataframe") # Warn if the expected column is missing

# Save the encoded city data for backend use
cities_df.to_csv('cities_encoded.csv', index=False)


"""
MULTI-LABEL FEATURE PROCESSING/ENCODING:

The "vaction_types" column may have multiple values per record, like "beach/Adventure".
This section converts them into a binary vector representation.
"""
print("\nProcessing multi-label features...")


# Get all unique vacation types from both datasets
all_vacation_types = set()
# Iterate through both datasets (queries and cities)
for dataset in [queries_df, cities_df]:
  # Only proceed if the dataset contains a 'vacation_types' column
    if 'vacation_types' in dataset.columns:
      # Loop through each entry in the column
        for types in dataset['vacation_types']:
            if pd.notna(types):
              # Split multiple vacation types separated by '|'
              # and add them to the set (automatically removes duplicates)
                all_vacation_types.update(str(types).split('|'))

all_vacation_types = sorted(list(all_vacation_types)) # Convert the set to a sorted list for consistent indexing
print(f"Found {len(all_vacation_types)} vacation types: {all_vacation_types}") # Display the number of unique vacation types found and list them

"""
Convert a list of vacation types into a binary vector representation. Each column represents a vacation type.
"""
def encode_vacation_types(types_series, all_types):
    encoded = np.zeros((len(types_series), len(all_types)))
    for i, types_str in enumerate(types_series):
        if pd.notna(types_str):
            for vacation_type in str(types_str).split('|'):
                if vacation_type in all_types:
                    encoded[i, all_types.index(vacation_type)] = 1
    return encoded

# Encode vacation types for both queries and cities
if 'vacation_types' in queries_df.columns:
    vacation_types_encoded_queries = encode_vacation_types(queries_df['vacation_types'], all_vacation_types)
else:
    vacation_types_encoded_queries = np.zeros((len(queries_df), len(all_vacation_types)))

if 'vacation_types' in cities_df.columns:
    vacation_types_encoded_cities = encode_vacation_types(cities_df['vacation_types'], all_vacation_types)
else:
    vacation_types_encoded_cities = np.zeros((len(cities_df), len(all_vacation_types)))

"""
CREATE TRAINING DATA:
We create:
- Positive pairs: user queries linked to cities they liked
- Negative pairs: random city samples not linked to the query
"""

# Prepare training data
print("\n=== Preparing Training Data ===")

# Create query-city pairs with positive examples (from your data)
positive_pairs = []
for _, query in queries_df.iterrows():
    if 'positive_city_id' in query:
        city_id = query['positive_city_id']
        city_data = cities_df[cities_df['city_id'] == city_id]
        if not city_data.empty:
            positive_pairs.append({
                'query_id': query['query_id'],
                'city_id': city_id,
                'label': 1  # Positive interaction
            })

positive_pairs_df = pd.DataFrame(positive_pairs)
print(f"Positive pairs: {len(positive_pairs_df)}")

# Create negative examples (random city not in positive pairs)
negative_pairs = []
for _, query in queries_df.iterrows():
    if 'positive_city_id' in query:
        positive_city = query['positive_city_id']
        # Get random cities that are not the positive one
        available_cities = cities_df[cities_df['city_id'] != positive_city]
        if len(available_cities) > 0:
            n_negative = min(2, len(available_cities))
            negative_cities = available_cities.sample(n=n_negative)['city_id'].tolist()
            for city_id in negative_cities:
                negative_pairs.append({
                    'query_id': query['query_id'],
                    'city_id': city_id,
                    'label': 0  # Negative interaction
                })

negative_pairs_df = pd.DataFrame(negative_pairs)
print(f"Negative pairs: {len(negative_pairs_df)}")

# Combine positive and negative pairs
all_pairs_df = pd.concat([positive_pairs_df, negative_pairs_df], ignore_index=True)
print(f"Total pairs: {len(all_pairs_df)}")

# Merge with query and city features
training_data = all_pairs_df.merge(
    queries_df, on='query_id', how='left'
).merge(
    cities_df, left_on='city_id', right_on='city_id', how='left', suffixes=('_query', '_city')
)

print(f"Final training data shape: {training_data.shape}")


"""
MODEL INPUT PREPARATION:

Over here we select encoded features to feed into the model for both query and city data.
This is to ensure only available columns are used.
"""

# Prepare input features for the model
print("\n=== Preparing Model Inputs ===")

# Define query features (only use ones that exist)
query_features = []
for feature in ['origin_country_encoded', 'seasons_encoded', 'budget_encoded',
                'favorite_country_visited_encoded', 'place_type_encoded']:
    if feature in training_data.columns:
        query_features.append(feature)

# City features (only use ones that exist)
city_features = []
for feature in ['country_encoded', 'continent_encoded', 'seasons_encoded',
                'budget_encoded', 'vibe_encoded']:
    if feature in training_data.columns:
        city_features.append(feature)

print(f"Using query features: {query_features}")
print(f"Using city features: {city_features}")

# Check if we have enough features to proceed
if len(query_features) == 0 or len(city_features) == 0:
    print("Error: No features available for training!")
else:
    """Convert encoded categorical and vaction features into numpy arrays to serve as neural network input"""
    X_query_categorical = training_data[query_features].values
    X_city_categorical = training_data[city_features].values

    # Get vacation types encodings for the training pairs
    X_query_vacation = np.array([vacation_types_encoded_queries[
        queries_df[queries_df['query_id'] == qid].index[0]
    ] for qid in training_data['query_id']])

    X_city_vacation = np.array([vacation_types_encoded_cities[
        cities_df[cities_df['city_id'] == cid].index[0]
    ] for cid in training_data['city_id']])

    y = training_data['label'].values

    print(f"Query categorical features shape: {X_query_categorical.shape}")
    print(f"City categorical features shape: {X_city_categorical.shape}")
    print(f"Query vacation features shape: {X_query_vacation.shape}")
    print(f"City vacation features shape: {X_city_vacation.shape}")
    print(f"Labels shape: {y.shape}")

    """
    BUILD AND TRAIN MODEL:
    This is a simple dense neural network that learns to predict compatability between a query and a city.
    """
    print("\n=== Building Model ===")

    def build_recommender_model(total_input_dim):
      """Creates a fully-connected neural network for binary classification"""
      input_layer = layers.Input(shape=(total_input_dim,), name='combined_input')

      x = layers.Dense(64, activation='relu')(input_layer)
      x = layers.Dense(32, activation='relu')(x)
      x = layers.Dropout(0.3)(x)
      x = layers.Dense(16, activation='relu')(x)
      x = layers.Dropout(0.2)(x)
      output = layers.Dense(1, activation='sigmoid', name='prediction')(x)

      model = keras.Model(inputs=input_layer, outputs=output)
      return model


    # Combine query + city + vacation features into one vector
    X_combined = np.concatenate([
        X_query_categorical,
        X_query_vacation,
        X_city_categorical,
        X_city_vacation
    ], axis=1)

    # Split data
    X_train, X_val, y_train, y_val = train_test_split(X_combined, y, test_size=0.2, random_state=42, stratify=y)

    # Create and compile model
    model = build_recommender_model(total_input_dim=X_combined.shape[1])
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

    # Train model
    history = model.fit(X_train, y_train, validation_data=(X_val, y_val), epochs=50, batch_size=32, verbose=1)

    """
    VISUALIZE TRAINING: Plot loss and accuracy curves to see how well the model learned.
    """
    # Plot training history
    plt.figure(figsize=(12, 4))
    plt.subplot(1, 2, 1)
    plt.plot(history.history['loss'], label='Training Loss')
    plt.plot(history.history['val_loss'], label='Validation Loss')
    plt.title('Model Loss')
    plt.xlabel('Epoch')
    plt.ylabel('Loss')
    plt.legend()

    plt.subplot(1, 2, 2)
    plt.plot(history.history['accuracy'], label='Training Accuracy')
    plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
    plt.title('Model Accuracy')
    plt.xlabel('Epoch')
    plt.ylabel('Accuracy')
    plt.legend()
    plt.tight_layout()
    plt.show()

    """
    RECOMMENDATION FUNCTION:
    This function takes a user query ID and predicts the top-K most suitable cities based on the trained model.
    """
    print("\n=== Recommendation System ===")

    def recommend_cities(query_id, top_k=5):
      """Recommend top K cities for a given query"""
      # Get query data
      query_data = queries_df[queries_df['query_id'] == query_id].iloc[0]

      # Prepare query features
      query_cat = np.array([query_data[feature] for feature in query_features])
      query_vacation = vacation_types_encoded_queries[queries_df[queries_df['query_id'] == query_id].index[0]]

      # Prepare all cities for prediction
      city_cat_all = cities_df[city_features].values
      city_vacation_all = vacation_types_encoded_cities
      city_feature_matrix = np.concatenate([city_cat_all, city_vacation_all], axis=1)
      np.save('city_feature_matrix.npy', city_feature_matrix)
      cities_df.to_csv('cities_encoded1.csv', index=False)

      # Repeat query features for all cities
      query_cat_repeated = np.tile(query_cat, (len(cities_df), 1))
      query_vacation_repeated = np.tile(query_vacation, (len(cities_df), 1))

      # Combine all features into one input array
      combined_input = np.concatenate([
          query_cat_repeated,
          query_vacation_repeated,
          city_cat_all,
          city_vacation_all
      ], axis=1)

      # Predict scores
      predictions = model.predict(combined_input, verbose=0).flatten()

      # Get top K recommendations
      top_indices = np.argsort(predictions)[::-1][:top_k]
      recommendations = []

      print(f"Top {top_k} recommendations for query {query_id}:")
      print("=" * 50)

      for i, idx in enumerate(top_indices):
          city = cities_df.iloc[idx]
          score = predictions[idx]
          recommendations.append({
              'city_id': city['city_id'],
              'city_name': city['city_name'],
              'country': city['country'],
              'score': float(score)
          })
          print(f"{i+1}. {city['city_name']}, {city['country']} (Score: {score:.4f})")

      return recommendations


    # Test Recommendation System
    print("\nTesting recommendations:")
    if len(queries_df) > 0:
        sample_query = queries_df['query_id'].iloc[0]
        recommendations = recommend_cities(sample_query, top_k=3)
    else:
        print("No queries available for testing")

    """
    MODEL SAVING AND EXPORT:
    Save model for reuse and convert to TensorFlow Lite for mobile deployment.
    """
    model.save('travel_recommender_model.h5')

    converter = tf.lite.TFLiteConverter.from_keras_model(model)
    tflite_model = converter.convert()

    with open('model.tflite', 'wb') as f:
        f.write(tflite_model)

    print(f"\nModel saved as 'travel_recommender_model.h5'")

    """
    MODEL EVALUATION: Evaluate on validation data and show accuracy, precision, and recall.
    """
    print("\n=== Model Evaluation ===")
    val_predictions = model.predict(val_data, verbose=0)
    val_pred_binary = (val_predictions > 0.5).astype(int).flatten()

    from sklearn.metrics import classification_report, confusion_matrix
    print("\nClassification Report:")
    print(classification_report(y_val, val_pred_binary))

    print("\nConfusion Matrix:")
    print(confusion_matrix(y_val, val_pred_binary))