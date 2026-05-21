import type { McdModel } from "@mcd-to-mld/shared";

export function validateMcdOrThrow(mcd: McdModel) {
  if (!mcd || !Array.isArray(mcd.entities) || !Array.isArray(mcd.relationships)) {
    throw new Error("Invalid MCD payload.");
  }

  const entityIds = new Set(mcd.entities.map(e => e.id));
  for (const e of mcd.entities) {
    if (!e.id || !e.name) throw new Error("Entity must have id and name.");
    if (!Array.isArray(e.attributes)) throw new Error(`Entity ${e.name} attributes invalid.`);
  }

  for (const r of mcd.relationships) {
    if (!r.id || !r.name) throw new Error("Relationship must have id and name.");
    if (!Array.isArray(r.ends) || r.ends.length !== 2) throw new Error(`Relationship ${r.name} must have 2 ends.`);
    for (const end of r.ends) {
      if (!entityIds.has(end.entityId)) throw new Error(`Relationship ${r.name} references unknown entityId ${end.entityId}.`);
      // interdit "0" (0..0) en V1
      if (end.min === 0 && end.max === 1) continue;
      if (end.min === 0 && end.max === "n") continue;
      if (end.min === 1 && end.max === 1) continue;
      if (end.min === 1 && end.max === "n") continue;
      throw new Error(`Relationship ${r.name} has unsupported cardinality (min=${end.min}, max=${end.max}).`);
    }
  }
}