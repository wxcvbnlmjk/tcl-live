import L from "leaflet";
import type { Arret, TclPassage } from "../types/data";
import { buildArretPopupContent } from "./arretPopup";

const POPUP_OPTIONS: L.PopupOptions = {
  maxWidth: 320,
  autoClose: true,
  closeOnClick: true,
};

export type ArretMarker = L.Marker & { arretId: number };

let activePopup: L.Popup | null = null;

/** Ouvre la popup sur la carte (sans bindPopup sur le marker, plus fiable au re-clic). */
export function openArretPopup(
  marker: ArretMarker,
  arret: Arret,
  passages: TclPassage[],
  arretsById: Map<number, Arret>,
  map: L.Map,
): void {
  const content = buildArretPopupContent(arret, passages, arretsById);

  activePopup = L.popup(POPUP_OPTIONS)
    .setLatLng(marker.getLatLng())
    .setContent(content);

  activePopup.openOn(map);
}

export function refreshArretPopup(
  arretId: number,
  arretsById: Map<number, Arret>,
  passagesByArretId: Map<number, TclPassage[]>,
): void {
  if (!activePopup?.isOpen()) return;

  const arret = arretsById.get(arretId);
  if (!arret) return;

  const passages = passagesByArretId.get(arretId) ?? [];
  activePopup.setContent(buildArretPopupContent(arret, passages, arretsById));
  activePopup.update();
}

export function clearActiveArretPopup(): void {
  activePopup = null;
}
