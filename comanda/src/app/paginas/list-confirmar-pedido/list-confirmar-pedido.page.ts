import { Component, OnInit } from '@angular/core';
import { PedidoKey } from 'src/app/clases/pedido';
import { AngularFirestore, QuerySnapshot } from '@angular/fire/firestore';
import { ToastController, ModalController } from '@ionic/angular';
import { map } from 'rxjs/operators';
import { MesaKey } from 'src/app/clases/mesa';
import { PedidoDetalleKey } from 'src/app/clases/pedidoDetalle';
import { ModalPedidoPage } from '../modal-pedido/modal-pedido.page';

@Component({
  selector: 'app-list-confirmar-pedido',
  templateUrl: './list-confirmar-pedido.page.html',
  styleUrls: ['./list-confirmar-pedido.page.scss'],
})
export class ListConfirmarPedidoPage implements OnInit {
  private pedidos: PedidoKey[];

  constructor(
    private firestore: AngularFirestore,
    private toastCtrl: ToastController,
    private modalCtrl: ModalController, ) {
  }

  ngOnInit() {
    this.pedidos = new Array<PedidoKey>();
    this.traerPedidosAConfirmar().subscribe(d => {
      this.pedidos = d.sort(this.compararFecha);
    });
  }

  private compararFecha(a: PedidoKey, b: PedidoKey) {
    let auxReturn = 0;
    if (a.fecha > b.fecha) {
      auxReturn = 1;
    } else if (b.fecha < b.fecha) {
      auxReturn = -1;
    }
    return auxReturn;
  }

  private traerPedidosAConfirmar() {
    return this.firestore.collection('pedidos').snapshotChanges()
      .pipe(map((f) => {
        const p: Array<PedidoKey> = f.map((a) => {
          const data = a.payload.doc.data() as PedidoKey;
          data.key = a.payload.doc.id;
          return data;
        });

        return p.filter(pe => {
          return pe.estado === 'creado';
        });
      }));
  }

  private actualizarDoc(db: string, key: string, data: any) {
    return this.firestore.collection(db).doc(key).update(data);
  }

  // tslint:disable-next-line: variable-name
  private async actualizarDetalles(id_pedido: string) {
    const detalles: Array<PedidoDetalleKey> = await this.traerDetalles(id_pedido);
    const data = { estado: 'aceptado' };
    // console.log('Detalles', detalles);

    for (const d of detalles) {
      // console.log(d);
      await this.actualizarDoc('pedidoDetalle', d.key, data).catch(err => {
        console.log('Error en detalles', err);
      });
    }
  }

  public async aceptarPedido(pedido: string) {
    const data = { estado: 'aceptado' };
    await this.actualizarDoc('pedidos', pedido, data).catch(err => {
      console.log('Error en pedido', err);
    });
    await this.actualizarDetalles(pedido);

    this.presentToast('Pedido Aceptado', 'success');
  }

  private removerDoc(db, key) {
    return this.firestore.collection(db).doc(key).delete().catch(err => {
      console.log(err);
    });
  }

  private traerMesa(nroMesa: string): Promise<false | MesaKey> {
    return this.firestore.collection('mesas').ref.where('nromesa', '==', nroMesa).get()
      .then((d: QuerySnapshot<any>) => {
        if (d.empty) {
          return false;
        } else {
          const auxReturn: MesaKey = d.docs[0].data() as MesaKey;
          auxReturn.key = d.docs[0].id;
          return auxReturn;
        }
      });
  }

  // tslint:disable-next-line: variable-name
  private traerDetalles(id_pedido: string) {
    return this.firestore.collection('pedidoDetalle').ref.where('id_pedido', '==', id_pedido).get().then((d: QuerySnapshot<any>) => {
      if (!d.empty) {
        const prodReturn = new Array<PedidoDetalleKey>();
        for (const da of d.docs) {
          const prodA = da.data() as PedidoDetalleKey;
          prodA.key = da.id;
          prodReturn.unshift(prodA);
        }
        return prodReturn;
      } else {
        return new Array<PedidoDetalleKey>();
      }
    });
  }

  // tslint:disable-next-line: variable-name
  private async borrarDetalles(id_pedido: string) {
    const detalles: Array<PedidoDetalleKey> = await this.traerDetalles(id_pedido);

    for (const d of detalles) {
      await this.removerDoc('pedidoDetalle', d.key).catch(err => {
        console.log(err);
      });
    }
  }

  public async rechazarPedido(pedido: string, mesa: string) {
    const mesaAux: MesaKey | false = await this.traerMesa(mesa);
    if (mesaAux !== false) {
      const data = { pedidoActual: '' };
      await this.actualizarDoc('mesas', mesaAux.key, data).catch(err => {
        console.log(err);
      });
    }
    await this.borrarDetalles(pedido);
    await this.removerDoc('pedidos', pedido).catch(err => {
      console.log(err);
    });
    this.presentToast('Pedido Rechazado', 'danger');
  }

  private async presentToast(message: string, color: string) {
    this.toastCtrl.create({
      message,
      color,
      showCloseButton: false,
      position: 'bottom',
      closeButtonText: 'Done',
      duration: 2000
    }).then(toast => {
      toast.present();
    });
  }

  public verPedido(pedido: string) {
    // alert('La página de pedido no está implementada');
    this.modalCtrl.create({
      component: ModalPedidoPage,
      componentProps: {
        pedido
      }
    }).then(modal => {
      modal.present();
    });
  }
}
