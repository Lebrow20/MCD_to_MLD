export interface McdEntity {
    id: string
    name: string
    attributes: McdAttribute[]
}

export interface McdAttribute {
    id: string
    name: string
    type: string
    isKey: boolean
}

export interface MldTable {
    name: string
    columns: MldColumn[]
    primaryKeys: string[]
    foreignKeys: MldForeignKey[]
}

export interface MldColumn {
    name: string
    type: string
    nullable: boolean
}

export interface MldForeignKey {
    column: string
    referencedTable: string
    referencedColumn: string
}
