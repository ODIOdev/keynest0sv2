"use client";

import { useEffect, useRef, useState, type InputHTMLAttributes } from "react";
import {
  attachPlacesAutocomplete,
  loadGoogleMaps,
} from "@/lib/google-maps";

export type PlaceSelection = {
  label: string;
  lat: number;
  lng: number;
  /** Street number + route when available */
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
};

type AddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

function component(
  parts: AddressComponent[] | undefined,
  type: string,
  short = false,
) {
  const match = parts?.find((c) => c.types.includes(type));
  if (!match) return "";
  return short ? match.short_name : match.long_name;
}

export function parsePlaceAddress(parts: AddressComponent[] | undefined) {
  const streetNumber = component(parts, "street_number");
  const route = component(parts, "route");
  const street = [streetNumber, route].filter(Boolean).join(" ");
  const city =
    component(parts, "locality") ||
    component(parts, "sublocality") ||
    component(parts, "postal_town") ||
    component(parts, "administrative_area_level_3");
  const state = component(parts, "administrative_area_level_1", true);
  const zip = component(parts, "postal_code");
  return { street, city, state, zip };
}

type PlacesAutocompleteInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange" | "defaultValue"
> & {
  value?: string;
  onChange?: (value: string) => void;
  defaultValue?: string;
  /** Fired when a Google place is picked (or cleared on manual typing). */
  onPlaceSelect?: (place: PlaceSelection | null) => void;
};

export function PlacesAutocompleteInput({
  value: valueProp,
  onChange,
  onPlaceSelect,
  defaultValue = "",
  className,
  ...rest
}: PlacesAutocompleteInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const onChangeRef = useRef(onChange);
  const onPlaceSelectRef = useRef(onPlaceSelect);
  const controlled = valueProp !== undefined;
  const [inner, setInner] = useState(defaultValue);
  const value = controlled ? valueProp : inner;
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  onChangeRef.current = onChange;
  onPlaceSelectRef.current = onPlaceSelect;

  useEffect(() => {
    const input = inputRef.current;
    if (!input || !apiKey) return;

    let cancelled = false;

    attachPlacesAutocomplete(input, apiKey)
      .then((autocomplete) => {
        if (cancelled || !autocomplete) return;

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          const parsed = parsePlaceAddress(place.address_components);
          const next =
            parsed.street ||
            place.formatted_address ||
            place.name ||
            input.value.trim();
          if (!next) return;
          if (!controlled) setInner(next);
          onChangeRef.current?.(next);

          const loc = place.geometry?.location;
          if (loc) {
            onPlaceSelectRef.current?.({
              label: place.formatted_address || next,
              lat: loc.lat(),
              lng: loc.lng(),
              street: parsed.street || next,
              city: parsed.city,
              state: parsed.state,
              zip: parsed.zip,
            });
          } else {
            onPlaceSelectRef.current?.(null);
          }
        });
      })
      .catch(() => {
        /* Plain text input still works if Places is unavailable */
      });

    return () => {
      cancelled = true;
      void loadGoogleMaps(apiKey)
        .then((google) => {
          const maps = google.maps as {
            event?: { clearInstanceListeners?: (t: unknown) => void };
          };
          maps.event?.clearInstanceListeners?.(input);
        })
        .catch(() => undefined);
    };
  }, [apiKey, controlled]);

  return (
    <input
      ref={inputRef}
      className={className}
      value={value}
      onChange={(e) => {
        const next = e.target.value;
        if (!controlled) setInner(next);
        onChangeRef.current?.(next);
        // Manual edits invalidate the previous place selection
        onPlaceSelectRef.current?.(null);
      }}
      {...rest}
    />
  );
}
