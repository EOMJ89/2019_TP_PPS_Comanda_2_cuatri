import { Component, OnInit } from '@angular/core';
import { FirebaseService } from "../../servicios/firebase.service";
import { ToastController, AlertController, ModalController } from '@ionic/angular';
import { ModalPedidoPage } from "../modal-pedido/modal-pedido.page";
import { CajaSonido } from '../../clases/cajaSonido';

import { Observable, Subscribable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';


@Component({
  selector: 'app-generar-pedido',
  templateUrl: './generar-pedido.page.html',
  styleUrls: ['./generar-pedido.page.scss'],
})

export class GenerarPedidoPage implements OnInit {
  private _sub: Subscription;
  productos: any;
  clienteLogueado: any;
  mesaDelPedido: any;
  existePedidoAbierto: boolean;
  productosCocina: any;
  productosBartender: any;
  spinner: boolean = false;
  totalPedido: any = 0;
  
  

  cart = [];
  items = [];
  
  constructor(
    public modalCtrl: ModalController,
    private baseService: FirebaseService,
    public toastController: ToastController,
    public alertCtrl: AlertController
  ){
    //this.traerProductos();
    this.inicializarProductos();
    this.traerDatosCliente();
    //SE HARDCODEA PORQUE EN LOGUIN NO SE ESTA GUARDANDO EL USUARIO POR LOCASTORAGE
    this.traerMesa("cliente@cliente.com"/*JSON.parse(sessionStorage.getItem('usuario')).correo*/);
  }
  
  ngOnInit(){
    //this.traerProductos();
    this.inicializarProductos();
    this.traerDatosCliente();
    //SE HARDCODEA PORQUE EN LOGUIN NO SE ESTA GUARDANDO EL USUARIO POR LOCASTORAGE
    this.traerMesa("cliente@cliente.com"/*JSON.parse(sessionStorage.getItem('usuario')).correo*/);
  }

  public inicializarProductos() {
    //this._esperando = true;
    this._sub = this.traerProductos().subscribe((data: Array<any>) => {
      //console.log(data);
      this.productosBartender = data.filter((f: any) => {
        return f.quienPuedever === 'bartender';
      });
      this.productosCocina = data.filter((f: any) => {
        return f.quienPuedever === 'cocinero';
      });
      //console.log(this.productosCocina);
      //this._esperando = false;

      /* console.log('Productos en servicio Foto');
      console.log('Lindas', this._lindas);
      console.log('Feas', this._feas);
      console.log('Propias', this._propias); */
    });
  }
  public ordenarFechas(a: any, b: any) {
    let auxReturn: number;
    if (a.fecha < b.fecha) {
      auxReturn = 1;
    } else if (a.fecha > b.fecha) {
      auxReturn = -1;
    } else {
      auxReturn = 0;
    }

    return auxReturn;
  }

  public traerProductos() {
    return this.baseService.traertodos('productos').snapshotChanges().pipe(map((f) => {
      const auxChat = f.map((a) => {
        const data = a.payload.doc.data() as any;
        data.id = a.payload.doc.id;
        return data;
      });
      return this.productos = auxChat.sort(this.ordenarFechas);
    }));
  }

  traerDatosCliente(): any {
    this.clienteLogueado = JSON.parse(sessionStorage.getItem('usuario'));
  }

  restarProducto(key: string) {
    let producto = this.productos.find(prod => prod.key == key);
    if (producto.cantidad > 0) {
      producto.cantidad -= 1;
    } else {
      producto.cantidad = 0;
    }

    let productosPedidos = this.productos.filter(prod => prod.cantidad > 0);
    this.totalPedido = this.calcularPrecioTotal(productosPedidos);
  }

  sumarProducto(key: string) {
      let producto = this.productos.find(prod => prod.key == key);
      producto.cantidad += 1;
      console.log()

      let productosPedidos = this.productos.filter(prod => prod.cantidad > 0);
      this.totalPedido = this.calcularPrecioTotal(productosPedidos);
    }

  calcularPrecioTotal(pedido: any[]) {
    let precioTotal: number = 0;
    pedido.forEach(producto => {
      precioTotal += (producto.precio * producto.cantidad);
    });

    return precioTotal;
  }

  pedir() {
    this.traerMesa("cliente@cliente.com"/*JSON.parse(sessionStorage.getItem('usuario')).correo*/);

    if (sessionStorage.getItem('pedido')) {
      this.baseService.getItems('pedidos').then(pedidos => {
        let idPedido = sessionStorage.getItem('pedido');
        this.existePedidoAbierto = !(typeof pedidos.find(pedido => pedido.id == idPedido && pedido.estado != 'cerrado') === 'undefined');
        if (this.existePedidoAbierto) {
          // ACTUALIZO PEDIDO

          let pedidoAceptado = pedidos.find(pedido => pedido.id == idPedido);
          let productosPedidos = this.productos.filter(prod => prod.cantidad > 0);
          // console.log("Pedido encontrado: ", pedidoAceptado);
          let key: string = pedidoAceptado.key;
          delete pedidoAceptado.key;
          pedidoAceptado.cantDet = productosPedidos.length;
          pedidoAceptado.cantEnt = 0;
          this.baseService.updateItem('pedidos', key, pedidoAceptado);
          //  ACTUALIZO DETALLE
          this.baseService.getItems('pedidoDetalle').then(productos => {
            let pedidoEnPreparacion: boolean = false;
            productos.forEach(prod => {
              if (prod.id_pedido == idPedido && prod.estado == 'preparacion') {
                pedidoEnPreparacion = true;
              }
            });
            if (pedidoEnPreparacion) {
              this.presentAlertPedidoEnProceso();
            } else {
              this.actualizarPedido();
            }
          });
        } else {
          this.generarPedido();
        }
      });
    } else {
      this.generarPedido();
    }
  }

  async presentAlertPedidoEnProceso() {
    const alert = await this.alertCtrl.create({
      subHeader: 'El pedido no puede modificarse',
      message: 'El pedido ya se encuentra en preparación.',
      buttons: ['OK']
    });
    await alert.present();
  }

generarPedido() {
    // Se genera una copia de la lista de productos
    let productosPedidos = this.productos.filter(prod => prod.cantidad > 0);
  //console.log(productosPedidos);
    if (productosPedidos.length > 0) {
      if (typeof this.mesaDelPedido === 'undefined') {
        this.presentAlertSinMesa();
      } else {
        let id = Date.now();

        let pedido = {
          'id': id,
          'cliente': this.clienteLogueado.correo,
          'fecha': (new Date()).toLocaleDateString() + ' ' + (new Date()).toLocaleTimeString(),
          'preciototal': this.calcularPrecioTotal(productosPedidos),
          'mesa': this.mesaDelPedido.nromesa,
          'estado': 'creado',
          'cantDet': productosPedidos.length,
          'cantEnt': 0,
          'juegoDescuento': false,
          'juegoBebida': false,
          'juegoComida': false
        };
        this.baseService.addItem('pedidos', pedido);

        productosPedidos.forEach(producto => {
          let pedido_detalle = {
            'id_pedido': id,
            'producto': producto.nombre,
            'precio': producto.precio,
            'cantidad': producto.cantidad,
            'estado': 'creado'
          };
          this.baseService.addItem('pedidoDetalle', pedido_detalle);
        });
        //this.audioService.play('mmm');
        //this.envioPost(pedido);
        this.presentToast("Pedido generado.");
        sessionStorage.setItem('pedido', id.toString());
        // ENVIO PUSH NOTIFICATION
        
      
      }
    }
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

  actualizarPedido() {
    let idPedido = sessionStorage.getItem('pedido');
    this.baseService.getItems('pedidoDetalle').then(productos => {
      // Se borran los productos existentes
      let detalle: any[] = [];
      detalle = productos.filter(producto => producto.id_pedido == idPedido);
      detalle.forEach(prod => {
        let key = prod.key;
        this.baseService.removeItem('pedidoDetalle', key);
      });

      // Se agregan los nuevos productos
      let productosPedidos = this.productos.filter(prod => prod.cantidad > 0);

      if (productosPedidos.length > 0) {
        productosPedidos.forEach(producto => {
          let pedido_detalle = {
            'id_pedido': idPedido,
            'producto': producto.nombre,
            'precio': producto.precio,
            'cantidad': producto.cantidad,
            'estado': 'creado'
          };
          this.baseService.addItem('pedidoDetalle', pedido_detalle);
        });
        this.presentToast("Pedido actualizado.");
      }
    });
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
 //console.log("mesas");
    this.baseService.getItems('mesas').then(mesas => {
      
      this.mesaDelPedido = mesas.find(mes => mes.cliente == correo);
      console.log("mesas");
      this.cargarPedidoExistente();
    });
    console.log(this.mesaDelPedido);
  }

  cargarPedidoExistente() {
    this.baseService.getItems('pedidos').then(pedidos => {
      this.existePedidoAbierto = !(typeof pedidos.find(pedido => pedido.mesa == this.mesaDelPedido.nromesa && pedido.estado != 'cerrado') === 'undefined');
      if (this.existePedidoAbierto && !sessionStorage.getItem('pedido')) {
        sessionStorage.setItem('pedido', pedidos.find(pedido => pedido.mesa == this.mesaDelPedido.nromesa && pedido.estado != 'cerrado').id);
      }
    });
  }

}//FIN TODO
