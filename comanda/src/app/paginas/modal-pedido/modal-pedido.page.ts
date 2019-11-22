import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController } from '@ionic/angular';
import { AngularFirestore, DocumentSnapshot, QuerySnapshot } from '@angular/fire/firestore';
import { PedidoKey } from 'src/app/clases/pedido';
import { PedidoDetalleKey } from 'src/app/clases/pedidoDetalle';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/servicios/auth.service';
import { ClienteKey } from 'src/app/clases/cliente';
import { AnonimoKey } from 'src/app/clases/anonimo';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

@Component({
  selector: 'app-modal-pedido',
  templateUrl: './modal-pedido.page.html',
  styleUrls: ['./modal-pedido.page.scss'],
})
export class ModalPedidoPage implements OnInit {
  // tslint:disable-next-line: no-input-rename
  @Input('pedido') public pedido: string;
  private pedidoActual: PedidoKey;
  private pedidoDetalle: PedidoDetalleKey[] = new Array<PedidoDetalleKey>();
  private cliente = false;
  private verCuenta = false;

  constructor(
    private firestore: AngularFirestore,
    private modalController: ModalController,
    private authService: AuthService,
    private scanner: BarcodeScanner,
    private alertCtrl: AlertController) { }

  async ngOnInit() {
    this.cliente = this.authService.tipoUser === 'cliente' || this.authService.tipoUser === 'anonimo' ? true : false;
    this.traerPedido();
    this.traerPedidoDetalle();
  }

  public traerPedido() {
    this.firestore.collection('pedidos').doc(this.pedido).get().toPromise().then((d: DocumentSnapshot<any>) => {
      if (d.exists) {
        this.pedidoActual = d.data() as PedidoKey;
        this.pedidoActual.key = d.id;
        if (this.pedidoActual.estado === 'cuenta') {
          this.verCuenta = true;
        } else {
          this.verCuenta = false;
        }
      }
    });
  }

  public traerPedidoDetalle() {
    this.firestore.collection('pedidoDetalle').snapshotChanges().pipe(map((f) => {
      const fArr: Array<PedidoDetalleKey> = f.map((a) => {
        const data = a.payload.doc.data() as PedidoDetalleKey;
        data.key = a.payload.doc.id;
        return data;
      });

      return fArr.filter((d) => {
        return d.id_pedido === this.pedido;
      });
    })).subscribe((da: PedidoDetalleKey[]) => {
      this.pedidoDetalle = da;
    });
  }

  public async cerrar() {
    this.modalController.dismiss();
  }

  public async crearCuenta() {
    if (this.pedidoActual.estado !== 'finalizado' && this.pedidoActual.estado !== 'cuenta') {
      await this.actualizarDoc('pedidos', this.pedidoActual.key, { estado: 'cuenta' });
      this.traerPedido();
    }

    this.verCuenta = true;
    // console.log('Ver la cuenta');
  }

  public manejarPrecioPropina(total?: number, propina?: number) {
    const precioTotal: number = total === undefined ? this.pedidoActual.preciototal : total;
    const agregadoPropina: number = ((propina === undefined ? this.pedidoActual.propina : propina) / 100) * precioTotal;
    return precioTotal + agregadoPropina;
  }

  public cambiarPropina() {
    console.log('Cambio la propina con un qr');

    this.scanner.scan({ resultDisplayDuration: 0 }).then((data) => {
      // en el generador de qr, colocar 'propina:5' sin comillas, reemplazar el numero por el deseado
      const d = data.text.split(':');
      if (d.length > 1) {
        const propina = parseInt(data.text.split(':')[1], 10);

        if ((isNaN(propina) === false) ||
          (propina === 5 || propina === 10 || propina === 15 || propina === 20)) {
          this.manejarPropina(propina);
        } else {
          this.mostrarAlert('¡Código erroneo!', 'Debe escanear un codigo QR valido');
        }
      }  else {
        this.mostrarAlert('¡Código erroneo!', 'Debe escanear un codigo QR valido');
      }
    }, (err) => {
      console.log('Error: ', err);
      this.mostrarAlert('¡Error!', 'Error desconocido.');
      // this.manejarPropina(5);
    });
  }

  private manejarPropina(propina: number) {
    const total = this.manejarPrecioPropina(this.pedidoActual.preciototal, propina);
    this.muestroAlertPropina(this.pedidoActual.preciototal, propina, total);
  }

  private async mostrarAlert(header, message) {
    await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK']
    }).then(alert => {
      alert.present();
    });
  }

  private async muestroAlertPropina(anterior: number, propina: number, total: number) {
    await this.alertCtrl.create({
      header: `Propina seleccionada: ${propina}%`,
      subHeader: '¿Confirmar propina?',
      message: `Su precio total pasará de ser $${anterior} a ser $${total}`,
      buttons: [
        {
          text: 'Confirmar',
          handler: () => {
            this.actualizarPropina(propina);
          }
        }, {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => { }
        }
      ]
    }).then(alert => {
      alert.present();
    });
  }

  private actualizarDoc(db: string, key: string, data: any) {
    return this.firestore.collection(db).doc(key).update(data);
  }

  public actualizarPropina(propina: number) {
    this.actualizarDoc('pedidos', this.pedidoActual.key, { propina }).then(() => {
      this.traerPedido();
    });
  }
}
