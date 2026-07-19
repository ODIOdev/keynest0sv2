type GoogleMapsHost = {
  maps: {
    importLibrary?: (name: string) => Promise<unknown>;
    places?: {
      Autocomplete: new (
        input: HTMLInputElement,
        opts?: Record<string, unknown>,
      ) => {
        addListener: (event: string, fn: () => void) => void;
        getPlace: () => {
          formatted_address?: string;
          name?: string;
          address_components?: Array<{
            long_name: string;
            short_name: string;
            types: string[];
          }>;
          geometry?: {
            location?: { lat: () => number; lng: () => number };
          };
        };
      };
    };
    [key: string]: unknown;
  };
};

declare global {
  interface Window {
    google?: GoogleMapsHost;
    __knMapsInit?: () => void;
  }
}

let mapsPromise: Promise<GoogleMapsHost> | null = null;

/**
 * Loads the Google Maps JS API once. Always requests the Places library so
 * map pins and address autocomplete can share the same script.
 */
export function loadGoogleMaps(apiKey: string): Promise<GoogleMapsHost> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Google Maps requires a browser"));
  }
  if (!apiKey) {
    return Promise.reject(new Error("missing-key"));
  }
  if (window.google?.maps) {
    return ensurePlaces(window.google);
  }
  if (mapsPromise) return mapsPromise;

  mapsPromise = new Promise<GoogleMapsHost>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-kn-google-maps="1"]',
    );
    if (existing) {
      existing.addEventListener("load", () => {
        if (window.google?.maps) resolve(ensurePlaces(window.google));
        else reject(new Error("Google Maps failed to load"));
      });
      existing.addEventListener("error", () =>
        reject(new Error("Google Maps script error")),
      );
      return;
    }

    window.__knMapsInit = () => {
      if (window.google?.maps) resolve(ensurePlaces(window.google));
      else reject(new Error("Google Maps unavailable"));
    };

    const script = document.createElement("script");
    script.dataset.knGoogleMaps = "1";
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&callback=__knMapsInit`;
    script.onerror = () => reject(new Error("Google Maps script error"));
    document.head.appendChild(script);
  }).catch((err) => {
    mapsPromise = null;
    throw err;
  });

  return mapsPromise;
}

async function ensurePlaces(google: GoogleMapsHost): Promise<GoogleMapsHost> {
  if (google.maps.places?.Autocomplete) return google;
  if (typeof google.maps.importLibrary === "function") {
    await google.maps.importLibrary("places");
  }
  return google;
}

export type PlacesAutocompleteInstance = {
  addListener: (event: string, fn: () => void) => void;
  getPlace: () => {
    formatted_address?: string;
    name?: string;
    address_components?: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
    geometry?: {
      location?: { lat: () => number; lng: () => number };
    };
  };
};

export async function attachPlacesAutocomplete(
  input: HTMLInputElement,
  apiKey: string,
  options?: Record<string, unknown>,
): Promise<PlacesAutocompleteInstance | null> {
  const google = await loadGoogleMaps(apiKey);
  const Autocomplete = google.maps.places?.Autocomplete;
  if (!Autocomplete) return null;

  return new Autocomplete(input, {
    fields: ["formatted_address", "name", "geometry", "address_components"],
    types: ["geocode"],
    ...options,
  });
}
