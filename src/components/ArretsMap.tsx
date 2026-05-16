import { useCallback, useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { Arret, TclPassage } from "../types/data";
import { buildArretPopupContent } from "../lib/arretPopup";
import "leaflet/dist/leaflet.css";
import "./ArretsMap.css";

const LYON_CENTER: L.LatLngExpression = [45.764, 4.835];
const DEFAULT_ZOOM = 12;
/** Niveau OSM où les noms de rues deviennent lisibles en ville (tuiles standard). */
const MIN_ZOOM_ARRETS = 16;

interface ArretsMarkersProps {
  arrets: Arret[];
  arretsById: Map<number, Arret>;
  passagesByArretId: Map<number, TclPassage[]>;
}

function ArretsMarkers({
  arrets,
  arretsById,
  passagesByArretId,
}: ArretsMarkersProps) {
  const map = useMap();
  const passagesRef = useRef(passagesByArretId);
  passagesRef.current = passagesByArretId;
  const arretsByIdRef = useRef(arretsById);
  arretsByIdRef.current = arretsById;
  const groupRef = useRef<L.FeatureGroup | null>(null);
  const arretsRef = useRef(arrets);
  arretsRef.current = arrets;

  const buildMarkerGroup = useCallback(() => {
    const group = L.featureGroup();

    for (const arret of arretsRef.current) {
      if (arret.lat == null || arret.lon == null) continue;

      const marker = L.circleMarker([arret.lat, arret.lon], {
        radius: 5,
        weight: 1,
        opacity: 0.9,
        fillOpacity: 0.85,
        color: "#1e3a5f",
        fillColor: "#2563eb",
      });

      marker.on("click", () => {
        const passages = passagesRef.current.get(arret.id) ?? [];
        marker
          .bindPopup(
            buildArretPopupContent(arret, passages, arretsByIdRef.current),
            { maxWidth: 320 },
          )
          .openPopup();
      });

      group.addLayer(marker);
    }

    return group;
  }, []);

  const syncMarkersVisibility = useCallback(() => {
    const zoom = map.getZoom();
    const shouldShow = zoom >= MIN_ZOOM_ARRETS;

    if (!shouldShow) {
      if (groupRef.current && map.hasLayer(groupRef.current)) {
        map.removeLayer(groupRef.current);
      }
      return;
    }

    if (!groupRef.current) {
      groupRef.current = buildMarkerGroup();
    }

    if (!map.hasLayer(groupRef.current)) {
      groupRef.current.addTo(map);
    }
  }, [map, buildMarkerGroup]);

  useEffect(() => {
    groupRef.current = null;
    syncMarkersVisibility();
  }, [arrets, syncMarkersVisibility]);

  useEffect(() => {
    map.on("zoomend", syncMarkersVisibility);
    syncMarkersVisibility();

    return () => {
      map.off("zoomend", syncMarkersVisibility);
      if (groupRef.current) {
        map.removeLayer(groupRef.current);
        groupRef.current = null;
      }
    };
  }, [map, syncMarkersVisibility]);

  return null;
}

interface ArretsMapProps {
  arrets: Arret[];
  arretsById: Map<number, Arret>;
  passagesByArretId: Map<number, TclPassage[]>;
}

export function ArretsMap({
  arrets,
  arretsById,
  passagesByArretId,
}: ArretsMapProps) {
  return (
    <div className="arrets-map-wrap">
      <a
        className="arrets-map-badge"
        href="https://data.grandlyon.com/"
        target="_blank"
        rel="noreferrer"
      >
        <img
          alt="Data Grand Lyon"
          src="https://img.shields.io/badge/Data_Grand_Lyon-tcl_live-blue"
        />
      </a>

      <MapContainer
      className="arrets-map"
      center={LYON_CENTER}
      zoom={DEFAULT_ZOOM}
      preferCanvas
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ArretsMarkers
        arrets={arrets}
        arretsById={arretsById}
        passagesByArretId={passagesByArretId}
      />
    </MapContainer>
 
    </div>
  );
}
