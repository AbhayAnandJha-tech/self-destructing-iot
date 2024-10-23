from flask import Flask, jsonify
import hashlib
import os
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize the Flask application
app = Flask(__name__)

# Initialize Firebase Admin SDK
cred = credentials.Certificate('./self-destructing-iot-firebase-adminsdk.json')  # Update with your service account key path
firebase_admin.initialize_app(cred)
db = firestore.client()

@app.route('/track_hash/<filename>', methods=['GET'])
def track_file_hash(filename):
    # Define the path to the local file
    file_path = os.path.join('./safe_files', filename)  # Update with your directory path

    # Check if the file exists
    if not os.path.isfile(file_path):
        return jsonify({'error': 'File not found'}), 404

    # Calculate MD5 hash
    with open(file_path, 'rb') as file:
        file_hash = hashlib.md5(file.read()).hexdigest()

    # Store the MD5 hash in Firestore
    doc_ref = db.collection('file_hashes').document()
    doc_ref.set({
        'filename': filename,
        'md5_hash': file_hash
    })

    return jsonify({'filename': filename, 'md5_hash': file_hash}), 200

@app.route('/hashes', methods=['GET'])
def get_hashes():
    # Retrieve all hashes from Firestore
    hashes_ref = db.collection('file_hashes')
    docs = hashes_ref.stream()
    
    hashes = []
    for doc in docs:
        hashes.append(doc.to_dict())
    
    return jsonify(hashes), 200

if __name__ == '__main__':
    app.run(debug=True)
