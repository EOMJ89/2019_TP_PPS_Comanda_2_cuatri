import { Component, OnInit } from '@angular/core';
import { AngularFirestore, QuerySnapshot, DocumentSnapshot } from '@angular/fire/firestore';
import { ToastController, AlertController } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { AngularFireAuth } from '@angular/fire/auth';
import { ClienteKey } from 'src/app/clases/cliente';
import { AnonimoKey } from 'src/app/clases/anonimo';
import { PedidoKey } from 'src/app/clases/pedido';
import { map } from 'rxjs/operators';
import { PedidoDetalleKey, PedidoDetalle } from 'src/app/clases/pedidoDetalle';
import { PedidoDeliveryKey } from 'src/app/clases/pedidoDelivery';
import { MesaKey } from 'src/app/clases/mesa';
import { AuthService } from 'src/app/servicios/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-confirmar-entrega',
  templateUrl: './confirmar-entrega.page.html',
  styleUrls: ['./confirmar-entrega.page.scss'],
})
export class ConfirmarEntregaPage implements OnInit {
  private pedidoEnLocal: PedidoKey = null;
  private pedidoDetalles: PedidoDetalleKey[] = null;
  private pedidoDelivery: PedidoDeliveryKey = null; // Cambiar a Pedido Delivery cuando se haga la clase

  constructor(
    private authServ: AuthService,
    private firestore: AngularFirestore,
    private toastCtrl: ToastController,
    private scanner: BarcodeScanner,
    private alertCtrl: AlertController,
    private router: Router) { }

  public ngOnInit() {
    this.inicializarPedidos();
  }

  public inicializarPedidos() {
    // this.pedidoDetalles = new Array<PedidoDetalleKey>();
    this.traerPedidos().then((p: PedidoKey[]) => {
      if (p.length > 0) {
        this.pedidoEnLocal = p[0];
        this.traerDetalles(this.pedidoEnLocal.key).then((d: PedidoDetalleKey[]) => {
          this.pedidoDetalles = d;
        });
      } else {
        this.traerPedidosDelivery().then((pd: PedidoDeliveryKey[]) => {
          if (pd.length > 0) {
            this.pedidoDelivery = pd[0];
            this.traerDetalles(this.pedidoDelivery.key).then((d: PedidoDetalleKey[]) => {
              this.pedidoDetalles = d;
            });
          }
        });
      }
    });
  }

  private traerPedidos() {
    return this.firestore.collection('pedidos').ref.where('cliente', '==', this.authServ.user.correo).get()
      .then((d: QuerySnapshot<any>) => {
        if (d.empty) {
          return new Array<PedidoKey>();
        } else {
          const auxReturn = new Array<PedidoKey>();
          for (const p of d.docs) {
            const a: PedidoKey = p.data() as PedidoKey;
            a.key = p.id;

            if (a.estado === 'entregadoMozo') {
              // if (a.estado === 'listoEntrega') {
              auxReturn.unshift(a);
            }
          }

          return auxReturn;
        }
      });
  }

  private traerDetalles(id: string) {
    return this.firestore.collection('pedidoDetalle').ref.where('id_pedido', '==', id).get()
      .then((d: QuerySnapshot<any>) => {
        if (d.empty) {
          return new Array<PedidoDetalleKey>();
        } else {
          const auxReturn = new Array<PedidoDetalleKey>();
          for (const p of d.docs) {
            const a: PedidoDetalleKey = p.data() as PedidoDetalleKey;
            a.key = p.id;

            if (a.estado === 'listoEntrega') {
              // if (a.estado === 'listoEntrega') {
              auxReturn.unshift(a);
            }
          }

          return auxReturn;
        }
      });
  }

  private traerPedidosDelivery() {
    return this.firestore.collection('pedidosDelivery').ref.where('cliente', '==', this.authServ.user.correo).get()
      .then((d: QuerySnapshot<any>) => {
        if (d.empty) {
          return new Array<PedidoDeliveryKey>();
        } else {
          const auxReturn = new Array<PedidoDeliveryKey>();
          for (const p of d.docs) {
            const a: PedidoDeliveryKey = p.data() as PedidoDeliveryKey;
            a.key = p.id;

            if (a.estado === 'listoEntrega') {
              auxReturn.unshift(a);
            }
          }

          return auxReturn;
        }
      });
  }

  public manejarPrecioPropina(total: number, propina: number) {
    const precioTotal: number = total;
    const agregadoPropina: number = (propina / 100) * total;
    return precioTotal + agregadoPropina;
  }

  public propina() {
    // console.log('Doy la propina');
    this.scanner.scan().then((data) => {
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
      } else {
        this.mostrarAlert('¡Código erroneo!', 'Debe escanear un codigo QR valido');
      }
    }, (err) => {
      console.log('Error: ', err);
      this.mostrarAlert('¡Error!', 'Error desconocido.');
      // this.manejarPropina(5);
    });
  }

  private manejarPropina(propina: number) {
    const total = this.manejarPrecioPropina(this.pedidoDelivery.preciototal, propina);
    this.muestroAlertPropina(this.pedidoDelivery.preciototal, propina, total);
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
    this.actualizarDoc('pedidosDelivery', this.pedidoDelivery.key, { propina }).then(() => {
      this.inicializarPedidos();
      /* this.traerPedidosDelivery().then((pd: PedidoDeliveryKey[]) => {
        if (pd.length > 0) {
          this.pedidoDelivery = pd[0];
        }
      }); */
    });
  }

  private traerMesa(nroMesa: number) {
    return this.firestore.collection('mesas').ref.where('nromesa', '==', nroMesa).get()
      .then((d: QuerySnapshot<any>) => {
        if (d.empty) {
          return null;
        } else {
          const auxReturn: MesaKey = d.docs[0].data() as MesaKey;
          auxReturn.key = d.docs[0].id;

          return auxReturn;
        }
      });
  }

  public confirmarEntrega() {
    // console.log('Confirmo la entrega');

    if (this.pedidoEnLocal != null) {
      if (this.pedidoEnLocal.estado !== 'entregado' &&
        this.pedidoEnLocal.estado !== 'cuenta' &&
        this.pedidoEnLocal.estado !== 'finalizado') {
        this.actualizarDoc('pedidos', this.pedidoEnLocal.key, { estado: 'entregado' }).then(async () => {
          const auxMesa = await this.traerMesa(this.pedidoEnLocal.mesa);

          if (auxMesa !== null) {
            await this.actualizarDoc('mesas', auxMesa.key, { estado: 'comiendo' });
          }
          this.presentToast('Entrega confirmada', 'success');
          this.router.navigate(['inicio']);
          // this.inicializarPedidos();
        });
      } else {
        this.presentToast('El pedido ya fue entregado', 'danger');
      }
    }

    if (this.pedidoDelivery != null) {
      if (this.pedidoEnLocal.estado !== 'cobrado') {
        this.actualizarDoc('pedidosDelivery', this.pedidoDelivery.key, { estado: 'cobrado' }).then(() => {
          this.presentToast('Delivery entregado', 'success');
          // this.inicializarPedidos();
          this.router.navigate(['inicio']);
        });
      } else {
        this.presentToast('El pedido ya fue entregado', 'danger');
      }
    }
  }

  private async presentToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      color,
      showCloseButton: false,
      position: 'bottom',
      closeButtonText: 'Done',
      duration: 2000
    });
    toast.present();
  }
}
