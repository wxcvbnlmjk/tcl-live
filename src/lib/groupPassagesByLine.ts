import type { TclPassage } from "../types/data";

export interface PassageLineGroup {
  ligne: string;
  idtarretdestination: number;
  delais: string[];
}

/** Clé de tri croissante pour delaipassage (ex. « Proche », « 2 min », « 20h53 »). */
export function parseDelaiSortKey(delai: string): number {
  const value = delai.trim();
  if (value === "Proche") return 0;

  const minMatch = value.match(/^(\d+)\s*min$/i);
  if (minMatch) return Number(minMatch[1]);

  const hourMatch = value.match(/^(\d+)h(\d+)$/i);
  if (hourMatch) {
    return 10_000 + Number(hourMatch[1]) * 60 + Number(hourMatch[2]);
  }

  return 99_999;
}

export function groupPassagesByLine(
  passages: TclPassage[],
): PassageLineGroup[] {
  const groups = new Map<
    string,
    { ligne: string; idtarretdestination: number; delais: Set<string> }
  >();

  for (const passage of passages) {
    const key = `${passage.ligne}|${passage.idtarretdestination}`;
    let group = groups.get(key);
    if (!group) {
      group = {
        ligne: passage.ligne,
        idtarretdestination: passage.idtarretdestination,
        delais: new Set(),
      };
      groups.set(key, group);
    }
    group.delais.add(passage.delaipassage);
  }

  return [...groups.values()]
    .map((group) => ({
      ligne: group.ligne,
      idtarretdestination: group.idtarretdestination,
      delais: [...group.delais].sort(
        (a, b) => parseDelaiSortKey(a) - parseDelaiSortKey(b),
      ),
    }))
    .sort(
      (a, b) =>
        a.ligne.localeCompare(b.ligne, "fr", { numeric: true }) ||
        a.idtarretdestination - b.idtarretdestination,
    );
}
