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

@Component({
  selector: 'app-confirmar-entrega',
  templateUrl: './confirmar-entrega.page.html',
  styleUrls: ['./confirmar-entrega.page.scss'],
})
export class ConfirmarEntregaPage implements OnInit {
  private pedidoEnLocal: PedidoKey = null;
  private pedidoDetalles: PedidoDetalleKey[] = null;
  private pedidoDelivery: PedidoDeliveryKey = null; // Cambiar a Pedido Delivery cuando se haga la clase
  private user: ClienteKey | AnonimoKey;

  constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private toastCtrl: ToastController,
    private scanner: BarcodeScanner,
    private alertCtrl: AlertController) { }

  public async ngOnInit() {
    await this.buscarUsuario();
    this.inicializarPedidos();
  }

  public inicializarPedidos() {
    this.pedidoDetalles = new Array<PedidoDetalleKey>();
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

  private obtenerUsername() {
    return this.auth.auth.currentUser.email;
  }

  private async traerUsuarioRegistrado(): Promise<false | ClienteKey> {
    return this.firestore.collection('clientes').ref.where('correo', '==', await this.obtenerUsername()).get()
      .then((d: QuerySnapshot<any>) => {
        if (d.empty) {
          return false;
        } else {
          const auxReturn: ClienteKey = d.docs[0].data() as ClienteKey;
          auxReturn.key = d.docs[0].id;
          return auxReturn;
        }
      });
  }

  private async obtenerUid() {
    return this.auth.auth.currentUser.uid;
  }

  private async traerUsuarioAnonimo(): Promise<false | AnonimoKey> {
    return this.firestore.collection('anonimos').doc(await this.obtenerUid()).get().toPromise()
      .then((d: DocumentSnapshot<any>) => {
        if (d.exists) {
          const auxReturn: AnonimoKey = d.data() as AnonimoKey;
          auxReturn.key = d.id;
          return auxReturn;
        } else {
          return false;
        }
      });
  }

  private async buscarUsuario() {
    // Obtengo el cliente activo en la base de clientes registrados
    const auxUser = await this.traerUsuarioRegistrado()
      .catch(err => {
        // alert(err);
      });

    // Si el cliente está registrado, entonces prosigo con la operación
    if (auxUser) {
      // console.log('Hay cliente registrado', auxUser);
      this.user = auxUser;
    } else {
      // Si el cliente no está registrado, voy a buscar a la base de datos de clientes anonimos.
      const auxUserAnon = await this.traerUsuarioAnonimo()
        .catch(err => {
          // alert(err);
        });
      if (auxUserAnon) {
        this.user = auxUserAnon;
        // console.log('Hay usuario anonimo', auxUserAnon);
      }
    }
  }

  private traerPedidos() {
    return this.firestore.collection('pedidos').ref.where('cliente', '==', this.user.correo).get()
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
    return this.firestore.collection('pedidosDelivery').ref.where('cliente', '==', this.user.correo).get()
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
      const propina = parseInt(data.text, 10);

      if ((isNaN(propina) === false) ||
        (propina === 5 || propina === 10 || propina === 15 || propina === 20)) {
        this.manejarPropina(propina);
      } else {
        this.mostrarAlert('¡Código erroneo!', 'Debe escanear un codigo QR valido');
      }
    }, (err) => {
      console.log('Error: ', err);
      this.mostrarAlert('¡Error!', 'Error desconocido.');
      this.manejarPropina(5);
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

  public confirmarEntrega() {
    // console.log('Confirmo la entrega');

    if (this.pedidoEnLocal != null) {
      this.actualizarDoc('pedidos', this.pedidoEnLocal.key, { estado: 'entregado' }).then(() => {
        this.presentToast('Entrega confirmada', 'success');
        this.inicializarPedidos();
      });
    }

    if (this.pedidoDelivery != null) {
      this.actualizarDoc('pedidosDelivery', this.pedidoDelivery.key, { estado: 'cobrado' }).then(() => {
        this.presentToast('Delivery entregado', 'success');
        this.inicializarPedidos();
      });
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
