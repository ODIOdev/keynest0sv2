"use client";

import { useId, useMemo, useRef, useState } from "react";
import { formatAddress } from "@/lib/format";
import type { Property } from "@/lib/types";

/** Unique address / city suggestions from saved inventory only. */
export function locationSuggestionsFromProperties(properties: Property[]) {
  const set = new Set<string>();
  for (const property of properties) {
    const address = property.address?.trim();
    const city = property.city?.trim();
    const state = property.state?.trim();
    if (address) set.add(address);
    if (city) set.add(city);
    if (city && state) set.add(`${city}, ${state}`);
    set.add(formatAddress(property));
  }
  return [...set].sort((a, b) => a.localeCompare(b));
}

export function InventoryLocationInput({
  value,
  onChange,
  suggestions,
  placeholder = "Search saved addresses…",
}: {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const matches = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return suggestions.slice(0, 8);
    return suggestions
      .filter((item) => item.toLowerCase().includes(q))
      .slice(0, 8);
  }, [suggestions, value]);

  return (
    <div className="inventory-location" ref={rootRef}>
      <input
        type="search"
        value={value}
        autoComplete="off"
        placeholder={placeholder}
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={open && matches.length > 0}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          // Allow option click before closing
          window.setTimeout(() => setOpen(false), 120);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
      />
      {open && matches.length > 0 ? (
        <ul id={listId} className="inventory-location__list" role="listbox">
          {matches.map((item) => (
            <li key={item} role="option">
              <button
                type="button"
                className="inventory-location__option"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  onChange(item);
                  setOpen(false);
                }}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
