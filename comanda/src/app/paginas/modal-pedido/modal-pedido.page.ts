import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AngularFirestore, DocumentSnapshot } from '@angular/fire/firestore';
import { PedidoKey } from 'src/app/clases/pedido';
import { PedidoDetalleKey } from 'src/app/clases/pedidoDetalle';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-modal-pedido',
  templateUrl: './modal-pedido.page.html',
  styleUrls: ['./modal-pedido.page.scss'],
})
export class ModalPedidoPage implements OnInit {
  // tslint:disable-next-line: no-input-rename
  @Input('pedido') public pedido: string;
  pedidoActual: PedidoKey;
  pedidoDetalle: PedidoDetalleKey[] = new Array<PedidoDetalleKey>();

  constructor(
    private firestore: AngularFirestore,
    private modalController: ModalController) {
  }

  ngOnInit() {
    this.traerPedido();
    this.traerPedidoDetalle();
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
}
