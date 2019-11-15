import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';
import { PedidoKey } from 'src/app/clases/pedido';

@Component({
  selector: 'app-confirmar-entrega-mozo',
  templateUrl: './confirmar-entrega-mozo.page.html',
  styleUrls: ['./confirmar-entrega-mozo.page.scss'],
})
export class ConfirmarEntregaMozoPage implements OnInit {
  private pedidos: PedidoKey[] = new Array<PedidoKey>();

  constructor(
    private firestore: AngularFirestore,
    private toastCtrl: ToastController) { }

  public async ngOnInit() {
    this.inicializarPedidos();
  }

  public inicializarPedidos() {
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
          return p.estado === 'listoEntrega';
        });
      }));
  }

  public confirmarEntrega(key: string) {
    // console.log('Confirmo la entrega');
    this.actualizarDoc('pedidos', key, { estado: 'entregadoMozo' }).then(() => {
      this.presentToast('Entrega confirmada', 'success');
    });
  }

  private actualizarDoc(db: string, key: string, data: any) {
    return this.firestore.collection(db).doc(key).update(data);
  }

  private async presentToast(message: string, color: string) {
    await this.toastCtrl.create({
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
