export class Anonimo {
    public correo: string;
    public nombre: string;
    public foto: string;

    constructor() {
        this.correo = '';
        this.nombre = '';
        this.foto = '';
    }
}

export interface AnonimoKey {
    key: string;
    correo: string;
    nombre: string;
    foto: string;
}
