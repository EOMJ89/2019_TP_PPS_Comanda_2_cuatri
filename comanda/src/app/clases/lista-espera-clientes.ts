export class ListaEsperaClientes {
    public correo: string; // el correo del cliente
    public perfil: string; // el perfil del cliente
    public estado: string; // el estado de la espera, valores: 'confirmacionMozo', y otros
    public fecha: number;

    constructor() {
        this.correo = '';
        this.perfil = '';
        this.estado = '';
        this.fecha = 0;
    }
}

export interface ListaEsperaClientesKey {
    key: string;
    correo: string;
    perfil: string;
    estado: string;
    fecha: number;
}


