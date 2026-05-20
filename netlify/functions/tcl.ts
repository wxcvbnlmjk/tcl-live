import type { Handler, HandlerEvent } from "@netlify/functions";
import { TCL_GRANDLYON_URL } from "../../shared/tclApi";

export const handler: Handler = async (_event: HandlerEvent) => {
  console.log("[tcl] Fonction appelée");

  const login = process.env.TCL_LOGIN;
  const password = process.env.TCL_PASSWORD;

  console.log(`[tcl] TCL_LOGIN présent: ${!!login}`);
  console.log(`[tcl] TCL_PASSWORD présent: ${!!password}${password ? ` (${password.length} caractères)` : ""}`);

  if (!login || !password) {
    console.error("[tcl] ❌ Identifiants manquants dans les variables d'environnement");
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error:
          "Identifiants manquants. Définissez TCL_LOGIN et TCL_PASSWORD dans les variables d'environnement Netlify.",
      }),
    };
  }

  console.log(`[tcl] Login: ${login}`);
  // Afficher un aperçu du password pour vérification
  const passwordPreview = password.length > 0 
    ? `${password[0]}${'*'.repeat(Math.max(0, password.length - 2))}${password[password.length - 1]}`
    : "vide";
  console.log(`[tcl] Password aperçu: ${passwordPreview}`);
  const authorization = `Basic ${Buffer.from(`${login}:${password}`, "utf8").toString("base64")}`;
  console.log(`[tcl] Authorization header créé: Basic ${authorization.substring(6, 20)}...`);

  try {
    console.log(`[tcl] Appel API: ${TCL_GRANDLYON_URL}`);
    const response = await fetch(TCL_GRANDLYON_URL, {
      headers: {
        Authorization: authorization,
        Accept: "application/json",
      },
    });

    console.log(`[tcl] Statut réponse: ${response.status}`);

    const body = await response.text();

    if (!response.ok) {
      const preview = body.substring(0, 200);
      console.warn(`[tcl] ❌ Erreur ${response.status}: ${preview}`);
    } else {
      console.log(`[tcl] ✅ Succès - réponse reçue (${body.length} caractères)`);
    }

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=30",
      },
      body,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error(`[tcl] ❌ Exception: ${errorMsg}`);
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Impossible de joindre l'API Grand Lyon.",
        detail: errorMsg,
      }),
    };
  }
};
