from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime
import os

app = Flask(__name__, static_folder="../frontend", template_folder="../frontend")
CORS(app, resources={r"/submit": {"origins": "*"}, r"/reports": {"origins": "*"}})

# Mock in-memory DB
reports = []

@app.route("/submit", methods=["POST"])
def submit_report():
    if request.method == "OPTIONS":
        return '', 200  # Respond to OPTIONS (preflight request)
    data = request.json
    data["timestamp"] = datetime.utcnow().isoformat()
    reports.append(data)
    return jsonify({"message": "Report received"}), 200

@app.route("/reports", methods=["GET"])
def get_reports():
    return jsonify(reports)

# Serve frontend
@app.route("/")
def serve_frontend():
    return send_from_directory(app.template_folder, "index.html")

# Serve static files (e.g., script.js)
@app.route("/<path:path>")
def serve_static(path):
    return send_from_directory(app.static_folder, path)

if __name__ == "__main__":
    app.run(debug=True)