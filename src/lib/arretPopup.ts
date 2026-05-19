import type { Arret, TclPassage } from "../types/data";
import { groupPassagesByLine } from "./groupPassagesByLine";

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDateTime(value: string): string {
  const normalized = value.trim().replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function destinationLabel(
  idtarretdestination: number,
  arretsById: Map<number, Arret>,
): string {
  const destination = arretsById.get(idtarretdestination);
  return destination?.nom ?? `Arrêt ${idtarretdestination}`;
}

function latestUpdate(passages: TclPassage[]): string | null {
  if (passages.length === 0) return null;

  return passages.reduce((latest, passage) => {
    const latestTime = new Date(latest.replace(" ", "T")).getTime();
    const passageTime = new Date(
      passage.last_update_fme.replace(" ", "T"),
    ).getTime();
    return passageTime > latestTime ? passage.last_update_fme : latest;
  }, passages[0].last_update_fme);
}

export function buildArretPopupContent(
  arret: Arret,
  passages: TclPassage[],
  arretsById: Map<number, Arret>,
): string {
  const lineGroups = groupPassagesByLine(passages);
  const lastUpdate = latestUpdate(passages);
  const lastUpdateHtml = lastUpdate
    ? `<p class="arret-popup-maj"><strong>Màj. données</strong> ${escapeHtml(formatDateTime(lastUpdate))}</p>`
    : "";

  const rows = lineGroups.length
    ? lineGroups
        .map((group) => {
          const dest = escapeHtml(
            destinationLabel(group.idtarretdestination, arretsById),
          );
          const delai = escapeHtml(group.passage.delaipassage);
          const heure = escapeHtml(formatDateTime(group.passage.heurepassage));
          return `<li>
            <strong>Ligne ${escapeHtml(group.ligne)}</strong>
            <span class="arret-popup-dest">→ ${dest}</span>
            <div class="arret-popup-delais">
              <div class="arret-popup-delai-row">
                <strong>${delai}</strong>
                <span>Passage : ${heure}</span>
              </div>

            </div>
          </li>`;
        })
        .join("")
    : "<li>Aucun passage en temps réel</li>";

  return `
    <div class="arret-popup">
      <p><strong>Arrêt</strong> ${escapeHtml(arret.nom)}</p>
      ${lastUpdateHtml}
      <ul>${rows}</ul>
        <div>
          <span class="arret-popup-span" style="font-weight: bold"></span><span class="arret-popup-span" style="color: red">Proche</span>
          <span class="arret-popup-span" style="color: red">🚌1mn</span><span class="arret-popup-span" style="color: orange"> 🚌5min</span>
          <span class="arret-popup-span" style="color: green">🚌6mn</span><span class="arret-popup-span" style="color: blue"> 🚌40min</span>
          <span class="arret-popup-span" style="color: purple">🚌41min</span>
        </div>      
    </div>
  `;
}
