import L from "leaflet";
import type { MarkerColors } from "./arretMarkerColor";

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

const REFERENCE_ZOOM = 30;
const BASE_SIZE = 30;
const MIN_MARKER_SIZE = 6;
const MAX_MARKER_SIZE = 27;

export function markerSizeForZoom(zoom: number): number {
  const size = BASE_SIZE * ((zoom + 1) / (REFERENCE_ZOOM + 1));

  switch (zoom) {
    case 12: 
    return 6;  
    case 13:
    return 9;    
    case 14:
    return 14;    
    case 15:
    return 20;      
    case 16:
    return 22;    
    case 17:
    return 24;
    case 18:
    return 26; 
  }

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
  if (zoom < 15) {
    label = "";
  }
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
