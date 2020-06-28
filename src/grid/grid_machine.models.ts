export interface GridCell{
    index: number;
    x: number;
    y: number;
    cx?: number;
    cy?: number;
    value: number;
}

export interface Domain{
    min: number;
    max: number;
}
