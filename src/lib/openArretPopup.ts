import L from "leaflet";
import type { Arret, TclPassage } from "../types/data";
import { buildArretPopupContent } from "./arretPopup";

const POPUP_OPTIONS: L.PopupOptions = {
  maxWidth: 320,
  autoClose: true,
  closeOnClick: false,
};

export type ArretMarker = L.Marker & { arretId: number };

export function openArretPopup(
  marker: ArretMarker,
  arret: Arret,
  passages: TclPassage[],
  arretsById: Map<number, Arret>,
): void {
  const content = buildArretPopupContent(arret, passages, arretsById);

  if (!marker.getPopup()) {
    marker.bindPopup(content, POPUP_OPTIONS);
  } else {
    marker.setPopupContent(content);
  }

  if (!marker.isPopupOpen()) {
    marker.openPopup();

  } else {
    marker.getPopup()?.update();
  }

}

export function refreshOpenArretPopups(
  group: L.FeatureGroup,
  arretsById: Map<number, Arret>,
  passagesByArretId: Map<number, TclPassage[]>,
): void {
  group.eachLayer((layer) => {
    if (!(layer instanceof L.Marker) || !layer.isPopupOpen()) return;

    const marker = layer as ArretMarker;
    const arret = arretsById.get(marker.arretId);
    if (!arret) return;

    const passages = passagesByArretId.get(marker.arretId) ?? [];
    marker.setPopupContent(
      buildArretPopupContent(arret, passages, arretsById),
    );
    marker.getPopup()?.update();
  });
}
