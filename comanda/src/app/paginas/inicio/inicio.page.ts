import { Component, OnInit } from '@angular/core';
import { AuthService } from  '../../servicios/auth.service';
import { Router }  from '@angular/router';
import { Herramientas }  from '../../clases/herramientas';
import { CajaSonido } from '../../clases/cajaSonido';


@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit
{
  private herramientas:Herramientas = new Herramientas();
  public cajaSonido:CajaSonido = new CajaSonido();
  // firebase = firebase;
  public correoActual = "";
  public ocultarSpinner:boolean = true;


  constructor(private authService:AuthService,
    public router:Router,
    )
  {
    this.ocultarSpinner = true;
  }

  ngOnInit()
  {}

  /*
    *es utilizado para desLoguear al usuario actual
  */
  onLogout()
  {
    this.authService.Logout();
  }

  ObtenerUsuarioActual()
  {
    var myLocalUser = JSON.parse(localStorage.getItem("user") );
    this.correoActual = myLocalUser.email;
  }

  ActivarSpinner(delay:number)
  {
    this.ocultarSpinner = false;
    var modelo = this;
    setTimeout(function(){
      modelo.ocultarSpinner = true;
    }, delay);
  }


}
