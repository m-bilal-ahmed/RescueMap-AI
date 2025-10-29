from sklearn.cluster import DBSCAN
import numpy as np

def get_clusters(reports):
    coords = np.array([[r["lat"], r["lon"]] for r in reports])
    if len(coords) < 2:
        return reports
    clustering = DBSCAN(eps=0.1, min_samples=2).fit(coords)
    for i, r in enumerate(reports):
        r["cluster"] = int(clustering.labels_[i])
    return reports
