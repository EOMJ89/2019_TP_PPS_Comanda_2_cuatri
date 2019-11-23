import { Component, OnInit } from '@angular/core';
import { PedidoKey } from 'src/app/clases/pedido';
import { ProductoKey } from 'src/app/clases/producto';
import { PedidoDetalleKey } from 'src/app/clases/pedidoDetalle';
import { AuthService } from 'src/app/servicios/auth.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-list-pedidos-detalle',
  templateUrl: './list-pedidos-detalle.page.html',
  styleUrls: ['./list-pedidos-detalle.page.scss'],
})
export class ListPedidosDetallePage implements OnInit {
  private pedidos: PedidoKey[];
  private productos: ProductoKey[];
  private pedidoDetalle: PedidoDetalleKey[];

  constructor(
    private authServ: AuthService,
    private firestore: AngularFirestore) { }

  async ngOnInit() {
    await this.authServ.buscarUsuario();
    this.inicializarPedidos();
  }

  public async inicializarPedidos() {
    await this.traerPedidos().subscribe((p: PedidoKey[]) => {
      this.pedidos = p.filter((pe: PedidoKey) => {
        // console.log(pe.estado);
        const auxReturn = (pe.estado !== 'creado' &&
          pe.estado !== 'entregadoMozo' &&
          pe.estado !== 'entregado' &&
          pe.estado !== 'cuenta' &&
          pe.estado !== 'finalizado');

        return auxReturn;
      });

      console.log('Pedidos', this.pedidos);
    });

    await this.traerProductos().subscribe((pr: ProductoKey[]) => {
      this.productos = pr;
      console.log('Productos', this.productos);
    });

    this.traerDetalles().subscribe((pd: PedidoDetalleKey[]) => {
      pd = pd.filter((d: PedidoDetalleKey) => {
        return this.verificarExistencia(d);
      });

      pd = pd.filter((d: PedidoDetalleKey) => {
        return this.verificarVisibilidad(d);
      });
      this.pedidoDetalle = pd;
      console.log('Detalles', this.pedidoDetalle);
    });
  }

  private verificarExistencia(d: PedidoDetalleKey) {
    let auxReturn = false;

    for (const pedido of this.pedidos) {
      auxReturn = d.id_pedido === pedido.key ? true : false;
    }

    return auxReturn;
  }

  private verificarVisibilidad(d: PedidoDetalleKey) {
    let auxReturn = false;

    for (const producto of this.productos) {
      if (d.producto === producto.nombre) {
        auxReturn = (producto.quienPuedever === this.authServ.tipoUser);
      }
    }

    return auxReturn;
  }

  private traerPedidos() {
    return this.firestore.collection('pedidos').snapshotChanges()
      .pipe(map((f) => {
        return f.map((a) => {
          const data = a.payload.doc.data() as PedidoKey;
          data.key = a.payload.doc.id;
          return data;
        });
      }));
  }

  private traerDetalles() {
    return this.firestore.collection('pedidoDetalle').snapshotChanges()
      .pipe(map((f) => {
        return f.map((a) => {
          const data = a.payload.doc.data() as PedidoDetalleKey;
          data.key = a.payload.doc.id;
          return data;
        });
      }));
  }

  public traerProductos() {
    return this.firestore.collection('productos').snapshotChanges()
      .pipe(map((f) => {
        const d: ProductoKey[] = f.map((a) => {
          const data = a.payload.doc.data() as ProductoKey;
          data.key = a.payload.doc.id;
          return data;
        });

        return d.filter((pr: ProductoKey) => {
          console.log('Pr', pr.quienPuedever, 'Yo', this.authServ.tipoUser);
          return pr.quienPuedever === this.authServ.tipoUser;
        });
      }));
  }

  private actualizarDoc(db: string, key: string, data: any) {
    return this.firestore.collection(db).doc(key).update(data);
  }

  public async cambiarEstado(d: PedidoDetalleKey, estado: string) {
    console.log('Pedido', d, 'Estado', estado);
    await this.actualizarDoc('pedidoDetalle', d.key, { estado }).catch(err => {
      console.log(err);
    });

    if (estado === 'listoEntrega') {
      const pedido: PedidoKey = this.pedidos.find(p => {
        return p.key === d.id_pedido;
      });

      if (pedido !== undefined) {
        // console.log(pedido);
        const i = (pedido.cantEnt as number) + 1;
        const data: any = { cantEnt: i };

        if (pedido.cantDet === i) {
          data.estado = estado;
        }

        console.log(data);
        await this.actualizarDoc('pedidos', pedido.key, data).catch(err => {
          console.log('Error en actualizar Pedido', err);
        });
      }

    }

  }
}
