export class PedidoDetalle {
    // tslint:disable-next-line: variable-name
    public id_pedido: string;
    public producto: string;
    public precio: number;
    public cantidad: number;
    public estado: string;

    constructor() {
        this.id_pedido = '';
        this.producto = '';
        this.precio = 0;
        this.cantidad = 0;
        this.estado = '';
    }
}

export interface PedidoDetalleKey {
    key: string;
    // tslint:disable-next-line: variable-name
    id_pedido: string;
    producto: string;
    precio: number;
    cantidad: number;
    estado: string;
}
