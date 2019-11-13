import { Component, OnInit } from '@angular/core';
import { FirebaseService } from '../../servicios/firebase.service';
import { ToastController, AlertController, ModalController } from '@ionic/angular';
import { ModalPedidoPage } from '../modal-pedido/modal-pedido.page';
import { CajaSonido } from '../../clases/cajaSonido';

import { MesaKey } from 'src/app/clases/mesa';
import { ProductoKey } from 'src/app/clases/producto';
import { ClienteKey } from 'src/app/clases/cliente';
import { AnonimoKey } from 'src/app/clases/anonimo';
import { AngularFirestore, QuerySnapshot, DocumentSnapshot, DocumentReference } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { Router } from '@angular/router';
/* import { Pedido } from 'src/app/clases/pedido';
import { PedidoDetalle } from 'src/app/clases/pedidoDetalle'; */


@Component({
  selector: 'app-generar-pedido',
  templateUrl: './generar-pedido.page.html',
  styleUrls: ['./generar-pedido.page.scss'],
})

export class GenerarPedidoPage implements OnInit {
  // tslint:disable-next-line: variable-name
  private productos: ProductoKey[];
  private mesaDelPedido: MesaKey;
  private productosCocina: ProductoKey[];
  private productosBartender: ProductoKey[];
  private totalPedido = 0;
  private user: ClienteKey | AnonimoKey;

  constructor(
    public modalCtrl: ModalController,
    public toastController: ToastController,
    public alertCtrl: AlertController,
    private auth: AngularFireAuth,
    private firestore: AngularFirestore,
    private router: Router,
  ) { }

  // Trae los productos
  public async traerProductos() {
    return this.firestore.collection('productos').get().toPromise().then((d: QuerySnapshot<any>) => {
      if (!d.empty) {
        const prodReturn = new Array<ProductoKey>();
        for (const da of d.docs) {
          const prodA = da.data() as ProductoKey;
          prodA.key = da.id;
          prodReturn.unshift(prodA);
        }
        return prodReturn;
      } else {
        return new Array<ProductoKey>();
      }
    });
  }

  // Filtra los productos según su categoria
  public inicializarProductos() {
    this.traerProductos().then((data: Array<ProductoKey>) => {
      // console.log(data);
      this.productosBartender = data.filter((f: ProductoKey) => {
        return f.quienPuedever === 'bartender';
      });
      this.productosCocina = data.filter((f: ProductoKey) => {
        return f.quienPuedever === 'cocinero';
      });

      this.productos = data;
      // console.log(this.productosCocina);
    });
  }

  private obtenerUsername() {
    return this.auth.auth.currentUser.email;
  }

  // Obtiene el cliente si es que este es registrado, retorna false si no está en la base de datos
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

  // Obtiene el cliente si es que este es anonimo, retorna false si no está en la base de datos
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
    const auxUser = await this.traerUsuarioRegistrado();

    // Si el cliente está registrado, entonces prosigo con la operación
    if (auxUser) {
      // console.log('Hay cliente registrado', auxUser);
      this.user = auxUser;
    } else {
      // Si el cliente no está registrado, voy a buscar a la base de datos de clientes anonimos.
      const auxUserAnon = await this.traerUsuarioAnonimo();

      if (auxUserAnon) {
        this.user = auxUserAnon;
        // console.log('Hay usuario anonimo', auxUserAnon);
      }
    }

    console.log(this.user.correo);
  }

  async ngOnInit() {
    // this.traerProductos();
    this.inicializarProductos();
    await this.buscarUsuario();
    this.traerMesa(this.user.correo);
  }


  restarProducto(key: string) {
    const producto = this.productos.find(prod => prod.key === key);
    if (producto.cantidad > 0) {
      producto.cantidad -= 1;
    } else {
      producto.cantidad = 0;
    }

    const productosPedidos = this.productos.filter(prod => prod.cantidad > 0);
    this.totalPedido = this.calcularPrecioTotal(productosPedidos);
  }

  sumarProducto(key: string) {
    const producto = this.productos.find(prod => prod.key === key);
    producto.cantidad += 1;
    console.log('Cantidad de productos', producto.cantidad);

    const productosPedidos = this.productos.filter(prod => prod.cantidad > 0);
    this.totalPedido = this.calcularPrecioTotal(productosPedidos);
  }

  calcularPrecioTotal(pedido: ProductoKey[]) {
    let precioTotal = 0;
    pedido.forEach(producto => {
      precioTotal += (producto.precio * producto.cantidad);
    });

    return precioTotal;
  }

  private actualizarDoc(db: string, key: string, data: any) {
    return this.firestore.collection(db).doc(key).update(data);
  }

  private actualizarMesa() {
    const mesaKey = this.mesaDelPedido.key;
    const data = this.mesaDelPedido as any;
    delete data.key;
    // console.log(data);
    this.actualizarDoc('mesas', mesaKey, data);
  }

  private async hacerPedidoDetalle(productosPedidos, idPedido) {
    for (const producto of productosPedidos) {
      // tslint:disable-next-line: variable-name
      const pedido_detalle: any = {
        id_pedido: idPedido,
        producto: producto.nombre,
        precio: producto.precio,
        cantidad: producto.cantidad,
        estado: 'creado'
      };
      await this.firestore.collection('pedidoDetalle').add(pedido_detalle);
    }
  }

  public async generarPedido() {
    // Se genera una copia de la lista de productos
    const productosPedidos = this.productos.filter(prod => prod.cantidad > 0);
    // console.log(productosPedidos);
    if (productosPedidos.length > 0) {
      if (this.mesaDelPedido === undefined) {
        this.presentAlertSinMesa();
      } else {
        const pedido: any = {
          cantDet: productosPedidos.length,
          cantEnt: 0,
          cliente: this.user.correo,
          estado: 'creado',
          fecha: (new Date()).getTime(),
          juegoBebida: false,
          juegoComida: false,
          juegoDescuento: false,
          mesa: this.mesaDelPedido.nromesa,
          preciototal: this.calcularPrecioTotal(productosPedidos)
        };

        await this.firestore.collection('pedidos').add(pedido)
          .then(async (doc: DocumentReference) => {
            this.mesaDelPedido.pedidoActual = doc.id;
            this.actualizarMesa();
            await this.hacerPedidoDetalle(productosPedidos, doc.id);
          });
        this.presentToast('Pedido generado.');
        this.verPedido();
      }
    }
  }

  public verPedido() {
    // alert('La página de pedido no está implementada');
    this.modalCtrl.create({
      component: ModalPedidoPage,
      componentProps: {
        pedido: this.mesaDelPedido !== undefined ? this.mesaDelPedido.pedidoActual : undefined,
      }
    }).then(modal => {
      modal.present();
      modal.onDidDismiss().then(() => {
        this.router.navigate(['qr-mesa']);
      });
    });
  }

  async presentToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      color: 'success',
      showCloseButton: false,
      position: 'bottom',
      closeButtonText: 'Done',
      duration: 2000
    });
    toast.present();
  }

  async presentAlertSinMesa() {
    const alert = await this.alertCtrl.create({
      subHeader: 'Cliente sin mesa',
      message: 'Usted no está asignado a ninguna mesa.',
      buttons: ['OK']
    });
    await alert.present();
  }

  traerMesa(correo: string): any {
    // console.log("mesas");
    this.firestore.collection('mesas').ref.where('cliente', '==', correo).get()
      .then((d: QuerySnapshot<any>) => {
        console.log(d);
        if (!d.empty) {
          this.mesaDelPedido = d.docs[0].data() as MesaKey;
          this.mesaDelPedido.key = d.docs[0].id;
        }
      });
  }

  public obtenerPedidoMensaje(): string {
    let auxReturn = 'Pedido\n<br>';
    const prodPedidos = this.productos.filter(prod => prod.cantidad > 0);

    for (const p of prodPedidos) {
      auxReturn += `Producto: ${p.nombre} - Cant. ${p.cantidad}.\n<br>`;
    }

    return auxReturn;
  }

  public confirmarPedido() {
    this.alertCtrl.create({
      header: 'Confirmación de Pedido',
      subHeader: '¿Desea confirmar su pedido?',
      message: this.obtenerPedidoMensaje(),
      buttons: [
        {
          text: 'Sí',
          handler: () => {
            this.generarPedido();
          }
        },
        {
          text: 'No',
          handler: () => {
            return true;
          }
        }
      ]
    }).then(alert => {
      alert.present();
    });
  }
}
