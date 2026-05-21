export type CardinalityMax = 1 | "n";
export type CardinalityMin = 0 | 1;

export type Cardinality = {
  min: CardinalityMin;
  max: CardinalityMax;
};

export type McdAttribute = {
  name: string;
  type: string; // V1: string libre, on contraindra plus tard si besoin
  isPrimaryKey?: boolean;
  isNullable?: boolean;
  isUnique?: boolean;
};

export type McdEntity = {
  id: string;
  name: string;
  attributes: McdAttribute[];
};

export type McdRelationshipEnd = {
  entityId: string;
} & Cardinality;

export type McdRelationship = {
  id: string;
  name: string;
  ends: [McdRelationshipEnd, McdRelationshipEnd];
  attributes: McdAttribute[];
};

export type McdModel = {
  entities: McdEntity[];
  relationships: McdRelationship[];
};