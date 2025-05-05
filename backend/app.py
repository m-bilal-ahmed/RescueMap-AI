from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime
import os
import logging

# Set up logging
logging.basicConfig(level=logging.DEBUG)

# Initialize Flask app with absolute paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FRONTEND_DIR = os.path.join(BASE_DIR, '..', 'frontend')

app = Flask(__name__, static_folder=FRONTEND_DIR, template_folder=FRONTEND_DIR)
CORS(app, resources={r"/submit": {"origins": "*"}, r"/reports": {"origins": "*"}})

# Mock in-memory DB
reports = []

@app.route("/submit", methods=["POST"])
def submit_report():
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
    index_path = os.path.join(FRONTEND_DIR, "index.html")
    if not os.path.exists(index_path):
        app.logger.error(f"index.html not found at {index_path}")
        return jsonify({"error": "index.html not found"}), 404
    app.logger.debug(f"Serving index.html from {index_path}")
    return send_from_directory(FRONTEND_DIR, "index.html")

# Serve static files (e.g., script.js, styles.css)
@app.route("/<path:path>")
def serve_static(path):
    file_path = os.path.join(FRONTEND_DIR, path)
    if not os.path.exists(file_path):
        app.logger.error(f"Static file not found at {file_path}")
        return jsonify({"error": f"File {path} not found"}), 404
    app.logger.debug(f"Serving static file from {file_path}")
    return send_from_directory(FRONTEND_DIR, path)

if __name__ == "__main__":
    # Log frontend directory for debugging
    if not os.path.exists(FRONTEND_DIR):
        app.logger.error(f"Frontend directory not found at {FRONTEND_DIR}")
    else:
        app.logger.debug(f"Frontend directory: {FRONTEND_DIR}")
    app.run(debug=True)