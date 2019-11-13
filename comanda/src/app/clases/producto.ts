export class Producto {
    public cantidad: number;
    public descripcion: string;
    public fotos: Array<string>;
    public nombre: string;
    public precio: number;
    public quienPuedever: string;
    public tiempo: number;

    constructor() {
        this.cantidad = 0;
        this.descripcion = '';
        this.fotos = new Array<string>();
        this.nombre = '';
        this.precio = 0;
        this.quienPuedever = '';
        this.tiempo = 0;
    }
}

export interface ProductoKey {
    key: string;
    cantidad: number;
    descripcion: string;
    fotos: Array<string>;
    nombre: string;
    precio: number;
    quienPuedever: string;
    tiempo: number;
}
