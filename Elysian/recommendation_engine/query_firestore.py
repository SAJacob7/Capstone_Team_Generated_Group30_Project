import firebase_admin
from firebase_admin import credentials, firestore
import csv

cred = credentials.Certificate("elysianproject-2b9ce-firebase-adminsdk-fbsvc-542db33246.json")
firebase_admin.initialize_app(cred)

db = firestore.client()
ref = db.collection("userProfiles")

docs = ref.stream()

with open("user_preferences.csv", mode="w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(["uid","current_country","vacation_type","seasons","budget","country_pref","distance", "place_type"])

    for doc in docs:
        data = doc.to_dict()
        responses = data.get("responses", {})
        writer.writerow([
            doc.id,
            responses.get("0", ""),
            ",".join(responses.get("1", [])),
            ",".join(responses.get("2", [])),
            ",".join(responses.get("3", [])),
            responses.get("4"),
            ",".join(responses.get("5", [])),
            ",".join(responses.get("6", []))
        ])

print("user_preferences.csv")