// interface funct_property { (): void }
export interface WolframParams {
    base: number;
    kernel: string;
    grid: {width:number, height: number};
    init_row: {
        mode: string;
        group_size: number;
    }
}