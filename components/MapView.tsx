'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Tag } from 'lucide-react';

// Leaflet icon fix for Next.js
const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface MapViewProps {
  bundles: any[];
  onClaim: (id: string) => void;
}

export default function MapView({ bundles, onClaim }: MapViewProps) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  // Default fallback location (Bareilly / Delhi area) if GPS permission is pending or denied
  const defaultLocation = { lat: 28.367, lng: 79.4304 };

  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setLoadingLocation(false);
        },
        (error) => {
          console.warn('GPS location access denied or unavailable, using fallback location.', error);
          setUserLocation(defaultLocation);
          setLoadingLocation(false);
        }
      );
    } else {
      setUserLocation(defaultLocation);
      setLoadingLocation(false);
    }
  }, []);

  const activeCenter = userLocation || defaultLocation;

  if (loadingLocation) {
    return (
      <div className="w-full h-[450px] rounded-2xl bg-slate-100 flex flex-col items-center justify-center text-slate-500 border border-slate-200">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-2"></div>
        <p className="text-sm font-medium">Loading interactive map location...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[450px] rounded-2xl overflow-hidden border border-slate-200 shadow-sm z-10 relative">
      <MapContainer
        center={[activeCenter.lat, activeCenter.lng]}
        zoom={13}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User live location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={customIcon}>
            <Popup>
              <div className="font-bold text-slate-800 text-xs">📍 You are here</div>
            </Popup>
          </Marker>
        )}

        {/* Surplus food bundle markers */}
        {bundles.map((bundle) => {
          const lat = parseFloat(bundle.latitude);
          const lng = parseFloat(bundle.longitude);

          if (isNaN(lat) || isNaN(lng)) return null;

          return (
            <Marker key={bundle.id} position={[lat, lng]} icon={customIcon}>
              <Popup>
                <div className="p-1 max-w-[200px]">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                    <Tag className="w-3 h-3" /> Qty: {bundle.quantity}
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm mb-1">{bundle.title}</h4>
                  <p className="text-xs text-slate-600 mb-2 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600 flex-shrink-0" />
                    <span className="truncate">{bundle.address || 'Address provided upon reservation'}</span>
                  </p>
                  <button
                    onClick={() => onClaim(bundle.id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-1.5 px-3 rounded-lg transition"
                  >
                    {bundle.price > 0 ? `Reserve (₹${bundle.price})` : 'Claim Free'}
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}