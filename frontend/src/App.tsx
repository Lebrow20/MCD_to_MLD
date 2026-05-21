import { useState } from "react";
import type { McdModel, MldModel } from "@mcd-to-mld/shared";
import { generateMld } from "./api/mld";
import { MldViewer } from "./components/MldViewer";

const demoMcd: McdModel = {
  entities: [
    {
      id: "E_USER",
      name: "Utilisateur",
      attributes: [
        { name: "id", type: "uuid", isPrimaryKey: true },
        { name: "email", type: "varchar", isUnique: true, isNullable: false }
      ]
    },
    {
      id: "E_ORDER",
      name: "Commande",
      attributes: [
        { name: "id", type: "uuid", isPrimaryKey: true },
        { name: "date_commande", type: "timestamp", isNullable: false }
      ]
    }
  ],
  relationships: [
    {
      id: "R_PASSE",
      name: "passe",
      ends: [
        { entityId: "E_USER", min: 0, max: "n" },
        { entityId: "E_ORDER", min: 1, max: 1 }
      ],
      attributes: []
    }
  ]
};

export function App() {
  const [mcd] = useState<McdModel>(demoMcd);
  const [mld, setMld] = useState<MldModel | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onGenerate() {
    setError(null);
    try {
      const result = await generateMld(mcd);
      setMld(result);
    } catch (e) {
      setMld(null);
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    }
  }

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, Arial" }}>
      <h2>MCD → MLD (V1)</h2>

      <p>
        V1 utilise un MCD de démonstration (le prochain step sera l’éditeur React Flow).
      </p>

      <button onClick={onGenerate}>Générer MLD</button>

      {error && <p style={{ color: "crimson" }}>{error}</p>}

      {mld && (
        <div style={{ marginTop: 16 }}>
          <MldViewer mld={mld} />
        </div>
      )}
    </div>
  );
}