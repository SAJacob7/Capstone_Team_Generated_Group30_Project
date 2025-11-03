import numpy as np
import pandas as pd

# Define all vacation types used in your model
all_vacation_types = [
    "Beach",
    "City",
    "Historical",
    "Adventure",
    "Nature",
    "Religious"
]

def encode_vacation_types(types_series, all_types):
    """
    Encode vacation types from a pandas Series into binary vectors.
    Each vector has length equal to len(all_types), with 1s for selected types.
    """
    encoded = np.zeros((len(types_series), len(all_types)))
    for i, types_str in enumerate(types_series):
        if pd.notna(types_str):
            for vacation_type in str(types_str).split('|'):
                vacation_type = vacation_type.strip()
                if vacation_type in all_types:
                    encoded[i, all_types.index(vacation_type)] = 1
    return encoded
