import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const municipalities = [
  // Koshi Province
  {
    name: "Biratnagar",
    province: "Koshi",
    lat: 26.4525,
    lng: 87.2718,
    score: 68,
  },
  { name: "Dharan", province: "Koshi", lat: 26.8124, lng: 87.2832, score: 71 },
  { name: "Itahari", province: "Koshi", lat: 26.6637, lng: 87.2747, score: 65 },

  // Madhesh Province
  {
    name: "Janakpurdham",
    province: "Madhesh",
    lat: 26.7288,
    lng: 85.9263,
    score: 59,
  },
  {
    name: "Birgunj",
    province: "Madhesh",
    lat: 27.0104,
    lng: 84.8778,
    score: 63,
  },
  {
    name: "Kalaiya",
    province: "Madhesh",
    lat: 27.0537,
    lng: 84.9007,
    score: 51,
  },

  // Bagmati Province
  {
    name: "Kathmandu",
    province: "Bagmati",
    lat: 27.7172,
    lng: 85.324,
    score: 82,
  },
  {
    name: "Lalitpur",
    province: "Bagmati",
    lat: 27.6588,
    lng: 85.3247,
    score: 79,
  },
  {
    name: "Bharatpur",
    province: "Bagmati",
    lat: 27.6833,
    lng: 84.4333,
    score: 74,
  },

  // Gandaki Province
  {
    name: "Pokhara",
    province: "Gandaki",
    lat: 28.2096,
    lng: 83.9856,
    score: 77,
  },
  { name: "Gorkha", province: "Gandaki", lat: 28.0, lng: 84.6333, score: 57 },
  {
    name: "Besisahar",
    province: "Gandaki",
    lat: 28.2333,
    lng: 84.3833,
    score: 54,
  },

  // Lumbini Province
  {
    name: "Butwal",
    province: "Lumbini",
    lat: 27.7006,
    lng: 83.4484,
    score: 72,
  },
  {
    name: "Nepalgunj",
    province: "Lumbini",
    lat: 28.05,
    lng: 81.6167,
    score: 64,
  },
  { name: "Tansen", province: "Lumbini", lat: 27.8667, lng: 83.55, score: 58 },

  // Karnali Province
  {
    name: "Birendranagar",
    province: "Karnali",
    lat: 28.6,
    lng: 81.6333,
    score: 53,
  },
  {
    name: "Chandannath",
    province: "Karnali",
    lat: 29.275,
    lng: 82.1833,
    score: 42,
  },
  { name: "Musikot", province: "Karnali", lat: 28.6333, lng: 82.15, score: 45 },

  // Sudurpashchim Province
  {
    name: "Dhangadhi",
    province: "Sudurpashchim",
    lat: 28.6833,
    lng: 80.6,
    score: 61,
  },
  {
    name: "Bhimdatta",
    province: "Sudurpashchim",
    lat: 28.9167,
    lng: 80.3333,
    score: 56,
  },
  {
    name: "Tikapur",
    province: "Sudurpashchim",
    lat: 28.5333,
    lng: 81.1167,
    score: 49,
  },
];

function getScoreColor(score) {
  if (score >= 75) return "#16a34a";
  if (score >= 60) return "#2563eb";
  if (score >= 45) return "#f59e0b";
  return "#dc2626";
}

function NepalMap() {
  return (
    <MapContainer
      center={[28.3949, 84.124]}
      zoom={7}
      scrollWheelZoom={true}
      className="h-full w-full"
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {municipalities.map((municipality) => (
        <CircleMarker
          key={municipality.name}
          center={[municipality.lat, municipality.lng]}
          radius={9}
          pathOptions={{
            color: getScoreColor(municipality.score),
            fillColor: getScoreColor(municipality.score),
            fillOpacity: 0.8,
            weight: 2,
          }}
        >
          <Popup>
            <div className="min-w-[180px]">
              <h3 className="font-bold text-slate-900">{municipality.name}</h3>

              <p className="text-sm text-slate-500">
                {municipality.province} Province
              </p>

              <div className="mt-2">
                <span className="text-xs text-slate-500">DESRI Score</span>

                <p className="text-2xl font-bold">{municipality.score}</p>
              </div>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}

export default NepalMap;
