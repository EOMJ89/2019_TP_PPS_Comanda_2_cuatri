export class CajaSonido
{
    constructor(){}

    ReproducirSelecionar()
    {
      let audio = new Audio();
      audio.src = "/assets/aud/Cursor2.wav";
      audio.load();
      audio.play();
    }
  
    ReproducirVolver()
    {
      let audio = new Audio();
      audio.src = "/assets/aud/Cancel2.wav";
      audio.load();
      audio.play();
    }
  
    ReproducirBorrar()
    {
      let audio = new Audio();
      audio.src = "/assets/aud/Stare.wav";
      audio.load();
      audio.play();
    }
  
    ReproducirGuardar()
    {
      let audio = new Audio();
      audio.src = "/assets/aud/Save.wav";
      audio.load();
      audio.play();
    }

}
