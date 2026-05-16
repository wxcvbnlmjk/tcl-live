import type { TclPassage } from "../types/data";

export function indexPassagesByArretId(
  passages: TclPassage[],
): Map<number, TclPassage[]> {
  const byArret = new Map<number, TclPassage[]>();

  for (const passage of passages) {
    const list = byArret.get(passage.id);
    if (list) {
      list.push(passage);
    } else {
      byArret.set(passage.id, [passage]);
    }
  }

  return byArret;
}
