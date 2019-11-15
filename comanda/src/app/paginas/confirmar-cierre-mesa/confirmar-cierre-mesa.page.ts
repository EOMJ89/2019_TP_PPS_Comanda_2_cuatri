import { Component, OnInit } from '@angular/core';
import { AngularFirestore, QuerySnapshot } from '@angular/fire/firestore';
import { ToastController } from '@ionic/angular';
import { PedidoKey } from 'src/app/clases/pedido';
import { map } from 'rxjs/operators';
import { MesaKey } from 'src/app/clases/mesa';

@Component({
  selector: 'app-confirmar-cierre-mesa',
  templateUrl: './confirmar-cierre-mesa.page.html',
  styleUrls: ['./confirmar-cierre-mesa.page.scss'],
})
export class ConfirmarCierreMesaPage implements OnInit {
  private pedidos: PedidoKey[] = new Array<PedidoKey>();
  constructor(
    private firestore: AngularFirestore,
    private toastCtrl: ToastController) { }

  ngOnInit() {
    this.traerPedidos().subscribe((p: PedidoKey[]) => {
      this.pedidos = p;
    });
  }

  private traerPedidos() {
    return this.firestore.collection('pedidos').snapshotChanges()
      .pipe(map((f) => {
        const auxR: PedidoKey[] = f.map((a) => {
          const data = a.payload.doc.data() as PedidoKey;
          data.key = a.payload.doc.id;
          return data;
        });

        return auxR.filter(p => {
          return p.estado === 'cuenta';
        });
      }));
  }

  public async cerrarPedido(pedido: PedidoKey) {
    await this.finalizarPedido(pedido);
    this.liberarMesa(pedido);
  }

  private traerMesa(nroMesa: number): Promise<false | MesaKey> {
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

  private actualizarDoc(db: string, key: string, data: any) {
    return this.firestore.collection(db).doc(key).update(data);
  }

  private async liberarMesa(pedido: PedidoKey) {
    const mesaAux: MesaKey | false = await this.traerMesa(pedido.mesa);
    if (mesaAux !== false) {
      const data = { pedidoActual: '', cliente: '', estado: 'libre' };
      await this.actualizarDoc('mesas', mesaAux.key, data)
        .catch(err => {
          console.log(err);
        });
    }
  }

  public async finalizarPedido(pedido: PedidoKey) {
    const data = { estado: 'finalizado' };
    await this.actualizarDoc('pedidos', pedido.key, data).catch(err => {
      console.log(err);
    });
    this.presentToast('Pedido Finalizado', 'success');
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
}
