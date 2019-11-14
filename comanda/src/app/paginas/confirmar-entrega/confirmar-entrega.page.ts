import { Component, OnInit } from '@angular/core';
import { AngularFirestore, QuerySnapshot, DocumentSnapshot } from '@angular/fire/firestore';
import { ToastController, AlertController } from '@ionic/angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { AngularFireAuth } from '@angular/fire/auth';
import { ClienteKey } from 'src/app/clases/cliente';
import { AnonimoKey } from 'src/app/clases/anonimo';

@Component({
  selector: 'app-confirmar-entrega',
  templateUrl: './confirmar-entrega.page.html',
  styleUrls: ['./confirmar-entrega.page.scss'],
})
export class ConfirmarEntregaPage /* implements OnInit */ {
  /* private pedidoEnLocal: any = null;
  private pedidoDelivery: any = null;
  private pedidoDetalle: any[] = [];
  private hayPedidoDelivery: boolean = false;
  private hayPedidoEnLocal: boolean = false;
  private precioTotalAnterior: number;
  private totalFinal: number;
  private propinaFinal: string;
  private keyPedidoDelivery: string;

  constructor(
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private toastCtrl: ToastController,
    private scanner: BarcodeScanner,
    private alertCtrl: AlertController) {

  }

  async ngOnInit() {
    await this.buscarUsuario();
    this.traerPedidos();
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
        alert(err);
      });

    // Si el cliente está registrado, entonces prosigo con la operación
    if (auxUser) {
      // console.log('Hay cliente registrado', auxUser);
      this.user = auxUser;
      this.esCliente = true;
      this.esClienteAnonimo = false;
    } else {
      // Si el cliente no está registrado, voy a buscar a la base de datos de clientes anonimos.
      const auxUserAnon = await this.traerUsuarioAnonimo()
        .catch(err => {
          alert(err);
        });
      if (auxUserAnon) {
        this.user = auxUserAnon;
        this.esCliente = true;
        this.esClienteAnonimo = true;
        // console.log('Hay usuario anonimo', auxUserAnon);
      }
    }
  }

  traerPedidos() {
    let cliente = JSON.parse(sessionStorage.getItem('usuario')).correo;
    this.baseService.getItems('pedidos').then(ped => {
      this.pedidoEnLocal = ped.find(pedido => pedido.estado == "listoEntrega" && pedido.cliente == cliente);
      this.hayPedidoEnLocal = this.pedidoEnLocal != undefined;

      if (this.hayPedidoEnLocal)
        this.traerDetalle(this.pedidoEnLocal.id);
    });

    this.baseService.getItems('pedidosDelivery').then(ped => {
      this.pedidoDelivery = ped.find(pedido => pedido.estado == "listoEntrega" && pedido.cliente == cliente);
      this.hayPedidoDelivery = this.pedidoDelivery != undefined;

      if (this.hayPedidoDelivery)
        this.traerDetalle(this.pedidoDelivery.id);
      this.keyPedidoDelivery = this.pedidoDelivery.key;
    });
  }

  traerDetalle(idPedido: number) {
    this.baseService.getItems('pedidoDetalle').then(pedido => {
      this.pedidoDetalle = pedido.filter(producto => producto.id_pedido == idPedido);
    });
  }

  propina() {
    this.scanner.scan().then((data) => {
      this.propinaFinal = data.text;

      if (this.propinaFinal == '5' || this.propinaFinal == '10' || this.propinaFinal == '15' || this.propinaFinal == '20') {
        this.precioTotalAnterior = this.pedidoDelivery.preciototal;
        this.totalFinal = this.pedidoDelivery.preciototal + (this.pedidoDelivery.preciototal * parseInt(this.propinaFinal) / 100);

        this.muestroAlert();
      } else {
        this.mostrarQRErroneo();
      }
    }, (err) => {
      console.log("Error: " + err);
    });
  }

  async muestroAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Propina seleccionada: ' + this.propinaFinal + '%',
      subHeader: '¿Confirma propina?',
      message: 'Precio pedido: $' + JSON.stringify(this.precioTotalAnterior) + ' Desea agregar ' + this.propinaFinal + '%? Precio final: $' + this.totalFinal,

      buttons: [
        {
          text: 'Confirmar',
          handler: () => {
            this.cargarenlaBD();
            this.presentToast('Propina cargada');
            this.traerDetalle(this.pedidoDelivery.id);
          }
        }, {
          text: 'Cancelar',
          role: 'cancel',
          // icon: 'close',
          handler: () => {
          }
        }
      ]
    });
    await alert.present();
  }

  cargarenlaBD() {
    // let key = this.pedidoDelivery.key;
    delete this.pedidoDelivery['key'];
    this.pedidoDelivery.preciototal = this.totalFinal;
    this.baseService.updateItem('pedidosDelivery', this.keyPedidoDelivery, this.pedidoDelivery);
  }

  async mostrarQRErroneo() {
    const alert = await this.alertCtrl.create({
      header: 'El código leído no es un QR de propina',
      message: 'Debe escanear un QR valido',
      buttons: ['OK']
    });
    await alert.present();
  }

  confirmarEntrega() {
    if (this.hayPedidoEnLocal) {
      let key: string = this.pedidoEnLocal.key;
      delete this.pedidoEnLocal['key'];
      this.pedidoEnLocal.estado = 'entregado';
      this.baseService.updateItem('pedidos', key, this.pedidoEnLocal);
    }
    if (this.hayPedidoDelivery) {
      // let key: string = this.pedidoDelivery.key;
      delete this.pedidoDelivery['key'];
      this.pedidoDelivery.estado = 'cobrado';
      this.baseService.updateItem('pedidosDelivery', this.keyPedidoDelivery, this.pedidoDelivery);
    }
    this.presentToast('Entrega confirmada');
    this.traerPedidos();
  }

  async presentToast(mensaje: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      color: 'success',
      showCloseButton: false,
      position: 'bottom',
      closeButtonText: 'Done',
      duration: 2000
    });
    toast.present();
  } */
}
