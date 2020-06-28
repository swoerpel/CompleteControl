// interface funct_property { (): void }
export interface Kernel {
    kernel: number[][];
    offsets: {x:number,y:number}[];
    dims: {x:number,y:number};
    length: number;
}