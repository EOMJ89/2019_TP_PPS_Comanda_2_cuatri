export class PedidoDelivery {
    public cliente: string;
    public fecha: number;
    public preciototal: number;
    public direccion: string;
    public estado: string;
    public cantDet: number;
    public cantEnt: number;
    public latitud: any; // Tal vez un number.
    public longitud: any; // Tal vez un number.
    public propina: number;

    constructor() {
        this.cliente = '';
        this.fecha = 0;
        this.preciototal = 0;
        this.direccion = '';
        this.estado = '';
        this.cantDet = 0;
        this.cantEnt = 0;
        this.latitud = null; // Tal vez un number.
        this.longitud = null; // Tal vez un number.
        this.propina = 0; // propina en porcentaje
    }
}

export interface PedidoDeliveryKey {
    key: string;
    cliente: string;
    fecha: number;
    preciototal: number;
    direccion: string;
    estado: string;
    cantDet: number;
    cantEnt: number;
    latitud: any; // Tal vez un number.
    longitud: any; // Tal vez un number.
    propina: number;
}
