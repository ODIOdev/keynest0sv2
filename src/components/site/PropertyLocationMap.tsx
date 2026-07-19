"use client";

import { useEffect, useRef, useState } from "react";
import { loadGoogleMaps } from "@/lib/google-maps";

type PropertyLocationMapProps = {
  title: string;
  address: string;
  lat: number;
  lng: number;
};

type GoogleMapsNamespace = {
  maps: {
    Map: new (el: HTMLElement, opts: Record<string, unknown>) => {
      setCenter: (c: { lat: number; lng: number }) => void;
      setZoom: (z: number) => void;
    };
    Marker: new (opts: Record<string, unknown>) => {
      setMap: (map: unknown) => void;
    };
    Size: new (width: number, height: number) => unknown;
    Point: new (x: number, y: number) => unknown;
  };
};

function pinIcon(google: GoogleMapsNamespace) {
  const size = 42;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><text x="50%" y="90%" text-anchor="middle" font-size="${Math.round(size * 0.95)}">📍</text></svg>`;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size / 2, size - 2),
  };
}

export function PropertyLocationMap({
  title,
  address,
  lat,
  lng,
}: PropertyLocationMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  useEffect(() => {
    if (!apiKey) {
      setError("missing-key");
      return;
    }
    if (!mapRef.current) return;

    let cancelled = false;
    let marker: { setMap: (map: unknown) => void } | null = null;

    loadGoogleMaps(apiKey)
      .then((host) => {
        if (cancelled || !mapRef.current) return;
        const google = host as unknown as GoogleMapsNamespace;
        const map = new google.maps.Map(mapRef.current, {
          center: { lat, lng },
          zoom: 16,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          gestureHandling: "cooperative",
          styles: [
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            {
              featureType: "transit",
              stylers: [{ visibility: "simplified" }],
            },
          ],
        });
        marker = new google.maps.Marker({
          map,
          position: { lat, lng },
          title,
          icon: pinIcon(google),
          optimized: false,
        });
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setError("load-failed");
      });

    return () => {
      cancelled = true;
      marker?.setMap(null);
    };
  }, [apiKey, lat, lng, title]);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${lat},${lng}`)}`;

  return (
    <section className="property-location" aria-label="Property location">
      <div className="property-location__head">
        <div>
          <p className="property-location__eyebrow">Location</p>
          <h2 className="property-location__title">Where you will find it</h2>
          <p className="property-location__address">{address}</p>
        </div>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="property-location__link"
        >
          Open in Google Maps
        </a>
      </div>

      <div className="property-location__map-wrap">
        <div
          ref={mapRef}
          className="property-location__map"
          aria-hidden={!ready}
        />
        {!ready && !error ? (
          <div className="property-location__status">Loading map…</div>
        ) : null}
        {error ? (
          <div className="property-location__status">
            {error === "missing-key"
              ? "Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable the map."
              : "Map could not load."}
          </div>
        ) : null}
      </div>
    </section>
  );
}
