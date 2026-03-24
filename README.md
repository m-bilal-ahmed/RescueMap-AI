# 🚨 RescueMap-AI

**An open-source platform for real-time geospatial data validation and disaster response coordination.**

RescueMap-AI enables emergency responders and local teams to collect, validate, and act on location-based reports during active natural disaster operations — without requiring cloud infrastructure, expensive software, or technical expertise.

> Presented at **FOSS4G North America 2025** · Published in **ISJEM (DOI: 10.55041/ISJEM04944)**

---

## The Problem

When a hurricane, flood, or wildfire strikes, emergency responders are flooded with incoming location reports from the public, field teams, and official feeds simultaneously. The challenge is not a lack of data — it is the inability to quickly determine **which reports are accurate, which are duplicates, and which areas need immediate prioritization.**

The 2024 Hurricane Helene after-action review documented this directly: responders faced critical challenges with *data handling, information intake, and visualizing operational updates in a timely fashion* — directly impairing situational awareness and decision-making.

RescueMap-AI is designed to address this gap.

---

## What RescueMap-AI Does

RescueMap-AI ingests location-based reports from multiple sources, validates them using lightweight machine learning, clusters nearby reports to remove duplicates, and visualizes the result as a live, color-coded map — so responders can see verified high-priority zones at a glance.

<!-- 
📸 IMAGE PLACEHOLDER 1
Screenshot of the live map interface showing clustered, color-coded report markers.
Verified reports in one color, unverified in another.
Caption: "Live map view — verified vs. unverified incident clusters during a simulated flood event"
-->

---

## Key Features

### 🗺️ Real-Time Geospatial Map
Live map visualization using Leaflet.js. Reports are plotted by location and color-coded by verification status — verified incidents are immediately actionable, unverified ones are flagged for review.

### 🧠 AI-Powered Validation and Clustering
The validation layer uses logistic regression and random forest classifiers — lightweight, explainable, and runnable on modest hardware with no internet connection. Reports are scored for reliability based on source credibility, geographic clustering, text similarity, and recency.

- **Cluster detection:** Merges near-duplicate reports when multiple sources report the same issue within a small geographic area and timeframe
- **Source credibility scoring:** Official feeds (FEMA, USGS) carry higher confidence weights than unverified public submissions
- **Reliability ranking:** Reports are ranked by `severity × confidence × recency` — a transparent, auditable formula

### ✅ Verified vs. Unverified Reporting
Every report is tagged with a verification status. The dashboard displays a live **Verified Rate KPI** so responders know in real time what percentage of their operational picture is based on confirmed information.

<!-- 
📸 IMAGE PLACEHOLDER 2
Screenshot of the dashboard sidebar or KPI panel showing:
- Total Reports count
- Verified Rate percentage
- Duplicates Filtered count
Caption: "Dashboard KPIs — real-time data quality indicators for incident commanders"
-->

### 📡 Offline-First Architecture
RescueMap-AI is designed to run in connectivity-scarce environments. The system operates on a single laptop or Raspberry Pi, with no dependency on cloud APIs or external services. It can sync data when connectivity is restored.

This design directly addresses one of the most documented failure modes in disaster response: cloud-based tools go down exactly when they are most needed.

### 🔀 Multi-Source Data Ingestion
RescueMap-AI blends crowdsourced inputs with official data streams:

| Source Type | Examples | Default Weight |
|---|---|---|
| Official feeds | FEMA, USGS, local EMAs | High confidence |
| Registered partners | NGOs, trained volunteers | Medium confidence |
| Public submissions | Web forms, SMS, field reports | Provisional — pending validation |

---

## Architecture

<!-- 
📸 IMAGE PLACEHOLDER 3
Architecture diagram showing the full data flow:
[User Report / Official Feed] → [Flask API] → [ML Validation Layer] → [DBSCAN Clustering] → [PostgreSQL] → [Next.js + Leaflet Map]
This should be a clean horizontal flow diagram.
Tools to create it: draw.io, Excalidraw, or Lucidchart — export as PNG and add here.
Caption: "System architecture — from report ingestion to map visualization"
-->

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js + Leaflet.js |
| Backend | Flask + CORS |
| ML / Validation | Scikit-learn, NLTK (logistic regression, random forest, DBSCAN) |
| Database | SQLite → PostgreSQL |
| Mapping | Leaflet.js |
| Hosting | Vercel (frontend) · Render (backend) · Local fallback supported |

---

## Research

This project is the basis of a peer-reviewed publication:

> **Ahmed, M. B.** (2025). *Disaster Response Systems and Data Integrity: Optimizing Crowdsourced Inputs with Simple Machine Learning.* International Scientific Journal of Engineering and Management.
> DOI: [10.55041/ISJEM04944](https://www.doi.org/10.55041/ISJEM04944)

**Abstract:** A lightweight pipeline employing logistic regression and random forest classifiers, integrated with rule-based validation, to optimize the integrity of crowdsourced disaster inputs with minimal computation. Evaluated on the CrisisNLP tweet corpus and a synthetic sensor dataset. Results demonstrate a **22% increase in precision** and a **0.18 improvement in F1 score** over a heuristic baseline, while maintaining recall above 0.90. Offline-first design enables deployment on modest hardware in connectivity-scarce environments.

---

## Conference Presentation

RescueMap-AI was presented as a workshop at **FOSS4G North America 2025**, the premier open-source geospatial conference in North America. The presentation covered the system architecture, validation methodology, data ethics in humanitarian datasets, and the open-source rationale for disaster response tooling.

<!-- 
📸 IMAGE PLACEHOLDER 4
Photo from the FOSS4G NA 2025 workshop session — presenter at podium or workshop room.
OR: Screenshot of the FOSS4G NA 2025 program listing showing your workshop title and name.
Caption: "Workshop presentation at FOSS4G North America 2025"
-->

---

## Roadmap

RescueMap-AI is an active research and development project. Planned work over the next 12–24 months:

- **Offline mesh networking** — Bluetooth and Wi-Fi Direct communication between devices when cellular infrastructure is unavailable
- **LoRa hardware extension** — low-power sensor nodes and a base station for offline data logging in infrastructure-degraded environments
- **Expanded ML validation layer** — improved classification for edge cases, multi-language support for diverse disaster-affected communities
- **County pilot program** — working with Florida county emergency management offices to validate the system against real operational workflows
- **EOC integration** — API compatibility with Emergency Operations Center platforms including SARCOP and WebEOC
- **SMS reporting interface** — enabling citizen submissions via text message with no smartphone or internet required

---

## Why Open Source

Closed-source tools create single points of failure. When a vendor goes down or pulls access, responders lose their tools at the worst possible moment.

RescueMap-AI is fully open because:
- **Transparency builds trust** — responders and agencies can audit exactly how reliability scores are calculated
- **Adaptability enables local ownership** — local governments and NGOs can fork, modify, and host their own instance
- **Resilience requires no vendor lock-in** — if one deployment fails, the community can stand up another

---

## Getting Started

### Prerequisites
- Python 3.9+
- Node.js 18+

### Project Structure

```
RescueMap-AI/
├── backend/          # Flask API + ML validation layer
├── frontend/         # Original HTML/JS frontend
├── frontend-next/    # Next.js + Leaflet frontend (current)
└── README.md
```

### Run the Backend

```bash
cd backend
python3 -m venv env
source env/bin/activate      
# Windows: env\Scripts\activate
pip install -r requirements.txt
python3 app.py
```

### Run the Frontend

```bash
cd frontend-next
npm install
npm run dev
```

The app will be available at `http://localhost:3000`

---

## Contributing

Contributions are welcome from developers, GIS professionals, emergency management practitioners, and researchers.

If you work in emergency management and are interested in piloting or evaluating RescueMap-AI in your operations, please open an issue or reach out directly.

---

## Citation

If you use RescueMap-AI in your research or reference this work, please cite:

```
Ahmed, M. B. (2025). Disaster Response Systems and Data Integrity: 
Optimizing Crowdsourced Inputs with Simple Machine Learning. 
International Scientific Journal of Engineering and Management. 
DOI: 10.55041/ISJEM04944
```

---

## License

MIT License — free to use, modify, and distribute with attribution.

---

## Contact

**Bilal Ahmed**
Independent Researcher · Software Engineer
🌐 [GitHub](https://github.com/m-bilal-ahmed)

> *"Technology should amplify courage, not replace it."*