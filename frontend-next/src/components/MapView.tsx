import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// clustering plugin
import "leaflet.markercluster";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import "leaflet.markercluster/dist/MarkerCluster.css";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:5000";

type Report = {
  message: string;
  lat: number;
  lon: number;
  timestamp?: string;   // ISO string like 2025-10-18T14:10:00Z
  category?: string;    // "medical", "flooding", etc
  verified?: boolean;   // true or false
};

type Filters = { category: string; verify: string; time: string };

type MapViewProps = {
  filters: Filters;
  onLoaded: (r: Report[]) => void;
  onSelect: (r: Report | null) => void;
};

export default function MapView({ filters, onLoaded, onSelect }: MapViewProps) {
  // the div the map draws into
  const elRef = useRef<HTMLDivElement | null>(null);

  // keep Leaflet objects and data around in refs, so we can reuse them
  const mapRef = useRef<L.Map | null>(null);
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null as any);
  const allReportsRef = useRef<Report[]>([]);

  // 1. one time init, create map, fetch data, draw markers first time
  useEffect(() => {
    if (!elRef.current) return;
    if (mapRef.current) return; // safety, do not double init

    // Fix default Leaflet icon paths
    // @ts-ignore
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png"
    });

    // Make map
    const map = L.map(elRef.current).setView([27.9944, -81.7603], 6);
    mapRef.current = map;

    // force proper size after absolute positioning
    setTimeout(() => {
      try {
        map.invalidateSize(true);
      } catch {}
    }, 0);

    const handleResize = () => {
      // @ts-ignore
      if (!(map as any)?._loaded) return;
      try {
        map.invalidateSize();
      } catch {}
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // Basemap
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap"
    }).addTo(map);

    // Cluster layer
    const clusterLayer = (L as any).markerClusterGroup({});
    clusterRef.current = clusterLayer;
    map.addLayer(clusterLayer);

    // Fetch initial data
    loadReports()
      .then(reports => {
        allReportsRef.current = reports;
        // draw markers according to current filters
        applyFiltersAndRender();
      })
      .catch(async () => {
        // backend failed, fall back to mock
        try {
          const mock: Report[] = await fetch("/mock_reports.json").then(x =>
            x.json()
          );
          allReportsRef.current = mock;
          applyFiltersAndRender();
        } catch {
          // even mock failed
          const updated = document.getElementById("lastUpdated");
          if (updated) {
            updated.textContent = "Failed to load reports";
          }
          onLoaded([]);
        }
      });

    // cleanup on unmount
    return () => {
      window.removeEventListener("resize", handleResize as any);
      try {
        map.remove();
      } catch {}
      mapRef.current = null;
      clusterRef.current = null;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. whenever filters change, re-render markers from cached data
  useEffect(() => {
    // only run if map and cluster are ready and we actually have data
    if (!mapRef.current || !clusterRef.current) return;
    if (!allReportsRef.current.length) return;

    applyFiltersAndRender();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // helper to fetch from backend
  async function loadReports(): Promise<Report[]> {
    const r = await fetch(`${API_BASE}/reports`);
    if (!r.ok) throw new Error("backend error");
    const data: Report[] = await r.json();
    if (!Array.isArray(data) || data.length === 0) {
      const mock = await fetch("/mock_reports.json").then(x => x.json());
      return mock as Report[];
    }
    return data;
  }

  // filter logic
  function filterReports(list: Report[], f: Filters): Report[] {
    let out = list.slice();

    // 1. category filter
    if (f.category) {
      out = out.filter(r => r.category === f.category);
    }

    // 2. verify filter
    // f.verify is "" or "true" or "false"
    if (f.verify === "true") {
      out = out.filter(r => r.verified === true);
    } else if (f.verify === "false") {
      out = out.filter(r => r.verified === false);
    }

    // 3. time window filter
    // f.time can be "any", "6h", "24h", "72h"
    if (f.time !== "any") {
      const hours = f.time === "6h" ? 6
                  : f.time === "24h" ? 24
                  : f.time === "72h" ? 72
                  : null;

      if (hours !== null) {
        const nowMs = Date.now();
        const cutoffMs = nowMs - hours * 60 * 60 * 1000;

        out = out.filter(r => {
          if (!r.timestamp) return false;
          const t = Date.parse(r.timestamp);
          if (Number.isNaN(t)) return false;
          return t >= cutoffMs;
        });
      }
    }

    return out;
  }

  // render logic, uses clusterRef, updates KPIs via onLoaded
  function applyFiltersAndRender() {
    const map = mapRef.current;
    const clusterLayer = clusterRef.current;
    if (!map || !clusterLayer) return;

    const full = allReportsRef.current;
    const filtered = filterReports(full, filters);

    // clear previous markers
    clusterLayer.clearLayers();

    // add each filtered report as a marker
    filtered.forEach(report => {
      if (typeof report.lat !== "number" || typeof report.lon !== "number") {
        return;
      }

      const marker = L.marker([report.lat, report.lon]);

      marker.bindPopup(
        `<b>${escapeHtml(report.message || "Report")}</b><br>${
          report.timestamp || ""
        }`
      );

      marker.on("click", () => {
        onSelect(report);
      });

      clusterLayer.addLayer(marker);
    });

    // update timestamp label in header
    const updated = document.getElementById("lastUpdated");
    if (updated) {
      updated.textContent =
        "Last updated, " + new Date().toLocaleString();
    }

    // update KPIs in parent using filtered list, not full list
    setTimeout(() => onLoaded(filtered), 0);
  }

  return (
    <div
      id="map"
      ref={elRef}
      style={{
        position: "absolute",
        inset: 0
      }}
    />
  );
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, m =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    } as any)[m]
  );
}
