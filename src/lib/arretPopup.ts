import type { Arret, TclPassage } from "../types/data";
import { groupPassagesByLine } from "./groupPassagesByLine";

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function destinationLabel(
  idtarretdestination: number,
  arretsById: Map<number, Arret>,
): string {
  const destination = arretsById.get(idtarretdestination);
  return destination?.nom ?? `Arrêt ${idtarretdestination}`;
}

export function buildArretPopupContent(
  arret: Arret,
  passages: TclPassage[],
  arretsById: Map<number, Arret>,
): string {
  const lineGroups = groupPassagesByLine(passages);

  const rows = lineGroups.length
    ? lineGroups
        .map((group) => {
          const dest = escapeHtml(
            destinationLabel(group.idtarretdestination, arretsById),
          );
          const delais = group.delais.map(escapeHtml).join(" · ");
          return `<li>
            <strong>Ligne ${escapeHtml(group.ligne)}</strong>
            <span class="arret-popup-dest">→ ${dest}</span>
            <span class="arret-popup-delais">${delais}</span>
          </li>`;
        })
        .join("")
    : "<li>Aucun passage en temps réel</li>";

  return `
    <div class="arret-popup">
      <p><strong>Arrêt</strong> ${escapeHtml(arret.nom)}</p>
      <ul>${rows}</ul>
    </div>
  `;
}
