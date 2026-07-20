"use client";

import { useEffect, useLayoutEffect, useRef, useState, Suspense, type PointerEvent } from "react";
import Link from "next/link";
import { PropertySearch } from "@/components/site/PropertySearch";
import type { MapPin } from "@/lib/geo";
import { loadGoogleMaps } from "@/lib/google-maps";

export type { MapPin };

type LatLngLiteral = { lat: number; lng: number };

type GoogleMap = {
  fitBounds: (
    b: unknown,
    p?: number | { top: number; right: number; bottom: number; left: number },
  ) => void;
  setOptions: (opts: Record<string, unknown>) => void;
  setCenter: (c: LatLngLiteral) => void;
  setZoom: (z: number) => void;
  getZoom: () => number | undefined;
};

type LatLngBounds = {
  extend: (p: LatLngLiteral) => void;
  isEmpty: () => boolean;
  getNorthEast: () => { lat: () => number; lng: () => number };
  getSouthWest: () => { lat: () => number; lng: () => number };
};

type GoogleMapsNamespace = {
  maps: {
    Map: new (el: HTMLElement, opts: Record<string, unknown>) => GoogleMap;
    LatLngBounds: new () => LatLngBounds;
    Marker: new (opts: Record<string, unknown>) => {
      addListener: (event: string, fn: () => void) => void;
      setMap: (map: unknown) => void;
    };
    InfoWindow: new (opts: Record<string, unknown>) => {
      open: (opts: { map: unknown; anchor: unknown }) => void;
      close: () => void;
      setContent: (html: string) => void;
      addListener: (event: string, fn: () => void) => void;
    };
    Size: new (width: number, height: number) => unknown;
    Point: new (x: number, y: number) => unknown;
    event: {
      clearInstanceListeners: (t: unknown) => void;
      trigger: (instance: unknown, eventName: string) => void;
      addListenerOnce: (
        instance: unknown,
        eventName: string,
        handler: () => void,
      ) => void;
    };
  };
};

/** Classic map-pin emoji as a marker icon (tip anchored to lat/lng). */
function emojiPinIcon(google: GoogleMapsNamespace) {
  const size = 42;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><text x="50%" y="90%" text-anchor="middle" font-size="${Math.round(size * 0.95)}">📍</text></svg>`;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size / 2, size - 2),
  };
}

/** Search-focus pin — distinct from listing pins so Clear is obvious. */
function searchFocusPinIcon(google: GoogleMapsNamespace) {
  const size = 44;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24"><path fill="#e11d48" stroke="#fff" stroke-width="1.5" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size / 2, size),
  };
}

function focusCoordKey(
  f: { lat: number; lng: number } | null | undefined,
): string {
  if (!f || !Number.isFinite(f.lat) || !Number.isFinite(f.lng)) return "";
  return `${f.lat.toFixed(6)},${f.lng.toFixed(6)}`;
}

/** Survives remounts so Clear isn't undone by RSC replay with stale focus props. */
let dismissedMapFocusKey = "";

/** Street-level default — used for init, list start, and search focus. */
const DEFAULT_MAP_ZOOM = 16;

/** Always start on the first property in the list. */
function centerMapOnFirstPin(map: GoogleMap, pins: MapPin[]) {
  if (!pins.length) return;
  map.setCenter({ lat: pins[0].lat, lng: pins[0].lng });
  map.setZoom(DEFAULT_MAP_ZOOM);
}

export function PropertiesMapHero({
  pins,
  focus,
}: {
  pins: MapPin[];
  /** Zoom the map to this search address when present */
  focus?: { lat: number; lng: number; label?: string } | null;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const mapInstanceRef = useRef<GoogleMap | null>(null);
  const googleRef = useRef<GoogleMapsNamespace | null>(null);
  const focusMarkerRef = useRef<{ setMap: (map: unknown) => void } | null>(
    null,
  );
  const pinMarkersRef = useRef<{ setMap: (map: unknown) => void }[]>([]);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  // Mobile-first: start collapsed; expand on desktop after mount (or when search focus)
  const [collapsed, setCollapsed] = useState(() => !focus);
  /** Client-owned search pin — Clear nulls this immediately. */
  const propFocusKey = focusCoordKey(focus);
  const prevPropFocusKeyRef = useRef(propFocusKey);
  const [mapFocus, setMapFocus] = useState<{
    lat: number;
    lng: number;
    label?: string;
  } | null>(() => {
    if (!focus || !propFocusKey) return null;
    if (propFocusKey === dismissedMapFocusKey) return null;
    return focus;
  });
  /** Click-to-drag: idle map lets the page scroll; click enables pan/zoom */
  const [mapActive, setMapActive] = useState(false);
  const [overSearch, setOverSearch] = useState(false);
  const mapActiveRef = useRef(false);
  const overSearchRef = useRef(false);
  const searchHitRef = useRef<HTMLDivElement>(null);
  const chromeRef = useRef<HTMLDivElement>(null);
  const shieldRef = useRef<HTMLButtonElement>(null);
  const stageInnerRef = useRef<HTMLDivElement>(null);
  /** Blocks shield activation after search UI (native selects can click-through). */
  const suppressMapActivateUntilRef = useRef(0);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  /** Desktop overlay only — drag offset for the floating search widget. */
  const [searchOffset, setSearchOffset] = useState({ x: 0, y: 0 });
  const [searchDragging, setSearchDragging] = useState(false);
  const searchOffsetRef = useRef(searchOffset);
  searchOffsetRef.current = searchOffset;
  const dragSessionRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
  } | null>(null);

  const mapFocusRef = useRef(mapFocus);
  mapFocusRef.current = mapFocus;

  mapActiveRef.current = mapActive;

  // Only adopt server focus when the URL focus coordinates change (new search),
  // never re-apply a pin the user already cleared.
  useEffect(() => {
    if (propFocusKey === prevPropFocusKeyRef.current) return;
    prevPropFocusKeyRef.current = propFocusKey;

    if (!propFocusKey) {
      setMapFocus(null);
      return;
    }
    if (propFocusKey === dismissedMapFocusKey) {
      setMapFocus(null);
      return;
    }
    dismissedMapFocusKey = "";
    setMapFocus(focus ? { lat: focus.lat, lng: focus.lng, label: focus.label } : null);
  }, [propFocusKey, focus]);

  function removeFocusMarker() {
    if (focusMarkerRef.current) {
      focusMarkerRef.current.setMap(null);
      focusMarkerRef.current = null;
    }
  }

  function clearMapFocus() {
    const key = focusCoordKey(mapFocus) || propFocusKey;
    if (key) dismissedMapFocusKey = key;
    setMapFocus(null);
    removeFocusMarker();

    const map = mapInstanceRef.current;
    if (map && pins.length) {
      centerMapOnFirstPin(map, pins);
    }
  }

  function commitMapFocus() {
    dismissedMapFocusKey = "";
  }

  function setOverSearchBoth(next: boolean) {
    overSearchRef.current = next;
    setOverSearch((prev) => (prev === next ? prev : next));
  }

  function pointInRect(
    x: number,
    y: number,
    r: DOMRectReadOnly,
    pad = 0,
  ) {
    return (
      x >= r.left - pad &&
      x <= r.right + pad &&
      y >= r.top - pad &&
      y <= r.bottom + pad
    );
  }

  function shouldIgnoreMapActivate(clientX?: number, clientY?: number) {
    if (overSearchRef.current) return true;
    if (Date.now() < suppressMapActivateUntilRef.current) return true;

    const hit = searchHitRef.current;
    if (hit && document.activeElement && hit.contains(document.activeElement)) {
      return true;
    }

    if (hit && typeof clientX === "number" && typeof clientY === "number") {
      if (pointInRect(clientX, clientY, hit.getBoundingClientRect(), 2)) {
        return true;
      }
    }

    if (typeof clientX === "number" && typeof clientY === "number") {
      const pac = document.querySelector(".pac-container");
      if (pac instanceof HTMLElement && pac.offsetParent !== null) {
        if (pointInRect(clientX, clientY, pac.getBoundingClientRect(), 2)) {
          return true;
        }
      }
    }

    return false;
  }

  function noteSearchInteraction() {
    suppressMapActivateUntilRef.current = Date.now() + 2000;
  }

  function canDragSearch() {
    return (
      !collapsed &&
      typeof window !== "undefined" &&
      window.matchMedia("(min-width: 900px)").matches
    );
  }

  function clampSearchOffset(x: number, y: number) {
    const hit = searchHitRef.current;
    const chrome = chromeRef.current;
    if (!hit || !chrome) return { x, y };

    const pad = 12;
    const hitRect = hit.getBoundingClientRect();
    const chromeRect = chrome.getBoundingClientRect();
    const cur = searchOffsetRef.current;
    const naturalLeft = hitRect.left - cur.x;
    const naturalTop = hitRect.top - cur.y;
    const w = hitRect.width;
    const h = hitRect.height;

    const minX = chromeRect.left + pad - naturalLeft;
    const maxX = chromeRect.right - pad - w - naturalLeft;
    const minY = chromeRect.top + pad - naturalTop;
    const maxY = chromeRect.bottom - pad - h - naturalTop;

    return {
      x: Math.min(maxX, Math.max(minX, x)),
      y: Math.min(maxY, Math.max(minY, y)),
    };
  }

  function onSearchDragPointerDown(e: PointerEvent<HTMLButtonElement>) {
    if (!canDragSearch()) return;
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    noteSearchInteraction();
    setOverSearchBoth(true);
    setSearchDragging(true);
    dragSessionRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: searchOffsetRef.current.x,
      originY: searchOffsetRef.current.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function onSearchDragPointerMove(e: PointerEvent<HTMLButtonElement>) {
    const session = dragSessionRef.current;
    if (!session || session.pointerId !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    const next = clampSearchOffset(
      session.originX + (e.clientX - session.startX),
      session.originY + (e.clientY - session.startY),
    );
    setSearchOffset(next);
    requestAnimationFrame(() => syncShieldClip());
  }

  function endSearchDrag(e: PointerEvent<HTMLButtonElement>) {
    const session = dragSessionRef.current;
    if (!session || session.pointerId !== e.pointerId) return;
    dragSessionRef.current = null;
    setSearchDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
    requestAnimationFrame(() => syncShieldClip());
  }

  function syncShieldClip() {
    const shield = shieldRef.current;
    const search = searchHitRef.current;
    const stage = stageInnerRef.current;
    if (!shield) return;

    const overlaySearch =
      !collapsed &&
      !mapActive &&
      search &&
      stage &&
      window.matchMedia("(min-width: 900px)").matches;

    if (!overlaySearch) {
      shield.style.clipPath = "";
      return;
    }

    const sr = search.getBoundingClientRect();
    const tr = stage.getBoundingClientRect();
    const top = sr.top - tr.top;
    const left = sr.left - tr.left;
    const right = sr.right - tr.left;
    const bottom = sr.bottom - tr.top;

    if (right <= left || bottom <= top) {
      shield.style.clipPath = "";
      return;
    }

    // Punch a hole so the shield cannot receive clicks under the search widget.
    shield.style.clipPath = `polygon(evenodd, 0% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, ${left}px ${top}px, ${right}px ${top}px, ${right}px ${bottom}px, ${left}px ${bottom}px, ${left}px ${top}px)`;
  }

  useLayoutEffect(() => {
    if (focus) {
      setCollapsed(false);
      return;
    }
    if (!window.matchMedia("(max-width: 899px)").matches) {
      setCollapsed(false);
    }
  }, [focus]);

  useEffect(() => {
    if (collapsed) {
      setSearchOffset({ x: 0, y: 0 });
      setSearchDragging(false);
      dragSessionRef.current = null;
    }
  }, [collapsed]);

  useLayoutEffect(() => {
    syncShieldClip();
  }, [searchOffset, collapsed, mapActive]);

  useEffect(() => {
    const onResize = () => {
      if (!canDragSearch()) return;
      setSearchOffset((prev) => clampSearchOffset(prev.x, prev.y));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [collapsed]);

  useEffect(() => {
    if (!focus) return;
    const id = window.setTimeout(() => {
      const card = document.querySelector(".site-card") as HTMLElement | null;
      if (card) card.scrollTo({ top: 0, behavior: "smooth" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
    }, 80);
    return () => window.clearTimeout(id);
  }, [focus?.lat, focus?.lng]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    // Page scroll wins while idle, or while the pointer is over the search widget.
    const gesturesOn = mapActive && !overSearch;
    map.setOptions(
      gesturesOn
        ? {
            draggable: true,
            scrollwheel: true,
            gestureHandling: "greedy",
            keyboardShortcuts: true,
          }
        : {
            draggable: false,
            scrollwheel: false,
            gestureHandling: "none",
            keyboardShortcuts: false,
          },
    );
  }, [mapActive, overSearch]);

  useEffect(() => {
    if (collapsed) setMapActive(false);
  }, [collapsed]);

  useLayoutEffect(() => {
    syncShieldClip();
  }, [collapsed, mapActive, ready, overSearch]);

  useEffect(() => {
    if (collapsed) {
      setOverSearchBoth(false);
      return;
    }

    const onMove = (e: PointerEvent) => {
      const hit = searchHitRef.current;
      if (!hit) {
        setOverSearchBoth(false);
        return;
      }
      setOverSearchBoth(
        pointInRect(e.clientX, e.clientY, hit.getBoundingClientRect(), 2),
      );
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [collapsed, ready]);

  useEffect(() => {
    if (collapsed || mapActive) {
      const shield = shieldRef.current;
      if (shield) shield.style.clipPath = "";
      return;
    }

    const onResize = () => syncShieldClip();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);

    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => syncShieldClip())
        : null;
    if (searchHitRef.current) ro?.observe(searchHitRef.current);
    if (stageInnerRef.current) ro?.observe(stageInnerRef.current);

    syncShieldClip();

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
      ro?.disconnect();
    };
  }, [collapsed, mapActive, ready]);

  useEffect(() => {
    if (!apiKey) {
      setError("missing-key");
      return;
    }
    if (!mapRef.current) return;

    let cancelled = false;
    let closeTimer: ReturnType<typeof setTimeout> | null = null;

    loadGoogleMaps(apiKey)
      .then((host) => {
        if (cancelled || !mapRef.current) return;
        const google = host as unknown as GoogleMapsNamespace;
        googleRef.current = google;

        const center = pins[0]
          ? { lat: pins[0].lat, lng: pins[0].lng }
          : { lat: 39.8283, lng: -98.5795 };

        const map = new google.maps.Map(mapRef.current, {
          center,
          zoom: pins.length ? DEFAULT_MAP_ZOOM : 4,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          clickableIcons: false,
          draggable: false,
          scrollwheel: false,
          gestureHandling: "none",
          keyboardShortcuts: false,
          styles: [
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            {
              featureType: "transit",
              stylers: [{ visibility: "simplified" }],
            },
          ],
        });
        mapInstanceRef.current = map;
        if (mapActiveRef.current) {
          map.setOptions({
            draggable: true,
            scrollwheel: true,
            gestureHandling: "greedy",
            keyboardShortcuts: true,
          });
        }

        pinMarkersRef.current.forEach((m) => m.setMap(null));
        pinMarkersRef.current = [];
        removeFocusMarker();

        const info = new google.maps.InfoWindow({ content: "" });
        let pointerOverInfo = false;

        const cancelInfoClose = () => {
          if (closeTimer == null) return;
          clearTimeout(closeTimer);
          closeTimer = null;
        };

        const scheduleInfoClose = () => {
          cancelInfoClose();
          closeTimer = setTimeout(() => {
            closeTimer = null;
            if (!pointerOverInfo) info.close();
          }, 160);
        };

        const openPinInfo = (
          pin: MapPin,
          marker: { addListener: (event: string, fn: () => void) => void },
        ) => {
          cancelInfoClose();
          pointerOverInfo = false;
          const esc = (s: string) =>
            s
              .replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/"/g, "&quot;");
          info.setContent(`
              <div class="kn-map-iw">
                <a class="kn-map-iw__media" href="/properties/${esc(pin.slug)}">
                  <img src="${esc(pin.image)}" alt="${esc(pin.title)}" width="220" height="140" />
                </a>
                <div class="kn-map-iw__body">
                  <strong class="kn-map-iw__title">${esc(pin.title)}</strong>
                  <span class="kn-map-iw__price">${esc(pin.priceLabel)}</span>
                  <a class="kn-map-iw__link" href="/properties/${esc(pin.slug)}">View listing</a>
                </div>
              </div>
            `);
          info.open({ map, anchor: marker });
          google.maps.event.addListenerOnce(info, "domready", () => {
            const el = document.querySelector(".kn-map-iw");
            if (!el) return;
            el.addEventListener("mouseenter", () => {
              pointerOverInfo = true;
              cancelInfoClose();
            });
            el.addEventListener("mouseleave", () => {
              pointerOverInfo = false;
              scheduleInfoClose();
            });
          });
        };

        for (const pin of pins) {
          const position = { lat: pin.lat, lng: pin.lng };
          const marker = new google.maps.Marker({
            map,
            position,
            title: pin.title,
            icon: emojiPinIcon(google),
            optimized: false,
          });
          marker.addListener("mouseover", () => openPinInfo(pin, marker));
          marker.addListener("mouseout", () => scheduleInfoClose());
          marker.addListener("click", () => openPinInfo(pin, marker));
          pinMarkersRef.current.push(marker);
        }

        const currentFocus = mapFocusRef.current;
        if (currentFocus) {
          map.setCenter({ lat: currentFocus.lat, lng: currentFocus.lng });
          map.setZoom(DEFAULT_MAP_ZOOM);
          focusMarkerRef.current = new google.maps.Marker({
            map,
            position: { lat: currentFocus.lat, lng: currentFocus.lng },
            title: currentFocus.label || "Search location",
            icon: searchFocusPinIcon(google),
            optimized: false,
            zIndex: 999,
          });
        } else if (pins.length) {
          centerMapOnFirstPin(map, pins);
        }

        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setError("load-failed");
      });

    return () => {
      cancelled = true;
      if (closeTimer != null) clearTimeout(closeTimer);
      pinMarkersRef.current.forEach((m) => m.setMap(null));
      pinMarkersRef.current = [];
      removeFocusMarker();
      mapInstanceRef.current = null;
    };
    // Listing pins only — search focus is handled separately so Clear never rebuilds the map.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mapFocus synced in its own effect
  }, [apiKey, pins]);

  // Keep the search-focus marker in sync with client-owned mapFocus (Clear → null).
  useEffect(() => {
    if (!ready) return;
    const map = mapInstanceRef.current;
    const google = googleRef.current;
    if (!map || !google) return;

    removeFocusMarker();

    if (!mapFocus) {
      if (pins.length) {
        centerMapOnFirstPin(map, pins);
      }
      return;
    }

    map.setCenter({ lat: mapFocus.lat, lng: mapFocus.lng });
    map.setZoom(DEFAULT_MAP_ZOOM);
    focusMarkerRef.current = new google.maps.Marker({
      map,
      position: { lat: mapFocus.lat, lng: mapFocus.lng },
      title: mapFocus.label || "Search location",
      icon: searchFocusPinIcon(google),
      optimized: false,
      zIndex: 999,
    });
  }, [ready, mapFocus, pins]);

  function refreshMap() {
    const google = googleRef.current;
    const map = mapInstanceRef.current;
    if (!google || !map) return;
    google.maps.event.trigger(map, "resize");
  }

  function toggleCollapsed() {
    const next = !collapsed;
    setCollapsed(next);

    if (!next) {
      // Show map — always return to the top of the card
      const card = document.querySelector(".site-card") as HTMLElement | null;
      if (card) card.scrollTo({ top: 0, behavior: "smooth" });
      else window.scrollTo({ top: 0, behavior: "smooth" });
      // After expand animation, tell Maps the viewport is visible again
      window.setTimeout(refreshMap, 620);
    }
  }

  return (
    <section
      ref={sectionRef}
      className={`properties-map-hero${collapsed ? " is-collapsed" : ""}${mapActive ? " is-map-active" : ""}${overSearch ? " is-over-search" : ""}`}
      aria-label="Property map"
      aria-expanded={!collapsed}
      onMouseLeave={() => setMapActive(false)}
      {...(mapActive && !overSearch && !collapsed
        ? { "data-lenis-prevent": true }
        : {})}
    >
      <div className="properties-map-hero__stage">
        <div ref={stageInnerRef} className="properties-map-hero__stage-inner">
          <div ref={mapRef} className="properties-map-hero__canvas" aria-hidden={collapsed} />

          {!collapsed && !mapActive && ready && !error ? (
            <button
              ref={shieldRef}
              type="button"
              className="properties-map-hero__gesture-shield"
              aria-label="Enable map pan and zoom"
              tabIndex={overSearch ? -1 : 0}
              onPointerDown={(e) => {
                if (shouldIgnoreMapActivate(e.clientX, e.clientY)) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              onClick={(e) => {
                if (shouldIgnoreMapActivate(e.clientX, e.clientY)) {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                setMapActive(true);
              }}
            />
          ) : null}

          {!ready && !error ? (
            <div className="properties-map-hero__loading">Loading map…</div>
          ) : null}

          {error ? (
            <div className="properties-map-hero__fallback">
              <p>
                {error === "missing-key"
                  ? "Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable the live map."
                  : "Map could not load. Check your Google Maps API key."}
              </p>
              <p className="properties-map-hero__fallback-meta">
                {pins.length} listed {pins.length === 1 ? "property" : "properties"} ready for pins
              </p>
            </div>
          ) : null}

          <div className="properties-map-hero__copy" aria-hidden={collapsed}>
            <p className="properties-map-hero__eyebrow">Explore the map</p>
            <p className="properties-map-hero__title">Find homes on the market</p>
          </div>
        </div>
      </div>

      <div ref={chromeRef} className="properties-map-hero__chrome">
        <div
          ref={searchHitRef}
          className={`properties-map-hero__search-hit${searchDragging ? " is-dragging" : ""}`}
          style={
            searchOffset.x !== 0 || searchOffset.y !== 0 || searchDragging
              ? {
                  transform: `translate3d(${searchOffset.x}px, ${searchOffset.y}px, 0)`,
                }
              : undefined
          }
          onPointerEnter={() => setOverSearchBoth(true)}
          onPointerLeave={() => {
            if (!searchDragging) setOverSearchBoth(false);
          }}
          onFocusCapture={() => {
            setOverSearchBoth(true);
            noteSearchInteraction();
          }}
          onBlurCapture={() => {
            noteSearchInteraction();
          }}
          onPointerDown={(e) => {
            setOverSearchBoth(true);
            noteSearchInteraction();
            e.stopPropagation();
          }}
          onClick={(e) => {
            noteSearchInteraction();
            e.stopPropagation();
          }}
          onChangeCapture={() => noteSearchInteraction()}
        >
          <button
            type="button"
            className="properties-map-hero__search-drag"
            aria-label="Drag search panel"
            onPointerDown={onSearchDragPointerDown}
            onPointerMove={onSearchDragPointerMove}
            onPointerUp={endSearchDrag}
            onPointerCancel={endSearchDrag}
          >
            <span className="properties-map-hero__search-drag-grip" aria-hidden />
          </button>
          <Suspense fallback={<div className="hero-search hero-search--map" />}>
            <PropertySearch
              variant="map"
              className="properties-map-hero__search"
              onLocationClear={clearMapFocus}
              onLocationCommit={commitMapFocus}
            />
          </Suspense>
        </div>

        <button
          type="button"
          className="properties-map-hero__toggle"
          onClick={toggleCollapsed}
          onPointerDown={(e) => e.stopPropagation()}
          aria-pressed={collapsed}
          aria-label={collapsed ? "Show map" : "Collapse map"}
        >
          <span className="properties-map-hero__toggle-idle" aria-hidden>
            {collapsed ? (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 15l-6-6-6 6" />
                </svg>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 15l-6-6-6 6" />
                </svg>
              </>
            )}
          </span>
          <span className="properties-map-hero__toggle-hover" aria-hidden>
            {collapsed ? (
              <>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>Show Map</span>
              </>
            ) : (
              <span>Collapse map</span>
            )}
          </span>
        </button>
      </div>
    </section>
  );
}

/** Lightweight list used when map is unavailable — still shows linked pins textually */
export function PropertiesMapPinList({ pins }: { pins: MapPin[] }) {
  if (!pins.length) return null;
  return (
    <ul className="sr-only">
      {pins.map((pin) => (
        <li key={pin.id}>
          <Link href={`/properties/${pin.slug}`}>{pin.title}</Link>
        </li>
      ))}
    </ul>
  );
}
