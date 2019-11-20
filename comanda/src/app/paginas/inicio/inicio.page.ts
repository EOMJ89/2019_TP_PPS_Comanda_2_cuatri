import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../servicios/auth.service';
import { Router } from '@angular/router';
import { ConfiguracionPage } from '../configuracion/configuracion.page';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
})
export class InicioPage implements OnInit {


  constructor(
    private authService: AuthService,
    public router: Router,
    private modalCtrl: ModalController) { }

  public cerrarSesion() {
    this.authService.Logout();
  }

  ngOnInit() { }

  public configModal() {
    this.modalCtrl.create({
      component: ConfiguracionPage,
      componentProps: {
        user: this.authService.user,
        type: this.authService.tipoUser
      }
    }).then(modal => {
      modal.present();
    });
  }
}
