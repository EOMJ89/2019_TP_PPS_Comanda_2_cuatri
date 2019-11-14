export class Cliente {
    public correo: string;
    public nombre: string;
    public apellido: string;
    public DNI: number;
    public foto: string;

    constructor() {
        this.correo = '';
        this.nombre = '';
        this.apellido = '';
        this.DNI = 0;
        this.foto = '';
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

export interface ClienteAConfirmarKey {
    key: string;
    DNI: number;
    apellido: string;
    correo: string;
    foto: string;
    nombre: string;
    clave: string;
}

export class ClienteAConfirmar {
    public correo: string;
    public nombre: string;
    public apellido: string;
    public DNI: number;
    public foto: string;
    public clave: string;

    constructor() {
        this.correo = '';
        this.nombre = '';
        this.apellido = '';
        this.DNI = 0;
        this.foto = '';
        this.clave = '';
    }
}
