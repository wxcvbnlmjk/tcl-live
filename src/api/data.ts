import { TCL_API_PATH } from "../../shared/tclApi";
import type { Arret, DataFile, TclPassage } from "../types/data";

export async function fetchArrets(): Promise<Arret[]> {
  const response = await fetch("/arrets.json");
  if (!response.ok) {
    throw new Error(`Erreur arrets.json: ${response.status}`);
  }
  const data = (await response.json()) as DataFile<Arret>;
  return data.values;
}

export async function fetchTclPassages(): Promise<TclPassage[]> {
  const response = await fetch(TCL_API_PATH, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        "Authentification refusée. Vérifiez TCL_LOGIN / TCL_PASSWORD (.env local ou variables Netlify), ou TCL_USE_DEMO=true.",
      );
    }
    throw new Error(`Erreur API TCL: ${response.status}`);
  }

  const data = (await response.json()) as DataFile<TclPassage>;
  return data.values;
}
