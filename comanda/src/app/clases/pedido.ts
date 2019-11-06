export class Pedido {
    public cliente: string;
    public fecha: number;
    public preciototal: number;
    public mesa: number;
    public estado: string;
    public cantDet: number;
    public cantEnt: number;
    public juegoDescuento: boolean;
    public juegoBebida: boolean;
    public juegoComida: boolean;
}

export interface PedidoKey {
    key: string;
    cliente: string;
    fecha: number;
    preciototal: number;
    mesa: number;
    estado: string;
    cantDet: number;
    cantEnt: number;
    juegoDescuento: boolean;
    juegoBebida: boolean;
    juegoComida: boolean;
}
