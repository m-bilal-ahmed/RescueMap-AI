import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:5000";

type Report = {
  message: string;
  lat: number;
  lon: number;
  timestamp?: string;
  category?: string;
  verified?: boolean;
};

type Filters = { category: string; verify: string; time: string };

type MapViewProps = {
  filters: Filters;
  onLoaded: (r: Report[]) => void;
  onSelect: (r: Report | null) => void;
};

export default function MapView({ filters, onLoaded, onSelect }: MapViewProps) {
  const elRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!elRef.current) return;

    // Fix default icon paths when bundling
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

    // Create map
    const map = L.map(elRef.current).setView([27.9944, -81.7603], 6);

    // Make sure Leaflet knows its size in the grid
    setTimeout(() => {
      try {
        map.invalidateSize(true);
      } catch {}
    }, 0);

    const handleResize = () => {
      // _loaded is true only if Leaflet finished init
      // @ts-ignore
      if (!(map as any)?._loaded) return;
      try {
        map.invalidateSize();
      } catch {}
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // Basemap
    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap"
      }
    ).addTo(map);

    // Load data then draw markers
    loadReports().then(draw).catch(drawFromMock);

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

    function draw(list: Report[]) {
      // We are not filtering by category or verify yet,
      // we will add that later, step by step.
      list.forEach((report) => {
        if (typeof report.lat !== "number" || typeof report.lon !== "number") {
          return;
        }

        const marker = L.marker([report.lat, report.lon]).addTo(map);

        marker.bindPopup(
          `<b>${escapeHtml(report.message || "Report")}</b><br>${
            report.timestamp || ""
          }`
        );

        marker.on("click", () => {
          onSelect(report);
        });
      });

      // update header timestamp
      const updated = document.getElementById("lastUpdated");
      if (updated) {
        updated.textContent =
          "Last updated, " + new Date().toLocaleString();
      }

      // bubble data up to parent so KPIs can update
      setTimeout(() => onLoaded(list), 100);
      //onLoaded(list);
    }

    async function drawFromMock() {
      try {
        const mock = await fetch("/mock_reports.json").then(x => x.json());
        draw(mock as Report[]);
      } catch {
        const updated = document.getElementById("lastUpdated");
        if (updated) {
          updated.textContent = "Failed to load reports";
        }
        onLoaded([]);
      }
    }

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize as any);
      try {
        map.remove();
      } catch {}
    };
    // we intentionally do NOT include filters in deps here
    // if we do, React will remount the map every time filter changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      id="map"
      ref={elRef}
      style={{
        height: "76vh",
        width: "100%",
        borderRadius: 16,
        border: "1px solid #1f2a44",
        overflow: "hidden"
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
