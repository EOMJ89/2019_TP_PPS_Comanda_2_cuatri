export class Empleado
{
    public correo:string;
    public nombre:string;
    public apellido:string;
    public DNI:number;
    public CUIL:string;
    public foto:string;
    public tipo:string;

    constructor() 
    {
        this.correo = "";
        this.nombre = "";
        this.apellido = "";
        this.DNI = 0;
        this.CUIL = "";
        this.foto = "";
        this.tipo = "";
    }
}