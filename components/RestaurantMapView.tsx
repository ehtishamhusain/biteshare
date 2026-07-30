'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Locate, RefreshCw } from 'lucide-react';

interface Restaurant {
  id: string;
  organization_name?: string;
  full_name?: string;
  street_address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  postal_code?: string;
  latitude?: number | null;
  longitude?: number | null;
  active_bundles_count?: number;
  avg_rating?: number;
  review_count?: number;
  isSharedBuilding?: boolean;
}

interface RestaurantMapViewProps {
  restaurants: Restaurant[];
  userLat?: number;
  userLng?: number;
}

// In-memory geocoding cache to avoid duplicate API requests
const geocodeCache = new Map<string, { lat: number; lng: number }>();

/**
 * 🌀 Helper: Detects identical GPS coordinates and fans them out radially
 * so multiple restaurants in the same building/complex are all individually visible.
 */
function disperseOverlappingCoordinates(
  items: (Restaurant & { resolvedLat?: number; resolvedLng?: number })[]
) {
  const coordGroups: { [key: string]: number[] } = {};

  // Group indices by coordinate key (5 decimal places ~ 1 meter precision)
  items.forEach((item, index) => {
    if (item.resolvedLat && item.resolvedLng) {
      const key = `${item.resolvedLat.toFixed(5)},${item.resolvedLng.toFixed(5)}`;
      if (!coordGroups[key]) coordGroups[key] = [];
      coordGroups[key].push(index);
    }
  });

  const updatedItems = [...items];

  // Apply radial shift for duplicate locations
  Object.values(coordGroups).forEach((indices) => {
    if (indices.length > 1) {
      const radius = 0.00018; // ~15 meters shift radius
      indices.forEach((itemIdx, i) => {
        const angle = (2 * Math.PI * i) / indices.length;
        const latOffset = radius * Math.cos(angle);
        const lngOffset = radius * Math.sin(angle);

        updatedItems[itemIdx] = {
          ...updatedItems[itemIdx],
          resolvedLat: (updatedItems[itemIdx].resolvedLat || 0) + latOffset,
          resolvedLng: (updatedItems[itemIdx].resolvedLng || 0) + lngOffset,
          isSharedBuilding: true, // Flag for popup badge
        };
      });
    }
  });

  return updatedItems;
}

export default function RestaurantMapView({
  restaurants,
  userLat: propUserLat = 28.367, // Default Bareilly Lat
  userLng: propUserLng = 79.4304, // Default Bareilly Lng
}: RestaurantMapViewProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [userCoords, setUserCoords] = useState({
    lat: propUserLat,
    lng: propUserLng,
    isGpsVerified: false,
  });

  const [resolvedRestaurants, setResolvedRestaurants] = useState<
    (Restaurant & { resolvedLat?: number; resolvedLng?: number })[]
  >([]);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');

  const googleTileUrls = {
    roadmap: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
    satellite: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
    terrain: 'https://mt1.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',
  };

  // 1. 📍 Get User Browser GPS
  const requestUserGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserCoords({ lat, lng, isGpsVerified: true });
          if (mapRef.current) {
            mapRef.current.flyTo([lat, lng], 14, { duration: 1.2 });
          }
        },
        (error) => {
          console.warn('GPS location request declined or unavailable:', error.message);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  useEffect(() => {
    requestUserGPS();
  }, []);

  // 2. 🌍 Resolve Restaurant Lat/Lng & Apply Coordinate Dispersal
  useEffect(() => {
    let isMounted = true;

    const resolveCoordinates = async () => {
      setIsGeocoding(true);

      const items = await Promise.all(
        restaurants.map(async (restaurant) => {
          // Case A: Lat and Lng exist in DB
          if (
            restaurant.latitude &&
            restaurant.longitude &&
            !isNaN(Number(restaurant.latitude)) &&
            !isNaN(Number(restaurant.longitude)) &&
            Number(restaurant.latitude) !== 0
          ) {
            return {
              ...restaurant,
              resolvedLat: Number(restaurant.latitude),
              resolvedLng: Number(restaurant.longitude),
            };
          }

          // Case B: Geocode text address via OpenStreetMap Nominatim
          const fullAddress = [
            restaurant.street_address,
            restaurant.city,
            restaurant.state,
            restaurant.pincode || restaurant.postal_code,
            'India',
          ]
            .filter(Boolean)
            .join(', ');

          const query = fullAddress.trim() || restaurant.city || 'Bareilly, Uttar Pradesh, India';

          if (geocodeCache.has(query)) {
            const cached = geocodeCache.get(query)!;
            return {
              ...restaurant,
              resolvedLat: cached.lat,
              resolvedLng: cached.lng,
            };
          }

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
            );
            const data = await res.json();

            if (data && data.length > 0) {
              const lat = parseFloat(data[0].lat);
              const lng = parseFloat(data[0].lon);
              geocodeCache.set(query, { lat, lng });

              return {
                ...restaurant,
                resolvedLat: lat,
                resolvedLng: lng,
              };
            }
          } catch (err) {
            console.error('Failed to geocode restaurant address:', query, err);
          }

          // Fallback to User Center
          return {
            ...restaurant,
            resolvedLat: userCoords.lat,
            resolvedLng: userCoords.lng,
          };
        })
      );

      if (isMounted) {
        // Disperse overlapping restaurant pins so all are clickable
        const dispersed = disperseOverlappingCoordinates(items);
        setResolvedRestaurants(dispersed);
        setIsGeocoding(false);
      }
    };

    resolveCoordinates();

    return () => {
      isMounted = false;
    };
  }, [restaurants, userCoords.lat, userCoords.lng]);

  // 3. 🗺️ Render Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userCoords.lat, userCoords.lng],
        zoom: 13,
        zoomControl: false,
      });

      const layer = L.tileLayer(googleTileUrls.roadmap, {
        attribution: '&copy; Google Maps',
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);

      tileLayerRef.current = layer;
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      mapRef.current = map;
    }

    const map = mapRef.current;

    // Clear existing markers
    map.eachLayer((l) => {
      if (l instanceof L.Marker) {
        map.removeLayer(l);
      }
    });

    // User Location Dot Marker
    const userMarkerIcon = L.divIcon({
      className: 'custom-user-marker',
      html: `
        <div class="relative flex items-center justify-center w-8 h-8">
          <div class="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping"></div>
          <div class="w-4.5 h-4.5 bg-blue-600 border-2 border-white rounded-full shadow-lg"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    L.marker([userCoords.lat, userCoords.lng], { icon: userMarkerIcon })
      .addTo(map)
      .bindPopup(
        `<b style="font-size:12px; font-family:sans-serif;">📍 Your Location ${
          userCoords.isGpsVerified ? '(GPS Verified)' : ''
        }</b>`
      );

    const bounds = L.latLngBounds([[userCoords.lat, userCoords.lng]]);

    // Plot Dispersed Restaurant Pins
    resolvedRestaurants.forEach((rest) => {
      if (!rest.resolvedLat || !rest.resolvedLng) return;

      bounds.extend([rest.resolvedLat, rest.resolvedLng]);

      const storeName = rest.organization_name || rest.full_name || 'Partner Store';
      const ownerName = rest.full_name || 'Verified Owner';
      const hasActiveFood = (rest.active_bundles_count || 0) > 0;
      const fullAddress = [rest.street_address, rest.city, rest.state, rest.pincode || rest.postal_code]
        .filter(Boolean)
        .join(', ');

      // Custom Tag Pin Badge
      const restaurantTagIcon = L.divIcon({
        className: 'custom-restaurant-pin',
        html: `
          <div class="relative group cursor-pointer flex flex-col items-center">
            <div class="bg-slate-900 text-white font-black text-xs px-3 py-1.5 rounded-2xl shadow-xl border ${
              hasActiveFood ? 'border-emerald-400' : 'border-slate-600'
            } flex items-center gap-2 whitespace-nowrap hover:scale-105 transition-transform">
              <span class="w-2.5 h-2.5 rounded-full ${
                hasActiveFood ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'
              }"></span>
              <span>🏬 ${storeName}</span>
            </div>
            <div class="w-2 h-2 bg-slate-900 rotate-45 -mt-1 border-r border-b ${
              hasActiveFood ? 'border-emerald-400' : 'border-slate-600'
            }"></div>
          </div>
        `,
        iconSize: [160, 42],
        iconAnchor: [80, 42],
      });

      // Interactive Popup Card
      const popupContent = `
        <div style="font-family: system-ui, -apple-system, sans-serif; min-width: 220px; padding: 4px;">
          ${
            rest.isSharedBuilding
              ? `<div style="font-size: 10px; font-weight: 800; color: #d97706; background-color: #fef3c7; padding: 2px 6px; border-radius: 6px; display: inline-block; margin-bottom: 4px;">🏢 Multi-Store Building</div>`
              : ''
          }
          <div style="font-size: 15px; font-weight: 900; color: #0f172a; line-height: 1.2; margin-bottom: 4px;">
            🏬 ${storeName}
          </div>
          <div style="font-size: 11px; color: #059669; font-weight: 800; margin-bottom: 6px;">
            👤 Owner: ${ownerName}
          </div>
          <div style="font-size: 11px; color: #475569; margin-bottom: 8px; line-height: 1.3;">
            📍 ${fullAddress || 'Address on store profile'}
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 6px;">
            <span style="font-size: 10px; font-weight: 900; padding: 2px 8px; border-radius: 9999px; ${
              hasActiveFood
                ? 'background-color: #d1fae5; color: #065f46;'
                : 'background-color: #f1f5f9; color: #64748b;'
            }">
              ${hasActiveFood ? `${rest.active_bundles_count} Active Box(es)` : 'No Surplus Food'}
            </span>
            <a href="/restaurants/${rest.id}" style="font-size: 11px; font-weight: 800; color: #2563eb; text-decoration: none;">
              View Store &rarr;
            </a>
          </div>
        </div>
      `;

      L.marker([rest.resolvedLat, rest.resolvedLng], { icon: restaurantTagIcon })
        .addTo(map)
        .bindPopup(popupContent);
    });

    if (resolvedRestaurants.length > 0) {
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 15 });
    }
  }, [resolvedRestaurants, userCoords]);

  const handleMapTypeChange = (type: 'roadmap' | 'satellite' | 'terrain') => {
    setMapType(type);
    if (tileLayerRef.current) {
      tileLayerRef.current.setUrl(googleTileUrls[type]);
    }
  };

  return (
    <div className="relative w-full h-[500px] sm:h-[580px] rounded-3xl overflow-hidden border border-slate-300 shadow-xl font-sans">
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Geocoding Loading State */}
      {isGeocoding && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-slate-700 flex items-center gap-2">
          <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
          <span>Pinpointing Store Addresses...</span>
        </div>
      )}

      {/* Top-Left Map Type Switcher */}
      <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-md border border-slate-200/90 flex items-center gap-1">
        <button
          onClick={() => handleMapTypeChange('roadmap')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            mapType === 'roadmap' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Map
        </button>
        <button
          onClick={() => handleMapTypeChange('satellite')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            mapType === 'satellite' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Satellite
        </button>
        <button
          onClick={() => handleMapTypeChange('terrain')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
            mapType === 'terrain' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Terrain
        </button>
      </div>

      {/* Locate Me GPS Button */}
      <button
        onClick={requestUserGPS}
        className="absolute top-4 right-4 z-20 bg-white hover:bg-slate-50 text-slate-800 p-3 rounded-2xl shadow-md border border-slate-200 transition-transform active:scale-95 flex items-center gap-2 text-xs font-bold"
      >
        <Locate className="w-4 h-4 text-blue-600" />
        <span className="hidden sm:inline">Locate Me</span>
      </button>

      {/* Bottom Map Legend */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-slate-200/90 flex items-center gap-3.5 text-xs font-bold text-slate-700">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-white"></span>
          <span>You</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span>Active Food</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
          <span>No Food</span>
        </div>
      </div>
    </div>
  );
}