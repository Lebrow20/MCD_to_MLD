import type { MldModel } from "@mcd-to-mld/shared";

export function MldViewer({ mld }: { mld: MldModel }) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      {mld.warnings.length > 0 && (
        <div style={{ border: "1px solid #f0c36d", padding: 12, background: "#fff7e6" }}>
          <strong>Warnings</strong>
          <ul>
            {mld.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      {mld.tables.map((t) => (
        <div key={t.name} style={{ border: "1px solid #ddd", padding: 12 }}>
          <h3 style={{ margin: 0 }}>{t.name}</h3>

          <div style={{ marginTop: 8 }}>
            <strong>Colonnes</strong>
            <table style={{ width: "100%", marginTop: 8, borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">Nom</th>
                  <th align="left">Type</th>
                  <th align="left">Nullable</th>
                </tr>
              </thead>
              <tbody>
                {t.columns.map((c) => (
                  <tr key={c.name}>
                    <td style={{ borderTop: "1px solid #eee", padding: 6 }}>{c.name}</td>
                    <td style={{ borderTop: "1px solid #eee", padding: 6 }}>{c.type}</td>
                    <td style={{ borderTop: "1px solid #eee", padding: 6 }}>{c.nullable ? "YES" : "NO"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 8 }}><strong>PK:</strong> {t.primaryKey.join(", ")}</div>

          {t.unique.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <strong>UNIQUE:</strong>
              <ul>
                {t.unique.map((u, i) => <li key={i}>({u.join(", ")})</li>)}
              </ul>
            </div>
          )}

          {t.foreignKeys.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <strong>FK:</strong>
              <ul>
                {t.foreignKeys.map((fk, i) => (
                  <li key={i}>
                    ({fk.columns.join(", ")}) → {fk.references.table}({fk.references.columns.join(", ")})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}