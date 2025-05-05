# 🚨 RescueMap-AI

**RescueMap-AI** is a lightweight AI-powered disaster reporting and visualization platform. It allows people affected by natural disasters to submit reports that are automatically categorized and clustered based on geolocation. Rescue teams can use the map to quickly locate high-priority rescue zones and resource needs.

---

## 🌍 Features

- 📝 Submit location-based emergency reports (with message + lat/lon)
- 🧠 Basic NLP-based categorization (e.g., medical, rescue, supply)
- 📍 Real-time geolocation mapping using Leaflet.js
- 🔗 Clustering of nearby reports (DBSCAN)
- 🔄 Backend API powered by Flask
- ⚡ Simple to run locally — no cloud infrastructure required

---

## 🛠️ Tech Stack

| Frontend     | Backend       | ML/NLP        | Mapping     |
|--------------|---------------|---------------|-------------|
| HTML, JS     | Flask + CORS  | Scikit-learn, NLTK | Leaflet.js |

---

## 🚀 Getting Started

### 📁 Project Structure

### Starting the backend
cd backend
python3 -m venv env
source env/bin/activate        # Use `env\Scripts\activate` on Windows
pip install -r requirements.txt
python3 app.py
