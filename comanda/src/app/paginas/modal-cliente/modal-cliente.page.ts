import { Component, OnInit, Input } from '@angular/core';
import { ClienteKey } from 'src/app/clases/cliente';
import { ModalController } from '@ionic/angular';
import { AnonimoKey } from 'src/app/clases/anonimo';

@Component({
  selector: 'app-modal-cliente',
  templateUrl: './modal-cliente.page.html',
  styleUrls: ['./modal-cliente.page.scss'],
})
export class ModalClientePage {
  // tslint:disable: no-input-rename
  @Input('cliente') public cliente: ClienteKey | AnonimoKey;
  @Input('registrado') public registrado: string;

  constructor(private modalCtrl: ModalController) { }

  public cerrar() {
    this.modalCtrl.dismiss();
  }
}
