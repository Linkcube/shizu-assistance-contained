import { IColumnDefinition } from "./types";

// SQL composite type class, handles schema definition and simple boilerplate queries.

export class CompositeType {
  name: string;
  definitions: IColumnDefinition[];
  constructor(name: string, definitions: IColumnDefinition[]) {
    this.name = name;
    this.definitions = definitions;
  }

  public exists() {
    return `SELECT 1 FROM pg_type WHERE typname = '${this.name}';`;
  }

  public create_type() {
    return `CREATE TYPE ${this.name} AS (${this.definitions.map((def) => `${def.name} ${def.type}`).join(", ")});`;
  }
}

export const DJ_LINEUP_TYPE = new CompositeType("dj_lineup", [
  {
    name: "name",
    type: "TEXT",
  },
  {
    name: "is_live",
    type: "BOOLEAN",
  },
  {
    name: "vj",
    type: "TEXT",
  },
]);

export const ALL_COMPOSITE_TYPES = [DJ_LINEUP_TYPE];
