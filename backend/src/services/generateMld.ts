import type { McdModel, McdRelationship, MldModel, MldTable } from "@mcd-to-mld/shared";
import { toSnakeCase } from "../utils/naming.js";

function getPk(entity: {
  name: string;
  attributes: { name: string; isPrimaryKey?: boolean; type: string; isNullable?: boolean }[];
}) {
  const pk = entity.attributes.filter((a) => a.isPrimaryKey);
  if (pk.length === 0) throw new Error(`Entity ${entity.name} has no primary key.`);
  return pk;
}

export function generateMld(mcd: McdModel): MldModel {
  const warnings: string[] = [];

  const entitiesById = new Map(mcd.entities.map((e) => [e.id, e]));

  const tables: MldTable[] = mcd.entities.map((e) => {
    const tableName = toSnakeCase(e.name);

    const columns = e.attributes.map((a) => ({
      name: toSnakeCase(a.name),
      type: a.type,
      nullable: a.isPrimaryKey ? false : (a.isNullable ?? true)
    }));

    const pk = getPk(e).map((a) => toSnakeCase(a.name));

    const unique: string[][] = [];
    for (const a of e.attributes) {
      if (a.isUnique) unique.push([toSnakeCase(a.name)]);
    }

    return {
      name: tableName,
      columns,
      primaryKey: pk,
      unique,
      foreignKeys: []
    };
  });

  const tableByEntityId = new Map<string, MldTable>();
  for (const e of mcd.entities) {
    const t = tables.find((tt) => tt.name === toSnakeCase(e.name))!;
    tableByEntityId.set(e.id, t);
  }

  for (const rel of mcd.relationships) {
    applyRelationship(rel, entitiesById, tableByEntityId, tables, warnings);
  }

  return { tables, warnings };
}

function applyRelationship(
  rel: McdRelationship,
  entitiesById: Map<string, McdModel["entities"][number]>,
  tableByEntityId: Map<string, MldTable>,
  tables: MldTable[],
  warnings: string[]
) {
  const [aEnd, bEnd] = rel.ends;
  const aEntity = entitiesById.get(aEnd.entityId)!;
  const bEntity = entitiesById.get(bEnd.entityId)!;

  const aTable = tableByEntityId.get(aEnd.entityId)!;
  const bTable = tableByEntityId.get(bEnd.entityId)!;

  // N-N
  if (aEnd.max === "n" && bEnd.max === "n") {
    const joinName = `${aTable.name}_${bTable.name}`;
    const aPk = getPk(aEntity)[0];
    const bPk = getPk(bEntity)[0];

    const aFkCol = `${aTable.name}_id`;
    const bFkCol = `${bTable.name}_id`;

    const joinTable: MldTable = {
      name: joinName,
      columns: [
        { name: aFkCol, type: aPk.type, nullable: false },
        { name: bFkCol, type: bPk.type, nullable: false },
        ...rel.attributes.map((att) => ({
          name: toSnakeCase(att.name),
          type: att.type,
          nullable: att.isNullable ?? true
        }))
      ],
      primaryKey: [aFkCol, bFkCol],
      unique: [],
      foreignKeys: [
        { columns: [aFkCol], references: { table: aTable.name, columns: [toSnakeCase(aPk.name)] } },
        { columns: [bFkCol], references: { table: bTable.name, columns: [toSnakeCase(bPk.name)] } }
      ]
    };

    if (aEnd.min === 1 || bEnd.min === 1) {
      warnings.push(
        `Relationship "${rel.name}" is N-N with min=1 participation; enforcing it may require additional constraints (not generated in V1).`
      );
    }

    tables.push(joinTable);
    return;
  }

  // 1-N : FK sur le côté N
  if (aEnd.max === "n" && bEnd.max !== "n") {
    addFk(bEnd, aEnd);
    return;
  }
  if (aEnd.max !== "n" && bEnd.max === "n") {
    addFk(aEnd, bEnd);
    return;
  }

  // 1-1
  const chooseFkOnA = aEnd.min === 1 && bEnd.min === 0;
  const fkOwnerEnd = chooseFkOnA ? aEnd : bEnd;
  const referencedEnd = chooseFkOnA ? bEnd : aEnd;

  const fkOwnerTable = tableByEntityId.get(fkOwnerEnd.entityId)!;
  const referencedEntity = entitiesById.get(referencedEnd.entityId)!;
  const referencedTable = tableByEntityId.get(referencedEnd.entityId)!;

  const refPk = getPk(referencedEntity)[0];
  const fkColName = `${referencedTable.name}_id`;

  fkOwnerTable.columns.push({
    name: fkColName,
    type: refPk.type,
    nullable: fkOwnerEnd.min === 0
  });

  fkOwnerTable.foreignKeys.push({
    columns: [fkColName],
    references: { table: referencedTable.name, columns: [toSnakeCase(refPk.name)] }
  });

  fkOwnerTable.unique.push([fkColName]);

  function addFk(fromOneEnd: typeof aEnd, toManyEnd: typeof aEnd) {
    const oneEntity = entitiesById.get(fromOneEnd.entityId)!;
    const oneTable = tableByEntityId.get(fromOneEnd.entityId)!;
    const manyTable = tableByEntityId.get(toManyEnd.entityId)!;

    const onePk = getPk(oneEntity)[0];
    const fkColName = `${oneTable.name}_id`;

    manyTable.columns.push({
      name: fkColName,
      type: onePk.type,
      nullable: toManyEnd.min === 0
    });

    manyTable.foreignKeys.push({
      columns: [fkColName],
      references: { table: oneTable.name, columns: [toSnakeCase(onePk.name)] }
    });
  }
}
