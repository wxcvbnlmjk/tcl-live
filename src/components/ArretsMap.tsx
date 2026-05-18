import { useCallback, useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { Arret, TclPassage } from "../types/data";
import { getArretMarkerColors } from "../lib/arretMarkerColor";
import { createArretDivIcon } from "../lib/arretMarkerIcon";
import { getArretMarkerLabel } from "../lib/arretMarkerLabel";
import {
  clearActiveArretPopup,
  openArretPopup,
  refreshArretPopup,
  type ArretMarker,
} from "../lib/openArretPopup";
import "leaflet/dist/leaflet.css";
import "./ArretsMap.css";

const LYON_CENTER: L.LatLngExpression = [45.764, 4.835];
const DEFAULT_ZOOM = 12;
/** Niveau OSM où les noms de rues deviennent lisibles en ville (tuiles standard). */
const MIN_ZOOM_ARRETS = 12;

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
  const openArretIdRef = useRef<number | null>(null);
  const arretsRef = useRef(arrets);
  arretsRef.current = arrets;

  const openPopupForMarker = useCallback(
    (marker: ArretMarker) => {
      const arret = arretsByIdRef.current.get(marker.arretId);
      if (!arret) return;

      openArretIdRef.current = marker.arretId;
      const passages = passagesRef.current.get(marker.arretId) ?? [];
      openArretPopup(marker, arret, passages, arretsByIdRef.current, map);
    },
    [map],
  );

  const buildMarkerGroup = useCallback(() => {
    const group = L.featureGroup();
    const zoom = map.getZoom();

    for (const arret of arretsRef.current) {
      if (arret.lat == null || arret.lon == null) continue;

      const passages = passagesRef.current.get(arret.id) ?? [];
      const label = getArretMarkerLabel(passages);
      if (label === null) continue;

      const colors = getArretMarkerColors(passages, label);

      const marker = L.marker([arret.lat, arret.lon], {
        icon: createArretDivIcon(label, zoom, colors),
      }) as ArretMarker;

      marker.arretId = arret.id;

      marker.on("click", (event) => {
        L.DomEvent.stopPropagation(event);
        openPopupForMarker(marker);
      });

      group.addLayer(marker);
    }

    return group;
  }, [map, openPopupForMarker]);

  const updateMarkersIcons = useCallback(
    (group: L.FeatureGroup) => {
      const zoom = map.getZoom();
      group.eachLayer((layer) => {
        if (!(layer instanceof L.Marker)) return;
        const marker = layer as ArretMarker;
        const passages = passagesRef.current.get(marker.arretId) ?? [];
        const label = getArretMarkerLabel(passages);
        if (label === null) return;
        const colors = getArretMarkerColors(passages, label);
        marker.setIcon(createArretDivIcon(label, zoom, colors));
      });
    },
    [map],
  );

  const syncMarkersVisibility = useCallback(() => {
    const zoom = map.getZoom();
    const shouldShow = zoom >= MIN_ZOOM_ARRETS;

    if (!shouldShow) {
      if (groupRef.current) {
        map.removeLayer(groupRef.current);
        groupRef.current = null;
      }
      return;
    }

    if (!groupRef.current) {
      groupRef.current = buildMarkerGroup();
    } else {
      updateMarkersIcons(groupRef.current);
    }

    if (!map.hasLayer(groupRef.current)) {
      groupRef.current.addTo(map);
    }
  }, [map, buildMarkerGroup, updateMarkersIcons]);

  const rebuildMarkers = useCallback(() => {
    if (groupRef.current) {
      map.removeLayer(groupRef.current);
      groupRef.current = null;
    }
    syncMarkersVisibility();
  }, [map, syncMarkersVisibility]);

  useEffect(() => {
    rebuildMarkers();
    return () => {
      if (groupRef.current) {
        map.removeLayer(groupRef.current);
        groupRef.current = null;
      }
    };
  }, [arrets, map, rebuildMarkers]);

  useEffect(() => {
    if (groupRef.current) {
      map.removeLayer(groupRef.current);
      groupRef.current = null;
    }

    if (openArretIdRef.current != null) {
      const passages =
        passagesRef.current.get(openArretIdRef.current) ?? [];
      if (getArretMarkerLabel(passages) === null) {
        map.closePopup();
        clearActiveArretPopup();
        openArretIdRef.current = null;
      }
    }

    syncMarkersVisibility();

    if (openArretIdRef.current != null) {
      refreshArretPopup(
        openArretIdRef.current,
        arretsByIdRef.current,
        passagesRef.current,
      );
    }
  }, [passagesByArretId, map, syncMarkersVisibility]);

  useEffect(() => {
    const onPopupClose = () => {
      openArretIdRef.current = null;
      clearActiveArretPopup();
    };

    map.on("zoomend", syncMarkersVisibility);
    map.on("popupclose", onPopupClose);
    syncMarkersVisibility();

    return () => {
      map.off("zoomend", syncMarkersVisibility);
      map.off("popupclose", onPopupClose);
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
        className="arrets-map-badge github-badge"
        style={{ paddingRight: "160px" }}
        href="https://github.com/wxcvbnlmjk/tcl-live"
        target="_blank"
        rel="noreferrer"
      >
        <img
          alt="github tcl-live"
          src="https://img.shields.io/badge/github-tcl%20live-blue?logo=github"
        />
      </a>

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
