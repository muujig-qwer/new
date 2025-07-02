"use client";
import dynamic from "next/dynamic";
import { useState, useMemo } from "react";

// Leaflet динамик импорт
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);

export default function MapPicker({ onPick, defaultPosition = [47.918873, 106.917701], onClose }) {
  const [tempPosition, setTempPosition] = useState(defaultPosition);

  const customIcon = useMemo(() => {
    if (typeof window === "undefined") return null;
    const L = require("leaflet");
    return new L.Icon({
      iconUrl: "/icons/my-marker.png",
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
      shadowUrl: null,
    });
  }, []);

  const handleMarkerDrag = (e) => {
    const { lat, lng } = e.target.getLatLng();
    setTempPosition([lat, lng]);
  };

  const handleConfirm = async () => {
    // Reverse geocode
    try {
      const [lat, lng] = tempPosition;
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=mn`
      );
      const data = await res.json();
      const address = data.display_name || "Байршил тодорхойлогдсонгүй";
      onPick && onPick({ lat, lng, address });
      onClose && onClose();
    } catch {
      onPick && onPick({ lat: tempPosition[0], lng: tempPosition[1], address: "Байршил тодорхойлох боломжгүй" });
      onClose && onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 relative" style={{ width: 400, height: 340 }}>
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-red-600"
          onClick={onClose}
        >
          ×
        </button>
        <MapContainer
          center={tempPosition}
          zoom={13}
          scrollWheelZoom={false}
          style={{ width: "100%", height: "250px" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker
            position={tempPosition}
            draggable={true}
            icon={customIcon}
            eventHandlers={{
              dragend: handleMarkerDrag,
            }}
          >
            <Popup>Маркерийг чирж байршлаа сонгоно уу</Popup>
          </Marker>
        </MapContainer>
        <button
          className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={handleConfirm}
        >
          Байршлыг батлах
        </button>
      </div>
    </div>
  );
}