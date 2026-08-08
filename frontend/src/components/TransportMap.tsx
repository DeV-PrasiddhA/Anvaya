import { useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchMapLocations, updateCurrentUserLocation, type MapLocation, type MapRole } from '../api';

const NEPAL_CENTER: L.LatLngExpression = [28.3949, 84.124];
const NEPAL_BOUNDS = L.latLngBounds([26.347, 80.058], [30.447, 88.201]);

const roleConfig: Record<MapRole, { icon: string; color: string; label: string }> = {
  Farmer: { icon: 'agriculture', color: '#15803d', label: 'Farmers' },
  Retailer: { icon: 'storefront', color: '#2563eb', label: 'Retailers' },
  Cooperative: { icon: 'groups', color: '#7c3aed', label: 'Cooperatives' },
  'Transport Provider': { icon: 'local_shipping', color: '#b45309', label: 'Transport providers' },
};

function escapeHtml(value: string) {
  return value.replace(/[&<>'"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;',
  })[character] || character);
}

function createRoleIcon(location: MapLocation) {
  const config = roleConfig[location.role];
  return L.divIcon({
    className: 'transport-map-marker',
    html: `<span class="material-symbols-outlined" style="background:${config.color}">${config.icon}</span>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
  });
}

function popupHtml(location: MapLocation) {
  const config = roleConfig[location.role];
  const place = [location.localLocation, location.district, location.province].filter(Boolean).join(' · ');
  const liveStatus = location.role === 'Transport Provider'
    ? location.isLive ? '<p class="map-popup-live">● GPS updated within 10 minutes</p>' : '<p class="map-popup-muted">Base location · GPS not currently active</p>'
    : '<p class="map-popup-muted">Account location</p>';

  return `<div class="map-popup">
    <p class="map-popup-role" style="color:${config.color}"><span class="material-symbols-outlined">${config.icon}</span>${escapeHtml(location.role)}</p>
    <h4>${escapeHtml(location.name)}</h4>
    <p>${escapeHtml(place || 'Nepal')}</p>
    ${liveStatus}
  </div>`;
}

interface TransportMapProps {
  currentUserHasLocation?: boolean;
}

export default function TransportMap({ currentUserHasLocation = true }: TransportMapProps) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [hasCurrentUserLocation, setHasCurrentUserLocation] = useState(currentUserHasLocation);
  const [captureLoading, setCaptureLoading] = useState(false);
  const [captureStatus, setCaptureStatus] = useState('');

  const roleCounts = useMemo(() => {
    return locations.reduce<Record<string, number>>((counts, location) => {
      counts[location.role] = (counts[location.role] || 0) + 1;
      return counts;
    }, {});
  }, [locations]);

  const captureCurrentLocation = () => {
    if (!navigator.geolocation) {
      setCaptureStatus('This browser does not support GPS.');
      return;
    }

    setCaptureLoading(true);
    setCaptureStatus('Waiting for a verified GPS fix…');
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const inNepal = coords.latitude >= 26.347 && coords.latitude <= 30.447
          && coords.longitude >= 80.058 && coords.longitude <= 88.201;
        if (!inNepal) {
          setCaptureStatus('The detected location is outside Nepal.');
          setCaptureLoading(false);
          return;
        }

        try {
          await updateCurrentUserLocation({
            latitude: coords.latitude,
            longitude: coords.longitude,
            locationAccuracyM: coords.accuracy,
          });
          setHasCurrentUserLocation(true);
          setCaptureStatus('Your location is now on the Nepal map.');
        } catch (captureError) {
          setCaptureStatus(captureError instanceof Error ? captureError.message : 'Could not save your location.');
        } finally {
          setCaptureLoading(false);
        }
      },
      (captureError) => {
        setCaptureStatus(captureError.code === captureError.PERMISSION_DENIED
          ? 'Location permission was denied. Enable it in browser settings.'
          : 'GPS signal unavailable. Try again outdoors.');
        setCaptureLoading(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 300000 },
    );
  };

  useEffect(() => {
    if (!mapElementRef.current) return;

    const map = L.map(mapElementRef.current, {
      center: NEPAL_CENTER,
      zoom: 7,
      minZoom: 7,
      maxZoom: 18,
      maxBounds: NEPAL_BOUNDS,
      maxBoundsViscosity: 1,
      zoomControl: false,
      scrollWheelZoom: true,
      worldCopyJump: false,
    });

    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    const markerLayer = L.layerGroup().addTo(map);
    let isDisposed = false;
    let hasFittedLocations = false;

    const loadLocations = async () => {
      try {
        const response = await fetchMapLocations();
        if (isDisposed) return;

        markerLayer.clearLayers();
        response.locations.forEach((location) => {
          const marker = L.marker([location.latitude, location.longitude], {
            icon: createRoleIcon(location),
            title: `${location.role}: ${location.name}`,
          });
          marker.bindTooltip(`${location.name} · ${location.role}`, { direction: 'top', offset: [0, -17] });
          marker.bindPopup(popupHtml(location), { maxWidth: 260 });
          marker.addTo(markerLayer);
        });

        if (!hasFittedLocations && response.locations.length > 0) {
          const locationsBounds = L.latLngBounds(response.locations.map((location) => [location.latitude, location.longitude] as L.LatLngExpression));
          map.fitBounds(locationsBounds, { padding: [30, 30], maxZoom: 11 });
          hasFittedLocations = true;
        } else if (!hasFittedLocations) {
          map.setView(NEPAL_CENTER, 7);
        }

        setLocations(response.locations);
        setLastUpdated(new Date());
        setError(null);
      } catch (loadError) {
        if (!isDisposed) setError(loadError instanceof Error ? loadError.message : 'Could not load account locations.');
      } finally {
        if (!isDisposed) setLoading(false);
      }
    };

    void loadLocations();
    const refreshId = window.setInterval(() => void loadLocations(), 30000);

    return () => {
      isDisposed = true;
      window.clearInterval(refreshId);
      map.remove();
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="relative h-[22rem] w-full overflow-hidden rounded-2xl border border-outline-variant/30 bg-slate-100">
        <div ref={mapElementRef} className="h-full w-full" aria-label="Real account locations across Nepal" />
        <div className="pointer-events-none absolute left-3 top-3 z-[500] rounded-xl bg-white/95 px-3 py-2 text-[11px] shadow-lg backdrop-blur-sm">
          <p className="font-bold text-primary">Nepal account network</p>
          <p className="text-on-surface-variant">{locations.length} map-enabled account{locations.length === 1 ? '' : 's'} · refreshes every 30 seconds</p>
        </div>
        {loading && (
          <div className="absolute inset-0 z-[600] flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
            <p className="rounded-xl bg-white px-4 py-3 text-xs font-semibold text-primary shadow-lg">Loading real account locations…</p>
          </div>
        )}
        {error && !loading && (
          <div className="absolute bottom-3 left-3 right-3 z-[600] rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-800 shadow-lg">
            {error}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-on-surface-variant">
        {(Object.keys(roleConfig) as MapRole[]).map((role) => (
          <span key={role} className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-base" style={{ color: roleConfig[role].color }}>{roleConfig[role].icon}</span>
            <span>{roleConfig[role].label} ({roleCounts[role] || 0})</span>
          </span>
        ))}
        {lastUpdated && <span className="ml-auto">Updated {lastUpdated.toLocaleTimeString()}</span>}
      </div>
      {!loading && !error && locations.length === 0 && (
        <p className="rounded-xl bg-surface-container-low px-3 py-2 text-xs text-on-surface-variant">
          No accounts have shared a valid GPS location yet. New accounts appear here after completing the location step.
        </p>
      )}
      {!hasCurrentUserLocation && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs text-amber-950">
          <div>
            <p className="font-bold">Your account is not pinned yet.</p>
            <p className="mt-0.5 text-amber-800">Capture your current GPS location to appear on this map.</p>
          </div>
          <button type="button" onClick={captureCurrentLocation} disabled={captureLoading} className="rounded-lg bg-amber-700 px-3 py-2 font-bold text-white border-none cursor-pointer disabled:opacity-60">
            {captureLoading ? 'Capturing…' : 'Pin my location'}
          </button>
          {captureStatus && <p className="w-full text-[11px] text-amber-800">{captureStatus}</p>}
        </div>
      )}
    </div>
  );
}
