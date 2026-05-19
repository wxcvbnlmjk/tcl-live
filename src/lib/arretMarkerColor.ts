import type { TclPassage } from "../types/data";
import { parseDelaiSortKey } from "./groupPassagesByLine";

export interface MarkerColors {
  fill: string;
  border: string;
  text: string;
}

const DEFAULT_MARKER: MarkerColors = {
  fill: "#2563eb",
  border: "#1e3a5f",
  text: "#ffffff",
};

const RED = "#dc2626";
const LIGHT_ORANGE = "#fdba74";
const YELLOW = "#eab308";
const GREEN = "#22c55e";
const BLUE = "#3b82f6";
const VIOLET = "#7c3aed";

function parseDateMs(value: string): number {
  return new Date(value.trim().replace(" ", "T")).getTime();
}

function diffMinutes(heurepassage: string, lastUpdateFme: string): number {
  return (parseDateMs(heurepassage) - parseDateMs(lastUpdateFme)) / 60_000;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b]
    .map((c) => Math.round(clamp(c, 0, 255)).toString(16).padStart(2, "0"))
    .join("")}`;
}

function lerpColor(from: string, to: string, t: number): string {
  const [r1, g1, b1] = hexToRgb(from);
  const [r2, g2, b2] = hexToRgb(to);
  const ratio = clamp(t, 0, 1);
  return rgbToHex(
    r1 + (r2 - r1) * ratio,
    g1 + (g2 - g1) * ratio,
    b1 + (b2 - b1) * ratio,
  );
}

function gradientThree(
  start: string,
  mid: string,
  end: string,
  t: number,
): string {
  const ratio = clamp(t, 0, 1);
  if (ratio <= 0.5) return lerpColor(start, mid, ratio * 2);
  return lerpColor(mid, end, (ratio - 0.5) * 2);
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastTextColor(fill: string): string {
  return relativeLuminance(fill) > 0.5 ? "#0f172a" : "#ffffff";
}

function darkenBorder(fill: string): string {
  const [r, g, b] = hexToRgb(fill);
  return rgbToHex(r * 0.72, g * 0.72, b * 0.72);
}

function withContrast(fill: string): MarkerColors {
  return {
    fill,
    border: darkenBorder(fill),
    text: contrastTextColor(fill),
  };
}

function getReferencePassage(passages: TclPassage[]): TclPassage {
  return passages.reduce((closest, passage) =>
    parseDelaiSortKey(passage.delaipassage) <
    parseDelaiSortKey(closest.delaipassage)
      ? passage
      : closest,
  );
}

function colorsFromPassage(passage: TclPassage): MarkerColors {
  if (passage.delaipassage.trim().toLowerCase() === "proche") {
    return withContrast(RED);
  }

  const diff = diffMinutes(passage.heurepassage, passage.last_update_fme);

  if (Number.isNaN(diff)) {
    return DEFAULT_MARKER;
  }

  if (diff < 5) {
    const t = clamp((diff - 1) / 4, 0, 1);
    return withContrast(lerpColor(RED, LIGHT_ORANGE, t));
  }

  if (diff < 40) {
    const t = clamp((diff - 5) / 35, 0, 1);
    return withContrast(gradientThree(YELLOW, GREEN, BLUE, t));
  }

  return withContrast(VIOLET);
}

/** Couleurs selon le passage le plus proche ; null pour le style par défaut (ex. « + »). */
export function getArretMarkerColors(
  passages: TclPassage[] 

): MarkerColors | null {



  return colorsFromPassage(getReferencePassage(passages));
}
