import type { TclPassage } from "../types/data";

/** Une ligne → son numéro ; plusieurs lignes → « + » ; aucun passage → null. */
export function getArretMarkerLabel(
  passages: TclPassage[],
): string | null {
  const lines = [...new Set(passages.map((p) => p.ligne))];
  if (lines.length === 0) return null;
  if (lines.length === 1) return lines[0];
  return "+";
}
