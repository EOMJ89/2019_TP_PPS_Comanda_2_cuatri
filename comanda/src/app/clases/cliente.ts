export class Cliente {
    public correo: string;
    public nombre: string;
    public apellido: string;
    public DNI: number;
    public foto: string;
    public confirmado: boolean;

    constructor() {
        this.correo = "";
        this.nombre = "";
        this.apellido = "";
        this.DNI = 0;
        this.foto = "";
        this.confirmado = false;
    }
}

export interface ClienteKey {
    key: string;
    DNI: number;
    apellido: string;
    correo: string;
    foto: string;
    nombre: string;
    confirmado: boolean;
}
