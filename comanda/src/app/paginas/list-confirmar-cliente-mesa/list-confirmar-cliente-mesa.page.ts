import { Component, OnInit } from '@angular/core';
import { ClienteKey } from 'src/app/clases/cliente';
import { AngularFirestore, QuerySnapshot, DocumentSnapshot } from '@angular/fire/firestore';
import { ToastController } from '@ionic/angular';
import { AnonimoKey } from 'src/app/clases/anonimo';
import { AngularFireAuth } from '@angular/fire/auth';
import { ListaEsperaClientesKey, } from 'src/app/clases/lista-espera-clientes';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-list-confirmar-cliente-mesa',
  templateUrl: './list-confirmar-cliente-mesa.page.html',
  styleUrls: ['./list-confirmar-cliente-mesa.page.scss'],
})
export class ListConfirmarClienteMesaPage implements OnInit {
  private esMozo = false; // : boolean
  private clientes = new Array<ListaEsperaClientesKey>();

  constructor(
    private firestore: AngularFirestore,
    private auth: AngularFireAuth,
    private toastCtrl: ToastController
  ) {
  }

  async ngOnInit() {
    const auxUser = await this.traerUsuarioRegistrado();

    // Si el cliente está registrado, entonces prosigo con la operación
    if (auxUser) {
      // console.log('Hay cliente registrado', auxUser);
      this.esMozo = false;
    } else {
      // Si el cliente no está registrado, voy a buscar a la base de datos de clientes anonimos.
      const auxUserAnon = await this.traerUsuarioAnonimo();
      if (auxUserAnon) {
        this.esMozo = false;
        // console.log('Hay usuario anonimo', auxUserAnon);
      } else {
        this.esMozo = true;
      }
    }

    this.traerListaEspera().subscribe((d: ListaEsperaClientesKey[]) => {
      // console.log('Tengo la lista de espera', d);
      this.clientes = d.filter(c => c.estado === 'confirmacionMozo');
      this.clientes = this.clientes.sort(this.sortFecha);
    });
  }

  private sortFecha(a: any, b: any) {
    let auxReturn = 0;
    if (a.fecha > a.fecha) {
      auxReturn = 1;
    } else if (a.fecha < b.fecha) {
      auxReturn = -1;
    }

    return auxReturn;
  }

  private obtenerUsername() {
    return this.auth.auth.currentUser.email;
  }

  private traerUsuarioRegistrado(): Promise<false | ClienteKey> {
    return this.firestore.collection('clientes').ref.where('correo', '==', this.obtenerUsername()).get()
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

  private obtenerUid() {
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

  public traerListaEspera() {
    return this.firestore.collection('listaEsperaClientes').snapshotChanges()
      .pipe(map((f) => {
        return f.map((a) => {
          const data = a.payload.doc.data() as ListaEsperaClientesKey;
          data.key = a.payload.doc.id;
          return data;
        });
      }));
  }

  private obtenerData(c: ListaEsperaClientesKey): any {
    const auxReturn: any = {
      correo: c.correo,
      estado: c.estado,
      fecha: c.fecha,
      perfil: c.perfil,
    };
    return auxReturn;
  }

  private actualizarDoc(db: string, key: string, data: any) {
    return this.firestore.collection(db).doc(key).update(data);
  }

  public confirmarCliente(correo: string) {
    const c: ListaEsperaClientesKey = this.clientes.find(cliente => cliente.correo === correo);
    const key: string = c.key;
    c.estado = 'esperandoMesa';
    const data: any = this.obtenerData(c);
    this.actualizarDoc('listaEsperaClientes', key, data)
      .then(() => {
        this.presentToast('Cliente confirmado.', 'success');
      }).catch((err) => {
        console.log('error en firebase', err);
        this.presentToast('Error al cambiar la base de datos.', 'danger');
      });
  }

  private removerDoc(db, key) {
    return this.firestore.collection(db).doc(key).delete();
  }

  public rechazarCliente(correo: string) {
    const c: ListaEsperaClientesKey = this.clientes.find(cliente => cliente.correo === correo);
    const key: string = c.key;
    this.removerDoc('listaEsperaClientes', key)
      .then(() => {
        this.presentToast('Cliente rechazado.', 'success');
      }).catch((err) => {
        console.log('error en firebase', err);
        this.presentToast('Error al cambiar la base de datos.', 'danger');
      });
  }

  async presentToast(mensaje: string, color: string) {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      color,
      showCloseButton: false,
      position: 'bottom',
      closeButtonText: 'Done',
      duration: 2000
    });
    toast.present();
  }
}
