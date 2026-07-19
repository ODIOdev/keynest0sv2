"use client";

import { FormEvent, useEffect, useId, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { PlacesAutocompleteInput } from "@/components/site/PlacesAutocompleteInput";
import type { PlaceSelection } from "@/components/site/PlacesAutocompleteInput";
import {
  buildPropertiesHref,
  modeFromTypeParam,
  typeParamFromMode,
  type SearchListingMode,
} from "@/lib/listing-params";

type PropertySegment = "" | "residential" | "commercial";

type PropertySearchProps = {
  /** Visual style: glass on hero/map, solid on listings page, horizontal bar when map collapsed */
  variant?: "hero" | "page" | "map" | "map-bar";
  className?: string;
  /** Called when the location field is cleared (e.g. drop map focus pin). */
  onLocationClear?: () => void;
  /** Called when a search is submitted so a new focus pin can be shown. */
  onLocationCommit?: () => void;
};

const SEGMENT_TO_CATEGORY: Record<Exclude<PropertySegment, "">, string> = {
  residential: "eco-friendly-homes",
  commercial: "commercial-properties",
};

const CUSTOM_VALUE = "__custom__";

const SQFT_PRESETS = [
  { value: "1000", label: "1,000+" },
  { value: "2500", label: "2,500+" },
  { value: "5000", label: "5,000+" },
  { value: "10000", label: "10,000+" },
  { value: "25000", label: "25,000+" },
] as const;

const PSF_PRESETS = [
  { value: "10", label: "$10+" },
  { value: "25", label: "$25+" },
  { value: "50", label: "$50+" },
  { value: "100", label: "$100+" },
  { value: "200", label: "$200+" },
] as const;

function isPreset(value: string, presets: readonly { value: string }[]) {
  return presets.some((p) => p.value === value);
}

/** Select with a Custom option that swaps to a typed number input */
function CustomNumberSelect({
  label,
  value,
  onChange,
  presets,
  placeholder,
  prefix = "",
}: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  presets: readonly { value: string; label: string }[];
  placeholder: string;
  prefix?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [customMode, setCustomMode] = useState(
    () => value !== "" && !isPreset(value, presets),
  );

  useEffect(() => {
    if (value !== "" && !isPreset(value, presets)) setCustomMode(true);
  }, [value, presets]);

  useEffect(() => {
    if (customMode) inputRef.current?.focus();
  }, [customMode]);

  function exitCustom() {
    setCustomMode(false);
    onChange("");
  }

  if (customMode) {
    return (
      <label className="hero-search__field" htmlFor={inputId}>
        <span>{label}</span>
        <span className="hero-search__custom">
          {prefix ? (
            <span className="hero-search__custom-prefix" aria-hidden>
              {prefix}
            </span>
          ) : null}
          <input
            ref={inputRef}
            id={inputId}
            type="number"
            inputMode="numeric"
            min={1}
            step={1}
            value={value}
            placeholder={placeholder}
            onChange={(e) => {
              const raw = e.target.value;
              if (raw === "") {
                onChange("");
                return;
              }
              const n = Math.floor(Number(raw));
              if (!Number.isFinite(n) || n < 1) {
                onChange("");
                return;
              }
              onChange(String(n));
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") exitCustom();
            }}
          />
          <button
            type="button"
            className="hero-search__custom-clear"
            aria-label={`Clear ${label}`}
            onClick={exitCustom}
          >
            ×
          </button>
        </span>
      </label>
    );
  }

  return (
    <label className="hero-search__field">
      <span>{label}</span>
      <select
        value={isPreset(value, presets) ? value : ""}
        onChange={(e) => {
          const next = e.target.value;
          if (next === CUSTOM_VALUE) {
            setCustomMode(true);
            onChange("");
            return;
          }
          onChange(next);
        }}
      >
        <option value="">Any</option>
        {presets.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
        <option value={CUSTOM_VALUE}>Custom…</option>
      </select>
    </label>
  );
}

export function PropertySearch({
  variant = "hero",
  className = "",
  onLocationClear,
  onLocationCommit,
}: PropertySearchProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const onProperties = pathname === "/properties";

  const [mode, setMode] = useState<SearchListingMode>(() =>
    modeFromTypeParam(searchParams.get("type")),
  );
  const [segment, setSegment] = useState<PropertySegment>("");
  const [location, setLocation] = useState("");
  const [placeFocus, setPlaceFocus] = useState<PlaceSelection | null>(null);
  const [beds, setBeds] = useState("");
  const [baths, setBaths] = useState("");
  const [sqft, setSqft] = useState("");
  const [pricePerSf, setPricePerSf] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [locationError, setLocationError] = useState(false);

  const hideSell = variant === "map" || variant === "map-bar";
  const showSegment = hideSell || mode !== "sell";
  const isCommercial = segment === "commercial";
  const locationRequired = mode !== "sell";

  // On /properties with no `type`, neither Buy nor Rent is selected (Listings / all).
  // Elsewhere (homepage), the local mode drives the highlight.
  const urlType = searchParams.get("type");
  const selectedTab: SearchListingMode | null = onProperties
    ? urlType === "rent"
      ? "rent"
      : urlType === "sell"
        ? "buy"
        : null
    : mode;

  const tabs = (
    hideSell
      ? ([
          ["buy", "Buy"],
          ["rent", "Rent"],
        ] as const)
      : ([
          ["buy", "Buy"],
          ["rent", "Rent"],
          ["sell", "Sell"],
        ] as const)
  );

  function clearLocation() {
    setLocation("");
    setPlaceFocus(null);
    setLocationError(false);
    onLocationClear?.();

    const params = new URLSearchParams(searchParams.toString());
    if (!params.has("q") && !params.has("lat") && !params.has("lng")) return;
    if (!pathname.startsWith("/properties")) return;

    params.delete("q");
    params.delete("lat");
    params.delete("lng");

    const query = params.toString();
    const href = query ? `${pathname}?${query}` : pathname;
    router.replace(href, { scroll: false });
  }

  useEffect(() => {
    const type = searchParams.get("type");
    if (type === "rent") setMode("rent");
    else if (type === "sell") setMode("buy");
    else if (onProperties) setMode("buy");
    // On homepage / other pages, leave local mode alone when URL has no type

    setLocation(searchParams.get("q") || "");
    const lat = Number(searchParams.get("lat"));
    const lng = Number(searchParams.get("lng"));
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setPlaceFocus({
        label: searchParams.get("q") || "",
        lat,
        lng,
      });
    } else {
      setPlaceFocus(null);
    }
    setBeds(searchParams.get("beds") || "");
    setBaths(searchParams.get("baths") || "");
    setSqft(searchParams.get("sqft") || "");
    setPricePerSf(searchParams.get("psf") || "");

    const category = searchParams.get("category") || "";
    if (category === SEGMENT_TO_CATEGORY.commercial) setSegment("commercial");
    else if (category === SEGMENT_TO_CATEGORY.residential)
      setSegment("residential");
    else setSegment("");
  }, [searchParams, onProperties]);

  useEffect(() => {
    if (hideSell && mode === "sell") setMode("buy");
  }, [hideSell, mode]);

  function applyMode(next: SearchListingMode) {
    setMode(next);
    setBeds("");
    setBaths("");
    setSqft("");
    setPricePerSf("");
    setPropertyType("");
    setLocationError(false);
    if (next === "sell") setSegment("");

    // Sell stays on the hero form until submit — only Buy/Rent sync URL on /properties
    if (next === "sell" || !onProperties) return;

    const href = buildPropertiesHref(searchParams, {
      type: typeParamFromMode(next),
      clearFilters: true,
    });
    router.replace(href, { scroll: false });
  }

  function onSearch(e: FormEvent) {
    e.preventDefault();
    if (mode === "sell") {
      router.push("/sell");
      return;
    }
    if (!location.trim()) {
      setLocationError(true);
      return;
    }
    setLocationError(false);
    onLocationCommit?.();
    const params = new URLSearchParams();
    params.set("type", typeParamFromMode(mode));
    if (segment) params.set("category", SEGMENT_TO_CATEGORY[segment]);
    params.set("q", location.trim());
    if (placeFocus) {
      params.set("lat", String(placeFocus.lat));
      params.set("lng", String(placeFocus.lng));
    }
    if (isCommercial) {
      if (sqft) params.set("sqft", sqft);
      if (pricePerSf) params.set("psf", pricePerSf);
    } else {
      if (beds) params.set("beds", beds);
      if (baths) params.set("baths", baths);
    }
    const query = params.toString();
    router.push(query ? `/properties?${query}` : "/properties");
  }

  return (
    <form
      className={`hero-search hero-search--${variant} ${className}`.trim()}
      onSubmit={onSearch}
    >
      <div className="hero-search__tabs" role="tablist" aria-label="Search type">
        {tabs.map(([value, label]) => {
          const active = selectedTab === value;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={active}
              className={`hero-search__tab hero-search__tab--${value}${active ? " is-active" : ""}`}
              onClick={() => applyMode(value)}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="hero-search__fields">
        {showSegment ? (
          <label className="hero-search__field hero-search__field--grow">
            <span>Category</span>
            <select
              value={segment}
              onChange={(e) => {
                const next = e.target.value as PropertySegment;
                setSegment(next);
                if (next === "commercial") {
                  setBeds("");
                  setBaths("");
                } else {
                  setSqft("");
                  setPricePerSf("");
                }
              }}
            >
              <option value="">Any</option>
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
            </select>
          </label>
        ) : null}

        <label
          className={`hero-search__field hero-search__field--grow hero-search__field--location${locationError ? " is-invalid" : ""}`}
        >
          <span className="hero-search__field-head">
            <span>
              {mode === "sell" ? "Property address" : "Location"}
              {locationRequired ? (
                <abbr
                  className="hero-search__required"
                  title="Required"
                  aria-label="required"
                >
                  *
                </abbr>
              ) : null}
            </span>
            {location ? (
              <button
                type="button"
                className="hero-search__clear"
                onClick={clearLocation}
              >
                Clear
              </button>
            ) : null}
          </span>
          <PlacesAutocompleteInput
            value={location}
            onChange={(value) => {
              setLocation(value);
              if (value.trim()) setLocationError(false);
            }}
            onPlaceSelect={(place) => {
              setPlaceFocus(place);
              if (place) setLocationError(false);
            }}
            autoComplete="off"
            aria-invalid={locationError || undefined}
            aria-describedby={
              locationError ? "hero-search-location-error" : undefined
            }
            placeholder={
              mode === "sell"
                ? "Start typing an address…"
                : "City, neighborhood, or ZIP"
            }
          />
          {locationError ? (
            <p
              id="hero-search-location-error"
              className="hero-search__field-error"
              role="alert"
            >
              Location field needs an address
            </p>
          ) : null}
        </label>
        {mode === "sell" ? (
          <label className="hero-search__field hero-search__field--grow">
            <span>Type</span>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
            >
              <option value="">Any</option>
              <option value="house">House</option>
              <option value="condo">Condo</option>
              <option value="townhome">Townhome</option>
              <option value="land">Land</option>
            </select>
          </label>
        ) : isCommercial ? (
          <div className="hero-search__pair">
            <CustomNumberSelect
              key={`sqft-${mode}-${segment}`}
              label="Sq Ft"
              value={sqft}
              onChange={setSqft}
              presets={SQFT_PRESETS}
              placeholder="Min sq ft"
            />
            <CustomNumberSelect
              key={`psf-${mode}-${segment}`}
              label="$/SF"
              value={pricePerSf}
              onChange={setPricePerSf}
              presets={PSF_PRESETS}
              placeholder="Min $/SF"
              prefix="$"
            />
          </div>
        ) : (
          <div className="hero-search__pair">
            <label className="hero-search__field">
              <span>Beds</span>
              <select value={beds} onChange={(e) => setBeds(e.target.value)}>
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </label>
            <label className="hero-search__field">
              <span>Baths</span>
              <select value={baths} onChange={(e) => setBaths(e.target.value)}>
                <option value="">Any</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>
            </label>
          </div>
        )}
        <button type="submit" className="hero-search__submit">
          {mode === "sell" ? "Start selling" : "Search"}
        </button>
      </div>
    </form>
  );
}
