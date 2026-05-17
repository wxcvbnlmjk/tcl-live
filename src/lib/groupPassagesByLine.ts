import type { TclPassage } from "../types/data";

export interface PassageDelaiEntry {
  delaipassage: string;
  heurepassage: string;
}

export interface PassageLineGroup {
  ligne: string;
  idtarretdestination: number;
  passage: PassageDelaiEntry;
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
    {
      ligne: string;
      idtarretdestination: number;
      passage: PassageDelaiEntry;
      sortKey: number;
    }
  >();

  for (const passage of passages) {
    const key = passage.ligne;
    const sortKey = parseDelaiSortKey(passage.delaipassage);
    const existing = groups.get(key);

    if (!existing || sortKey < existing.sortKey) {
      groups.set(key, {
        ligne: passage.ligne,
        idtarretdestination: passage.idtarretdestination,
        sortKey,
        passage: {
          delaipassage: passage.delaipassage,
          heurepassage: passage.heurepassage,
        },
      });
    }
  }

  return [...groups.values()]
    .map(({ ligne, idtarretdestination, passage }) => ({
      ligne,
      idtarretdestination,
      passage,
    }))
    .sort((a, b) =>
      a.ligne.localeCompare(b.ligne, "fr", { numeric: true }),
    );
}
