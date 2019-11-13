import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AngularFirestore, QuerySnapshot, DocumentSnapshot } from '@angular/fire/firestore';
import { PedidoKey } from 'src/app/clases/pedido';
import { PedidoDetalleKey } from 'src/app/clases/pedidoDetalle';

@Component({
  selector: 'app-modal-pedido',
  templateUrl: './modal-pedido.page.html',
  styleUrls: ['./modal-pedido.page.scss'],
})
export class ModalPedidoPage implements OnInit {
  @Input() pedido: string;
  pedidoActual: PedidoKey;
  pedidoDetalle: PedidoDetalleKey[] = [];

  constructor(
    private firestore: AngularFirestore,
    private modalController: ModalController) {
  }

  ngOnInit() {
    if (this.pedido !== undefined) {
      this.traerPedido();
      this.traerPedidoDetalle();
    }
  }

  public traerPedido() {
    this.firestore.collection('pedidos').doc(this.pedido).get().toPromise().then((d: DocumentSnapshot<any>) => {
      if (d.exists) {
        this.pedidoActual = d.data() as PedidoKey;
        this.pedidoActual.key = d.id;
      }
    });
  }

  public traerPedidoDetalle() {
    this.firestore.collection('pedidoDetalle').ref.where('id_pedido', '==', this.pedido).get()
      .then((d: QuerySnapshot<any>) => {
        if (!d.empty) {
          const detallesArr = new Array<PedidoDetalleKey>();
          for (const da of d.docs) {
            const det = da.data() as PedidoDetalleKey;
            det.key = da.id;

            detallesArr.unshift(det);
          }
        }
      });
  }

  public async cerrar() {
    this.modalController.dismiss();
  }
}
