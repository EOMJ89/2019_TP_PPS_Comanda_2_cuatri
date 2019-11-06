export class Reserva {
    public correo: string;
    public fecha: number; // date.GetTime();
    public mesaSeleccionada: number;
    public estadoConfirmacion: string;
}

export interface ReservaKey {
    key: string;
    correo: string;
    fecha: number; // date.GetTime();
    mesaSeleccionada: number;
    estadoConfirmacion: string;
}
