import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AngularFirestore, DocumentSnapshot, QuerySnapshot } from '@angular/fire/firestore';
import { PedidoKey } from 'src/app/clases/pedido';
import { PedidoDetalleKey } from 'src/app/clases/pedidoDetalle';
import { map } from 'rxjs/operators';
import { AuthService } from 'src/app/servicios/auth.service';
import { ClienteKey } from 'src/app/clases/cliente';
import { AnonimoKey } from 'src/app/clases/anonimo';

@Component({
  selector: 'app-modal-pedido',
  templateUrl: './modal-pedido.page.html',
  styleUrls: ['./modal-pedido.page.scss'],
})
export class ModalPedidoPage implements OnInit {
  // tslint:disable-next-line: no-input-rename
  @Input('pedido') public pedido: string;
  private pedidoActual: PedidoKey;
  private pedidoDetalle: PedidoDetalleKey[] = new Array<PedidoDetalleKey>();
  private cliente = false;
  private verCuenta = false;

  constructor(
    private firestore: AngularFirestore,
    private modalController: ModalController,
    private authService: AuthService) { }

  async ngOnInit() {
    await this.buscarUsuario();
    this.traerPedido();
    this.traerPedidoDetalle();
  }


  private obtenerUsername() {
    return this.authService.afAuth.auth.currentUser.email;
  }

  private async traerClienteRegistrado(): Promise<null | ClienteKey> {
    return this.firestore.collection('clientes').ref.where('correo', '==', await this.obtenerUsername()).get()
      .then((d: QuerySnapshot<any>) => {
        if (d.empty) {
          return null;
        } else {
          const auxReturn: ClienteKey = d.docs[0].data() as ClienteKey;
          auxReturn.key = d.docs[0].id;
          return auxReturn;
        }
      });
  }

  private async obtenerUid() {
    return this.authService.afAuth.auth.currentUser.uid;
  }

  private async traerClienteAnonimo(): Promise<null | AnonimoKey> {
    return this.firestore.collection('anonimos').doc(await this.obtenerUid()).get().toPromise()
      .then((d: DocumentSnapshot<any>) => {
        if (d.exists) {
          const auxReturn: AnonimoKey = d.data() as AnonimoKey;
          auxReturn.key = d.id;
          return auxReturn;
        } else {
          return null;
        }
      });
  }

  private async buscarUsuario() {
    this.cliente = false;

    // Obtengo el cliente activo en la base de clientes registrados
    const auxCliente: void | ClienteKey = await this.traerClienteRegistrado()
      .catch(err => {
        console.log(err);
      });

    // Si el cliente está registrado, entonces prosigo con la operación
    if (auxCliente !== null) {
      this.cliente = true;
      // console.log('Hay cliente registrado', auxCliente);
    } else {
      // Si el cliente no está registrado, voy a buscar a la base de datos de clientes anonimos.
      const auxClienteAnon: void | AnonimoKey = await this.traerClienteAnonimo()
        .catch(err => {
          console.log(err);
        });

      if (auxClienteAnon !== null) {
        this.cliente = true;
        // console.log('Hay usuario anonimo', auxClienteAnon);
      } else {
        this.cliente = false;
      }
    }
  }

  public traerPedido() {
    this.firestore.collection('pedidos').doc(this.pedido).get().toPromise().then((d: DocumentSnapshot<any>) => {
      if (d.exists) {
        this.pedidoActual = d.data() as PedidoKey;
        this.pedidoActual.key = d.id;
        if (this.pedidoActual.estado === 'cuenta') {
          this.verCuenta = true;
        } else {
          this.verCuenta = false;
        }
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

  private actualizarDoc(db: string, key: string, data: any) {
    return this.firestore.collection(db).doc(key).update(data);
  }

  public async crearCuenta() {
    if (this.pedidoActual.estado !== 'finalizado' && this.pedidoActual.estado !== 'cuenta') {
      await this.actualizarDoc('pedidos', this.pedidoActual.key, { estado: 'cuenta' });
      this.traerPedido();
    }

    this.verCuenta = true;
    // console.log('Ver la cuenta');
  }

  public manejarPrecioPropina(/* total: number, propina: number */) {
    const precioTotal: number = this.pedidoActual.preciototal;
    const agregadoPropina: number = (this.pedidoActual.propina / 100) * precioTotal;
    return precioTotal + agregadoPropina;
  }
}
