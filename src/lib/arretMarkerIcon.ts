import L from "leaflet";
import type { MarkerColors } from "./arretMarkerColor";

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const REFERENCE_ZOOM = 11;
const BASE_SIZE = 15;
const MIN_MARKER_SIZE = 12;
const MAX_MARKER_SIZE = 27;

export function markerSizeForZoom(zoom: number): number {
  const size = BASE_SIZE * (zoom / REFERENCE_ZOOM);
  return Math.min(MAX_MARKER_SIZE, Math.max(MIN_MARKER_SIZE, Math.round(size)));
}

export function createArretDivIcon(
  label: string,
  zoom: number,
  colors: MarkerColors | null = null,
): L.DivIcon {
  const size = markerSizeForZoom(zoom);
  const fontSize =
    label === "+" ? Math.round(size * 0.55) : Math.round(size * 0.38);
  const text = escapeHtml(label);

  const colorStyle = colors
    ? `background:${colors.fill};border-color:${colors.border};color:${colors.text};`
    : "";

  const textShadow =
    colors && colors.text === "#ffffff"
      ? "text-shadow:0 0 2px rgba(15,23,42,0.85);"
      : colors
        ? "text-shadow:0 0 2px rgba(255,255,255,0.9);"
        : "";

  const html = `<div class="arret-marker${colors ? " arret-marker--timed" : ""}" style="width:${size}px;height:${size}px;font-size:${fontSize}px;${colorStyle}${textShadow}"><span>${text}</span></div>`;

  return L.divIcon({
    className: "arret-marker-icon",
    html,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}
