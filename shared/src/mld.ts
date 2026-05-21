export type MldColumn = {
  name: string;
  type: string;
  nullable: boolean;
};

export type MldForeignKey = {
  columns: string[];
  references: { table: string; columns: string[] };
};

export type MldTable = {
  name: string;
  columns: MldColumn[];
  primaryKey: string[];
  unique: string[][];
  foreignKeys: MldForeignKey[];
};

export type MldModel = {
  tables: MldTable[];
  warnings: string[];
};