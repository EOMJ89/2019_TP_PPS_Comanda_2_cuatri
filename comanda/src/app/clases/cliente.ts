export class Cliente {
    public correo: string;
    public nombre: string;
    public apellido: string;
    public DNI: number;
    public foto: string;

    constructor() {
        this.correo = "";
        this.nombre = "";
        this.apellido = "";
        this.DNI = 0;
        this.foto = "";
    }
}

export interface ClienteKey {
    key: string;
    DNI: number;
    apellido: string;
    correo: string;
    foto: string;
    nombre: string;
}
