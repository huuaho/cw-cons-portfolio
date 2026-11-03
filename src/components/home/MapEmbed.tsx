"use client";

// Click-to-load map (was the template's map.js): nothing loads from Google until asked.
import { useState } from "react";

export default function MapEmbed({ address }: { address: string }) {
  const [loaded, setLoaded] = useState(false);
  const q = encodeURIComponent(address);

  return (
    <div className={`kit-map${loaded ? " is-loaded" : ""}`}>
      {loaded ? (
        <iframe
          className="kit-map__frame"
          src={`https://maps.google.com/maps?q=${q}&z=11&output=embed`}
          title={`Map: ${address}`}
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      ) : (
        <div className="kit-map__placeholder">
          <p className="kit-map__address">{address}</p>
          <div className="kit-map__actions">
            <button type="button" className="btn btn-black" onClick={() => setLoaded(true)}>
              Show map
            </button>
            <a href={`https://www.google.com/maps?q=${q}`}>Open in maps</a>
          </div>
        </div>
      )}
    </div>
  );
}
