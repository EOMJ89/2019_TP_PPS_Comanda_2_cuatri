export class ListaEsperaClientes {
    public correo: string; // el correo del cliente
    public perfil: string; // el perfil del cliente
    public estado: string; // el estado de la esperam valores: 'confirmacionMozo', y otros

    constructor() {
        this.correo = '';
        this.perfil = '';
        this.estado = '';
    }
}

export interface ListaEsperaClientesKey {
    key: string;
    correo: string;
    perfil: string;
    estado: string;
}


