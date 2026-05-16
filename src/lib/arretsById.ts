import type { Arret } from "../types/data";

export function indexArretsById(arrets: Arret[]): Map<number, Arret> {
  const byId = new Map<number, Arret>();
  for (const arret of arrets) {
    byId.set(arret.id, arret);
  }
  return byId;
}
