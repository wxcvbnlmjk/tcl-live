import { useEffect, useMemo, useState } from "react";
import { fetchArrets, fetchTclPassages } from "./api/data";
import { ArretsMap } from "./components/ArretsMap";
import { indexArretsById } from "./lib/arretsById";
import { indexPassagesByArretId } from "./lib/passagesByArret";
import type { Arret, TclPassage } from "./types/data";
import "./App.css";

function App() {
  const [arrets, setArrets] = useState<Arret[]>([]);
  const [passagesByArretId, setPassagesByArretId] = useState<
    Map<number, TclPassage[]>
  >(() => new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const arretsById = useMemo(() => indexArretsById(arrets), [arrets]);

  useEffect(() => {
    void loadArrets();
    void loadPassages();
    const interval = setInterval(() => void loadPassages(), 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadArrets() {
    try {
      setLoading(true);
      setArrets(await fetchArrets());
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function loadPassages() {
    try {
      const passages = await fetchTclPassages();
      setPassagesByArretId(indexPassagesByArretId(passages));
      setError(null);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (loading && arrets.length === 0) {
    return <div className="app-status">Chargement de la carte…</div>;
  }

  if (error && arrets.length === 0) {
    return <div className="app-status">Erreur : {error}</div>;
  }

  return (
    <div className="app">
      {error && <div className="app-banner">Erreur : {error}</div>}
      <ArretsMap
        arrets={arrets}
        arretsById={arretsById}
        passagesByArretId={passagesByArretId}
      />
    </div>
  );
}

export default App;
