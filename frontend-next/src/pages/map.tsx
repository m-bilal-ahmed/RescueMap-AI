import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

type Report = {
  message: string;
  lat: number;
  lon: number;
  category?: string;
  verified?: boolean;
  timestamp?: string;
};

type Filters = { category: string; verify: string; time: string };

type MapViewProps = {
  filters: Filters;
  onLoaded: (r: Report[]) => void;
  onSelect: (r: Report | null) => void;
};

const MapView = dynamic<MapViewProps>(
  () => import("../components/MapView"),
  { ssr: false }
);

export default function MapPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [selected, setSelected] = useState<Report | null>(null);
  const [filters, setFilters] = useState<Filters>({
    category: "",
    verify: "",
    time: "any"
  });

  const kpis = useMemo(() => {
    const total = reports.length;
    const verified = reports.filter(r => r.verified).length;
    return {
      total,
      verifiedRate: total ? Math.round((verified / total) * 100) : 0
    };
  }, [reports]);

  return (
    <div className="container">
      {/* header row */}
      <div className="space-between" style={{ marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>RescueMap-AI, Live Map</h2>
        <small className="small" id="lastUpdated">
          Last updated, just now
        </small>
      </div>

      {/* KPI cards row */}
      <div
        className="section"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3,1fr)",
          gap: 14,
          marginTop: 0
        }}
      >
        <div className="card kpi">
          <span className="label">Total reports</span>
          <span className="value">{kpis.total}</span>
        </div>
        <div className="card kpi">
          <span className="label">Verified rate</span>
          <span className="value">{kpis.verifiedRate}%</span>
        </div>
        <div className="card kpi">
          <span className="label">Duplicates filtered</span>
          <span className="value">31%</span>
        </div>
      </div>

      {/* MAP AREA */}
      <div className="map-wrap">
        {/* Map, full-bleed background in this container */}
        <MapView
          filters={filters}
          onLoaded={setReports}
          onSelect={setSelected}
        />

        {/* Left floating panel, filters and simulate */}
        <aside className="sidebar-float">
          <div className="field">
            <label>Category</label>
            <select
              value={filters.category}
              onChange={e =>
                setFilters(p => ({ ...p, category: e.target.value }))
              }
            >
              <option value="">All</option>
              <option value="medical">Medical</option>
              <option value="flooding">Flooding</option>
              <option value="power">Power</option>
              <option value="supply">Supply</option>
            </select>
          </div>

          <div className="field">
            <label>Verification</label>
            <select
              value={filters.verify}
              onChange={e =>
                setFilters(p => ({ ...p, verify: e.target.value }))
              }
            >
              <option value="">All</option>
              <option value="true">Verified only</option>
              <option value="false">Unverified only</option>
            </select>
          </div>

          <div className="field">
            <label>Time window</label>
            <select
              value={filters.time}
              onChange={e =>
                setFilters(p => ({ ...p, time: e.target.value }))
              }
            >
              <option value="any">Any</option>
              <option value="6h">Last 6 hours</option>
              <option value="24h">Last 24 hours</option>
              <option value="72h">Last 72 hours</option>
            </select>
          </div>

          <hr />

          <button
            className="btn"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("RM_SIMULATE", { detail: 12 })
              )
            }
          >
            Simulate 12 reports
          </button>
        </aside>

        {/* Right floating panel, report summary */}
        <aside className="drawer-float">
          <div className="space-between" style={{ marginBottom: 8 }}>
            <div style={{ fontWeight: 700 }}>Report summary</div>
            <button className="btn ghost" onClick={() => setSelected(null)}>
              Close
            </button>
          </div>

          {!selected && (
            <div className="small">Select a marker to view details</div>
          )}

          {selected && (
            <div style={{ display: "grid", gap: 8 }}>
              <div style={{ fontWeight: 700 }}>{selected.message}</div>

              <div className="row small">
                <span className={`badge ${badgeColor(selected.category)}`}>
                  {selected.category || "other"}
                </span>
                <span className="badge">
                  {selected.verified ? "verified" : "unverified"}
                </span>
              </div>

              <div className="small">
                Lat {selected.lat.toFixed(4)}, Lon {selected.lon.toFixed(4)}
              </div>

              <div className="small">
                {selected.timestamp
                  ? new Date(selected.timestamp).toLocaleString()
                  : ""}
              </div>
            </div>
          )}

          <hr />

          <div className="small">
            AI validation improving data clarity and response prioritization
          </div>
        </aside>
      </div>
    </div>
  );
}

function badgeColor(cat?: string) {
  if (cat === "medical") return "green";
  if (cat === "flooding") return "blue";
  if (cat === "power") return "orange";
  return "gray";
}
