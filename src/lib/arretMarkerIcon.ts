import L from "leaflet";

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const REFERENCE_ZOOM = 16;
const BASE_SIZE = 17;
const MIN_MARKER_SIZE = 12;
const MAX_MARKER_SIZE = 27;

export function markerSizeForZoom(zoom: number): number {
  const size = BASE_SIZE * (zoom / REFERENCE_ZOOM);
  return Math.min(MAX_MARKER_SIZE, Math.max(MIN_MARKER_SIZE, Math.round(size)));
}

export function createArretDivIcon(
  label: string | null,
  zoom: number,
): L.DivIcon {
  const size = markerSizeForZoom(zoom);
  const fontSize = label === "+" ? Math.round(size * 0.55) : Math.round(size * 0.45);
  const text = label ? escapeHtml(label) : "";

  const html = label
    ? `<div class="arret-marker" style="width:${size}px;height:${size}px;font-size:${fontSize}px"><span>${text}</span></div>`
    : `<div class="arret-marker arret-marker--empty" style="width:${size}px;height:${size}px"></div>`;

  return L.divIcon({
    className: "arret-marker-icon",
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}
