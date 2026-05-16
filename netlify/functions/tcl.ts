import type { Handler, HandlerEvent } from "@netlify/functions";
import { TCL_GRANDLYON_URL } from "../../shared/tclApi";

function getCredentials(): { login: string; password: string } {
  if (process.env.TCL_USE_DEMO === "true") {
    return { login: "demo", password: "demo4dev" };
  }
  return {
    login: process.env.TCL_LOGIN ?? "",
    password: process.env.TCL_PASSWORD ?? "",
  };
}

export const handler: Handler = async (_event: HandlerEvent) => {
  const { login, password } = getCredentials();

  if (!login || !password) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error:
          "Identifiants manquants. Définissez TCL_LOGIN et TCL_PASSWORD (ou TCL_USE_DEMO=true) dans les variables d'environnement Netlify.",
      }),
    };
  }

  const authorization = `Basic ${Buffer.from(`${login}:${password}`, "utf8").toString("base64")}`;

  try {
    const response = await fetch(TCL_GRANDLYON_URL, {
      headers: {
        Authorization: authorization,
        Accept: "application/json",
      },
    });

    const body = await response.text();

    return {
      statusCode: response.status,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=30",
      },
      body,
    };
  } catch (error) {
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Impossible de joindre l'API Grand Lyon.",
        detail: error instanceof Error ? error.message : String(error),
      }),
    };
  }
};
