export class Herramientas
{
    constructor(){}

    ValidarNombre(nombre:string):boolean
    {
        var expRegNombre=/^[a-zA-ZÑñÁáÉéÍíÓóÚúÜü\s]+$/;
        if(expRegNombre.exec(nombre)) return true
        else return false;
    }

    ValidarMail(mail:string):boolean
    {
        var expRegCorreo=/^\w+[a-zA-Z1-9ÑñÁáÉéÍíÓóÚúÜü\s]+@(\w+\.)+\w{2,4}$/; 
        if(expRegCorreo.exec(mail)) return true
        else return false;
    }

    ValidarEdad(edad:Number):boolean
    {
        var expRegCorreo=/^[0-9]{1,3}$/;
        var edadAux:string = edad.toString();
        if(expRegCorreo.exec(edadAux) )
        {
            if(edad > 0 && edad <= 90)return true
            else false;
        }else false;
    }

    ValidarEdad18(edad:Number):boolean
    {
        var expRegCorreo=/^[0-9]{1,3}$/;
        var edadAux:string = edad.toString();
        if(expRegCorreo.exec(edadAux) )
        {
            if(edad > 17 && edad <= 90)return true
            else false;
        }else false;
    }

    ValidarDNI(dni:number):boolean
    {
        if(dni > 10000000)return true
        else false;
    }

    AutofillNombre():string
    {
        var nombres = ['jose','juan','esteban','jonny','axel','victor','patricio','julian','pablo','rick','john','ezequiel','robin','nina','angelica','romina','monica','sofia','maria','elizabeth','veronica'];
        var random = Math.random() * ( (nombres.length-1) - 0) + 0;
        return nombres[ Math.round(random) ];
    }

    AutofillApellido():string
    {
        var apellidos = ['rodriguez','pratt','lopez','fernandez','martinez','sanchez','gomez','jimenez','ruiz','ramos','gil','serrano','blanco','navarro','torres','alonso','romero','muñoz','sanz','medina','cortes','castillo','ortiz','castro','ortega','suarez','moralez'];
        var random = Math.random() * ( (apellidos.length-1) - 0) + 0;
         return apellidos[ Math.round(random) ];
    }

    AutofillMail():string
    {
        var nombres = ['jose','juan','esteban','jonny','axel','victor','patricio','julian','pablo','rick','john','ezequiel','robin','nina','angelica','romina','monica','sofia','maria','elizabeth','veronica'];
        var random = Math.round( Math.random() * ( (nombres.length-1) - 0) + 0);
        var mail = nombres[random] +'@'+ nombres[random] +".com";
        return mail;
    }

    AutofillDNI():number
    {
        var dni = Math.round( Math.random() * (999000000  - 40000000) + 40000000);
        return dni;
    }

    AutofillEdad():number
    {
        var edad = Math.round( Math.random() * (90  - 1) + 1);
        return edad;
    }

    AutofillEdad18():number
    {
        var edad = Math.round( Math.random() * (90  - 18) + 18);
        return edad;
    }

    GenRanNum(max:number,min:number):number
    {
        var numeroAleatorio = Math.round( Math.random() * (max  - min) + min);
        return numeroAleatorio;
    }

    ObtenerExtension(archivo:string):string
    {
        var extension:string = '';
        var comenzar:boolean = false;
        for (let index = 0; index < archivo.length; index++)
        {
            if(archivo[index] == '.') comenzar = true;
            if(comenzar == true) extension += archivo[index];
        }

        return extension;
    }

  

}
